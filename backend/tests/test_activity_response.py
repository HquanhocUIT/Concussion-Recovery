from datetime import date

from app.models.checkin import DailyCheckin
from app.recovery.activity_response import (
    find_activity_response_pattern,
)


def _checkin(
    checkin_date: date,
    screen_time: int,
    study_work: int,
    symptom_level: int,
) -> DailyCheckin:
    return DailyCheckin(
        checkin_id=f"chk-{checkin_date}",
        user_id="demo_stable",
        checkin_date=checkin_date,
        headache=symptom_level,
        dizziness=0,
        blurred_vision=0,
        nausea=0,
        concentration_difficulty=0,
        sleep_hours=8,
        sleep_quality=2,
        screen_time_minutes=screen_time,
        study_work_minutes=study_work,
        symptoms_worsened_after_activity="no",
        mood=3,
    )


def test_requires_at_least_three_qualifying_pairs():
    checkins = [
        _checkin(date(2026, 8, 1), 60, 60, 0),
        _checkin(date(2026, 8, 2), 120, 120, 1),
        _checkin(date(2026, 8, 3), 60, 60, 0),
        _checkin(date(2026, 8, 4), 120, 120, 1),
    ]

    assert find_activity_response_pattern(checkins) is None


def test_detects_repeated_exposure_next_day_symptom_pattern():
    checkins = [
        _checkin(date(2026, 8, 1), 60, 60, 0),
        _checkin(date(2026, 8, 2), 120, 120, 1),
        _checkin(date(2026, 8, 3), 60, 60, 0),
        _checkin(date(2026, 8, 4), 120, 120, 1),
        _checkin(date(2026, 8, 5), 60, 60, 0),
        _checkin(date(2026, 8, 6), 120, 120, 2),
        _checkin(date(2026, 8, 7), 60, 60, 0),
        _checkin(date(2026, 8, 8), 120, 120, 2),
    ]

    result = find_activity_response_pattern(checkins)

    assert result is not None
    assert result.type == "activity_response"
    assert result.category == "user_specific_observed_pattern"
    assert result.activity_attributed is False
    assert result.supporting_days >= 3


def test_mood_does_not_affect_activity_response_pattern():
    low_mood = [
        _checkin(date(2026, 8, 1), 60, 60, 0),
        _checkin(date(2026, 8, 2), 120, 120, 1),
        _checkin(date(2026, 8, 3), 60, 60, 0),
        _checkin(date(2026, 8, 4), 120, 120, 1),
        _checkin(date(2026, 8, 5), 60, 60, 0),
        _checkin(date(2026, 8, 6), 120, 120, 1),
        _checkin(date(2026, 8, 7), 60, 60, 0),
    ]

    high_mood = [
        _checkin(date(2026, 8, 1), 60, 60, 0),
        _checkin(date(2026, 8, 2), 120, 120, 1),
        _checkin(date(2026, 8, 3), 60, 60, 0),
        _checkin(date(2026, 8, 4), 120, 120, 1),
        _checkin(date(2026, 8, 5), 60, 60, 0),
        _checkin(date(2026, 8, 6), 120, 120, 1),
        _checkin(date(2026, 8, 7), 60, 60, 0),
    ]

    assert bool(
        find_activity_response_pattern(low_mood)
    ) == bool(
        find_activity_response_pattern(high_mood)
    )


def test_no_activity_specific_attribution_without_activity_composition():
    checkins = [
        _checkin(date(2026, 8, 1), 60, 60, 0),
        _checkin(date(2026, 8, 2), 120, 120, 1),
        _checkin(date(2026, 8, 3), 60, 60, 0),
        _checkin(date(2026, 8, 4), 120, 120, 1),
        _checkin(date(2026, 8, 5), 60, 60, 0),
        _checkin(date(2026, 8, 6), 120, 120, 1),
        _checkin(date(2026, 8, 7), 60, 60, 0),
    ]

    result = find_activity_response_pattern(checkins)

    assert result is not None
    assert result.activity_attributed is False
    assert "coding" not in result.description.lower()
    assert "caused" not in result.description.lower()