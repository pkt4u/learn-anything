# Learn-Anything Skill: Invariant-Based Redesign

Date: 2026-04-25
Status: Approved design, pending implementation plan
Scope: `skills/learn-anything/` and its test suite

## Problem

The current `learn-anything` skill describes a teaching workflow through soft,
step-oriented rules. In practice this produces three recurring complaints:

1. **No durable output.** The skill often tells the learner which file *should*
   be updated but does not actually write or modify it. Learning evaporates
   when the chat ends.
2. **Main thread drift.** When a prerequisite gap appears, the skill follows
   the gap topic and does not reliably return to the branch that triggered it.
3. **Thin, dry explanations.** The default explanation style produces short
   outlines without causal narrative, diagrams, or a clear learning story.

A deeper problem sits underneath: the skill is written as *procedure*, not as
*invariants*. So each new learner need (bigger maps, cross-topic linking,
shareable outputs) feels like a reason to edit the skill again. The user
explicitly wants a skill they do not have to keep rewriting.

## Goal

Turn `learn-anything` into a domain-agnostic learning system that:

- Works for any topic (cooking, distributed systems, history, etc.)
- Produces a persistent, navigable knowledge network under `knowledge/`
- Is readable and usable by a stranger who never saw the chat
- Keeps the main learning thread stable through any number of detours
- Lets the knowledge network grow indefinitely without editing the skill

## Approach

Rewrite the skill around eight **invariants** and a minimal six-phase
state machine with a clear post-turn persistence obligation. Topic-specific
behavior is pushed down into the knowledge network files, not the skill
itself.

## Key Definitions

**Substantial teaching turn.** A response that does any of the following:

- Introduces a new concept name not present anywhere in `knowledge/`
- Adds or revises explanation text of 3+ sentences for an existing concept
- Changes the `current_branch` or the `resume_stack`
- Promotes a gap to a new bundle (see I4)

A response is **non-substantial** if it only answers a meta/navigation
question ("where are we?", "show the map"), confirms a choice, asks the
learner a question without teaching content, or restates existing
content verbatim. Examples: "Yes, let's continue", "Which branch next?",
"Here's the current map" (no new explanation). Non-substantial turns are
exempt from I1, I6, and I7's content fields, but I2's state disclosure
and I7's state fields still apply.

**Node.** Any file under a `knowledge/<topic>/` bundle that represents a
taught unit: the bundle `README.md`, a file in `chapters/`, or an entry in
`concepts.md`. Node identity is the relative path from the repo root.

**Edge.** A typed link between two nodes. Edges are recorded in
`links.md` (cross-bundle) or inline in the source node's file using a
designated "Related" section (intra-bundle). The default relation set is
extensible — see I8.

**Root sentinel.** The global `knowledge/README.md` is the graph root.
Every bundle's `README.md` has an implicit inbound edge from the root.
This satisfies I3 for top-level bundles without a user-visible parent.

**Stack frame.** Each entry of `resume_stack` is a tuple:
`{bundle, branch, return_point}`, where `return_point` is a short textual
pointer ("continue after step 3", "resume with the boundary discussion").

## Invariants

These properties must hold after any substantial teaching turn. I2 applies
to every turn. I7's state fields apply to every turn; I7's content fields
apply only to substantial turns.

### I1. Persistence Invariant

Every substantial teaching response MUST create or modify at least one file
under `knowledge/`. The response MUST list the exact file paths written in a
`files_written` field. Describing a path without writing it is a violation.

### I2. Continuity Invariant

The orchestrator state MUST always contain:

- `current_branch`: the single branch currently being taught, as a
  `{bundle, branch}` pair
- `resume_stack`: an ordered stack of frames (see Key Definitions)

Rules:

- Entering gap repair MUST push the current `{bundle, branch, return_point}`
  onto `resume_stack` and set `current_branch` to the gap.
- Ordinary gap repair (no promotion) exits by popping the top frame and
  restoring `current_branch` to it.
- Promoted gap repair (I4) exits in one of two sub-modes, chosen explicitly
  and stated in the response:
  - **Scaffold-only**: create the new sibling bundle with map and README,
    then pop the top frame and resume the original branch. The new bundle
    is registered but not taught in this session.
  - **Teach-now**: keep the stack frame in place, move `current_branch` to
    the new bundle's selected branch, and continue. The original frame
    remains on `resume_stack` until the learner is ready to return.
- Drifting into a gap-related topic without either popping or explicitly
  promoting is a violation.

Every response (substantial or not) MUST disclose `current_branch` and the
full contents of `resume_stack`.

### I3. Topology Invariant

The knowledge network is a graph persisted on disk.

- Every new node MUST have at least one inbound edge recorded.
- Top-level bundle `README.md` files satisfy this via the root sentinel
  (`knowledge/README.md`), which MUST list every bundle.
- Intra-bundle nodes MUST have an inbound edge from at least one other
  node, recorded either:
  - as a `## Related` section at the bottom of a chapter file, or
  - as a `related:` field in the concept's entry within `concepts.md`
    (so per-entry concept nodes have their own edges, not just file-level
    ones).
- Every gap repair MUST create **bidirectional** edges between the main
  branch node and the gap node: the main node lists the gap under Related
  (typed as `prerequisite`), and the gap node lists the main branch (typed
  as `supports`).

No orphan nodes. No one-way links.

### I4. Expansion Rule

A gap topic MUST be promoted to its own sibling `knowledge/<topic>/` bundle
when it meets any of:

- It has more than one internal main thread of its own
- It is referenced (or likely to be referenced) by more than one main topic
- It cannot be explained in-line in a few paragraphs

When promoted, the origin bundle MUST record a cross-bundle link stating
"expanded to `knowledge/<other-topic>/`", and the new bundle MUST record
which main threads depend on it. Promotion does not end the current learning
session; the main thread is preserved via I2.

### I5. Shareability Invariant

Every file under `knowledge/` MUST be readable by someone who has never seen
the chat. Specifically:

- No references like "as we discussed above" that depend on chat context
- Every bundle's `README.md` stands alone as a learning entry point
- All inter-file links use relative paths so the entire `knowledge/` tree is
  portable
- Any cross-bundle edge is explicit and typed (prerequisite, related,
  application, expansion)

### I6. Pedagogy Invariant

Every substantial teaching response MUST include:

- **Context**: the setting or motivation that makes the concept matter.
  For invented solutions this is the pre-existing pain point; for natural
  phenomena, mathematical objects, or historical events this is the
  environment, problem space, or conditions that make the concept relevant.
- **Mechanism**: how the concept is structured or how it operates,
  explained as a causal/step-by-step account (invention, derivation,
  process, or timeline — whichever fits the domain).
- **At least one text diagram**: an ASCII tree, timeline, layer stack,
  flow, or comparison table that reveals structure.
- **Boundary**: when the concept fails, does not apply, or must be
  extended; includes known misconceptions.

Pure definition dumps are a violation. Historical or evolutionary framing
is encouraged where it fits but not required.

### I7. Output Contract

Every response MUST end with a single fenced block whose opening fence is
` ```yaml learn-anything ` (a yaml code block with a `learn-anything`
info-string suffix). The block contains state fields; substantial turns
additionally include content fields within the same block.

State fields (every turn):

```yaml learn-anything
current_branch:
  bundle: <relative path of bundle dir, or "-" if pre-map>
  branch: <branch id or "-">
resume_stack:
  - {bundle: ..., branch: ..., return_point: ...}
  # empty list if none
phase: <one of the six phase names>
```

Content fields (substantial turns only, in the same block):

```yaml
this_turn: <one-sentence summary>
files_written:
  - <relative path>
links_created:
  - {from: <path>, to: <path>, type: <relation type>}
  # empty list allowed only when no new nodes were created
next_step: <one-sentence suggestion>
```

The block is emitted exactly once per response. Violations: missing block,
malformed YAML, missing required field, `phase` not in the canonical
six-name enum, or empty `files_written` on a substantial turn.

### I8. Identity and Evolution Invariant

The knowledge network must remain durable under growth and renaming.

- **Stable identifiers**: each bundle has a slug directory name that MUST
  NOT change once referenced by another bundle. If a concept is renamed,
  the old file or section is kept as a redirect stub pointing to the new
  canonical location.
- **Aliases**: `concepts.md` MAY list aliases for a concept. Aliases do
  not create new nodes.
- **Splits and merges**: splitting a bundle creates new bundles and
  leaves a `DEPRECATED.md` in the origin with redirects to the new
  locations. Merging follows the same pattern in reverse. Both operations
  MUST update `knowledge/README.md`.
- **Relation set**: the default relation types are
  `prerequisite`, `supports`, `related`, `application`, `expansion`,
  `alias`, `supersedes`. `links.md` and Related sections MAY introduce
  new types; any new type MUST be defined in the bundle's `links.md`
  header so readers can interpret it.
- **Conflict resolution**: if two nodes cover overlapping content, one
  MUST be marked canonical and the other MUST become a redirect stub or
  be merged. Contradictory explanations across bundles are resolved by
  an explicit note in both bundles' `links.md` describing the scope of
  each. Silent divergence is a violation.
- **No silent deletion**: removing a node requires leaving a tombstone
  (short note + reason) in the same path or an explicit `DEPRECATED.md`.

## State Machine

Six phases plus a per-turn persistence obligation. The canonical phase
enum (referenced by I7's `phase` field) is:
`learner_assessment`, `domain_mapping`, `branch_selection`,
`branch_explanation`, `gap_repair`, `system_closure`.

1. **learner_assessment** — gather background, goal, depth, analogy anchors.
2. **domain_mapping** — produce the high-level map before any branch detail.
3. **branch_selection** — pick exactly one `current_branch`.
4. **branch_explanation** — teach the current branch under I6.
5. **gap_repair** — temporary. Push a stack frame. Exit per I2 (ordinary
   pop, scaffold-only promotion, or teach-now promotion).
6. **system_closure** — summarize when the branch is stable.

**Per-turn obligation (not a phase): Knowledge Asset Update.** After the
teaching content of any substantial turn, the orchestrator MUST perform
file writes to satisfy I1, I3, I5, and I8 before emitting the Output
Contract block. This is a post-content side effect; `phase` in the Output
Contract reports the teaching phase the turn was in, not "Knowledge Asset
Update".

Phase transitions:

- Gap Repair is never terminal. It exits per I2.
- New learning after closure returns to Branch Selection within the same
  or a sibling bundle.

## Knowledge Network Layout

```
knowledge/
├── README.md                    Global index: bundles, relationships, entry order
├── <topic-a>/
│   ├── README.md                Standalone entry: map, learning order, outbound links
│   ├── chapters/                Branches and sub-topics (one file per branch)
│   ├── concepts.md              Core concepts and their dependencies
│   ├── glossary.md              Terms
│   ├── open-questions.md        Unstable or deferred items
│   └── links.md                 Typed edges to other bundles (in/out)
└── <topic-b>/
    └── ...
```

`links.md` is a new first-class file. Its purpose is to make cross-bundle
topology explicit and checkable. Format:

```
## Outbound
- prerequisite -> ../<other-topic>/README.md  (why: <short reason>)
- related      -> ../<other-topic>/chapters/<file>.md
- expansion    -> ../<other-topic>/README.md  (promoted from gap <section>)

## Inbound
- <other-topic> depends on this as prerequisite for <branch>
```

The global `knowledge/README.md` indexes all bundles and summarizes the
network.

## Style of Explanations

The Pedagogy Invariant (I6) requires context, mechanism, a text diagram,
and boundary. Each branch explanation should read as a coherent narrative
that uses whichever of these beats fit the domain:

- **Setting**: what the world or problem space looks like where this
  concept lives. For invented solutions, this is the pre-existing pain
  point. For natural phenomena, this is the environment. For mathematical
  objects, this is the structure they inhabit. For historical events,
  this is the preceding conditions.
- **Motion toward the concept**: how the concept arises from that setting
  — as an invention, a derivation, a discovery, or an observed regularity.
  Include earlier partial answers only when the domain has a clear
  historical arc.
- **Structure or mechanism**, accompanied by a text diagram.
- **What the concept opens up next**: new questions, applications, or
  neighboring concepts it makes reachable.
- **Where it stops working** or gets extended, superseded, or reinterpreted.

This is domain-agnostic. It applies to recursion, photosynthesis,
Byzantine fault tolerance, or baking bread. The ordering of beats is a
guideline; coherent narrative matters more than strict sequence.

## Scope of Changes

Files to modify:

- `skills/learn-anything/SKILL.md` — rewrite around invariants and state machine
- `skills/learn-anything/references/learning-flow.md` — align phase rules
- `skills/learn-anything/references/knowledge-assets.md` — encode I1/I3/I4/I5
- `skills/learn-anything/references/output-contract.md` — encode I7
- `skills/learn-anything/references/bridge-patterns.md` — align to I2 and I4
- `tests/skill-behavior.test.mjs` — assert invariant phrases exist

Files to add:

- `skills/learn-anything/references/invariants.md` — canonical list of
  all eight invariants (I1–I8), citable from SKILL.md and tests

Files to leave:

- `references/copilot-tools.md`, `references/codex-tools.md`,
  `references/gemini-tools.md` — tool adapter notes, unchanged in scope

## Testing Strategy

The test suite asserts both structural presence and machine-checkable
contract. Representative checks:

**Phrase-level (docs)**:

- `invariants.md` exists and names I1 through I8
- SKILL.md references each invariant by id and uses "MUST" language
- SKILL.md states that every substantial turn writes files
- SKILL.md states that Gap Repair exits via I2 (ordinary, scaffold-only,
  or teach-now)
- `knowledge-assets.md` states the bidirectional link rule, the
  promotion rule, and tombstone/rename rules
- `output-contract.md` shows the exact YAML block format with all fields

**Format-level (contract)**:

- A fixture parser test that takes a sample response string, extracts the
  fenced `learn-anything` YAML block, parses it, and asserts required
  fields and their types. This test exists to make I7 enforceable in
  downstream tooling, not to validate a running model.

These checks prevent regression to soft language and make the Output
Contract externally verifiable.

## Non-Goals

- Replacing the existing tool adapter references (`copilot-tools.md`,
  `codex-tools.md`, `gemini-tools.md`)
- Prescribing a specific diagramming notation beyond "text-based"
- Automating graph validation across `knowledge/` bundles (can be a later
  iteration)
- Providing a pre-built example `knowledge/` bundle (out of scope here)

## Risks

- **Over-constraint**: too many MUSTs may make responses feel mechanical.
  Mitigation: keep the Output Contract as a closing block, not a mid-response
  interruption, and keep narrative style in the body.
- **File churn**: writing every turn may create many small edits. Mitigation:
  prefer revising existing chapter files over creating new ones (already in
  I1's spirit).
- **Ambiguity of "substantial"**: the definition is prose. Mitigation: if in
  doubt, write. A one-line file update is cheaper than a lost insight.

## Acceptance Criteria

- All eight invariants are stated verbatim in `invariants.md` and
  referenced from SKILL.md.
- SKILL.md, learning-flow.md, knowledge-assets.md, output-contract.md, and
  bridge-patterns.md are consistent with the invariants.
- `tests/skill-behavior.test.mjs` passes, includes phrase-level invariant
  assertions, and includes a YAML block fixture parser test.
- The repo's existing test command continues to succeed.
