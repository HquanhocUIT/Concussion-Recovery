# RE:ENTRY — AI Recovery Scenario Engine

> **Existing tools help people track recovery. RE:ENTRY helps them plan their return to real life.**

Built for **Hack for Humanity** — track **Concussion Recovery** (presented by Concussion Alliance
& Synapse), secondary track **Best Use of AI/ML & Responsible AI**, and **Best Use of Render**.

**Live demo:** https://reentry-frontend-4jw2.onrender.com

Submission requirements: [`challenge_information.txt`](challenge_information.txt).
Full judging criteria: [`criteria/Concusion_recovery/`](criteria/Concusion_recovery/).

---

## 1. Problem

People recovering from a **concussion / mild traumatic brain injury (mTBI)** often don't know
when — or at what intensity — they can safely return to school, work, sport, and normal life.

Existing tools mostly focus on **tracking symptoms that already happened**, but don't help users
**simulate ahead of time** whether a specific activity plan is appropriate for their recent
recovery pattern.

## 2. Solution

RE:ENTRY is a **decision-support system**, not a diagnostic tool. It reads a user's check-in
history to build a Recovery Profile, then lets them run a **"what-if" simulation**: if I do this
plan, what will the load on my brain look like — before they actually do it.

> This is the core difference from a typical symptom-tracking app: RE:ENTRY doesn't just **track**
> (log what happened) — it **plans** (simulates before you act).

### Product flow

```
Check-in → Recovery State → Plan → Simulate → Adjust → Compare → Explain Why
```

### Core pipeline — safety-first ordering

```
Daily Check-in Data
        │
        ▼
1. Recovery Intelligence     → reads check-in history → Recovery Profile (trend, uncertainty, data sufficiency)
        │
        ▼
2. Scenario Simulation Engine → estimates plan load (rule-based, deterministic, no LLM)
        │
        ▼
3. Recovery Planner          → on overload, generates multiple alternatives with trade-offs
        │
        ▼
4. Safety Gate               → checks red flags FIRST; if found, hard-blocks the entire pipeline
        │            (Planner/RAG/LLM are never called when Safety blocks)
        ▼
5. RAG evidence layer        → ONLY finds & cites guideline evidence, NEVER decides
        │
        ▼
   LLM Composer               → the "spokesperson": rewords the result into plain language
                                 (swap/disable the LLM and the system still returns the exact
                                  same grounded result, just phrased differently)
```

**Principle:** the Recovery Engine decides → Safety has absolute veto over the whole pipeline →
RAG proves it with real guidelines → the LLM only rephrases. The core value lives in the
logic/data model, not the language model — turn the LLM off and the system still works fully,
returning a grounded template-based answer.

### Killer feature — What-if Recovery Simulation

Users try different activity scenarios (attending class, working out, coding, working...), the
system simulates the load on the brain based on their personal Recovery Profile, flags what's
driving overload risk (`modeled_overload`), and suggests adjustments **before** the user acts on
the plan.

### Guideline Assistant (chat)

Besides the check-in/simulate flow, users can ask a floating chat assistant a quick question
(`POST /chat`). It **only answers from evidence the RAG layer actually retrieved** — if no
guideline passage clears the minimum relevance threshold, it says so explicitly instead of making
something up. It goes through the same Safety gate as the main flow.

### ⚠️ Medical disclaimer

RE:ENTRY **does not diagnose, does not confirm recovery, does not issue medical clearance, and
does not replace a physician**. `modeled_overload` is a technical comparison result (an
engineering heuristic), not a medical "safe/unsafe" determination. See
[`docs/research-foundation.md`](docs/research-foundation.md) for the full list of limitations.

---

## 3. How this maps to the judging criteria

| Criterion (judging panel) | How RE:ENTRY addresses it | Evidence in the repo |
|---|---|---|
| **Clinical & Domain Effectiveness** (Concussion Alliance) | The entire flow follows the *graded, symptom-limited return to activity* principle shared by the track's 3 reference guidelines | [`docs/research-foundation.md`](docs/research-foundation.md), [`rag/data/raw_guidelines/sources.json`](rag/data/raw_guidelines/sources.json) |
| **Safety & Responsible Design** (Concussion Alliance) | Safety runs before Planner/RAG/LLM with absolute veto power; the system never self-diagnoses or confirms recovery | [`backend/app/orchestrator/pipeline.py`](backend/app/orchestrator/pipeline.py), [`backend/tests/test_orchestrator_safety_gate.py`](backend/tests/test_orchestrator_safety_gate.py) |
| **Neuroscience Understanding** (Synapse) | The workload model separates 4 demand axes (cognitive/physical/screen/recovery), matching how the guidelines distinguish different symptom triggers | [`docs/research-foundation.md`](docs/research-foundation.md) §3 |
| **Research Foundation** (Synapse) | Every piece of returned evidence keeps its source/page/section/URL; citations are never invented; limitations are stated explicitly when no source exists | [`docs/research-foundation.md`](docs/research-foundation.md) §5, [`rag/src/retrieval/`](rag/src/retrieval/) |
| **Technical Complexity** (technical judges) | Two-stage RAG (vector search + cross-encoder re-rank), audience hard-filtering, a deterministic Safety gate, a multi-step orchestrator, and a 4-service Render deployment (see §6) | [`rag/src/retrieval/retriever.py`](rag/src/retrieval/retriever.py), [`backend/app/orchestrator/`](backend/app/orchestrator/), [`render.yaml`](render.yaml) |
| **UX & Accessibility** (technical judges) | Skip link, `:focus-visible`, `aria-pressed`/`role=progressbar`, ≥44px touch targets, `prefers-reduced-motion`, smoke-tested at 390px | [`docs/PHASE_5_UIUX.md`](docs/PHASE_5_UIUX.md) |

---

## 4. System Architecture (as actually built)

```
Concussion_Recovery/
├── README.md
├── challenge_information.txt        # original submission requirements
├── criteria/                        # detailed judging criteria (PDF)
├── render.yaml                      # Render Blueprint — see §6
├── docker-compose.yml                # Postgres + rag + backend for a production-like local run
├── .github/workflows/ci.yml          # CI: test + build backend/rag, typecheck + build frontend
├── docs/
│   ├── codex.md                      # internal context-handover log between work sessions
│   ├── PHASE_2.md, PHASE_3_4.md, PHASE_5_UIUX.md  # per-phase implementation notes
│   ├── research-foundation.md        # scientific grounding for the workload model (Research Foundation)
│   ├── video-pitch-script.md         # 4-minute pitch video script
│   └── screenshots/                  # before/after UI screenshots (Phase 5)
│
├── frontend/                         # Vite + React + TypeScript
│   ├── src/
│   │   ├── App.tsx                   # full UI flow: check-in, dashboard, action cards
│   │   ├── components/               # ChatWidget (Guideline Assistant), PDFReportWrapper
│   │   ├── services/api.ts           # client for the real backend (no mocks)
│   │   └── translations.ts           # vi/en bilingual copy
│   └── package.json
│
├── backend/                          # FastAPI — API + 5 core modules + orchestrator
│   ├── app/
│   │   ├── api/routes/               # /check-ins, /recovery, /simulations, /recommendations, /chat, /safety
│   │   ├── recovery_intelligence/    # reads check-in history → Recovery Profile
│   │   ├── scenario_engine/          # workload_model.py — estimates plan load (rule-based)
│   │   ├── planner/                  # generates & ranks alternative plans
│   │   ├── safety/                   # red-flag rules, deterministic, no LLM
│   │   ├── orchestrator/             # pipeline.py — Safety → Planner → RAG → Composer
│   │   │                             # chat_composer.py — wording layer for the Guideline Assistant
│   │   └── db/                       # SQLite for local dev / Postgres in production (see §6)
│   └── tests/                        # 112 tests
│
└── rag/                              # RAG evidence service — its own FastAPI app, port 8100
    ├── src/
    │   ├── ingestion/                 # PDF → text → chunks
    │   ├── embeddings/                # sentence-transformers/all-MiniLM-L6-v2
    │   ├── vectordb/                  # Chroma, audience hard-filter
    │   └── retrieval/                 # retriever + cross-encoder re-ranker + benchmark
    ├── data/raw_guidelines/           # the 3 source guideline PDFs + sources.json (citation metadata)
    └── tests/                         # 10 tests
```

---

## 5. Running locally (verified)

The three services run independently; Docker/Postgres are not required for dev — the backend
defaults to SQLite (`backend/app/db/database.py`).

```bash
# Terminal 1 — RAG evidence service
cd rag
python -m venv .venv && .venv/Scripts/activate   # Windows; source .venv/bin/activate on Linux/Mac
pip install -r requirements.txt
python main.py ingest                             # builds the Chroma index from the 3 guideline PDFs (run once)
python -m uvicorn main:app --host 127.0.0.1 --port 8100

# Terminal 2 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# health check: http://127.0.0.1:8000/health

# Terminal 3 — Frontend
cd frontend
npm install
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env
npm run dev
```

`ANTHROPIC_API_KEY` is **optional** (`backend/.env`, `rag/.env` — copy from `.env.example`).
Without a key, `/recommendations` and `/chat` still return full results via a grounded template
composer (`model_used: "deterministic-grounded-template"`); with a key, Claude only rephrases —
it never changes the decision or the citations.

CI (`.github/workflows/ci.yml`) automatically runs tests and builds Docker images for
`backend`/`rag`, and typechecks + builds the `frontend`, on every push/PR to `main`.

---

## 6. Deployment — Render

RE:ENTRY is deployed on **Render** as 4 managed resources, defined in one
[`render.yaml`](render.yaml) Blueprint and deployed with a single `Apply`:

| Resource | Render service type | Role |
|---|---|---|
| `reentry-db` | Managed Postgres | Persistent storage for check-ins and simulation history — replaces the SQLite file used for local dev |
| `reentry-rag` | Web Service (Docker) | RAG evidence service — the Chroma index is **baked into the image at build time** (`RUN python main.py ingest` in [`rag/Dockerfile`](rag/Dockerfile)), so the container serves real citations immediately on boot instead of needing a first-run ingestion step against an ephemeral disk |
| `reentry-backend` | Web Service (Docker) | FastAPI backend — the 5 core modules + orchestrator |
| `reentry-frontend` | Static Site | The React app, built with `npm run build` and served from Render's CDN |

**Live demo:** https://reentry-frontend-4jw2.onrender.com

What the Blueprint actually wires together (not just "deployed", but designed for the platform):

- `reentry-backend`'s `DATABASE_URL` and `reentry-rag`'s hostname are injected automatically via
  Render's `fromDatabase` / `fromService` blueprint references — no URL is hardcoded anywhere in
  the app config.
- [`backend/app/db/database.py`](backend/app/db/database.py) reads `DATABASE_URL` from the
  environment, falling back to `sqlite:///./concussion.db` only when the variable is absent — the
  exact same code path targets Render's managed Postgres in production and SQLite for a
  zero-setup local dev run.
- Both backend Dockerfiles bind to `${PORT}` at runtime (Render assigns this dynamically per
  deploy) instead of a hardcoded port.
- A dedicated `.dockerignore` in both `backend/` and `rag/` keeps the build context lean (the
  `rag/` local virtualenv alone is 1.3GB and must never be sent to the Docker daemon).

Every piece of this was built and verified against a real, locally-built Docker image before
being pushed — including confirming the RAG container returns the exact same relevance scores as
the existing retrieval benchmark once deployed with the baked-in index.

To reproduce the same setup: `New` → `Blueprint` on Render, connect this repository, point it at
`main`, and `Apply`. `ANTHROPIC_API_KEY` can be left blank (see §5).

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite, TailwindCSS, Recharts |
| Backend | Python, FastAPI, SQLAlchemy + SQLite (local dev) / Postgres (Render, docker-compose) |
| Recovery Intelligence / Scenario Engine / Planner | Pure Python, rule-based/deterministic — no LLM at the computation step |
| RAG | `pypdf`, `sentence-transformers/all-MiniLM-L6-v2`, ChromaDB, `cross-encoder/ms-marco-MiniLM-L-6-v2` re-ranking |
| LLM (wording layer, optional) | Claude (Anthropic API) — deterministic fallback when no key is set |
| Deploy | Render (Blueprint: managed Postgres + 2 Docker web services + 1 static site); CI via GitHub Actions |

---

## 8. Guideline sources (evidence layer)

| Audience | Source |
|---|---|
| Adult | Living Concussion Guidelines for Adults, 3rd Edition |
| Pediatric | PedsConcussion Living Guideline |
| Sport | Consensus statement on concussion in sport — 6th International Conference (Amsterdam 2022) |

Full metadata (title, publisher, year, DOI, canonical URL, SHA-256) is in
[`rag/data/raw_guidelines/sources.json`](rag/data/raw_guidelines/sources.json).

---

## 9. Disclaimer

This product was built for hackathon/demo purposes. RE:ENTRY is not a medical device, does not
diagnose any condition, and does not replace professional medical advice or care.
