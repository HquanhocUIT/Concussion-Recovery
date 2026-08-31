"""Grounded language composer for the guideline chat assistant.

Mirrors RecommendationComposer: the LLM may only reword the supplied
evidence excerpts, never add facts, claims, or citations of its own.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from app.schemas.recommendation import EvidenceCitation


class ChatComposer:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key if api_key is not None else os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

    def compose(self, question: str, evidence: list[EvidenceCitation]) -> tuple[str, str]:
        deterministic = self._deterministic(evidence)
        if not self.api_key:
            return deterministic, "deterministic-grounded-template"

        try:
            answer = self._call_claude(question, evidence)
            if answer.strip():
                return answer.strip(), self.model
        except (httpx.HTTPError, ValueError, KeyError, json.JSONDecodeError):
            pass
        return deterministic, "deterministic-grounded-template"

    _MAX_ANSWER_CHARS = 320

    @classmethod
    def _deterministic(cls, evidence: list[EvidenceCitation]) -> str:
        excerpt = cls._clean_pdf_text(evidence[0].excerpt)
        excerpt = cls._first_full_sentence(excerpt) or excerpt
        if len(excerpt) <= cls._MAX_ANSWER_CHARS:
            return excerpt
        truncated = excerpt[: cls._MAX_ANSWER_CHARS]
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

    def _call_claude(self, question: str, evidence: list[EvidenceCitation]) -> str:
        payload = {
            "question": question,
            "evidence": [item.model_dump(mode="json") for item in evidence],
        }
        prompt = (
            "You are the wording layer of a concussion-recovery guideline assistant demo. "
            "Do not add facts, diagnoses, medical clearance, safety claims, or citations beyond "
            "the supplied evidence excerpts. Do not answer anything the evidence does not support. "
            "Rewrite only the supplied excerpts into a short, plain-language answer to the question. "
            "The reader may be symptomatic (headache, fatigue, trouble concentrating), so keep the "
            "answer to 1-2 short sentences (about 40 words), not a long passage. "
            "Return strict JSON with a single key 'answer'.\n"
            + json.dumps(payload)
        )
        response = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": self.model,
                "max_tokens": 500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        response.raise_for_status()
        text = response.json()["content"][0]["text"]
        generated: dict[str, Any] = json.loads(text)
        return str(generated.get("answer", ""))
