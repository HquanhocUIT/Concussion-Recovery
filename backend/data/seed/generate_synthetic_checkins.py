"""Synthetic check-in data generator for Track A demo personas.

Generates deterministic, contract-valid daily_checkins for the four
frozen demo personas (docs/contracts/track_a_contract.md §5):
    demo_improving, demo_stable, demo_overload, demo_insufficient_data

Every record is validated through CheckinCreate before being written to
the database - a record that fails validation raises immediately and
aborts the whole run (no silent skipping).

This script is idempotent: re-running it deletes and re-inserts ONLY
the rows belonging to the four demo user_ids above via user_id.in_(...)
filters - it never touches any other user's data.

Design rationale (see Phase 2 Data Design Report):
- Only the most recent 14 days before the latest check-in date actually
  drive trend/data_sufficiency/activity_response (see
  app/recovery/trend_analysis.py, app/recovery/profile.py). The last 14
  days of each active persona's history are therefore engineered exactly
  to produce the intended classification; everything older is a smooth,
  realistic narrative that is NOT read by any scoring logic today, but
  gives GET /check-ins a real multi-month history to display.
- No new clinical thresholds, fields, or rules are introduced anywhere
  in this file - only data that must pass the already-frozen
  CheckinCreate contract.

Usage:
    python data/seed/generate_synthetic_checkins.py
    python data/seed/generate_synthetic_checkins.py --db-url sqlite:///./somewhere_else.db
"""
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# Allow running as a plain script regardless of current working directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.db.database import Base  # noqa: E402
from app.models.checkin import DailyCheckin  # noqa: E402
from app.models.user import User  # noqa: E402
from app.schemas.checkin import CheckinCreate  # noqa: E402

# Fixed anchor date for full reproducibility: every run produces byte-
# identical dates, not "relative to today". Safe against the
# checkin_date-cannot-be-future validator as long as this date is not
# after the real calendar date when the script is actually run.
ANCHOR_DATE = date(2026, 8, 18)

SYMPTOM_FIELDS = ["headache", "dizziness", "blurred_vision", "nausea", "concentration_difficulty"]

DEMO_USERS = [
    ("demo_improving", "Demo — Improving", "improving"),
    ("demo_stable", "Demo — Stable", "stable"),
    ("demo_overload", "Demo — Overload", "overload"),
    ("demo_insufficient_data", "Demo — Insufficient Data", "insufficient_data"),
]


def distribute_burden(burden: int) -> dict[str, int]:
    """Distribute a target symptom-burden total across the five approved
    0-3 symptom fields (mood excluded, per E-008).

    This is purely a data-generation detail for constructing a record
    whose SUM matches a target value used in the trend calculation - it
    is not a new clinical rule or scoring change.
    """
    if not 0 <= burden <= 15:
        raise ValueError(f"burden {burden} out of representable range 0-15")
    values: dict[str, int] = {}
    remaining = burden
    for field in SYMPTOM_FIELDS:
        take = min(3, remaining)
        values[field] = take
        remaining -= take
    return values


@dataclass
class DayPlan:
    checkin_date: date
    burden: int
    screen_time_minutes: int
    study_work_minutes: int
    symptoms_worsened_after_activity: str = "no"


def _build_stable(anchor: date, days: int = 134) -> list[DayPlan]:
    """Full history alternates burden [4,5] every day - genuinely flat
    for months. Fixed screen/study time -> no accidental activity-
    response pattern (exposure never increases day-over-day)."""
    plans = []
    for i in range(days):
        d = anchor - timedelta(days=days - 1 - i)
        burden = 4 if i % 2 == 0 else 5
        plans.append(DayPlan(d, burden, 90, 90))
    return plans


def _build_improving(anchor: date, days: int = 134) -> list[DayPlan]:
    """Last 14 days engineered exactly for calculate_trend() to classify
    'improving' (later-7 avg - earlier-7 avg <= -1). Earlier days are a
    smooth linear lead-in, narrative only - not read by scoring logic."""
    tail = [8, 8, 7, 7, 6, 6, 6, 3, 3, 2, 2, 1, 1, 1]
    assert len(tail) == 14
    plans = []
    pre_window_len = days - 14
    for i in range(pre_window_len):
        d = anchor - timedelta(days=days - 1 - i)
        burden = round(14 - (14 - tail[0]) * i / max(pre_window_len - 1, 1))
        plans.append(DayPlan(d, burden, 90, 90))
    for offset, burden in enumerate(tail):
        d = anchor - timedelta(days=13 - offset)
        plans.append(DayPlan(d, burden, 90, 90))
    return plans


def _build_overload(anchor: date, days: int = 134) -> list[DayPlan]:
    """Last 14 days alternate baseline/exposure days with an increasing
    trend, engineered to satisfy BOTH calculate_trend() (worsening,
    later-7 avg - earlier-7 avg >= 1) AND
    find_activity_response_pattern() (>=3 qualifying consecutive-day
    pairs where the exposure day has higher screen/study time AND
    higher symptom burden than the immediately preceding day).
    Earlier days are a mild, fixed-exposure stable period ('this user
    was doing fine for months, then recently regressed') - narrative
    only, and deliberately fixed-exposure so it contributes zero
    qualifying pairs of its own.
    """
    tail_burden = [0, 1, 1, 2, 1, 2, 2, 3, 2, 3, 3, 4, 3, 4]
    assert len(tail_burden) == 14
    plans = []
    pre_window_len = days - 14
    for i in range(pre_window_len):
        d = anchor - timedelta(days=days - 1 - i)
        burden = 1 if i % 2 == 0 else 2
        plans.append(DayPlan(d, burden, 70, 70))
    for offset, burden in enumerate(tail_burden):
        d = anchor - timedelta(days=13 - offset)
        is_exposure_day = offset % 2 == 1  # tail starts on a baseline day
        screen = 120 if is_exposure_day else 60
        study = 120 if is_exposure_day else 60
        worsened = "moderate" if is_exposure_day else "no"
        plans.append(DayPlan(d, burden, screen, study, worsened))
    return plans


def _build_insufficient(anchor: date) -> list[DayPlan]:
    """Exactly 2 records - by definition of this persona, cannot be
    inflated without breaking its entire purpose."""
    return [
        DayPlan(anchor - timedelta(days=1), 2, 60, 60),
        DayPlan(anchor, 3, 60, 60),
    ]


def _persona_day_plans() -> dict[str, list[DayPlan]]:
    return {
        "demo_improving": _build_improving(ANCHOR_DATE),
        "demo_stable": _build_stable(ANCHOR_DATE),
        "demo_overload": _build_overload(ANCHOR_DATE),
        "demo_insufficient_data": _build_insufficient(ANCHOR_DATE),
    }


def build_validated_records() -> dict[str, list[CheckinCreate]]:
    """Build every record and validate it through CheckinCreate.

    Raises (via Pydantic ValidationError, uncaught) on the first invalid
    record - there is no silent-skip path.
    """
    result: dict[str, list[CheckinCreate]] = {}
    for user_id, day_plans in _persona_day_plans().items():
        validated: list[CheckinCreate] = []
        for plan in day_plans:
            payload = {
                "user_id": user_id,
                "checkin_date": plan.checkin_date,
                **distribute_burden(plan.burden),
                "sleep_hours": 7.5,
                "sleep_quality": 2,
                "screen_time_minutes": plan.screen_time_minutes,
                "study_work_minutes": plan.study_work_minutes,
                "symptoms_worsened_after_activity": plan.symptoms_worsened_after_activity,
                "mood": 2,
            }
            validated.append(CheckinCreate(**payload))
        result[user_id] = validated
    return result


def seed_database(db_url: str) -> dict[str, int]:
    """Seed the four demo users and their check-ins into db_url.

    Idempotent: deletes only rows for the four demo user_ids first, then
    inserts fresh - safe to re-run, never touches other users' data.
    Wrapped in a transaction: any failure rolls back the whole batch.
    """
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, connect_args=connect_args)
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine, autoflush=False, autocommit=False)()

    try:
        records_by_user = build_validated_records()
        demo_user_ids = list(records_by_user.keys())

        session.query(DailyCheckin).filter(DailyCheckin.user_id.in_(demo_user_ids)).delete(synchronize_session=False)
        session.query(User).filter(User.user_id.in_(demo_user_ids)).delete(synchronize_session=False)

        now = datetime.now(timezone.utc)
        for user_id, display_name, persona_type in DEMO_USERS:
            session.add(User(user_id=user_id, display_name=display_name, persona_type=persona_type, created_at=now))

        counts: dict[str, int] = {}
        for user_id, validated_records in records_by_user.items():
            for record in validated_records:
                session.add(
                    DailyCheckin(
                        user_id=record.user_id,
                        checkin_date=record.checkin_date,
                        headache=record.headache,
                        dizziness=record.dizziness,
                        blurred_vision=record.blurred_vision,
                        nausea=record.nausea,
                        concentration_difficulty=record.concentration_difficulty,
                        sleep_hours=record.sleep_hours,
                        sleep_quality=record.sleep_quality,
                        screen_time_minutes=record.screen_time_minutes,
                        study_work_minutes=record.study_work_minutes,
                        symptoms_worsened_after_activity=record.symptoms_worsened_after_activity.value,
                        mood=record.mood,
                    )
                )
            counts[user_id] = len(validated_records)

        session.commit()
        return counts
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Track A synthetic demo check-in data.")
    parser.add_argument(
        "--db-url",
        default=None,
        help="Override target database URL. Defaults to app.db.database's configured DATABASE_URL.",
    )
    args = parser.parse_args()

    if args.db_url:
        db_url = args.db_url
    else:
        from app.db.database import DATABASE_URL

        db_url = DATABASE_URL

    counts = seed_database(db_url)
    total = sum(counts.values())
    print(f"Seeded {total} check-in records into {db_url}")
    for user_id, count in counts.items():
        print(f"  {user_id}: {count}")


if __name__ == "__main__":
    main()
