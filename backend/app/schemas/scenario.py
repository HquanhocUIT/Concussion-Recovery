from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class ScenarioInput(BaseModel):
    screen_time_minutes: int = Field(ge=0)
    study_work_minutes: int = Field(ge=0)


class ScenarioExposureChange(BaseModel):
    screen_time_minutes: int
    study_work_minutes: int


class ScenarioResult(BaseModel):
    user_id: str
    as_of_date: date

    baseline_screen_time_minutes: int
    baseline_study_work_minutes: int

    scenario_screen_time_minutes: int
    scenario_study_work_minutes: int

    exposure_change: ScenarioExposureChange

    interpretation: Literal[
        "lower_exposure",
        "same_exposure",
        "higher_exposure",
    ]

    evidence_status: Literal[
        "insufficient_data",
        "no_observed_pattern",
        "observed_pattern",
    ]

    uncertainty: Literal[
        "low",
        "moderate",
        "high",
    ]

    supporting_days: int

    activity_attributed: bool

    limitations: list[str]