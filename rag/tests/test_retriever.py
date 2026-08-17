from src.retrieval.retriever import EvidenceRetriever


class FakeStore:
    def query(self, query, top_k, metadata_filter=None):
        assert top_k == 20
        candidates = [
            {
                "text": "screen time recovery study citation",
                "score": 0.90,
                "metadata": {"section": "REFERENCES", "audience": "children and adolescents"},
                "citation": "References",
            },
            {
                "text": "Screen time may be gradually resumed after concussion.",
                "score": 0.82,
                "metadata": {"section": "Return to activity", "audience": "children and adolescents"},
                "citation": "Guideline, p. 6",
            },
        ]
        if metadata_filter:
            expected = metadata_filter["audience"]
            candidates = [item for item in candidates if item["metadata"]["audience"] == expected]
        return candidates


def test_retriever_reranks_useful_guidance_above_reference_list():
    results = EvidenceRetriever(FakeStore()).retrieve(
        "screen time after concussion", top_k=2, audience="pediatric"
    )

    assert results[0]["metadata"]["section"] == "Return to activity"
    assert results[0]["rerank_score"] > results[1]["rerank_score"]


class FakeCrossEncoder:
    def score(self, _query, candidates):
        assert len(candidates) == 2
        return [0.05, 0.95]


def test_cross_encoder_signal_is_included_in_ranking():
    results = EvidenceRetriever(FakeStore(), reranker=FakeCrossEncoder()).retrieve(
        "screen time after concussion", top_k=2, audience="pediatric"
    )

    assert results[0]["ranking_factors"]["cross_encoder_score"] == 0.95


def test_audience_is_a_hard_filter_not_only_a_ranking_hint():
    results = EvidenceRetriever(FakeStore()).retrieve(
        "screen time after concussion", top_k=5, audience="adult"
    )

    assert results == []
