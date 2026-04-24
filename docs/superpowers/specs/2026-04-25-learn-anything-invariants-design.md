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

Rewrite the skill around seven **invariants** that must hold for every
substantial teaching response, plus a minimal state machine and output
contract. Topic-specific behavior is pushed down into the knowledge network
files, not the skill itself.

## Invariants

These seven properties must hold after any substantial teaching response. A
"substantial teaching response" is any turn that introduces, expands, or
refines a concept — not pure clarifications, meta questions, or navigation.

### I1. Persistence Invariant

Every substantial teaching response MUST create or modify at least one file
under `knowledge/`. The response MUST list the exact file paths written in a
`files_written` field. Describing a path without writing it is a violation.

### I2. Continuity Invariant

The orchestrator state MUST always contain:

- `current_branch`: the single branch currently being taught
- `resume_stack`: an ordered stack of branches that were interrupted

Entering gap repair MUST push the interrupted branch onto `resume_stack`.
Completing gap repair MUST pop and resume that branch. Drifting into a
gap-related topic without popping is a violation. Every response MUST
explicitly state `current_branch` and show the contents of `resume_stack`.

### I3. Topology Invariant

The knowledge network is a graph. Every new node (topic, chapter, or concept)
MUST have at least one inbound edge recorded in the network — the node from
which it was reached. Every gap repair MUST create **bidirectional** edges
between the main branch node and the gap node: the main node points to the
gap as a prerequisite, and the gap node records which main threads it
supports. No orphan nodes. No one-way links.

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

- **Origin**: why the problem or concept arose (the motivation, what the
  world looked like before it existed)
- **Evolution**: how the solution grew step by step, as a causal story
- **At least one text diagram**: an ASCII tree, timeline, layer stack, or
  similar visual that shows structure
- **Boundary**: when the idea fails, breaks, or is superseded

Pure definition dumps are a violation.

### I7. Output Contract

Every substantial teaching response MUST include these explicit fields, in
this order, as the closing block of the response:

1. `current_branch`
2. `resume_stack`
3. `this_turn`: short summary of what was taught
4. `files_written`: list of relative paths created or modified this turn
5. `links_created`: list of new edges (`from -> to`, typed)
6. `next_step`: the suggested next action

Missing or empty required fields (other than `links_created` when none are
created) is a violation.

## State Machine

Seven phases, governed by the invariants above:

1. **Learner Assessment** — gather background, goal, depth, analogy anchors.
2. **Domain Mapping** — produce the high-level map before any branch detail.
3. **Branch Selection** — pick exactly one `current_branch`.
4. **Branch Explanation** — teach the current branch under I6.
5. **Gap Repair** — temporary. Push to `resume_stack`. Exit by returning to
   the interrupted branch (I2) or by promoting the gap to its own bundle (I4).
6. **System Closure** — summarize when the branch is stable.
7. **Knowledge Asset Update** — enforce I1, I3, I5 on disk.

Phase transitions:

- Gap Repair is never terminal. It MUST exit via I2 or I4.
- Knowledge Asset Update happens every substantial turn, not only at the end.
- New learning after closure returns to Branch Selection within the same or
  a sibling bundle.

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

The Pedagogy Invariant (I6) is the concrete definition of "tell me like a
story, with diagrams, with logic." Each branch explanation should read as:

1. **What the world looked like before this idea existed.**
2. **What pain point forced the idea to appear.**
3. **What the first attempt was, and why it wasn't enough.**
4. **How the idea we're teaching solves that pain, with a diagram.**
5. **What new problems the idea introduces (which motivate the next branch).**
6. **Where the idea stops working or gets replaced.**

This is domain-agnostic. It applies to recursion, photosynthesis, Byzantine
fault tolerance, or baking bread.

## Scope of Changes

Files to modify:

- `skills/learn-anything/SKILL.md` — rewrite around invariants and state machine
- `skills/learn-anything/references/learning-flow.md` — align phase rules
- `skills/learn-anything/references/knowledge-assets.md` — encode I1/I3/I4/I5
- `skills/learn-anything/references/output-contract.md` — encode I7
- `skills/learn-anything/references/bridge-patterns.md` — align to I2 and I4
- `tests/skill-behavior.test.mjs` — assert invariant phrases exist

Files to add:

- `skills/learn-anything/references/invariants.md` — canonical list of the
  seven invariants, citable from SKILL.md and tests

Files to leave:

- `references/copilot-tools.md`, `references/codex-tools.md`,
  `references/gemini-tools.md` — tool adapter notes, unchanged in scope

## Testing Strategy

The test suite currently asserts that certain phrases appear in SKILL.md and
references. We will extend this with assertions that directly reflect the
invariants, not just section headings. Representative checks:

- SKILL.md mentions each invariant name (I1–I7) and the word "must"
- SKILL.md states that every substantial teaching response writes files
- SKILL.md states that Gap Repair must return to the interrupted branch
- SKILL.md defines the Output Contract fields `files_written`,
  `links_created`, `resume_stack`
- `knowledge-assets.md` states the bidirectional link rule
- `knowledge-assets.md` states the promotion rule for large gaps
- `invariants.md` exists and lists all seven invariants

These phrase-level checks are deliberately conservative: they prevent the
skill from silently regressing to "soft should" language without trying to
semantically validate model behavior.

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

- All seven invariants are stated verbatim in `invariants.md` and referenced
  from SKILL.md.
- SKILL.md, learning-flow.md, knowledge-assets.md, output-contract.md, and
  bridge-patterns.md are consistent with the invariants.
- `tests/skill-behavior.test.mjs` passes and includes the new invariant
  assertions.
- The repo's existing test command continues to succeed.
