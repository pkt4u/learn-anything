# Learn Anything Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `learn-anything` so it stays map-first, branch-by-branch, and turns stable learning into connected knowledge assets.

**Architecture:** Keep one public `learn-anything` skill, but rewrite it around an internal orchestrator, specialist role contracts, and a hard-gated state machine. Update only the skill-facing Markdown files and the narrow Node tests that verify the behavior contract.

**Tech Stack:** Markdown skill files, Markdown reference files, Node.js built-in test runner

---

## File Structure

- `skills/learn-anything/SKILL.md` — main skill contract and state machine
- `skills/learn-anything/references/learning-flow.md` — compact phase switching rules
- `skills/learn-anything/references/bridge-patterns.md` — prerequisite repair and analogy rules
- `skills/learn-anything/references/knowledge-assets.md` — topic bundle update rules
- `skills/learn-anything/references/output-contract.md` — required response fields
- `tests/skill-behavior.test.mjs` — behavior contract coverage
- `docs/specs/2026-04-23-learn-anything-redesign-design.md` — approved redesign spec

## Task 1: Add the approved redesign docs

**Files:**
- Create: `docs/specs/2026-04-23-learn-anything-redesign-design.md`
- Create: `docs/plans/2026-04-23-learn-anything-redesign-implementation-plan.md`

- [ ] Copy the approved redesign spec into `docs/specs/2026-04-23-learn-anything-redesign-design.md`.
- [ ] Save this implementation plan in `docs/plans/2026-04-23-learn-anything-redesign-implementation-plan.md`.

## Task 2: Rewrite the skill around the state machine

**Files:**
- Modify: `skills/learn-anything/SKILL.md`
- Modify: `skills/learn-anything/references/learning-flow.md`
- Modify: `skills/learn-anything/references/bridge-patterns.md`
- Modify: `skills/learn-anything/references/knowledge-assets.md`
- Modify: `skills/learn-anything/references/output-contract.md`

- [ ] Replace principle-only wording in `SKILL.md` with an operational flow: purpose, orchestrator, role contracts, state machine, transition rules, anti-drift guardrails, and response contract.
- [ ] Make `learning-flow.md` reflect the new map-first sequence: assessment, mapping, branch selection, branch explanation, gap repair, system closure, and knowledge asset update.
- [ ] Tighten the reference files so they reinforce single-branch teaching, minimal prerequisite repair, and stable-only documentation updates.

## Task 3: Keep the repo installable and covered

**Files:**
- Modify: `tests/skill-behavior.test.mjs`

- [ ] Update the behavior test so it still checks the public contract, plus the new orchestration markers like `Main Tutor`, `Branch Selection`, `current_branch`, and the map-before-detail rule.
- [ ] Run `npm test` from the worktree and keep only the minimal test updates required for the new skill wording.
- [ ] Commit the branch changes and push `feat/learn-anything-redesign`.
