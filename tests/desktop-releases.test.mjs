import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {podcastRelease,streamDjRelease} from '../app/data/desktop-releases.ts';
import {projects} from '../app/data/portfolio.ts';
import {isLabRelease} from '../app/data/lab-discovery.ts';
for(const app of [podcastRelease,streamDjRelease]) test(`${app.name} offers real platform files, setup, and privacy-safe screenshots`,()=>{
 assert.equal(app.files.length,3);
 assert.deepEqual(app.files.map(file=>file.filename.match(/(mac-arm64|mac-x64|win-x64)\.zip$/)?.[1]),['mac-arm64','mac-x64','win-x64']);
 for(const file of app.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes>100000000);assert.ok(file.filename.includes(app.version));}
 const project=projects.find(project=>project.id===app.id);assert.ok(isLabRelease(project));assert.equal(project.dossier.source.url,`https://jakedoesdev.com/${app.slug}/`);
 const html=fs.readFileSync(new URL(`../out/${app.slug}/index.html`,import.meta.url),'utf8');
 for(const file of app.files)assert.ok(html.includes(`/api/media/projects/releases/${app.slug}/${app.version}/${file.filename}`));
 assert.ok(html.includes('unsigned and not notarized'));assert.ok(html.includes('FIRST SESSION'));assert.ok(html.includes('Skip to content'));
 for(const image of app.screenshots)assert.ok(fs.existsSync(new URL(`../out/projects/${app.slug}/${image.name}.webp`,import.meta.url)));
});
