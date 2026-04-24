# Invariants

These eight properties are the contract of the learn-anything skill. Each
MUST hold whenever the skill is active. The skill is domain-agnostic:
these invariants are stated without reference to any particular subject.

Scope rule:

- I2 applies to **every** turn.
- I7's state fields apply to every turn.
- I1, I3, I4, I5, I6, I8, and I7's content fields apply to
  **substantial teaching turns** only (see definition below).

A **substantial teaching turn** is a response that does any of:

- Introduces a concept name not present anywhere under `knowledge/`
- Adds or revises explanation text of 3+ sentences for an existing concept
- Changes the `current_branch` or the `resume_stack`
- Promotes a gap to a new bundle (see I4)

A response is **non-substantial** if it only answers a meta/navigation
question ("where are we?", "show the map"), confirms a choice, asks the
learner a question without teaching content, or restates existing content
verbatim.

## I1. Persistence Invariant

Every substantial teaching turn MUST create or modify at least one file
under `knowledge/`. The Output Contract (I7) MUST list the exact file
paths written in its `files_written` field. Describing a path without
writing it is a violation.

## I2. Continuity Invariant

The orchestrator state MUST always contain:

- `current_branch`: a `{bundle, branch}` pair identifying the branch
  being taught
- `resume_stack`: an ordered stack of frames, each a tuple
  `{bundle, branch, return_point}` where `return_point` is a short
  textual pointer (e.g. "continue after step 3")

Rules:

- Entering gap repair MUST push the current frame and set
  `current_branch` to the gap.
- Ordinary gap repair exits by popping and restoring the frame.
- Promoted gap repair (I4) exits in one of two explicit sub-modes:
  - **scaffold-only**: create the new sibling bundle (map + README),
    then pop and resume the original branch.
  - **teach-now**: leave the frame on the stack, move `current_branch`
    to the new bundle's chosen branch, continue teaching.
- Drifting into a gap-related topic without popping or explicitly
  promoting is a violation.

Every response (substantial or not) MUST disclose `current_branch` and
the full contents of `resume_stack` via I7.

## I3. Topology Invariant

The knowledge network is a graph persisted on disk.

- Every new node MUST have at least one inbound edge recorded.
- Top-level bundle `README.md` files satisfy this via the **root
  sentinel** `knowledge/README.md`, which MUST list every bundle.
- Intra-bundle nodes MUST have an inbound edge recorded either:
  - as a `## Related` section at the bottom of a chapter file, or
  - as a `related:` field in the concept's entry within `concepts.md`.
- Every gap repair MUST create **bidirectional** edges: the main node
  records the gap as `prerequisite`, the gap node records the main
  branch as `supports`.

No orphan nodes. No one-way links.

## I4. Expansion Rule

A gap topic MUST be promoted to its own sibling `knowledge/<topic>/`
bundle when it meets **any** of:

- It has more than one internal main thread of its own
- It is or will be referenced by more than one main topic
- It cannot be explained in-line in a few paragraphs

On promotion:

- The origin bundle's `links.md` MUST record
  `expansion -> ../<new-topic>/README.md (promoted from gap <section>)`.
- The new bundle's `links.md` MUST record the inbound dependency.
- Control flow follows I2 (scaffold-only or teach-now).

## I5. Shareability Invariant

Every file under `knowledge/` MUST be readable by someone who has never
seen the chat.

- No references to prior chat context ("as we discussed", "above").
- Every bundle's `README.md` stands alone as an entry point.
- All inter-file links use relative paths so the `knowledge/` tree is
  portable as a whole.
- Every cross-bundle edge is explicit and typed (see I8).

## I6. Pedagogy Invariant

Every substantial teaching turn MUST include:

- **Context**: the setting or motivation that makes the concept matter
  (pain point, environment, problem space, or historical conditions,
  whichever fits the domain).
- **Mechanism**: how the concept is structured or operates, told as a
  causal/step-by-step account.
- **At least one text diagram**: ASCII tree, timeline, layer stack,
  flow, or comparison table that reveals structure.
- **Boundary**: where the concept fails, does not apply, or must be
  extended; include known misconceptions.

Pure definition dumps are a violation. Historical or evolutionary
framing is encouraged where it fits but not required.

## I7. Output Contract

Every response MUST end with exactly one fenced code block whose opening
fence is ` ```yaml learn-anything ` (a yaml code block with a
`learn-anything` info-string suffix).

State fields (every turn):

```yaml learn-anything
current_branch:
  bundle: <relative path to bundle dir, or "-" if pre-map>
  branch: <branch id or "-">
resume_stack:
  - {bundle: ..., branch: ..., return_point: ...}
  # empty list when no frames
phase: <one of: learner_assessment | domain_mapping | branch_selection |
              branch_explanation | gap_repair | system_closure>
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

Violations: missing block, malformed YAML, missing required field,
`phase` outside the enum, or empty `files_written` on a substantial
turn.

## I8. Identity and Evolution Invariant

The knowledge network must remain durable under growth and renaming.

- **Stable identifiers**: each bundle's slug directory name MUST NOT
  change once referenced. Rename a concept by keeping the old file or
  section as a redirect stub pointing to the new canonical location.
- **Aliases**: `concepts.md` MAY list aliases for a concept. Aliases do
  not create new nodes.
- **Splits and merges**: splitting a bundle creates new bundles and
  leaves `DEPRECATED.md` in the origin with redirects. Merging follows
  the same pattern in reverse. Both MUST update `knowledge/README.md`.
- **Relation set**: the default relation types are
  `prerequisite`, `supports`, `related`, `application`, `expansion`,
  `alias`, `supersedes`. `links.md` MAY introduce new types; any new
  type MUST be defined in the bundle's `links.md` header.
- **Conflict resolution**: if two nodes cover overlapping content, one
  MUST be canonical and the other a redirect stub or merged.
  Contradictory explanations across bundles are reconciled by an
  explicit scope note in both bundles' `links.md`. Silent divergence
  is a violation.
- **No silent deletion**: removing a node requires a tombstone (short
  note + reason) in the same path or an explicit `DEPRECATED.md`.
