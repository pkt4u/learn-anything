# Output Contract

Every response MUST end with exactly one fenced code block whose opening
fence is ` ```yaml learn-anything ` (a yaml code block with a
`learn-anything` info-string suffix). This block carries the skill's
machine-checkable state.

## State fields (every turn)

```yaml learn-anything
mode: <interactive | autonomous_authoring>
current_branch:
  bundle: <relative path to bundle dir, or "-" if pre-map>
  branch: <branch id or "-">
resume_stack:
  - {bundle: ..., branch: ..., return_point: ...}
  # empty list when no frames; always empty in autonomous mode
phase: <one of the ten canonical phase names>
```

Canonical `phase` enum:

- `learner_assessment`
- `domain_mapping`
- `blueprint_drafting`
- `blueprint_self_review`
- `branch_selection`
- `branch_explanation`
- `gap_repair`
- `autonomous_authoring`
- `autonomous_review`
- `system_closure`

Canonical `mode` enum:

- `interactive`
- `autonomous_authoring`

## Content fields (substantial turns only, same block)

```yaml
this_turn: <one-sentence summary of what was taught>
files_written:
  - <relative path>
links_created:
  - {from: <path>, to: <path>, type: <relation type>}
  # empty list allowed only when no new nodes were created
next_step: <one-sentence suggestion>
```

## Autonomous-mode additions (required when `mode: autonomous_authoring`)

```yaml
progress: "<written>/<total> branches, <done>/<total> bundles"
last_written:
  - <relative path>
deferred_gaps:
  - <short description>
  # empty list allowed
```

## Self-review-phase additions (required when `phase: blueprint_self_review`)

```yaml
review_round: <integer, 1..max_self_review_rounds>
findings:
  - {check: <1..6>, detail: <string>, fix: <string>}
```

## Full example (interactive, substantial turn)

```yaml learn-anything
mode: interactive
current_branch:
  bundle: knowledge/distributed-systems
  branch: replication
resume_stack: []
phase: branch_explanation
this_turn: Introduced primary-backup replication and its split-brain failure mode.
files_written:
  - knowledge/distributed-systems/chapters/replication.md
  - knowledge/distributed-systems/concepts.md
links_created:
  - {from: knowledge/distributed-systems/chapters/replication.md,
     to: knowledge/distributed-systems/concepts.md#split-brain,
     type: related}
next_step: Teach quorum-based replication as the next branch.
```

## Full example (autonomous, substantial turn)

```yaml learn-anything
mode: autonomous_authoring
current_branch:
  bundle: knowledge/reverse-engineering
  branch: static-analysis
resume_stack: []
phase: autonomous_authoring
this_turn: Authored static-analysis chapter; wired cross-link to ecu-bin-modification/calibration-tables.
files_written:
  - knowledge/reverse-engineering/chapters/static-analysis.md
  - knowledge/reverse-engineering/README.md
  - knowledge/reverse-engineering/links.md
  - knowledge/ecu-bin-modification/links.md
links_created:
  - {from: knowledge/ecu-bin-modification/chapters/calibration-tables.md,
     to: knowledge/reverse-engineering/chapters/static-analysis.md,
     type: prerequisite}
  - {from: knowledge/reverse-engineering/chapters/static-analysis.md,
     to: knowledge/ecu-bin-modification/chapters/calibration-tables.md,
     type: supports}
progress: "7/24 branches, 1/4 bundles"
last_written:
  - knowledge/reverse-engineering/chapters/static-analysis.md
deferred_gaps: []
next_step: Author ghidra-usage next per blueprint.order.
```

## Example (self-review turn)

```yaml learn-anything
mode: autonomous_authoring
current_branch: {bundle: knowledge/ecu-bin-modification, branch: "-"}
resume_stack: []
phase: blueprint_self_review
this_turn: Second self-review round; inserted bridge branch between CAN-bus and OBD-II.
files_written:
  - knowledge/ecu-bin-modification/blueprint.yaml
  - knowledge/ecu-bin-modification/blueprint.review-log.md
links_created: []
review_round: 2
findings:
  - {check: 1, detail: "Jump from can-bus depth 2 to obd2 depth 2 skips frame-format basics.",
     fix: "Insert bridge branch can-frame-format at depth 2 before obd2."}
next_step: Present blueprint for learner approval.
```

## Example (non-substantial turn)

```yaml learn-anything
mode: interactive
current_branch:
  bundle: knowledge/distributed-systems
  branch: replication
resume_stack: []
phase: branch_explanation
```

## Violations

- Missing block
- More than one block
- Malformed YAML
- Missing required field
- `phase` not in the enum
- `mode` not in the enum
- Empty `files_written` on a substantial turn
- `resume_stack` missing or not a list
- Non-empty `resume_stack` when `mode: autonomous_authoring`
- Absolute paths instead of relative paths
- Missing `progress`/`last_written`/`deferred_gaps` when
  `mode: autonomous_authoring`
- Missing `review_round`/`findings` when `phase: blueprint_self_review`

See `invariants.md` (I7) for the binding rule.
