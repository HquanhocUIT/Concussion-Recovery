import os
import threading
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.database import Base, engine
from app.orchestrator.llm_client import complete_json, resolve_provider

from app.models.checkin import DailyCheckin
from app.models.user import User
from app.models.simulation_history import SimulationHistory

from app.api.routes.recovery import router as recovery_router
from app.api.routes.recommendations import router as recommendations_router
from app.api.routes.checkins import router as checkins_router
from app.api.routes.scenario import router as scenario_router
from app.api.routes.safety import router as safety_router
from app.api.routes.simulation import router as simulation_router
from app.api.routes.chat import router as chat_router

from app.services.checkin_validation import CheckinValidationError
from app.scenario_engine.activity_catalog import UnknownActivityError

# A sleeping free-tier RAG container takes ~23s to answer /ready and ~40s to
# serve a first retrieval. That cannot be absorbed inside a request: the
# platform edge cuts responses at roughly 30s, so waiting longer just moves
# where the failure happens (measured: 22.9s, 26.9s, then 30.7s as the client
# timeout was raised). The fix is to keep the service awake instead.
_RAG_KEEPALIVE_INTERVAL_SECONDS = 10 * 60

_rag_keepalive_stop = threading.Event()


def _rag_keepalive() -> None:
    """Poll the RAG service so the free tier does not put it to sleep.

    Render sleeps an idle instance after ~15 minutes, so this runs well
    inside that window. Every failure is ignored — this is best-effort, and
    retrieval still retries on its own.
    """
    base = os.getenv("RAG_SERVICE_URL", "").rstrip("/")
    if not base:
        return
    while not _rag_keepalive_stop.is_set():
        try:
            httpx.get(f"{base}/ready", timeout=90.0)
        except Exception:
            pass
        _rag_keepalive_stop.wait(_RAG_KEEPALIVE_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Wake the RAG service at startup, then keep it awake."""

    thread = threading.Thread(target=_rag_keepalive, daemon=True)
    thread.start()
    try:
        yield
    finally:
        _rag_keepalive_stop.set()


app = FastAPI(
    title="RE:ENTRY - Concussion Recovery API",
    description="Recovery Intelligence, Scenario Simulation, Planner, Safety and Orchestrator services.",
    version="0.1.0",
    lifespan=lifespan,
)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health/composer")
def composer_health():
    """Report which LLM provider is configured, without revealing the key.

    The composers fall back to deterministic quoting on any failure, so a
    missing key and a rejected key look identical in chat responses. This
    says which one it is.
    """

    provider, api_key, model = resolve_provider()
    if not provider:
        return {
            "provider": "none",
            "detail": "No ANTHROPIC_API_KEY or GEMINI_API_KEY is set; answers quote guideline text verbatim.",
        }

    try:
        complete_json(
            'Reply with strict JSON: {"answer": "ok"}',
            max_tokens=32,
            timeout=20.0,
        )
    except Exception as exc:  # report, never raise: this is a diagnostic
        return {
            "provider": provider,
            "model": model,
            "key_present": True,
            "reachable": False,
            "detail": f"{type(exc).__name__}: {exc}"[:300],
        }

    return {"provider": provider, "model": model, "key_present": True, "reachable": True}


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = []

    for error in exc.errors():
        loc = [str(part) for part in error["loc"] if part != "body"]

        details.append(
            {
                "field": ".".join(loc) if loc else "unknown",
                "issue": error["msg"],
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "validation_error",
            "details": details,
        },
    )


@app.exception_handler(CheckinValidationError)
async def checkin_validation_error_handler(
    request: Request,
    exc: CheckinValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "validation_error",
            "details": [
                detail.model_dump()
                for detail in exc.details
            ],
        },
    )


@app.exception_handler(UnknownActivityError)
async def unknown_activity_error_handler(
    request: Request,
    exc: UnknownActivityError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "validation_error",
            "details": [
                {
                    "field": f"activities[{exc.index}].activity_id",
                    "issue": f"Unknown activity_id: '{exc.activity_id}'",
                }
            ],
        },
    )


app.include_router(checkins_router)
app.include_router(scenario_router)
app.include_router(recovery_router)
app.include_router(recommendations_router)
app.include_router(safety_router)
app.include_router(simulation_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok"}
