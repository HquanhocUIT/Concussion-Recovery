from datetime import date

from app.models.checkin import DailyCheckin
from app.recovery.scenario import evaluate_scenario


def make_checkin(
    day: int,
    screen: int,
    study: int,
    headache: int,
    dizziness: int = 0,
    blurred: int = 0,
    nausea: int = 0,
    concentration: int = 0,
):
    return DailyCheckin(
        checkin_id=f"checkin-{day}",
        user_id="demo",
        checkin_date=date(2026, 8, day),
        headache=headache,
        dizziness=dizziness,
        blurred_vision=blurred,
        nausea=nausea,
        concentration_difficulty=concentration,
        sleep_hours=8,
        sleep_quality=2,
        screen_time_minutes=screen,
        study_work_minutes=study,
        symptoms_worsened_after_activity="no",
        mood=2,
    )


def test_insufficient_data():
    checkins = [
        make_checkin(1, 60, 60, 1),
        make_checkin(2, 60, 60, 1),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 2),
        scenario_screen_time_minutes=120,
        scenario_study_work_minutes=120,
    )

    assert result.evidence_status == "insufficient_data"
    assert result.uncertainty == "high"


def test_same_exposure():
    checkins = [
        make_checkin(1, 60, 60, 1),
        make_checkin(2, 60, 60, 1),
        make_checkin(3, 60, 60, 1),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 3),
        scenario_screen_time_minutes=60,
        scenario_study_work_minutes=60,
    )

    assert result.interpretation == "same_exposure"


def test_higher_exposure():
    checkins = [
        make_checkin(1, 60, 60, 1),
        make_checkin(2, 60, 60, 1),
        make_checkin(3, 60, 60, 1),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 3),
        scenario_screen_time_minutes=120,
        scenario_study_work_minutes=120,
    )

    assert result.interpretation == "higher_exposure"


def test_lower_exposure():
    checkins = [
        make_checkin(1, 120, 120, 1),
        make_checkin(2, 120, 120, 1),
        make_checkin(3, 120, 120, 1),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 3),
        scenario_screen_time_minutes=60,
        scenario_study_work_minutes=60,
    )

    assert result.interpretation == "lower_exposure"


def test_observed_pattern_is_exposed_as_evidence():
    checkins = [
        make_checkin(1, 60, 60, 0),
        make_checkin(2, 120, 60, 1),
        make_checkin(3, 60, 60, 0),
        make_checkin(4, 120, 60, 1),
        make_checkin(5, 60, 60, 0),
        make_checkin(6, 120, 60, 1),
        make_checkin(7, 60, 60, 0),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 7),
        scenario_screen_time_minutes=180,
        scenario_study_work_minutes=60,
    )

    assert result.evidence_status == "observed_pattern"
    assert result.supporting_days >= 3
    assert result.activity_attributed is False


def test_scenario_never_makes_causal_claim():
    checkins = [
        make_checkin(1, 60, 60, 0),
        make_checkin(2, 120, 60, 1),
        make_checkin(3, 60, 60, 0),
        make_checkin(4, 120, 60, 1),
        make_checkin(5, 60, 60, 0),
        make_checkin(6, 120, 60, 1),
    ]

    result = evaluate_scenario(
        user_id="demo",
        checkins=checkins,
        as_of_date=date(2026, 8, 6),
        scenario_screen_time_minutes=180,
        scenario_study_work_minutes=60,
    )

    assert result.activity_attributed is False
    assert any(
        "causation" in limitation.lower()
        for limitation in result.limitations
    )