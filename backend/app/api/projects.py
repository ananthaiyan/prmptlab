from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.db.database import get_db
from app.db.models import Project, Prompt, TestSuite, TestCase, EvaluationRun
from app.schemas.project import ProjectCreate, ProjectResponse
from app.api.auth import get_current_user, UserContext, verify_project_access
from app.services.entitlements import check_can_create_project

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Project).where(
        or_(Project.user_id == user.user_id, Project.user_id == "default_user")
    ).order_by(Project.updated_at.desc())
    
    result = await db.execute(stmt)
    projects = result.scalars().all()

    responses = []
    for p in projects:
        prompt_count = (await db.execute(
            select(func.count()).where(Prompt.project_id == p.id)
        )).scalar() or 0

        suite_count = (await db.execute(
            select(func.count()).where(TestSuite.project_id == p.id)
        )).scalar() or 0

        test_count = (await db.execute(
            select(func.count()).select_from(TestCase).join(TestSuite).where(
                TestSuite.project_id == p.id
            )
        )).scalar() or 0

        latest_run = (await db.execute(
            select(EvaluationRun)
            .where(EvaluationRun.project_id == p.id, EvaluationRun.status == "completed")
            .order_by(EvaluationRun.completed_at.desc())
            .limit(1)
        )).scalar()

        responses.append(ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            created_at=p.created_at,
            updated_at=p.updated_at,
            prompt_count=prompt_count,
            suite_count=suite_count,
            test_count=test_count,
            latest_score=latest_run.overall_score if latest_run else None,
        ))

    return responses


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce Plan Limit
    await check_can_create_project(user.user_id, db)

    project = Project(user_id=user.user_id, name=body.name, description=body.description)
    db.add(project)
    await db.commit()
    await db.refresh(project)

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        prompt_count=0,
        suite_count=0,
        test_count=0,
        latest_score=None
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await verify_project_access(project_id, user.user_id, db)

    prompt_count = (await db.execute(
        select(func.count()).where(Prompt.project_id == project.id)
    )).scalar() or 0

    suite_count = (await db.execute(
        select(func.count()).where(TestSuite.project_id == project.id)
    )).scalar() or 0

    test_count = (await db.execute(
        select(func.count()).select_from(TestCase).join(TestSuite).where(
            TestSuite.project_id == project.id
        )
    )).scalar() or 0

    latest_run = (await db.execute(
        select(EvaluationRun)
        .where(EvaluationRun.project_id == project.id, EvaluationRun.status == "completed")
        .order_by(EvaluationRun.completed_at.desc())
        .limit(1)
    )).scalar()

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
        prompt_count=prompt_count,
        suite_count=suite_count,
        test_count=test_count,
        latest_score=latest_run.overall_score if latest_run else None,
    )


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await verify_project_access(project_id, user.user_id, db)
    await db.delete(project)
    await db.commit()
