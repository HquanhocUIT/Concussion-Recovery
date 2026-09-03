import os
import threading
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.database import Base, engine

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

@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Wake the RAG service in the background as this process starts.

    Both services sleep when idle on the free tier, and they wake
    independently. Without this, the first user question pays the RAG
    wakeup (~23s to /ready, ~40s to a first retrieval) inside the request.
    Firing it here means the wakeup usually overlaps the backend's own
    start, so by the time anyone asks something the evidence service is
    already up. Failures are ignored: this is opportunistic, and retrieval
    retries independently.
    """

    def _ping() -> None:
        base = os.getenv("RAG_SERVICE_URL", "").rstrip("/")
        if not base:
            return
        try:
            httpx.get(f"{base}/ready", timeout=90.0)
        except Exception:
            pass

    threading.Thread(target=_ping, daemon=True).start()
    yield


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
