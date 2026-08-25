"""Simulation (Scenario Engine) API route.

Implements docs/contracts/track_a_contract.md POST /simulations.

Flow:
    checkins -> RecoveryProfileResponse -> Safety Gate
        -> Workload Model -> Scenario Engine -> ScenarioResult

Safety integration is a structural placeholder for this pass:
SafetyInput() always uses its default (all-False) values. This does
NOT perform real-world red-flag detection for simulation requests —
no flag here is derived from daily_checkins fields (headache, nausea,
etc.). See app/schemas/safety.py for the existing Track B contract.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.checkin import DailyCheckin
from app.orchestrator.pipeline import run_safety_gated
from app.recovery.profile import build_recovery_profile
from app.schemas.safety import SafetyInput, SafetyResult
from app.schemas.simulation import ScenarioResult, SimulationRequest
from app.scenario_engine.scenario_engine import simulate_scenario

router = APIRouter(tags=["simulation"])


def get_default_safety_input() -> SafetyInput:
    """Structural safety-gate placeholder.

    Always returns SafetyInput() defaults. This does not derive any
    flag from check-in data — it exists so /simulations is genuinely
    safety-gated through the existing Track B pipeline, not so that it
    performs real red-flag detection today. Injectable as a FastAPI
    dependency so tests can override it to exercise the blocked path
    without touching production safety logic.
    """
    return SafetyInput()


@router.post("/simulations", response_model=None)
def create_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    safety_input: SafetyInput = Depends(get_default_safety_input),
) -> ScenarioResult | SafetyResult:
    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == payload.user_id)
        .order_by(DailyCheckin.checkin_date.asc())
        .all()
    )

    if not checkins:
        raise HTTPException(status_code=404, detail="No check-in data found for this user.")

    as_of_date = max(checkin.checkin_date for checkin in checkins)
    recovery_state = build_recovery_profile(user_id=payload.user_id, checkins=checkins, as_of_date=as_of_date)

    safety_result, scenario_result = run_safety_gated(
        safety_input=safety_input,
        downstream=lambda: simulate_scenario(recovery_state, payload.activities),
    )

    if not safety_result.downstream_allowed:
        return safety_result

    return scenario_result
