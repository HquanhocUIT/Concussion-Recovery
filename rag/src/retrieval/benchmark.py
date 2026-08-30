from __future__ import annotations

import json
from pathlib import Path
from typing import Any


DEFAULT_BENCHMARK = Path(__file__).resolve().parents[2] / "data" / "retrieval_benchmark.json"


def load_benchmark(path: Path = DEFAULT_BENCHMARK) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def run_benchmark(retriever, path: Path = DEFAULT_BENCHMARK, top_k: int = 5) -> dict[str, Any]:
    cases = load_benchmark(path)
    hits = 0
    reciprocal_rank_sum = 0.0
    details = []
    for case in cases:
        results = retriever.retrieve(case["query"], top_k=top_k, audience=case.get("audience"))
        rank = _first_relevant_rank(results, case)
        hits += int(rank is not None)
        reciprocal_rank_sum += 1.0 / rank if rank else 0.0
        details.append({"id": case["id"], "hit": rank is not None, "rank": rank})
    count = len(cases)
    return {
        "cases": count,
        f"recall_at_{top_k}": round(hits / count, 4) if count else 0.0,
        "mrr": round(reciprocal_rank_sum / count, 4) if count else 0.0,
        "details": details,
    }


def _first_relevant_rank(results: list[dict[str, Any]], case: dict[str, Any]) -> int | None:
    expected_sources = set(case.get("expected_source_ids", []))
    required_terms = [term.lower() for term in case.get("required_any_terms", [])]
    for rank, result in enumerate(results, start=1):
        source_ok = not expected_sources or result.get("metadata", {}).get("source_id") in expected_sources
        text = result.get("text", "").lower()
        term_ok = not required_terms or any(term in text for term in required_terms)
        if source_ok and term_ok:
            return rank
    return None
