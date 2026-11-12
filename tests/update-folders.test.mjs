import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import ts from "typescript";

function moduleUrl(filename, replace = (value) => value) {
  const source = replace(readFileSync(new URL(filename, import.meta.url), "utf8"));
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const folderUrl = moduleUrl("../worker/update-folders.ts");
const { validateExclusionChanges } = await import(folderUrl);
const { handleAdminUpdates, handlePublicUpdates } = await import(moduleUrl("../worker/updates-api.ts", (source) => source.replace('"./update-folders"', JSON.stringify(folderUrl))));
const first = `folder-${"a".repeat(64)}`, second = `folder-${"b".repeat(64)}`;

function fixture(t) {
  const db = new DatabaseSync(":memory:"); t.after(() => db.close());
  for (const filename of ["0003_update_review_queue.sql", "0004_update_projects_and_sync.sql", "0009_update_folder_identity.sql"]) db.exec(readFileSync(new URL(`../drizzle/${filename}`, import.meta.url), "utf8"));
  db.prepare("INSERT INTO update_folders (id,name,excluded,policy_locked) VALUES (?, 'private-folder-name', 0, 0),(?, 'another-private-name', 1, 0)").run(first, second);
  db.exec("INSERT INTO update_projects (id,name,excluded) VALUES ('old-label','AI label',0),('unresolved','Personal sounding label',0),('old-alias','Another label',1)");
  db.prepare("INSERT INTO update_project_folder_aliases VALUES ('old-label',?),('old-alias',?)").run(first, first);
  const original = JSON.stringify([{ projectId: "old-label", text: "Reviewed improvement." }, { projectId: "old-alias", text: "Second change." }, { projectId: "unresolved", text: "Must not escape." }]);
  db.prepare("INSERT INTO updates (id,title,date,summary,entries_json,source_keys_json,bullets_json,published,created_by) VALUES ('old-note','Reviewed notes','2026-10-25','Reviewed summary',?,'[\"raw-key\"]','[\"raw bullet\"]',1,'fixture')").run(original);
  let fail = false;
  const env = { DB: { prepare(sql) {
    let values = [];
    const statement = {
      bind(...args) { values = args; return statement; },
      async all() { return { results: db.prepare(sql).all(...values) }; },
      async first() { return db.prepare(sql).get(...values) ?? null; },
      async run() { if (fail) { fail = false; throw new Error("Injected storage failure"); } return { meta: { changes: Number(db.prepare(sql).run(...values).changes) } }; },
    };
    return statement;
  } } };
  return { db, env, original, failNext: () => { fail = true; }, state: () => db.prepare("SELECT id,excluded,version FROM update_folders ORDER BY id").all().map((row) => ({ ...row })) };
}
function request(changes) { return new Request("https://example.invalid/api/admin/updates/projects", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) }); }
const save = (env, changes) => handleAdminUpdates(request(changes), env, { email: "fixture@example.invalid" });

test("batch validator rejects ambiguous booleans, duplicate IDs, missing versions and unknown fields", () => {
  const valid = { id: first, excluded: false, version: 1 };
  assert.deepEqual(validateExclusionChanges([valid]), [valid]);
  for (const invalid of [[], [valid, valid], [{ ...valid, excluded: "false" }], [{ id: first, excluded: false }], [{ ...valid, name: "rename" }]]) assert.equal(validateExclusionChanges(invalid), null);
});

test("one batch saves all changes and returns new versions", async (t) => {
  const { env, state } = fixture(t);
  const response = await save(env, [{ id: first, excluded: true, version: 1 }, { id: second, excluded: false, version: 1 }]);
  assert.equal(response.status, 200);
  assert.deepEqual(state(), [{ id: first, excluded: 1, version: 2 }, { id: second, excluded: 0, version: 2 }]);
});

test("a stale row, unknown folder or protected inclusion prevents the whole batch", async (t) => {
  const { db, env, state } = fixture(t); const before = state();
  for (const bad of [{ id: second, excluded: false, version: 99 }, { id: `folder-${"c".repeat(64)}`, excluded: false, version: 1 }]) {
    assert.equal((await save(env, [{ id: first, excluded: true, version: 1 }, bad])).status, 409);
    assert.deepEqual(state(), before);
  }
  db.prepare("UPDATE update_folders SET policy_locked=1 WHERE id=?").run(second);
  assert.equal((await save(env, [{ id: first, excluded: true, version: 1 }, { id: second, excluded: false, version: 1 }])).status, 409);
  assert.deepEqual(state(), before);
});

test("concurrent batches cannot silently overwrite each other", async (t) => {
  const { env, state } = fixture(t);
  const results = await Promise.all([save(env, [{ id: first, excluded: true, version: 1 }, { id: second, excluded: false, version: 1 }]), save(env, [{ id: first, excluded: false, version: 1 }, { id: second, excluded: true, version: 1 }])]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.deepEqual(state().map((row) => row.version), [2, 2]);
});

test("storage failure changes nothing and the identical pending batch can be retried", async (t) => {
  const { env, state, failNext } = fixture(t); const before = state();
  const pending = [{ id: first, excluded: true, version: 1 }, { id: second, excluded: false, version: 1 }];
  failNext(); assert.equal((await save(env, pending)).status, 500); assert.deepEqual(state(), before);
  assert.equal((await save(env, pending)).status, 200);
});

test("public notes group verified aliases, withhold unknown history and never expose folder names or paths", async (t) => {
  const { db, env, original } = fixture(t);
  const response = await handlePublicUpdates(new Request("https://example.invalid/api/updates"), env);
  const payload = await response.json();
  assert.deepEqual(payload.updates[0].projects, [{ id: first, name: "Project updates", bullets: ["Reviewed improvement.", "Second change."] }]);
  assert.ok(!JSON.stringify(payload).includes("private-folder-name"));
  assert.ok(!JSON.stringify(payload).includes("Must not escape"));
  assert.equal(db.prepare("SELECT entries_json FROM updates").get().entries_json, original);
  db.prepare("UPDATE updates SET entries_json=?").run(JSON.stringify([{ projectId: first, text: "Changed /Users/private/local/project" }]));
  assert.deepEqual((await (await handlePublicUpdates(new Request("https://example.invalid/api/updates"), env)).json()).updates, []);
});

test("folder exclusion and policy locks apply to every alias, including old approved notes", async (t) => {
  const { env, db, original } = fixture(t);
  await save(env, [{ id: first, excluded: true, version: 1 }]);
  assert.deepEqual((await (await handlePublicUpdates(new Request("https://example.invalid/api/updates"), env)).json()).updates, []);
  assert.equal(db.prepare("SELECT entries_json FROM updates").get().entries_json, original);
  assert.equal(db.prepare("SELECT bullets_json FROM updates").get().bullets_json, '["raw bullet"]');
  assert.equal(db.prepare("SELECT source_keys_json FROM updates").get().source_keys_json, '["raw-key"]');
});

test("legacy rename/write endpoints are disabled and unresolved projects cannot be approved", async (t) => {
  const { env } = fixture(t);
  const legacy = new Request("https://example.invalid/api/admin/updates/projects/old-label", { method: "PUT", body: JSON.stringify({ name: "Personal", excluded: false }) });
  assert.equal((await handleAdminUpdates(legacy, env, {})).status, 405);
  const publish = new Request("https://example.invalid/api/admin/updates/old-note", { method: "PUT", body: JSON.stringify({ title: "Reviewed", summary: "Reviewed", date: "2026-10-25", entries: [{ projectId: "unresolved", text: "Unknown change" }], published: true }) });
  assert.equal((await handleAdminUpdates(publish, env, {})).status, 400);
});

test("unchanged historical approvals preserve existing labels, entry visibility and exclusions", async (t) => {
  const { db, env, original } = fixture(t);
  db.exec("INSERT INTO update_legacy_public_snapshots SELECT id,title,date,summary,entries_json FROM updates WHERE published=1");
  const load = async () => (await (await handlePublicUpdates(new Request("https://example.invalid/api/updates"), env)).json()).updates;
  const updates = await load();
  assert.deepEqual(updates[0].projects, [
    { id: "old-label", name: "AI label", bullets: ["Reviewed improvement."] },
    { id: "unresolved", name: "Personal sounding label", bullets: ["Must not escape."] },
  ]);
  assert.equal(db.prepare("SELECT entries_json FROM updates").get().entries_json, original);
  // Future edits cannot inherit that earlier approval boundary.
  db.exec("UPDATE updates SET summary='Changed after the historical approval'");
  const changed = await load();
  assert.ok(!JSON.stringify(changed).includes("Must not escape"));
  // Existing explicit exclusions are always honored even for the snapshot.
  db.exec("UPDATE updates SET summary='Reviewed summary'; UPDATE update_projects SET excluded=1 WHERE id='unresolved'");
  assert.ok(!JSON.stringify(await load()).includes("Must not escape"));
});

test("the additive migration captures existing approvals without changing raw history or exclusions", (t) => {
  const db = new DatabaseSync(":memory:"); t.after(() => db.close());
  for (const filename of ["0003_update_review_queue.sql", "0004_update_projects_and_sync.sql"]) db.exec(readFileSync(new URL(`../drizzle/${filename}`, import.meta.url), "utf8"));
  db.exec("INSERT INTO update_projects (id,name,excluded) VALUES ('old-included','Reviewed label',0),('old-excluded','Excluded label',1)");
  db.exec("INSERT INTO updates (id,title,date,summary,entries_json,published,created_by) VALUES ('historical','Reviewed','2026-10-01','Reviewed','[{\"projectId\":\"old-included\",\"text\":\"Reviewed change\"}]',1,'fixture'),('draft','Draft','2026-10-01','Unreviewed','[]',0,'fixture')");
  const before = JSON.stringify(db.prepare("SELECT * FROM updates ORDER BY id").all());
  const exclusions = JSON.stringify(db.prepare("SELECT * FROM update_projects ORDER BY id").all());
  db.exec(readFileSync(new URL("../drizzle/0009_update_folder_identity.sql", import.meta.url), "utf8"));
  assert.equal(JSON.stringify(db.prepare("SELECT * FROM updates ORDER BY id").all()), before);
  assert.equal(JSON.stringify(db.prepare("SELECT * FROM update_projects ORDER BY id").all()), exclusions);
  assert.deepEqual(db.prepare("SELECT update_id FROM update_legacy_public_snapshots").all().map((row) => row.update_id), ["historical"]);
});
