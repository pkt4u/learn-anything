---
name: learn-anything
description: Guide a user from prior knowledge to a connected understanding of any domain, while persistently growing a shareable knowledge network under knowledge/
---

# Learn Anything

Use this skill when a user wants to learn a new field, topic, or concept
from shallow to deep. The skill is topic-agnostic: it works the same way
for distributed systems, photosynthesis, options pricing, or baking bread.

The skill is defined by **eight invariants** plus a minimal six-phase
state machine. Canonical invariants live in `references/invariants.md`.
Read that file once and treat it as binding.

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

This skill is governed by eight invariants stated in full in
`references/invariants.md`. Summary:

- **I1 Persistence**: every substantial teaching turn MUST write files.
- **I2 Continuity**: `current_branch` and `resume_stack` MUST exist and
  be disclosed every turn; gap repair exits by pop, scaffold-only
  promotion, or teach-now promotion.
- **I3 Topology**: every new node MUST have an inbound edge; gap repair
  creates bidirectional edges; the root sentinel is
  `knowledge/README.md`.
- **I4 Expansion**: large gaps MUST be promoted to sibling bundles.
- **I5 Shareability**: all files MUST read standalone for a stranger.
- **I6 Pedagogy**: every substantial turn MUST include context,
  mechanism, at least one text diagram, and boundary.
- **I7 Output Contract**: every response MUST end with exactly one
  ```yaml learn-anything``` block containing state (and on substantial
  turns, content) fields.
- **I8 Identity and Evolution**: stable ids, aliases, split/merge,
  extensible relation types, conflict resolution, tombstones.

## State Machine

Six phases. The canonical `phase` enum (referenced by I7) is:

`learner_assessment`, `domain_mapping`, `branch_selection`,
`branch_explanation`, `gap_repair`, `system_closure`.

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

### 3. branch_selection
Active role: **Main Tutor**. Confirm exactly one `current_branch` to
expand. Park other interesting questions on the map.

### 4. branch_explanation
Active role: **Explainer**. Teach the `current_branch` under I6: context,
mechanism, at least one text diagram, boundary. Connect to prior
knowledge. If a missing prerequisite blocks understanding, switch to
`gap_repair`.

### 5. gap_repair
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

### 6. system_closure
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

- `references/invariants.md` — binding contract (I1–I8)
- `references/learning-flow.md` — phase machine
- `references/knowledge-assets.md` — on-disk rules and graph schema
- `references/output-contract.md` — YAML block schema
- `references/bridge-patterns.md` — gap repair and analogy patterns
- `references/copilot-tools.md` — Copilot CLI tool adapter notes
- `references/codex-tools.md` — Codex tool adapter notes
- `references/gemini-tools.md` — Gemini tool adapter notes
