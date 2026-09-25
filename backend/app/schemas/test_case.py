from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TestSuiteCreate(BaseModel):
    __test__ = False
    name: str = Field(..., min_length=1, max_length=255)
    description: str = ""


class TestSuiteResponse(BaseModel):
    __test__ = False
    id: str
    project_id: str
    name: str
    description: str
    created_at: datetime
    test_count: int = 0

    model_config = {"from_attributes": True}


class TestCaseCreate(BaseModel):
    __test__ = False
    name: str = Field(..., min_length=1, max_length=255)
    input: str = Field(..., min_length=1)
    expected_behavior: str = ""
    expected_intent: str = ""
    must_contain: list[str] = []
    must_not_contain: list[str] = []
    severity: Literal["low", "medium", "high", "critical"] = "medium"


class TestCaseUpdate(BaseModel):
    __test__ = False
    name: str | None = None
    input: str | None = None
    expected_behavior: str | None = None
    expected_intent: str | None = None
    must_contain: list[str] | None = None
    must_not_contain: list[str] | None = None
    severity: Literal["low", "medium", "high", "critical"] | None = None


class TestCaseResponse(BaseModel):
    __test__ = False
    id: str
    suite_id: str
    name: str
    input: str
    expected_behavior: str
    expected_intent: str
    must_contain: list[str]
    must_not_contain: list[str]
    severity: str
    created_at: datetime

    model_config = {"from_attributes": True}
