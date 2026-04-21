---
name: learn-anything
description: Guide a user from prior knowledge to a connected understanding of any domain
---

# Learn Anything

Use this skill when a user wants to learn a new field, topic, or concept from shallow to deep.

## Core Rules

1. Start by assessing the learner's current background, goal, and desired depth.
2. Identify adjacent knowledge that can serve as scaffolding.
3. If the requested topic is too broad, decompose it into smaller subdomains before teaching.
4. Build and maintain a knowledge map before diving into deep detail.
5. Explain each major concept in four layers: intuition, concept, mechanism, and boundary.
6. When the learner reveals a gap, pause the main thread, repair the smallest missing prerequisite, then return to the main thread.
7. At meaningful checkpoints, summarize the concept map, dependencies, confusion points, and next study options.
8. Turn stable learning outcomes into a persistent `knowledge/<topic>/` documentation bundle for future study and sharing.
9. The skill must not assume the learner understands jargon without evidence.
10. If multiple legitimate frameworks or disputed interpretations exist, say so explicitly.
11. Allow the learner to ask for a more intuitive, deeper, or more formal explanation at any point.

## Learning Flow

### 1. Learner Assessment
- Ask what the learner already knows.
- Ask why they want to learn the topic.
- Ask how deep they want to go.
- Note adjacent domains that can support analogy and transfer.

### 2. Domain Decomposition
- Break the target topic into core concepts, prerequisites, relationships, and common misconceptions.
- Show a high-level map before expanding branches.

### 3. Layered Explanation
- Start with intuition.
- Move to the conceptual model.
- Show the mechanism.
- Clarify boundaries, edge cases, and common confusions.

### 4. Gap Repair
- Name the missing prerequisite.
- Teach the smallest missing chunk.
- Explain why the chunk matters.
- Resume the main learning thread.

### 5. System Closure
- Summarize the knowledge map.
- List dependency chains.
- Highlight common confusions.
- Recommend next study areas.

### 6. Knowledge Asset Update
- Maintain one bundle at `knowledge/<topic>/`.
- Update `README.md` with the current map and learning order.
- Add or revise chapter content in `chapters/`.
- Update `concepts.md` and `glossary.md` when definitions or dependencies become clearer.
- Record unresolved areas in `open-questions.md`.
- Revise existing files before creating new chapter files.

## Guardrails
- Keep the documents readable without prior chat context.
- Prefer revising existing bundle structure over appending raw session notes.

## Output Contract

Each substantial teaching response should include:

1. the current concept
2. how it connects to the learner's prior knowledge
3. where it fits in the knowledge map
4. what prerequisite gap, if any, blocks understanding
5. what part of the documentation bundle should be updated
6. suggested next step

## Reference Files

Use these files when you need more detail:
- `references/learning-flow.md`
- `references/bridge-patterns.md`
- `references/knowledge-assets.md`
- `references/output-contract.md`
- `references/copilot-tools.md`
- `references/codex-tools.md`
- `references/gemini-tools.md`
