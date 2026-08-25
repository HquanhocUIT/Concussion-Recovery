"""Tests for the Track A synthetic check-in data generator.

Verifies:
- exact record count and per-persona distribution
- every generated record passes CheckinCreate (already enforced by the
  generator itself, re-asserted here as a regression guard)
- actual persona behavior via the REAL Recovery Intelligence functions
  (analyze_trend / build_recovery_profile / find_activity_response_pattern),
  not hand-derived assumptions
- reproducibility (identical seed -> identical dataset)
- generator does not affect any other existing test/behavior

Uses an isolated, temporary SQLite database - never touches the
configured production/demo DATABASE_URL from app.db.database.
"""
from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.models.checkin import DailyCheckin
from app.models.user import User
from app.recovery.profile import build_recovery_profile
from app.schemas.checkin import CheckinCreate
from data.seed.generate_synthetic_checkins import (
    ANCHOR_DATE,
    build_validated_records,
    seed_database,
)

EXPECTED_COUNTS = {
    "demo_improving": 134,
    "demo_stable": 134,
    "demo_overload": 134,
    "demo_insufficient_data": 2,
}


@pytest.fixture
def seeded_engine(tmp_path):
    """Seed a throwaway SQLite file DB (not the shared production one)."""
    db_path = tmp_path / "synthetic_test.db"
    db_url = f"sqlite:///{db_path}"
    seed_database(db_url)

    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    yield engine
    engine.dispose()


def test_generator_produces_exactly_404_records_total():
    records_by_user = build_validated_records()
    total = sum(len(records) for records in records_by_user.values())
    assert total == 404


def test_generator_produces_correct_per_persona_distribution():
    records_by_user = build_validated_records()
    counts = {user_id: len(records) for user_id, records in records_by_user.items()}
    assert counts == EXPECTED_COUNTS


def test_all_generated_records_are_valid_checkin_create_instances():
    # build_validated_records() already constructs every record via
    # CheckinCreate (raises on failure) - this test re-asserts the type
    # as a regression guard against a future refactor accidentally
    # bypassing validation.
    records_by_user = build_validated_records()
    for user_id, records in records_by_user.items():
        for record in records:
            assert isinstance(record, CheckinCreate)
            assert record.user_id == user_id
            assert record.checkin_date <= date.today()


def test_seed_database_inserts_expected_row_counts(seeded_engine):
    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        assert db.query(User).count() == 4
        assert db.query(DailyCheckin).count() == 404
        for user_id, expected_count in EXPECTED_COUNTS.items():
            actual = db.query(DailyCheckin).filter(DailyCheckin.user_id == user_id).count()
            assert actual == expected_count, f"{user_id}: expected {expected_count}, got {actual}"
    finally:
        db.close()


def test_seed_database_is_idempotent(seeded_engine):
    # seeded_engine fixture already ran seed_database once via seed_database(db_url).
    # Run it again against the SAME db_url and confirm counts don't double.
    db_url = str(seeded_engine.url)
    seed_database(db_url)

    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        assert db.query(User).count() == 4
        assert db.query(DailyCheckin).count() == 404
    finally:
        db.close()


def _profile_for(db, user_id):
    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user_id)
        .order_by(DailyCheckin.checkin_date.asc())
        .all()
    )
    as_of_date = max(c.checkin_date for c in checkins)
    return build_recovery_profile(user_id=user_id, checkins=checkins, as_of_date=as_of_date)


def test_demo_improving_actually_classifies_as_improving(seeded_engine):
    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        profile = _profile_for(db, "demo_improving")
        assert profile.trend == "improving"
        assert profile.data_sufficiency == "strong"
    finally:
        db.close()


def test_demo_stable_actually_classifies_as_stable(seeded_engine):
    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        profile = _profile_for(db, "demo_stable")
        assert profile.trend == "stable"
        assert profile.data_sufficiency == "strong"
    finally:
        db.close()


def test_demo_overload_actually_classifies_as_worsening_with_activity_response_pattern(seeded_engine):
    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        profile = _profile_for(db, "demo_overload")
        assert profile.trend == "worsening"
        assert profile.data_sufficiency == "strong"
        assert len(profile.observed_patterns) == 1
        pattern = profile.observed_patterns[0]
        assert pattern.type == "activity_response"
        assert pattern.supporting_days >= 3
        assert pattern.activity_attributed is False  # matches current activity_response.py behavior
    finally:
        db.close()


def test_demo_insufficient_data_actually_classifies_as_insufficient(seeded_engine):
    Session = sessionmaker(bind=seeded_engine)
    db = Session()
    try:
        profile = _profile_for(db, "demo_insufficient_data")
        assert profile.trend == "insufficient_data"
        assert profile.data_sufficiency == "insufficient"
        assert profile.checkin_count_in_window == 2
    finally:
        db.close()


def test_seed_reproducible_across_independent_runs(tmp_path):
    db_url_a = f"sqlite:///{tmp_path / 'run_a.db'}"
    db_url_b = f"sqlite:///{tmp_path / 'run_b.db'}"

    counts_a = seed_database(db_url_a)
    counts_b = seed_database(db_url_b)

    assert counts_a == counts_b == EXPECTED_COUNTS

    records_a = build_validated_records()
    records_b = build_validated_records()
    for user_id in EXPECTED_COUNTS:
        dates_a = [r.checkin_date for r in records_a[user_id]]
        dates_b = [r.checkin_date for r in records_b[user_id]]
        burdens_a = [
            r.headache + r.dizziness + r.blurred_vision + r.nausea + r.concentration_difficulty
            for r in records_a[user_id]
        ]
        burdens_b = [
            r.headache + r.dizziness + r.blurred_vision + r.nausea + r.concentration_difficulty
            for r in records_b[user_id]
        ]
        assert dates_a == dates_b
        assert burdens_a == burdens_b


def test_anchor_date_is_not_in_the_future():
    assert ANCHOR_DATE <= date.today()
