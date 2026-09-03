from __future__ import annotations

import re
from typing import Iterable

from src.models import DocumentChunk, DocumentPage


HEADING_PATTERN = re.compile(r"^(?:\d+(?:\.\d+)*[.)]?\s+)?[A-Z][A-Z\s/&,:()\-]{4,}$")


def _section_for(text: str, fallback: str) -> str:
    for line in text.splitlines():
        candidate = " ".join(line.split()).strip()
        if 4 < len(candidate) <= 140 and HEADING_PATTERN.match(candidate):
            return candidate
    return fallback


def _trim_to_boundary(text: str, start: int, end: int) -> str:
    """Return text[start:end] cut back to a sentence, else a word, boundary.

    A hard character slice ends chunks mid-word ("...prevents a child/adolesc"),
    and that fragment is what the chat assistant shows the user when no LLM is
    configured to reword it. Ending on a real boundary keeps the excerpt
    readable on its own.

    Only the tail is trimmed. A chunk still starts mid-sentence — the overlap
    between chunks is what keeps that text reachable — and the composer already
    skips a leading fragment.
    """

    window = text[start:end]
    if end >= len(text):
        return window.strip()

    # Prefer the last sentence end, as long as it keeps most of the window.
    sentence = max(window.rfind(". "), window.rfind("! "), window.rfind("? "))
    if sentence >= len(window) // 2:
        return window[: sentence + 1].strip()

    # Otherwise fall back to the last word boundary so no word is split.
    space = window.rfind(" ")
    if space > 0:
        return window[:space].strip()
    return window.strip()


def chunk_pages(
    pages: Iterable[DocumentPage],
    chunk_size: int = 500,
    chunk_overlap: int = 50,
) -> list[DocumentChunk]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be >= 0 and smaller than chunk_size")

    chunks: list[DocumentChunk] = []
    step = chunk_size - chunk_overlap
    for page in pages:
        clean_text = re.sub(r"[ \t]+", " ", page.text)
        section = _section_for(clean_text, page.metadata.get("title", "Guideline"))
        for start in range(0, len(clean_text), step):
            text = _trim_to_boundary(
                clean_text, start, min(start + chunk_size, len(clean_text))
            )
            if not text:
                continue
            chunk_index = len(chunks)
            metadata = {
                **page.metadata,
                "section": section,
                "chunk_index": chunk_index,
                "char_start": start,
            }
            chunks.append(DocumentChunk(text=text, metadata=metadata))
            if start + chunk_size >= len(clean_text):
                break
    return chunks

