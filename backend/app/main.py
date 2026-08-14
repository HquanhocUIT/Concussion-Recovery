from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes.recovery import router as recovery_router

from app.api.routes.checkins import router as checkins_router
from app.api.routes.scenario import router as scenario_router
from app.services.checkin_validation import CheckinValidationError


app = FastAPI(
    title="RE:ENTRY - Concussion Recovery API",
    description="Recovery Intelligence, Scenario Simulation, Planner, Safety and Orchestrator services.",
    version="0.1.0",
)


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


app.include_router(checkins_router)
app.include_router(scenario_router)
app.include_router(recovery_router)


@app.get("/health")
def health():
    return {"status": "ok"}