"""SQLAlchemy model for daily_checkins.

Field set, types, and constraints match docs/contracts/track_a_contract.md
§1.2 exactly. This module contains ONLY the ORM model — request/response
validation lives in app/schemas/checkin.py, not here.

Note: `user_id` is stored as a plain string column, not a hard foreign key,
unless your existing `users` table already enforces this at the DB level.
Adjust to a real ForeignKey("users.user_id") if that table exists in your repo.
"""
import uuid
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Float, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

SYMPTOM_WORSENED_VALUES = ("not_applicable", "no", "mild", "moderate", "severe")


class DailyCheckin(Base):
    __tablename__ = "daily_checkins"
    __table_args__ = (
        UniqueConstraint("user_id", "checkin_date", name="uq_daily_checkins_user_date"),
        CheckConstraint("headache BETWEEN 0 AND 3", name="ck_headache_range"),
        CheckConstraint("dizziness BETWEEN 0 AND 3", name="ck_dizziness_range"),
        CheckConstraint("blurred_vision BETWEEN 0 AND 3", name="ck_blurred_vision_range"),
        CheckConstraint("nausea BETWEEN 0 AND 3", name="ck_nausea_range"),
        CheckConstraint("concentration_difficulty BETWEEN 0 AND 3", name="ck_concentration_difficulty_range"),
        CheckConstraint("sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)", name="ck_sleep_hours_range"),
        CheckConstraint("sleep_quality IS NULL OR sleep_quality BETWEEN 0 AND 3", name="ck_sleep_quality_range"),
        CheckConstraint("screen_time_minutes >= 0", name="ck_screen_time_minutes_nonneg"),
        CheckConstraint("study_work_minutes >= 0", name="ck_study_work_minutes_nonneg"),
        CheckConstraint("mood IS NULL OR mood BETWEEN 0 AND 3", name="ck_mood_range"),
        CheckConstraint(
            "symptoms_worsened_after_activity IN ('not_applicable','no','mild','moderate','severe')",
            name="ck_symptoms_worsened_after_activity_enum",
        ),
    )

    checkin_id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    checkin_date: Mapped[date] = mapped_column(Date, nullable=False)

    headache: Mapped[int] = mapped_column(Integer, nullable=False)
    dizziness: Mapped[int] = mapped_column(Integer, nullable=False)
    blurred_vision: Mapped[int] = mapped_column(Integer, nullable=False)
    nausea: Mapped[int] = mapped_column(Integer, nullable=False)
    concentration_difficulty: Mapped[int] = mapped_column(Integer, nullable=False)

    sleep_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    sleep_quality: Mapped[int | None] = mapped_column(Integer, nullable=True)

    screen_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    study_work_minutes: Mapped[int] = mapped_column(Integer, nullable=False)

    symptoms_worsened_after_activity: Mapped[str] = mapped_column(String, nullable=False)

    # Display/context only — E-008. Must NEVER be read by trend_analysis.py,
    # activity_response.py, or any scoring/aggregation logic.
    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, onupdate=func.now())