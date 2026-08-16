"""Recovery Profile assembly.

Combines user-specific trend analysis and observed activity-response
patterns into the Track A Recovery State representation.

This module does not:
- diagnose concussion severity,
- calculate a clinical recovery score,
- calculate a recovery percentage,
- make causal claims.
"""

from __future__ import annotations

from datetime import date
from typing import Sequence

from app.models.checkin import DailyCheckin
from app.recovery.activity_response import find_activity_response_pattern
from app.recovery.trend_analysis import (
    WINDOW_DAYS,
    analyze_trend,
    get_recent_checkins,
)
from app.schemas.recovery import (
    ObservedPattern,
    RecoveryProfileResponse,
)


LIMITATIONS = [
    "Based on synthetic self-reported data only.",
    "Not a validated clinical measurement.",
    "Correlational observation only; not a causal claim.",
    "Trend labels describe a recent self-reported symptom pattern, not a medical recovery status.",
]


def build_recovery_profile(
    user_id: str,
    checkins: Sequence[DailyCheckin],
    as_of_date: date,
) -> RecoveryProfileResponse:
    """Build the Track A Recovery Profile for one user."""

    trend_result = analyze_trend(
        checkins=checkins,
        as_of_date=as_of_date,
    )

    recent_checkins = get_recent_checkins(
        checkins=checkins,
        as_of_date=as_of_date,
        window_days=WINDOW_DAYS,
    )

    pattern = find_activity_response_pattern(recent_checkins)

    observed_patterns: list[ObservedPattern] = []

    if pattern is not None:
        observed_patterns.append(
            ObservedPattern(
                pattern_id=pattern.pattern_id,
                type=pattern.type,
                category=pattern.category,
                description=pattern.description,
                strength=pattern.strength,
                basis=pattern.basis,
                supporting_days=pattern.supporting_days,
                activity_attributed=pattern.activity_attributed,
            )
        )

    return RecoveryProfileResponse(
        user_id=user_id,
        as_of_date=as_of_date,
        window_days=WINDOW_DAYS,
        checkin_count_in_window=trend_result.checkin_count_in_window,
        trend=trend_result.trend,
        data_sufficiency=trend_result.data_sufficiency,
        uncertainty=trend_result.uncertainty,
        observed_patterns=observed_patterns,
        limitations=LIMITATIONS.copy(),
    )