import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verifyPublicSurface,requiredRoutes,requiredAssets,root} from '../scripts/verify-public-surface.mjs';
test('published routes and image assets remain in source and static output',()=>{assert.ok(verifyPublicSurface());assert.ok(verifyPublicSurface(root,true));});
test('deployment guard rejects loss of a formerly deployed route',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'public-surface-'));try{for(const route of requiredRoutes){const p=path.join(dir,'app',route,'page.tsx');fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,'');}for(const asset of requiredAssets){const p=path.join(dir,'public',asset);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(path.join(root,'public',asset),p);}fs.unlinkSync(path.join(dir,'app/stream-dj/page.tsx'));assert.throws(()=>verifyPublicSurface(dir),/stream-dj/);}finally{fs.rmSync(dir,{recursive:true,force:true});}});
test('Lab actions wrap with spacing and supplied covers are retained',()=>{const css=fs.readFileSync(path.join(root,'app/components/LabExperience.module.css'),'utf8');assert.match(css,/\.detailActions\s*\{[^}]*gap:12px/);for(const route of ['luminary','broadsheet'])assert.ok(requiredAssets.some(p=>p.includes(route)));});
