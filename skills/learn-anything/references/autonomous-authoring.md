# Autonomous Authoring

Autonomous authoring is the `mode: autonomous_authoring` flow of the
skill. The learner approves one blueprint; the skill writes the rest.
This file is the complete spec of the blueprint schema, the six
self-review checks, the authoring loop, and the post-authoring
review.

The canonical binding rules live in `invariants.md`. This file is the
detailed playbook I9 refers to.

## When to enter autonomous mode

Enter autonomous mode when ALL of the following hold:

- The learner has stated a target domain or skill.
- The learner has delegated authoring to the skill (explicitly: "write
  the whole thing", "learn it for me", or equivalent).
- The target is broad enough that per-branch interaction would be
  unproductive.

If the target is narrow (single small topic, one or two branches),
stay in interactive mode. Autonomous mode is for multi-bundle
networks.

## Blueprint schema

`knowledge/<target>/blueprint.yaml`:

```yaml
target: <slug>                         # matches the target bundle dir name
goal: "<one sentence, what the learner will be able to do>"
learner_baseline:
  assumed: [<thing1>, <thing2>]        # will NOT be taught
  not_assumed: [<thing3>, <thing4>]    # must be taught or referenced
bundles:
  - slug: <bundle-slug>
    role: <target | prerequisite | companion>
    scope: "<one sentence limiting what this bundle will cover>"
    branches:
      - {slug: <branch-slug>, depth: <integer 1..5>}
      - ...
order:                                 # topological learning order
  - {bundle: <bundle-slug>, branch: <branch-slug>}
  - ...
cross_links:                           # bidirectional edges across bundles
  - {from: <bundle>/<branch>,
     to:   <bundle>/<branch>,
     relation: <prerequisite | supports | related | application |
                expansion | alias | supersedes | custom>}
budget:
  max_branches: <integer, default 40>
  max_words_per_branch: <integer, default 1200>
  max_self_review_rounds: <integer, default 3>
deferred: []                           # append-only during authoring
review_log: []                         # populated during self-review
```

### Schema rules

- Every branch referenced in `order` MUST exist in some bundle's
  `branches` list.
- Every branch in every bundle's `branches` list SHOULD appear in
  `order` — unless deliberately omitted as an "assumed" branch that
  other bundles cite. Omissions MUST be documented in `scope`.
- `depth` within a single bundle MUST be non-decreasing along `order`.
- `cross_links` entries are bidirectional by construction: the skill
  materialises both sides when writing the branch files.
- `deferred` items are short strings describing a gap the authoring
  loop encountered; do not add bundles here.
- `review_log` entries look like:
  `{round: <n>, findings: [...], changes: [...], still_failing: [...]}`.

## Phase flow

```
learner_assessment
  ↓
domain_mapping           — decide autonomous mode is appropriate
  ↓
blueprint_drafting       — write blueprint.yaml
  ↓
blueprint_self_review    — up to budget.max_self_review_rounds
  ↓
[learner approves]
  ↓
autonomous_authoring     — iterate blueprint.order
  ↓
autonomous_review        — network-level self-check
  ↓
system_closure
```

## blueprint_drafting

Goal: produce a complete first draft of `blueprint.yaml` covering the
target bundle AND any prerequisite sibling bundles the learner will
need. Prerequisite bundles MUST be scoped tightly: only the branches
the target actually cites belong in a prerequisite bundle.

Output per turn: writes `blueprint.yaml`. Substantial turn → emits I7
with `files_written`.

Before moving on, estimate branch count. If it exceeds
`budget.max_branches`, stop and ask the learner to narrow the target.

## blueprint_self_review — the six hard checks

Each round of `blueprint_self_review` runs all six checks against the
current blueprint. For each finding, attempt a fix; append the finding
and the fix to `review_log`; rewrite `blueprint.yaml`. Repeat up to
`budget.max_self_review_rounds`. After the loop, present the
blueprint — with any remaining findings — to the learner.

### Check 1. Continuity

For every adjacent pair `(A, B)` in `order`: a reader who has just
absorbed `A` must be able to begin `B` without an unstated leap.

- Fail condition: `B` requires a concept that has not been introduced
  in any prior entry and is not in `learner_baseline.assumed`.
- Fix: insert a bridge branch between `A` and `B` at the appropriate
  depth.

### Check 2. Prerequisite closure

Every branch `X` in `order`: all concepts `X` depends on are either
earlier in `order` or listed in `learner_baseline.assumed`.

- Fail condition: a dependency is missing or appears later than `X`.
- Fix: add a new branch earlier, or move an existing branch earlier.

### Check 3. No orphan goal

From the first entry of `order`, following `prerequisite` and
`supports` edges (both inside bundles and across `cross_links`), every
branch in the target bundle MUST be reachable.

- Fail condition: a target-bundle branch is unreachable.
- Fix: add the missing connective branch or cross-link.

### Check 4. Scope tightness

Every branch in a `prerequisite` bundle MUST be cited by at least one
branch outside that bundle (via `cross_links` or declared dependency).

- Fail condition: a prerequisite branch is not cited anywhere.
- Fix: remove the branch, or merge it into a sibling branch.

### Check 5. Monotonic depth

Within a single bundle, `depth` values along `order` MUST be
non-decreasing.

- Fail condition: depth decreases then increases.
- Fix: reorder, or split the offending branch into two branches at the
  appropriate depths.

### Check 6. Stricter than textbook

Every branch MUST have a short answer recorded (in the bundle's
`README.md` or `blueprint.review-log.md`) to three questions:

- What problem does this step solve for the learner?
- Which earlier step's conclusion does it rely on?
- Which later step does it enable?

A branch whose three answers cannot be written does not pass. Fix by
reformulating the branch, deleting it, or merging it with another.

## Learner approval gate

After the self-review loop, present:

- A human-readable summary of the blueprint (bundles, order, key
  cross-links).
- A "start here → end here" narrative path, so the learner can see the
  story arc before approving.
- Any findings that remain unresolved, flagged clearly.

The learner MUST explicitly approve before `autonomous_authoring`
begins. Approval may include "approve despite findings X, Y" — those
findings stay in `review_log` so they remain auditable.

## autonomous_authoring loop

On every turn in this phase:

1. Read `blueprint.yaml`.
2. Find the first entry in `order` whose target file does not yet
   exist on disk. That is the next branch.
3. Set `current_branch` to that entry. `resume_stack` is empty.
4. Write the branch file under I6 (context, mechanism, ≥1 text
   diagram, boundary). Enforce `budget.max_words_per_branch`.
5. Update the bundle's `README.md` (learning order, link to the new
   chapter) and `concepts.md` if new concepts were introduced.
6. Materialise every relevant entry in `cross_links` as bidirectional
   edges on disk: the `from` branch file's `## Related` section and
   the `to` branch file's `## Related` section, plus both bundles'
   `links.md` outbound/inbound sections.
7. If the branch raises a gap not covered by the blueprint, append a
   short description to `blueprint.deferred`. Do NOT promote or mutate
   `current_branch`. Do NOT add bundles.
8. Emit the autonomous-mode Output Contract.
9. If `budget.max_branches` would be exceeded on the next iteration,
   stop and report rather than over-run.

Interruption: the learner may stop the loop at any turn. On resume,
step 2 above picks the next unwritten entry — authoring is
incrementally idempotent.

## autonomous_review

Entered after `order` is exhausted. Perform in up to two repair
rounds:

- **Orphan check**: every file under `knowledge/<bundle>/` and every
  cross-bundle target has an inbound edge. Auto-repair by adding the
  missing `## Related` entry where it can be inferred; otherwise log.
- **Bidirectional gap-repair check**: every gap-repair edge has both
  `prerequisite` and `supports` sides. Auto-repair by adding the
  missing side where the other side exists.
- **Cross-link realisation check**: every `blueprint.cross_links`
  entry is materialised in the referenced files.
- **Deferred triage**: every `blueprint.deferred` item is either
  materialised as a scaffold-only file (new branch or bundle) OR
  listed in `review-issues.md` with a short explanation and a
  recommendation (ignore, promote next session, merge into existing).
- **Index refresh**: rewrite `knowledge/<target>/README.md` as the
  learner-facing index with a "start here" pointer matching
  `order[0]`.

Whatever cannot be auto-repaired goes to `review-issues.md`. The skill
then enters `system_closure`.

## Interaction with I1–I8

- **I1 Persistence**: every autonomous-mode turn is substantial by
  definition (writes at least the branch file and updates at least
  one `README.md`).
- **I2 Continuity**: `resume_stack` is always empty; `current_branch`
  advances strictly along `order`. Deviating from `order` is a
  violation.
- **I3 Topology**: every cross-link produces both an outbound and an
  inbound edge; `autonomous_review` enforces this post hoc.
- **I4 Expansion**: decided during `blueprint_drafting` and
  `blueprint_self_review`; never mid-authoring.
- **I5 Shareability**: branch files must read standalone; no "as we
  were just discussing" references are possible because there is no
  chat discussion in autonomous mode.
- **I6 Pedagogy**: every branch file still requires context,
  mechanism, ≥1 text diagram, boundary. Stricter-than-textbook applies
  (check 6).
- **I7 Output Contract**: `mode` field required; `progress`,
  `last_written`, `deferred_gaps` required in authoring phases;
  `review_round`, `findings` required in self-review phase.
- **I8 Identity and Evolution**: bundle slugs in `blueprint.yaml` are
  the canonical slugs; renaming between blueprint approval and
  authoring completion requires redirect stubs exactly as in
  interactive mode.
- **I9 Bounded Autonomy**: the whole file is the playbook for this
  invariant.
