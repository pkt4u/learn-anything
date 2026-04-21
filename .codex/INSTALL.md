# Installing Learn Anything for Codex

Enable the `learn-anything` skill in Codex via native skill discovery.

## Installation

1. Clone the repository:

   ```bash
   # Replace <repository-URL> with the URL of the repository you intend to install (e.g. https://github.com/<your-username>/learn-anything.git)
   # If the repository is not published yet, clone from a local path instead, for example:
   #   git clone /path/to/learn-anything ~/.codex/learn-anything
   git clone <repository-URL> ~/.codex/learn-anything
   ```

2. Create the skills symlink:

   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/learn-anything/skills ~/.agents/skills/learn-anything
   ```

3. Restart Codex.

## Verify

```bash
ls -la ~/.agents/skills/learn-anything/
```
