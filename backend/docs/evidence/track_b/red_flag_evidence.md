# Track B - Red-Flag Clinical Evidence

## Purpose

This document contains only verified authoritative clinical evidence used to define deterministic red-flag safety rules.

## Evidence Sources

| Source ID | Authority | Document | URL | Verification status |
|---|---|---|---|---|
| SRC-001 | Centers for Disease Control and Prevention (CDC) | Concussion Signs and Symptoms Checklist | https://www.cdc.gov/heads-up/media/pdfs/schools/TBI_schools_checklist_508-a.pdf | VERIFIED |
| SRC-002 | Centers for Disease Control and Prevention (CDC) | Recovering from a Mild Traumatic Brain Injury or Concussion | https://www.cdc.gov/traumatic-brain-injury/media/pdfs/2024/05/patient_discharge_instructions_ENG-508.pdf | VERIFIED |

## Red-Flag Evidence

| Rule ID | Clinical condition | Evidence source | Exact supporting passage | Product rule | System behavior | Test |
|---|---|---|---|---|---|---|
| RF-001 | Worsening headache that does not go away | SRC-001, SRC-002 | CDC identifies a headache that gets worse and does not go away as a danger sign requiring immediate medical evaluation. | If the configured input explicitly indicates a worsening headache that does not go away, trigger RF-001. | BLOCKED_RED_FLAG | test_rf_001_worsening_headache |
| RF-002 | Repeated vomiting or nausea after concussion | SRC-001, SRC-002 | CDC identifies repeated vomiting or nausea as a danger sign requiring immediate medical evaluation. | If the configured input explicitly indicates repeated vomiting or nausea, trigger RF-002. | BLOCKED_RED_FLAG | test_rf_002_repeated_vomiting |
| RF-003 | Neurological danger sign such as weakness, numbness, seizure, slurred speech, increasing confusion, or inability to awaken | SRC-001, SRC-002 | CDC identifies weakness/numbness, convulsions or seizures, slurred speech, increasing confusion, and drowsiness or inability to awaken as danger signs requiring immediate medical evaluation. | If the configured input explicitly indicates one of the configured neurological danger signs, trigger RF-003. | BLOCKED_RED_FLAG | test_rf_003_neurological_danger_sign |

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