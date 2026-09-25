import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import EvaluationRun, EvaluationResult, TestCase, Prompt, Project
from app.schemas.evaluation import EvaluationRequest, EvaluationRunResponse
from app.schemas.result import EvaluationResultResponse
from app.services.groq_provider import GroqProvider
from app.services.judge import JudgeService
from app.services.evaluation_engine import EvaluationEngine
from app.config import get_settings
from app.api.auth import get_current_user, UserContext, verify_project_access

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/evaluations", tags=["Evaluations"])


@router.post("/run", response_model=EvaluationRunResponse, status_code=201)
async def run_evaluation(
    body: EvaluationRequest,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    prompt = await db.get(Prompt, body.prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    await verify_project_access(prompt.project_id, user.user_id, db)

    settings = get_settings()

    if not settings.groq_api_key:
        raise HTTPException(
            status_code=400,
            detail="GROQ_API_KEY is not configured. Set it in your .env file.",
        )

    try:
        provider = GroqProvider(api_key=settings.groq_api_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    judge = JudgeService(provider=provider, model=settings.judge_model)
    engine = EvaluationEngine(provider=provider, judge=judge)

    try:
        run = await engine.run_evaluation(
            db=db,
            prompt_id=body.prompt_id,
            suite_id=body.suite_id,
            model=body.model,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error("Evaluation failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")

    return EvaluationRunResponse(
        id=run.id,
        project_id=run.project_id,
        prompt_id=run.prompt_id,
        suite_id=run.suite_id,
        model=run.model,
        status=run.status,
        total_tests=run.total_tests,
        passed_tests=run.passed_tests,
        failed_tests=run.failed_tests,
        overall_score=run.overall_score,
        started_at=run.started_at,
        completed_at=run.completed_at,
        created_at=run.created_at,
        prompt_name=prompt.name,
        prompt_version=prompt.version,
    )


@router.get("", response_model=list[EvaluationRunResponse])
async def list_evaluations(
    project_id: str | None = None,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(EvaluationRun).join(Project, EvaluationRun.project_id == Project.id).order_by(EvaluationRun.created_at.desc())
    
    if project_id:
        await verify_project_access(project_id, user.user_id, db)
        query = query.where(EvaluationRun.project_id == project_id)
    else:
        query = query.where((Project.user_id == user.user_id) | (Project.user_id == "default_user"))

    result = await db.execute(query)
    runs = result.scalars().all()

    responses = []
    for run in runs:
        prompt = await db.get(Prompt, run.prompt_id)
        responses.append(EvaluationRunResponse(
            id=run.id,
            project_id=run.project_id,
            prompt_id=run.prompt_id,
            suite_id=run.suite_id,
            model=run.model,
            status=run.status,
            total_tests=run.total_tests,
            passed_tests=run.passed_tests,
            failed_tests=run.failed_tests,
            overall_score=run.overall_score,
            started_at=run.started_at,
            completed_at=run.completed_at,
            created_at=run.created_at,
            prompt_name=prompt.name if prompt else None,
            prompt_version=prompt.version if prompt else None,
        ))

    return responses


@router.get("/{run_id}", response_model=EvaluationRunResponse)
async def get_evaluation(
    run_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    run = await db.get(EvaluationRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found")

    await verify_project_access(run.project_id, user.user_id, db)

    prompt = await db.get(Prompt, run.prompt_id)

    return EvaluationRunResponse(
        id=run.id,
        project_id=run.project_id,
        prompt_id=run.prompt_id,
        suite_id=run.suite_id,
        model=run.model,
        status=run.status,
        total_tests=run.total_tests,
        passed_tests=run.passed_tests,
        failed_tests=run.failed_tests,
        overall_score=run.overall_score,
        started_at=run.started_at,
        completed_at=run.completed_at,
        created_at=run.created_at,
        prompt_name=prompt.name if prompt else None,
        prompt_version=prompt.version if prompt else None,
    )


@router.get("/{run_id}/results", response_model=list[EvaluationResultResponse])
async def get_evaluation_results(
    run_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    run = await db.get(EvaluationRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found")

    await verify_project_access(run.project_id, user.user_id, db)

    result = await db.execute(
        select(EvaluationResult)
        .where(EvaluationResult.run_id == run_id)
        .order_by(EvaluationResult.score.asc())
    )
    results = result.scalars().all()

    responses = []
    for r in results:
        tc = await db.get(TestCase, r.test_case_id)
        responses.append(EvaluationResultResponse(
            id=r.id,
            run_id=r.run_id,
            test_case_id=r.test_case_id,
            model_output=r.model_output,
            passed=r.passed,
            score=r.score,
            latency_ms=r.latency_ms,
            input_tokens=r.input_tokens,
            output_tokens=r.output_tokens,
            total_tokens=r.total_tokens,
            judge_score=r.judge_score,
            judge_reasoning=r.judge_reasoning,
            failure_category=r.failure_category,
            deterministic_score=r.deterministic_score,
            created_at=r.created_at,
            test_name=tc.name if tc else None,
            test_input=tc.input if tc else None,
            expected_behavior=tc.expected_behavior if tc else None,
            severity=tc.severity if tc else None,
        ))

    return responses
