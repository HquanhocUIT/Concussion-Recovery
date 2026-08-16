from __future__ import annotations

import argparse
import json

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from src.ingestion.pipeline import build_store, ingest

app = FastAPI(
    title="RE:ENTRY - RAG Evidence Service",
    description="Retrieves and cites medical guideline evidence for Recovery Engine decisions. "
    "This service explains recommendations; it does not generate them.",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}


class RetrievalResult(BaseModel):
    text: str
    score: float
    metadata: dict
    citation: str


@app.get("/retrieve", response_model=list[RetrievalResult])
def retrieve(q: str = Query(min_length=3), top_k: int = Query(default=5, ge=1, le=20)):
    try:
        store, _ = build_store()
        if store.collection.count() == 0:
            raise HTTPException(status_code=409, detail="Corpus not ingested. Run: python main.py ingest")
        return store.query(q, top_k=top_k)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Retrieval unavailable: {exc}") from exc


def cli() -> None:
    parser = argparse.ArgumentParser(description="RE:ENTRY guideline ingestion and retrieval")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("ingest", help="Extract, chunk, embed, and index all guideline PDFs")
    query_parser = subparsers.add_parser("query", help="Query the local guideline index")
    query_parser.add_argument("question")
    query_parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    if args.command == "ingest":
        print(json.dumps(ingest(), indent=2))
        return

    store, _ = build_store()
    print(json.dumps(store.query(args.question, args.top_k), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    cli()
