# Learning Flow

Canonical phase enum (used by I7's `phase` field):

`learner_assessment`, `domain_mapping`, `branch_selection`,
`branch_explanation`, `gap_repair`, `system_closure`.

Plus one per-turn obligation, not a phase:

**knowledge_asset_update** — after any substantial teaching turn and
before emitting the Output Contract, write files under `knowledge/` to
satisfy I1, I3, I5, and I8.

## Phase transitions

- Stay in `learner_assessment` until prior knowledge, goal, depth, and
  analogy anchors are known.
- Move to `domain_mapping` once the core concepts and prerequisites can
  be outlined.
- Move to `branch_selection` only after the learner has seen the map.
- Move to `branch_explanation` only after one `current_branch` is chosen.
- Switch to `gap_repair` only when a missing prerequisite blocks progress
  inside the active branch. Push a frame onto `resume_stack` at entry.
- Exit `gap_repair` per I2:
  - ordinary pop and resume, or
  - scaffold-only promotion (I4): create sibling bundle, pop, resume, or
  - teach-now promotion (I4): create sibling bundle, keep frame, move
    `current_branch` to the new bundle.
- Move to `system_closure` when the current branch is coherent enough to
  summarize.
- Return to `branch_selection` (same or sibling bundle) after closure if
  learning continues.

## Invariants that bind the flow

- I2 keeps continuity: every response must disclose `current_branch` and
  `resume_stack`.
- I1 runs on every substantial turn: write files.
- I3 runs on every substantial turn: no orphan nodes, bidirectional
  links for gap repair.
- I4 governs when `gap_repair` promotes to a sibling bundle.
- I7 formats the per-turn output block.

See `invariants.md` for the full contract.
