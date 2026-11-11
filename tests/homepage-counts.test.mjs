import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const source = readFileSync(new URL('../app/components/LandingExperience.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/components/LandingExperience.module.css', import.meta.url), 'utf8');
test('homepage counts come from the published catalogue and include Luminary in the lab', () => {
  assert.match(source, /fetch\("\/api\/projects"/);
  assert.match(source, /p\.published !== false/);
  assert.match(source, /p\.mode === "lab" \|\| p\.id === "luminary"/);
  assert.match(source, /controller\.abort/);
});
test('homepage stays navigable without hiding document overflow', () => {
  assert.match(source, /Skip to content/);
  assert.match(source, /ContactButton/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /\.page\{[^}]*overflow:hidden/);
});
