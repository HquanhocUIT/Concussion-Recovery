"""Grounded language composer; all decisions and citations arrive precomputed."""

from __future__ import annotations

import json
from typing import Any

import httpx

from app.orchestrator.llm_client import LlmUnavailable, complete_json, resolve_provider
from app.schemas.recommendation import EvidenceCitation, PlannerResult


class RecommendationComposer:
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

    def compose(
        self,
        planner_result: PlannerResult,
        evidence_by_option: dict[str, list[EvidenceCitation]],
    ) -> tuple[str, dict[str, str], str]:
        summary, explanations = self._deterministic(planner_result, evidence_by_option)
        if not self.api_key or not planner_result.alternatives:
            return summary, explanations, "deterministic-grounded-template"

        try:
            generated = self._call_llm(planner_result, evidence_by_option)
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
        except (httpx.HTTPError, ValueError, KeyError, json.JSONDecodeError, LlmUnavailable):
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

    def _call_llm(
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
        return complete_json(prompt, max_tokens=900)
