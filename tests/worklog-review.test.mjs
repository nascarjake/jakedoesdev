import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { syncWeek } from "../scripts/sync-worklog-review.mjs";

const folder = { id: `folder-${"a".repeat(64)}`, name: "fixture" };
function fixture(t, published = false) {
  const db = new DatabaseSync(":memory:"); t.after(() => db.close());
  for (const filename of ["0003_update_review_queue.sql", "0004_update_projects_and_sync.sql", "0009_update_folder_identity.sql"]) db.exec(readFileSync(new URL(`../drizzle/${filename}`, import.meta.url), "utf8"));
  db.prepare("INSERT INTO updates (id,title,date,summary,entries_json,bullets_json,source_keys_json,published,created_by) VALUES ('week-2026-w40','Reviewed','2026-10-01','Reviewed','[]','[\"original legacy bullet\"]','[\"original-key\"]',?,'fixture')").run(published ? 1 : 0);
  const query = async (sql, params = []) => {
    if (sql.startsWith("SELECT")) return db.prepare(sql).all(...params);
    const result = db.prepare(sql).run(...params);
    if (sql.startsWith("UPDATE") && !result.changes) throw new Error("Concurrent review edit; no overwrite.");
    return [];
  };
  return { db, query, stored: () => ({ ...db.prepare("SELECT * FROM updates").get() }) };
}

test("old bullets and source keys survive; only provenanced additions enter the private draft", async (t) => {
  const { query, stored, db } = fixture(t);
  await syncWeek("2026-W40", [{ folder, summary: "Verified addition", sourceKey: "new-key" }, { folder: null, summary: "Unknown addition", sourceKey: "unknown-key" }], { query });
  const result = stored();
  assert.deepEqual(JSON.parse(result.bullets_json), ["original legacy bullet", "Verified addition"]);
  assert.deepEqual(JSON.parse(result.entries_json), [{ projectId: folder.id, text: "Verified addition" }]);
  assert.deepEqual(JSON.parse(result.source_keys_json), ["original-key", "new-key"]);
  assert.equal(result.published, 0);
  assert.equal(db.prepare("SELECT excluded,policy_locked FROM update_folders").get().policy_locked, 1);
  assert.equal(db.prepare("SELECT count(*) AS count FROM update_projects").get().count, 0);
  const before = stored();
  await syncWeek("2026-W40", [{ folder, summary: "Verified addition", sourceKey: "new-key" }], { query });
  assert.deepEqual(stored(), before);
});

test("approved legacy history is not reconstructed or republished by sync", async (t) => {
  const { query, stored } = fixture(t, true); const before = stored();
  await syncWeek("2026-W40", [{ folder, summary: "New addition", sourceKey: "new" }], { query });
  assert.deepEqual(stored(), before);
});

test("corrupt old history fails without replacing it", async (t) => {
  const { query, stored, db } = fixture(t);
  db.exec("UPDATE updates SET source_keys_json='corrupt'"); const before = stored();
  await assert.rejects(syncWeek("2026-W40", [{ folder, summary: "New addition", sourceKey: "new" }], { query }), /invalid/);
  assert.deepEqual(stored(), before);
});

test("a concurrent draft edit wins without losing either source history or approval", async (t) => {
  const { query, stored, db } = fixture(t);
  const concurrent = JSON.stringify([{ projectId: "legacy", text: "Human edit" }]);
  const race = async (sql, params) => {
    if (sql.startsWith("UPDATE")) db.prepare("UPDATE updates SET entries_json=?,published=1").run(concurrent);
    return query(sql, params);
  };
  await assert.rejects(syncWeek("2026-W40", [{ folder, summary: "New addition", sourceKey: "new" }], { query: race }), /Concurrent/);
  assert.equal(stored().entries_json, concurrent);
  assert.equal(stored().published, 1);
  assert.equal(stored().source_keys_json, '["original-key"]');
});
