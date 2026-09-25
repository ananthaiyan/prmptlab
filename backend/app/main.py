"""
prmptlab — LLM System-Prompt Evaluation Platform

Main FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    billing,
    evaluations,
    models,
    projects,
    prompts,
    redteam,
    test_cases,
    test_suites,
)
from app.db.database import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    await init_db()
    logging.info("Database tables created/verified")
    yield
    # Shutdown
    logging.info("Shutting down prmptlab")


app = FastAPI(
    title="prmptlab",
    description="LLM System-Prompt Evaluation & Red-Teaming Platform",
    version="2.0.0",
    lifespan=lifespan,
)

import os

# CORS — read from env or default to allow all for dev
_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
_cors_origins: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview/prod URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(projects.router)
app.include_router(prompts.router)
app.include_router(test_suites.router)
app.include_router(test_cases.router)
app.include_router(evaluations.router)
app.include_router(models.router)
app.include_router(redteam.router)
app.include_router(billing.router)


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "app": "prmptlab", "version": "2.0.0"}
