from __future__ import annotations

from pathlib import Path

import yaml

from src.chunking.chunker import chunk_pages
from src.embeddings.embedder import MiniLMEmbedder
from src.ingestion.loader import DEFAULT_CORPUS_DIR, DEFAULT_MANIFEST, load_corpus
from src.retrieval.retriever import EvidenceRetriever
from src.retrieval.reranker import CrossEncoderReranker
from src.vectordb.vector_store import ChromaVectorStore


RAG_ROOT = Path(__file__).resolve().parents[2]


def load_config(path: Path = RAG_ROOT / "config.yaml") -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def build_store(config_path: Path = RAG_ROOT / "config.yaml") -> tuple[ChromaVectorStore, dict]:
    config = load_config(config_path)
    embedder = MiniLMEmbedder(config["embedding"]["model"])
    persist_dir = RAG_ROOT / config["vectordb"]["persist_directory"]
    return ChromaVectorStore(embedder, persist_dir), config


def build_retriever(config_path: Path = RAG_ROOT / "config.yaml") -> EvidenceRetriever:
    store, config = build_store(config_path)
    retrieval = config["retrieval"]
    cross_encoder = retrieval.get("cross_encoder", {})
    reranker = CrossEncoderReranker(
        cross_encoder.get("model", "cross-encoder/ms-marco-MiniLM-L-6-v2"),
        enabled=cross_encoder.get("enabled", True),
    )
    return EvidenceRetriever(
        store,
        candidate_k=retrieval.get("candidate_k", 20),
        reranker=reranker,
    )


def ingest(
    corpus_dir: Path = DEFAULT_CORPUS_DIR,
    manifest_path: Path = DEFAULT_MANIFEST,
) -> dict[str, int]:
    store, config = build_store()
    pages = load_corpus(corpus_dir, manifest_path)
    chunks = chunk_pages(
        pages,
        chunk_size=config["chunking"]["chunk_size"],
        chunk_overlap=config["chunking"]["chunk_overlap"],
    )
    return {
        "pages": len(pages),
        "chunks": store.replace(chunks),
        "sources": len({page.metadata["source_id"] for page in pages}),
    }
