from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.api.routes.recommendations import (
    get_evidence_client,
    get_recommendation_composer,
)
from app.main import app
from app.orchestrator.llm_composer import RecommendationComposer
from app.orchestrator.pipeline import run_recommendation_pipeline
from app.planner.recovery_planner import plan_recovery_options
from app.schemas.recommendation import EvidenceCitation, RecommendationRequest
from app.schemas.safety import SafetyInput
from app.schemas.simulation import ActivityInput, ModeledDemand, ScenarioResult


def _scenario(modeled_overload: bool = True) -> ScenarioResult:
    return ScenarioResult(
        simulation_id="sim-test",
        user_id="demo_overload",
        created_at=datetime.now(timezone.utc),
        recovery_state_snapshot={"trend": "stable"},
        modeled_demand=ModeledDemand(
            cognitive_demand_level="high",
            physical_demand_level="low",
            screen_exposure_level="high",
            recovery_opportunity_level="low",
        ),
        plan_recovery_alignment="low_alignment" if modeled_overload else "good_alignment",
        modeled_overload=modeled_overload,
        main_concerns=["high_cognitive_demand", "high_screen_exposure"],
        explanation_factors=[],
        uncertainty="moderate",
        data_sufficiency="moderate",
        limitations=["This is not a medical safety determination."],
    )


def _activities() -> list[ActivityInput]:
    return [
        ActivityInput(activity_id="coding", duration_minutes=180),
        ActivityInput(activity_id="walking", duration_minutes=30),
    ]


class StubEvidenceClient:
    def __init__(self):
        self.calls = 0

    def retrieve(self, query: str, audience: str, top_k: int = 2):
        self.calls += 1
        assert query
        assert audience in {"general", "adult", "pediatric", "sport"}
        return [
            EvidenceCitation(
                excerpt="A gradual, symptom-limited return to activity is recommended.",
                citation="Amsterdam 2022 Consensus Statement, p. 12, RETURN-TO-LEARN",
                source_id="amsterdam-2022-consensus",
                source_title="Amsterdam 2022 Consensus Statement",
                canonical_url="https://bjsm.bmj.com/content/57/11/695",
                page=12,
                section="RETURN-TO-LEARN",
                relevance_score=0.91,
            )
        ]


def test_planner_generates_and_ranks_three_recomputed_variants():
    result = plan_recovery_options(_scenario(), _activities())

    assert len(result.alternatives) == 3
    assert {item.strategy for item in result.alternatives} == {
        "remove_activity",
        "reduce_duration",
        "postpone_activity",
    }
    assert all(item.modeled_demand != _scenario().modeled_demand for item in result.alternatives)
    assert result.alternatives == sorted(
        result.alternatives,
        key=lambda item: item.improvement_score + {
            "reduce_duration": 0.30,
            "postpone_activity": 0.15,
            "remove_activity": 0.00,
        }[item.strategy],
        reverse=True,
    )


def test_non_overload_scenario_does_not_invent_plan_changes():
    result = plan_recovery_options(_scenario(False), _activities())
    assert result.modeled_overload is False
    assert result.alternatives == []


def test_red_flag_blocks_planner_rag_and_composer_path():
    evidence = StubEvidenceClient()
    request = RecommendationRequest(
        scenario_result=_scenario(),
        activities=_activities(),
        safety_input=SafetyInput(repeated_vomiting=True),
    )

    result = run_recommendation_pipeline(request, evidence, RecommendationComposer(api_key=""))

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.downstream_allowed is False
    assert evidence.calls == 0


def test_pipeline_returns_grounded_options_citations_and_confidence():
    evidence = StubEvidenceClient()
    request = RecommendationRequest(
        scenario_result=_scenario(),
        activities=_activities(),
        audience="adult",
    )

    result = run_recommendation_pipeline(request, evidence, RecommendationComposer(api_key=""))

    assert result.status == "recommendations_ready"
    assert len(result.options) == 3
    assert evidence.calls == 3
    assert all(option.evidence[0].canonical_url.startswith("https://") for option in result.options)
    assert result.confidence_score >= 0.55
    assert result.model_used == "deterministic-grounded-template"


def test_recommendations_endpoint_exposes_track_b_contract():
    evidence = StubEvidenceClient()
    app.dependency_overrides[get_evidence_client] = lambda: evidence
    app.dependency_overrides[get_recommendation_composer] = lambda: RecommendationComposer(api_key="")
    try:
        response = TestClient(app).post(
            "/recommendations",
            json={
                "scenario_result": _scenario().model_dump(mode="json"),
                "activities": [item.model_dump() for item in _activities()],
                "safety_input": {},
                "audience": "adult",
            },
        )
    finally:
        app.dependency_overrides.pop(get_evidence_client, None)
        app.dependency_overrides.pop(get_recommendation_composer, None)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "recommendations_ready"
    assert len(body["options"]) == 3
    assert body["options"][0]["evidence"][0]["source_id"] == "amsterdam-2022-consensus"
