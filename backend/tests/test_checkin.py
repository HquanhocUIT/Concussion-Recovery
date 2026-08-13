"""Focused tests for the Check-in API (docs/contracts/track_a_contract.md §1.2, §1.5, §6).

Uses an isolated in-memory SQLite database via a `get_db` dependency
override — does not touch your configured Postgres.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.database import get_db
from app.main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _fresh_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def _valid_payload(**overrides):
    payload = {
        "user_id": "demo_stable",
        "checkin_date": "2026-08-12",
        "headache": 1,
        "dizziness": 0,
        "blurred_vision": 0,
        "nausea": 0,
        "concentration_difficulty": 1,
        "sleep_hours": 7.5,
        "sleep_quality": 2,
        "screen_time_minutes": 120,
        "study_work_minutes": 90,
        "symptoms_worsened_after_activity": "no",
        "mood": 2,
    }
    payload.update(overrides)
    return payload


def test_create_checkin_returns_201_and_created_status():
    resp = client.post("/check-ins", json=_valid_payload())
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "created"
    assert "checkin_id" in body and body["checkin_id"]


def test_same_day_resubmission_upserts_and_returns_200_updated():
    first = client.post("/check-ins", json=_valid_payload(headache=1))
    assert first.status_code == 201
    first_id = first.json()["checkin_id"]

    second = client.post("/check-ins", json=_valid_payload(headache=3))
    assert second.status_code == 200
    body = second.json()
    assert body["status"] == "updated"
    assert body["checkin_id"] == first_id

    listed = client.get("/check-ins", params={"user_id": "demo_stable"}).json()
    assert len(listed) == 1
    assert listed[0]["headache"] == 3


def test_out_of_range_symptom_scale_returns_frozen_422_shape():
    resp = client.post("/check-ins", json=_valid_payload(headache=4))
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == "error"
    assert body["error_type"] == "validation_error"
    assert isinstance(body["details"], list) and len(body["details"]) >= 1
    assert any("headache" in d["field"] for d in body["details"])


def test_unauthorized_field_is_rejected_not_silently_dropped():
    resp = client.post("/check-ins", json=_valid_payload(notes="should not be accepted"))
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == "error"
    assert body["error_type"] == "validation_error"


def test_contradictory_time_totals_rejected_with_exact_message():
    resp = client.post(
        "/check-ins",
        json=_valid_payload(screen_time_minutes=800, study_work_minutes=700, sleep_hours=8),
    )
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == "error"
    assert body["error_type"] == "validation_error"
    assert body["details"][0]["field"] == "screen_time_minutes,study_work_minutes,sleep_hours"
    assert "24 hours" in body["details"][0]["issue"]


def test_contradictory_check_fires_even_when_sleep_hours_is_null():
    resp = client.post(
        "/check-ins",
        json=_valid_payload(screen_time_minutes=800, study_work_minutes=700, sleep_hours=None),
    )
    assert resp.status_code == 422
    assert resp.json()["details"][0]["field"] == "screen_time_minutes,study_work_minutes,sleep_hours"


def test_valid_totals_at_boundary_are_accepted():
    resp = client.post(
        "/check-ins",
        json=_valid_payload(screen_time_minutes=480, study_work_minutes=480, sleep_hours=8),
    )
    assert resp.status_code == 201


def test_get_checkins_returns_most_recent_first():
    client.post("/check-ins", json=_valid_payload(checkin_date="2026-08-10"))
    client.post("/check-ins", json=_valid_payload(checkin_date="2026-08-12"))
    client.post("/check-ins", json=_valid_payload(checkin_date="2026-08-11"))

    resp = client.get("/check-ins", params={"user_id": "demo_stable"})
    assert resp.status_code == 200
    dates = [item["checkin_date"] for item in resp.json()]
    assert dates == ["2026-08-12", "2026-08-11", "2026-08-10"]


def test_future_checkin_date_is_rejected():
    resp = client.post("/check-ins", json=_valid_payload(checkin_date="2099-01-01"))
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == "error"
    assert body["error_type"] == "validation_error"
    assert any("checkin_date" in d["field"] for d in body["details"])


def test_mood_field_is_stored_and_returned_but_schema_marks_it_display_only():
    resp = client.post("/check-ins", json=_valid_payload(mood=3))
    assert resp.status_code == 201

    listed = client.get("/check-ins", params={"user_id": "demo_stable"}).json()
    assert listed[0]["mood"] == 3
    # NOTE: confirms storage/round-trip only. The "never used in scoring"
    # rule (E-008) has no scoring code to test against yet — re-verify once
    # trend_analysis.py exists.