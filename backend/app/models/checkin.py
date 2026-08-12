from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


SymptomLevel = int


class CheckinCreate(BaseModel):
    user_id: str
    checkin_date: date

    headache: SymptomLevel = Field(ge=0, le=3)
    dizziness: SymptomLevel = Field(ge=0, le=3)
    blurred_vision: SymptomLevel = Field(ge=0, le=3)
    nausea: SymptomLevel = Field(ge=0, le=3)
    concentration_difficulty: SymptomLevel = Field(ge=0, le=3)

    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_quality: int | None = Field(default=None, ge=0, le=3)

    screen_time_minutes: int = Field(ge=0)
    study_work_minutes: int = Field(ge=0)

    symptoms_worsened_after_activity: Literal[
        "not_applicable",
        "no",
        "mild",
        "moderate",
        "severe",
    ]

    mood: int | None = Field(default=None, ge=0, le=3)


class CheckinResponse(BaseModel):
    checkin_id: str
    status: Literal["created", "updated"]