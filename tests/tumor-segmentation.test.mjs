import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('tumor wording describes function without inventing historical algorithm',()=>{
 const src=readFileSync('app/data/portfolio.ts','utf8');
 const block=src.slice(src.indexOf('id: "tumor-identifier"'),src.indexOf('id: "ziprad"'));
 assert.match(block,/AI-assisted medical image segmentation/);
 assert.match(block,/Baylor Medical Center in 2011/);
 assert.doesNotMatch(block,/TensorFlow|U-Net|random forest|fuzzy c-means/i);
 assert.match(block,/synthetic geometry/);
});
test('targeted update touches only tumor identifier',()=>{
 const sql=readFileSync('drizzle/0018_tumor_segmentation_wording.sql','utf8');
 assert.equal((sql.match(/UPDATE projects/g)||[]).length,1);
 assert.match(sql,/WHERE id='tumor-identifier'/);
 assert.doesNotMatch(sql,/DELETE|INSERT|TensorFlow/i);
});
