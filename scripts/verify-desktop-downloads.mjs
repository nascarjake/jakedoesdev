import { createHash } from 'node:crypto';
import { podcastRelease, streamDjRelease } from '../app/data/desktop-releases.ts';
const origin=process.env.DOWNLOAD_ORIGIN || 'https://jakedoesdev.com';
const results=[];
for(const app of [podcastRelease,streamDjRelease]) for(const file of app.files) {
 const url=`${origin}/api/media/projects/releases/${app.slug}/${app.version}/${file.filename}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(300000)});
 if(!response.ok || !response.headers.get('content-type')?.startsWith('application/zip') || !response.headers.get('content-disposition')?.includes(file.filename)) throw new Error(`Invalid download headers: ${url} ${response.status}`);
 const hash=createHash('sha256');let bytes=0;for await (const chunk of response.body){bytes+=chunk.length;hash.update(chunk);}
 const sha256=hash.digest('hex');
 if(bytes!==file.bytes || sha256!==file.sha256)throw new Error(`Download integrity mismatch: ${url}`);
 const range=await fetch(url,{headers:{range:'bytes=0-3'},signal:AbortSignal.timeout(30000)});
 const magic=Buffer.from(await range.arrayBuffer());
 if(range.status!==206 || magic.toString('hex')!=='504b0304')throw new Error(`Invalid ZIP or range support: ${url}`);
 const result={url,bytes,sha256,contentType:response.headers.get('content-type'),contentDisposition:response.headers.get('content-disposition'),rangeStatus:range.status,passed:true};results.push(result);console.log(JSON.stringify(result));
}
if(results.length!==6)throw new Error('Expected six downloads');
