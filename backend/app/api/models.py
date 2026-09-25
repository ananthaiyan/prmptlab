import logging

from fastapi import APIRouter

from app.config import get_settings
from app.services.groq_provider import GroqProvider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("")
async def list_models():
    settings = get_settings()
    if not settings.groq_api_key:
        return {"models": [], "default": settings.default_model, "error": "GROQ_API_KEY not set"}

    try:
        provider = GroqProvider(api_key=settings.groq_api_key)
        all_models = await provider.list_models()
        # Filter out non-chat models (whisper, prompt-guard)
        chat_models = [m for m in all_models if not any(x in m for x in ["whisper", "prompt-guard"])]
        if not chat_models:
            chat_models = [settings.default_model]
        return {"models": chat_models, "default": settings.default_model}
    except Exception as e:
        logger.error("Failed to list models: %s", e)
        return {"models": [], "default": settings.default_model, "error": str(e)}
