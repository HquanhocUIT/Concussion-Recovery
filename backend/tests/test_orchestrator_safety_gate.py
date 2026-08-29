from app.orchestrator.pipeline import run_guarded_pipeline
from app.schemas.safety import SafetyInput


def test_red_flag_prevents_planner_and_rag_from_running():
    calls = {"planner": 0, "rag": 0}

    def planner():
        calls["planner"] += 1
        return {"status": "safe"}

    def rag(_recommendation):
        calls["rag"] += 1
        return [{"text": "evidence"}]

    result = run_guarded_pipeline(
        SafetyInput(repeated_vomiting=True),
        planner=planner,
        evidence_retriever=rag,
    )

    assert result["safety"].safety_state == "BLOCKED_RED_FLAG"
    assert result["recommendation"] is None
    assert result["evidence"] == []
    assert calls == {"planner": 0, "rag": 0}


def test_safe_input_runs_planner_then_rag():
    calls = []

    def planner():
        calls.append("planner")
        return {"decision": "reduce screen time"}

    def rag(recommendation):
        calls.append("rag")
        assert recommendation["decision"] == "reduce screen time"
        return [{"citation": "Guideline, p. 6"}]

    result = run_guarded_pipeline(
        SafetyInput(),
        planner=planner,
        evidence_retriever=rag,
    )

    assert result["safety"].safety_state == "SAFE"
    assert result["recommendation"]["decision"] == "reduce screen time"
    assert len(result["evidence"]) == 1
    assert calls == ["planner", "rag"]
