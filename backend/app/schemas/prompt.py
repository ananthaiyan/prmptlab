from datetime import datetime

from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)


class PromptResponse(BaseModel):
    id: str
    project_id: str
    name: str
    version: int
    content: str
    created_at: datetime
    latest_score: float | None = None

    model_config = {"from_attributes": True}
