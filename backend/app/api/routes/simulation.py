"""Simulation (Scenario Engine) API route."""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.checkin import DailyCheckin
from app.models.simulation_history import SimulationHistory
from app.orchestrator.pipeline import run_safety_gated
from app.recovery.profile import build_recovery_profile
from app.schemas.safety import SafetyInput, SafetyResult
from app.schemas.simulation import ScenarioResult, SimulationRequest
from app.scenario_engine.scenario_engine import simulate_scenario


router = APIRouter(tags=["simulation"])


def get_default_safety_input() -> SafetyInput:
    """Structural safety-gate placeholder."""

    return SafetyInput()


@router.post("/simulations", response_model=None)
def create_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    safety_input: SafetyInput = Depends(get_default_safety_input),
) -> ScenarioResult | SafetyResult:

    # 1. Get user's check-ins
    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == payload.user_id)
        .order_by(DailyCheckin.checkin_date.asc())
        .all()
    )

    # 2. Check if user has check-in data
    if not checkins:
        raise HTTPException(
            status_code=404,
            detail="No check-in data found for this user.",
        )

    # 3. Determine latest check-in date
    as_of_date = max(
        checkin.checkin_date
        for checkin in checkins
    )

    # 4. Build recovery profile
    recovery_state = build_recovery_profile(
        user_id=payload.user_id,
        checkins=checkins,
        as_of_date=as_of_date,
    )

    # 5. Run safety gate + scenario simulation
    safety_result, scenario_result = run_safety_gated(
        safety_input=safety_input,
        downstream=lambda: simulate_scenario(
            recovery_state,
            payload.activities,
        ),
    )

    # 6. Stop if safety gate blocks downstream processing
    if not safety_result.downstream_allowed:
        return safety_result

    # 7. Save successful simulation to history
    history_item = SimulationHistory(
        simulation_id=scenario_result.simulation_id,
        user_id=payload.user_id,
        label=payload.label,
        created_at=scenario_result.created_at,
        result_json=json.dumps(
            scenario_result.model_dump(mode="json")
        ),
    )

    db.add(history_item)
    db.commit()

    # 8. Return simulation result
    return scenario_result

@router.get("/simulations/history/{user_id}")
def get_simulation_history(
    user_id: str,
    db: Session = Depends(get_db),
):
    history_items = (
        db.query(SimulationHistory)
        .filter(SimulationHistory.user_id == user_id)
        .order_by(SimulationHistory.created_at.desc())
        .all()
    )

    return [
        {
            "simulation_id": item.simulation_id,
            "user_id": item.user_id,
            "label": item.label,
            "created_at": item.created_at,
            "result": json.loads(item.result_json),
        }
        for item in history_items
    ]