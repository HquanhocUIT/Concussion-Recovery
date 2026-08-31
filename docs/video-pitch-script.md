# Video Pitch Script — RE:ENTRY (≤ 4 minutes)

Track A + B (joint) — Phase 5, Pitch & Video submission.

Submission requirement (per [`challenge_information.txt`](../challenge_information.txt), Hack
for Humanity): a video of at most 4 minutes explaining (1) the issue being solved, (2) the
submitted software and its functionality in detail, (3) an overview of how it was created —
along with a link to the public GitHub repo.

The script below is split into exactly those 3 required parts, with timestamps, suggested
narration, and the corresponding shots. Every feature mentioned in the script is a feature that
**actually runs** in the current repo (verified via the test suite and a local run) — nothing
described here is a planned-but-unbuilt feature.

## Total runtime: ~3'50" (a 10s safety margin under the 4-minute cap)

---

### Part 1 — The Problem (0:00 – 0:45, ~45s)

**Shot:** Speaker on camera or voice-over on a simple slide/animation — no app demo needed for
this part.

**Suggested narration:**

> After a concussion, the hardest question isn't "am I injured" — it's:
> **"Should I go to school, go to work, or work out tomorrow?"**
>
> Existing apps mostly help you *track* symptoms — logging today's headache level, how much you
> slept. But they don't help you *decide* what will happen if you follow through on a specific
> plan, before you actually do it.
>
> That's the gap RE:ENTRY fills.

**Must be said:** the problem is a *missing planning/prediction tool*, not a missing tracking
tool — this sets up the "Innovation & Novelty" point in Part 2.

---

### Part 2 — Software & functionality in detail (0:45 – 3:00, ~2'15")

**Shot:** Real screen recording on `localhost:3001`, following the verified 4-step demo flow
(see [`docs/PHASE_3_4.md`](PHASE_3_4.md) §4-step demo script). Record first, edit later — don't
attempt a single live take, since the RAG service takes ~1-2s to respond each time.

**Opening — state Innovation & Novelty explicitly (0:45 – 1:10, ~25s):**

> RE:ENTRY's core difference: this isn't a *track* app — logging symptoms that already happened.
> It's a *plan* tool — a "what-if" simulation: you enter a plan **for tomorrow**, and the system
> simulates the load that plan would put on your brain, **before** you act on it.

**Step 1 — Check-in (1:10 – 1:35, ~25s):**

- Shot: open Daily Check-in, quickly fill in the 5 steps (age/gender → today's symptoms →
  physical/sleep → screen time/study → mood).
- Narration: "Every day, the user does a quick check-in on symptoms and activity. This data
  builds a personalized **Recovery Profile** over time — not a one-size-fits-all threshold."

**Step 2 — Overload / Scenario Simulation (1:35 – 2:05, ~30s):**

- Shot: enter a high-intensity activity plan (e.g. many hours of coding plus high screen time),
  the system returns a `modeled_overload` result with a visual warning.
- Narration: "This is the core feature — **What-if Simulation**. The system estimates the plan's
  cognitive load, physical load, and screen exposure against the user's current capacity — not a
  fixed medical threshold applied to everyone."

**Step 3 — Planner + "Why?" (2:05 – 2:40, ~35s):**

- Shot: view the 3 alternatives the Planner suggests (drop an activity / reduce duration / move
  it), click **"Why?"** on one to open the trade-off, guideline excerpt, source name/page/link.
- Narration: "Instead of just saying 'overloaded', the system offers **concrete alternative
  plans**, with an explanation of *why* — citing directly from 3 real medical guidelines:
  the Amsterdam 2022 Consensus Statement, the Living Concussion Guidelines, and PedsConcussion —
  never inventing medical content."

**Step 4 — Safety gate + Guideline Assistant (2:40 – 3:00, ~20s):**

- Shot: check a red-flag checkbox at the Symptoms step, submit, the Emergency Modal appears
  immediately with no action card generated. Then quickly open the "Guideline Assistant" chat
  button in the corner and ask a sample question ("How soon can I return to sport?").
- Narration: "If a danger sign is detected, the system **hard-blocks** every recommendation and
  asks the user to seek medical help immediately — regardless of what any other module says.
  Users can also ask this guideline assistant a quick question — it only answers from evidence it
  actually found, and never guesses when there's no evidence."

---

### Part 3 — How it was built (3:00 – 3:50, ~50s)

**Shot:** Can show an architecture diagram (simplified from README §4) or a voice-over on a few
representative code snippets — no need to read code line by line.

**Suggested narration:**

> RE:ENTRY is split into independent modules that run in a fixed sequence — the most important
> part is the **safety-first ordering**:
>
> The Recovery Engine reads check-in history and simulates the plan using rule-based logic — no
> AI at this computation step, so the result is always consistent and explainable.
>
> The RAG evidence layer — using the MiniLM embedding model and the Chroma vector database — only
> finds and cites evidence, it never decides anything.
>
> The Safety module runs **before** every other step and has veto power over the entire pipeline.
>
> Finally, an LLM layer — Claude — only rephrases the result into plain language. Turn the LLM
> off, and the system still works fully with a grounded template-based answer — AI only makes it
> more readable, it's never where the decision is made.

**Must be said:** the ordering **Recovery Engine → RAG → Safety → LLM**, and emphasize Safety's
veto power — this directly answers the "Responsible AI" criterion.

---

### Closing (3:50 – 4:00, ~10s buffer)

> RE:ENTRY: not just tracking where you are, but helping you decide what's next. Thanks for
> watching.

*(Show the GitHub repo link on screen during the last second.)*

---

## Pre-submission checklist

- [ ] Video ≤ 4:00, exported and reviewed in full.
- [ ] All 3 required parts are present: the issue / software+functionality / how it was built.
- [ ] The "track vs. plan" difference (Innovation & Novelty) was explicitly stated.
- [ ] The demo was recorded from the real running app (not a static mockup).
- [ ] The GitHub repo is **public**, has a clear README, and contains no real secrets/API keys in
      any commit.
- [ ] The GitHub repo link is included in the video description on submission.
