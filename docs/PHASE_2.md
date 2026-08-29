# Phase 2 - Retrieval, re-ranking, and safety integration

Status: **MVP complete**

## Delivered by this change

- Chroma retrieval with `candidate_k=20` and `top_k=5`.
- Hard evidence scopes: `adult`, `pediatric`, `sport`, and `general`.
- Hybrid semantic/keyword re-ranking plus a CPU cross-encoder.
- Deterministic hybrid fallback if the cross-encoder is unavailable.
- Source, page, section, URL, DOI, score, and ranking-factor output.
- Retrieval benchmark with Recall@5 and mean reciprocal rank (MRR).
- Safety-first orchestrator boundary compatible with the existing typed Safety API.
- Tests proving a red flag prevents Planner and RAG execution.

## Existing Safety contract reused

The base branch already provides deterministic red-flag evaluation through:

- `backend/app/schemas/safety.py`
- `backend/app/safety/red_flags.py`
- `backend/app/safety/guardrails.py`
- `POST /safety/check`

This change does not replace that teammate-owned contract. It consumes the existing `SafetyInput` and `SafetyResult` models at the orchestration boundary.

## Reproduce

```powershell
cd rag
.\.venv\Scripts\python.exe main.py benchmark
.\.venv\Scripts\python.exe -m pytest -q

cd ..\backend
python -m pytest -q
```

## Current benchmark baseline

```text
Cases: 12
Recall@5: 1.0000
MRR: 0.8194
```

These are engineering metrics on a small curated dataset, not clinical validation.

## Exit criteria

- A query returns five in-scope, re-ranked evidence chunks with citations.
- Retrieval does not silently cross adult, pediatric, and sport populations.
- Cross-encoder failure falls back to deterministic hybrid ranking.
- Any blocked Safety result prevents Planner and RAG calls.
- Retrieval and safety-integration tests pass.

Alternative-plan generation and full explanation composition belong to Phase 3.
