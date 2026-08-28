from datetime import date, datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models.checkin import DailyCheckin
from app.models.simulation_history import SimulationHistory


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


def _insert_history(
    simulation_id: str,
    user_id: str,
    label: str,
    created_at: datetime,
):
    db = TestingSessionLocal()

    try:
        item = SimulationHistory(
            simulation_id=simulation_id,
            user_id=user_id,
            label=label,
            created_at=created_at,
            result_json='{"test": "result"}',
        )

        db.add(item)
        db.commit()

    finally:
        db.close()


def test_history_returns_empty_list_for_user_without_simulations():
    response = client.get(
        "/simulations/history/unknown_user"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_history_returns_only_requested_user_simulations():
    now = datetime.now(timezone.utc)

    _insert_history(
        simulation_id="simulation-user-a",
        user_id="user_a",
        label="User A plan",
        created_at=now,
    )

    _insert_history(
        simulation_id="simulation-user-b",
        user_id="user_b",
        label="User B plan",
        created_at=now,
    )

    response = client.get(
        "/simulations/history/user_a"
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body) == 1
    assert body[0]["simulation_id"] == "simulation-user-a"
    assert body[0]["user_id"] == "user_a"
    assert body[0]["label"] == "User A plan"


def test_history_returns_newest_simulation_first():
    now = datetime.now(timezone.utc)

    _insert_history(
        simulation_id="older-simulation",
        user_id="demo_user",
        label="Older plan",
        created_at=now,
    )

    _insert_history(
        simulation_id="newer-simulation",
        user_id="demo_user",
        label="Newer plan",
        created_at=now + timedelta(minutes=5),
    )

    response = client.get(
        "/simulations/history/demo_user"
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body) == 2
    assert body[0]["simulation_id"] == "newer-simulation"
    assert body[1]["simulation_id"] == "older-simulation"


def test_history_returns_saved_result_json():
    now = datetime.now(timezone.utc)

    db = TestingSessionLocal()

    try:
        item = SimulationHistory(
            simulation_id="simulation-with-result",
            user_id="demo_user",
            label="Test plan",
            created_at=now,
            result_json='{"simulation_id": "simulation-with-result", "modeled_overload": false}',
        )

        db.add(item)
        db.commit()

    finally:
        db.close()

    response = client.get(
        "/simulations/history/demo_user"
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body) == 1

    assert body[0]["result"]["simulation_id"] == (
        "simulation-with-result"
    )

    assert body[0]["result"]["modeled_overload"] is False

def test_successful_simulation_is_saved_to_history():
    from datetime import date

    db = TestingSessionLocal()

    try:
        checkins = []

        for day in range(1, 8):
            checkins.append(
                DailyCheckin(
                    checkin_id=f"history-checkin-{day}",
                    user_id="history_user",
                    checkin_date=date(2026, 8, day),
                    headache=1,
                    dizziness=0,
                    blurred_vision=0,
                    nausea=0,
                    concentration_difficulty=0,
                    sleep_hours=8,
                    sleep_quality=2,
                    screen_time_minutes=60,
                    study_work_minutes=60,
                    symptoms_worsened_after_activity="no",
                    mood=3,
                )
            )

        db.add_all(checkins)
        db.commit()

    finally:
        db.close()

    # Create a real simulation
    simulation_response = client.post(
        "/simulations",
        json={
            "user_id": "history_user",
            "activities": [
                {
                    "activity_id": "coding",
                    "duration_minutes": 60,
                }
            ],
            "label": "History integration test",
        },
    )

    assert simulation_response.status_code == 200

    simulation_body = simulation_response.json()

    simulation_id = simulation_body["simulation_id"]

    # Fetch history
    history_response = client.get(
        "/simulations/history/history_user"
    )

    assert history_response.status_code == 200

    history_body = history_response.json()

    assert len(history_body) == 1

    history_item = history_body[0]

    assert history_item["simulation_id"] == simulation_id

    assert history_item["user_id"] == "history_user"

    assert history_item["label"] == (
        "History integration test"
    )

    assert (
        history_item["result"]["simulation_id"]
        == simulation_id
    )