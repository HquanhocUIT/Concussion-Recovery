"""Deterministic safety red-flag evaluation."""

from app.schemas.safety import SafetyResult


def evaluate_safety() -> SafetyResult:
    """Evaluate configured deterministic safety rules.

    Clinical red-flag rules will be added only after evidence verification.
    """

    return SafetyResult(
        safety_state="REVIEW_REQUIRED",
        triggered_rule_ids=[],
        escalation_action=None,
        auditable_reason=(
            "No configured clinical red-flag rules have been evaluated."
        ),
        downstream_allowed=False,
    )