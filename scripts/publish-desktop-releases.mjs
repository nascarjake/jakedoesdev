import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { verifyCloudflareAccount, ROOT, PROFILE } from './verify-cloudflare-account.mjs';
import { podcastRelease, streamDjRelease } from '../app/data/desktop-releases.ts';
const artifacts = path.resolve(process.argv[2] || '../native-final');
await verifyCloudflareAccount();
const apps=[podcastRelease,streamDjRelease].filter(app=>!process.argv[3] || app.slug===process.argv[3]);
if(!apps.length)throw new Error('Unexpected app');
for (const app of apps) {
 if (app.files.length !== 3) throw new Error(`${app.name} needs three verified native artifacts.`);
 const directory = path.join(artifacts, app.slug);
 const scan = JSON.parse(readFileSync(path.join(directory, 'package-scan.json'), 'utf8'));
 if (!scan.passed || scan.files.length !== app.files.length) throw new Error('A clean package scan is required.');
 for (const file of app.files) {
  if (!/^[A-Za-z0-9.-]+\.zip$/.test(file.filename)) throw new Error('Unexpected filename');
  const data = readFileSync(path.join(directory,file.filename));
  if(data.length !== file.bytes || createHash('sha256').update(data).digest('hex') !== file.sha256) throw new Error(`Hash/size mismatch: ${file.filename}`);
  const check=scan.files.find(x=>x.filename===file.filename);
  if(!check || check.sha256 !== file.sha256 || !check.validation?.passed || !check.validation?.packaged) throw new Error('Native validation does not match artifact');
 }
 writeFileSync(path.join(directory,'SHA256SUMS.txt'),app.files.map(f=>`${f.sha256}  ${f.filename}`).join('\n')+'\n');
 for(const filename of [...app.files.map(f=>f.filename),'SHA256SUMS.txt']) {
  const url=`https://jakedoesdev.com/api/media/projects/releases/${app.slug}/${app.version}/${filename}`;
  const existing=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(30000)});
  if(existing.ok){
   const response=await fetch(url,{signal:AbortSignal.timeout(300000)});const hash=createHash('sha256');
   if(!response.ok)throw new Error('Could not verify existing object');
   for await(const chunk of response.body)hash.update(chunk);
   const expected=createHash('sha256').update(readFileSync(path.join(directory,filename))).digest('hex');
   if(hash.digest('hex')!==expected)throw new Error('Refusing to overwrite a different versioned artifact: '+url);
   console.log('Already uploaded and verified: '+filename);continue;
  }
  if(existing.status!==404)throw new Error('Could not check existing object: '+existing.status);
  console.log(`Uploading ${app.slug}/${app.version}/${filename}`);
  execFileSync(path.join(ROOT,'node_modules/.bin/wrangler'),['r2','object','put',`jakedoesdev-project-media/projects/releases/${app.slug}/${app.version}/${filename}`,'--file',path.join(directory,filename),'--remote','--profile',PROFILE,'--content-type',filename.endsWith('.zip')?'application/zip':'text/plain; charset=utf-8','--content-disposition',`attachment; filename="${filename}"`,'--cache-control','public, max-age=31536000, immutable'],{cwd:ROOT,stdio:'inherit',env:{...process.env,WRANGLER_LOG_PATH:path.join(ROOT,'.wrangler/wrangler.log')}});
 }
}
