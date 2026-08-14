from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models.checkin import DailyCheckin


engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


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


def _checkin(
    checkin_date: date,
    symptom_level: int,
    screen_time: int = 60,
    study_work: int = 60,
) -> DailyCheckin:
    return DailyCheckin(
        checkin_id=f"scenario-{checkin_date}",
        user_id="demo_scenario",
        checkin_date=checkin_date,
        headache=symptom_level,
        dizziness=0,
        blurred_vision=0,
        nausea=0,
        concentration_difficulty=0,
        sleep_hours=8,
        sleep_quality=2,
        screen_time_minutes=screen_time,
        study_work_minutes=study_work,
        symptoms_worsened_after_activity="no",
        mood=3,
    )


def _insert(checkins: list[DailyCheckin]):
    db = TestingSessionLocal()

    try:
        db.add_all(checkins)
        db.commit()
    finally:
        db.close()


def test_scenario_api_returns_structured_result():
    _insert(
        [
            _checkin(date(2026, 8, 1), 1),
            _checkin(date(2026, 8, 2), 1),
            _checkin(date(2026, 8, 3), 1),
        ]
    )

    response = client.post(
        "/recovery/scenario/demo_scenario",
        json={
            "screen_time_minutes": 120,
            "study_work_minutes": 90,
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["user_id"] == "demo_scenario"
    assert body["baseline_screen_time_minutes"] == 60
    assert body["baseline_study_work_minutes"] == 60
    assert body["scenario_screen_time_minutes"] == 120
    assert body["scenario_study_work_minutes"] == 90
    assert body["interpretation"] == "higher_exposure"
    assert body["activity_attributed"] is False
    assert "limitations" in body


def test_scenario_api_returns_404_without_checkins():
    response = client.post(
        "/recovery/scenario/unknown_user",
        json={
            "screen_time_minutes": 120,
            "study_work_minutes": 60,
        },
    )

    assert response.status_code == 404


def test_scenario_api_rejects_negative_exposure():
    response = client.post(
        "/recovery/scenario/demo_scenario",
        json={
            "screen_time_minutes": -10,
            "study_work_minutes": 60,
        },
    )

    assert response.status_code == 422