import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.database import get_db
from app.db.models import Prompt
from app.services.groq_provider import GroqProvider
from app.services.redteam import RedTeamService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/redteam", tags=["Red Team"])


class RedTeamRequest(BaseModel):
    prompt_id: str | None = None
    prompt_content: str | None = None
    count: int = 10


@router.post("/generate")
async def generate_red_team(body: RedTeamRequest, db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(status_code=400, detail="GROQ_API_KEY is not configured.")

    if body.prompt_content:
        content = body.prompt_content
    elif body.prompt_id:
        prompt = await db.get(Prompt, body.prompt_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        content = prompt.content
    else:
        raise HTTPException(status_code=400, detail="Must provide prompt_id or prompt_content")

    try:
        provider = GroqProvider(api_key=settings.groq_api_key)
        service = RedTeamService(provider=provider, model=settings.default_model)
        tests = await service.generate(system_prompt=content, count=body.count)
        return {"tests": tests}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error("Red team generation failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Red team generation failed: {e}")
