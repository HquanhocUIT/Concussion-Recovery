import pytest
from datetime import date

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


def _checkin(
    checkin_date: date,
    symptom_level: int,
    screen_time: int = 60,
    study_work: int = 60,
) -> DailyCheckin:
    return DailyCheckin(
        checkin_id=f"chk-{checkin_date}",
        user_id="demo_stable",
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


def setup_function():
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def _insert(checkins: list[DailyCheckin]):
    db = TestingSessionLocal()

    try:
        db.add_all(checkins)
        db.commit()
    finally:
        db.close()


def test_recovery_profile_returns_trend_and_data_sufficiency():
    _insert(
        [
            _checkin(date(2026, 8, 1), 1),
            _checkin(date(2026, 8, 2), 1),
            _checkin(date(2026, 8, 3), 1),
            _checkin(date(2026, 8, 4), 1),
            _checkin(date(2026, 8, 5), 1),
            _checkin(date(2026, 8, 6), 1),
            _checkin(date(2026, 8, 7), 1),
        ]
    )

    response = client.get(
        "/recovery/profile/demo_stable"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["user_id"] == "demo_stable"
    assert body["window_days"] == 14
    assert body["checkin_count_in_window"] == 7
    assert body["trend"] == "stable"
    assert body["data_sufficiency"] == "moderate"
    assert body["uncertainty"] == "moderate"


def test_recovery_profile_includes_observed_activity_pattern():
    _insert(
        [
            _checkin(date(2026, 8, 1), 0, 60, 60),
            _checkin(date(2026, 8, 2), 1, 120, 120),
            _checkin(date(2026, 8, 3), 0, 60, 60),
            _checkin(date(2026, 8, 4), 1, 120, 120),
            _checkin(date(2026, 8, 5), 0, 60, 60),
            _checkin(date(2026, 8, 6), 1, 120, 120),
            _checkin(date(2026, 8, 7), 0, 60, 60),
            _checkin(date(2026, 8, 8), 1, 120, 120),
        ]
    )

    response = client.get(
        "/recovery/profile/demo_stable"
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body["observed_patterns"]) >= 1

    pattern = body["observed_patterns"][0]

    assert pattern["type"] == "activity_response"
    assert pattern["category"] == "user_specific_observed_pattern"
    assert pattern["activity_attributed"] is False
    assert pattern["supporting_days"] >= 3


def test_recovery_profile_excludes_old_checkins_from_window():
    _insert(
        [
            _checkin(date(2026, 7, 1), 3),
            _checkin(date(2026, 8, 10), 1),
            _checkin(date(2026, 8, 11), 1),
            _checkin(date(2026, 8, 12), 1),
        ]
    )

    response = client.get(
        "/recovery/profile/demo_stable"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["checkin_count_in_window"] == 3


def test_recovery_profile_returns_404_without_checkins():
    response = client.get(
        "/recovery/profile/unknown_user"
    )

    assert response.status_code == 404


def test_recovery_profile_contains_limitations():
    _insert(
        [
            _checkin(date(2026, 8, 10), 1),
            _checkin(date(2026, 8, 11), 1),
            _checkin(date(2026, 8, 12), 1),
        ]
    )

    response = client.get(
        "/recovery/profile/demo_stable"
    )

    assert response.status_code == 200

    body = response.json()

    assert len(body["limitations"]) >= 1
    assert any(
        "clinical" in limitation.lower()
        for limitation in body["limitations"]
    )