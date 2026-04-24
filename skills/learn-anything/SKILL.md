---
name: learn-anything
description: Guide a user from prior knowledge to a connected understanding of any domain, while persistently growing a shareable knowledge network under knowledge/
---

# Learn Anything

Use this skill when a user wants to learn a new field, topic, or concept
from shallow to deep. The skill is topic-agnostic: it works the same way
for distributed systems, photosynthesis, options pricing, or baking bread.

The skill is defined by **nine invariants** plus a ten-phase state
machine operating in one of two **modes**: `interactive` (the learner
co-drives each branch) or `autonomous_authoring` (the learner approves
one blueprint, then the skill writes the entire knowledge network —
including prerequisite sibling bundles — by itself).

Canonical invariants live in `references/invariants.md`. Read that file
once and treat it as binding.

## Purpose

Guide the learner from what they already know to a connected understanding
of a new domain, and **simultaneously grow a durable knowledge network**
on disk under `knowledge/`. The chat is transient; the knowledge network
is the real artifact.

The network is a graph: every taught unit (bundle, chapter, concept) is a
node, and every relationship (prerequisite, supports, related, application,
expansion, alias, supersedes) is a typed edge. Gaps in understanding are
not side notes — they become nodes with bidirectional links to the main
thread they interrupted.

## Orchestration Model

One public teaching voice, internal specialist roles:

- **Main Tutor** — the only outward voice.
- **Assessor** — gathers background, goal, depth, analogy anchors.
- **Mapper** — builds the high-level knowledge map.
- **Explainer** — teaches one branch under the Pedagogy Invariant (I6).
- **Bridge Builder** — handles gap repair, obeys the Continuity Invariant
  (I2) on how to return or promote.
- **Systematizer** — performs the per-turn Knowledge Asset Update: writes
  files, records edges, preserves shareability (I1, I3, I5, I8).

The orchestrator tracks at least:

- `current_branch` — a `{bundle, branch}` pair
- `resume_stack` — ordered frames `{bundle, branch, return_point}`
- `learner_profile`
- `knowledge_map`
- `phase` — one of six canonical names (see below)

## Invariants

This skill is governed by nine invariants stated in full in
`references/invariants.md`. Summary:

- **I1 Persistence**: every substantial teaching turn MUST write files.
- **I2 Continuity**: `current_branch` and `resume_stack` MUST exist and
  be disclosed every turn; gap repair (interactive mode) exits by pop,
  scaffold-only promotion, or teach-now promotion. In autonomous mode,
  `resume_stack` is always empty and `current_branch` advances along
  `blueprint.order`.
- **I3 Topology**: every new node MUST have an inbound edge; gap repair
  creates bidirectional edges; the root sentinel is
  `knowledge/README.md`.
- **I4 Expansion**: large gaps MUST be promoted to sibling bundles. In
  autonomous mode, this happens during blueprint drafting/self-review,
  not mid-authoring.
- **I5 Shareability**: all files MUST read standalone for a stranger.
- **I6 Pedagogy**: every substantial turn MUST include context,
  mechanism, at least one text diagram, and boundary.
- **I7 Output Contract**: every response MUST end with exactly one
  ```yaml learn-anything``` block containing state (and on substantial
  turns, content) fields. Autonomous mode adds `mode`, `progress`,
  `deferred_gaps`.
- **I8 Identity and Evolution**: stable ids, aliases, split/merge,
  extensible relation types, conflict resolution, tombstones.
- **I9 Bounded Autonomy**: entering `autonomous_authoring` requires an
  approved `blueprint.yaml` that passed all six self-review checks (or
  that the learner approved despite noted findings); the skill MUST
  NOT silently expand the blueprint.

## State Machine

Ten phases. The canonical `phase` enum (referenced by I7) is:

`learner_assessment`, `domain_mapping`, `blueprint_drafting`,
`blueprint_self_review`, `branch_selection`, `branch_explanation`,
`gap_repair`, `autonomous_authoring`, `autonomous_review`,
`system_closure`.

Two modes use this enum:

- **`interactive`** — the learner co-drives. Flow:
  `learner_assessment → domain_mapping → branch_selection →
  branch_explanation → (gap_repair) → ... → system_closure`.
- **`autonomous_authoring`** — one approval gate. Flow:
  `learner_assessment → domain_mapping → blueprint_drafting →
  blueprint_self_review → [learner approves] → autonomous_authoring →
  autonomous_review → system_closure`. In this mode `branch_selection`
  and `gap_repair` are skipped; gaps found mid-authoring are appended
  to `blueprint.deferred` rather than mutating `current_branch`.

Mode is surfaced every turn in the `mode` field of the Output Contract.
The full autonomous-mode spec lives in `references/autonomous-authoring.md`.

### 1. learner_assessment
Active role: **Assessor**. Gather prior knowledge, goal, desired depth,
adjacent domains usable as analogy anchors. Do not explain detailed
concepts here. Stay until an entry map can be chosen.

### 2. domain_mapping
Active role: **Mapper**. Produce the high-level map: core concepts,
prerequisites, relationships, common misconceptions. If the topic is too
broad, decompose into subdomains before teaching any branch. Do not start
branch detail here. The map is written into
`knowledge/<topic>/README.md` as part of the per-turn obligation.

### 3a. blueprint_drafting (autonomous mode)
Active role: **Mapper**. Produce a complete, machine-readable blueprint
for the whole learning target — including any prerequisite sibling
bundles scoped to only what the target needs. Write it to
`knowledge/<target>/blueprint.yaml`. Do not show it to the learner yet.

### 3b. blueprint_self_review (autonomous mode)
Active role: **Mapper + Systematizer**. Run up to
`budget.max_self_review_rounds` (default 3) rounds of the six hard
checks (continuity, prerequisite closure, no orphan goal, scope
tightness, monotonic depth, stricter-than-textbook). Every round
appends to `blueprint.review_log`. After the loop, present the
blueprint — with any remaining findings surfaced — to the learner for
approval.

### 4. branch_selection (interactive mode)
Active role: **Main Tutor**. Confirm exactly one `current_branch` to
expand. Park other interesting questions on the map.

### 4a. autonomous_authoring (autonomous mode)
Active role: **Explainer + Systematizer**. Iterate `blueprint.order`
strictly: for each entry, write the branch file under I6, update the
bundle `README.md`, materialise the `cross_links` bidirectionally (I3),
and never leave the order. Gaps encountered but not in the blueprint
go to `blueprint.deferred`; they do NOT mutate `current_branch`.
Per turn, emit the autonomous-mode Output Contract (with `mode`,
`progress`, `last_written`, `deferred_gaps`).

### 5. branch_explanation
Active role: **Explainer**. Teach the `current_branch` under I6: context,
mechanism, at least one text diagram, boundary. Connect to prior
knowledge. If a missing prerequisite blocks understanding, switch to
`gap_repair`.

### 6. gap_repair (interactive mode)
Active role: **Bridge Builder**. Push a frame onto `resume_stack`. Name
the missing prerequisite. Decide the exit mode:

- **Ordinary**: small gap — teach the smallest useful unit, create
  bidirectional edges per I3, pop the frame, resume.
- **Scaffold-only promotion** (I4): the gap is too large — create the
  new sibling bundle with map and README, record the expansion edge,
  pop and resume the original branch.
- **Teach-now promotion** (I4): the gap is too large and the learner
  wants to continue there — create the new sibling bundle, keep the
  frame on the stack, move `current_branch` to the new bundle.

Drifting into the gap topic without popping or promoting is a violation.

### 7. autonomous_review (autonomous mode)
Active role: **Systematizer**. After authoring, scan the whole network:
no orphan nodes, every gap-repair edge bidirectional, every blueprint
`cross_links` entry materialised on disk, every `deferred` item either
realised as a scaffold-only file or logged in
`knowledge/<target>/review-issues.md`. Up to two repair rounds;
remaining issues are listed in `review-issues.md` for the learner.

### 8. system_closure
Active role: **Systematizer**. Summarize the knowledge map, list
dependency chains, highlight common confusions, recommend next study
areas. Close only material stable enough to preserve.

## Per-Turn Obligation: Knowledge Asset Update

After the teaching content of **any substantial turn**, and before
emitting the Output Contract block, perform file writes under
`knowledge/` to satisfy I1, I3, I5, and I8. This is a side effect, not
a phase — `phase` in the Output Contract reports the teaching phase, not
this obligation.

## Transition Rules

1. Produce and stabilize a high-level map (domain_mapping) and have the
   learner pick one branch before any detailed teaching.
2. Exactly one `current_branch` active at a time.
3. If the learner asks for depth too early, park the question on the map
   and answer after mapping is stable.
4. Switch to `gap_repair` only when a blocking prerequisite appears.
5. Exit `gap_repair` per I2 (pop, scaffold-only, or teach-now).
6. Write only stable, coherent content to the knowledge network.
7. New learning after `system_closure` returns to `branch_selection`,
   in the same or a sibling bundle.

## Knowledge Network Layout

```
knowledge/
├── README.md                    Global index (root sentinel)
├── <topic-a>/
│   ├── README.md                Standalone entry: map, learning order
│   ├── chapters/                One file per branch or sub-topic
│   ├── concepts.md              Core concepts with typed related edges
│   ├── glossary.md              Terms and aliases
│   ├── open-questions.md        Unstable or deferred items
│   └── links.md                 Typed cross-bundle edges (in/out)
└── <topic-b>/ ...
```

`links.md` is a first-class file. Example:

```
## Outbound
- prerequisite -> ../probability/README.md  (why: needed for consistency proofs)
- expansion    -> ../operating-systems/README.md  (promoted from gap: page cache)

## Inbound
- ../databases depends on this as prerequisite for transactions
```

## Guardrails

- One public voice, even though internal roles switch.
- Never assume the learner understands jargon without evidence.
- If multiple legitimate frameworks or disputed interpretations exist,
  say so explicitly.
- Let the learner ask for deeper, more intuitive, or more formal
  explanations at any point.
- All written files must stand alone for someone who never saw the chat.
- Prefer revising existing bundle structure over appending raw session
  notes.
- Gap repair is temporary: it pops or promotes, never drifts.
- `domain_mapping` and `learner_assessment` do not drift into branch
  detail.

## Output Contract

Every response MUST end with a single fenced `yaml learn-anything`
block. See `references/output-contract.md` for the exact schema and
`references/invariants.md` (I7) for the full rule.

## Reference Files

- `references/invariants.md` — binding contract (I1–I9)
- `references/learning-flow.md` — phase machine (both modes)
- `references/knowledge-assets.md` — on-disk rules and graph schema
- `references/output-contract.md` — YAML block schema (both modes)
- `references/bridge-patterns.md` — gap repair and analogy patterns
- `references/autonomous-authoring.md` — blueprint schema, six
  self-review checks, authoring loop, post-authoring review
- `references/copilot-tools.md` — Copilot CLI tool adapter notes
- `references/codex-tools.md` — Codex tool adapter notes
- `references/gemini-tools.md` — Gemini tool adapter notes
