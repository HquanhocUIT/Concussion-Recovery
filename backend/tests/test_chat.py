import httpx
from fastapi.testclient import TestClient

from app.api.routes.chat import get_chat_composer, get_evidence_client
from app.main import app
from app.orchestrator.chat_composer import ChatComposer
from app.orchestrator.pipeline import run_chat_pipeline
from app.schemas.chat import ChatRequest
from app.schemas.recommendation import EvidenceCitation
from app.schemas.safety import SafetyInput


class StubEvidenceClient:
    def __init__(self, results=None):
        self.calls = 0
        self._results = results if results is not None else [
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

    def retrieve(self, query: str, audience: str, top_k: int = 3):
        self.calls += 1
        assert query
        assert audience in {"general", "adult", "pediatric", "sport"}
        return self._results


class _StubResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


_CITATION_PAYLOAD = {
    "text": "A gradual, symptom-limited return to activity is recommended.",
    "citation": "Amsterdam 2022 Consensus Statement, p. 12, RETURN-TO-LEARN",
    "rerank_score": 0.91,
    "metadata": {
        "source_id": "amsterdam-2022-consensus",
        "title": "Amsterdam 2022 Consensus Statement",
        "canonical_url": "https://bjsm.bmj.com/content/57/11/695",
        "page": 12,
        "section": "RETURN-TO-LEARN",
    },
}


class FailingEvidenceClient:
    """Stands in for a RAG service that cannot be reached at all."""

    def __init__(self):
        self.calls = 0

    def retrieve(self, query: str, audience: str, top_k: int = 3):
        self.calls += 1
        raise httpx.ConnectError("connection refused")


def test_deterministic_answer_never_ends_mid_sentence():
    """ Regression: the chat showed users a truncated fragment.

    With no LLM configured the excerpt is displayed verbatim, and PDF chunks
    can end mid-word (".. prevents a child/adolesc"). That reached the UI as an
    answer that simply stopped, which for a clinical tool reads as a broken or
    withheld instruction.
    """
    truncated_chunk = (
        "ate symptoms, especially in the first days after injury. The use of these "
        "devices can be increased according to symptom tolerance as the "
        "child/adolescent recovers. For sleep hygiene purposes, these devices should "
        "not be used in the hour prior to bedtime. Level of Evidence: C 2.4d Advise on "
        "avoiding alcohol and other recreational drugs after a concussion. Alcohol and "
        "recreational drugs may have a negative effect on concussion recovery. Avoiding "
        "alcohol or drugs prevents a child/adolesc"
    )
    citation = EvidenceCitation(
        excerpt=truncated_chunk,
        citation="Living Guideline, p. 41, LIFESTYLE",
        source_id="pedsconcussion-living-guideline",
        source_title="PedsConcussion Living Guideline",
        canonical_url="https://pedsconcussion.com/",
        page=41,
        section="LIFESTYLE",
        relevance_score=0.82,
    )

    answer = ChatComposer(api_key="")._deterministic([citation])

    assert answer.endswith((".", "!", "?")), answer
    assert not answer.endswith("adolesc")
    # Clause numbers such as "2.4d" must not be split into "2. 4d".
    assert "2. 4d" not in answer


def test_retrieval_retries_a_waking_service_before_giving_up(monkeypatch):
    """A container coming back from sleep rejects the first calls, then serves.

    /ready was measured at 22.9s on a cold free-tier instance, so the retry
    window has to outlast that rather than give up after a couple of seconds.
    """
    from app.orchestrator.evidence import RagEvidenceClient

    attempts = {"n": 0}
    slept: list[float] = []

    def fake_get(url, params=None, timeout=None):
        attempts["n"] += 1
        if attempts["n"] < 3:
            raise httpx.ConnectError("container still waking")
        return _StubResponse([_CITATION_PAYLOAD])

    monkeypatch.setattr(httpx, "get", fake_get)
    monkeypatch.setattr("app.orchestrator.evidence.time.sleep", slept.append)

    client = RagEvidenceClient(base_url="http://rag.test")
    citations = client.retrieve("How soon can I return to sport?", audience="general")

    assert attempts["n"] == 3
    assert len(citations) == 1
    # Backs off rather than hammering: 1s then 2s. Deliberately short — a
    # full cold start cannot be absorbed here (see RagEvidenceClient), so the
    # budget stays inside the platform edge timeout and fails fast instead.
    assert slept == [1.0, 2.0]


def test_unreachable_rag_is_reported_as_unavailable_not_missing_evidence():
    """A service outage must not be presented as "the corpus has no answer".

    Both cases used to return an empty citation list and therefore the same
    "no guideline evidence found" message, so a sleeping instance looked
    identical to a question the guidelines genuinely do not cover.
    """
    evidence = FailingEvidenceClient()
    request = ChatRequest(question="How soon can I return to sport?")

    result = run_chat_pipeline(request, evidence, ChatComposer(api_key=""))

    assert result.status == "evidence_unavailable"
    assert result.status != "no_evidence_found"
    assert result.citations == []
    assert "service" in result.answer.lower()


def test_red_flag_blocks_rag_and_composer_path():
    evidence = StubEvidenceClient()
    request = ChatRequest(
        question="Can I go back to playing soccer this week?",
        safety_input=SafetyInput(repeated_vomiting=True),
    )

    result = run_chat_pipeline(request, evidence, ChatComposer(api_key=""))

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.downstream_allowed is False
    assert evidence.calls == 0


def test_no_evidence_does_not_invent_an_answer():
    evidence = StubEvidenceClient(results=[])
    request = ChatRequest(question="What is the capital of France?")

    result = run_chat_pipeline(request, evidence, ChatComposer(api_key=""))

    assert result.status == "no_evidence_found"
    assert result.citations == []
    assert result.model_used == "none"


def test_low_relevance_retrieval_is_treated_as_no_evidence():
    evidence = StubEvidenceClient(results=[
        EvidenceCitation(
            excerpt="List Alternate 10 word lists Score (of 10) Trial 1 Trial 2 Trial 3",
            citation="Living Concussion Guidelines (Adults), p. 112, ORIENTATION",
            source_id="living-concussion-guidelines-adults-3e",
            source_title="Guideline for Concussion/Mild Traumatic Brain Injury & Prolonged Symptoms, Third Edition",
            canonical_url="https://concussionsontario.org/",
            page=112,
            section="ORIENTATION",
            relevance_score=0.073,
        )
    ])
    request = ChatRequest(question="What is the best pizza topping?")

    result = run_chat_pipeline(request, evidence, ChatComposer(api_key=""))

    assert result.status == "no_evidence_found"
    assert result.citations == []


def test_answered_response_is_grounded_in_retrieved_citations():
    evidence = StubEvidenceClient()
    request = ChatRequest(question="How soon can I return to sport?", audience="sport")

    result = run_chat_pipeline(request, evidence, ChatComposer(api_key=""))

    assert result.status == "answered"
    assert evidence.calls == 1
    assert result.model_used == "deterministic-grounded-template"
    assert result.citations[0].source_id == "amsterdam-2022-consensus"
    assert "gradual" in result.answer


def test_chat_endpoint_exposes_grounded_contract():
    evidence = StubEvidenceClient()
    app.dependency_overrides[get_evidence_client] = lambda: evidence
    app.dependency_overrides[get_chat_composer] = lambda: ChatComposer(api_key="")
    try:
        response = TestClient(app).post(
            "/chat",
            json={"question": "How soon can I return to sport?", "audience": "sport"},
        )
    finally:
        app.dependency_overrides.pop(get_evidence_client, None)
        app.dependency_overrides.pop(get_chat_composer, None)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "answered"
    assert body["citations"][0]["source_id"] == "amsterdam-2022-consensus"


def test_chat_endpoint_blocks_on_red_flag_without_calling_rag():
    evidence = StubEvidenceClient()
    app.dependency_overrides[get_evidence_client] = lambda: evidence
    app.dependency_overrides[get_chat_composer] = lambda: ChatComposer(api_key="")
    try:
        response = TestClient(app).post(
            "/chat",
            json={
                "question": "Is it safe to drive today?",
                "safety_input": {"neurological_danger_sign": True},
            },
        )
    finally:
        app.dependency_overrides.pop(get_evidence_client, None)
        app.dependency_overrides.pop(get_chat_composer, None)

    assert response.status_code == 200
    body = response.json()
    assert body["safety_state"] == "BLOCKED_RED_FLAG"
    assert evidence.calls == 0
