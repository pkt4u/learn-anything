# Learning Flow

Canonical phase enum (used by I7's `phase` field):

`learner_assessment`, `domain_mapping`, `blueprint_drafting`,
`blueprint_self_review`, `branch_selection`, `branch_explanation`,
`gap_repair`, `autonomous_authoring`, `autonomous_review`,
`system_closure`.

Plus one per-turn obligation, not a phase:

**knowledge_asset_update** — after any substantial teaching turn and
before emitting the Output Contract, write files under `knowledge/` to
satisfy I1, I3, I5, and I8.

## Modes

Two modes share the phase enum; the `mode` field of I7 discloses which
mode is active.

- **`interactive`** — default. Learner co-drives.
  `learner_assessment → domain_mapping → branch_selection →
  branch_explanation → (gap_repair → ...) → system_closure`.
- **`autonomous_authoring`** — one approval gate, then autonomous.
  `learner_assessment → domain_mapping → blueprint_drafting →
  blueprint_self_review → [learner approves] → autonomous_authoring →
  autonomous_review → system_closure`.
  In this mode `branch_selection` and `gap_repair` are skipped.

## Phase transitions (interactive mode)

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

## Phase transitions (autonomous mode)

- `domain_mapping` decides that autonomous mode is appropriate when the
  learner has approved a target and delegated authoring.
- `blueprint_drafting` produces `knowledge/<target>/blueprint.yaml`
  covering the target bundle and any prerequisite sibling bundles,
  scoped tightly.
- `blueprint_self_review` runs up to `budget.max_self_review_rounds`
  rounds of six hard checks, auto-repairing where possible and logging
  all changes to `blueprint.review_log`. After the loop, present the
  blueprint (with any remaining findings surfaced) to the learner.
- Only after explicit learner approval, enter `autonomous_authoring`.
  Iterate `blueprint.order`; every substantial turn writes files per
  I1/I3/I5/I6; out-of-blueprint gaps go to `blueprint.deferred`.
- When `blueprint.order` is exhausted, enter `autonomous_review` for
  network-level self-check (at most two repair rounds); remaining
  issues go to `knowledge/<target>/review-issues.md`.
- Exit to `system_closure`.

See `autonomous-authoring.md` for the blueprint schema and the six
self-review checks in full.

## Invariants that bind the flow

- I2 keeps continuity: every response must disclose `current_branch`
  and `resume_stack`. Autonomous mode keeps `resume_stack` empty.
- I1 runs on every substantial turn: write files.
- I3 runs on every substantial turn: no orphan nodes, bidirectional
  links for gap repair.
- I4 governs when `gap_repair` (interactive) or `blueprint_drafting`
  (autonomous) promotes to a sibling bundle.
- I7 formats the per-turn output block.
- I9 bounds autonomous authoring to the approved blueprint.

See `invariants.md` for the full contract.
