# Track A Contract (v2 — APPROVED / FROZEN FOR TRACK A IMPLEMENTATION ARCHITECTURE)

**Status:** Approved and frozen for Track A implementation architecture, incorporating round-1 decisions, round-2 corrections, and the round-3 documentation corrections (field-name alignment, canonical E-006a wording, removal of unauthorized fields, §42 contradictory-data ownership). This document governs Track A's data model, schemas, and API contract. Any further change requires an explicit new review round.
**Applies:** all five round-1 decisions + all ten round-2 corrections + all round-3 documentation corrections.

---

## 1. Data Model

Unchanged from v1:

```text
users             — demo users only (see §5), no auth table
daily_checkins    — one row per user per date, raw self-report, UPSERT semantics (see §1.2)
activity_catalog  — static reference: activity_id → engineering load parameters
simulations       — one row per simulation request: input plan + output result
```

Not built for MVP (unchanged rationale from v1): `plans` as a standalone entity, `activity_responses` as a persisted table (computed on read instead).

### 1.1 `users`

```text
user_id         string, primary key   e.g. "demo_improving"
display_name    string
persona_type    enum: improving | stable | overload | insufficient_data
created_at      timestamp
```

### 1.2 `daily_checkins` — **UPSERT semantics frozen (correction #1)**

```text
checkin_id                     string, primary key (uuid)
user_id                        string, foreign key -> users.user_id
checkin_date                   date  — UNIQUE per (user_id, checkin_date)
headache                       int, 0-3
dizziness                      int, 0-3
blurred_vision                 int, 0-3
nausea                         int, 0-3
concentration_difficulty       int, 0-3
sleep_hours                    float, nullable, 0-24
sleep_quality                  int, 0-3, nullable
screen_time_minutes            int, >=0
study_work_minutes             int, >=0
symptoms_worsened_after_activity  enum: not_applicable | no | mild | moderate | severe
mood                           int, 0-3, nullable   (display/context only — never scored, E-008)
created_at                     timestamp
updated_at                     timestamp, nullable   — set on upsert
```

**Frozen rule:** exactly one check-in row exists per `(user_id, checkin_date)`. A second `POST /check-ins` for the same `(user_id, checkin_date)` is an **UPDATE/UPSERT** of that row, not a new record and not a rejected duplicate. See §6 for the exact response contract.

### 1.3 `activity_catalog`

```text
activity_id              string, primary key   e.g. "coding", "class", "exercise", "rest"
activity_type             enum: cognitive | physical | screen | social | rest | commute | academic
cognitive_demand_weight   int, 0-100   — ENGINEERING PARAMETER ONLY (E-011; see §4.3 disclaimer)
physical_demand_weight    int, 0-100   — ENGINEERING PARAMETER ONLY
screen_exposure_weight    int, 0-100   — ENGINEERING PARAMETER ONLY
recovery_opportunity      int, 0-100   — ENGINEERING PARAMETER ONLY
```

### 1.4 `simulations`

```text
simulation_id           string, primary key (uuid)
user_id                 string, foreign key -> users.user_id
created_at               timestamp
input_activities         json   — see §4.1
recovery_state_snapshot  json   — Recovery State at time of simulation (see §3)
result                   json   — Scenario Result (see §4.2)
```

Stored as a snapshot for reproducible before/after comparison, unchanged from v1.

### 1.5 RE_ENTRY.md §42 — Contradictory Data (ownership resolved, round-3 correction #5)

**Ownership:** Detecting internally inconsistent check-in submissions is **Track A's responsibility**, as an extension of the input validation Track A already owns for `POST /check-ins`. It is not part of Track B's Safety Layer, since it concerns the structural validity of a single submission, not a clinical red-flag judgment. This does not introduce a new endpoint or a new field — it is a validation rule applied within the existing `POST /check-ins` request handling, reported through the existing 422 error contract already defined in §6.

**What Track A validates:** Using only the fields already present in the frozen `daily_checkins` schema (§1.2), a submission is flagged as internally contradictory if the self-reported time-based fields for the same `checkin_date` are jointly impossible within a single day:

```text
screen_time_minutes + study_work_minutes + (sleep_hours × 60, if sleep_hours is provided) > 1440
```

(1440 = minutes in a day.) This is a pure arithmetic bound on fields the user themselves reported for the same day — not a clinical judgment, not a new field, and not an inference about any field not already in the schema. No other cross-field contradiction is defined, since the frozen schema has no second, independent data source (e.g., a device-reported sleep log) that a self-report could conflict with — inventing one would be a new feature, which this correction explicitly avoids.

**What Track A returns:** The existing `POST /check-ins` validation-error response (§6, 422) is used unchanged in shape, with this check added as one more validation rule:

```json
{
  "status": "error",
  "error_type": "validation_error",
  "details": [
    {
      "field": "screen_time_minutes,study_work_minutes,sleep_hours",
      "issue": "Reported values for this day exceed 24 hours combined. Please review and resubmit."
    }
  ]
}
```

The check-in is **not saved** in this state — consistent with how every other validation rule in this schema already behaves (out-of-range 0–3 scale values, future dates, etc.), and consistent with `RE_ENTRY.md` §42's instruction not to silently resolve a conflict. This keeps the behavior inside the mechanism Track A already owns, rather than adding a blocking/escalation feature, which remains Track B Safety's domain (`RE_ENTRY.md` §34–38) for any future red-flag-level conflict Track B may define on top of this.

---

## 2. Data Sufficiency Thresholds — **explicitly relabeled (correction #7)**

```text
insufficient   : < 3 check-ins in the last 14 days
limited        : 3-6 check-ins in the last 14 days
moderate       : 7-13 check-ins in the last 14 days
strong         : >= 14 check-ins in the last 14 days
```

**These are engineering thresholds for personalization-data availability only.** They describe how much self-report history exists to compute a pattern. They are **not**:
- a measure of clinical validity,
- a measure of clinical reliability,
- a measure of how "recovered" the underlying data suggests the person is.

`activity_response` pattern detection additionally requires **at least 3 qualifying exposure→next-day-symptom day-pairs**, and per correction #9 (E-006a), an activity-specific claim additionally requires that the exposure day's activity composition is actually known — not just an aggregate demand number.

---

## 3. Recovery State Schema

```json
{
  "user_id": "demo_stable",
  "as_of_date": "2026-08-12",
  "window_days": 14,
  "checkin_count_in_window": 9,

  "trend": "stable",
  "data_sufficiency": "moderate",
  "uncertainty": "moderate",

  "observed_patterns": [
    {
      "pattern_id": "study_work_exposure_next_day_symptoms",
      "type": "activity_response",
      "category": "user_specific_observed_pattern",
      "description": "In your recent records, days with higher study/work exposure have been followed by higher reported symptoms the next day.",
      "strength": "moderate",
      "basis": "user_pattern",
      "supporting_days": 5,
      "activity_attributed": true
    }
  ],

  "limitations": [
    "Based on synthetic self-reported data only.",
    "Not a validated clinical measurement.",
    "Correlational observation only; not a causal claim.",
    "Trend labels describe a recent self-reported symptom pattern, not a medical recovery status."
  ]
}
```

Changes from v1:
- Added `observed_patterns[].category` — always `"user_specific_observed_pattern"` in this schema (category (b) from the evidence matrix); no Recovery State field is ever category (a) clinical-evidence framing, since trend/pattern detection is entirely self-referential to the user's own data.
- Added `observed_patterns[].activity_attributed` (boolean) — **required per correction #9**. `true` only if the governance in Evidence Matrix E-006a is satisfied (exposure-day activity composition known + minimum pairing met). If `false`, `description` must use non-activity-specific language (e.g., "higher overall exertion days" rather than naming an activity type).

Field constraints (unchanged from v1):

| Field | Type | Allowed values |
|---|---|---|
| `trend` | enum | `improving`, `stable`, `worsening`, `insufficient_data` (internal identifier — see §7 UI-copy rule) |
| `data_sufficiency` | enum | `insufficient`, `limited`, `moderate`, `strong` |
| `uncertainty` | enum | `low`, `moderate`, `high` |
| `observed_patterns[].strength` | enum | `weak`, `moderate`, `strong` |

Still no numeric percentage / "capacity" field anywhere in this schema.

---

## 4. Scenario Result Schema

### 4.1 Scenario Input (`POST /simulations` request) — **duration semantics clarified (correction #4)**

```json
{
  "user_id": "demo_stable",
  "activities": [
    { "activity_id": "class", "duration_minutes": 90 },
    { "activity_id": "coding", "duration_minutes": 120 },
    { "activity_id": "exercise", "duration_minutes": 30 },
    { "activity_id": "social", "duration_minutes": 60 }
  ],
  "label": "original_plan"
}
```

**Frozen semantics (correction #4):**
- `duration_minutes` represents **one continuous block** of that activity, exactly as submitted. The engine does not infer sub-breaks within a block.
- The engine must **not** infer the existence *or* absence of a recovery break **between** listed activities unless the input explicitly represents one (e.g., a `"rest"` activity_id entry between two blocks, if the user adds it).
- Consequently: the system must never generate explanation text claiming a plan "has no recovery break" or "was continuous for N hours" *across* activities unless a gap is genuinely absent from the input list — and even then, phrasing must say "the submitted plan does not include a rest activity between X and Y," not "the user did not rest," since real-world rest the user took but didn't log is unknown to the system.
- Within a single activity entry, describing it as "a 120-minute continuous block" is accurate **only because that's exactly what the input declares** — this is a restatement of the input, not an inference about what the user actually did.

### 4.2 Scenario Result (response) — **field renamed + explanation factors tagged (corrections #2, #3)**

```json
{
  "simulation_id": "sim_00042",
  "user_id": "demo_stable",
  "created_at": "2026-08-12T09:00:00Z",

  "recovery_state_snapshot": {
    "trend": "stable",
    "data_sufficiency": "moderate",
    "uncertainty": "moderate"
  },

  "modeled_demand": {
    "cognitive_demand_level": "high",
    "physical_demand_level": "low",
    "screen_exposure_level": "high",
    "recovery_opportunity_level": "low"
  },

  "plan_recovery_alignment": "low_alignment",

  "modeled_overload": true,

  "main_concerns": [
    "high_cognitive_demand",
    "no_declared_recovery_activity_in_plan"
  ],

  "explanation_factors": [
    {
      "factor": "sustained_cognitive_block",
      "category": "engineering_model_inference",
      "direction": "increases_concern",
      "description": "The submitted plan includes a 120-minute continuous coding block, as declared in the input."
    },
    {
      "factor": "recent_pattern_context",
      "category": "user_specific_observed_pattern",
      "direction": "increases_concern",
      "description": "In your recent records, days with higher study/work exposure have been followed by higher reported symptoms the next day.",
      "activity_attributed": true
    }
  ],

  "uncertainty": "moderate",
  "data_sufficiency": "moderate",

  "limitations": [
    "Modeled demand values are engineering heuristics, not clinical exertion or risk measurements.",
    "This is not a medical safety determination.",
    "The engine does not infer recovery breaks that were not explicitly included in the submitted plan."
  ]
}
```

**Changes from v1:**
1. **`overload` → `modeled_overload`** (correction #3) — renamed everywhere: schema, `main_concerns` semantics, and any downstream Track B consumption. This is a breaking rename from the v1 draft; flagging clearly since Track B has not yet built against v1.
2. **`main_concerns` vocabulary updated** — `limited_recovery_opportunity` replaced with `no_declared_recovery_activity_in_plan` to avoid implying the engine knows whether the user actually rested (correction #4). Full updated fixed vocabulary: `high_cognitive_demand`, `high_physical_demand`, `high_screen_exposure`, `no_declared_recovery_activity_in_plan`, `long_continuous_block`, `insufficient_data`.
3. **`explanation_factors[].category`** — now required on every entry, one of `clinical_evidence` (blocked from use until citations verified — see §8 below), `user_specific_observed_pattern`, or `engineering_model_inference`. This is the mechanism the Evidence Gate (correction #2) uses downstream: Track B's output validation can mechanically reject any `clinical_evidence`-tagged factor that doesn't carry a verified citation reference.
4. **`explanation_factors[].activity_attributed`** — present when `category = user_specific_observed_pattern`, mirrors the Recovery State field, enforces correction #9 at the simulation level too.

Field constraints:

| Field | Type | Allowed values |
|---|---|---|
| `modeled_demand.*_level` | enum | `low`, `medium`, `high` |
| `plan_recovery_alignment` | enum | `good_alignment`, `moderate_concern`, `low_alignment`, `insufficient_data_to_assess` |
| `modeled_overload` | boolean | Internal modeling flag — UI copy must render this as "modeled overload," never "unsafe" or "dangerous" |
| `main_concerns[]` | enum list | See updated vocabulary above |
| `explanation_factors[].category` | enum | `clinical_evidence`, `user_specific_observed_pattern`, `engineering_model_inference` |
| `explanation_factors[].direction` | enum | `increases_concern`, `decreases_concern`, `neutral_context` |

### 4.3 Activity weight disclaimer (correction #5, restated at the contract level)

`activity_catalog` weights and `modeled_demand` levels derived from them are **engineering parameters used only for relative scenario comparison** (this plan vs. that plan, for the same user). They are not clinical exertion measurements, not recovery measurements, and not risk probabilities. No API response, UI string, or explanation factor may describe an activity as "medically safe" or "medically unsafe" based on these weights, individually or combined.

---

## 5. Demo Users

Unchanged from v1: `demo_improving`, `demo_stable`, `demo_overload`, `demo_insufficient_data`. No auth. `user_id` remains a first-class field everywhere for future extensibility.

---

## 6. Frozen API Endpoints

```http
POST /check-ins
GET  /check-ins?user_id={user_id}
GET  /recovery/profile/{user_id}
POST /simulations
```

### `POST /check-ins` — **upsert response contract frozen (correction #1)**

Request: `daily_checkins` fields from §1.2 (minus `checkin_id`/`created_at`/`updated_at`).

Response — **new check-in** (201):
```json
{ "checkin_id": "chk_00113", "status": "created" }
```

Response — **resubmission for an existing `(user_id, checkin_date)`** (200):
```json
{ "checkin_id": "chk_00113", "status": "updated" }
```

Response (validation error, 422): unchanged from v1, now including the contradictory-data check defined in §1.5 (round-3 correction #5) as one additional validation rule under this same error shape.

This resolves the round-1 open item: resubmission is always an update to the existing row (identified by the unique `(user_id, checkin_date)` constraint), never a duplicate insert and never a rejected conflict.

### `GET /check-ins?user_id={user_id}` — unchanged from v1.

### `GET /recovery/profile/{user_id}` — unchanged from v1, response now includes the fields added in §3 (`category`, `activity_attributed`).

### `POST /simulations` — response now uses `modeled_overload` (renamed) and the updated `main_concerns`/`explanation_factors` shape from §4.2.

---

## 7. User-Facing Copy Rule (correction #6, new section)

Backend enums (`trend`, `data_sufficiency`, `uncertainty`, etc.) are internal identifiers. This is a **frontend/copy constraint**, not a schema constraint, but is recorded here since it governs how Track A's frontend layer may render these fields:

| Never say | Say instead |
|---|---|
| "Your recovery is improving" | "Your recent symptom pattern: improving" |
| "You are recovered" | (not a claim this system makes, ever) |
| "This plan is medically unsafe" | "This plan has higher modeled demand relative to your recent pattern" |
| "Coding caused your headache" | "In your recent records, days with higher study/work exposure have been followed by higher reported symptoms the next day" |

---

## 8. Evidence Gate Enforcement Point (correction #2, new section)

The Evidence Gate is enforced structurally, not just as a writing guideline:

- Every `explanation_factors[]` entry Track A's Scenario Engine produces must carry `category`.
- Track A will never itself set `category = "clinical_evidence"` in the MVP, since Track A has no verified citations to attach (RAG/citation verification is Track B's ownership). Track A's own output should only ever emit `user_specific_observed_pattern` or `engineering_model_inference`.
- If Track B's Planner/Orchestrator later merges in a genuinely citation-backed clinical factor, that is Track B's responsibility to tag and verify — Track A's contract obligation is limited to **not fabricating category (a) content itself** and to **exposing the category field so downstream validation is possible.**

---

## 9. Python Interfaces Exposed to Track B — unchanged from v1

```python
def calculate_activity_load(activities: list[ActivityInput]) -> ModeledDemand: ...
def simulate_scenario(recovery_state: RecoveryState, activities: list[ActivityInput]) -> ScenarioResult: ...
```

Signature unchanged; return shape now reflects the `modeled_overload` rename and `explanation_factors[].category`.

---

## 10. Explicit Non-Conformance With Old In-Repo Docs — unchanged from v1

Still overrides `docs/task-split-notion.csv` naming/fields and the frontend's existing `AIRecommendation` schema, per Decision #4.