from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./promptbench.db"
    groq_api_key: str = ""
    default_model: str = "qwen/qwen3.8-27b"
    judge_model: str = "qwen/qwen3.8-27b"
    pass_threshold: float = 70.0
    deterministic_weight: float = 0.4
    judge_weight: float = 0.6
    dodo_payments_api_key: str = ""
    dodo_payments_webhook_secret: str = ""
    dodo_plus_product_id: str = "pdt_0NoNWjXG3YzINx4f3LH54"
    dodo_pro_product_id: str = "pdt_0NoNWrDehmngq7hqySbyI"
    clerk_secret_key: str = ""
    next_public_clerk_publishable_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
