from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import UserContext, get_current_user, verify_project_access
from app.db.database import get_db
from app.db.models import TestCase, TestSuite
from app.schemas.test_case import TestCaseCreate, TestCaseResponse, TestCaseUpdate
from app.services.entitlements import check_can_create_test_cases

router = APIRouter(tags=["Test Cases"])


async def get_suite_and_verify_access(suite_id: str, user_id: str, db: AsyncSession) -> TestSuite:
    suite = await db.get(TestSuite, suite_id)
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found")
    await verify_project_access(suite.project_id, user_id, db)
    return suite


@router.get("/api/test-suites/{suite_id}/test-cases", response_model=list[TestCaseResponse])
async def list_test_cases(
    suite_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await get_suite_and_verify_access(suite_id, user.user_id, db)
    result = await db.execute(
        select(TestCase).where(TestCase.suite_id == suite_id).order_by(TestCase.created_at)
    )
    return [TestCaseResponse.model_validate(tc) for tc in result.scalars().all()]


@router.post("/api/test-suites/{suite_id}/test-cases", response_model=TestCaseResponse, status_code=201)
async def create_test_case(
    suite_id: str,
    body: TestCaseCreate,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await get_suite_and_verify_access(suite_id, user.user_id, db)
    await check_can_create_test_cases(user.user_id, suite_id, 1, db)

    tc = TestCase(
        suite_id=suite_id,
        name=body.name,
        input=body.input,
        expected_behavior=body.expected_behavior,
        expected_intent=body.expected_intent,
        must_contain=body.must_contain,
        must_not_contain=body.must_not_contain,
        severity=body.severity,
    )
    db.add(tc)
    await db.commit()
    await db.refresh(tc)
    return TestCaseResponse.model_validate(tc)


@router.post("/api/test-suites/{suite_id}/test-cases/bulk", response_model=list[TestCaseResponse], status_code=201)
async def bulk_create_test_cases(
    suite_id: str,
    body: list[TestCaseCreate],
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await get_suite_and_verify_access(suite_id, user.user_id, db)
    await check_can_create_test_cases(user.user_id, suite_id, len(body), db)

    results = []
    for item in body:
        tc = TestCase(
            suite_id=suite_id,
            name=item.name,
            input=item.input,
            expected_behavior=item.expected_behavior,
            expected_intent=item.expected_intent,
            must_contain=item.must_contain,
            must_not_contain=item.must_not_contain,
            severity=item.severity,
        )
        db.add(tc)
        await db.flush()
        results.append(tc)
    await db.commit()
    for tc in results:
        await db.refresh(tc)
    return [TestCaseResponse.model_validate(tc) for tc in results]


@router.put("/api/test-cases/{test_case_id}", response_model=TestCaseResponse)
async def update_test_case(
    test_case_id: str,
    body: TestCaseUpdate,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tc = await db.get(TestCase, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")

    await get_suite_and_verify_access(tc.suite_id, user.user_id, db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tc, field, value)

    await db.commit()
    await db.refresh(tc)
    return TestCaseResponse.model_validate(tc)


@router.delete("/api/test-cases/{test_case_id}", status_code=204)
async def delete_test_case(
    test_case_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tc = await db.get(TestCase, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")

    await get_suite_and_verify_access(tc.suite_id, user.user_id, db)

    await db.delete(tc)
    await db.commit()
