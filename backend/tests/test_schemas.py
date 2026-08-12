from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.checkin import CheckinCreate
from app.schemas.activity import ActivityCatalogItem
from app.schemas.recovery import RecoveryState
from app.schemas.simulation import (
    ActivityInput,
    SimulationRequest,
)

from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.checkin import CheckinCreate


def make_valid_checkin():
    return CheckinCreate(
        user_id="demo_stable",
        checkin_date=date(2026, 8, 12),
        headache=1,
        dizziness=0,
        blurred_vision=0,
        nausea=0,
        concentration_difficulty=1,
        sleep_hours=7.5,
        sleep_quality=2,
        screen_time_minutes=120,
        study_work_minutes=180,
        symptoms_worsened_after_activity="mild",
        mood=2,
    )


def test_valid_checkin():
    checkin = make_valid_checkin()

    assert checkin.user_id == "demo_stable"
    assert checkin.headache == 1
    assert checkin.screen_time_minutes == 120


def test_symptom_range_validation():
    with pytest.raises(ValidationError):
        CheckinCreate(
            user_id="demo_stable",
            checkin_date=date(2026, 8, 12),
            headache=4,
            dizziness=0,
            blurred_vision=0,
            nausea=0,
            concentration_difficulty=0,
            screen_time_minutes=60,
            study_work_minutes=60,
            symptoms_worsened_after_activity="no",
        )


def test_sleep_hours_range_validation():
    with pytest.raises(ValidationError):
        CheckinCreate(
            user_id="demo_stable",
            checkin_date=date(2026, 8, 12),
            headache=0,
            dizziness=0,
            blurred_vision=0,
            nausea=0,
            concentration_difficulty=0,
            sleep_hours=25,
            screen_time_minutes=60,
            study_work_minutes=60,
            symptoms_worsened_after_activity="no",
        )

from app.schemas.activity import ActivityCatalogItem


def test_valid_activity_catalog_item():
    activity = ActivityCatalogItem(
        activity_id="coding",
        activity_type="cognitive",
        cognitive_demand_weight=80,
        physical_demand_weight=10,
        screen_exposure_weight=90,
        recovery_opportunity=10,
    )

    assert activity.activity_id == "coding"
    assert activity.cognitive_demand_weight == 80


from app.schemas.recovery import RecoveryState


def test_valid_recovery_state():
    recovery = RecoveryState(
        user_id="demo_stable",
        as_of_date="2026-08-12",
        window_days=14,
        checkin_count_in_window=9,
        trend="stable",
        data_sufficiency="moderate",
        uncertainty="moderate",
        observed_patterns=[],
        limitations=[
            "Based on synthetic self-reported data only."
        ],
    )

    assert recovery.trend == "stable"
    assert recovery.data_sufficiency == "moderate"


from app.schemas.simulation import (
    ActivityInput,
    SimulationRequest,
)


def test_valid_simulation_request():
    simulation = SimulationRequest(
        user_id="demo_stable",
        activities=[
            ActivityInput(
                activity_id="class",
                duration_minutes=90,
            ),
            ActivityInput(
                activity_id="coding",
                duration_minutes=120,
            ),
        ],
        label="original_plan",
    )

    assert simulation.user_id == "demo_stable"
    assert len(simulation.activities) == 2
    assert simulation.activities[1].duration_minutes == 120