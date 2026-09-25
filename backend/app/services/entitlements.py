import logging
from typing import Any
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models import Project, Prompt, TestSuite, TestCase, EvaluationRun, Subscription

logger = logging.getLogger(__name__)

PLAN_LIMITS: dict[str, dict[str, Any]] = {
    "FREE": {
        "projects": 3,
        "suites_per_project": 1,
        "prompts_per_project": 2,
        "tests_per_suite": 10,
        "evaluations_per_month": 500,
        "red_team": "basic",
        "prompt_comparison": False,
        "shareable_reports": False,
        "api_access": False,
        "cli": False,
    },
    "PLUS": {
        "projects": 10,
        "suites_per_project": 5,
        "prompts_per_project": 10,
        "tests_per_suite": 100,
        "evaluations_per_month": 10000,
        "red_team": True,
        "prompt_comparison": True,
        "shareable_reports": True,
        "api_access": True,
        "cli": False,
    },
    "PRO": {
        "projects": 50,
        "suites_per_project": 20,
        "prompts_per_project": 50,
        "tests_per_suite": 500,
        "evaluations_per_month": 50000,
        "red_team": "advanced",
        "prompt_comparison": True,
        "shareable_reports": True,
        "api_access": True,
        "cli": True,
        "team_workspaces": True,
    },
    "ENTERPRISE": {
        "projects": 999999,
        "suites_per_project": 999999,
        "prompts_per_project": 999999,
        "tests_per_suite": 999999,
        "evaluations_per_month": 999999,
        "red_team": "advanced",
        "prompt_comparison": True,
        "shareable_reports": True,
        "api_access": True,
        "cli": True,
        "team_workspaces": True,
    },
}

NEXT_PLAN = {
    "FREE": "PLUS",
    "PLUS": "PRO",
    "PRO": "ENTERPRISE",
    "ENTERPRISE": "ENTERPRISE",
}


async def get_user_plan(user_id: str, db: AsyncSession) -> str:
    stmt = select(Subscription).where(Subscription.user_id == user_id, Subscription.status == "active")
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if sub and sub.plan in PLAN_LIMITS:
        return sub.plan
    return "FREE"


async def get_user_usage(user_id: str, db: AsyncSession) -> dict:
    plan = await get_user_plan(user_id, db)
    limits = PLAN_LIMITS[plan]

    # Count projects
    proj_stmt = select(func.count(Project.id)).where(Project.user_id == user_id)
    proj_res = await db.execute(proj_stmt)
    projects_count = proj_res.scalar() or 0

    # Count evaluations this month
    now = datetime.now(timezone.utc)
    first_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    
    # User's projects
    user_proj_stmt = select(Project.id).where(Project.user_id == user_id)
    eval_stmt = select(func.count(EvaluationRun.id)).where(
        EvaluationRun.project_id.in_(user_proj_stmt),
        EvaluationRun.created_at >= first_of_month
    )
    eval_res = await db.execute(eval_stmt)
    evals_this_month = eval_res.scalar() or 0

    return {
        "plan": plan,
        "limits": limits,
        "usage": {
            "projects": projects_count,
            "evaluations_this_month": evals_this_month
        }
    }


def raise_limit_reached(resource: str, current: int, limit: int, current_plan: str):
    required_plan = NEXT_PLAN.get(current_plan, "PLUS")
    raise HTTPException(
        status_code=403,
        detail={
            "error": "PLAN_LIMIT_REACHED",
            "resource": resource,
            "current": current,
            "limit": limit,
            "required_plan": required_plan,
            "message": f"You have reached your {current_plan} plan limit of {limit} {resource}. Upgrade to {required_plan} to create more."
        }
    )


async def check_can_create_project(user_id: str, db: AsyncSession):
    plan = await get_user_plan(user_id, db)
    limit = PLAN_LIMITS[plan]["projects"]

    stmt = select(func.count(Project.id)).where(Project.user_id == user_id)
    res = await db.execute(stmt)
    current = res.scalar() or 0

    if current >= limit:
        raise_limit_reached("projects", current, limit, plan)


async def check_can_create_prompt(user_id: str, project_id: str, db: AsyncSession):
    plan = await get_user_plan(user_id, db)
    limit = PLAN_LIMITS[plan]["prompts_per_project"]

    stmt = select(func.count(Prompt.id)).where(Prompt.project_id == project_id)
    res = await db.execute(stmt)
    current = res.scalar() or 0

    if current >= limit:
        raise_limit_reached("prompts", current, limit, plan)


async def check_can_create_suite(user_id: str, project_id: str, db: AsyncSession):
    plan = await get_user_plan(user_id, db)
    limit = PLAN_LIMITS[plan]["suites_per_project"]

    stmt = select(func.count(TestSuite.id)).where(TestSuite.project_id == project_id)
    res = await db.execute(stmt)
    current = res.scalar() or 0

    if current >= limit:
        raise_limit_reached("test suites", current, limit, plan)


async def check_can_create_test_cases(user_id: str, suite_id: str, count_to_add: int, db: AsyncSession):
    plan = await get_user_plan(user_id, db)
    limit = PLAN_LIMITS[plan]["tests_per_suite"]

    stmt = select(func.count(TestCase.id)).where(TestCase.suite_id == suite_id)
    res = await db.execute(stmt)
    current = res.scalar() or 0

    if current + count_to_add > limit:
        raise_limit_reached("test cases", current, limit, plan)
