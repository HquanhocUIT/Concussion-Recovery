# Track A — Clinical Evidence Matrix (v2 — REVISED, FOR REVIEW)

**Status:** Proposed revision applying corrections from review round 2. Still not approved for implementation.
**Scope:** Track A check-in fields and activity-load parameters only. Red-flag/diagnosis/treatment logic remains Track B's Safety layer.

## How to read this matrix

Every row now separates **six** things instead of collapsing them together, per correction #8:

1. **Evidence claim** — what general concussion-recovery concept this touches (domain-level, not a specific numeric claim).
2. **Clinical interpretation** — what a clinician/guideline would conclude from this signal, in general terms.
3. **Allowed product use** — exactly what RE:ENTRY is permitted to do with this field.
4. **Forbidden clinical interpretation/use** — explicit red lines for this field.
5. **Engineering heuristic** — any threshold, weight, or scoring rule Track A invents that is *not* clinically validated.
6. **Implementation / Test** — where this lives in code.

**Citation status:** every "Exact supporting passage" remains `PENDING — requires verification against ingested guideline text`. Per correction #2 (Evidence Gate), **no user-facing copy may cite these rows as evidence-backed clinical guidance until that verification happens.** Until then, these rows justify *engineering design decisions* (why a field exists) but must not appear as "According to [guideline]..." in any UI string.

**Three-way distinction enforced everywhere in this document (correction #2c):**
- **(a) Clinical evidence** — general literature concept, PENDING citation, usable only for internal design rationale until verified.
- **(b) User-specific observed pattern** — derived only from *this user's own* check-in history, always labeled "in your recent records."
- **(c) Engineering/model inference** — a heuristic calculation (e.g., activity weight, demand level) with no clinical validation claim at all.

---

## A. Symptom check-in fields

### E-001 — `headache`
- **Evidence claim:** Headache is tracked as a core symptom domain in standard post-concussion symptom inventories referenced by consensus concussion guidance (6th CIS/Amsterdam 2022 family).
- **Clinical interpretation (general, not user-specific):** Persistent or worsening headache is a symptom clinicians monitor during recovery.
- **Allowed product use:** Include as a self-report input to (b) user-specific trend/pattern detection. Display raw self-reported value back to the user.
- **Forbidden clinical interpretation/use:** Must not be used to diagnose migraine, post-traumatic headache disorder, or any condition. Must not be converted into a clinical severity score.
- **Engineering heuristic:** 0–3 self-report scale is a UX simplification, not a validated instrument (e.g., not the same as PCSS scoring).
- **Exact supporting passage:** PENDING
- **Evidence strength:** Medium (general concept), unverified citation
- **Implementation:** `recovery/trend_analysis.py`, `daily_checkins.headache`
- **Test:** `test_recovery_trend_headache_*`

### E-002 — `dizziness`
Same structure as E-001. **Evidence claim:** dizziness/balance disturbance is a recognized symptom domain. **Forbidden:** must not be used to infer vestibular diagnosis. **Exact supporting passage:** PENDING. **Implementation/Test:** `test_recovery_trend_dizziness_*`.

### E-003 — `blurred_vision`
Same structure. **Evidence claim:** visual disturbance is a recognized symptom domain. **Forbidden:** must not be used to infer ocular/visual diagnosis. **Exact supporting passage:** PENDING. **Test:** `test_recovery_trend_vision_*`.

### E-004 — `nausea`
Same structure. **Forbidden:** must not be used to infer GI or vestibular diagnosis. **Exact supporting passage:** PENDING. **Test:** `test_recovery_trend_nausea_*`.

### E-005 — `concentration_difficulty`
**Evidence claim:** cognitive symptoms are a recognized domain, relevant to return-to-learn/work framing generally. **Allowed use:** contributes to (c) engineering demand/alignment modeling as one input among several. **Forbidden:** must not be used to infer a cognitive-impairment diagnosis or a specific neuropsychological deficit. **Exact supporting passage:** PENDING. **Test:** `test_recovery_trend_cognitive_*`.

### E-006 — `symptoms_worsened_after_activity`
- **Evidence claim:** Symptom exacerbation following exertion is the general concept underlying graded/staged return-to-activity guidance (activity reintroduced without provoking more than mild, transient increase).
- **Clinical interpretation (general):** Guidance suggests titrating activity based on symptom response.
- **Allowed product use:** Primary input to (b) user-specific `activity_response` pattern detection — see E-006a governance below (correction #9). Also feeds (c) `plan_recovery_alignment` engineering calculation.
- **Forbidden clinical interpretation/use:** Must not be reported as "this activity caused your symptoms" (causal claim) or as any determination of concussion severity/recovery stage.
- **Engineering heuristic:** The mapping from this field to `plan_recovery_alignment` levels is an engineering rule, not a clinical scoring instrument.
- **Exact supporting passage:** PENDING
- **Implementation:** `recovery/activity_response.py`
- **Test:** `test_activity_response_worsening_*`

**E-006a — Activity-specific attribution governance (correction #9):**
An observed pattern may only name a *specific activity type* (e.g., "cognitive-demand days") if the check-in data actually establishes both:
1. which activity/activities occurred on the exposure day (not just an aggregate demand number), and
2. a consistent temporal relationship (exposure day → next reported day) across at least the minimum-pairing threshold (§2 of the contract, currently 3 qualifying day-pairs).

If the data cannot establish which activity type was involved (e.g., only an aggregate `modeled_demand` exists, or the user logged symptoms but no matching prior-day activity plan), the system must **not** name an activity. It must instead report either:
- a broader, non-activity-specific observed pattern (e.g., "higher symptom days have followed higher overall exertion days"), or
- `insufficient_data` if even that broader pairing doesn't meet the minimum threshold.

### E-007 — `sleep_hours` / `sleep_quality`
- **Evidence claim:** Sleep disruption is a recognized symptom/monitoring domain post-concussion.
- **Clinical interpretation:** General guidance encourages sleep monitoring; no validated hour-based threshold is established here.
- **Allowed product use:** (b) contextual trend input only.
- **Forbidden:** Must not assert a specific "hours of sleep needed for recovery" claim — no such validated number exists in this project's evidence base.
- **Engineering heuristic:** Any threshold used internally (if any) is a design choice, not a clinical cutoff, and must be documented as such if implemented.
- **Exact supporting passage:** PENDING
- **Test:** `test_recovery_trend_sleep_*`

### E-008 — `mood`
- **Evidence claim:** Emotional symptoms are a recognized symptom domain generally.
- **Allowed product use:** Contextual wellbeing display only — **excluded from all scoring** (`trend_analysis`, `activity_response`, `modeled_demand`).
- **Forbidden clinical interpretation/use:** Must never be converted into a recovery score, must never be described as a clinical mood/depression/anxiety assessment.
- **Exact supporting passage:** PENDING
- **Test:** `test_mood_not_used_in_trend_score` (asserts mood has zero weight in any computed field)

## B. Activity / exposure fields

### E-009 — `screen_time_minutes`
- **Evidence claim:** Screen-based cognitive/visual exertion is generally included as an exposure type in graded return-to-learn/activity framing.
- **Allowed product use:** (c) Engineering input to `workload_model.py`'s `screen_exposure_level`.
- **Forbidden:** No specific minute-based threshold in this field is clinically validated. Must never be presented as "X minutes of screen time is medically safe/unsafe."
- **Engineering heuristic:** All weighting/thresholds here are product design choices.
- **Exact supporting passage:** PENDING
- **Test:** `test_workload_screen_time_*`

### E-010 — `study_work_duration`
Same governance as E-009 for cognitive exertion. **Forbidden:** no minute-based threshold is clinically validated. **Exact supporting passage:** PENDING. **Test:** `test_workload_study_*`.

### E-011 — Activity ontology weights (`activity_catalog` table: `cognitive_demand_weight`, `physical_demand_weight`, `screen_exposure_weight`, `recovery_opportunity`)
- **Evidence claim:** None directly — no specific numeric weight (e.g., "coding = 40") is drawn from literature.
- **Clinical interpretation:** N/A.
- **Allowed product use:** Used **only** for internal, relative **scenario comparison** — i.e., ranking "this plan" against "that plan" for the same user, not as an absolute measurement.
- **Forbidden clinical interpretation/use (correction #5, explicit):**
  - These weights are **not** clinical exertion measurements.
  - They are **not** recovery measurements.
  - They are **not** risk probabilities.
  - No activity may be labeled "medically safe" or "medically unsafe" based on its weight, individually or in combination.
  - The weights must not be exposed to the user as raw numbers (per Decision #1) — only as derived `low/medium/high` levels in the Scenario Result.
- **Engineering heuristic:** 100% of this row — explicitly and entirely a product design construct.
- **Exact supporting passage:** N/A — not literature-derived by design.
- **Test:** `test_activity_weights_deterministic_*`, `test_activity_weights_not_exposed_as_clinical_measurement`

## C. Fields excluded from the core model

| Field | Disposition | Rationale |
|---|---|---|
| `social_support` | Excluded | No documented decision this field drives in Track A's Recovery State, Scenario Engine, or Safety layer. |
| `overwhelm_level` | Excluded | Overlaps conceptually with symptom/mood fields already captured; no distinct decision it uniquely informs. |

## D. Cross-cutting rules (updated)

1. **Evidence Gate (correction #2):** No user-facing string may say or imply "this is evidence-based guidance" for any PENDING row. Permitted user-facing framings for these rows, until citations are verified:
   - "In your recent records, ..." → (b) user-specific observed pattern — **always allowed**, since it's about the user's own data, not a literature claim.
   - "This plan has [low/medium/high] modeled demand" → (c) engineering inference — **always allowed**, labeled as modeled/engineering.
   - "According to concussion recovery guidelines, ..." → (a) clinical evidence claim — **blocked** until citation verification is complete. This applies to any explanation text Track A hands to Track B's LLM explanation layer as well: Track A must tag which category (a/b/c) each factor belongs to in `explanation_factors[]` (see revised contract §4.2) so Track B's Safety/Output-validation layer can enforce this gate downstream.
2. **Trend wording (correction #6):** Backend enum values (`improving`/`stable`/`worsening`/`insufficient_data`) are internal identifiers only. Any user-facing copy referencing them must use phrasing such as "recent symptom pattern: improving" or "your recent check-ins suggest a stable pattern" — never "your recovery is improving" or "you are recovered."
3. **Data sufficiency labeling (correction #7):** The thresholds in Contract §2 are explicitly **engineering thresholds for personalization-data availability** — they describe how much self-report history exists to compute a pattern, not clinical validity, not clinical reliability, and not a measure of how "recovered" the data suggests someone is.

---

**No open items remain from round 1** — both flagged questions (resubmission semantics, evidence-gate policy) are now resolved by corrections #1 and #2 respectively.
