from src.retrieval.benchmark import _first_relevant_rank, load_benchmark


def test_benchmark_has_scoped_cases_for_all_populations():
    cases = load_benchmark()

    assert len(cases) >= 12
    assert {case["audience"] for case in cases} == {"adult", "pediatric", "sport"}
    assert all(case["expected_source_ids"] for case in cases)
    assert all(case["required_any_terms"] for case in cases)


def test_relevance_requires_expected_source_and_content():
    case = {
        "expected_source_ids": ["expected"],
        "required_any_terms": ["screen"],
    }
    results = [
        {"text": "screen advice", "metadata": {"source_id": "wrong"}},
        {"text": "screen guidance", "metadata": {"source_id": "expected"}},
    ]

    assert _first_relevant_rank(results, case) == 2
