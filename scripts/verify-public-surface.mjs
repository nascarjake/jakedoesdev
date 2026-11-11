import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const requiredRoutes = ['','universe','lab','resume','updates','arcade','clip-my-screen','luminary','stream-dj','markdown-podcast-studio'];
export const requiredAssets = ['projects/stream-dj/studio.webp','projects/stream-dj/programming.webp','projects/markdown-podcast-studio/studio.webp','projects/luminary/luminary-overview.webp','projects/broadsheet/broadsheet-preview.webp'];
export function verifyPublicSurface(base=root, exported=false) {
 const missing=[];
 for(const route of requiredRoutes){const p=exported?path.join(base,'out',route,'index.html'):path.join(base,'app',route,'page.tsx');if(!fs.existsSync(p))missing.push(p);}
 for(const asset of requiredAssets){const p=path.join(base,exported?'out':'public',asset);if(!fs.existsSync(p))missing.push(p);else {const b=fs.readFileSync(p);if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')missing.push(`${p} (not WebP)`);}}
 if(missing.length)throw new Error(`Public routes/assets would be lost. Restore them before publishing:\n${missing.join('\n')}`);
 return true;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){verifyPublicSurface(root,process.argv.includes('--export'));console.log('Public route and media preservation checks passed.');}
