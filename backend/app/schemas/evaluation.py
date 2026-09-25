from pydantic import BaseModel
from datetime import datetime


class EvaluationRequest(BaseModel):
    prompt_id: str
    suite_id: str
    model: str = "llama-3.3-70b-versatile"


class EvaluationRunResponse(BaseModel):
    id: str
    project_id: str
    prompt_id: str
    suite_id: str | None
    model: str
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    overall_score: float
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    prompt_name: str | None = None
    prompt_version: int | None = None
    suite_name: str | None = None

    model_config = {"from_attributes": True}
