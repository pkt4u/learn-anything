# Learn Anything Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone `learn-anything` plugin with one public skill that guides adaptive domain learning and continuously turns each topic into a shareable documentation bundle across GitHub Copilot CLI, Claude, Cursor, and Codex.

**Architecture:** Mirror the installable plugin shape of `superpowers`, but keep the surface area intentionally small: one public skill at `skills/learn-anything/SKILL.md` backed by focused reference files for learning flow, gap repair, knowledge-asset updates, output contract, and platform adaptation notes. Use Node's built-in test runner with zero third-party dependencies so the repository can validate plugin discovery metadata, required skill content, the knowledge-bundle contract, and installation docs from day one.

**Tech Stack:** Markdown skill files, JSON plugin metadata, Node.js built-in test runner, Bash install instructions

---

## File Structure

- `package.json` — repository metadata and the zero-dependency `node --test` script
- `README.md` — install and usage guide for Copilot CLI, Claude, Cursor, and Codex
- `CLAUDE.md` — Claude bootstrap entrypoint for the plugin
- `GEMINI.md` — Gemini bootstrap entrypoint for the plugin
- `.claude-plugin/plugin.json` — Claude plugin metadata that points at `./skills/`
- `.cursor-plugin/plugin.json` — Cursor plugin metadata that points at `./skills/`
- `.codex/INSTALL.md` — Codex-specific native skill discovery instructions
- `skills/learn-anything/SKILL.md` — the single public skill
- `skills/learn-anything/references/learning-flow.md` — the five learning phases and when to switch between them
- `skills/learn-anything/references/bridge-patterns.md` — how to connect new ideas to prior knowledge and repair gaps
- `skills/learn-anything/references/knowledge-assets.md` — the required `knowledge/<topic>/` bundle layout and update rules
- `skills/learn-anything/references/output-contract.md` — expected response shape and summary format
- `skills/learn-anything/references/copilot-tools.md` — Copilot CLI adaptation notes for skill authors
- `skills/learn-anything/references/codex-tools.md` — Codex adaptation notes for skill authors
- `skills/learn-anything/references/gemini-tools.md` — Gemini adaptation notes for skill authors
- `tests/plugin-layout.test.mjs` — validates repository skeleton and manifest wiring
- `tests/skill-behavior.test.mjs` — validates required learning workflow sections and references
- `tests/readme.test.mjs` — validates platform install docs and quick-start coverage

## Chunk 1: Plugin skeleton and validation baseline

### Task 1: Add repository skeleton and platform manifests

**Files:**
- Create: `package.json`
- Create: `CLAUDE.md`
- Create: `GEMINI.md`
- Create: `.claude-plugin/plugin.json`
- Create: `.cursor-plugin/plugin.json`
- Create: `.codex/INSTALL.md`
- Test: `tests/plugin-layout.test.mjs`

- [ ] **Step 1: Write the failing repository layout test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'package.json',
  'CLAUDE.md',
  'GEMINI.md',
  '.claude-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
  '.codex/INSTALL.md',
];

test('repository layout exposes the plugin on supported platforms', () => {
  for (const file of requiredFiles) {
    assert.ok(existsSync(new URL(file, root)), `${file} should exist`);
  }

  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  assert.equal(pkg.name, 'learn-anything');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.scripts.test, 'node --test');

  const claudeBootstrap = readFileSync(new URL('CLAUDE.md', root), 'utf8');
  assert.match(claudeBootstrap, /@\.\/skills\/learn-anything\/SKILL\.md/);

  const geminiBootstrap = readFileSync(new URL('GEMINI.md', root), 'utf8');
  assert.match(geminiBootstrap, /@\.\/skills\/learn-anything\/SKILL\.md/);
  assert.match(
    geminiBootstrap,
    /@\.\/skills\/learn-anything\/references\/gemini-tools\.md/,
  );

  const claude = JSON.parse(
    readFileSync(new URL('.claude-plugin/plugin.json', root), 'utf8'),
  );
  assert.equal(claude.name, 'learn-anything');
  assert.equal(claude.skills, './skills/');

  const cursor = JSON.parse(
    readFileSync(new URL('.cursor-plugin/plugin.json', root), 'utf8'),
  );
  assert.equal(cursor.name, 'learn-anything');
  assert.equal(cursor.skills, './skills/');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/wcd/code/superlearn/learn-anything && node --test tests/plugin-layout.test.mjs`
Expected: FAIL with missing-file assertions such as `package.json should exist`

- [ ] **Step 3: Write the minimal repository metadata and manifest files**

`package.json`

```json
{
  "name": "learn-anything",
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test"
  }
}
```

`CLAUDE.md`

```md
@./skills/learn-anything/SKILL.md
```

`GEMINI.md`

```md
@./skills/learn-anything/SKILL.md
@./skills/learn-anything/references/gemini-tools.md
```

`.claude-plugin/plugin.json`

```json
{
  "name": "learn-anything",
  "displayName": "Learn Anything",
  "description": "A skill plugin for adaptive domain learning from prior knowledge to complete knowledge maps",
  "version": "0.1.0",
  "author": {
    "name": "wcd"
  },
  "skills": "./skills/"
}
```

`.cursor-plugin/plugin.json`

```json
{
  "name": "learn-anything",
  "displayName": "Learn Anything",
  "description": "A skill plugin for adaptive domain learning from prior knowledge to complete knowledge maps",
  "version": "0.1.0",
  "author": {
    "name": "wcd"
  },
  "skills": "./skills/"
}
```

`.codex/INSTALL.md`

```md
# Installing Learn Anything for Codex

Enable the `learn-anything` skill in Codex via native skill discovery.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wcd/learn-anything.git ~/.codex/learn-anything
   ```

2. Create the skills symlink:

   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/learn-anything/skills ~/.agents/skills/learn-anything
   ```

3. Restart Codex.

## Verify

```bash
ls -la ~/.agents/skills/learn-anything
```
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/wcd/code/superlearn/learn-anything && node --test tests/plugin-layout.test.mjs`
Expected: PASS with `ok 1 - repository layout exposes the plugin on supported platforms`

- [ ] **Step 5: Commit**

```bash
cd /Users/wcd/code/superlearn/learn-anything
git add package.json CLAUDE.md GEMINI.md .claude-plugin/plugin.json .cursor-plugin/plugin.json .codex/INSTALL.md tests/plugin-layout.test.mjs
git commit -m "feat: add plugin skeleton and platform manifests

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Chunk 2: Skill content and user-facing docs

### Task 2: Implement the learn-anything skill and its reference files

**Files:**
- Create: `skills/learn-anything/SKILL.md`
- Create: `skills/learn-anything/references/learning-flow.md`
- Create: `skills/learn-anything/references/bridge-patterns.md`
- Create: `skills/learn-anything/references/knowledge-assets.md`
- Create: `skills/learn-anything/references/output-contract.md`
- Create: `skills/learn-anything/references/copilot-tools.md`
- Create: `skills/learn-anything/references/codex-tools.md`
- Create: `skills/learn-anything/references/gemini-tools.md`
- Test: `tests/skill-behavior.test.mjs`

- [ ] **Step 1: Write the failing skill behavior test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const referenceFiles = [
  'learning-flow.md',
  'bridge-patterns.md',
  'knowledge-assets.md',
  'output-contract.md',
  'copilot-tools.md',
  'codex-tools.md',
  'gemini-tools.md',
];

test('learn-anything skill encodes the approved learning workflow', () => {
  const skillPath = new URL('skills/learn-anything/SKILL.md', root);
  assert.ok(existsSync(skillPath), 'skills/learn-anything/SKILL.md should exist');

  const skill = readFileSync(skillPath, 'utf8');
  assert.match(skill, /^---\nname: learn-anything\n/m);
  assert.match(skill, /Learner Assessment/);
  assert.match(skill, /Domain Decomposition/);
  assert.match(skill, /Layered Explanation/);
  assert.match(skill, /Gap Repair/);
  assert.match(skill, /System Closure/);
  assert.match(skill, /Knowledge Asset Update/);
  assert.match(skill, /If the requested topic is too broad/i);
  assert.match(skill, /must not assume the learner understands jargon/i);
  assert.match(skill, /multiple legitimate frameworks|disputed interpretations/i);
  assert.match(skill, /knowledge\/<topic>\//i);
  assert.match(skill, /README\.md/);
  assert.match(skill, /open-questions\.md/);

  for (const file of referenceFiles) {
    assert.ok(
      existsSync(new URL(`skills/learn-anything/references/${file}`, root)),
      `${file} should exist`,
    );
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/wcd/code/superlearn/learn-anything && node --test tests/skill-behavior.test.mjs`
Expected: FAIL with `skills/learn-anything/SKILL.md should exist`

- [ ] **Step 3: Write the minimal skill and reference files**

`skills/learn-anything/SKILL.md`

```md
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
- Do not assume the learner understands jargon without evidence.
- If multiple legitimate frameworks or disputed interpretations exist, say so explicitly.
- Keep the documents readable without prior chat context.
- Prefer revising existing bundle structure over appending raw session notes.

## Output Contract

Each substantial response should include:
- the current concept
- how it connects to the learner's prior knowledge
- where it fits in the knowledge map
- what prerequisite gap, if any, blocks understanding
- what part of the documentation bundle should be updated

## Reference Files

Use these files when you need more detail:
- `references/learning-flow.md`
- `references/bridge-patterns.md`
- `references/knowledge-assets.md`
- `references/output-contract.md`
- `references/copilot-tools.md`
- `references/codex-tools.md`
- `references/gemini-tools.md`
```

`skills/learn-anything/references/learning-flow.md`

```md
# Learning Flow

1. Learner Assessment
2. Domain Decomposition
3. Layered Explanation
4. Gap Repair
5. System Closure

Switch phases using these rules:

- Stay in Learner Assessment until you know current knowledge, learning goal, and desired depth.
- Move to Domain Decomposition once you can outline the core concepts and prerequisites.
- Move to Layered Explanation only after the learner has seen the map.
- Switch to Gap Repair when a missing prerequisite blocks progress.
- Return to Layered Explanation after repairing the missing prerequisite.
- Move to System Closure when a branch of the topic has become coherent enough to summarize.
```

`skills/learn-anything/references/bridge-patterns.md`

```md
# Bridge Patterns

- Map new concepts to domains the learner already knows.
- Prefer structural analogies over vague metaphors.
- When a learner is blocked, identify the missing prerequisite instead of repeating the same explanation.
- Repair the smallest missing unit, then return to the main topic.
```

`skills/learn-anything/references/knowledge-assets.md`

```md
# Knowledge Assets

Maintain one documentation bundle per topic:

- `knowledge/<topic>/README.md`
- `knowledge/<topic>/chapters/`
- `knowledge/<topic>/concepts.md`
- `knowledge/<topic>/glossary.md`
- `knowledge/<topic>/open-questions.md`

Update rules:

- Revise existing structure before creating new chapter files.
- Write for a reader who never saw the original chat.
- Preserve a shallow-to-deep path inside the documents.
- Fold repaired prerequisite knowledge back into the main bundle.
- Record unresolved but important questions in `open-questions.md`.
```

`skills/learn-anything/references/output-contract.md`

```md
# Output Contract

Each substantial teaching response should state:

1. Current concept
2. Connection to prior knowledge
3. Position in the knowledge map
4. Missing prerequisite, if any
5. Knowledge-bundle update target
6. Suggested next step
```

`skills/learn-anything/references/copilot-tools.md`

```md
# Copilot CLI Tool Notes

Use the Copilot CLI skill invocation flow supported by the harness before taking action.
When a structured user decision is needed, use the harness's question/choice tool instead of plain-text questions.
```

`skills/learn-anything/references/codex-tools.md`

```md
# Codex Tool Notes

Use Codex-native skill discovery and the skill invocation flow supported by the harness.
Prefer repository-local file inspection before making assumptions about the learner's context.
```

`skills/learn-anything/references/gemini-tools.md`

```md
# Gemini Tool Notes

Adapt the skill's instructions to Gemini's tool naming while preserving the same learning flow.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/wcd/code/superlearn/learn-anything && node --test tests/skill-behavior.test.mjs`
Expected: PASS with `ok 1 - learn-anything skill encodes the approved learning workflow`

- [ ] **Step 5: Commit**

```bash
cd /Users/wcd/code/superlearn/learn-anything
git add skills/learn-anything/SKILL.md skills/learn-anything/references tests/skill-behavior.test.mjs
git commit -m "feat: add learn-anything skill content

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Document installation and usage, then run the full suite

**Files:**
- Create: `README.md`
- Test: `tests/readme.test.mjs`
- Test: `tests/plugin-layout.test.mjs`
- Test: `tests/skill-behavior.test.mjs`

- [ ] **Step 1: Write the failing README coverage test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('README documents installation and quick usage for all supported platforms', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

  for (const heading of [
    '## Installation',
    '### GitHub Copilot CLI',
    '### Claude',
    '### Cursor',
    '### Codex',
    '## Usage',
  ]) {
    assert.match(readme, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(readme, /learn-anything/i);
  assert.match(readme, /knowledge map/i);
  assert.match(readme, /knowledge\/<topic>\//i);
  assert.match(readme, /shareable/i);
  assert.match(readme, /copilot plugin marketplace add wcd\/learn-anything/i);
  assert.match(readme, /copilot plugin install learn-anything@learn-anything/i);
  assert.match(readme, /\/plugin marketplace add wcd\/learn-anything/i);
  assert.match(readme, /\/plugin install learn-anything@learn-anything/i);
  assert.match(readme, /\/add-plugin learn-anything/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/wcd/code/superlearn/learn-anything && node --test tests/readme.test.mjs`
Expected: FAIL with an ENOENT error for `README.md`

- [ ] **Step 3: Write the minimal README**

~~~md
# Learn Anything

Learn Anything is a standalone skill plugin for adaptive domain learning. It helps a user move from prior knowledge to a connected understanding of a new field.

For each topic, the skill is designed to keep a shareable documentation bundle under `knowledge/<topic>/` so the learning result becomes a reusable asset instead of disappearing into chat history.

## Installation

### GitHub Copilot CLI

    copilot plugin marketplace add wcd/learn-anything
    copilot plugin install learn-anything@learn-anything

Restart Copilot CLI so the `learn-anything` skill is discovered.

### Claude

    /plugin marketplace add wcd/learn-anything
    /plugin install learn-anything@learn-anything

Restart Claude Code after installation.

### Cursor

    /add-plugin learn-anything

Or search for **Learn Anything** in Cursor's plugin marketplace and install it there.

### Codex

    git clone <repository-URL> ~/.codex/learn-anything
    mkdir -p ~/.agents/skills
    ln -s ~/.codex/learn-anything/skills ~/.agents/skills/learn-anything

Restart Codex after creating the symlink.

## Usage

Ask the assistant to use the `learn-anything` skill when you want to learn a topic from shallow to deep.

The skill should keep the topic's knowledge bundle updated as it teaches:

- `knowledge/<topic>/README.md`
- `knowledge/<topic>/chapters/`
- `knowledge/<topic>/concepts.md`
- `knowledge/<topic>/glossary.md`
- `knowledge/<topic>/open-questions.md`

Example prompts:

- "Use learn-anything to teach me Kubernetes from my backend engineering background."
- "Use learn-anything to help me build a knowledge map for options pricing."
- "Use learn-anything to explain transformers by connecting them to concepts I already know from search and databases."

The skill should assess your background, build a knowledge map, explain concepts in layers, repair prerequisite gaps, and keep a shareable knowledge bundle organized from shallow to deep.
~~~

- [ ] **Step 4: Run the full suite**

Run: `cd /Users/wcd/code/superlearn/learn-anything && npm test`
Expected: PASS with all three test files reported as passing

- [ ] **Step 5: Commit**

```bash
cd /Users/wcd/code/superlearn/learn-anything
git add README.md tests/readme.test.mjs
git commit -m "docs: add learn-anything installation and usage guide

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
