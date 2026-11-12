import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projects} from '../app/data/portfolio.ts';
import {timelineGroups} from '../app/data/portfolio-views.ts';
// List of Production Products, owner-supplied résumé (November 2026).
const resumeYears = {
  "ezforms": 2015,
  "ziprad": 2014,
  "eternus-tools": 2016,
  "tumor-identifier": 2011,
  "jumpstart": 2013,
  "traxo": 2013,
  "callsmart": 2014,
  "dm-auto-leasing": 2013,
  "foodtronix-mobile-pos": 2012,
  "trails-end": 2017,
  "stream-elixir": 2018,
  "daho": 2014,
  "rack-ruin": 2026,
  "tug": 2015,
  "hubster": 2013,
  "luminary": 2025,
  "tradelab": 2021,
  "ignite-dialogue": 2023,
  "ignite-ai": 2024,
  "straight-desk": 2026
};
test('every production product has the exact résumé product year',()=>{
 for(const [id,year] of Object.entries(resumeYears)) {
  const project=projects.find(p=>p.id===id);assert.ok(project,id);
  assert.equal(project.year,String(year),id);
 }
});
test('all twenty production products are placed once in the matching timeline year',()=>{
 const portfolio=projects.filter(p=>Object.hasOwn(resumeYears,p.id));
 const groups=timelineGroups(portfolio);
 assert.equal(groups.flatMap(g=>g.projects).length,20);
 for(const group of groups) for(const p of group.projects) assert.equal(group.year,resumeYears[p.id]);
});
test('D1 date migration matches the local dates and is scoped to résumé products',()=>{
 const sql=readFileSync('drizzle/0015_resume_product_years.sql','utf8');
 assert.equal((sql.match(/UPDATE projects/g)||[]).length,20);
 for(const [id,year] of Object.entries(resumeYears)) assert.ok(sql.includes(`WHERE id='${id}' AND year <> '${year}'`));
});
