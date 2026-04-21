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
