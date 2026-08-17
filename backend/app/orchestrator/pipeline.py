"""Safety-first orchestration boundary for decision pipelines."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from app.schemas.safety import SafetyInput
from app.safety.guardrails import enforce_safety
from app.safety.red_flags import evaluate_safety


def run_guarded_pipeline(
    safety_input: SafetyInput,
    planner: Callable[[], dict[str, Any]],
    evidence_retriever: Callable[[dict[str, Any]], list[dict[str, Any]]],
) -> dict[str, Any]:
    """Run downstream decision components only after the safety gate clears."""
    safety = enforce_safety(evaluate_safety(safety_input))
    if not safety.downstream_allowed:
        return {
            "safety": safety,
            "recommendation": None,
            "evidence": [],
        }

    recommendation = planner()
    evidence = evidence_retriever(recommendation)
    return {
        "safety": safety,
        "recommendation": recommendation,
        "evidence": evidence,
    }
