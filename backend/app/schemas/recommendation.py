"""Contracts for Track B planning and explainable recommendations."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.safety import SafetyInput
from app.schemas.simulation import ActivityInput, ModeledDemand, ScenarioResult


Audience = Literal["general", "adult", "pediatric", "sport"]
AlternativeStrategy = Literal["remove_activity", "reduce_duration", "postpone_activity"]


class RecommendationRequest(BaseModel):
    scenario_result: ScenarioResult
    activities: list[ActivityInput] = Field(min_length=1)
    safety_input: SafetyInput = Field(default_factory=SafetyInput)
    audience: Audience = "general"
    option_count: int = Field(default=3, ge=2, le=3)


class PlanAlternative(BaseModel):
    alternative_id: str
    strategy: AlternativeStrategy
    title: str
    rationale: str
    tradeoff: str
    activities: list[ActivityInput]
    postponed_activity: ActivityInput | None = None
    modeled_demand: ModeledDemand
    improvement_score: float


class PlannerResult(BaseModel):
    modeled_overload: bool
    alternatives: list[PlanAlternative]


class EvidenceCitation(BaseModel):
    excerpt: str
    citation: str
    source_id: str
    source_title: str
    canonical_url: str
    page: int
    section: str
    relevance_score: float


class RecommendationOption(BaseModel):
    alternative: PlanAlternative
    explanation: str
    evidence: list[EvidenceCitation]


class RecommendationResponse(BaseModel):
    status: Literal["recommendations_ready", "no_change_needed"]
    summary: str
    options: list[RecommendationOption]
    confidence_score: float = Field(ge=0, le=1)
    confidence_label: Literal["limited", "moderate", "high"]
    model_used: str
    limitations: list[str]
    disclaimer: str
