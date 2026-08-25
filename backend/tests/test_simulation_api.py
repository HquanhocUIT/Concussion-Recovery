from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models.checkin import DailyCheckin
from app.schemas.safety import SafetyInput
from app.api.routes.simulation import get_default_safety_input


engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def _override_database():
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


client = TestClient(app)


def setup_function():
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def _checkin(checkin_date, symptom_level=1, screen_time=60, study_work=60):
    return DailyCheckin(
        checkin_id=f"sim-{checkin_date}", user_id="demo_stable", checkin_date=checkin_date,
        headache=symptom_level, dizziness=0, blurred_vision=0, nausea=0, concentration_difficulty=0,
        sleep_hours=8, sleep_quality=2, screen_time_minutes=screen_time, study_work_minutes=study_work,
        symptoms_worsened_after_activity="no", mood=3,
    )


def _insert(checkins):
    db = TestingSessionLocal()
    try:
        db.add_all(checkins)
        db.commit()
    finally:
        db.close()


def test_valid_simulation_returns_full_contract_shape():
    _insert([_checkin(date(2026, 8, d)) for d in range(1, 8)])

    response = client.post(
        "/simulations",
        json={
            "user_id": "demo_stable",
            "activities": [
                {"activity_id": "class_lecture", "duration_minutes": 90},
                {"activity_id": "coding", "duration_minutes": 120},
            ],
            "label": "original_plan",
        },
    )

    assert response.status_code == 200
    body = response.json()

    for field in [
        "simulation_id", "user_id", "created_at", "recovery_state_snapshot",
        "modeled_demand", "plan_recovery_alignment", "modeled_overload",
        "main_concerns", "explanation_factors", "uncertainty",
        "data_sufficiency", "limitations",
    ]:
        assert field in body, f"missing field: {field}"

    assert body["user_id"] == "demo_stable"
    assert body["created_at"] is not None
    assert "overload" not in body


def test_unknown_activity_id_returns_frozen_422_shape():
    _insert([_checkin(date(2026, 8, d)) for d in range(1, 8)])

    response = client.post(
        "/simulations",
        json={
            "user_id": "demo_stable",
            "activities": [{"activity_id": "skydiving", "duration_minutes": 30}],
            "label": "original_plan",
        },
    )

    assert response.status_code == 422
    body = response.json()
    assert body["status"] == "error"
    assert body["error_type"] == "validation_error"
    assert body["details"][0]["field"] == "activities[0].activity_id"
    assert "skydiving" in body["details"][0]["issue"]


def test_no_checkins_returns_404():
    response = client.post(
        "/simulations",
        json={"user_id": "unknown_user", "activities": [{"activity_id": "rest", "duration_minutes": 30}], "label": "plan"},
    )
    assert response.status_code == 404


def test_safety_blocked_returns_200_with_safety_result_and_no_scenario_computation():
    _insert([_checkin(date(2026, 8, d)) for d in range(1, 8)])

    app.dependency_overrides[get_default_safety_input] = lambda: SafetyInput(worsening_headache=True)
    try:
        response = client.post(
            "/simulations",
            json={
                "user_id": "demo_stable",
                "activities": [{"activity_id": "coding", "duration_minutes": 180}],
                "label": "original_plan",
            },
        )
    finally:
        app.dependency_overrides.pop(get_default_safety_input, None)

    assert response.status_code == 200
    body = response.json()

    # SafetyResult shape, not ScenarioResult shape.
    assert body["safety_state"] == "BLOCKED_RED_FLAG"
    assert body["downstream_allowed"] is False
    assert body["triggered_rule_ids"] == ["RF-001"]

    # Proves the Scenario Engine truly never ran.
    assert "modeled_demand" not in body
    assert "plan_recovery_alignment" not in body
    assert "simulation_id" not in body


def test_default_production_safety_input_still_allows_normal_flow():
    # Confirms the override above did not leak into a fresh, un-overridden
    # request - production construction (get_default_safety_input) is
    # unchanged and still results in SAFE / normal ScenarioResult.
    _insert([_checkin(date(2026, 8, d)) for d in range(1, 8)])

    response = client.post(
        "/simulations",
        json={"user_id": "demo_stable", "activities": [{"activity_id": "rest", "duration_minutes": 30}], "label": "plan"},
    )
    assert response.status_code == 200
    assert "simulation_id" in response.json()
