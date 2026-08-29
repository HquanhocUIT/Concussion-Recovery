"""Safety-first orchestration boundary for decision pipelines."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, TypeVar

import httpx

from app.orchestrator.evidence import RagEvidenceClient, evidence_query
from app.orchestrator.llm_composer import RecommendationComposer
from app.planner.recovery_planner import plan_recovery_options
from app.schemas.recommendation import (
    EvidenceCitation,
    RecommendationOption,
    RecommendationRequest,
    RecommendationResponse,
)
from app.schemas.safety import SafetyInput, SafetyResult
from app.safety.guardrails import enforce_safety
from app.safety.red_flags import evaluate_safety


T = TypeVar("T")


def evaluate_safety_gate(
    safety_input: SafetyInput,
) -> SafetyResult:
    """Evaluate and enforce the authoritative safety boundary."""

    result = evaluate_safety(safety_input)
    return enforce_safety(result)


def run_pipeline(
    safety_input: SafetyInput,
) -> SafetyResult:
    """Run the safety boundary.

    Compatibility entry point for the current orchestrator tests.
    """

    return evaluate_safety_gate(safety_input)


def run_safety_gated(
    safety_input: SafetyInput,
    downstream: Callable[[], T],
) -> tuple[SafetyResult, T | None]:
    """Run downstream processing only when Safety explicitly allows it.

    Safety is authoritative:
    - BLOCKED_RED_FLAG: downstream is never executed.
    - REVIEW_REQUIRED: downstream is never executed.
    - SAFE: downstream may execute.
    """

    safety_result = evaluate_safety_gate(safety_input)

    if not safety_result.downstream_allowed:
        return safety_result, None

    return safety_result, downstream()


def run_guarded_pipeline(
    safety_input: SafetyInput,
    planner: Callable[[], dict[str, Any]],
    evidence_retriever: Callable[[dict[str, Any]], list[dict[str, Any]]],
) -> dict[str, Any]:
    """Run downstream decision components only after the safety gate clears."""
    safety = enforce_safety(evaluate_safety(safety_input))
    if not safety.downstream_allowed:
        return {
            "safety": safety,
            "recommendation": None,
            "evidence": [],
        }

    recommendation = planner()
    evidence = evidence_retriever(recommendation)
    return {
        "safety": safety,
        "recommendation": recommendation,
        "evidence": evidence,
    }


def _confidence(
    request: RecommendationRequest,
    evidence_by_option: dict[str, list[EvidenceCitation]],
    option_count: int,
) -> tuple[float, str]:
    sufficiency = {
        "insufficient": 0.25,
        "limited": 0.45,
        "moderate": 0.72,
        "strong": 0.90,
    }[request.scenario_result.data_sufficiency]
    certainty = {
        "high": 0.35,
        "moderate": 0.65,
        "low": 0.90,
    }[request.scenario_result.uncertainty]
    evidence_coverage = (
        sum(bool(items) for items in evidence_by_option.values()) / option_count
        if option_count else 0.0
    )
    score = round(0.45 * sufficiency + 0.30 * certainty + 0.25 * evidence_coverage, 2)
    if option_count and evidence_coverage == 0:
        score = min(score, 0.55)
    label = "high" if score >= 0.8 else "moderate" if score >= 0.55 else "limited"
    return score, label


def run_recommendation_pipeline(
    request: RecommendationRequest,
    evidence_client: RagEvidenceClient | None = None,
    composer: RecommendationComposer | None = None,
) -> SafetyResult | RecommendationResponse:
    """Safety -> Planner -> RAG -> grounded language composition.

    Safety deliberately runs first. A red flag prevents Planner, RAG, and
    the LLM from executing, regardless of Track A's modeled-demand result.
    """

    safety = evaluate_safety_gate(request.safety_input)
    if not safety.downstream_allowed:
        return safety

    planner_result = plan_recovery_options(
        request.scenario_result,
        request.activities,
        request.option_count,
    )
    evidence_client = evidence_client or RagEvidenceClient()
    evidence_by_option: dict[str, list[EvidenceCitation]] = {}
    retrieval_failures = 0
    for alternative in planner_result.alternatives:
        try:
            evidence_by_option[alternative.alternative_id] = evidence_client.retrieve(
                evidence_query(alternative.strategy, alternative.title),
                audience=request.audience,
                top_k=2,
            )
        except (httpx.HTTPError, ValueError, KeyError, TypeError):
            evidence_by_option[alternative.alternative_id] = []
            retrieval_failures += 1

    composer = composer or RecommendationComposer()
    summary, explanations, model_used = composer.compose(planner_result, evidence_by_option)
    options = [
        RecommendationOption(
            alternative=alternative,
            explanation=explanations[alternative.alternative_id],
            evidence=evidence_by_option[alternative.alternative_id],
        )
        for alternative in planner_result.alternatives
    ]
    confidence_score, confidence_label = _confidence(
        request,
        evidence_by_option,
        len(planner_result.alternatives),
    )
    limitations = list(request.scenario_result.limitations)
    if retrieval_failures:
        limitations.append(
            f"Guideline retrieval was unavailable for {retrieval_failures} option(s); those options contain no clinical-evidence claim."
        )
    limitations.append(
        "Alternatives are rule-based comparisons of the submitted plan, not medical clearance."
    )
    return RecommendationResponse(
        status=("recommendations_ready" if options else "no_change_needed"),
        summary=summary,
        options=options,
        confidence_score=confidence_score,
        confidence_label=confidence_label,
        model_used=model_used,
        limitations=list(dict.fromkeys(limitations)),
        disclaimer="RE:ENTRY is decision support, not a diagnosis or a substitute for professional medical care.",
    )
