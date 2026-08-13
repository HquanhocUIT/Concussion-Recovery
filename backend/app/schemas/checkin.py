"""Pydantic request/response schemas for the Check-in API.

Matches docs/contracts/track_a_contract.md §1.2 and §6 exactly.
ONLY validation schemas live here — the ORM model lives in
app/models/checkin.py, not here.
"""
from datetime import date, datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SymptomsWorsenedAfterActivity(str, Enum):
    not_applicable = "not_applicable"
    no = "no"
    mild = "mild"
    moderate = "moderate"
    severe = "severe"


class CheckinCreate(BaseModel):
    """Request body for POST /check-ins.

    extra="forbid" actively rejects unauthorized fields (e.g. notes,
    social_support, overwhelm_level) instead of silently dropping them.
    """

    model_config = ConfigDict(extra="forbid")

    user_id: str
    checkin_date: date

    headache: int = Field(ge=0, le=3)
    dizziness: int = Field(ge=0, le=3)
    blurred_vision: int = Field(ge=0, le=3)
    nausea: int = Field(ge=0, le=3)
    concentration_difficulty: int = Field(ge=0, le=3)

    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_quality: int | None = Field(default=None, ge=0, le=3)

    screen_time_minutes: int = Field(ge=0)
    study_work_minutes: int = Field(ge=0)

    symptoms_worsened_after_activity: SymptomsWorsenedAfterActivity

    # Display/context only (E-008) — never used for scoring.
    mood: int | None = Field(default=None, ge=0, le=3)

    @field_validator("checkin_date")
    @classmethod
    def _reject_future_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("checkin_date cannot be in the future")
        return value


class CheckinResponse(BaseModel):
    """Response body for POST /check-ins — §6 upsert contract."""

    checkin_id: str
    status: Literal["created", "updated"]


class CheckinListItem(BaseModel):
    """One check-in as returned by GET /check-ins?user_id=...

    Read-only representation; not used for writes.
    """

    model_config = ConfigDict(from_attributes=True)

    checkin_id: str
    user_id: str
    checkin_date: date

    headache: int
    dizziness: int
    blurred_vision: int
    nausea: int
    concentration_difficulty: int

    sleep_hours: float | None
    sleep_quality: int | None

    screen_time_minutes: int
    study_work_minutes: int

    symptoms_worsened_after_activity: str

    mood: int | None

    created_at: datetime
    updated_at: datetime | None


class ValidationErrorDetail(BaseModel):
    field: str
    issue: str


class ValidationErrorResponse(BaseModel):
    """Frozen 422 error shape — docs/contracts/track_a_contract.md §6."""

    status: Literal["error"] = "error"
    error_type: Literal["validation_error"] = "validation_error"
    details: list[ValidationErrorDetail]