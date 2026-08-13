"""Recovery trend analysis.

This module computes user-specific, non-clinical trend information from
recent DailyCheckin records.

Important:
- This is NOT a clinical recovery score.
- This does NOT diagnose concussion severity.
- mood is intentionally excluded from all calculations.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Sequence

from app.models.checkin import DailyCheckin


WINDOW_DAYS = 14
MIN_CHECKINS_FOR_TREND = 3


@dataclass(frozen=True)
class TrendResult:
    trend: str
    data_sufficiency: str
    uncertainty: str
    checkin_count_in_window: int


def calculate_data_sufficiency(checkin_count: int) -> str:
    """Classify the amount of recent self-report data.

    These thresholds are engineering-defined data-availability thresholds,
    not clinical validity or recovery thresholds.
    """
    if checkin_count < 3:
        return "insufficient"

    if checkin_count <= 6:
        return "limited"

    if checkin_count <= 13:
        return "moderate"

    return "strong"


def get_recent_checkins(
    checkins: Sequence[DailyCheckin],
    as_of_date: date,
    window_days: int = WINDOW_DAYS,
) -> list[DailyCheckin]:
    """Return check-ins inside the inclusive recent window.

    The window is defined as:
        as_of_date - (window_days - 1) ... as_of_date
    """
    start_date = as_of_date - timedelta(days=window_days - 1)

    return sorted(
        [
            checkin
            for checkin in checkins
            if start_date <= checkin.checkin_date <= as_of_date
        ],
        key=lambda checkin: checkin.checkin_date,
    )


def _symptom_burden(checkin: DailyCheckin) -> int:
    """Calculate the simple symptom-burden total used for trend comparison.

    Includes the five approved symptom fields.

    mood is deliberately NOT included.
    """
    return (
        checkin.headache
        + checkin.dizziness
        + checkin.blurred_vision
        + checkin.nausea
        + checkin.concentration_difficulty
    )


def calculate_trend(checkins: Sequence[DailyCheckin]) -> str:
    """Determine the recent self-reported symptom pattern.

    Requires at least three check-ins.

    The algorithm compares the earlier portion of the window with the
    later portion. It reports a directional pattern only; it does not
    describe medical recovery status.
    """
    if len(checkins) < MIN_CHECKINS_FOR_TREND:
        return "insufficient_data"

    ordered = sorted(
        checkins,
        key=lambda checkin: checkin.checkin_date,
    )

    midpoint = len(ordered) // 2

    earlier = ordered[:midpoint]
    later = ordered[midpoint:]

    earlier_average = sum(
        _symptom_burden(checkin) for checkin in earlier
    ) / len(earlier)

    later_average = sum(
        _symptom_burden(checkin) for checkin in later
    ) / len(later)

    difference = later_average - earlier_average

    if difference <= -1:
        return "improving"

    if difference >= 1:
        return "worsening"

    return "stable"


def calculate_uncertainty(
    checkin_count: int,
    trend: str,
) -> str:
    """Return qualitative uncertainty based on available data.

    This is an engineering representation of data uncertainty, not
    clinical confidence.
    """
    if checkin_count < 3:
        return "high"

    if checkin_count <= 6:
        return "high"

    if trend == "insufficient_data":
        return "high"

    if checkin_count <= 13:
        return "moderate"

    return "low"


def analyze_trend(
    checkins: Sequence[DailyCheckin],
    as_of_date: date,
) -> TrendResult:
    """Compute the Recovery State trend components for a 14-day window."""
    recent = get_recent_checkins(
        checkins=checkins,
        as_of_date=as_of_date,
        window_days=WINDOW_DAYS,
    )

    count = len(recent)

    data_sufficiency = calculate_data_sufficiency(count)

    trend = calculate_trend(recent)

    uncertainty = calculate_uncertainty(
        checkin_count=count,
        trend=trend,
    )

    return TrendResult(
        trend=trend,
        data_sufficiency=data_sufficiency,
        uncertainty=uncertainty,
        checkin_count_in_window=count,
    )