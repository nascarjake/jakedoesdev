import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { projects, projectStories } from '../app/data/portfolio.ts';
import { projectMedia } from '../app/data/project-media.ts';
test('verified stories populate personal project dossiers and preserve tumor ownership', () => {
 assert.equal(Object.keys(projectStories).length,10);
 assert.equal(projectStories['tumor-identifier'],undefined);
 for(const [id,html] of Object.entries(projectStories)) {
  assert.ok(html.length > 600,id);
  assert.doesNotMatch(html,/<script|onerror=|javascript:/i);
  const project=projects.find(p=>p.id===id); if(project) assert.equal(project.storyHtml,html);
 }
});
test('Rack and Ruin reuses arcade images and timestamped walkthrough',()=>{
 const media=projectMedia['rack-ruin']; assert.equal(media.shots.length,3);
 for(const shot of media.shots) assert.ok(existsSync(new URL('../public'+shot.src,import.meta.url)));
 assert.match(media.video,/t=1971/);
 const component=readFileSync(new URL('../app/components/ProjectMedia.tsx',import.meta.url),'utf8');
 assert.match(component,/start=\$\{youtubeStart\(asset.url\)\}/);
});
test('live migration preserves existing editorial stories and laboratory displays them',()=>{
 const sql=readFileSync(new URL('../drizzle/0017_verified_product_stories.sql',import.meta.url),'utf8');
 assert.equal((sql.match(/AND COALESCE\(story_html,''\)=''/g)||[]).length,10);
 assert.ok(!sql.includes("id='tumor-identifier'"));
 assert.match(readFileSync(new URL('../app/components/LabExperience.tsx',import.meta.url),'utf8'),/active.storyHtml/);
});
