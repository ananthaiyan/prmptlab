"""
Groq provider — V1's only LLM integration.

Uses the official Groq Python SDK with async support.
All timing is done with perf_counter for high-resolution latency measurement.
"""

import logging
import time
from typing import Any

from groq import APIError, APITimeoutError, AsyncGroq, RateLimitError

from app.config import get_settings
from app.services.model_provider import ModelProvider, ModelResponse

logger = logging.getLogger(__name__)


class GroqProvider(ModelProvider):
    def __init__(self, api_key: str | None = None):
        key = api_key or get_settings().groq_api_key
        if not key:
            raise ValueError(
                "GROQ_API_KEY is not set. "
                "Set it in your .env file or pass it to GroqProvider."
            )
        self._client = AsyncGroq(api_key=key)

    async def generate(
        self,
        system_prompt: str,
        user_input: str,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 2048,
    ) -> ModelResponse:
        messages: Any = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ]

        start = time.perf_counter()
        try:
            response = await self._client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except RateLimitError as e:
            logger.warning("Groq rate limit hit: %s", e)
            raise RuntimeError(f"Rate limit exceeded. Please try again later. Detail: {e}") from e
        except APITimeoutError as e:
            logger.warning("Groq timeout: %s", e)
            raise RuntimeError(f"Groq API timed out. Detail: {e}") from e
        except APIError as e:
            logger.error("Groq API error: %s", e)
            raise RuntimeError(f"Groq API error: {e}") from e
        except Exception as e:
            logger.error("Unexpected error calling Groq: %s", e)
            raise RuntimeError(f"Failed to call Groq: {e}") from e

        latency_ms = (time.perf_counter() - start) * 1000

        choice = response.choices[0] if response.choices else None
        content = choice.message.content if choice else ""
        usage = response.usage

        return ModelResponse(
            content=content or "",
            model=response.model or model,
            input_tokens=usage.prompt_tokens if usage else 0,
            output_tokens=usage.completion_tokens if usage else 0,
            total_tokens=usage.total_tokens if usage else 0,
            latency_ms=round(latency_ms, 2),
        )

    async def list_models(self) -> list[str]:
        try:
            result = await self._client.models.list()
            return sorted([m.id for m in result.data])
        except Exception as e:
            logger.error("Failed to list Groq models: %s", e)
            return []
