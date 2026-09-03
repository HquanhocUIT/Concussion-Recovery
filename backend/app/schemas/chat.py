"""Contracts for the evidence-grounded guideline chat assistant."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.recommendation import Audience, EvidenceCitation
from app.schemas.safety import SafetyInput


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    audience: Audience = "general"
    safety_input: SafetyInput = Field(default_factory=SafetyInput)


class ChatResponse(BaseModel):
    # "no_evidence_found" means the corpus genuinely had nothing above the
    # relevance threshold. "evidence_unavailable" means the retrieval service
    # could not be reached at all — a very different thing to tell a user, and
    # previously indistinguishable because both returned an empty citation list.
    status: Literal["answered", "no_evidence_found", "evidence_unavailable"]
    answer: str
    citations: list[EvidenceCitation]
    model_used: str
    disclaimer: str
