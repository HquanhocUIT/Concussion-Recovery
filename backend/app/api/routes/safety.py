"""Safety verification API route."""

from fastapi import APIRouter

from app.schemas.safety import SafetyInput, SafetyResult
from app.safety.guardrails import enforce_safety
from app.safety.red_flags import evaluate_safety


router = APIRouter(tags=["safety"])


@router.post(
    "/safety/check",
    response_model=SafetyResult,
)
def check_safety(payload: SafetyInput) -> SafetyResult:
    """Evaluate and enforce deterministic safety rules."""

    result = evaluate_safety(payload)

    return enforce_safety(result)