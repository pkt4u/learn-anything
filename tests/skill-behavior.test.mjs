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

test('learning-flow.md includes Phase 6 Knowledge Asset Update with a switching rule', () => {
  const flowPath = new URL('skills/learn-anything/references/learning-flow.md', root);
  const flow = readFileSync(flowPath, 'utf8');
  assert.match(flow, /Knowledge Asset Update/, 'learning-flow.md must list Knowledge Asset Update');
  assert.match(flow, /Move to Knowledge Asset Update/, 'switching rules must reference Knowledge Asset Update');
});

test('SKILL.md Output Contract includes Suggested next step', () => {
  const skillPath = new URL('skills/learn-anything/SKILL.md', root);
  const skill = readFileSync(skillPath, 'utf8');
  const contractMatch = skill.match(/## Output Contract[\s\S]*?(?=\n##|$)/);
  assert.ok(contractMatch, 'SKILL.md must have an Output Contract section');
  assert.match(contractMatch[0], /[Ss]uggested next step/i, 'Output Contract section must include suggested next step');
});
