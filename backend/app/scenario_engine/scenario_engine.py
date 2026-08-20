"""Scenario Engine — Track A.

Combines modeled activity demand (Workload Model) with the user's
Recovery State to produce a structured, non-clinical ScenarioResult.

Non-negotiable rules enforced here (docs/contracts/track_a_contract.md):
- Never emits explanation_factors[].category == "clinical_evidence".
- Never infers a recovery break that was not explicitly submitted.
- Never presents modeled_overload / demand levels as a medical
  safety determination.
- `main_concerns` uses ONLY the frozen vocabulary.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.schemas.recovery import RecoveryProfileResponse
from app.schemas.simulation import (
    ActivityInput,
    ExplanationFactor,
    ScenarioResult,
)
from app.scenario_engine.activity_catalog import get_activity
from app.scenario_engine.workload_model import calculate_activity_load

# Engineering-heuristic threshold: a single activity block at or above
# this duration is flagged as a "long continuous block" concern. Not a
# clinically derived cutoff — a documented product design choice.
_LONG_BLOCK_MINUTES = 90

_LIMITATIONS = [
    "Modeled demand values are engineering heuristics, not clinical exertion or risk measurements.",
    "This is not a medical safety determination.",
    "The engine does not infer recovery breaks that were not explicitly included in the submitted plan.",
]

_DEMAND_CONCERN_MAP = {
    "cognitive_demand_level": "high_cognitive_demand",
    "physical_demand_level": "high_physical_demand",
    "screen_exposure_level": "high_screen_exposure",
}


def _has_declared_recovery_activity(activities: list[ActivityInput]) -> bool:
    for index, activity in enumerate(activities):
        catalog_item = get_activity(activity.activity_id, index)
        if catalog_item.activity_type == "rest":
            return True
    return False


def _find_long_block(activities: list[ActivityInput]) -> ActivityInput | None:
    for activity in activities:
        if activity.duration_minutes >= _LONG_BLOCK_MINUTES:
            return activity
    return None


def simulate_scenario(
    recovery_state: RecoveryProfileResponse,
    activities: list[ActivityInput],
) -> ScenarioResult:
    modeled_demand = calculate_activity_load(activities)

    data_insufficient = recovery_state.data_sufficiency == "insufficient"

    # --- scenario structure ---
    has_recovery_activity = _has_declared_recovery_activity(activities)
    long_block = _find_long_block(activities)

    # --- plan_recovery_alignment ---
    if data_insufficient:
        plan_recovery_alignment = "insufficient_data_to_assess"
    else:
        high_count = sum(
            1
            for field in (
                "cognitive_demand_level",
                "physical_demand_level",
                "screen_exposure_level",
            )
            if getattr(modeled_demand, field) == "high"
        )

        recovery_is_low = (
            modeled_demand.recovery_opportunity_level == "low"
        )

        if high_count >= 2 or (
            high_count >= 1 and long_block is not None
        ):
            plan_recovery_alignment = "low_alignment"

        elif (
            high_count == 1
            or long_block is not None
            or (
                not has_recovery_activity
                and recovery_is_low
            )
        ):
            plan_recovery_alignment = "moderate_concern"

        else:
            plan_recovery_alignment = "good_alignment"

    modeled_overload = plan_recovery_alignment == "low_alignment"

    # --- main_concerns (frozen vocabulary only) ---
    main_concerns: list[str] = []

    for field, concern in _DEMAND_CONCERN_MAP.items():
        if getattr(modeled_demand, field) == "high":
            main_concerns.append(concern)

    if not has_recovery_activity:
        main_concerns.append(
            "no_declared_recovery_activity_in_plan"
        )

    if long_block is not None:
        main_concerns.append("long_continuous_block")

    if data_insufficient:
        main_concerns.append("insufficient_data")

    # --- explanation_factors ---
    explanation_factors: list[ExplanationFactor] = []

    _DEMAND_LABEL = {
        "cognitive_demand_level": "cognitive demand",
        "physical_demand_level": "physical demand",
        "screen_exposure_level": "screen exposure",
    }
    for field, concern in _DEMAND_CONCERN_MAP.items():
        if concern in main_concerns:
            explanation_factors.append(
                ExplanationFactor(
                    factor=f"high_modeled_{field.replace('_level', '')}",
                    category="engineering_model_inference",
                    direction="increases_concern",
                    description=(
                        f"The submitted plan has a high modeled {_DEMAND_LABEL[field]} level, "
                        "based on the submitted activities and their durations."
                    ),
                )
            )

    if not has_recovery_activity:
        explanation_factors.append(
            ExplanationFactor(
                factor="no_declared_recovery_activity",
                category="engineering_model_inference",
                direction="increases_concern",
                description="The submitted plan does not include a declared recovery/rest activity.",
            )
        )

    if long_block is not None:
        explanation_factors.append(
            ExplanationFactor(
                factor="sustained_continuous_block",
                category="engineering_model_inference",
                direction="increases_concern",
                description=(
                    f"The submitted plan includes a {long_block.duration_minutes}-minute "
                    f"continuous {long_block.activity_id} block, as declared in the input."
                ),
            )
        )

    for pattern in recovery_state.observed_patterns:
        explanation_factors.append(
            ExplanationFactor(
                factor="observed_activity_response_pattern",
                category="user_specific_observed_pattern",
                direction="increases_concern",
                description=pattern.description,
                activity_attributed=pattern.activity_attributed,
            )
        )

    return ScenarioResult(
        simulation_id=str(uuid.uuid4()),
        user_id=recovery_state.user_id,
        created_at=datetime.now(timezone.utc),
        recovery_state_snapshot={
            "trend": recovery_state.trend,
            "data_sufficiency": recovery_state.data_sufficiency,
            "uncertainty": recovery_state.uncertainty,
        },
        modeled_demand=modeled_demand,
        plan_recovery_alignment=plan_recovery_alignment,
        modeled_overload=modeled_overload,
        main_concerns=main_concerns,
        explanation_factors=explanation_factors,
        uncertainty=recovery_state.uncertainty,
        data_sufficiency=recovery_state.data_sufficiency,
        limitations=_LIMITATIONS.copy(),
    )
