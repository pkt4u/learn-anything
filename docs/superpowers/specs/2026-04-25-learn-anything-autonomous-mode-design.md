# learn-anything — Autonomous Authoring Mode (Design)

**Status:** Draft
**Date:** 2026-04-25
**Supersedes:** extends `2026-04-25-learn-anything-invariants-design.md`

## Problem

The existing invariant-based skill requires the user to co-drive every branch
selection and gap repair. For learning a large domain (e.g. "ECU bin
modification" which needs reverse engineering, automotive-domain and
flashing-tools as prerequisites) this is too many turns of interaction.

The user wants: **input a domain → review one outline → the skill
autonomously authors the entire knowledge network**, including prerequisite
domains as their own sibling bundles, cross-linked and learnable by both the
user and strangers.

## Goals

1. Single approval gate per learning target. No per-concept interaction after
   blueprint approval.
2. Prerequisite bundles are planned automatically and scoped tightly to what
   the target needs (no infinite outward expansion).
3. The blueprint is self-reviewed by the skill before the user sees it so that
   the plan is already rigorous — more rigorous than a textbook table of
   contents.
4. During autonomous authoring, every substantial turn still writes files
   (I1), still maintains graph integrity (I3), still follows pedagogy (I6),
   still emits the output contract (I7). Autonomy does not relax I1–I8.
5. Bounded autonomy — the skill stops and reports rather than silently
   over-running the blueprint.

## Non-goals

- Running outside a chat turn loop (no daemons, no cron).
- Replacing interactive mode. Interactive mode remains available for users who
  want to co-drive.
- Generating perfect prose. The self-review bar is structural rigor, not style.

## Key Definitions

- **Blueprint** — `knowledge/<target>/blueprint.yaml`. The machine-readable
  plan that drives autonomous authoring.
- **Target bundle** — the user's requested domain.
- **Prerequisite bundle** — a sibling bundle written only to the extent the
  target needs.
- **Bundle role** — one of `target`, `prerequisite`, `companion`.
- **Autonomous authoring mode** — execution mode in which the skill iterates
  the blueprint's `order` without asking the user between branches.
- **Bounded autonomy** — the invariant that autonomy is always bounded by an
  approved blueprint and explicit budgets.

## Architecture

### Revised phase enum

The canonical phase enum becomes (order is logical, not chronological on every
turn):

1. `learner_assessment`
2. `domain_mapping`
3. `blueprint_drafting`       *(new)*
4. `blueprint_self_review`    *(new)*
5. `branch_selection`         *(interactive mode only)*
6. `branch_explanation`
7. `gap_repair`               *(interactive mode only; autonomous mode defers)*
8. `autonomous_authoring`     *(new)*
9. `autonomous_review`        *(new)*
10. `system_closure`

`knowledge_asset_update` remains a per-turn obligation, not a phase.

### Modes

Two execution modes share the phase enum:

- **`interactive`** — the original flow. Phases 1→2→5→6→(7)→...→10.
- **`autonomous_authoring`** — the new flow. Phases 1→2→3→4→[user approval]→8→9→10.
  Phases 5 and 7 are skipped; any gap discovered during authoring is recorded
  in `blueprint.deferred` instead of mutating `current_branch`.

Mode is surfaced every turn in the output contract (`mode:` field).

### Blueprint schema

`knowledge/<target>/blueprint.yaml`:

```yaml
target: ecu-bin-modification
goal: "User can independently reverse engineer and modify ECU bin files."
learner_baseline:
  assumed: [reading English technical docs, basic C]
  not_assumed: [assembly, CAN bus, ECU internals]
bundles:
  - slug: ecu-bin-modification
    role: target
    branches:
      - {slug: bin-file-structure,    depth: 1}
      - {slug: calibration-tables,    depth: 2}
      - {slug: checksum-repair,       depth: 2}
      - {slug: flashing-workflow,     depth: 3}
  - slug: reverse-engineering
    role: prerequisite
    scope: "Only static analysis, assembly basics, Ghidra usage."
    branches:
      - {slug: assembly-registers,    depth: 1}
      - {slug: static-analysis,       depth: 2}
      - {slug: ghidra-usage,          depth: 2}
  - slug: automotive-domain
    role: prerequisite
    scope: "Only ECU role in the vehicle, CAN bus basics, OBD-II."
    branches:
      - {slug: ecu-role,              depth: 1}
      - {slug: can-bus,               depth: 2}
      - {slug: obd2,                  depth: 2}
  - slug: flashing-tools
    role: prerequisite
    branches:
      - {slug: kess-ktag-principles,  depth: 2}
      - {slug: bdm-jtag,              depth: 2}
      - {slug: read-write-workflow,   depth: 3}
order:
  - {bundle: automotive-domain,     branch: ecu-role}
  - {bundle: automotive-domain,     branch: can-bus}
  - {bundle: reverse-engineering,   branch: assembly-registers}
  - ...
cross_links:
  - {from: ecu-bin-modification/calibration-tables,
     to:   reverse-engineering/static-analysis,
     relation: prerequisite}
budget:
  max_branches: 40
  max_words_per_branch: 1200
  max_self_review_rounds: 3
deferred: []         # populated during authoring
review_log: []       # populated during self-review
```

### Blueprint self-review (six hard checks)

Before the user sees the blueprint, the skill runs up to
`budget.max_self_review_rounds` rounds of automatic review. Each round checks:

1. **Continuity.** For every adjacent pair in `order`, the reader of the
   earlier branch must be able to start the later branch without unstated
   leaps. Violation → insert a bridge branch between them.
2. **Prerequisite closure.** Every branch whose explanation will depend on
   concept X must have X appear earlier in `order`, *or* X must be listed in
   `learner_baseline.assumed`. Violation → add the missing branch, or move an
   existing branch earlier.
3. **No orphan goal.** From the first branch in `order`, following
   `prerequisite` and `supports` edges forward, every branch in the target
   bundle must be reachable. Violation → add the missing connective branch.
4. **Scope tightness.** Every branch in a `prerequisite` bundle must be cited
   by at least one branch outside it (via `cross_links` or declared
   dependencies). Violation → remove the branch, or merge it into another.
5. **Monotonic depth.** Within a bundle, `depth` must be non-decreasing along
   `order`. Violation → reorder.
6. **Stricter than textbook.** Each branch must have short answers recorded to
   three questions: *what problem does this step solve*, *which earlier step's
   conclusion does it depend on*, *which later step does it enable*. A branch
   that cannot answer all three does not pass.

Each round appends to `blueprint.review_log` (a list of objects with
`round`, `findings`, `changes`, `still_failing`).

If after `max_self_review_rounds` the blueprint still fails any check, the
skill presents the blueprint to the user with the remaining issues flagged
rather than silently proceeding.

### Autonomous authoring loop

```
for entry in blueprint.order:
    write knowledge/<bundle>/<branch>.md following I6
    update knowledge/<bundle>/README.md
    write/verify cross_links as bidirectional edges (I3)
    if encountered gap not covered by blueprint:
        append to blueprint.deferred
        continue                      # do not mutate current_branch
    emit output contract with:
        mode: autonomous_authoring
        progress: "<written>/<total>"
        last_written: [paths]
        deferred_gaps: [...]
    if budget exceeded:
        stop and report
```

`current_branch` in autonomous mode is always the branch currently being
written. `resume_stack` is always empty (autonomy replaces the
continuity-by-stack contract with continuity-by-order).

### Autonomous review (post-authoring)

After the loop finishes, the skill runs a network-level review:

- Every file on disk has at least one incoming link (no orphan node, per I3).
- Every gap-repair edge is bidirectional.
- Every `cross_links` entry in the blueprint is materialised on disk.
- Every `deferred` gap is either (a) materialised as a scaffold-only file, or
  (b) explicitly recorded in `knowledge/<target>/review-issues.md` for the
  user to triage.
- The final `knowledge/<target>/README.md` is rewritten as an index with a
  "start here" pointer.

Up to two repair rounds are attempted; remaining issues go to
`review-issues.md`.

## Invariants (addendum)

The existing I1–I8 are unchanged. One new invariant is added:

**I9 Bounded Autonomy.** Entering `autonomous_authoring` requires an approved
`blueprint.yaml` that has passed all six self-review checks (or that the user
explicitly approved despite unresolved findings). During authoring, the skill
may not expand the blueprint beyond `budget`, may not silently add new
bundles, and must stop and report rather than over-run.

I2 is clarified: in autonomous mode, `resume_stack` is always empty, and
`current_branch` advances strictly along `blueprint.order`. The
*gap-repair-then-resume* semantics of I2 apply only in interactive mode; in
autonomous mode, gaps go to `blueprint.deferred`.

I4 is clarified: the "promote to a sibling bundle" behaviour happens during
`blueprint_drafting`/`blueprint_self_review`, not mid-authoring.

## Output contract additions

The existing `learn-anything` YAML block adds two fields:

- `mode` — `interactive` | `autonomous_authoring`. Required every turn.
- `progress` — string `"<written>/<total> branches, <done>/<total> bundles"`.
  Required in autonomous mode.
- `deferred_gaps` — list of strings. Optional; present when new deferrals
  occurred this turn.

During `blueprint_self_review` turns, the block also includes:

- `review_round` — integer, 1..`max_self_review_rounds`.
- `findings` — list; each entry `{check: <1..6>, detail: ..., fix: ...}`.

## File changes

1. `skills/learn-anything/SKILL.md`
   - Add I9 to the invariants section.
   - Add the two new modes and the expanded phase enum.
   - Add a short "autonomous authoring" top-level section linking to the new
     reference.

2. `skills/learn-anything/references/invariants.md`
   - Append I9 with full wording and enforcement notes.
   - Clarify I2 and I4 mode-dependence.

3. `skills/learn-anything/references/learning-flow.md`
   - Add phases `blueprint_drafting`, `blueprint_self_review`,
     `autonomous_authoring`, `autonomous_review` and their transitions.

4. `skills/learn-anything/references/output-contract.md`
   - Add `mode`, `progress`, `deferred_gaps`, `review_round`, `findings`.
   - Add an autonomous-mode example.

5. `skills/learn-anything/references/knowledge-assets.md`
   - Add `blueprint.yaml` and `blueprint.review-log.md` to the on-disk schema.
   - Add `review-issues.md` as the post-authoring triage file.

6. `skills/learn-anything/references/autonomous-authoring.md` *(new)*
   - The full spec of blueprint schema, six self-review checks, authoring
     loop, and post-authoring review.

7. Existing `references/bridge-patterns.md` — unchanged.

## Risks and mitigations

- **Blueprint too big to fit one turn.** Mitigation: `budget.max_branches`
  with a default of 40; skill stops and asks the user to split the target if
  the draft exceeds it before self-review.
- **Autonomous loop runs past context window.** Mitigation: `progress` field
  lets the user resume by re-issuing the target; authoring is idempotent per
  branch because files are written incrementally and the skill re-reads
  `blueprint.yaml` to find the next unwritten entry.
- **Self-review always passes trivially.** Mitigation: the six checks are
  structural, not stylistic; check 6 forces each branch to declare its own
  role in the learning chain, which the skill can verify mechanically.
- **Prerequisite bundles drift toward completeness.** Mitigation: check 4
  (scope tightness) deletes any prerequisite branch nobody cites.
- **User wants to intervene mid-run.** Mitigation: the user can interrupt at
  any point; the skill re-enters at the next unwritten entry in
  `blueprint.order`.
