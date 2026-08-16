from __future__ import annotations

from pathlib import Path
from typing import Any

from src.models import DocumentChunk


DEFAULT_PERSIST_DIR = Path(__file__).resolve().parents[2] / "data" / "processed" / "chroma"


class ChromaVectorStore:
    def __init__(
        self,
        embedder,
        persist_directory: Path = DEFAULT_PERSIST_DIR,
        collection_name: str = "reentry_guidelines",
    ):
        import chromadb

        self.embedder = embedder
        self.client = chromadb.PersistentClient(path=str(persist_directory))
        self.collection = self.client.get_or_create_collection(
            name=collection_name, metadata={"hnsw:space": "cosine"}
        )

    def replace(self, chunks: list[DocumentChunk], batch_size: int = 128) -> int:
        existing = self.collection.get(include=[]).get("ids", [])
        if existing:
            self.collection.delete(ids=existing)

        for offset in range(0, len(chunks), batch_size):
            batch = chunks[offset : offset + batch_size]
            texts = [chunk.text for chunk in batch]
            self.collection.add(
                ids=[f"chunk-{offset + i:06d}" for i in range(len(batch))],
                documents=texts,
                metadatas=[_chroma_metadata(chunk.metadata) for chunk in batch],
                embeddings=self.embedder.embed(texts),
            )
        return len(chunks)

    def query(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        result = self.collection.query(
            query_embeddings=self.embedder.embed([query]),
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        rows = []
        for document, metadata, distance in zip(
            result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            rows.append(
                {
                    "text": document,
                    "score": round(1.0 - float(distance), 6),
                    "metadata": metadata,
                    "citation": format_citation(metadata),
                }
            )
        return rows


def _chroma_metadata(metadata: dict[str, Any]) -> dict[str, str | int | float | bool]:
    return {
        key: value
        for key, value in metadata.items()
        if isinstance(value, (str, int, float, bool)) and value is not None
    }


def format_citation(metadata: dict[str, Any]) -> str:
    page = metadata.get("page", "?")
    section = metadata.get("section", "Unknown section")
    return f'{metadata.get("short_title", metadata.get("title", "Guideline"))}, p. {page}, {section}'
