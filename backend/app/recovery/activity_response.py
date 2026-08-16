"""User-specific activity-response pattern detection.

This module detects repeated higher-exposure -> higher-symptom patterns
from the user's own check-in history.

Important:
- This is an observed user-specific pattern.
- It is NOT a causal inference.
- It is NOT a clinical recovery assessment.
- It must not claim that an activity caused symptoms.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Sequence

from app.models.checkin import DailyCheckin


MIN_QUALIFYING_PAIRS = 3


@dataclass(frozen=True)
class ActivityResponsePattern:
    pattern_id: str
    type: str
    category: str
    description: str
    strength: str
    basis: str
    supporting_days: int
    activity_attributed: bool


def _symptom_burden(checkin: DailyCheckin) -> int:
    """Return the approved five-field symptom burden.

    mood is deliberately excluded.
    """
    return (
        checkin.headache
        + checkin.dizziness
        + checkin.blurred_vision
        + checkin.nausea
        + checkin.concentration_difficulty
    )


def _is_higher_exposure(
    exposure: DailyCheckin,
    baseline: DailyCheckin,
) -> bool:
    """Return True when exposure is higher than the previous day.

    Overall exposure is based on the frozen check-in fields:
    - screen_time_minutes
    - study_work_minutes

    A day qualifies when at least one exposure field is higher.
    """
    return (
        exposure.screen_time_minutes > baseline.screen_time_minutes
        or exposure.study_work_minutes > baseline.study_work_minutes
    )


def find_activity_response_pattern(
    checkins: Sequence[DailyCheckin],
) -> ActivityResponsePattern | None:
    """Detect a repeated higher-exposure -> higher-symptom pattern.

    A qualifying pair consists of two consecutive reported days:

        baseline day -> higher-exposure day

    The exposure day must:
    1. have higher overall exposure than the previous day, and
    2. have higher reported symptom burden than the previous day.

    At least three qualifying pairs are required.

    Because the check-in schema does not identify the exact activity
    composition, this pattern is not attributed to a specific activity.
    """
    if len(checkins) < MIN_QUALIFYING_PAIRS + 1:
        return None

    ordered = sorted(
        checkins,
        key=lambda checkin: checkin.checkin_date,
    )

    qualifying_pairs = 0

    for index in range(1, len(ordered)):
        baseline = ordered[index - 1]
        exposure = ordered[index]

        # Only compare consecutive reported days.
        if exposure.checkin_date != baseline.checkin_date + timedelta(days=1):
            continue

        # Exposure must be higher than the previous day.
        if not _is_higher_exposure(exposure, baseline):
            continue

        # Symptoms must also be higher on the exposure day.
        if _symptom_burden(exposure) <= _symptom_burden(baseline):
            continue

        qualifying_pairs += 1

    if qualifying_pairs < MIN_QUALIFYING_PAIRS:
        return None

    if qualifying_pairs >= 6:
        strength = "strong"
    elif qualifying_pairs >= 4:
        strength = "moderate"
    else:
        strength = "weak"

    return ActivityResponsePattern(
        pattern_id="overall_exposure_symptom_response",
        type="activity_response",
        category="user_specific_observed_pattern",
        description=(
            "In your recent records, days with higher overall exposure "
            "have also shown higher reported symptoms."
        ),
        strength=strength,
        basis="user_pattern",
        supporting_days=qualifying_pairs,
        activity_attributed=False,
    )