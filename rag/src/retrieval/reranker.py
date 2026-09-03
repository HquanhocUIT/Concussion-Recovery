from __future__ import annotations

import re
import logging
from math import exp
from typing import Any

from src.retrieval.audience import Audience, audience_matches


logger = logging.getLogger(__name__)


TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
STOPWORDS = {
    "a", "an", "and", "after", "are", "for", "from", "how", "in", "is",
    "of", "or", "the", "to", "what", "when", "why", "with",
}


def _tokens(text: str) -> set[str]:
    return {token for token in TOKEN_PATTERN.findall(text.lower()) if token not in STOPWORDS}


def rerank(
    query: str,
    candidates: list[dict[str, Any]],
    top_k: int = 5,
    audience: Audience | None = None,
    cross_encoder_scores: list[float] | None = None,
) -> list[dict[str, Any]]:
    """Re-rank semantic candidates using lexical evidence and scope metadata."""
    query_tokens = _tokens(query)
    ranked: list[dict[str, Any]] = []

    for index, candidate in enumerate(candidates):
        metadata = candidate.get("metadata", {})
        text_tokens = _tokens(candidate.get("text", ""))
        overlap = len(query_tokens & text_tokens) / max(len(query_tokens), 1)
        semantic_score = float(candidate.get("score", 0.0))
        section = str(metadata.get("section", "")).lower()
        reference_penalty = 0.18 if "reference" in section or "bibliography" in section else 0.0

        audience_match = audience_matches(audience, str(metadata.get("audience", "")))
        audience_bonus = 0.08 if audience_match is True else 0.0
        audience_penalty = 0.12 if audience_match is False else 0.0
        cross_score = cross_encoder_scores[index] if cross_encoder_scores else None

        hybrid_score = (
            0.72 * semantic_score + 0.28 * overlap
            + audience_bonus
            - audience_penalty
            - reference_penalty
        )
        rerank_score = 0.55 * hybrid_score + 0.45 * cross_score if cross_score is not None else hybrid_score
        ranked.append(
            {
                **candidate,
                "rerank_score": round(rerank_score, 6),
                "ranking_factors": {
                    "semantic_score": round(semantic_score, 6),
                    "keyword_overlap": round(overlap, 6),
                    "audience_match": audience_match if audience else None,
                    "reference_penalty": reference_penalty,
                    "cross_encoder_score": round(cross_score, 6) if cross_score is not None else None,
                },
            }
        )

    return sorted(ranked, key=lambda item: item["rerank_score"], reverse=True)[:top_k]


class CrossEncoderReranker:
    def __init__(self, model_name: str, enabled: bool = True):
        self.model_name = model_name
        self.enabled = enabled
        self._model = None

    @property
    def model(self):
        if self._model is None:
            # sentence-transformers is no longer installed: its PyTorch
            # dependency does not fit the deployment container. Reaching here
            # means cross_encoder.enabled was turned back on without adding
            # the dependency, so fail loudly rather than silently degrading.
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(self.model_name, device="cpu")
        return self._model

    def score(self, query: str, candidates: list[dict[str, Any]]) -> list[float] | None:
        if not self.enabled or not candidates:
            return None
        try:
            logits = self.model.predict(
                [(query, candidate.get("text", "")) for candidate in candidates],
                show_progress_bar=False,
            )
            return [_sigmoid(float(logit)) for logit in logits]
        except Exception as exc:
            logger.warning("Cross-encoder unavailable; using deterministic hybrid reranking: %s", exc)
            return None


def _sigmoid(value: float) -> float:
    if value >= 0:
        return 1.0 / (1.0 + exp(-value))
    exponent = exp(value)
    return exponent / (1.0 + exponent)
