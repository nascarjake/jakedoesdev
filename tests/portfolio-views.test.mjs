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

test('Straight Desk uses six verified screenshots, excluding private calendar and call-list captures',async()=>{
 const {projectMedia}=await import('../app/data/project-media.ts');
 assert.equal(projectMedia['straight-desk'].shots.length,6);
 for(const shot of projectMedia['straight-desk'].shots){assert.ok(shot.src.startsWith('/projects/straight-desk/'));assert.ok(shot.caption.length>8);assert.ok(readFileSync('out'+shot.src).length>0);}
 const source=readFileSync('app/components/UniverseExperience.tsx','utf8');assert.match(source,/selected.id === "straight-desk" \? undefined : selected.media/);
});

// Next Link updates history without emitting native hashchange for same-page links.
test('all sidebar panel links use the shared native hash navigation handler',()=>{
 const source=readFileSync('app/components/WorkbenchShell.tsx','utf8');
 for(const panel of ['featured','directory','timeline']) assert.ok(source.includes(`navigatePanel(event, "${panel}")`));
 assert.ok(source.includes('navigatePanel(event, project.id)'));
 assert.ok(source.includes('event.preventDefault();\n      openWorkbenchPanel(panel);'));
});

test('Baylor milestone is prominent without changing the three featured products',()=>{
 const source=readFileSync('app/components/UniverseExperience.tsx','utf8');
 assert.match(source,/Baylor Medical Center/);assert.match(source,/Tumor Identifier · College internship/);
 assert.match(source,/openWorkbenchPanel\('tumor-identifier'\)/);
 assert.deepEqual(featuredProjectIds,['straight-desk','ignite-ai','luminary']);
 const css=readFileSync('app/components/PortfolioViews.module.css','utf8');assert.match(css,/\.baylorMilestone:focus-visible/);
});
