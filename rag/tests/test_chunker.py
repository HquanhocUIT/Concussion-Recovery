from src.chunking.chunker import chunk_pages
from src.models import DocumentPage


def test_chunker_preserves_citation_metadata_and_overlap():
    page = DocumentPage(
        text="RETURN TO LEARN\n" + "x" * 700,
        metadata={"source_id": "source-1", "title": "Test guideline", "page": 7},
    )

    chunks = chunk_pages([page], chunk_size=500, chunk_overlap=50)

    assert len(chunks) == 2
    assert chunks[0].metadata["page"] == 7
    assert chunks[0].metadata["section"] == "RETURN TO LEARN"
    assert chunks[0].text[-50:] == chunks[1].text[:50]


def test_chunker_rejects_invalid_overlap():
    page = DocumentPage(text="content", metadata={})

    try:
        chunk_pages([page], chunk_size=50, chunk_overlap=50)
    except ValueError as exc:
        assert "smaller than chunk_size" in str(exc)
    else:
        raise AssertionError("Expected ValueError")

