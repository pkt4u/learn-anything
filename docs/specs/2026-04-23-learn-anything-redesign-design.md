# Learn Anything Redesign

**Date:** 2026-04-23

## Problem

The current `learn-anything` skill has the right teaching principles, but its operating flow is too soft. In practice, the conversation can move from learner assessment into detailed explanation before a stable high-level map exists. That makes the skill feel reactive rather than staged, and it weakens the user's ability to build a clean mental model before entering branch-level detail.

The redesign should make the learning flow structurally harder to derail:

1. learner assessment must stay assessment-only
2. high-level mapping must happen before deep explanation
3. prerequisite repair must stay minimal and temporary
4. stable learning outcomes must be reorganized into a connected knowledge system

## Approved Direction

Use a hidden multi-role architecture with one public voice:

- one **main tutor** as the only outward-facing speaker
- one **orchestrator** that controls state transitions
- five **specialist roles** with narrow, enforced responsibilities
- one explicit **state machine** that gates which role is allowed to act
- one incremental **knowledge asset** flow that turns stable understanding into reusable topic documents

This design should feel like a single well-structured teacher to the user, not like a visible panel of agents. Role switching should be automatic. The user should be able to influence direction without manually selecting roles.

## Goals

1. Prevent the skill from slipping into detail before a topic map exists.
2. Preserve a single coherent teaching voice while using specialist reasoning internally.
3. Force every detailed explanation to attach to one chosen branch of the knowledge map.
4. Repair prerequisite gaps without letting side explanations become parallel courses.
5. Convert stable learning progress into a connected documentation bundle that remains useful outside the chat.
6. Generalize across arbitrary domains rather than depending on domain-specific templates.

## State Machine Summary

1. Learner Assessment
2. Domain Mapping
3. Branch Selection
4. Branch Explanation
5. Gap Repair
6. System Closure
7. Knowledge Asset Update

## Core Rule

> Before explaining any detailed concept, the skill must first produce and stabilize a high-level map of the topic and get the learner to select one branch to expand.

## Role Summary

- **Main Tutor** — the only outward-facing voice
- **Assessor** — gathers background, goal, depth, and analogy anchors
- **Mapper** — creates the high-level knowledge map
- **Explainer** — teaches one chosen branch in layers
- **Bridge Builder** — repairs the smallest prerequisite gap
- **Systematizer** — writes stable understanding into the knowledge asset bundle

## Knowledge Asset Shape

- `knowledge/<topic>/README.md`
- `knowledge/<topic>/chapters/`
- `knowledge/<topic>/concepts.md`
- `knowledge/<topic>/glossary.md`
- `knowledge/<topic>/open-questions.md`
