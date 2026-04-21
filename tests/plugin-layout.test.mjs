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
