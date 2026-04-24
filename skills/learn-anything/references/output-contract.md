# Output Contract

Every response MUST end with exactly one fenced code block whose opening
fence is ` ```yaml learn-anything ` (a yaml code block with a
`learn-anything` info-string suffix). This block carries the skill's
machine-checkable state.

## State fields (every turn)

```yaml learn-anything
current_branch:
  bundle: <relative path to bundle dir, or "-" if pre-map>
  branch: <branch id or "-">
resume_stack:
  - {bundle: ..., branch: ..., return_point: ...}
  # empty list when no frames
phase: <one of the six canonical phase names>
```

Canonical `phase` enum:

- `learner_assessment`
- `domain_mapping`
- `branch_selection`
- `branch_explanation`
- `gap_repair`
- `system_closure`

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

## Full example (substantial turn)

```yaml learn-anything
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

## Example (non-substantial turn)

```yaml learn-anything
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
- Empty `files_written` on a substantial turn
- `resume_stack` missing or not a list
- Absolute paths instead of relative paths

See `invariants.md` (I7) for the binding rule.
