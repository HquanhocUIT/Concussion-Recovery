"""Deterministic safety red-flag evaluation."""

from app.schemas.safety import SafetyInput, SafetyResult


def evaluate_safety(safety_input: SafetyInput) -> SafetyResult:
    """Evaluate deterministic clinical red-flag rules.

    Red-flag decisions are deterministic and do not use LLM output.
    """

    triggered_rule_ids: list[str] = []

    if safety_input.worsening_headache:
        triggered_rule_ids.append("RF-001")

    if safety_input.repeated_vomiting:
        triggered_rule_ids.append("RF-002")

    if safety_input.neurological_danger_sign:
        triggered_rule_ids.append("RF-003")

    if triggered_rule_ids:
        return SafetyResult(
            safety_state="BLOCKED_RED_FLAG",
            triggered_rule_ids=triggered_rule_ids,
            escalation_action="SEEK_IMMEDIATE_MEDICAL_EVALUATION",
            auditable_reason=(
                "One or more configured clinical red-flag conditions "
                "were explicitly reported."
            ),
            downstream_allowed=False,
        )

    return SafetyResult(
        safety_state="SAFE",
        triggered_rule_ids=[],
        escalation_action=None,
        auditable_reason=(
            "No configured clinical red-flag conditions were reported."
        ),
        downstream_allowed=True,
    )