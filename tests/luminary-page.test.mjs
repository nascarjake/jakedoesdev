import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { projects } from '../app/data/portfolio.ts';
import { isLabProject, getLabDiscovery, filterLabProjects, defaultLabFilters } from '../app/data/lab-discovery.ts';
const luminary = projects.find(p => p.id === 'luminary');
test('Luminary retains one portfolio identity and is also discoverable in the Lab', () => {
  assert.equal(projects.filter(p => p.id === 'luminary').length, 1);
  assert.notEqual(luminary.mode, 'lab');
  assert.equal(isLabProject(luminary), true);
  assert.ok(getLabDiscovery(luminary).needs.includes('ai-workflows'));
  assert.deepEqual(filterLabProjects(projects.filter(isLabProject), {...defaultLabFilters, need:'ai-workflows'}).map(p=>p.id), ['luminary']);
});
test('Luminary landing exports original video, GitHub setup and cross-section links', () => {
  const html=readFileSync(new URL('../out/luminary/index.html',import.meta.url),'utf8');
  for(const content of ['youtube-nocookie.com/embed/LyOMJq47ASQ','https://github.com/nascarjake/luminary','/universe/#luminary','/lab/#luminary','OpenAI Assistants API']) assert.ok(html.includes(content), content);
  assert.ok(!html.includes('autoplay=1'));
});
