"""Rank plan alternatives without using an LLM or clinical claims."""

from __future__ import annotations

from app.planner.alternatives import generate_alternatives
from app.schemas.recommendation import PlannerResult
from app.schemas.simulation import ActivityInput, ScenarioResult


_FEASIBILITY_BONUS = {
    "reduce_duration": 0.30,
    "postpone_activity": 0.15,
    "remove_activity": 0.00,
}


def plan_recovery_options(
    scenario_result: ScenarioResult,
    activities: list[ActivityInput],
    option_count: int = 3,
) -> PlannerResult:
    """Return two or three ranked trade-off options only for modeled overload."""

    if not scenario_result.modeled_overload:
        return PlannerResult(modeled_overload=False, alternatives=[])

    alternatives = generate_alternatives(activities, scenario_result.modeled_demand)
    alternatives.sort(
        key=lambda item: (
            item.improvement_score + _FEASIBILITY_BONUS[item.strategy],
            item.alternative_id,
        ),
        reverse=True,
    )
    return PlannerResult(
        modeled_overload=True,
        alternatives=alternatives[: max(2, min(option_count, 3))],
    )
