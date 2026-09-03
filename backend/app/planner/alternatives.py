"""Generate deterministic plan variants for a modeled-overload scenario."""

from __future__ import annotations

from app.schemas.recommendation import PlanAlternative
from app.schemas.simulation import ActivityInput, ModeledDemand
from app.scenario_engine.activity_catalog import get_activity
from app.scenario_engine.workload_model import calculate_activity_load


_LEVEL = {"low": 0, "medium": 1, "high": 2}


def _target_index(activities: list[ActivityInput]) -> int:
    """Choose the declared non-rest block with the largest modeled impact."""

    candidates: list[tuple[float, int]] = []
    for index, activity in enumerate(activities):
        catalog = get_activity(activity.activity_id, index)
        if catalog.activity_type == "rest":
            continue
        demand = (
            catalog.cognitive_demand_weight
            + catalog.physical_demand_weight
            + catalog.screen_exposure_weight
            - 0.25 * catalog.recovery_opportunity
        )
        candidates.append((demand * activity.duration_minutes, index))

    if not candidates:
        return 0
    return max(candidates)[1]


_LONG_BLOCK_MINUTES = 90


def _improvement(
    original: ModeledDemand,
    alternative: ModeledDemand,
    original_activities: list[ActivityInput],
    alternative_activities: list[ActivityInput],
) -> float:
    """Score relative improvement between two modeled plans.

    This remains an engineering heuristic. In addition to demand buckets,
    it rewards removal of a sustained continuous block.
    """

    demand_fields = (
        "cognitive_demand_level",
        "physical_demand_level",
        "screen_exposure_level",
    )

    gain = sum(
        _LEVEL[getattr(original, field)]
        - _LEVEL[getattr(alternative, field)]
        for field in demand_fields
    )

    gain += 0.5 * (
        _LEVEL[alternative.recovery_opportunity_level]
        - _LEVEL[original.recovery_opportunity_level]
    )

    original_has_long_block = any(
        activity.duration_minutes >= _LONG_BLOCK_MINUTES
        for activity in original_activities
    )

    alternative_has_long_block = any(
        activity.duration_minutes >= _LONG_BLOCK_MINUTES
        for activity in alternative_activities
    )

    if original_has_long_block and not alternative_has_long_block:
        gain += 1.0

    return round(float(gain), 2)


def generate_alternatives(
    activities: list[ActivityInput],
    original_demand: ModeledDemand,
) -> list[PlanAlternative]:
    """Build the three Track B variants and re-run Track A's workload model."""

    target_index = _target_index(activities)
    target = activities[target_index]
    remaining = [item.model_copy() for i, item in enumerate(activities) if i != target_index]

    reduced = [item.model_copy() for item in activities]
    reduced_minutes = max(1, target.duration_minutes // 2)
    reduced[target_index] = target.model_copy(update={"duration_minutes": reduced_minutes})

    variants = [
        (
            "remove-activity",
            "remove_activity",
            f"Remove {target.activity_id.replace('_', ' ')} from this plan",
            "Removes the declared block with the largest relative modeled impact.",
            "Frees the most demand today, but the activity will need to be cancelled or replanned.",
            remaining,
            None,
        ),
        (
            "reduce-duration",
            "reduce_duration",
            f"Shorten {target.activity_id.replace('_', ' ')} to {reduced_minutes} minutes",
            "Keeps the activity while reducing its declared continuous duration.",
            "Preserves the activity, but less may be completed today.",
            reduced,
            None,
        ),
        (
            "postpone-activity",
            "postpone_activity",
            f"Move {target.activity_id.replace('_', ' ')} to another day",
            "Moves the highest-impact declared block out of today's comparison.",
            "Reduces today's modeled demand, but creates a scheduling commitment later.",
            remaining,
            target.model_copy(),
        ),
    ]

    alternatives: list[PlanAlternative] = []
    for alternative_id, strategy, title, rationale, tradeoff, plan, postponed in variants:
        modeled_demand = calculate_activity_load(plan)
        alternatives.append(
            PlanAlternative(
                alternative_id=alternative_id,
                strategy=strategy,
                title=title,
                rationale=rationale,
                tradeoff=tradeoff,
                activities=plan,
                postponed_activity=postponed,
                modeled_demand=modeled_demand,
                improvement_score=_improvement(
                    original=original_demand,
                    alternative=modeled_demand,
                    original_activities=activities,
                    alternative_activities=plan,
                ),
            )
        )
    return alternatives
