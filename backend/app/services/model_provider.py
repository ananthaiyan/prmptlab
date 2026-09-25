"""
Abstract model provider interface.

V1 only implements GroqProvider, but the abstraction allows
OpenAI/Anthropic/etc. to be added without rewriting the evaluation engine.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ModelResponse:
    """Standardised response from any model provider."""
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    latency_ms: float
    raw: dict | None = None


class ModelProvider(ABC):
    """Base class every provider must implement."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_input: str,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 2048,
    ) -> ModelResponse:
        ...

    @abstractmethod
    async def list_models(self) -> list[str]:
        ...
