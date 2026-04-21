# Learn Anything Design

**Date:** 2026-04-21

## Problem

Build a standalone multi-platform skill plugin, inspired by the structure and installability of `superpowers`, that helps a user learn any new domain from shallow to deep. The plugin should adapt to the user's existing knowledge, identify and repair prerequisite gaps, converge toward a complete mental model rather than a pile of isolated facts, and continuously turn learning sessions into a shareable knowledge asset.

## Approved Direction

- Project directory: `learn-anything/`
- Plugin shape: standalone plugin, not part of `superpowers`
- Platform goal: GitHub Copilot CLI, Claude, Cursor, and Codex
- User-facing surface: one public skill
- Initial scope: understanding-first learning loop, not quiz-first or project-first learning
- Knowledge asset model: one documentation bundle per topic, updated incrementally over time
- Documentation audience: public-first, readable without prior chat context

## Goals

1. Let the user invoke one skill and enter a guided learning flow for any domain.
2. Start from the user's current background instead of assuming zero knowledge.
3. Build a domain knowledge map before diving into details.
4. Explain concepts progressively from intuition to mechanism to boundaries.
5. Detect knowledge gaps and repair the smallest missing prerequisite before returning to the main thread.
6. End with a coherent knowledge system: concepts, dependencies, confusion points, and next steps.
7. Persist stable learning outcomes into a structured topic documentation bundle instead of leaving them trapped in chat history.
8. Produce documentation that can be shared with other readers who did not participate in the original conversation.

## Non-Goals

1. A multi-skill methodology suite for v1.
2. Mandatory quizzes, drills, or project-based learning in v1.
3. Domain-specific content packs for individual subjects in v1.
4. Private diary-style notes optimized only for the original learner's chat context.

## Repository and Packaging Design

The repository should mirror the broad structure of `superpowers`, but as its own plugin:

- `README.md` for installation and usage
- `package.json` for package metadata
- `CLAUDE.md` and `GEMINI.md` for platform bootstrap instructions
- `.claude-plugin/` for Claude plugin metadata
- `.cursor-plugin/` for Cursor plugin metadata
- `.codex/` for Codex install instructions
- `skills/learn-anything/SKILL.md` for the public orchestration skill
- `skills/learn-anything/references/` for methodology, teaching heuristics, platform notes, and reusable response templates

The plugin should keep the user experience extremely simple while keeping the internal content split into focused reference files for maintainability.

## User-Facing Skill Design

The public skill should be named `learn-anything`.

Its job is not to answer a single question well. Its job is to guide the user through a domain-learning journey while maintaining a structured documentation bundle for the topic:

1. Assess current background and learning goal.
2. Extract adjacent knowledge that can be used as scaffolding.
3. Build a domain map with core concepts, prerequisites, and common confusion points.
4. Teach progressively from shallow to deep.
5. Detect and repair missing prerequisite knowledge.
6. Summarize the field as a connected knowledge system.
7. Persist the stable parts of that system into public-readable documents that can be extended later.

## Knowledge Asset Design

For each topic, the skill should maintain one documentation bundle rooted at:

`knowledge/<topic>/`

The bundle should contain:

- `README.md` — topic overview, learning path, scope, and current knowledge map
- `chapters/` — chapter documents that explain the topic from shallow to deep
- `concepts.md` — core concepts, definitions, dependencies, and common confusions
- `glossary.md` — quick reference for important terms
- `open-questions.md` — unresolved questions, incomplete explanations, and future study targets

This bundle is the long-lived artifact of the learning process. It should be incrementally updated as the learner continues studying the same topic rather than regenerated from scratch on every session.

## Learning Flow

### 1. Learner Assessment

The skill first identifies:

- what the user already knows
- why the user wants to learn the topic
- how deep they want to go
- what adjacent domains can be used for analogy and transfer

### 2. Domain Decomposition

The skill breaks the target domain into:

- core concepts
- prerequisite concepts
- key relationships
- common misconceptions
- a sensible learning order

It should present a high-level map before expanding any branch in depth.

### 3. Layered Explanation

Each topic should be explained in layers:

- intuitive layer
- conceptual layer
- mechanism layer
- boundary layer

The skill should prefer comparison, analogy, and mapping to prior knowledge over abstract definition dumping.

### 4. Gap Repair

When the user gets stuck or reveals missing context, the skill should:

1. identify the missing prerequisite
2. explain only the smallest necessary chunk
3. explain why that chunk matters for the main topic
4. return to the original learning thread

### 5. System Closure

At meaningful checkpoints, the skill should converge the conversation into a structured summary including:

- concept map
- dependency chain
- common confusions
- suggested next areas to study

### 6. Knowledge Asset Update

After a meaningful concept or topic branch becomes stable enough to preserve, the skill should:

1. update the topic `README.md` so the global map stays current
2. add or revise the appropriate chapter material in `chapters/`
3. update `concepts.md` and `glossary.md` when terminology or dependencies become clearer
4. record unresolved areas in `open-questions.md` instead of pretending they are complete

The skill should prefer revising existing structure over creating new files unless a genuinely new chapter boundary has emerged.

## Interaction Contract

Given a prompt like "help me learn Kubernetes" or "teach me options pricing," the skill should:

1. clarify the user's background and goal before teaching
2. choose an entry point appropriate to that background
3. keep each explanation tied to the global map
4. explicitly call out missing prerequisites when needed
5. allow the user to request a more intuitive, deeper, or more formal treatment at any point
6. continuously convert stable learning outcomes into the topic documentation bundle

Each substantial response should aim to include:

- the current concept
- how it connects to the user's existing knowledge
- where it sits in the knowledge map
- what prerequisite gap, if any, blocks understanding

When writing or updating topic documents, the skill should:

- avoid relying on prior chat-only references like "as discussed above"
- write for a reader who did not participate in the conversation
- organize the material for understanding rather than transcript fidelity
- preserve the shallow-to-deep learning path inside the documents
- fold repaired prerequisite knowledge back into the main structure so the same gap does not recur

## Guardrails

- If the requested topic is too broad, the skill should decompose it into subdomains before teaching.
- The skill must not assume the user understands jargon without evidence.
- If the domain contains multiple legitimate frameworks or disputed interpretations, the skill should say so explicitly.
- The skill should prioritize structural understanding over encyclopedic coverage.
- The skill should update existing topic documents before creating new chapter files.
- The skill must de-fragment the knowledge bundle over time instead of appending raw session logs.
- The skill should explicitly preserve unresolved but important questions in `open-questions.md`.

## Validation Plan

The first implementation should be evaluated against at least these scenarios:

1. complete beginner
2. user with adjacent background knowledge
3. topic request that is too broad
4. user with a clear goal but missing prerequisites
5. user with partial experience who wants a more systematic model

For each scenario, verify that the skill:

- correctly assesses background
- builds a sensible knowledge map
- detects and repairs missing prerequisites
- ends with a connected understanding of the domain
- produces a documentation bundle with a topic overview and chapter structure
- can update that bundle incrementally without duplicating or fragmenting content
- writes documents that remain understandable to a reader who never saw the original chat

At the packaging level, verify skill discovery and invocation in GitHub Copilot CLI plus at least one additional supported platform.
