from typing import Literal

from pydantic import BaseModel, Field


ActivityType = Literal[
    "cognitive",
    "physical",
    "screen",
    "social",
    "rest",
    "commute",
    "academic",
]


class ActivityCatalogItem(BaseModel):
    activity_id: str
    activity_type: ActivityType

    cognitive_demand_weight: int = Field(ge=0, le=100)
    physical_demand_weight: int = Field(ge=0, le=100)
    screen_exposure_weight: int = Field(ge=0, le=100)
    recovery_opportunity: int = Field(ge=0, le=100)