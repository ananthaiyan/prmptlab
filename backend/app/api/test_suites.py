from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.db.models import TestSuite, TestCase
from app.schemas.test_case import TestSuiteCreate, TestSuiteResponse
from app.api.auth import get_current_user, UserContext, verify_project_access
from app.services.entitlements import check_can_create_suite

router = APIRouter(tags=["Test Suites"])


@router.get("/api/projects/{project_id}/test-suites", response_model=list[TestSuiteResponse])
async def list_test_suites(
    project_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_project_access(project_id, user.user_id, db)

    result = await db.execute(
        select(TestSuite).where(TestSuite.project_id == project_id).order_by(TestSuite.created_at.desc())
    )
    suites = result.scalars().all()

    responses = []
    for s in suites:
        count = (await db.execute(
            select(func.count()).where(TestCase.suite_id == s.id)
        )).scalar() or 0
        responses.append(TestSuiteResponse(
            id=s.id,
            project_id=s.project_id,
            name=s.name,
            description=s.description,
            created_at=s.created_at,
            test_count=count,
        ))
    return responses


@router.post("/api/projects/{project_id}/test-suites", response_model=TestSuiteResponse, status_code=201)
async def create_test_suite(
    project_id: str,
    body: TestSuiteCreate,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_project_access(project_id, user.user_id, db)
    await check_can_create_suite(user.user_id, project_id, db)

    suite = TestSuite(project_id=project_id, name=body.name, description=body.description)
    db.add(suite)
    await db.commit()
    await db.refresh(suite)
    return TestSuiteResponse(
        id=suite.id,
        project_id=suite.project_id,
        name=suite.name,
        description=suite.description,
        created_at=suite.created_at,
        test_count=0,
    )


@router.get("/api/test-suites/{suite_id}", response_model=TestSuiteResponse)
async def get_test_suite(
    suite_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    suite = await db.get(TestSuite, suite_id)
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found")

    await verify_project_access(suite.project_id, user.user_id, db)

    count = (await db.execute(
        select(func.count()).where(TestCase.suite_id == suite.id)
    )).scalar() or 0
    return TestSuiteResponse(
        id=suite.id,
        project_id=suite.project_id,
        name=suite.name,
        description=suite.description,
        created_at=suite.created_at,
        test_count=count,
    )


@router.delete("/api/test-suites/{suite_id}", status_code=204)
async def delete_test_suite(
    suite_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    suite = await db.get(TestSuite, suite_id)
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found")

    await verify_project_access(suite.project_id, user.user_id, db)

    await db.delete(suite)
    await db.commit()
