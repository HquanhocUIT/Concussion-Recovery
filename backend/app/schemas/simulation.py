from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


MainConcern = Literal[
    "high_cognitive_demand",
    "high_physical_demand",
    "high_screen_exposure",
    "no_declared_recovery_activity_in_plan",
    "long_continuous_block",
    "insufficient_data",
]


class ActivityInput(BaseModel):
    activity_id: str
    duration_minutes: int = Field(gt=0)


class SimulationRequest(BaseModel):
    user_id: str
    activities: list[ActivityInput] = Field(min_length=1)
    label: str


class ModeledDemand(BaseModel):
    cognitive_demand_level: Literal[
        "low",
        "medium",
        "high",
    ]

    physical_demand_level: Literal[
        "low",
        "medium",
        "high",
    ]

    screen_exposure_level: Literal[
        "low",
        "medium",
        "high",
    ]

    recovery_opportunity_level: Literal[
        "low",
        "medium",
        "high",
    ]


class ExplanationFactor(BaseModel):
    factor: str

    category: Literal[
        "clinical_evidence",
        "user_specific_observed_pattern",
        "engineering_model_inference",
    ]

    direction: Literal[
        "increases_concern",
        "decreases_concern",
        "neutral_context",
    ]

    description: str

    activity_attributed: bool | None = None


class ScenarioResult(BaseModel):
    simulation_id: str
    user_id: str
    created_at: datetime

    recovery_state_snapshot: dict

    modeled_demand: ModeledDemand

    plan_recovery_alignment: Literal[
        "good_alignment",
        "moderate_concern",
        "low_alignment",
        "insufficient_data_to_assess",
    ]

    modeled_overload: bool

    main_concerns: list[MainConcern]

    explanation_factors: list[ExplanationFactor]

    uncertainty: Literal[
        "low",
        "moderate",
        "high",
    ]

    data_sufficiency: Literal[
        "insufficient",
        "limited",
        "moderate",
        "strong",
    ]

    limitations: list[str]