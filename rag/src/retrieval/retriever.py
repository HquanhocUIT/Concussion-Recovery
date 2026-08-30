from __future__ import annotations

from typing import Any

from src.retrieval.audience import Audience, CHROMA_AUDIENCE_VALUES, audience_matches
from src.retrieval.reranker import CrossEncoderReranker, rerank


class EvidenceRetriever:
    def __init__(self, vector_store, candidate_k: int = 20, reranker=None):
        self.vector_store = vector_store
        self.candidate_k = candidate_k
        self.reranker = reranker

    def retrieve(
        self,
        decision: str,
        top_k: int = 5,
        audience: Audience | str | None = None,
    ) -> list[dict[str, Any]]:
        if not decision or len(decision.strip()) < 3:
            raise ValueError("decision must contain at least 3 characters")
        if top_k < 1:
            raise ValueError("top_k must be positive")

        if isinstance(audience, str):
            audience = Audience(audience)
        candidate_k = max(self.candidate_k, top_k)
        metadata_filter = None
        if audience is not None and audience is not Audience.GENERAL:
            metadata_filter = {"audience": CHROMA_AUDIENCE_VALUES[audience]}
        candidates = self.vector_store.query(
            decision, top_k=candidate_k, metadata_filter=metadata_filter
        )
        if audience is not None and audience is not Audience.GENERAL:
            candidates = [
                candidate
                for candidate in candidates
                if audience_matches(
                    audience, str(candidate.get("metadata", {}).get("audience", ""))
                )
                is True
            ]
            if not candidates:
                return []
        cross_scores = self.reranker.score(decision, candidates) if self.reranker else None
        return rerank(
            decision,
            candidates,
            top_k=top_k,
            audience=audience,
            cross_encoder_scores=cross_scores,
        )
