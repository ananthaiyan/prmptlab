from datetime import datetime

from pydantic import BaseModel


class EvaluationResultResponse(BaseModel):
    id: str
    run_id: str
    test_case_id: str
    model_output: str
    passed: bool
    score: float
    latency_ms: float
    input_tokens: int
    output_tokens: int
    total_tokens: int
    judge_score: float
    judge_reasoning: str
    failure_category: str
    deterministic_score: float
    created_at: datetime

    # Joined fields
    test_name: str | None = None
    test_input: str | None = None
    expected_behavior: str | None = None
    severity: str | None = None

    model_config = {"from_attributes": True}
