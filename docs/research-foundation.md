# Research Foundation — Workload Model

Track A + B (joint) — Phase 5, Research documentation & citation.

## 1. Purpose of this document

This document explains **why** the workload formula in
[`backend/app/scenario_engine/workload_model.py`](../backend/app/scenario_engine/workload_model.py)
and the weight table in
[`backend/app/scenario_engine/activity_catalog.py`](../backend/app/scenario_engine/activity_catalog.py)
reflects the **graded, symptom-limited return to activity** principle — the core clinical
principle shared by all 3 guideline sources used for RAG (Track B):

- Living Concussion Guidelines for Adults, 3rd Edition (`living-concussion-guidelines-adults-3e`)
- PedsConcussion Living Guideline (`pedsconcussion-living-guideline`)
- Amsterdam 2022 Consensus Statement (`amsterdam-2022-consensus`)

**What this document does NOT do:** it does not claim that the specific numeric weights (e.g.
`cognitive_demand_weight=80` for coding) are measured or clinically validated data. The code
itself states this in its docstring: *"ENGINEERING HEURISTICS FOR MVP... NOT clinically validated
scores"*. This document only explains the model's **direction and structure** — which activity is
treated as heavier than which, and why — following the qualitative principle in the guidelines,
not claiming quantitative precision.

## 2. Foundational clinical principle: Graded, symptom-limited return to activity

All 3 sources agree on one shared principle, which replaced the older recommendation of
"prolonged complete rest": after a short initial rest period, a patient should **gradually
increase activity below the symptom-exacerbation threshold** (sub-symptom threshold), rather than
either resting completely or resuming normal activity outright.

> "...in pre-injury activities while minimizing symptom exacerbations. Patients should be
> advised that subsymptom threshold levels of activity are recommended. When symptom
> exacerbations occur, patients should be advised to temporarily reduce their physical and
> cognitive demands and resume graduated return-to-activity at a slower pace."
> — Living Concussion Guidelines (Adults), p. 65, *GENERAL CONSIDERATIONS REGARDING REST AND
> RETURN TO ACTIVITY*

> "...those who are not tolerating a graduated return to physical activity, or those who are
> slow to recover..."
> — PedsConcussion Living Guideline, p. 29

> "Beyond an initial period of cognitive and physical rest (24-48 hours after injury), use of
> devices with screens may be gradually resumed at a level..."
> — PedsConcussion Living Guideline, p. 6

This is why `workload_model.py` is designed to compare the **relative severity** between
activities and between plan alternatives — because the clinical principle calls for exactly that:
knowing which activity/plan is "heavier" so it can be deliberately reduced, not computing an
absolute risk score.

## 3. Why the model uses 4 demand axes (cognitive, physical, screen, recovery)

The guidelines don't describe "workload" as a single number; symptoms are triggered by different
*types* of exertion, and the sources clearly distinguish between them:

- **Cognitive demand** — sustained mental/attentional effort. The sub-symptom-threshold pacing
  principle applies directly to cognitive activity:
  > "...encouraged to participate in low-risk physical and cognitive activities below their
  > symptom exacerbation threshold (at a level that does not bring on..."
  > — PedsConcussion Living Guideline, p. 58

- **Physical demand** — physical exertion. The same pacing principle applies, but the guidelines
  go further: controlled light aerobic exercise is documented as **beneficial** to recovery, not
  merely something to avoid:
  > "...used in PCS to establish a safe aerobic exercise treatment program to help speed
  > recovery and return to activity. The use of a provocative exercise test is consistent with
  > world expert consensus opinion..."
  > — Living Concussion Guidelines (Adults), p. 250

  This is the basis for why `walking` and `light_exercise` in the Activity Catalog are assigned a
  high `recovery_opportunity` (55 and 35) instead of being treated as pure burden, unlike a
  cognitive activity with the same low `physical_demand_weight`.

- **Screen exposure** — the guidelines separate screen time from cognitive demand in general,
  recommending early restriction after injury followed by a gradual increase:
  > "Beyond an initial period of cognitive and physical rest (24-48 hours after injury), use of
  > devices with screens may be gradually resumed at a level..."
  > — PedsConcussion Living Guideline, p. 6

  This is why the model splits `screen_exposure_weight` into its own axis instead of folding it
  into cognitive demand — e.g. `coding` (screen=90) is treated as heavier than printed `reading`
  (screen=15) even though both are active cognitive tasks, reflecting how the guidelines treat
  screen time as an independent symptom trigger.

- **Recovery opportunity** — because the principle is to *balance* exertion with recovery (not
  merely minimize exertion), the model needs an axis representing how much an activity "gives
  back" tolerance, so the Planner (Phase 3) can detect a plan that lacks a recovery activity
  (`no_declared_recovery_activity_in_plan`) — not just detect a plan that's "too heavy".

## 4. Why the relative ranking between activities is reasonable

The table below maps the relative demand ordering in the Activity Catalog against the
qualitative basis from the guidelines. This is **ordinal** logic (activity A is heavier than
activity B), not a claim that each number is a clinical measurement.

| Assumption in the catalog | Qualitative basis | Source |
|---|---|---|
| `coding` (cognitive=80, screen=90) is heavier than printed `reading` (cognitive=45, screen=15) | Sustained, active cognitive effort combined with continuous screen use — two compounding symptom triggers, versus printed reading as a single cognitive-effort trigger | Principle of separating screen exposure from cognitive demand, PedsConcussion p. 6; sub-symptom-threshold pacing, Adults p. 65 |
| `class_lecture` (cognitive=50) is lower than `studying` (cognitive=70) | Attending a lecture is passive reception; studying is active, self-directed effort — the guidelines treat active cognitive effort as something requiring closer pacing | Sub-symptom-threshold pacing applied to cognitive activity, PedsConcussion p. 58 |
| `walking` (recovery=55) and `light_exercise` (recovery=35) have a positive recovery_opportunity, not 0 | Light aerobic exercise is recommended as part of a recovery-supporting treatment, not just a "neutral" activity | Living Concussion Guidelines (Adults), p. 250 |
| `rest` is the reference point with recovery_opportunity=100 and every other demand = 0 | Complete rest is the standard clinical baseline for comparison — every other activity is evaluated *relative* to zero exertion | Implicit across the entire "graded return to activity" framework shared by all 3 sources — the starting state before gradual increase |
| `phone_social_media` has a low recovery_opportunity (20) despite being "leisure"/"downtime" | The guidelines treat screen time as a symptom trigger regardless of purpose (leisure or schoolwork) — "not schoolwork" is not automatically treated as recovery | Recommendation to restrict screen devices after injury, PedsConcussion p. 6 |

## 5. Limitations — what does NOT have a direct citation

Following the transparency principle around uncertainty documented in `docs/codex.md`
("citations must never be invented"), the following points are explicitly flagged as **not**
having a direct guideline source:

- **The specific numeric value of each weight** (e.g. why `coding` is 80 rather than 75 or 85) is
  an engineering design choice to create a relative comparison scale, not a clinical measurement.
  None of the 3 guidelines provides a quantitative severity scale for specific activity types.
- **The low/medium/high bucket thresholds** (`_LOW_HIGH_BOUNDARY = 34`,
  `_MEDIUM_HIGH_BOUNDARY = 66`) are a product choice explicitly documented in the code ("Not
  clinically derived — a fixed, documented product design choice"), not derived from any clinical
  threshold.
- **The 0-5 scale for `screen_time`/`sleep_quality` in the Daily Check-in** (see
  `frontend/src/config/recoveryConstants.ts`) is a product-defined exposure scale for data
  collection, not a validated measurement scale from the guidelines.
- A RAG query for "importance of adequate sleep for brain recovery" only returned passages
  describing the prevalence of sleep disturbance after injury (Living Concussion Guidelines,
  p. 238, p. 47), not a quantitative recommendation for minimum sleep hours — so `sleep_quality`
  in the workload/check-in currently has no direct citation for a specific threshold, and rests
  only on the general premise that "poor sleep is associated with worse symptoms".

## 6. Conclusion

The structure of `workload_model.py` (4 demand axes, duration-weighted averaging, used to compare
plan alternatives *relatively*) closely follows the graded, symptom-limited return to activity
principle shared by all 3 guideline-evidence sources. The specific numeric weights are an
engineering choice for the MVP, not clinical data — exactly as documented as a limitation in the
code and in `docs/codex.md`. This is why the system always presents `modeled_overload` as a
technical comparison result, not a medical "safe/unsafe" conclusion (see `docs/PHASE_3_4.md`
§Goal).
