# RE:ENTRY
## Master Product, Clinical, AI/ML & Engineering Specification
### Hack for Humanity 2026 — Concussion Recovery

**Document status:** MASTER / SOURCE OF TRUTH
**Implementation rule:** Claude must treat this document as the authoritative project specification unless a later explicit decision supersedes it.

---

# 0. PROJECT MISSION

RE:ENTRY is a **concussion-recovery decision-support system** designed to help people who are recovering from concussion reason about returning to everyday activities.

The system does not diagnose concussion, determine medical recovery, provide medical clearance, or replace professional care.

Its core purpose is:

> **Help a person understand how a planned day aligns with their recent recovery pattern, explore alternative plans, and understand the evidence and uncertainty behind the result.**

The central product idea is:

> **Move from recovery tracking to recovery decision simulation.**

The core experience is:

> **Check-in → Understand → Plan → Simulate → Adjust → Compare → Understand Why**

---

# 1. COMPETITION TRACK

## Primary track

**Concussion Recovery**

The competition's Concussion Recovery guide explicitly asks for innovative tools that support concussion recovery through evidence-based guidelines and responsible technology, while not replacing professional medical advice.

RE:ENTRY is therefore designed specifically around:

- concussion recovery;
- rehabilitation/re-entry;
- cognition and everyday activity;
- activity planning;
- evidence-based guidance;
- responsible technology;
- patient/caregiver support.

---

# 2. THE PROBLEM

## 2.1 The generic problem

A person recovering from concussion may experience symptoms such as:

- headache;
- dizziness;
- fatigue;
- cognitive difficulty;
- sensitivity to activity;
- difficulty returning to normal routines.

However, simply tracking symptoms does not fully solve the re-entry problem.

## 2.2 The critical pain point

The deeper problem is:

> **A person may begin feeling better but still be uncertain about how to resume everyday life without overdoing activity or unnecessarily withdrawing from normal life.**

For example, a student may have a day containing:

- classes;
- studying;
- coding;
- screen use;
- commuting;
- exercise;
- social activity.

The difficult question is not simply:

> "What symptoms do I have?"

It is:

> **"Given what I currently know about my recovery, how should I think about tomorrow's activity plan?"**

That uncertainty is the primary pain point RE:ENTRY addresses.

---

# 3. CORE USER INSIGHT

## The gap between feeling better and being ready.

Feeling better is not equivalent to:

> medically recovered.

RE:ENTRY therefore must never convert symptom improvement into a claim of recovery or clearance.

Instead, it supports:

> **reasoning about the next step.**

---

# 4. PRODUCT POSITIONING

## One-line description

> **RE:ENTRY is a concussion-recovery decision-support system that helps people plan and compare ways to return to everyday activities using longitudinal recovery information, scenario simulation, evidence, safety guardrails, and explicit uncertainty.**

## Short version

> **From recovery tracking to recovery decision simulation.**

## User-facing promise

> **Plan your next step with more context, not more pressure.**

---

# 5. WHAT RE:ENTRY IS NOT

RE:ENTRY must never position itself as:

- a doctor;
- a diagnostic tool;
- a concussion diagnosis system;
- a medical-clearance system;
- a treatment-prescription system;
- a system that determines whether a patient is "fully recovered";
- a system that guarantees an activity is safe;
- a system that predicts future symptoms with clinical certainty;
- a replacement for a clinician;
- a replacement for return-to-sport medical assessment.

It is:

> **A prototype decision-support and recovery-planning system.**

This boundary is mandatory because the competition explicitly requires tools to support rather than replace professional medical advice.

---

# 6. TARGET USER

Primary target:

> **A person recovering from concussion who is beginning to return to everyday activities.**

Examples:

- student returning to school;
- university student returning to studying;
- knowledge worker returning to work;
- person returning to ordinary daily routines.

Secondary users may include:

- caregivers;
- clinicians reviewing structured recovery information.

The MVP should prioritize the recovering individual rather than attempting to solve every stakeholder workflow simultaneously.

---

# 7. CORE PRODUCT DIFFERENTIATOR

RE:ENTRY is not primarily:

> symptom tracker + chatbot.

Its central interaction is:

# PLAN → SIMULATE → ADJUST → RE-SIMULATE

Example:

### Original plan

- class;
- prolonged coding;
- exercise;
- evening screen activity.

The system evaluates the plan using its structured recovery/decision model.

The user then changes:

- activity duration;
- activity intensity;
- timing;
- recovery breaks;
- activity composition.

The system simulates the modified plan again.

The user can compare:

> **Original Plan vs Adjusted Plan**

The purpose is not to tell the user:

> "Do less."

The purpose is:

> **Show how different plans interact differently with the system's modeled recovery constraints.**

This is the primary product experience and the most important demo moment.

---

# 8. WHY THIS IS DIFFERENT

The innovation should not be claimed as:

> "Nobody has ever built this."

That claim requires competitive research.

Instead, RE:ENTRY's defensible innovation is the combination and framing:

| Conventional approach | RE:ENTRY |
|---|---|
| Track symptoms | Track recovery patterns |
| Look at the past | Use recent history to inform planning |
| Generic advice | Personalized decision support |
| One recommendation | Compare multiple scenarios |
| Static dashboard | Interactive simulation |
| "How am I doing?" | "How should I think about tomorrow?" |
| AI chatbot | Structured decision engine + evidence + safety |
| Hidden uncertainty | Explicit uncertainty |

The Design & Innovation rubric rewards a fresh perspective on a significant problem and distinguishes highly fresh concepts from merely common hackathon ideas.

Therefore:

> **The innovation is not "we use AI."**

The innovation is:

> **Recovery becomes an interactive decision problem rather than only a tracking problem.**

---

# 9. PRODUCT PRINCIPLE

RE:ENTRY must NOT optimize for:

> maximum productivity.

It should optimize for:

> **a reasonable next step under uncertainty.**

The system should preserve as much of the user's intended daily life as reasonably possible while respecting:

- safety constraints;
- evidence;
- observed patterns;
- uncertainty;
- system scope.

This prevents the product from becoming a simplistic:

> "Just rest."

application.

---

# 10. CORE USER JOURNEY

The product should revolve around seven steps.

## 1. CHECK-IN

The user records relevant recovery information.

## 2. UNDERSTAND

RE:ENTRY summarizes recent patterns.

## 3. PLAN

The user creates a plan for the next day.

## 4. SIMULATE

The Scenario Engine evaluates the plan.

## 5. ADJUST

The user changes activities.

## 6. COMPARE

RE:ENTRY compares scenarios.

## 7. WHY?

The user can inspect:

- contributing factors;
- evidence;
- uncertainty;
- limitations.

This should feel like one coherent workflow rather than multiple disconnected features.

---

# 11. DAILY CHECK-IN

The check-in must minimize cognitive burden.

Potential inputs include:

- relevant symptoms;
- sleep;
- cognitive activity;
- screen exposure;
- physical activity;
- recovery/rest periods;
- activity response;
- whether symptoms changed after activity.

Do not collect data merely because it is technically interesting.

Every field must have a reason:

> **How will this information affect a decision, safety check, personalization, or evaluation?**

If there is no clear answer, the field should not be collected.

---

# 12. 60-SECOND CHECK-IN PRINCIPLE

The target experience is approximately:

> **60 seconds or less for a normal daily check-in.**

This is a design goal, not a clinical claim.

Use:

- simple controls;
- progressive disclosure;
- minimal typing;
- clear symptom scales;
- large readable controls;
- short labels;
- minimal navigation.

The user should not have to complete a complicated medical questionnaire every day.

This directly supports the UX/accessibility criteria emphasized in the Design & Innovation and Concussion Recovery judging guides.

---

# 13. RECOVERY RESPONSE MEMORY

One of RE:ENTRY's most important personalization features is:

> **Recovery Response Memory**

The system stores structured observations about how the user's reported symptoms/recovery state relate temporally to previous activity patterns.

Example:

> Higher modeled cognitive-demand days have been followed by higher reported symptoms in this user's recent records.

This must be described as:

> **an observed association in the user's records**

and never:

> "Coding caused your symptoms."

---

# 14. CORRELATION ≠ CAUSATION

This is a strict scientific rule.

Incorrect:

> "Sleeping less causes your headache."

Correct:

> "In your recent records, lower sleep was associated with higher next-day symptom reporting."

Any statistical pattern must be labeled appropriately.

The system must distinguish:

### A. Evidence-based clinical principle

Supported by external scientific literature.

### B. Observed user pattern

Derived from the user's own records.

### C. System inference

Derived by the decision engine from A + B + current plan.

These three must never be silently conflated.

---

# 15. COLD-START MODE

A new user does not have enough history for reliable personalization.

RE:ENTRY must detect this.

When insufficient history exists:

- do not fabricate a personal pattern;
- do not claim the user has a stable/improving/worsening personalized trend unless the minimum data requirement is met;
- do not use invented historical behavior;
- rely on available user-provided information;
- use verified evidence-based constraints;
- communicate limited personalization;
- increase uncertainty.

Example:

> **Limited personalization**
>
> We do not yet have enough recent activity-response history to identify a reliable personal pattern.

As sufficient history accumulates, the system may transition to:

> **Personalized Mode**

---

# 16. RECOVERY STATE

Do not represent recovery as a fake clinical percentage.

Avoid:

> Recovery Capacity = 78%

unless the number is formally validated, which it is not for this prototype.

Instead use transparent system-derived concepts:

### Recovery Trend

Possible states:

- Improving;
- Stable;
- Worsening;
- Insufficient Data.

### Recent Activity Response

A structured summary of observed patterns.

### Data Sufficiency

- Limited;
- Moderate;
- Strong.

### Uncertainty

- Low;
- Moderate;
- High.

### Plan–Recovery Alignment

Describes how the planned activity profile compares with the system's modeled constraints and recent observations.

These are:

> **prototype-derived decision-support indicators**

not validated clinical measurements.

---

# 17. RECOVERY INTELLIGENCE ENGINE

The Recovery Intelligence Engine is deterministic/statistical rather than LLM-driven.

Possible methods:

- rolling averages;
- recent-vs-baseline comparisons;
- trend calculations;
- temporal activity-response summaries;
- simple statistical association;
- threshold rules.

No deep-learning model is required for the MVP.

The reason is deliberate:

- synthetic development data;
- lack of validated patient dataset;
- need for interpretability;
- need for deterministic testing;
- safety;
- auditability.

Do not add ML merely to make the project appear more "AI."

---

# 18. RECOVERY ENGINE OUTPUT

A structured recovery state may contain:

```json
{
  "trend": "stable",
  "data_sufficiency": "moderate",
  "uncertainty": "moderate",
  "recent_activity_response": [],
  "observed_constraints": []
}
```

The output must NOT include unsupported claims such as:

```text
"brain_capacity": 82%
"medically_recovered": true
"safe_to_return": true
```

---

# 19. ACTIVITY MODEL

Activities must be represented using a transparent ontology.

Possible attributes:

```text
activity_id
activity_type
duration
intensity
cognitive_demand
physical_demand
screen_exposure
recovery_opportunity
```

Examples:

- class;
- studying;
- reading;
- coding;
- office work;
- screen work;
- walking;
- exercise;
- social activity;
- commuting;
- rest.

Important:

> Activity weights are model parameters, not clinical measurements.

Every clinically meaningful assumption behind these parameters must be documented in the Clinical Evidence Matrix before being treated as evidence-based.

Do not arbitrarily assign:

> "coding = 40"

and then present that number as scientifically validated.

---

# 20. CLINICAL EVIDENCE MATRIX

This is a mandatory project artifact.

Before implementing clinical logic, build:

| ID | Product rule | Clinical claim | Source | Exact supporting passage | Evidence strength | Implementation | Test |
|---|---|---|---|---|---|---|---|
| E-001 | Rule | Claim | Guideline/literature | Citation | High/Medium/etc. | File/function | Test ID |
| E-002 | Rule | Claim | Guideline/literature | Citation | ... | ... | ... |

Every important clinical behavior must be traceable:

> **Evidence → Clinical interpretation → Product rule → Implementation → Test**

If a claim cannot be supported:

> **Do not present it as an evidence-based clinical rule.**

The Concussion Recovery guide explicitly identifies the Consensus Statement on Concussion in Sport, Living Concussion Guidelines, and PedsConcussion Living Guideline as examples of evidence-based international guidelines.

---

# 21. SCIENTIFIC FOUNDATION

The system must demonstrate actual understanding of:

- concussion recovery;
- cognition;
- rehabilitation;
- activity/recovery interaction;
- evidence limitations.

The team must not invent neuroscience explanations to make the product sound scientific.

The Concussion Recovery rubric separately evaluates Neuroscience Understanding and Research Foundation, with the highest level requiring significant scientific understanding and strong literature support for claims.

Therefore:

> **Clinical Evidence Matrix is part of the product's engineering foundation, not just presentation material.**

---

# 22. SCENARIO ENGINE

The Scenario Engine is the core decision/simulation engine.

Input:

```text
Current Recovery State
+
User Activity Plan
+
Activity Parameters
+
Evidence-derived constraints
+
Safety State
```

Output:

```text
Estimated Activity Demand
Plan–Recovery Alignment
Potential Concerns
Overload Flag
Data Sufficiency
Uncertainty
Explanation Factors
```

The engine must be:

- deterministic;
- explainable;
- testable;
- fast;
- reproducible.

---

# 23. SCENARIO ENGINE LANGUAGE

Avoid:

> "This plan is medically unsafe."

unless that statement is explicitly supported by the relevant clinical rule and safety pathway.

Prefer:

> "This plan has higher modeled activity demand relative to the user's recent recovery pattern."

or:

> "RE:ENTRY has insufficient information to confidently assess this plan."

The system must not transform a prototype score into a clinical guarantee.

---

# 24. WHAT-IF SIMULATION

The Scenario Engine must support:

### Original Plan

```text
Class
+
Coding
+
Exercise
+
Social activity
```

→

### Simulation

→

### Concerns

→

### Alternative Plan

For example:

- reduce duration;
- introduce a recovery break;
- modify intensity;
- reorder activities;
- remove an activity;
- substitute a lower-demand option where appropriate.

→

### Re-simulation

→

### Comparison

The user sees:

> **What changed?**

and:

> **Why did the modeled result change?**

---

# 25. RECOVERY PLANNER

When a plan has poor plan–recovery alignment, the Planner generates alternatives.

Candidate transformations:

1. Reduce duration.
2. Reduce intensity.
3. Add recovery opportunity.
4. Reorder activities.
5. Remove a high-demand activity.
6. Substitute an activity when appropriate.

The Planner should preserve user intent whenever possible.

Example:

User wants to:

> study + exercise + socialize.

The system should not automatically respond:

> "Do nothing."

Instead it should explore whether the plan can be modified while preserving meaningful activities.

---

# 26. PLANNER OBJECTIVE

The Planner's objective is:

> **Find a reasonable next step that reduces modeled concern while preserving as much of the user's intended activity as possible.**

It must NOT optimize:

> maximum productivity.

It must NOT optimize:

> maximum activity.

It must NOT pressure the user to return faster.

---

# 27. PLAN COMPARISON

Comparison should show:

### Original

- modeled cognitive demand;
- modeled physical demand;
- recovery opportunities;
- alignment;
- key concerns;
- uncertainty.

### Alternative

Same fields.

Then:

### Why did it change?

Example:

> "The alternative reduces the modeled cognitive demand by shortening the longest cognitive block and adds a recovery opportunity."

Do not expose arbitrary mathematical complexity to the user.

Show the reasoning in understandable language.

---

# 28. RAG IS THE EVIDENCE LAYER

RAG must NOT be the recovery decision-maker.

Architecture:

> **Decision Engine → produces structured result**

→

> **RAG → retrieves supporting evidence**

→

> **Evidence Verification → checks relevance/support**

→

> **LLM → explains the structured result using verified evidence**

This separation is mandatory.

---

# 29. RAG CORPUS

Prioritize authoritative concussion sources.

The competition guide explicitly references:

- Consensus statement on concussion in sport: 6th International Conference on Concussion in Sport;
- Living Concussion Guidelines;
- PedsConcussion Living Guideline.

Additional literature may be included if reliable and relevant.

Do not fill the corpus with random health blogs.

---

# 30. RAG PIPELINE

Minimum target architecture:

```text
Decision Query
      ↓
Query Construction
      ↓
Hybrid / Semantic Retrieval
      ↓
Top-K Candidate Evidence
      ↓
Re-ranking / Relevance Filtering
      ↓
Evidence Verification
      ↓
Citation Mapping
      ↓
Structured Evidence Package
      ↓
LLM Explanation
```

A simple:

> embedding → top-k → LLM

pipeline should not be the final architecture if the team can implement verification/re-ranking reliably.

The AI/ML rubric places straightforward RAG around the middle level and reserves higher scores for more complex multi-stage pipelines, orchestration, verification and advanced engineering.

---

# 31. EVIDENCE VERIFICATION

Before evidence is used to explain a recommendation, verify:

1. Is the source authoritative?
2. Is the retrieved passage relevant?
3. Does the passage actually support the claim?
4. Is the claim being overgeneralized?
5. Is the citation traceable?
6. Is the evidence current/appropriate for the intended use?

If evidence is insufficient:

> Do not manufacture an explanation.

Return:

> **Evidence insufficient for a confident explanation.**

---

# 32. LLM ROLE

LLM can perform:

- natural-language explanation;
- summarization;
- evidence explanation;
- structured-to-natural-language conversion;
- conversational interface if needed.

LLM must NOT independently determine:

- diagnosis;
- medical clearance;
- treatment;
- red-flag status;
- core recovery state;
- whether the patient is "safe";
- clinical conclusions unsupported by the structured system.

The core product must continue functioning if the LLM is removed.

---

# 33. LLM OUTPUT CONTRACT

The LLM should receive structured information such as:

```json
{
  "decision": {},
  "evidence": [],
  "safety_state": {},
  "uncertainty": {},
  "limitations": []
}
```

It should produce structured output before rendering natural language where possible.

Example:

```json
{
  "summary": "...",
  "reasons": [],
  "evidence_citations": [],
  "limitations": [],
  "scope_status": "within_scope"
}
```

This makes the output testable.

---

# 34. SAFETY ARCHITECTURE

Safety is not a disclaimer.

Safety is a technical subsystem.

It must have veto authority.

Architecture:

```text
INPUT
  ↓
PRE-SAFETY CHECK
  ↓
RECOVERY / SIMULATION
  ↓
PLANNER
  ↓
EVIDENCE
  ↓
POST-DECISION SAFETY CHECK
  ↓
LLM
  ↓
OUTPUT SAFETY CHECK
  ↓
USER
```

If any mandatory safety condition fails:

> **Normal recommendation flow stops.**

---

# 35. SAFETY LAYERS

## Layer 1 — Input Safety

Check:

- red flags;
- malformed data;
- contradictory data;
- missing critical information;
- out-of-scope requests.

## Layer 2 — Decision Safety

Check:

- whether the recommendation exceeds system scope;
- whether unsupported clinical assumptions are being used;
- whether the plan should be blocked or marked uncertain.

## Layer 3 — Evidence Safety

Check:

- evidence relevance;
- source attribution;
- unsupported claims.

## Layer 4 — LLM Safety

Check:

- diagnosis;
- treatment claims;
- medical clearance;
- hallucinated citations;
- unsupported certainty;
- contradictions;
- prompt injection;
- scope violations.

## Layer 5 — Final Veto

Safety has authority to block the output.

---

# 36. RED-FLAG STATE

Red-flag logic must be derived from authoritative clinical guidance.

Do not invent the red-flag list from memory.

The implementation must create:

```text
red_flag_rules.json
```

with:

- symptom/rule;
- source;
- interpretation;
- action;
- test case.

If a red flag is detected:

```json
{
  "status": "blocked",
  "reason": "...",
  "next_step": "professional_care"
}
```

The system must NOT:

- continue normal activity optimization;
- reassure the user;
- allow the LLM to override the block;
- provide a normal recommendation.

---

# 37. OUT-OF-SCOPE STATES

The system must explicitly recognize:

### Diagnosis request

Block/redirect.

### Medical clearance request

Block/redirect.

### Treatment/medication request

Outside MVP scope.

### Unsafe override request

Block.

### Request to ignore symptoms/red flags

Block.

### Insufficient evidence

Do not fabricate confidence.

### Insufficient user data

Switch to limited-data mode.

### Contradictory input

Do not silently choose one interpretation.

---

# 38. SAFETY STATE MACHINE

Recommended states:

```text
CLEAR
LIMITED_DATA
UNCERTAIN
REVIEW_REQUIRED
BLOCKED_RED_FLAG
BLOCKED_OUT_OF_SCOPE
EVIDENCE_INSUFFICIENT
```

This is preferable to a simplistic:

```text
safe = true/false
```

because real-world uncertainty is not binary.

---

# 39. HUMAN HANDOFF

When RE:ENTRY cannot safely support a decision, it should not simply say:

> "See a doctor."

The handoff should be useful.

Where appropriate, the system can provide a concise:

> **Recovery Summary**

containing:

- recent reported symptom trend;
- activity-response observations;
- important user-reported concerns;
- relevant dates;
- limitations of the system.

This summary must remain:

> **a user-generated decision-support summary**

and must not be presented as a clinical diagnosis or medical report.

---

# 40. UNCERTAINTY ENGINE

Every personalized decision should consider:

- amount of historical data;
- data consistency;
- strength of observed pattern;
- evidence strength;
- missing information;
- scenario complexity.

Example:

```text
Plan–Recovery Alignment: Moderate

Personalization confidence: Limited
Evidence confidence: High
Overall uncertainty: Moderate
```

When uncertainty increases:

> **the system should become more conservative.**

Never hide uncertainty behind fluent LLM language.

---

# 41. DATA SUFFICIENCY

Define explicit minimum-data requirements.

For example:

```text
insufficient
limited
moderate
strong
```

The exact thresholds must be defined during implementation and documented.

They must not be presented as medically validated thresholds unless supported by evidence.

---

# 42. CONTRADICTORY DATA

Example:

User says:

> Sleep = 8h

but activity record implies:

> sleep = 3h.

The system must not silently pick one.

Instead:

> **Data conflict detected. Please verify the information.**

If the conflict cannot be resolved:

> increase uncertainty or block the personalized inference.

---

# 43. RESPONSIBLE AI

The AI/ML judging guide specifically evaluates data safety and responsibility, including privacy, encryption, data minimization, bias mitigation, verification layers and adversarial defenses.

RE:ENTRY must therefore implement:

- data minimization;
- input validation;
- output validation;
- structured AI outputs;
- pseudonymization where appropriate;
- encryption in transit;
- secure storage practices;
- minimal sensitive data transmission to LLM;
- prompt-injection defenses;
- evidence verification;
- hallucination detection/validation;
- audit logging;
- explicit limitations.

---

# 44. DATA FLOW TO LLM

Do NOT automatically send the entire user database to the LLM.

Only send the minimum structured information required.

Prefer:

```text
recovery_summary
+
scenario_summary
+
verified_evidence
+
safety_state
+
uncertainty
```

over:

```text
raw medical history
+
entire database
+
all check-ins
```

---

# 45. BIAS & LIMITATIONS

The team must explicitly acknowledge:

- synthetic data is not real patient data;
- self-reported information is imperfect;
- patterns may differ across individuals;
- missing data may bias personalization;
- activity weights are model assumptions unless clinically validated;
- the prototype is not clinically validated;
- no clinical outcome claims should be made.

Do not imply that performance on synthetic personas equals clinical effectiveness.

---

# 46. SYNTHETIC DATA

The development/demo dataset is:

> **Synthetic.**

No real patient data is required for the MVP.

Create approximately:

- 15–20 synthetic personas;
- 20–30 days per persona;
- multiple recovery trajectories.

Required scenario groups:

### A — Improving

### B — Stable

### C — Worsening / overload pattern

### D — Red-flag case

### E — Cold-start case

### F — Contradictory-input case

### G — Evidence-insufficient case

### H — Out-of-scope case

The same synthetic scenarios should power:

- development;
- unit tests;
- integration tests;
- evaluation;
- demo.

---

# 47. EVALUATION DATASET

Do not rely only on the demo.

Build a separate evaluation set containing known expected outcomes.

Evaluate:

## Recovery Engine

- trend classification;
- data sufficiency;
- uncertainty behavior;
- activity-response consistency.

## Scenario Engine

- deterministic behavior;
- load calculation;
- scenario comparison;
- plan modification effects.

## Safety

- red-flag recall;
- unsafe recommendation rate;
- false-negative rate;
- scope violations.

## RAG

- retrieval relevance;
- citation correctness;
- evidence-support rate.

## LLM

- hallucination rate;
- unsupported claim rate;
- citation correctness;
- scope violations;
- contradiction rate.

## System

- latency;
- API reliability;
- error rate.

---

# 48. CRITICAL SAFETY METRIC

The most important safety metric is not:

> "How smart is the AI?"

It is:

> **"How reliably does the system prevent unsafe behavior?"**

The team should demonstrate tests where:

> Planner says acceptable

but:

> Safety says blocked.

Expected result:

> **BLOCKED**

This proves Safety has actual authority rather than being decorative.

---

# 49. AI/ML ARCHITECTURE

The final architecture should look like:

```text
                    USER
                      │
                      ▼
              Input Validation
                      │
                      ▼
                Safety Pre-check
                      │
              ┌───────┴───────┐
              │               │
           BLOCK            CONTINUE
              │               │
              ▼               ▼
        Professional      Recovery Engine
           Care                 │
                                ▼
                         Scenario Engine
                                │
                                ▼
                           Plan Analysis
                                │
                       ┌────────┴────────┐
                       │                 │
                  Good alignment    Poor alignment
                       │                 │
                       │                 ▼
                       │            Recovery Planner
                       │                 │
                       │                 ▼
                       │          Alternative Scenarios
                       │                 │
                       │                 ▼
                       │           Re-simulation
                       └────────┬────────┘
                                │
                                ▼
                         Evidence Retrieval
                                │
                                ▼
                       Evidence Verification
                                │
                                ▼
                         Final Safety Check
                                │
                                ▼
                         Structured LLM
                           Explanation
                                │
                                ▼
                         Output Validation
                                │
                                ▼
                              USER
```

This architecture directly addresses the AI/ML rubric's emphasis on advanced pipelines, orchestration and dedicated verification/guardrail layers.

---

# 50. FRONTEND

The MVP should contain:

## 1. Onboarding

Minimal recovery context.

## 2. Daily Check-in

Fast daily update.

## 3. Recovery Dashboard

Show:

- trend;
- recent patterns;
- activity-response observations;
- data sufficiency;
- uncertainty.

## 4. Plan Tomorrow

Create activity schedule.

## 5. Simulation Result

Show:

- estimated activity demand;
- plan–recovery alignment;
- concerns;
- uncertainty.

## 6. Scenario Comparison

Original vs alternative.

## 7. Why?

Show:

- reasoning factors;
- evidence;
- source;
- limitations.

## 8. Safety State

Clear blocked/escalation experience.

---

# 51. UX PRINCIPLES

The UI must be:

- calm;
- simple;
- low cognitive load;
- readable;
- accessible;
- predictable;
- non-judgmental.

Avoid:

- excessive dashboards;
- dozens of charts;
- unnecessary animations;
- complex medical terminology;
- alarmist colors/messages unless truly necessary;
- productivity pressure.

Accessibility should include:

- sufficient contrast;
- keyboard navigation;
- visible focus states;
- semantic labels;
- screen-reader support;
- readable typography;
- clear error states.

The Design & Innovation guide specifically evaluates intuitive navigation, polished visual hierarchy and accessibility, with the highest level requiring frictionless and broadly accessible UX.

---

# 52. DATABASE MODEL

Recommended entities:

### users

Account information.

### recovery_context

Relevant recovery context.

### daily_checkins

Daily observations.

### activities

Activity definitions and parameters.

### activity_responses

Observed response information.

### recovery_states

Derived system states.

### plans

User plans.

### simulations

Simulation outputs.

### recommendations

Structured planner decisions.

### evidence_sources

Source metadata.

### evidence_chunks

Indexed evidence.

### safety_events

Safety detections/actions.

### audit_logs

Structured system events.

Do not store unnecessary sensitive information.

---

# 53. API CONTRACT

The exact schema must be frozen before integration.

Core endpoints:

```http
POST /check-ins
GET  /check-ins

GET  /recovery/profile
GET  /recovery/trend

POST /plans
GET  /plans/{id}

POST /simulations
GET  /simulations/{id}

POST /recommendations

POST /evidence/query

POST /safety/check
```

Authentication can reuse the existing repository if appropriate.

Do not introduce a new authentication architecture before auditing the existing project.

---

# 54. TRACK A — SIGNAL

## Owner

Person A.

## Responsibility

> **Check-in → Recovery Intelligence → Scenario Engine → Frontend integration**

---

## Phase A1 — Check-in

Build:

- onboarding;
- daily check-in;
- database schema;
- synthetic dataset;
- check-in API.

Target:

> ≥400 synthetic records.

Generate 15–20 synthetic personas with 20–30 days of data.

---

## Phase A2 — Recovery Intelligence

Implement:

```text
recovery/trend_analysis.py
recovery/recovery_state.py
recovery/activity_response.py
```

Responsibilities:

- trend;
- recent-vs-baseline;
- activity-response patterns;
- data sufficiency;
- uncertainty.

No LLM in the core engine.

---

## Phase A3 — Scenario Engine

Implement:

```text
simulation/activity_model.json
simulation/workload_model.py
simulation/scenario_engine.py
```

Responsibilities:

- activity ontology;
- demand calculation;
- plan analysis;
- comparison;
- deterministic output.

---

## Phase A4 — Frontend

Integrate:

- real check-ins;
- recovery dashboard;
- planner;
- simulation;
- scenario comparison;
- uncertainty.

---

# 55. TRACK B — DECISION

## Owner

Person B.

## Responsibility

> **Evidence → Safety → Planner → Orchestrator → Explanation**

---

## Phase B1 — Evidence

Build:

```text
rag/
  ingestion/
  chunking/
  embeddings/
  retrieval/
  verification/
```

Use authoritative sources.

Create source metadata and citations.

---

## Phase B2 — Safety

Build:

```text
safety/
  red_flags.py
  scope_guard.py
  input_validator.py
  recommendation_guard.py
  output_validator.py
```

Create tests demonstrating:

> Safety always wins.

---

## Phase B3 — Planner

Implement:

```text
planner/alternatives.py
planner/recovery_planner.py
orchestrator/pipeline.py
```

Generate alternative plans.

Run each alternative through the Scenario Engine.

Rank alternatives.

---

## Phase B4 — Explanation UI

Implement:

> **Why?**

Show:

- recommendation;
- factors;
- evidence;
- citation;
- uncertainty;
- limitations.

---

# 56. SYNC POINTS

The two tracks must freeze these contracts before implementation proceeds.

## Sync Point 1 — Beginning of Week 1

Freeze:

> `check-in` schema.

Track B must know exactly what data Safety can inspect.

## Sync Point 2 — Beginning of Week 3

Freeze:

> `/simulations` JSON contract.

This is the direct input to Track B.

## Sync Point 3 — Mid Week 3

Freeze:

> `workload_model()` interface.

Track B may import the model directly for alternative simulation.

## Sync Point 4 — Beginning of Week 4

Run the complete system using:

- improving persona;
- stable persona;
- overload persona;
- red-flag persona;
- cold-start persona.

---

# 57. SHARED CONTRACT

Example simulation output:

```json
{
  "simulation_id": "sim_001",
  "user_id": "demo_01",

  "recovery_state": {
    "trend": "stable",
    "data_sufficiency": "moderate",
    "uncertainty": "moderate"
  },

  "planned_activity": {
    "cognitive_demand": 72,
    "physical_demand": 61
  },

  "plan_recovery_alignment": "low",

  "overload": true,

  "main_concerns": [
    "high_cognitive_demand",
    "limited_recovery_opportunity"
  ],

  "observed_patterns": [],

  "safety": {
    "status": "clear_for_planning",
    "red_flags_detected": false
  }
}
```

Important:

> Numeric values are **model outputs**, not validated clinical measurements.

---

# 58. EXPLANATION CONTRACT

Every recommendation explanation should conceptually answer:

### What happened?

> The plan has higher modeled cognitive demand.

### Why?

> The plan contains a long high-demand cognitive block and limited recovery opportunity.

### What could change?

> Modifying the duration/order/recovery opportunity changes the modeled scenario.

### What evidence supports the relevant principle?

> Citation.

### How certain is the system?

> Uncertainty/data sufficiency.

### What are the limitations?

> Explicit limitation.

---

# 59. ERROR & FAILURE STATES

The product must intentionally handle:

### Normal

Continue.

### Limited data

Continue with uncertainty.

### High uncertainty

Conservative behavior.

### Conflicting data

Ask user to verify.

### Evidence insufficient

Do not invent explanation.

### Red flag

Block.

### Out of scope

Refuse/redirect.

### LLM failure

Fallback to structured explanation.

### RAG failure

Do not invent evidence.

### Backend failure

Show clear recoverable error.

---

# 60. LLM FAILURE MUST NOT BREAK THE CORE PRODUCT

If the LLM API fails:

RE:ENTRY should still be able to show:

- simulation;
- structured reasoning;
- safety state;
- evidence metadata.

The system may display:

> "Natural-language explanation is temporarily unavailable."

This proves the LLM is an enhancement rather than the entire product.

---

# 61. RAG FAILURE MUST NOT CREATE FAKE EVIDENCE

If retrieval fails:

Do not:

> "guess a citation."

Instead:

> **Evidence unavailable for this explanation.**

The user should never receive fabricated references.

---

# 62. DEMO SCENARIOS

At minimum prepare five.

## Demo 1 — Improving

History shows improving pattern.

User creates a reasonable plan.

Expected:

> normal simulation.

## Demo 2 — Stable

History is relatively stable.

Expected:

> moderate uncertainty.

## Demo 3 — Overload

Higher activity pattern corresponds with worsening reported symptoms.

User creates a high-demand plan.

Expected:

> lower plan–recovery alignment → alternatives → re-simulation.

## Demo 4 — Red Flag

Safety condition is present.

Expected:

> immediate block.

No planner.

No normal recommendation.

## Demo 5 — Cold Start

No sufficient history.

Expected:

> limited personalization + uncertainty.

---

# 63. FOUR-MINUTE DEMO SCRIPT

## 0:00–0:30 — Pain

> **"I feel better. But am I actually ready to return to my normal life?"**

Explain the decision gap.

## 0:30–1:00 — Personal Recovery

Show several days of synthetic history.

Show:

> observed activity-response pattern.

## 1:00–2:00 — Plan

Create:

> Class → Coding → Exercise → Social activity.

Click:

> **Simulate**

Show modeled concern.

## 2:00–2:45 — What-if

Modify the plan.

Click:

> **Simulate Again**

Show the difference.

## 2:45–3:25 — Why?

Show:

- structured factors;
- evidence;
- citation;
- uncertainty;
- limitations.

## 3:25–4:00 — Safety

Trigger the safety scenario.

Show:

> Recommendation blocked.

Then professional-care guidance.

Final line:

> **"RE:ENTRY does not tell patients that they are medically cleared. It helps them reason about their next step in returning to everyday activities."**

---

# 64. JUDGING STRATEGY

The judging guides should drive implementation, not merely presentation.

## CONCUSSION RECOVERY

### Clinical & Domain Effectiveness

Target:

> **5/5**

Proof:

- specific pain point;
- real recovery use case;
- evidence-based clinical logic;
- meaningful personalization;
- useful re-entry planning.

The guide's highest level requires highly effective treatment of a relevant concussion-recovery challenge while closely following established evidence-based guidelines.

---

## Safety & Responsible Design

Target:

> **5/5**

Proof:

- technical red-flag veto;
- scope guard;
- evidence verification;
- uncertainty;
- professional-care escalation;
- LLM output validation;
- explicit limitations.

The guide's highest level explicitly asks for significant safety guardrails consistent with evidence-based guidelines and clear acknowledgement of professional care.

---

## Neuroscience Understanding

Target:

> **5/5**

Proof:

- evidence matrix;
- scientifically defensible recovery model;
- correct terminology;
- no unsupported neuroscience claims.

The highest level requires significant scientific understanding that meaningfully improves the solution.

---

## Research Foundation

Target:

> **5/5**

Proof:

- multiple reliable sources;
- claim-level citations;
- evidence-to-rule traceability;
- implementation tied to literature.

The guide's highest level requires the project to be significantly grounded in reliable scientific literature with claims well-supported.

---

## Technical Complexity

Target:

> **4–5/5**

Proof:

- modular architecture;
- deterministic recovery engine;
- scenario simulation;
- planner;
- RAG;
- evidence verification;
- safety orchestration;
- output validation;
- evaluation framework.

The Concussion Recovery guide distinguishes solid implementation from sophisticated architecture and advanced technical execution.

---

## UX & Accessibility

Target:

> **4–5/5**

Proof:

- short check-in;
- low cognitive burden;
- seamless plan/simulate loop;
- accessibility;
- polished visual hierarchy.

---

# 65. AI/ML JUDGING STRATEGY

The project must NOT look like:

> User → GPT → Answer.

That would leave too much value in a generic LLM/RAG implementation.

The AI system should demonstrate:

```text
Personalized Recovery Analysis
        ↓
Scenario Simulation
        ↓
Alternative Plan Search
        ↓
Evidence Retrieval
        ↓
Evidence Verification
        ↓
Safety Verification
        ↓
Structured LLM Explanation
        ↓
Output Validation
        ↓
Evaluation
```

The AI/ML guide explicitly distinguishes straightforward RAG from complex multi-stage AI pipelines and higher-level verification/orchestration.

---

# 66. AI/ML — WHAT NOT TO DO

Do not add:

- multi-agent architecture merely for appearance;
- fine-tuning without data;
- an ML model without a meaningful purpose;
- an AI chatbot as the core feature;
- unnecessary vector databases;
- AI-generated medical decisions.

Technical complexity must come from solving the problem correctly.

Not from adding buzzwords.

---

# 67. DESIGN & INNOVATION STRATEGY

The Design & Innovation guide evaluates:

1. Innovation & Novelty.
2. UI/UX & Accessibility.

Therefore the strongest product story is:

> **The user does not merely monitor recovery. They can interactively test how changing tomorrow's plan changes the modeled outcome.**

This should be visible immediately in the demo.

The UI should make:

> **Plan → Simulate → Adjust → Compare**

the central interaction.

---

# 68. HEALTH JUDGING STRATEGY

The Health guide evaluates Domain Effectiveness and Feasibility & Safety. Its highest level requires deep treatment of critical pain points plus significant safety guardrails, clinical validity and real-world readiness.

Therefore the product must emphasize:

### Pain

Uncertainty during re-entry.

### Clinical grounding

Evidence before rules.

### Safety

Technical enforcement.

### Practicality

Low-friction daily use.

### Limitation

No diagnosis/clearance.

---

# 69. COMPETITIVE RESEARCH REQUIREMENT

Before claiming strong novelty, conduct a competitive audit.

Categories:

- concussion symptom trackers;
- return-to-school tools;
- return-to-work tools;
- return-to-play tools;
- concussion education platforms;
- recovery journals;
- generic health trackers;
- AI health assistants.

For each competitor record:

```text
product
target_user
core_problem
tracking
planning
simulation
personalization
evidence
safety
scenario_comparison
limitations
```

Then build:

> **Competitive White-Space Matrix**

Do not claim:

> "No one does this."

until this research is complete.

---

# 70. PRODUCT WHITE SPACE TO VALIDATE

The hypothesis to validate is:

> Existing tools may track symptoms, provide information, or support specific return-to-activity workflows, while RE:ENTRY focuses on interactive comparison of everyday activity plans using personal longitudinal patterns, evidence and safety constraints.

This is a:

> **research hypothesis**

until competitive research proves it.

---

# 71. NON-NEGOTIABLE SCIENTIFIC RULES

1. Never invent clinical claims.
2. Never invent citations.
3. Never present correlation as causation.
4. Never present synthetic-data results as clinical evidence.
5. Never claim clinical validation without validation.
6. Never present model scores as validated medical measurements.
7. Never claim recovery from symptom improvement alone.
8. Never claim medical clearance.
9. Never claim an activity is guaranteed safe.
10. Never use LLM output as the sole medical reasoning layer.
11. Never let LLM override Safety.
12. Never let RAG override Safety.
13. Never hide uncertainty.
14. Never fabricate personalization.
15. Never silently resolve contradictory health information.
16. Never invent red-flag rules.
17. Every clinical rule must have a traceable source.
18. If evidence is insufficient, say so.

---

# 72. NON-NEGOTIABLE ENGINEERING RULES

1. No hardcoded demo outcomes.
2. No fake API responses in the final demo.
3. Core calculations must be executable.
4. Core decisions must be deterministic where intended.
5. All critical modules must have tests.
6. Track A/B interfaces must be versioned.
7. Structured JSON contracts must be validated.
8. LLM outputs must be schema-validated.
9. RAG citations must be traceable.
10. Safety tests must include adversarial cases.
11. Evaluation must be reproducible.
12. Synthetic data generation must be reproducible with fixed seeds.
13. Do not refactor the entire existing repository without first auditing it.
14. Reuse working components where appropriate.
15. Remove obsolete components only after dependency analysis.

---

# 73. NON-NEGOTIABLE PRODUCT RULES

1. The user should never feel punished for having symptoms.
2. The product should not create pressure to return faster.
3. The system should not optimize productivity.
4. The product should minimize daily cognitive burden.
5. Every recommendation must be explainable.
6. Important explanations must have evidence.
7. Uncertainty must be visible.
8. Safety must override convenience.
9. Personalization must be earned through data.
10. When the system cannot safely help, it must stop.

---

# 74. PROJECT DEVELOPMENT ORDER

Do not begin by randomly adding UI features.

Follow this order.

## Phase 0 — Repository Audit

Inspect the existing project/MindScan codebase.

Determine:

- frontend stack;
- backend;
- database;
- authentication;
- existing components;
- existing APIs;
- existing AI integration;
- reusable components;
- obsolete components;
- deployment;
- technical debt.

Deliverable:

> **Repository Audit Report**

---

# 75. PHASE 1 — CLINICAL EVIDENCE

Before clinical implementation:

- collect authoritative guidelines;
- identify relevant literature;
- create Clinical Evidence Matrix;
- map claims;
- identify unsupported assumptions;
- remove unsupported rules.

Deliverable:

> **Clinical Evidence Matrix v1**

---

# 76. PHASE 2 — PRODUCT SPECIFICATION

Freeze:

- user journey;
- user states;
- check-in fields;
- activity ontology;
- scenario states;
- safety states;
- uncertainty states;
- planner behavior.

Deliverable:

> **Product Specification v1**

---

# 77. PHASE 3 — RECOVERY ENGINE

Implement:

- trend analysis;
- data sufficiency;
- activity-response memory;
- uncertainty;
- recovery state.

Deliverable:

> **Recovery Engine v1**

with tests.

---

# 78. PHASE 4 — SCENARIO ENGINE

Implement:

- activity model;
- workload model;
- scenario evaluation;
- plan comparison;
- deterministic simulation.

Deliverable:

> **Scenario Engine v1**

---

# 79. PHASE 5 — SAFETY

Implement:

- red-flag rules;
- scope guard;
- input validation;
- recommendation guard;
- evidence guard;
- output validation;
- final veto.

Deliverable:

> **Safety Engine v1**

with adversarial tests.

---

# 80. PHASE 6 — DATABASE + API

Freeze:

- database schema;
- API schemas;
- Track A/B JSON contracts.

Deliverable:

> **API Contract v1**

---

# 81. PHASE 7 — BACKEND INTEGRATION

Connect:

```text
Check-in
→ Recovery
→ Simulation
→ Planner
→ Evidence
→ Safety
→ Explanation
```

Everything must work without hardcoded demo values.

---

# 82. PHASE 8 — FRONTEND

Implement:

- onboarding;
- check-in;
- dashboard;
- planner;
- simulation;
- comparison;
- Why;
- safety states.

Prioritize usability over number of screens.

---

# 83. PHASE 9 — RAG + LLM

Implement:

- ingestion;
- chunking;
- embeddings;
- retrieval;
- reranking/verification where feasible;
- citations;
- structured LLM explanation;
- output validation.

---

# 84. PHASE 10 — EVALUATION

Build benchmark.

Run:

- safety tests;
- scenario tests;
- evidence tests;
- LLM tests;
- adversarial tests;
- latency tests.

Deliverable:

> **Evaluation Report**

---

# 85. PHASE 11 — FULL INTEGRATION

Test:

### Persona A

Improving.

### Persona B

Stable.

### Persona C

Overload.

### Persona D

Red flag.

### Persona E

Cold start.

### Persona F

Contradictory input.

### Persona G

Evidence failure.

### Persona H

Out-of-scope request.

---

# 86. PHASE 12 — DEMO HARDENING

Freeze:

- feature set;
- UI;
- architecture;
- demo personas;
- scripted flow.

Do not introduce major features during final demo preparation.

---

# 87. SUCCESS CRITERIA

RE:ENTRY is considered MVP-complete only when:

## Product

- pain point is clear;
- user journey is coherent;
- What-if simulation works;
- comparison works.

## Clinical

- important claims have evidence;
- clinical rules are traceable;
- unsupported assumptions are removed.

## Safety

- red flags block;
- out-of-scope requests block;
- uncertainty is explicit;
- professional-care escalation exists;
- LLM cannot override safety.

## AI

- recovery engine works independently;
- RAG is evidence-grounded;
- citations are traceable;
- LLM is constrained;
- output validation exists.

## Personalization

- recovery response memory works;
- cold-start behavior works;
- contradictory data is handled.

## Engineering

- API contract works;
- automated tests exist;
- synthetic dataset is reproducible;
- evaluation benchmark exists.

## UX

- check-in is low-friction;
- core loop is intuitive;
- accessibility is addressed;
- UI is polished.

---

# 88. FINAL SYSTEM ARCHITECTURE

The final system is:

```text
                         RE:ENTRY
                            │
                ┌───────────┴───────────┐
                │                       │
         USER / RECOVERY DATA       CLINICAL EVIDENCE
                │                       │
                ▼                       ▼
       Recovery Intelligence        Evidence Base
                │                       │
                ▼                       │
        Recovery State                  │
                │                       │
                └──────────┬────────────┘
                           ▼
                    Scenario Engine
                           │
                           ▼
                  Plan–Recovery Alignment
                           │
                 ┌─────────┴─────────┐
                 │                   │
              Aligned             Concern
                 │                   │
                 │                   ▼
                 │             Recovery Planner
                 │                   │
                 │                   ▼
                 │           Alternative Plans
                 │                   │
                 │                   ▼
                 │             Re-simulation
                 └─────────┬─────────┘
                           ▼
                   Evidence Retrieval
                           │
                           ▼
                  Evidence Verification
                           │
                           ▼
                     Safety Veto
                           │
                    ┌──────┴───────┐
                    │             │
                 BLOCK         CONTINUE
                    │             │
                    ▼             ▼
             Professional      LLM
                Care        Explanation
                                  │
                                  ▼
                           Output Validation
                                  │
                                  ▼
                                USER
```

---

# 89. THE CORE LOOP THAT DEFINES THE PRODUCT

Everything should strengthen:

> **CHECK IN**

→

> **UNDERSTAND MY RECENT PATTERN**

→

> **PLAN MY DAY**

→

> **SIMULATE**

→

> **SEE WHAT THE MODEL IDENTIFIES**

→

> **TRY AN ALTERNATIVE**

→

> **SIMULATE AGAIN**

→

> **COMPARE**

→

> **WHY?**

→

> **EVIDENCE + UNCERTAINTY + LIMITATIONS**

→

> **MAKE A MORE INFORMED NEXT-STEP DECISION**

---

# 90. THE SINGLE MOST IMPORTANT PRODUCT STATEMENT

RE:ENTRY does not answer:

> "Are you recovered?"

It answers a narrower and safer question:

> **"Given the information currently available, how does this planned activity pattern align with your recent observed recovery pattern, what alternatives can you explore, and what evidence and uncertainty should you understand?"**

---

# 91. FINAL CLAUDE DIRECTIVE

Claude must treat RE:ENTRY as a **health decision-support prototype**, not as a generic AI application.

Claude must:

1. Audit the existing repository before changing architecture.
2. Preserve working components where appropriate.
3. Remove obsolete features only after dependency analysis.
4. Build the Clinical Evidence Matrix before implementing clinical rules.
5. Keep clinical reasoning deterministic and interpretable.
6. Keep RAG as an evidence layer.
7. Keep LLM as an explanation layer.
8. Give Safety veto authority.
9. Implement explicit uncertainty.
10. Implement cold-start behavior.
11. Implement activity-response memory.
12. Implement scenario comparison.
13. Validate all structured outputs.
14. Test all safety-critical paths.
15. Build an evaluation benchmark.
16. Use synthetic data for MVP/demo.
17. Never fabricate evidence.
18. Never fabricate personalization.
19. Never present prototype metrics as clinical measurements.
20. Never claim diagnosis, treatment, recovery clearance, or guaranteed safety.
21. Never add features simply to make the project look larger.
22. Prioritize clinical correctness, safety, evidence, usability, reliability and demo quality.
23. If a requested feature conflicts with the clinical/safety boundaries of this specification, stop and flag the conflict rather than silently implementing it.
24. If the evidence does not support a proposed clinical rule, do not implement the rule as an evidence-based claim.
25. If the system cannot safely make a recommendation, it must prefer **uncertainty, refusal, or professional-care escalation** over fabricated certainty.

---

# 92. FINAL PROJECT DEFINITION

> **RE:ENTRY is a concussion-recovery decision-support system built around a simple but important gap: people may feel better before they feel confident about returning to everyday life. Rather than only tracking symptoms or providing generic AI advice, RE:ENTRY combines longitudinal recovery information, observed activity-response patterns, transparent scenario modeling, alternative-plan simulation, evidence retrieval, safety verification and explicit uncertainty. Users can plan an upcoming day, simulate it, modify the plan, compare alternatives and understand why the modeled result changed. The core recovery and simulation logic remains structured and interpretable; RAG provides traceable evidence; LLM provides natural-language explanation; and a dedicated Safety Layer can override the entire recommendation pipeline. RE:ENTRY does not diagnose, treat, medically clear, or guarantee safety. It helps users reason about a reasonable next step while clearly communicating evidence, uncertainty and the need for professional care when appropriate.**

---

# 93. FREEZE RULE

**This document is the project baseline.**

From this point forward:

> **Do not change the core concept simply because another AI suggests more features.**

Any future change must pass four questions:

1. **Does it solve a real user pain point?**
2. **Is it clinically/evidence defensible?**
3. **Does it improve safety, usefulness or differentiation?**
4. **Can the team actually implement and evaluate it reliably within the hackathon?**

If the answer is no:

> **Do not add it.**

The goal is not the largest RE:ENTRY.

The goal is:

> **the safest, most evidence-grounded, most useful, most differentiated and most technically credible RE:ENTRY that the team can actually demonstrate.**
