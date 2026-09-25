import logging

import jwt
from fastapi import Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Project

logger = logging.getLogger(__name__)


class UserContext:
    def __init__(self, user_id: str, role: str = "OWNER"):
        self.user_id = user_id
        self.role = role


async def get_current_user(
    authorization: str | None = Header(None),
    x_user_id: str | None = Header(None)
) -> UserContext:
    # 1. Direct header
    if x_user_id:
        return UserContext(user_id=x_user_id)

    # 2. Authorization header
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        if token.startswith("user_"):
            return UserContext(user_id=token)
        
        try:
            # Decode unverified or verified JWT payload from Clerk
            unverified = jwt.decode(token, options={"verify_signature": False})
            sub = unverified.get("sub")
            if sub:
                return UserContext(user_id=sub)
        except Exception as e:
            logger.debug("Failed to decode auth token: %s", e)

    # 3. Fallback for default dev user
    return UserContext(user_id="default_user")


async def verify_project_access(project_id: str, user_id: str, db: AsyncSession) -> Project:
    stmt = select(Project).where(Project.id == project_id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != user_id and project.user_id != "default_user":
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this project")

    return project
