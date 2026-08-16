# Safety Red-Flag Evidence Matrix

## Purpose

This document defines the evidence-backed safety rules used by the Concussion Recovery system.

Safety rules MUST be implemented from authoritative clinical guidance. The application MUST NOT invent clinical thresholds or use LLM output as the source of truth for red-flag decisions.

---

## Rule Matrix

| Rule ID | Clinical condition | Evidence source | Evidence passage | System behavior | Test case |
|---|---|---|---|---|---|
| RF-001 | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |
| RF-002 | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |
| RF-003 | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |

---

## Safety State Contract

The system uses the following safety states:

- SAFE
- REVIEW_REQUIRED
- BLOCKED_RED_FLAG

### SAFE

No configured safety rule is triggered.

The system may continue to downstream planning or scenario interpretation, subject to uncertainty and scope constraints.

### REVIEW_REQUIRED

The available information is insufficient, ambiguous, or requires additional review.

The system MUST NOT present the result as a clinical determination.

### BLOCKED_RED_FLAG

A configured safety rule has been triggered.

The system MUST:

1. Stop downstream recommendation generation.
2. Prevent planner output from overriding the safety decision.
3. Prevent LLM output from overriding the safety decision.
4. Return the triggered rule IDs.
5. Return an appropriate escalation action.
6. Preserve an auditable reason for the block.

---

## Governance Rules

1. Red-flag decisions are deterministic.
2. LLMs MUST NOT determine whether a red flag exists.
3. LLMs MUST NOT override a safety block.
4. Clinical thresholds MUST NOT be invented by the application.
5. User-specific observed patterns MUST NOT be treated as clinical diagnoses.
6. Missing or ambiguous data MUST increase uncertainty rather than being silently interpreted as safe.
7. Every implemented rule MUST have an evidence source.
8. Every implemented rule MUST have at least one automated test.

---

## Traceability

Evidence -> Clinical interpretation -> Product rule -> Implementation -> Test

Every safety rule must be traceable through this chain.
