from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.schemas.recovery import RecoveryProfileResponse
from app.schemas.simulation import (
    ActivityInput,
    ExplanationFactor,
    MainConcern,
    ScenarioResult,
)
from app.scenario_engine.activity_catalog import get_activity
from app.scenario_engine.workload_model import calculate_activity_load


_LONG_BLOCK_MINUTES = 90


_LIMITATIONS = [
    (
        "Modeled demand values are engineering heuristics, not clinical "
        "exertion or risk measurements."
    ),
    "This is not a medical safety determination.",
    (
        "The engine does not infer recovery breaks that were not explicitly "
        "included in the submitted plan."
    ),
]


_DEMAND_CONCERN_MAP = {
    "cognitive_demand_level": "high_cognitive_demand",
    "physical_demand_level": "high_physical_demand",
    "screen_exposure_level": "high_screen_exposure",
}


_DEMAND_LABEL = {
    "cognitive_demand_level": "cognitive demand",
    "physical_demand_level": "physical demand",
    "screen_exposure_level": "screen exposure",
}


def _has_declared_recovery_activity(
    activities: list[ActivityInput],
) -> bool:
    for index, activity in enumerate(activities):
        catalog_item = get_activity(
            activity.activity_id,
            index,
        )

        if catalog_item.activity_type == "rest":
            return True

    return False


def _find_long_blocks(
    activities: list[ActivityInput],
) -> list[ActivityInput]:
    return [
        activity
        for activity in activities
        if activity.duration_minutes >= _LONG_BLOCK_MINUTES
    ]


def simulate_scenario(
    recovery_state: RecoveryProfileResponse,
    activities: list[ActivityInput],
) -> ScenarioResult:

    modeled_demand = calculate_activity_load(activities)

    data_insufficient = (
        recovery_state.data_sufficiency == "insufficient"
    )

    has_recovery_activity = (
        _has_declared_recovery_activity(activities)
    )

    long_blocks = _find_long_blocks(activities)

    # --------------------------------------------------
    # Plan / recovery alignment
    # --------------------------------------------------

    if data_insufficient:

        plan_recovery_alignment = (
            "insufficient_data_to_assess"
        )

    else:

        high_count = sum(
            1
            for field in _DEMAND_CONCERN_MAP
            if getattr(modeled_demand, field) == "high"
        )

        recovery_is_low = (
            modeled_demand.recovery_opportunity_level == "low"
        )

        if (
            high_count >= 2
            or (
                high_count >= 1
                and bool(long_blocks)
            )
        ):

            plan_recovery_alignment = "low_alignment"

        elif (
            high_count == 1
            or bool(long_blocks)
            or (
                not has_recovery_activity
                and recovery_is_low
            )
        ):

            plan_recovery_alignment = "moderate_concern"

        else:

            plan_recovery_alignment = "good_alignment"

    modeled_overload = (
        plan_recovery_alignment == "low_alignment"
    )

    # --------------------------------------------------
    # Main concerns
    # --------------------------------------------------

    main_concerns: list[MainConcern] = []

    for field, concern in _DEMAND_CONCERN_MAP.items():

        if getattr(modeled_demand, field) == "high":

            main_concerns.append(concern)

    if not has_recovery_activity:

        main_concerns.append(
            "no_declared_recovery_activity_in_plan"
        )

    if long_blocks:

        main_concerns.append(
            "long_continuous_block"
        )

    if data_insufficient:

        main_concerns.append(
            "insufficient_data"
        )

    # --------------------------------------------------
    # Explanation factors
    # --------------------------------------------------

    explanation_factors: list[
        ExplanationFactor
    ] = []

    for field, concern in _DEMAND_CONCERN_MAP.items():

        if concern in main_concerns:

            explanation_factors.append(
                ExplanationFactor(
                    factor=(
                        f"high_modeled_"
                        f"{field.replace('_level', '')}"
                    ),
                    category="engineering_model_inference",
                    direction="increases_concern",
                    description=(
                        f"The submitted plan has a high modeled "
                        f"{_DEMAND_LABEL[field]} level, based on "
                        f"the submitted activities and their durations."
                    ),
                )
            )

    if not has_recovery_activity:

        explanation_factors.append(
            ExplanationFactor(
                factor="no_declared_recovery_activity",
                category="engineering_model_inference",
                direction="increases_concern",
                description=(
                    "The submitted plan does not include a declared "
                    "recovery/rest activity."
                ),
            )
        )

    for activity in long_blocks:

        explanation_factors.append(
            ExplanationFactor(
                factor="sustained_continuous_block",
                category="engineering_model_inference",
                direction="increases_concern",
                description=(
                    f"The submitted plan includes a "
                    f"{activity.duration_minutes}-minute continuous "
                    f"{activity.activity_id} block, as declared in "
                    f"the input."
                ),
            )
        )

    if data_insufficient:

        explanation_factors.append(
            ExplanationFactor(
                factor="insufficient_personalization_data",
                category="engineering_model_inference",
                direction="neutral_context",
                description=(
                    "There is insufficient recent self-reported "
                    "history to assess the submitted plan against "
                    "a personalized recovery pattern."
                ),
            )
        )

    for pattern in recovery_state.observed_patterns:

        explanation_factors.append(
            ExplanationFactor(
                factor=(
                    "observed_activity_response_pattern"
                ),
                category=(
                    "user_specific_observed_pattern"
                ),
                direction="increases_concern",
                description=pattern.description,
                activity_attributed=(
                    pattern.activity_attributed
                ),
            )
        )

    return ScenarioResult(

        simulation_id=str(uuid.uuid4()),

        user_id=recovery_state.user_id,

        created_at=datetime.now(timezone.utc),

        recovery_state_snapshot={
            "trend": recovery_state.trend,
            "data_sufficiency": (
                recovery_state.data_sufficiency
            ),
            "uncertainty": (
                recovery_state.uncertainty
            ),
        },

        modeled_demand=modeled_demand,

        plan_recovery_alignment=(
            plan_recovery_alignment
        ),

        modeled_overload=modeled_overload,

        main_concerns=main_concerns,

        explanation_factors=(
            explanation_factors
        ),

        uncertainty=recovery_state.uncertainty,

        data_sufficiency=(
            recovery_state.data_sufficiency
        ),

        limitations=_LIMITATIONS.copy(),
    )