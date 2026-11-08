import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {featuredProjectIds,startYear,timelineGroups} from '../app/data/portfolio-views.ts';
import {projects} from '../app/data/portfolio.ts';
test('featured set matches requested products in requested order',()=>assert.deepEqual(featuredProjectIds,['straight-desk','ignite-ai','luminary']));
test('timeline uses only recorded dates and keeps undated products out of year groups',()=>{
 assert.equal(startYear('2015—2017'),2015);assert.equal(startYear('Current'),null);assert.equal(startYear('Mobile archive'),null);
 const groups=timelineGroups(projects);assert.ok(groups.every((g,i)=>!i||groups[i-1].year>g.year));
 assert.equal(groups.flatMap(g=>g.projects).length,projects.filter(p=>startYear(p.year)!==null).length);
});
test('default portfolio exposes featured products and timeline without prompt leakage',()=>{
 const html=readFileSync('out/universe/index.html','utf8');
 assert.match(html,/Featured products/);for(const title of ['Straight Desk','Ignite Spark AI','Luminary'])assert.ok(html.includes(title));
 assert.match(html,/Product &amp; career timeline/);assert.doesNotMatch(html,/A few decades of following|VIDEO FIRST/);
 assert.ok(html.indexOf('Goose Games Arcade')>html.indexOf('production-directory'));
});
test('media reel has human-facing label',()=>assert.doesNotMatch(readFileSync('app/components/ProjectMedia.tsx','utf8'),/VIDEO FIRST/));
