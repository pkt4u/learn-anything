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
  assert.match(readme, /copilot plugin marketplace add pkt4u\/learn-anything/);
  assert.match(readme, /copilot plugin install learn-anything@learn-anything/);
  assert.match(readme, /\/plugin marketplace add pkt4u\/learn-anything/);
  assert.match(readme, /\/plugin install learn-anything@learn-anything/);
  assert.match(readme, /\/add-plugin learn-anything/);
  assert.match(readme, /git clone .*~\/\.codex\/learn-anything/);
  assert.match(readme, /mkdir -p ~\/\.agents\/skills/);
  assert.match(readme, /ln -s ~\/\.codex\/learn-anything\/skills ~\/\.agents\/skills\/learn-anything/);
});
