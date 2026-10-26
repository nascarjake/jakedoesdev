import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { projects } from '../app/data/portfolio.ts';
import { defaultLabFilters, filterLabProjects, getLabDiscovery, isLabRelease, labNeeds, labSkills, readLabFilters, writeLabFilters } from '../app/data/lab-discovery.ts';

const lab = projects.filter(project => project.mode === 'lab');
const find = (overrides) => filterLabProjects(lab, { ...defaultLabFilters, ...overrides }).map(project => project.id);

test('every current Lab tool has grounded use cases and valid need / skill classifications', () => {
  assert.ok(lab.length >= 5);
  for (const project of lab) {
    const info = getLabDiscovery(project);
    assert.ok(info.needs.length && info.skills.length, project.id);
    assert.equal(info.uses.length, 2);
    assert.ok(info.needs.every(id => labNeeds.some(need => need.id === id)));
    assert.ok(info.skills.every(id => labSkills.some(skill => skill.id === id)));
  }
});

test('needs overlap where a tool serves more than one task', () => {
  assert.deepEqual(find({ need: 'capture-explain' }), ['clip-my-screen', 'markdown-podcast-narrator']);
  assert.deepEqual(find({ need: 'audio-music' }), ['stream-dj', 'markdown-podcast-narrator', 'music-writer']);
  assert.deepEqual(find({ need: 'everyday-planning' }), ['jcal']);
});

test('capability, task search, and availability combine without promoting prototypes to releases', () => {
  assert.deepEqual(find({ skill: 'voice-generation' }), ['stream-dj', 'markdown-podcast-narrator']);
  assert.deepEqual(find({ skill: 'voice-generation', availability: 'release' }), ['stream-dj', 'markdown-podcast-narrator']);
  assert.deepEqual(find({ query: '  RESEARCH   notes  ' }), ['markdown-podcast-narrator', 'music-writer']);
  assert.deepEqual(find({ query: 'two-host research' }), ['markdown-podcast-narrator']);
  assert.deepEqual(find({ need: 'capture-explain', query: 'bug reproduction' }), ['clip-my-screen']);
  assert.deepEqual(find({ need: 'everyday-planning', skill: 'screen-replay' }), []);
  assert.equal(isLabRelease({ ...lab[0], status: 'Active prototype', dossier: { ...lab[0].dossier, source: { label: 'Code', url: 'https://example.com' } } }), false);
  assert.equal(isLabRelease({ ...lab[0], status: 'Unreleased prototype', dossier: { ...lab[0].dossier, source: { label: 'Code', url: 'https://example.com' } } }), false);
  assert.equal(isLabRelease({ ...lab[0], status: 'Open-source release', dossier: { ...lab[0].dossier, source: undefined } }), false);
});

test('new API tools remain discoverable before manual curation', () => {
  const unknown = { ...lab[0], id: 'new-tool', title: 'New tool', eyebrow: 'Organize a collection' };
  assert.deepEqual(filterLabProjects([unknown], defaultLabFilters), [unknown]);
  assert.deepEqual(filterLabProjects([unknown], { ...defaultLabFilters, query: 'organize' }), [unknown]);
  assert.deepEqual(getLabDiscovery(unknown).uses, unknown.highlights.slice(0, 2));
});

test('shareable filters round-trip and tolerate unknown values without losing unrelated query parameters', () => {
  const filters = { query: 'notes & research', need: 'audio-music', skill: 'voice-generation', availability: 'release' };
  const encoded = writeLabFilters('?ref=lab', filters);
  assert.deepEqual(readLabFilters(encoded), filters);
  assert.equal(new URLSearchParams(encoded).get('ref'), 'lab');
  assert.deepEqual(readLabFilters('?need=obsolete&skill=unknown&availability=nope'), defaultLabFilters);
  assert.equal(writeLabFilters(encoded, defaultLabFilters), '?ref=lab');
});

test('static export offers all tools, practical uses, and durable project links before hydration', () => {
  const html = readFileSync(new URL('../out/lab/index.html', import.meta.url), 'utf8');
  assert.match(html, /Small tools and open-ended experiments/);
  assert.match(html, /APP SCREENSHOT/);
  assert.match(html, /CONCEPT STUDY/);
  assert.doesNotMatch(html, /Start with a need|Find your next tool/);
  assert.match(html, /Search a task or tool/);
  for (const project of lab) {
    assert.ok(html.includes(`href="#${project.id}"`), project.id);
    assert.ok(html.includes(project.title), project.title);
  }
  assert.match(html, /https:\/\/jakedoesdev.com\/clip-my-screen\//);
  assert.match(html, /Prototypes \+ research/);
  assert.doesNotMatch(html, /Select a signal|THE EXPERIMENT INDEX/);
});
