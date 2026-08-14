from typing import Literal

from pydantic import BaseModel


SafetyState = Literal[
    "SAFE",
    "REVIEW_REQUIRED",
    "BLOCKED_RED_FLAG",
]


class SafetyResult(BaseModel):
    safety_state: SafetyState
    triggered_rule_ids: list[str]
    escalation_action: str | None
    auditable_reason: str
    downstream_allowed: bool