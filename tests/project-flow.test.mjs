import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('project detail has independent content columns, retaining every section', () => {
 const source = readFileSync('app/components/UniverseExperience.tsx','utf8');
 const primary = source.slice(source.indexOf('<div className="project-primary-column">'),source.indexOf('<div className="project-secondary-column">'));
 for (const section of ['detail-heading','project-feature','project-story-copy']) assert.ok(primary.includes(section));
 const secondary=source.slice(source.indexOf('<div className="project-secondary-column">'),source.indexOf('<footer className="project-detail-footer">'));
 for (const section of ['project-facts','project-dossier']) assert.ok(secondary.includes(section));
 const css=readFileSync('app/globals.css','utf8');
 assert.ok(css.includes('.project-primary-column { grid-column: 1; }'));
 assert.ok(css.includes('.project-secondary-column { grid-column: 2; }'));
});
