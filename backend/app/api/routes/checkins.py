"""Check-in API routes.

Implements docs/contracts/track_a_contract.md §1.2, §1.5, §6 exactly:
- POST /check-ins        — create/update (UPSERT) semantics
- GET  /check-ins        — list a user's check-ins, most recent first

Business-rule validation (the contradictory-time-total check) is enforced
here, not in the ORM model, so the frozen error shape can be returned
consistently alongside field-level validation errors.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.checkin import DailyCheckin
from app.schemas.checkin import CheckinCreate, CheckinListItem, CheckinResponse
from app.services.checkin_validation import CheckinValidationError, check_contradictory_time_totals

router = APIRouter(tags=["check-ins"])

# Fields that are copied from the request into the ORM row on both create
# and update. Kept as an explicit list (not **payload.model_dump()) so any
# future schema/model drift fails loudly instead of silently mismatching.
_WRITABLE_FIELDS = [
    "headache",
    "dizziness",
    "blurred_vision",
    "nausea",
    "concentration_difficulty",
    "sleep_hours",
    "sleep_quality",
    "screen_time_minutes",
    "study_work_minutes",
    "symptoms_worsened_after_activity",
    "mood",
]


@router.post("/check-ins", response_model=CheckinResponse)
def create_or_update_checkin(payload: CheckinCreate, response: Response, db: Session = Depends(get_db)) -> CheckinResponse:
    check_contradictory_time_totals(
        screen_time_minutes=payload.screen_time_minutes,
        study_work_minutes=payload.study_work_minutes,
        sleep_hours=payload.sleep_hours,
    )

    existing = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == payload.user_id, DailyCheckin.checkin_date == payload.checkin_date)
        .first()
    )

    if existing is not None:
        for field in _WRITABLE_FIELDS:
            value = getattr(payload, field)
            # Pydantic enum member -> plain string for the DB column.
            setattr(existing, field, value.value if hasattr(value, "value") else value)
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        response.status_code = 200
        return CheckinResponse(checkin_id=existing.checkin_id, status="updated")

    new_checkin = DailyCheckin(
        user_id=payload.user_id,
        checkin_date=payload.checkin_date,
        **{
            field: (getattr(payload, field).value if hasattr(getattr(payload, field), "value") else getattr(payload, field))
            for field in _WRITABLE_FIELDS
        },
    )
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    response.status_code = 201
    return CheckinResponse(checkin_id=new_checkin.checkin_id, status="created")


@router.get("/check-ins", response_model=list[CheckinListItem])
def list_checkins(user_id: str = Query(...), db: Session = Depends(get_db)) -> list[DailyCheckin]:
    return (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user_id)
        .order_by(DailyCheckin.checkin_date.desc())
        .all()
    )