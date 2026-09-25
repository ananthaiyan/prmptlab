"""
Evaluation engine — the core of PromptBench.

Orchestrates: model execution → deterministic checks → LLM judge → scoring.
Designed to run sequentially in V1 but structured for async workers later.
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import (
    Prompt, TestSuite, TestCase, EvaluationRun, EvaluationResult,
)
from app.services.model_provider import ModelProvider
from app.services.judge import JudgeService
from app.config import get_settings

logger = logging.getLogger(__name__)


class DeterministicEvaluator:
    """Run deterministic keyword / forbidden-content checks."""

    @staticmethod
    def evaluate(output: str, test_case: TestCase) -> dict:
        output_lower = output.lower()

        # Must-contain check
        keyword_pass = True
        missing_keywords = []
        for kw in (test_case.must_contain or []):
            if kw.lower() not in output_lower:
                keyword_pass = False
                missing_keywords.append(kw)

        # Must-not-contain check
        forbidden_pass = True
        found_forbidden = []
        for kw in (test_case.must_not_contain or []):
            if kw.lower() in output_lower:
                forbidden_pass = False
                found_forbidden.append(kw)

        all_pass = keyword_pass and forbidden_pass

        # Score: 100 if all pass, partial credit otherwise
        checks_total = len(test_case.must_contain or []) + len(test_case.must_not_contain or [])
        if checks_total == 0:
            score = 100.0
        else:
            checks_passed = (
                len(test_case.must_contain or []) - len(missing_keywords)
                + len(test_case.must_not_contain or []) - len(found_forbidden)
            )
            score = (checks_passed / checks_total) * 100

        return {
            "keyword_pass": keyword_pass,
            "forbidden_content_pass": forbidden_pass,
            "all_pass": all_pass,
            "score": round(score, 2),
            "missing_keywords": missing_keywords,
            "found_forbidden": found_forbidden,
        }


class EvaluationEngine:
    def __init__(self, provider: ModelProvider, judge: JudgeService):
        self._provider = provider
        self._judge = judge
        self._settings = get_settings()

    async def run_evaluation(
        self,
        db: AsyncSession,
        prompt_id: str,
        suite_id: str,
        model: str,
    ) -> EvaluationRun:
        # Load prompt
        prompt = await db.get(Prompt, prompt_id)
        if not prompt:
            raise ValueError(f"Prompt {prompt_id} not found")

        # Load suite + cases
        suite = await db.get(TestSuite, suite_id)
        if not suite:
            raise ValueError(f"Test suite {suite_id} not found")

        cases_result = await db.execute(
            select(TestCase).where(TestCase.suite_id == suite_id)
        )
        test_cases = list(cases_result.scalars().all())

        if not test_cases:
            raise ValueError(f"Test suite {suite_id} has no test cases")

        # Create run record
        run = EvaluationRun(
            project_id=prompt.project_id,
            prompt_id=prompt_id,
            suite_id=suite_id,
            model=model,
            status="running",
            total_tests=len(test_cases),
            started_at=datetime.now(timezone.utc),
        )
        db.add(run)
        await db.flush()

        passed = 0
        failed = 0
        total_score = 0.0
        results = []

        for tc in test_cases:
            result = await self._evaluate_single(
                db=db,
                run_id=run.id,
                prompt=prompt,
                test_case=tc,
                model=model,
            )
            results.append(result)
            if result.passed:
                passed += 1
            else:
                failed += 1
            total_score += result.score

        # Update run aggregate
        run.passed_tests = passed
        run.failed_tests = failed
        run.overall_score = round(total_score / len(test_cases), 2) if test_cases else 0
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(run)
        return run

    async def _evaluate_single(
        self,
        db: AsyncSession,
        run_id: str,
        prompt: Prompt,
        test_case: TestCase,
        model: str,
    ) -> EvaluationResult:
        # 1. Call model
        try:
            model_response = await self._provider.generate(
                system_prompt=prompt.content,
                user_input=test_case.input,
                model=model,
            )
            model_output = model_response.content
            latency_ms = model_response.latency_ms
            input_tokens = model_response.input_tokens
            output_tokens = model_response.output_tokens
            total_tokens = model_response.total_tokens
        except Exception as e:
            logger.error("Model call failed for test %s: %s", test_case.id, e)
            model_output = f"[ERROR] Model call failed: {e}"
            latency_ms = 0
            input_tokens = 0
            output_tokens = 0
            total_tokens = 0

        # 2. Deterministic evaluation
        det_result = DeterministicEvaluator.evaluate(model_output, test_case)
        det_score = det_result["score"]

        # 3. LLM judge evaluation
        judge_result = await self._judge.evaluate(
            system_prompt=prompt.content,
            user_input=test_case.input,
            expected_behavior=test_case.expected_behavior,
            model_output=model_output,
        )

        # 4. Combined score
        w_det = self._settings.deterministic_weight
        w_judge = self._settings.judge_weight
        combined_score = round(det_score * w_det + judge_result.score * w_judge, 2)

        # 5. Pass/fail
        passed = combined_score >= self._settings.pass_threshold

        # Determine failure category
        failure_category = "none" if passed else judge_result.failure_category

        result = EvaluationResult(
            run_id=run_id,
            test_case_id=test_case.id,
            model_output=model_output,
            passed=passed,
            score=combined_score,
            latency_ms=latency_ms,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            judge_score=judge_result.score,
            judge_reasoning=judge_result.reasoning,
            failure_category=failure_category,
            deterministic_score=det_score,
        )
        db.add(result)
        await db.flush()
        return result
