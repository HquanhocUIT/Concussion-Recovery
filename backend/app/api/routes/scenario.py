"""Scenario evaluation API route."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.checkin import DailyCheckin
from app.recovery.scenario import evaluate_scenario
from app.schemas.scenario import ScenarioInput, ScenarioResult


router = APIRouter(tags=["scenario"])


@router.post(
    "/recovery/scenario/{user_id}",
    response_model=ScenarioResult,
)
def post_recovery_scenario(
    user_id: str,
    payload: ScenarioInput,
    db: Session = Depends(get_db),
) -> ScenarioResult:
    """Evaluate a proposed activity-exposure scenario."""

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

    try:
        return evaluate_scenario(
            user_id=user_id,
            checkins=checkins,
            as_of_date=as_of_date,
            scenario_screen_time_minutes=payload.screen_time_minutes,
            scenario_study_work_minutes=payload.study_work_minutes,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc