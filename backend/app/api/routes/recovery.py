"""Recovery Profile API route."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.checkin import DailyCheckin
from app.recovery.profile import build_recovery_profile
from app.schemas.recovery import RecoveryProfileResponse


router = APIRouter(tags=["recovery"])


@router.get(
    "/recovery/profile/{user_id}",
    response_model=RecoveryProfileResponse,
)
def get_recovery_profile(
    user_id: str,
    db: Session = Depends(get_db),
) -> RecoveryProfileResponse:
    """Return the user's recent Recovery Profile."""

    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user_id)
        .order_by(DailyCheckin.checkin_date.asc())
        .all()
    )

    if not checkins:
        raise HTTPException(
            status_code=404,
            detail="No check-in data found for this user.",
        )

    as_of_date = max(
        checkin.checkin_date
        for checkin in checkins
    )

    return build_recovery_profile(
        user_id=user_id,
        checkins=checkins,
        as_of_date=as_of_date,
    )