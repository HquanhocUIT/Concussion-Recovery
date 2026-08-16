"""Check-in business-rule validation.

Implements docs/contracts/track_a_contract.md §1.5 (RE_ENTRY.md §42 —
Contradictory Data, resolved as Track A input-validation responsibility).

This is a pure arithmetic bound on fields already present in the frozen
daily_checkins schema — not a clinical judgment, not a new field.
"""
from app.schemas.checkin import ValidationErrorDetail

MINUTES_PER_DAY = 1440


class CheckinValidationError(Exception):
    """Raised for business-rule (not field-level) check-in validation failures.

    Carries `details` in the exact shape required by the frozen 422
    response contract (§6) — an exception handler in app/main.py converts
    this into that response.
    """

    def __init__(self, details: list[ValidationErrorDetail]):
        self.details = details
        super().__init__(details)


def check_contradictory_time_totals(
    screen_time_minutes: int,
    study_work_minutes: int,
    sleep_hours: float | None,
) -> None:
    """Reject a check-in whose self-reported time fields cannot fit in one day.

    Formula (frozen, §1.5):
        screen_time_minutes + study_work_minutes + (sleep_hours * 60, if provided) > 1440

    `sleep_hours` being None must NOT disable this check — only the sleep
    term is omitted; screen_time_minutes + study_work_minutes alone can
    still trigger it.
    """
    sleep_minutes = sleep_hours * 60 if sleep_hours is not None else 0
    total_minutes = screen_time_minutes + study_work_minutes + sleep_minutes

    if total_minutes > MINUTES_PER_DAY:
        raise CheckinValidationError(
            details=[
                ValidationErrorDetail(
                    field="screen_time_minutes,study_work_minutes,sleep_hours",
                    issue="Reported values for this day exceed 24 hours combined. Please review and resubmit.",
                )
            ]
        )