from datetime import date

import pytest

from app.schemas.recovery import ObservedPattern, RecoveryProfileResponse
from app.schemas.simulation import ActivityInput
from app.scenario_engine.scenario_engine import simulate_scenario


def _recovery_state(
    trend="stable",
    data_sufficiency="moderate",
    uncertainty="moderate",
    observed_patterns=None,
):
    return RecoveryProfileResponse(
        user_id="demo_stable",
        as_of_date=date(2026, 8, 12),
        window_days=14,
        checkin_count_in_window=9,
        trend=trend,
        data_sufficiency=data_sufficiency,
        uncertainty=uncertainty,
        observed_patterns=observed_patterns or [],
        limitations=["Based on synthetic self-reported data only."],
    )


def test_good_alignment_low_demand_plan_with_rest():
    result = simulate_scenario(
        _recovery_state(),
        [
            ActivityInput(activity_id="walking", duration_minutes=30),
            ActivityInput(activity_id="rest", duration_minutes=30),
        ],
    )
    assert result.plan_recovery_alignment == "good_alignment"
    assert result.modeled_overload is False



def test_moderate_concern_exactly_one_high_dimension():
    result = simulate_scenario(
        _recovery_state(),
        [ActivityInput(activity_id="studying", duration_minutes=60)],
    )
    assert result.modeled_demand.cognitive_demand_level == "high"
    assert result.modeled_demand.physical_demand_level == "low"
    assert result.modeled_demand.screen_exposure_level == "medium"
    assert result.plan_recovery_alignment == "moderate_concern"
    assert result.modeled_overload is False



def test_low_alignment_and_overload_high_demand_plan():
    result = simulate_scenario(
        _recovery_state(),
        [ActivityInput(activity_id="coding", duration_minutes=180)],
    )
    # coding alone: cognitive=80(high), physical=10(low), screen=90(high) -> 2 high dims
    assert result.plan_recovery_alignment == "low_alignment"
    assert result.modeled_overload is True
    assert "high_cognitive_demand" in result.main_concerns
    assert "high_screen_exposure" in result.main_concerns


def test_insufficient_data_to_assess_when_data_sufficiency_insufficient():
    result = simulate_scenario(
        _recovery_state(data_sufficiency="insufficient", uncertainty="high"),
        [ActivityInput(activity_id="coding", duration_minutes=180)],
    )
    assert result.plan_recovery_alignment == "insufficient_data_to_assess"
    assert result.modeled_overload is False
    assert "insufficient_data" in result.main_concerns


def test_no_declared_recovery_activity_concern_present_without_rest():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="studying", duration_minutes=60)])
    assert "no_declared_recovery_activity_in_plan" in result.main_concerns


def test_no_declared_recovery_activity_concern_absent_with_rest():
    result = simulate_scenario(
        _recovery_state(),
        [ActivityInput(activity_id="studying", duration_minutes=60), ActivityInput(activity_id="rest", duration_minutes=30)],
    )
    assert "no_declared_recovery_activity_in_plan" not in result.main_concerns


def test_long_continuous_block_concern_triggered_at_threshold():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="rest", duration_minutes=90)])
    assert "long_continuous_block" in result.main_concerns


def test_long_continuous_block_concern_absent_below_threshold():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="rest", duration_minutes=89)])
    assert "long_continuous_block" not in result.main_concerns


def test_observed_pattern_passthrough_activity_attributed_true():
    pattern = ObservedPattern(
        pattern_id="study_work_exposure_next_day_symptoms",
        type="activity_response",
        category="user_specific_observed_pattern",
        description="In your recent records, days with higher study/work exposure have been followed by higher reported symptoms the next day.",
        strength="moderate",
        basis="user_pattern",
        supporting_days=5,
        activity_attributed=True,
    )
    result = simulate_scenario(_recovery_state(observed_patterns=[pattern]), [ActivityInput(activity_id="rest", duration_minutes=30)])
    matching = [f for f in result.explanation_factors if f.category == "user_specific_observed_pattern"]
    assert len(matching) == 1
    assert matching[0].activity_attributed is True
    assert matching[0].description == pattern.description


def test_observed_pattern_passthrough_activity_attributed_false():
    pattern = ObservedPattern(
        pattern_id="overall_exposure_symptom_response",
        type="activity_response",
        category="user_specific_observed_pattern",
        description="In your recent records, days with higher overall exposure have also shown higher reported symptoms.",
        strength="weak",
        basis="user_pattern",
        supporting_days=3,
        activity_attributed=False,
    )
    result = simulate_scenario(_recovery_state(observed_patterns=[pattern]), [ActivityInput(activity_id="rest", duration_minutes=30)])
    matching = [f for f in result.explanation_factors if f.category == "user_specific_observed_pattern"]
    assert matching[0].activity_attributed is False


def test_never_emits_clinical_evidence_category():
    result = simulate_scenario(
        _recovery_state(),
        [ActivityInput(activity_id="coding", duration_minutes=180)],
    )
    assert all(f.category != "clinical_evidence" for f in result.explanation_factors)


def test_modeled_overload_field_name_present_not_overload():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="rest", duration_minutes=30)])
    dumped = result.model_dump()
    assert "modeled_overload" in dumped
    assert "overload" not in dumped


def test_uncertainty_and_data_sufficiency_mirror_recovery_state():
    result = simulate_scenario(
        _recovery_state(uncertainty="low", data_sufficiency="strong"),
        [ActivityInput(activity_id="rest", duration_minutes=30)],
    )
    assert result.uncertainty == "low"
    assert result.data_sufficiency == "strong"
    assert result.recovery_state_snapshot == {"trend": "stable", "data_sufficiency": "strong", "uncertainty": "low"}


def test_limitations_exact_frozen_text():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="rest", duration_minutes=30)])
    assert result.limitations == [
        "Modeled demand values are engineering heuristics, not clinical exertion or risk measurements.",
        "This is not a medical safety determination.",
        "The engine does not infer recovery breaks that were not explicitly included in the submitted plan.",
    ]


def test_duration_semantics_never_claims_user_did_not_rest():
    result = simulate_scenario(
        _recovery_state(),
        [ActivityInput(activity_id="coding", duration_minutes=120), ActivityInput(activity_id="studying", duration_minutes=60)],
    )
    for factor in result.explanation_factors:
        assert "user did not rest" not in factor.description.lower()
        assert "no break" not in factor.description.lower()


def test_simulation_id_and_created_at_present():
    result = simulate_scenario(_recovery_state(), [ActivityInput(activity_id="rest", duration_minutes=30)])
    assert result.simulation_id
    assert result.created_at is not None
