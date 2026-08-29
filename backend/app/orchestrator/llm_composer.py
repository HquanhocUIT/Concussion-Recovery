"""Grounded language composer; all decisions and citations arrive precomputed."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

from app.schemas.recommendation import EvidenceCitation, PlannerResult


class RecommendationComposer:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key if api_key is not None else os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

    def compose(
        self,
        planner_result: PlannerResult,
        evidence_by_option: dict[str, list[EvidenceCitation]],
    ) -> tuple[str, dict[str, str], str]:
        summary, explanations = self._deterministic(planner_result, evidence_by_option)
        if not self.api_key or not planner_result.alternatives:
            return summary, explanations, "deterministic-grounded-template"

        try:
            generated = self._call_claude(planner_result, evidence_by_option)
            llm_summary = str(generated.get("summary", "")).strip()
            llm_explanations = generated.get("explanations", {})
            if llm_summary and all(
                str(llm_explanations.get(item.alternative_id, "")).strip()
                for item in planner_result.alternatives
            ):
                return llm_summary, {
                    item.alternative_id: str(llm_explanations[item.alternative_id]).strip()
                    for item in planner_result.alternatives
                }, self.model
        except (httpx.HTTPError, ValueError, KeyError, json.JSONDecodeError):
            pass
        return summary, explanations, "deterministic-grounded-template"

    @staticmethod
    def _deterministic(
        planner_result: PlannerResult,
        evidence_by_option: dict[str, list[EvidenceCitation]],
    ) -> tuple[str, dict[str, str]]:
        if not planner_result.modeled_overload:
            return (
                "The submitted plan was not flagged as modeled overload, so no automatic plan changes were generated.",
                {},
            )
        explanations: dict[str, str] = {}
        for item in planner_result.alternatives:
            evidence = evidence_by_option.get(item.alternative_id, [])
            grounding = (
                f" Supporting guideline context is available from {evidence[0].source_title}."
                if evidence else
                " Guideline retrieval was unavailable, so this option is shown without a clinical-evidence claim."
            )
            explanations[item.alternative_id] = f"{item.rationale} {item.tradeoff}{grounding}"
        return (
            "The planner compared rule-based variants of the submitted plan and ranked the following trade-offs.",
            explanations,
        )

    def _call_claude(
        self,
        planner_result: PlannerResult,
        evidence_by_option: dict[str, list[EvidenceCitation]],
    ) -> dict[str, Any]:
        payload = {
            "alternatives": [item.model_dump(mode="json") for item in planner_result.alternatives],
            "evidence": {
                key: [citation.model_dump(mode="json") for citation in citations]
                for key, citations in evidence_by_option.items()
            },
        }
        prompt = (
            "You are the wording layer of a concussion decision-support demo. "
            "Do not add decisions, medical safety claims, diagnoses, facts, or citations. "
            "Rewrite only the supplied rule-based alternatives in plain language. "
            "Return strict JSON with keys summary and explanations, where explanations maps every alternative_id to text.\n"
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
                "max_tokens": 900,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        response.raise_for_status()
        text = response.json()["content"][0]["text"]
        return json.loads(text)
