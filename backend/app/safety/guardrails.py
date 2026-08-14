"""Safety guardrails for downstream decision enforcement."""

from app.schemas.safety import SafetyResult


def enforce_safety(result: SafetyResult) -> SafetyResult:
    """Enforce the safety decision before downstream processing.

    Safety states are authoritative at this boundary:
    - BLOCKED_RED_FLAG: downstream processing is forbidden.
    - REVIEW_REQUIRED: downstream processing is forbidden.
    - SAFE: downstream processing may continue.
    """

    if result.safety_state == "BLOCKED_RED_FLAG":
        return result.model_copy(
            update={"downstream_allowed": False}
        )

    if result.safety_state == "REVIEW_REQUIRED":
        return result.model_copy(
            update={"downstream_allowed": False}
        )

    return result.model_copy(
        update={"downstream_allowed": True}
    )