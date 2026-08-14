"""Scenario evaluation for Track A.

This module compares a proposed activity-exposure scenario with the
user's recent observed exposure.

Important:
- This is not a clinical prediction.
- This does not estimate probability of symptom worsening.
- This does not diagnose concussion severity.
- Historical associations are treated as observed patterns only.
"""

from __future__ import annotations

from datetime import date
from typing import Sequence

from app.models.checkin import DailyCheckin
from app.recovery.activity_response import find_activity_response_pattern
from app.recovery.trend_analysis import get_recent_checkins
from app.schemas.scenario import (
    ScenarioExposureChange,
    ScenarioResult,
)


WINDOW_DAYS = 14

LIMITATIONS = [
    "Based on synthetic self-reported data only.",
    "Not a validated clinical measurement.",
    "Historical associations do not establish causation.",
    "Scenario interpretation is not a medical prediction.",
]


def _latest_checkin(
    checkins: Sequence[DailyCheckin],
    as_of_date: date,
) -> DailyCheckin | None:
    recent = get_recent_checkins(
        checkins=checkins,
        as_of_date=as_of_date,
        window_days=WINDOW_DAYS,
    )

    if not recent:
        return None

    return recent[-1]


def _classify_exposure_change(
    baseline_screen: int,
    baseline_study: int,
    scenario_screen: int,
    scenario_study: int,
) -> tuple[str, ScenarioExposureChange]:
    screen_change = scenario_screen - baseline_screen
    study_change = scenario_study - baseline_study

    if screen_change > 0 or study_change > 0:
        interpretation = "higher_exposure"
    elif screen_change < 0 or study_change < 0:
        interpretation = "lower_exposure"
    else:
        interpretation = "same_exposure"

    return (
        interpretation,
        ScenarioExposureChange(
            screen_time_minutes=screen_change,
            study_work_minutes=study_change,
        ),
    )


def evaluate_scenario(
    user_id: str,
    checkins: Sequence[DailyCheckin],
    as_of_date: date,
    scenario_screen_time_minutes: int,
    scenario_study_work_minutes: int,
) -> ScenarioResult:
    """Evaluate a proposed exposure scenario against recent user data."""

    recent = get_recent_checkins(
        checkins=checkins,
        as_of_date=as_of_date,
        window_days=WINDOW_DAYS,
    )

    latest = _latest_checkin(
        checkins=checkins,
        as_of_date=as_of_date,
    )

    if latest is None:
        raise ValueError("No recent check-in data available.")

    interpretation, exposure_change = _classify_exposure_change(
        baseline_screen=latest.screen_time_minutes,
        baseline_study=latest.study_work_minutes,
        scenario_screen=scenario_screen_time_minutes,
        scenario_study=scenario_study_work_minutes,
    )

    if len(recent) < 3:
        evidence_status = "insufficient_data"
        uncertainty = "high"
        supporting_days = 0
    else:
        pattern = find_activity_response_pattern(recent)

        if pattern is None:
            evidence_status = "no_observed_pattern"
            uncertainty = "moderate"
            supporting_days = 0
        else:
            evidence_status = "observed_pattern"
            supporting_days = pattern.supporting_days

            if pattern.strength == "strong":
                uncertainty = "low"
            else:
                uncertainty = "moderate"

    return ScenarioResult(
        user_id=user_id,
        as_of_date=as_of_date,
        baseline_screen_time_minutes=latest.screen_time_minutes,
        baseline_study_work_minutes=latest.study_work_minutes,
        scenario_screen_time_minutes=scenario_screen_time_minutes,
        scenario_study_work_minutes=scenario_study_work_minutes,
        exposure_change=exposure_change,
        interpretation=interpretation,
        evidence_status=evidence_status,
        uncertainty=uncertainty,
        supporting_days=supporting_days,
        activity_attributed=False,
        limitations=LIMITATIONS.copy(),
    )