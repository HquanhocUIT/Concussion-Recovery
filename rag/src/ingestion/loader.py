from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader

from src.models import DocumentPage


DEFAULT_CORPUS_DIR = Path(__file__).resolve().parents[2] / "data" / "raw_guidelines"
DEFAULT_MANIFEST = DEFAULT_CORPUS_DIR / "sources.json"


def load_manifest(path: Path = DEFAULT_MANIFEST) -> dict[str, dict]:
    entries = json.loads(path.read_text(encoding="utf-8"))
    return {entry["filename"]: entry for entry in entries}


def load_pdf(path: Path, source_metadata: dict) -> list[DocumentPage]:
    reader = PdfReader(str(path))
    pages: list[DocumentPage] = []
    for page_number, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if not text:
            continue
        metadata = {
            **source_metadata,
            "filename": path.name,
            "page": page_number,
            "total_pages": len(reader.pages),
        }
        pages.append(DocumentPage(text=text, metadata=metadata))
    return pages


def load_corpus(
    corpus_dir: Path = DEFAULT_CORPUS_DIR,
    manifest_path: Path = DEFAULT_MANIFEST,
) -> list[DocumentPage]:
    manifest = load_manifest(manifest_path)
    missing = sorted(set(manifest) - {path.name for path in corpus_dir.glob("*.pdf")})
    if missing:
        raise FileNotFoundError(f"Missing guideline PDFs: {', '.join(missing)}")

    pages: list[DocumentPage] = []
    for filename, metadata in manifest.items():
        pages.extend(load_pdf(corpus_dir / filename, metadata))
    return pages


def iter_pdf_paths(corpus_dir: Path = DEFAULT_CORPUS_DIR) -> Iterable[Path]:
    return sorted(corpus_dir.glob("*.pdf"))

