from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.db.models import Prompt, EvaluationRun
from app.schemas.prompt import PromptCreate, PromptResponse
from app.api.auth import get_current_user, UserContext, verify_project_access
from app.services.entitlements import check_can_create_prompt

router = APIRouter(tags=["Prompts"])


@router.get("/api/projects/{project_id}/prompts", response_model=list[PromptResponse])
async def list_prompts(
    project_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_project_access(project_id, user.user_id, db)

    result = await db.execute(
        select(Prompt)
        .where(Prompt.project_id == project_id)
        .order_by(Prompt.name, Prompt.version.desc())
    )
    prompts = result.scalars().all()

    responses = []
    for p in prompts:
        latest_run = (await db.execute(
            select(EvaluationRun)
            .where(EvaluationRun.prompt_id == p.id, EvaluationRun.status == "completed")
            .order_by(EvaluationRun.completed_at.desc())
            .limit(1)
        )).scalar()

        responses.append(PromptResponse(
            id=p.id,
            project_id=p.project_id,
            name=p.name,
            version=p.version,
            content=p.content,
            created_at=p.created_at,
            latest_score=latest_run.overall_score if latest_run else None,
        ))

    return responses


@router.post("/api/projects/{project_id}/prompts", response_model=PromptResponse, status_code=201)
async def create_prompt(
    project_id: str,
    body: PromptCreate,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_project_access(project_id, user.user_id, db)
    await check_can_create_prompt(user.user_id, project_id, db)

    result = await db.execute(
        select(func.max(Prompt.version))
        .where(Prompt.project_id == project_id, Prompt.name == body.name)
    )
    max_version = result.scalar() or 0
    new_version = max_version + 1

    prompt = Prompt(
        project_id=project_id,
        name=body.name,
        version=new_version,
        content=body.content,
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)

    return PromptResponse(
        id=prompt.id,
        project_id=prompt.project_id,
        name=prompt.name,
        version=prompt.version,
        content=prompt.content,
        created_at=prompt.created_at,
    )


@router.get("/api/prompts/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    prompt = await db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    await verify_project_access(prompt.project_id, user.user_id, db)

    latest_run = (await db.execute(
        select(EvaluationRun)
        .where(EvaluationRun.prompt_id == prompt.id, EvaluationRun.status == "completed")
        .order_by(EvaluationRun.completed_at.desc())
        .limit(1)
    )).scalar()

    return PromptResponse(
        id=prompt.id,
        project_id=prompt.project_id,
        name=prompt.name,
        version=prompt.version,
        content=prompt.content,
        created_at=prompt.created_at,
        latest_score=latest_run.overall_score if latest_run else None,
    )
