# Track B — Phase 3 & 4

## Goal

Phase 3 turns Track A's simulation result into comparable plan alternatives, with trade-offs,
guideline evidence, and confidence. Phase 4 brings the explanation and Safety flow into the UI
for an end-to-end demo.

This is a decision-support tool. `modeled_overload` is a technical comparison result, not a
medical "safe/unsafe" conclusion about the plan.

## Implemented architecture

```text
Track A ScenarioResult + submitted activities + explicit SafetyInput
                              │
                              ▼
                    Safety gate (authoritative)
                    ├─ BLOCKED → SafetyResult → Emergency Modal
                    └─ SAFE
                         │
                         ▼
            alternatives.py: generates 3 variants
            ├─ drop the activity with the highest modeled impact
            ├─ cut that activity's duration in half
            └─ move that activity to another day
                         │
                         ▼
          workload_model.calculate_activity_load()
              recomputes demand for each alternative
                         │
                         ▼
        recovery_planner.py: ranks + keeps 2–3 alternatives
                         │
                         ▼
       RAG /retrieve: excerpt + source + page + section + URL
                         │
                         ▼
        llm_composer.py: Claude if a key is set, grounded fallback otherwise
                         │
                         ▼
          POST /recommendations → options + citations + confidence
                         │
                         ▼
        React: Action Card → "Why?" → citation → simulate again
```

Safety runs before Planner/RAG/LLM. A red flag therefore always blocks downstream processing,
regardless of whether `modeled_overload` is `true` or `false`.

## Key files

### Backend

- `backend/app/schemas/recommendation.py`: request/response contract for `/recommendations`.
- `backend/app/planner/alternatives.py`: generates the three variants and calls Track A's
  workload model directly.
- `backend/app/planner/recovery_planner.py`: ranks by modeled-demand improvement and feasibility.
- `backend/app/orchestrator/evidence.py`: calls the RAG service, only accepts citations complete
  with source/page/section/URL.
- `backend/app/orchestrator/llm_composer.py`: the wording layer; must never change the
  decision/citations on its own.
- `backend/app/orchestrator/pipeline.py`: Safety → Planner → RAG → Composer, confidence and
  limitations.
- `backend/app/api/routes/recommendations.py`: the `POST /recommendations` endpoint.
- `backend/tests/test_recommendations.py`: tests for the Planner, the hard safety block,
  citations, confidence, and the API.

### Frontend

- `frontend/src/services/api.ts`: types and client for `/recommendations`.
- `frontend/src/types.ts`: the three explicit red-flag answers in the check-in.
- `frontend/src/App.tsx`:
  - calls Track B after receiving a `ScenarioResult`;
  - renders Planner options ahead of the older suggestions;
  - a "Why?" button opens the excerpt + citation;
  - a "Simulate this alternative" button resubmits the alternative plan to Track A;
  - never renders action cards when Safety has blocked;
  - the Emergency Modal uses `role="alertdialog"`, gets focus on open, and never depends on the
    modeled load.
- `frontend/src/translations.ts`: fixed the Emergency copy to correctly reference the red flag,
  instead of calling modeled load "dangerous".

## `POST /recommendations` contract

Minimal request:

```json
{
  "scenario_result": { "...": "the full Track A ScenarioResult" },
  "activities": [
    { "activity_id": "coding", "duration_minutes": 180 }
  ],
  "safety_input": {
    "worsening_headache": false,
    "repeated_vomiting": false,
    "neurological_danger_sign": false
  },
  "audience": "adult",
  "option_count": 3
}
```

On a red flag, the response is a `SafetyResult` and the Planner/RAG/LLM never run. When Safety
allows it, the response includes:

- `options[]`: each alternative, its recomputed demand, trade-off, explanation, and evidence;
- `confidence_score`: confidence in the decision pipeline, not a medical probability;
- `limitations[]` and a disclaimer;
- `model_used`: the Claude model name, or `deterministic-grounded-template`.

When the RAG service is unavailable, the endpoint still returns rule-based alternatives, but with
empty evidence, capped confidence, and an explicit limitation. The system never invents a
citation.

## Configuration

```env
# backend/.env
RAG_SERVICE_URL=http://localhost:8100
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5
```

An Anthropic key is not required for the demo. With a key, Claude only rewords the already
grounded content; without one, the deterministic composer takes over.

## Running locally

Terminal 1 — RAG:

```powershell
cd D:\CODING\Concussion_Recovery\rag
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8100
```

Terminal 2 — Backend:

```powershell
cd D:\CODING\Concussion_Recovery\backend
python -m uvicorn app.main:app --reload --port 8000
```

Terminal 3 — Frontend:

```powershell
cd D:\CODING\Concussion_Recovery\frontend
npm run dev
```

## 4-step demo script

1. Complete a Daily Check-in with a plan that has high screen/study duration, without checking
   any red flag.
2. Observe Track A's `modeled_overload` result and the three Planner alternatives that appear.
3. Click **Why?** on an alternative to see the trade-off, the guideline excerpt, the source name,
   page/section, and link.
4. Click **Simulate this alternative**; the alternative plan is resubmitted to Track A and the UI
   updates with the new result.

Separate Safety demo: check a red-flag checkbox at the Symptoms step. On submit,
`/recommendations` returns `BLOCKED_RED_FLAG`, no action card is shown, and the Emergency Modal
opens immediately.

## Verification results — 2026-08-29

- Backend: `106 passed`.
- RAG: `10 passed` using `rag/.venv`.
- Frontend: `npm run lint` passes.
- Frontend: `npm run build` passes.
- Real end-to-end backend → RAG run:
  - HTTP `200`;
  - `3` alternatives;
  - `2` citations per alternative;
  - confidence `0.77` in the test case;
  - the composer fallback works correctly with no Anthropic key set.

Vite still warns about a bundle larger than 500 kB. That's a performance optimization for later;
it does not block Phase 3–4 functionality.
