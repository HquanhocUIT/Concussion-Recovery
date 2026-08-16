from src.vectordb.vector_store import format_citation


def test_format_citation_includes_source_page_and_section():
    citation = format_citation(
        {"short_title": "Adult Guideline", "page": 42, "section": "Return to Activity"}
    )

    assert citation == "Adult Guideline, p. 42, Return to Activity"

