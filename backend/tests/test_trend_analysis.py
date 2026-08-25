from datetime import date, timedelta

from app.models.checkin import DailyCheckin
from app.recovery.trend_analysis import (
    analyze_trend,
    calculate_data_sufficiency,
    calculate_trend,
    get_recent_checkins,
)


def _checkin(
    checkin_date: date,
    symptom_level: int,
    mood: int | None = 0,
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
        screen_time_minutes=120,
        study_work_minutes=120,
        symptoms_worsened_after_activity="no",
        mood=mood,
    )


def test_data_sufficiency_thresholds():
    assert calculate_data_sufficiency(0) == "insufficient"
    assert calculate_data_sufficiency(2) == "insufficient"
    assert calculate_data_sufficiency(3) == "limited"
    assert calculate_data_sufficiency(6) == "limited"
    assert calculate_data_sufficiency(7) == "moderate"
    assert calculate_data_sufficiency(13) == "moderate"
    assert calculate_data_sufficiency(14) == "strong"


def test_less_than_three_checkins_is_insufficient_data():
    checkins = [
        _checkin(date(2026, 8, 10), 1),
        _checkin(date(2026, 8, 12), 1),
    ]

    assert calculate_trend(checkins) == "insufficient_data"


def test_improving_trend():
    checkins = [
        _checkin(date(2026, 8, 1), 3),
        _checkin(date(2026, 8, 2), 3),
        _checkin(date(2026, 8, 3), 2),
        _checkin(date(2026, 8, 4), 0),
        _checkin(date(2026, 8, 5), 0),
        _checkin(date(2026, 8, 6), 0),
    ]

    assert calculate_trend(checkins) == "improving"


def test_worsening_trend():
    checkins = [
        _checkin(date(2026, 8, 1), 0),
        _checkin(date(2026, 8, 2), 0),
        _checkin(date(2026, 8, 3), 0),
        _checkin(date(2026, 8, 4), 2),
        _checkin(date(2026, 8, 5), 3),
        _checkin(date(2026, 8, 6), 3),
    ]

    assert calculate_trend(checkins) == "worsening"


def test_stable_trend():
    checkins = [
        _checkin(date(2026, 8, 1), 1),
        _checkin(date(2026, 8, 2), 1),
        _checkin(date(2026, 8, 3), 2),
        _checkin(date(2026, 8, 4), 1),
        _checkin(date(2026, 8, 5), 1),
        _checkin(date(2026, 8, 6), 2),
    ]

    assert calculate_trend(checkins) == "stable"


def test_only_recent_14_day_window_is_used():
    as_of_date = date(2026, 8, 20)

    old_checkin = _checkin(date(2026, 8, 1), 3)

    recent_checkins = [
        _checkin(date(2026, 8, 15), 1),
        _checkin(date(2026, 8, 17), 1),
        _checkin(date(2026, 8, 20), 1),
    ]

    result = get_recent_checkins(
        [old_checkin, *recent_checkins],
        as_of_date=as_of_date,
    )

    assert len(result) == 3


def test_mood_does_not_change_trend():
    checkins_low_mood = [
        _checkin(date(2026, 8, 1), 1, mood=0),
        _checkin(date(2026, 8, 2), 1, mood=0),
        _checkin(date(2026, 8, 3), 1, mood=0),
        _checkin(date(2026, 8, 4), 2, mood=0),
        _checkin(date(2026, 8, 5), 2, mood=0),
        _checkin(date(2026, 8, 6), 2, mood=0),
    ]

    checkins_high_mood = [
        _checkin(date(2026, 8, 1), 1, mood=3),
        _checkin(date(2026, 8, 2), 1, mood=3),
        _checkin(date(2026, 8, 3), 1, mood=3),
        _checkin(date(2026, 8, 4), 2, mood=3),
        _checkin(date(2026, 8, 5), 2, mood=3),
        _checkin(date(2026, 8, 6), 2, mood=3),
    ]

    assert calculate_trend(checkins_low_mood) == calculate_trend(
        checkins_high_mood
    )


def test_analyze_trend_returns_complete_result():
    checkins = [
        _checkin(date(2026, 8, 1), 1),
        _checkin(date(2026, 8, 2), 1),
        _checkin(date(2026, 8, 3), 1),
        _checkin(date(2026, 8, 4), 1),
        _checkin(date(2026, 8, 5), 1),
        _checkin(date(2026, 8, 6), 1),
        _checkin(date(2026, 8, 7), 1),
    ]

    result = analyze_trend(
        checkins=checkins,
        as_of_date=date(2026, 8, 7),
    )

    assert result.trend == "stable"
    assert result.data_sufficiency == "moderate"
    assert result.uncertainty == "moderate"
    assert result.checkin_count_in_window == 7