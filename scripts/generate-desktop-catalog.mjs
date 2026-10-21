import fs from 'node:fs/promises';
import ts from 'typescript';
async function importTs(file) {
 const source = await fs.readFile(new URL(file, import.meta.url), 'utf8');
 const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const {projects} = await importTs('../app/data/portfolio.ts');
const {projectMedia} = await importTs('../app/data/project-media.ts');
const q = x => x == null ? 'NULL' : `'${String(x).replaceAll("'", "''")}'`;
const statements = ['-- Only the two desktop release records, guarded against overwriting editor changes.'];
for (const id of ['markdown-podcast-narrator', 'stream-dj']) {
 const p=projects.find(p=>p.id===id);
 const columns={title:p.title,eyebrow:p.eyebrow,summary:p.summary,status:p.status,highlights_json:JSON.stringify(p.highlights),scope:p.dossier.scope,ownership_json:JSON.stringify(p.dossier.ownership),systems_json:JSON.stringify(p.dossier.systems),note:p.dossier.note,source_label:p.dossier.source.label,source_url:p.dossier.source.url};
 statements.push(`UPDATE projects SET ${Object.entries(columns).map(([k,v])=>`${k}=${q(v)}`).join(', ')}, version=version+1, updated_at=CURRENT_TIMESTAMP WHERE id=${q(id)} AND version=1 AND archived_at IS NULL;`);
 for(const [index,shot] of projectMedia[id].shots.entries()) statements.push(`INSERT INTO project_media (id,project_id,kind,url,caption,alt_text,mime_type,sort_order,autoplay,preload) SELECT ${q(`${id}-desktop-${index}`)},${q(id)},'image',${q(shot.src)},${q(shot.caption)},${q(shot.caption)},'image/webp',${index},0,${q(index?'metadata':'auto')} WHERE EXISTS (SELECT 1 FROM projects WHERE id=${q(id)} AND source_url=${q(p.dossier.source.url)}) ON CONFLICT(id) DO UPDATE SET url=excluded.url,caption=excluded.caption,alt_text=excluded.alt_text;`);
}
await fs.writeFile(new URL('../drizzle/0010_desktop_releases.sql',import.meta.url),statements.join('\n\n')+'\n');
