# Implementation-Design Note: E-006a Activity Attribution (FINAL — v2)

**Scope:** Governs `recovery/activity_response.py` only. No contract or schema fields are added or changed — this note operationalizes the `activity_attributed` field already frozen in Contract v2 §3/§4.2, using only fields that already exist in `daily_checkins` (`screen_time_minutes`, `study_work_minutes`, and the five symptom fields).

**Hard rule (governs every rule below):** The system never claims an individual activity *caused* symptoms. Every output is a same-user, cross-day **temporal association**, always framed as "in your recent records."

**⚠️ ENGINEERING HEURISTIC DISCLAIMER (applies to every numeric value in this note):** All thresholds below — the 1.25× exposure multiplier, the +2 symptom-sum offset, the 5-check-in baseline minimum, and the 3-pair minimum — are **engineering heuristics chosen for this prototype**. They are **not** clinically validated thresholds, are **not** derived from the Clinical Evidence Matrix's literature-based rows, and must never be presented to a user, judge, or downstream system as medically meaningful cutoffs. They exist solely to make pattern-detection computable and deterministic.

---

### 1. What qualifies as an exposure day

Day `T` qualifies as an exposure day if a `daily_checkins` row exists for `T` with `screen_time_minutes` and `study_work_minutes` present (both required, non-nullable — automatic whenever a check-in exists).

Define `exposure_T = screen_time_minutes(T) + study_work_minutes(T)`.

A **baseline** must exist before `T` can be classified: at least **5** check-ins *(engineering heuristic)* in the trailing 14-day window ending the day before `T`. If fewer exist, `T` is excluded from pairing (see §7) — not imputed, not counted either way.

Baseline = rolling median of `exposure` over that trailing window.

`T` is an **elevated-exposure day** if `exposure_T >= 1.25 × baseline_median` *(engineering heuristic — 1.25× is not a clinical dose-response threshold)*.

### 2. What qualifies as a next-day response

Day `T+1` (exact next calendar date, no gap) qualifies as a response day if a `daily_checkins` row exists for `T+1`.

Define `symptom_sum(T+1) = headache + dizziness + blurred_vision + nausea + concentration_difficulty` (0–15). `mood` is never included (E-008).

Same baseline-availability rule as §1 (5 prior check-ins minimum, trailing 14-day median).

`T+1` is an **elevated-response day** if `symptom_sum(T+1) >= baseline_median_symptom_sum + 2` *(engineering heuristic — the "+2" offset is a design choice, not a clinical symptom-severity cutoff)*.

`symptoms_worsened_after_activity` (a same-day field on `T`) answers a different question and is not used in this cross-day calculation.

### 3. Same-day multiple activities

The schema only captures two exposure dimensions (`screen_time_minutes`, `study_work_minutes`) — never discrete activity types. Multiple-activity days are handled at the **dimension** level:

- Only `study_work_minutes` elevated → dimension = `"study/work exposure"`
- Only `screen_time_minutes` elevated → dimension = `"screen exposure"`
- Both elevated → dimension = `"combined cognitive/screen exposure"`

Always computable once `T` qualifies (§1) — never ambiguous at the dimension level, since both fields are required and numeric.

### 4. When `activity_attributed = true` — **corrected**

All of the following must hold:

- **(a)** At least **3** qualifying exposure→response pairs exist overall *(engineering heuristic, unchanged)*.
- **(b)** At least one single dimension (`"screen exposure"`, `"study/work exposure"`, or `"combined cognitive/screen exposure"`, per §3) individually accounts for **≥3** qualifying pairs — not 3 pairs pooled across different dimensions.
- **(c)** Those same ≥3 pairs *for that one dimension* all show an elevated next-day response (§2). Consistency is required within the attributed dimension itself, not just in aggregate.

If the 3 (or more) qualifying pairs are spread across different dimensions — e.g., 2 pairs are `"screen exposure"` and 1 pair is `"study/work exposure"` — **no dimension individually reaches the 3-pair minimum**, so `activity_attributed` cannot be `true` for either dimension, even though 3 pairs exist in total.

`description` names only the single qualifying dimension identified in (b)/(c).

### 5. When `activity_attributed = false`

Any of:
- fewer than 3 total qualifying pairs exist, **or**
- 3+ total pairs exist but no single dimension reaches ≥3 qualifying pairs on its own (the corrected cross-dimension case above), **or**
- baseline cannot be established for exposure or response (< 5 prior check-ins), **or**
- available elevated-exposure days lack a matched next-day response (§7).

When false, there is no coarser fallback signal below "dimension" in this schema, so: **false → `insufficient_data`.**

### 6. Minimum number of qualifying day-pairs

**3**, and per §4, those 3 must be concentrated in one dimension, not merely 3 in total across mixed dimensions. *(Engineering heuristic.)*

### 7. What happens when exposure composition is ambiguous

Dimension-level composition is never ambiguous once `T` qualifies as an exposure day (both fields required, non-null, numeric). The only real ambiguity source is **insufficient reference data to classify `T` at all** (baseline unavailable, §1). Such days are excluded from the pair pool entirely — not counted as neutral or negative evidence, and not counted toward any dimension's pair total.

### 8. Exact examples

- **Single-activity exposure:** `T`: `study_work_minutes=180` (baseline 90 → elevated), `screen_time_minutes=20` (baseline ~25 → not elevated). `T+1`: `symptom_sum` elevated. → Qualifying pair, dimension = `"study/work exposure"`.
- **Multiple-activity exposure:** `T`: `study_work_minutes=150` (elevated), `screen_time_minutes=200` (elevated). `T+1`: `symptom_sum` elevated. → Qualifying pair, dimension = `"combined cognitive/screen exposure"`.
- **Missing exposure:** No `daily_checkins` row exists for `T` (date gap). → `T` cannot serve as an exposure day; skipped, not imputed.
- **Missing next-day response:** `T` is elevated-exposure, but no `daily_checkins` row exists for `T+1`. → Pair excluded entirely.
- **Insufficient qualifying pairs (count):** Only 2 pairs found in the trailing window, both `"screen exposure"`. → `activity_attributed = false`, `insufficient_data`.
- **Insufficient qualifying pairs (distributed — new case per correction #1):** 4 total qualifying pairs exist: 2 `"screen exposure"`, 2 `"study/work exposure"`. No single dimension reaches 3. → `activity_attributed = false`, `insufficient_data`, even though 4 ≥ 3 in aggregate.

### 9. Exact user-facing wording when `activity_attributed = true`

> "In your recent records, days with higher [screen exposure / study-work exposure / screen and study-work exposure] have been followed by higher reported symptoms the next day."

(Bracketed segment filled deterministically from the single qualifying dimension in §4(b)/(c). Never uses "caused," "because of," or names a specific unlisted activity.)

### 10. Exact wording when `activity_attributed = false` / insufficient

> "We don't yet have enough matched activity-and-symptom data in your recent records to identify a reliable pattern."

---

All classification rules resolve to explicit numeric comparisons or explicit data-presence checks. Every branch in §4/§5, including the newly corrected cross-dimension case, has exactly one deterministic outcome, and every threshold is labeled as an engineering heuristic rather than a clinical cutoff. No API contract field, schema field, or feature was changed or added — this note only refines the internal logic behind the already-frozen `activity_attributed` boolean.

**TRACK A ARCHITECTURE READY FOR IMPLEMENTATION**
