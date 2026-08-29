"""Safety-first orchestration boundary for decision pipelines."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, TypeVar

from app.schemas.safety import SafetyInput, SafetyResult
from app.safety.guardrails import enforce_safety
from app.safety.red_flags import evaluate_safety


T = TypeVar("T")


def evaluate_safety_gate(
    safety_input: SafetyInput,
) -> SafetyResult:
    """Evaluate and enforce the authoritative safety boundary."""

    result = evaluate_safety(safety_input)
    return enforce_safety(result)


def run_pipeline(
    safety_input: SafetyInput,
) -> SafetyResult:
    """Run the safety boundary.

    Compatibility entry point for the current orchestrator tests.
    """

    return evaluate_safety_gate(safety_input)


def run_safety_gated(
    safety_input: SafetyInput,
    downstream: Callable[[], T],
) -> tuple[SafetyResult, T | None]:
    """Run downstream processing only when Safety explicitly allows it.

    Safety is authoritative:
    - BLOCKED_RED_FLAG: downstream is never executed.
    - REVIEW_REQUIRED: downstream is never executed.
    - SAFE: downstream may execute.
    """

    safety_result = evaluate_safety_gate(safety_input)

    if not safety_result.downstream_allowed:
        return safety_result, None

    return safety_result, downstream()


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
