# Track B - Red-Flag Clinical Evidence

## Purpose

This document contains only verified authoritative clinical evidence used to define deterministic red-flag safety rules.

## Evidence Sources

| Source ID | Authority | Document | URL | Verification status |
|---|---|---|---|---|
| SRC-001 | TBD | TBD | TBD | PENDING |
| SRC-002 | TBD | TBD | TBD | PENDING |

## Red-Flag Evidence

| Rule ID | Clinical condition | Evidence source | Exact supporting passage | Product rule | System behavior | Test |
|---|---|---|---|---|---|---|
| RF-001 | TBD | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |
| RF-002 | TBD | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |
| RF-003 | TBD | TBD | TBD | TBD | BLOCKED_RED_FLAG | TBD |

## Governance

1. Red-flag rules MUST be deterministic.
2. Every implemented rule MUST have an authoritative source.
3. Every implemented rule MUST have a verified supporting passage.
4. The application MUST NOT invent clinical thresholds.
5. LLM output MUST NOT determine whether a red flag exists.
6. LLM output MUST NOT override a safety block.
7. RAG output MUST NOT override a safety block.
8. Missing or ambiguous safety information MUST NOT silently resolve to SAFE.
9. Every implemented rule MUST have an automated test.
10. Every safety block MUST produce an auditable reason and escalation action.

## Traceability

Evidence -> Clinical interpretation -> Product rule -> Implementation -> Test
