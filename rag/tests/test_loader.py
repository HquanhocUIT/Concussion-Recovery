import json

from src.ingestion.loader import load_manifest


def test_load_manifest_indexes_entries_by_filename(tmp_path):
    manifest = tmp_path / "sources.json"
    manifest.write_text(
        json.dumps([{"filename": "guideline.pdf", "source_id": "guideline"}]),
        encoding="utf-8",
    )

    result = load_manifest(manifest)

    assert result["guideline.pdf"]["source_id"] == "guideline"

