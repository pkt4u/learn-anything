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
