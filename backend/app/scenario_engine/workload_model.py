"""Workload Model — Track A Scenario Engine.

Computes the relative, engineering-heuristic modeled demand of a
submitted activity plan.

IMPORTANT — non-clinical:
Values produced here are engineering heuristics used only for relative
scenario comparison (docs/contracts/track_a_contract.md §4.3). They are
NOT clinical exertion measurements, NOT medical risk scores, and NOT
recovery percentages.

Deterministic, no randomness, no ML, no LLM calls.
"""
from __future__ import annotations

from app.schemas.simulation import ActivityInput, ModeledDemand
from app.scenario_engine.activity_catalog import get_activity

# Engineering-heuristic bucket thresholds for converting a 0-100
# duration-weighted average into a qualitative low/medium/high level.
# Not clinically derived — a fixed, documented product design choice.
_LOW_HIGH_BOUNDARY = 34
_MEDIUM_HIGH_BOUNDARY = 66


def _bucket(weighted_average: float) -> str:
    if weighted_average < _LOW_HIGH_BOUNDARY:
        return "low"
    if weighted_average <= _MEDIUM_HIGH_BOUNDARY:
        return "medium"
    return "high"


def calculate_activity_load(activities: list[ActivityInput]) -> ModeledDemand:
    """Compute duration-weighted modeled demand across submitted activities.

    Each activity_id is looked up in the static Activity Catalog; an
    activity_id not present in the catalog raises UnknownActivityError
    (propagated to the caller — see app/scenario_engine/activity_catalog.py).
    """
    total_duration = sum(activity.duration_minutes for activity in activities)

    if total_duration == 0:
        # ActivityInput.duration_minutes is validated > 0, and an empty
        # activities list is a request-schema concern, not this
        # function's — but guard defensively rather than divide by zero.
        return ModeledDemand(
            cognitive_demand_level="low",
            physical_demand_level="low",
            screen_exposure_level="low",
            recovery_opportunity_level="low",
        )

    cognitive_sum = 0.0
    physical_sum = 0.0
    screen_sum = 0.0
    recovery_sum = 0.0

    for index, activity in enumerate(activities):
        catalog_item = get_activity(activity.activity_id, index)
        weight = activity.duration_minutes

        cognitive_sum += catalog_item.cognitive_demand_weight * weight
        physical_sum += catalog_item.physical_demand_weight * weight
        screen_sum += catalog_item.screen_exposure_weight * weight
        recovery_sum += catalog_item.recovery_opportunity * weight

    return ModeledDemand(
        cognitive_demand_level=_bucket(cognitive_sum / total_duration),
        physical_demand_level=_bucket(physical_sum / total_duration),
        screen_exposure_level=_bucket(screen_sum / total_duration),
        recovery_opportunity_level=_bucket(recovery_sum / total_duration),
    )
