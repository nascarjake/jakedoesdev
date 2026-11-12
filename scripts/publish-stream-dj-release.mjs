// Publish already validated Stream DJ GitHub release assets to the existing
// public download mirror. Never deploy the website or change account access.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT, PROFILE, verifyCloudflareAccount } from './verify-cloudflare-account.mjs';
const [version, directoryArg, mode = 'prepare'] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version || '') || !directoryArg || !['prepare','upload'].includes(mode)) throw Error('Usage: publish-stream-dj-release.mjs VERSION ARTIFACT_DIRECTORY [prepare|upload]');
const directory = path.resolve(directoryArg), repo = 'nascarjake/stream-dj';
// Keep GitHub keyring lookup on its existing home when Wrangler uses a different config root.
const run = args => execFileSync('gh', args, {encoding:'utf8', env: {...process.env, HOME: process.env.GH_AUTH_HOME || process.env.HOME}});
const release = JSON.parse(run(['api', `repos/${repo}/releases/tags/v${version}`]));
if (release.draft || release.tag_name !== `v${version}`) throw Error('Only an existing published release can be mirrored.');
const expected = ['mac-arm64','mac-x64','win-x64'].map(platform => `Stream-DJ-${version}-${platform}.zip`);
const sums = readFileSync(path.join(directory, 'SHA256SUMS.txt'), 'utf8');
const files = expected.map(filename => {
  const asset = release.assets.find(item => item.name === filename);
  if (!asset || !existsSync(path.join(directory, filename))) throw Error(`Missing release asset ${filename}`);
  const bytes = readFileSync(path.join(directory, filename));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== asset.size || asset.digest !== `sha256:${sha256}` || !sums.split('\n').some(line => line.trim().split(/\s+/).join(' ') === `${sha256} ${filename}`)) throw Error(`Release integrity mismatch: ${filename}`);
  return {filename, sha256, bytes:bytes.length};
});
// Do not prepare a stale source tree that would remove restored product routes.
execFileSync('git', ['merge-base','--is-ancestor','origin/main','HEAD'], {cwd:ROOT});
for (const file of ['app/stream-dj/page.tsx','app/markdown-podcast-studio/page.tsx','public/projects/stream-dj/studio.webp','public/projects/stream-dj/programming.webp','public/projects/markdown-podcast-studio/studio.webp','worker/desktop-assets.ts']) if (!existsSync(path.join(ROOT,file))) throw Error(`Release route/asset guard failed: ${file}`);
const manifest = {version, prerelease:release.prerelease, files};
writeFileSync(path.join(directory,'latest.json'), JSON.stringify(manifest)+'\n');
const dataPath = path.join(ROOT,'app/data/desktop-releases.ts');
let source = readFileSync(dataPath,'utf8');
const start = source.indexOf('export const streamDjRelease:');
if(start<0)throw Error('Stream DJ release record missing');
let record=source.slice(start);
record=record.replace(/version: "[^"]+"/, `version: "${version}"`);
const labels = ['Mac · Apple Silicon','Mac · Intel','Windows · 64-bit'];
const details = ['M1 or newer · macOS 12+','Intel processor · macOS 12+','Windows 10/11 · Intel or AMD x64'];
record=record.replace(/files: \[[\s\S]*?\n\],/, 'files: '+JSON.stringify(files.map((file,i)=>({label:labels[i],detail:details[i],...file})),null,2)+',');
writeFileSync(dataPath,source.slice(0,start)+record);
console.log(JSON.stringify(manifest,null,2));
if(mode==='upload'){
  await verifyCloudflareAccount({checkZone:true});
  const currentResponse = await fetch('https://jakedoesdev.com/api/media/projects/releases/stream-dj/latest.json', {cache:'no-store', signal:AbortSignal.timeout(30000)});
  if(currentResponse.ok){
    const current = await currentResponse.json();
    if(!/^\d+\.\d+\.\d+$/.test(current.version || '')) throw Error('Existing latest manifest is malformed');
    const a=current.version.split('.').map(Number),b=version.split('.').map(Number);
    const differing=a.findIndex((value,i)=>value!==b[i]);
    if(differing>=0 && a[differing]>b[differing]) throw Error('Refusing to downgrade public latest release');
  } else if(currentResponse.status!==404) throw Error(`Latest manifest check blocked: HTTP ${currentResponse.status}`);
  const put = (filename,key,cache) => execFileSync(path.join(ROOT,'node_modules/.bin/wrangler'),['r2','object','put',`jakedoesdev-project-media/${key}`,'--file',path.join(directory,filename),'--remote','--profile',PROFILE,'--content-type',filename.endsWith('.zip')?'application/zip':filename.endsWith('.json')?'application/json':'text/plain','--cache-control',cache],{cwd:ROOT,stdio:'inherit'});
  for(const filename of [...expected,'SHA256SUMS.txt']){
    const key=`projects/releases/stream-dj/${version}/${filename}`,url=`https://jakedoesdev.com/api/media/${key}`;
    const response=await fetch(url,{signal:AbortSignal.timeout(300000)});
    if(response.ok){
      const hash=createHash('sha256');for await(const part of response.body)hash.update(part);
      const local=createHash('sha256').update(readFileSync(path.join(directory,filename))).digest('hex');
      if(hash.digest('hex')!==local)throw Error(`Refusing to replace different immutable asset: ${filename}`);
    } else if(response.status===404) put(filename,key,'public, max-age=31536000, immutable');
    else throw Error(`Mirror check blocked: HTTP ${response.status}`);
  }
  // Switch discovery only after all platform files and checksums exist.
  for(const file of files){const response=await fetch(`https://jakedoesdev.com/api/media/projects/releases/stream-dj/${version}/${file.filename}`,{signal:AbortSignal.timeout(300000)});if(!response.ok)throw Error(`Cannot verify ${file.filename}`);const hash=createHash('sha256');for await(const part of response.body)hash.update(part);if(hash.digest('hex')!==file.sha256)throw Error(`Mirror hash mismatch ${file.filename}`);}
  put('latest.json','projects/releases/stream-dj/latest.json','no-cache, max-age=0');
}
