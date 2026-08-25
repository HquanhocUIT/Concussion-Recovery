from datetime import date
from typing import Literal

from pydantic import BaseModel


class ObservedPattern(BaseModel):
    pattern_id: str
    type: str

    category: Literal[
        "user_specific_observed_pattern"
    ]

    description: str

    strength: Literal[
        "weak",
        "moderate",
        "strong",
    ]

    basis: str
    supporting_days: int
    activity_attributed: bool


class RecoveryState(BaseModel):
    user_id: str
    as_of_date: str
    window_days: int
    checkin_count_in_window: int

    trend: Literal[
        "improving",
        "stable",
        "worsening",
        "insufficient_data",
    ]

    data_sufficiency: Literal[
        "insufficient",
        "limited",
        "moderate",
        "strong",
    ]

    uncertainty: Literal[
        "low",
        "moderate",
        "high",
    ]

    observed_patterns: list[ObservedPattern]

    limitations: list[str]


class RecoveryProfileResponse(BaseModel):
    user_id: str
    as_of_date: date
    window_days: int
    checkin_count_in_window: int

    trend: Literal[
        "improving",
        "stable",
        "worsening",
        "insufficient_data",
    ]

    data_sufficiency: Literal[
        "insufficient",
        "limited",
        "moderate",
        "strong",
    ]

    uncertainty: Literal[
        "low",
        "moderate",
        "high",
    ]

    observed_patterns: list[ObservedPattern]

    limitations: list[str]