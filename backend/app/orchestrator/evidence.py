"""HTTP adapter for the isolated RAG evidence service."""

from __future__ import annotations

import os
import time
from typing import Any

import httpx

from app.schemas.recommendation import EvidenceCitation


class RagEvidenceClient:
    """HTTP client for the RAG service, tolerant of a sleeping instance.

    A free-tier container that has been idle takes measurable time to come
    back: /ready was observed at 22.9s and the first /retrieve at ~40s. Fixed
    2s retries gave up well inside that window, so the backend reported a
    wakeup as a failure. The delays below back off 2s, 4s, 8s, 16s, 32s —
    about 62s of total waiting, which covers the observed range.
    """

    def __init__(
        self,
        base_url: str | None = None,
        timeout_seconds: float = 60.0,
        max_attempts: int = 5,
        retry_delay_seconds: float = 2.0,
    ):
        self.base_url = (base_url or os.getenv("RAG_SERVICE_URL", "http://localhost:8100")).rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.max_attempts = max_attempts
        self.retry_delay_seconds = retry_delay_seconds

    def retrieve(self, query: str, audience: str, top_k: int = 2) -> list[EvidenceCitation]:
        last_error: Exception | None = None

        # A sleeping instance rejects the first call or two with 502/503 while
        # the container restarts, then serves normally. Without a retry those
        # transient failures reached the user as "no guideline evidence found".
        for attempt in range(self.max_attempts):
            try:
                response = httpx.get(
                    f"{self.base_url}/retrieve",
                    params={"q": query, "audience": audience, "top_k": top_k},
                    timeout=self.timeout_seconds,
                )
                response.raise_for_status()
                return [self._validated_citation(item) for item in response.json()]
            except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
                last_error = exc
                if attempt < self.max_attempts - 1:
                    time.sleep(self.retry_delay_seconds * (2**attempt))

        raise last_error if last_error else RuntimeError("RAG retrieval failed")

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
