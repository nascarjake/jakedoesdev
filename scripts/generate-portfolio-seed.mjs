import fs from "node:fs/promises";
import ts from "typescript";

async function importTypeScript(path) {
  const source = await fs.readFile(path, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

const sqlValue = (value) => value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;
const booleanValue = (value) => value ? "1" : "0";

const portfolio = await importTypeScript(new URL("../app/data/portfolio.ts", import.meta.url));
const mediaModule = await importTypeScript(new URL("../app/data/project-media.ts", import.meta.url));

const statements = [
  "-- Initial snapshot of the existing public portfolio. D1 becomes authoritative after import.",
];

for (const [sortOrder, project] of portfolio.projects.entries()) {
  const values = [
    project.id,
    sortOrder,
    project.title,
    project.eyebrow,
    project.summary,
    "",
    project.role,
    project.year,
    JSON.stringify(project.stack),
    project.signal,
    project.accent,
    project.category,
    project.status,
    JSON.stringify(project.highlights),
    project.dossier.scope,
    JSON.stringify(project.dossier.ownership),
    JSON.stringify(project.dossier.systems),
    project.dossier.note ?? null,
    project.dossier.source?.label ?? null,
    project.dossier.source?.url ?? null,
  ];
  statements.push(
    `INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES (${values.map(sqlValue).join(", ")}, ${booleanValue(true)}, ${booleanValue(sortOrder < 4)}, 1);`,
  );

  const media = mediaModule.projectMedia[project.id];
  if (!media) continue;
  let mediaOrder = 0;
  if (media.video) {
    statements.push(
      `INSERT INTO project_media (id, project_id, kind, url, caption, alt_text, sort_order, autoplay, preload) VALUES (${sqlValue(`${project.id}-video`)}, ${sqlValue(project.id)}, 'video', ${sqlValue(`https://www.youtube.com/watch?v=${media.video}`)}, 'Product walkthrough', '', ${mediaOrder++}, 1, 'metadata');`,
    );
  }
  for (const [index, shot] of media.shots.entries()) {
    statements.push(
      `INSERT INTO project_media (id, project_id, kind, url, caption, alt_text, sort_order, autoplay, preload) VALUES (${sqlValue(`${project.id}-image-${index + 1}`)}, ${sqlValue(project.id)}, 'image', ${sqlValue(shot.src)}, ${sqlValue(shot.caption)}, ${sqlValue(shot.caption)}, ${mediaOrder++}, 0, ${sqlValue(index === 0 ? "auto" : "metadata")});`,
    );
  }
}

await fs.writeFile(new URL("../drizzle/0001_seed_portfolio.sql", import.meta.url), `${statements.join("\n")}\n`);
console.log(`Generated ${portfolio.projects.length} project seeds.`);
