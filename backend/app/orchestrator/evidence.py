"""HTTP adapter for the isolated RAG evidence service."""

from __future__ import annotations

import os
from typing import Any

import httpx

from app.schemas.recommendation import EvidenceCitation


class RagEvidenceClient:
    def __init__(self, base_url: str | None = None, timeout_seconds: float = 20.0):
        self.base_url = (base_url or os.getenv("RAG_SERVICE_URL", "http://localhost:8100")).rstrip("/")
        self.timeout_seconds = timeout_seconds

    def retrieve(self, query: str, audience: str, top_k: int = 2) -> list[EvidenceCitation]:
        response = httpx.get(
            f"{self.base_url}/retrieve",
            params={"q": query, "audience": audience, "top_k": top_k},
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        return [self._validated_citation(item) for item in response.json()]

    @staticmethod
    def _validated_citation(item: dict[str, Any]) -> EvidenceCitation:
        metadata = item.get("metadata") or {}
        required = ("source_id", "title", "canonical_url", "page", "section")
        missing = [field for field in required if metadata.get(field) in (None, "")]
        if missing or not item.get("citation") or not item.get("text"):
            raise ValueError(f"RAG result is not citation-complete: {', '.join(missing)}")
        return EvidenceCitation(
            excerpt=str(item["text"]),
            citation=str(item["citation"]),
            source_id=str(metadata["source_id"]),
            source_title=str(metadata["title"]),
            canonical_url=str(metadata["canonical_url"]),
            page=int(metadata["page"]),
            section=str(metadata["section"]),
            relevance_score=float(item.get("rerank_score", item.get("score", 0.0))),
        )


def evidence_query(strategy: str, title: str) -> str:
    topics = {
        "remove_activity": "temporarily reduce demanding activity after concussion gradual return",
        "reduce_duration": "shorter activity blocks pacing breaks symptom limited return concussion",
        "postpone_activity": "postpone demanding activity gradual return to activity concussion",
    }
    return f"{topics[strategy]} {title}"
