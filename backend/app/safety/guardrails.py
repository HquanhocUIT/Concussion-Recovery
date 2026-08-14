"""Safety guardrails for downstream decision enforcement."""

from app.schemas.safety import SafetyResult


def enforce_safety(result: SafetyResult) -> SafetyResult:
    """Enforce the safety decision before downstream processing.

    A BLOCKED_RED_FLAG result must never be downgraded or overridden
    by planner, LLM, RAG, or other downstream components.
    """

    if result.safety_state == "BLOCKED_RED_FLAG":
        return result

    if result.safety_state == "REVIEW_REQUIRED":
        return result

    return result