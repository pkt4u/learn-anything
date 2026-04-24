# Knowledge Assets

The on-disk knowledge network is the real artifact of learning. It MUST
remain readable, navigable, and shareable on its own. The chat is
transient.

## Layout

```
knowledge/
├── README.md                    Global index, root sentinel (I3)
├── <topic-a>/
│   ├── README.md                Standalone entry for this bundle
│   ├── chapters/                One file per branch or sub-topic
│   ├── concepts.md              Core concepts with typed related edges
│   ├── glossary.md              Terms and aliases
│   ├── open-questions.md        Unstable or deferred items
│   ├── links.md                 Typed cross-bundle edges (in/out)
│   ├── blueprint.yaml           (autonomous only) machine-readable plan
│   ├── blueprint.review-log.md  (autonomous only) self-review trail
│   └── review-issues.md         (autonomous only) post-authoring triage
└── <topic-b>/ ...
```

## File rules

**Global `knowledge/README.md`** (root sentinel):

- Lists every bundle with a one-line description and a link.
- Summarizes cross-bundle relationships in prose.
- Every new top-level bundle MUST be added here; this is the inbound
  edge that satisfies I3 for bundle `README.md` files.

**Bundle `README.md`**:

- Stands alone: a stranger who opens it can start learning without chat
  context (I5).
- Contains the bundle's high-level map and suggested learning order.
- Links outward to `chapters/`, `concepts.md`, `glossary.md`,
  `open-questions.md`, and `links.md` via relative paths.

**`chapters/`**:

- One file per branch or sub-topic. Each file is a node in the graph.
- Each chapter MUST end with a `## Related` section listing inbound and
  outbound edges by relative path and relation type. This satisfies I3
  for intra-bundle nodes.

**`concepts.md`**:

- Each entry is a concept node. Entries MAY declare a `related:` field
  listing typed edges. Concept nodes without any inbound edge violate I3.
- Aliases are listed under the canonical concept (I8), not as new nodes.

**`glossary.md`**:

- Definitions only. Not a graph node.

**`open-questions.md`**:

- Items that are not yet stable enough to teach. When an item becomes
  stable, it is promoted into a chapter or concept and removed from
  here.

**`links.md`**:

- Cross-bundle typed edges. Example:

  ```
  ## Outbound
  - prerequisite -> ../probability/README.md  (why: consistency proofs)
  - expansion    -> ../operating-systems/README.md  (promoted from gap: page cache)

  ## Inbound
  - ../databases depends on this as prerequisite for transactions
  ```

- Any non-default relation type introduced here MUST be defined at the
  top of the file so readers can interpret it (I8).

**`blueprint.yaml`** (autonomous mode only):

- Machine-readable plan covering the target bundle and all
  prerequisite sibling bundles scoped to only what the target needs.
- Lives at `knowledge/<target>/blueprint.yaml`.
- Required fields: `target`, `goal`, `learner_baseline`, `bundles`,
  `order`, `cross_links`, `budget`, `deferred`, `review_log`.
- Authoring reads this file on every turn to find the next unwritten
  entry. Never edited mid-authoring except to append to `deferred`.

**`blueprint.review-log.md`** (autonomous mode only):

- Prose trail of each `blueprint_self_review` round: findings, changes,
  still-failing items.
- Lets the learner audit how the blueprint was tightened before
  approval.

**`review-issues.md`** (autonomous mode only):

- Populated during `autonomous_review`. Lists any deferred gap not
  realised as a scaffold file, any missing cross-link, any orphan
  detected that the skill could not auto-repair.
- Learner triages this list in `system_closure`.

See `autonomous-authoring.md` for the full blueprint schema and the
six self-review checks.

## Write rules (per substantial turn, I1)

Every substantial teaching turn MUST create or modify at least one file
under `knowledge/`. Prefer revising existing files over appending new
ones. Describing a path without writing it is a violation.

## Topology rules (I3)

- No orphan nodes. Every new node has an inbound edge.
- Gap repair creates **bidirectional** edges: main node lists the gap
  as `prerequisite`; gap node lists the main branch as `supports`.
- All links use relative paths (I5).

## Promotion rules (I4)

Promote a gap to a sibling `knowledge/<topic>/` bundle when any of:

- The gap has more than one internal main thread of its own.
- The gap is or will be referenced by more than one main topic.
- The gap cannot be explained in-line in a few paragraphs.

On promotion:

- Create the new bundle with `README.md`, `chapters/`, `concepts.md`,
  `glossary.md`, `open-questions.md`, `links.md`.
- Add `expansion` edge in the origin's `links.md`.
- Add inbound `supports`/`prerequisite` edge in the new bundle's
  `links.md`.
- Update `knowledge/README.md` with the new bundle.
- Proceed per I2 (scaffold-only or teach-now).

## Identity, rename, split, merge, delete (I8)

- Bundle slug directory names are stable once referenced. Rename a
  concept by keeping a redirect stub at the old path pointing to the
  new canonical location.
- Aliases live in `concepts.md` under the canonical concept.
- Splitting a bundle: create new bundles and leave a `DEPRECATED.md`
  in the origin with redirects. Update `knowledge/README.md`.
- Merging: the inverse — `DEPRECATED.md` in the source bundle, canonical
  content in the target.
- Conflicts between overlapping nodes: one is canonical, the other is a
  redirect stub or is merged. Contradictory cross-bundle explanations
  MUST be reconciled by a scope note in both bundles' `links.md`.
- No silent deletion. Leave a tombstone (short note + reason) or
  `DEPRECATED.md`.

## Shareability (I5)

- Every file reads standalone for a stranger.
- No chat-context references ("as we discussed", "above").
- The entire `knowledge/` tree is portable as a whole because all links
  are relative.
