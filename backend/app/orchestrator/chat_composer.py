"""Grounded language composer for the guideline chat assistant.

Mirrors RecommendationComposer: the LLM may only reword the supplied
evidence excerpts, never add facts, claims, or citations of its own.
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.orchestrator.llm_client import LlmUnavailable, complete_json, resolve_provider
from app.schemas.recommendation import EvidenceCitation


class ChatComposer:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        # An explicitly passed key still wins (tests pass "" to force the
        # deterministic path); otherwise whichever provider is configured.
        self._forced_key = api_key
        self._forced_model = model

    @property
    def api_key(self) -> str:
        if self._forced_key is not None:
            return self._forced_key
        return resolve_provider()[1]

    @property
    def model(self) -> str:
        if self._forced_model:
            return self._forced_model
        return resolve_provider()[2] or "deterministic-grounded-template"

    def compose(self, question: str, evidence: list[EvidenceCitation]) -> tuple[str, str]:
        deterministic = self._deterministic(evidence)
        if not self.api_key:
            return deterministic, "deterministic-grounded-template"

        try:
            answer = self._call_llm(question, evidence)
            if answer.strip():
                return answer.strip(), self.model
        except (httpx.HTTPError, ValueError, KeyError, json.JSONDecodeError, LlmUnavailable):
            pass
        return deterministic, "deterministic-grounded-template"

    _MAX_ANSWER_CHARS = 320

    @classmethod
    def _deterministic(cls, evidence: list[EvidenceCitation]) -> str:
        """Quote whole sentences from the top excerpt.

        With no LLM configured this text is shown verbatim, so it must read as
        finished prose. Excerpts come from PDF chunks and can start or end
        mid-sentence, so both ends are trimmed to sentence boundaries rather
        than sliced at a character count.
        """

        excerpt = cls._clean_pdf_text(evidence[0].excerpt)
        excerpt = cls._first_full_sentence(excerpt) or excerpt
        return cls._whole_sentences(excerpt, cls._MAX_ANSWER_CHARS)

    @staticmethod
    def _whole_sentences(text: str, limit: int) -> str:
        """Take as many complete sentences as fit within `limit`."""

        # Split only where a terminator is followed by whitespace and a
        # capital. A bare "." also appears inside clause numbers such as
        # "2.4d", which must not be treated as a sentence end.
        parts = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
        kept: list[str] = []
        length = 0
        for part in parts:
            piece = part.strip()
            if not piece:
                continue
            extra = len(piece) + (1 if kept else 0)
            if kept and length + extra > limit:
                break
            kept.append(piece)
            length += extra
        if kept and kept[-1].rstrip().endswith((".", "!", "?")):
            return " ".join(kept)

        # No sentence terminator at all (a heading, a table row). Fall back to
        # whole words and mark the cut so it does not read as a finished claim.
        if len(text) <= limit:
            return text
        truncated = text[:limit]
        last_space = truncated.rfind(" ")
        if last_space > 0:
            truncated = truncated[:last_space]
        return truncated.rstrip(",;: ") + "…"

    @staticmethod
    def _clean_pdf_text(text: str) -> str:
        """Collapse the line breaks and stray spaces left by PDF text extraction."""
        collapsed = " ".join(text.split())
        return re.sub(r"(\w)-\s+(\w)", r"\1\2", collapsed)

    @staticmethod
    def _first_full_sentence(text: str) -> str | None:
        """Skip a leading sentence fragment (mid-chunk text) and start at the next sentence."""
        match = re.search(r"[.!?]\s+[A-Z]", text)
        if not match:
            return None
        candidate = text[match.start() + 1:].strip()
        return candidate or None

    def _call_llm(self, question: str, evidence: list[EvidenceCitation]) -> str:
        payload = {
            "question": question,
            "evidence": [item.model_dump(mode="json") for item in evidence],
        }
        prompt = (
            "You are the wording layer of a concussion-recovery guideline assistant demo. "
            "Do not add facts, diagnoses, medical clearance, safety claims, or citations beyond "
            "the supplied evidence excerpts. Do not answer anything the evidence does not support. "
            "The excerpts come from PDF extraction and may start or end mid-sentence; ignore any "
            "fragment you cannot read, and never end your answer mid-sentence. "
            "Rewrite only the supplied excerpts into a short, plain-language answer to the question. "
            "The reader may be symptomatic (headache, fatigue, trouble concentrating), so keep the "
            "answer to 1-2 short complete sentences (about 40 words), not a long passage. "
            "Return strict JSON with a single key 'answer'.\n"
            + json.dumps(payload)
        )
        generated: dict[str, Any] = complete_json(prompt, max_tokens=500)
        return str(generated.get("answer", ""))
