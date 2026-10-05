import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { synchronizeApprovedUpdates } from "../scripts/sync-approved-updates.mjs";

const approved = {
  updates: [{
    id: "week-2026-w40",
    title: "Field notes · 2026-W40",
    date: "2026-09-29",
    summary: "A reviewed weekly development note.",
    bullets: ["Built a safe static publishing path."],
  }],
};

function response(payload = approved) {
  return async () => new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } });
}

test("approved updates become published static Markdown without private fields", async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "jakedoesdev-updates-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const result = await synchronizeApprovedUpdates({ outputDirectory: directory, fetchImpl: response() });
  assert.deepEqual(result, { created: ["week-2026-w40"], updated: [], unchanged: [], removed: [] });
  const source = readFileSync(path.join(directory, "week-2026-w40.md"), "utf8");
  assert.match(source, /published: true/);
  assert.match(source, /source: "admin-review"/);
  assert.doesNotMatch(source, /source_keys|created_by|createdBy/);
  assert.deepEqual(JSON.parse(readFileSync(path.join(directory, "index.json"), "utf8")), approved.updates);
});

test("a sync never overwrites a manually managed public post", async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "jakedoesdev-updates-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(directory, { recursive: true });
  const destination = path.join(directory, "week-2026-w40.md");
  writeFileSync(destination, "---\npublished: true\n---\n\nHand-written post.\n");
  await assert.rejects(
    synchronizeApprovedUpdates({ outputDirectory: directory, fetchImpl: response() }),
    /Refusing to replace the manually managed public post/,
  );
  assert.match(readFileSync(destination, "utf8"), /Hand-written post/);
});

test("unpublishing removes only the sync-managed static post", async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "jakedoesdev-updates-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  await synchronizeApprovedUpdates({ outputDirectory: directory, fetchImpl: response() });
  const result = await synchronizeApprovedUpdates({ outputDirectory: directory, fetchImpl: response({ updates: [] }) });
  assert.deepEqual(result, { created: [], updated: [], unchanged: [], removed: ["week-2026-w40"] });
  assert.equal(existsSync(path.join(directory, "week-2026-w40.md")), false);
  assert.deepEqual(JSON.parse(readFileSync(path.join(directory, "index.json"), "utf8")), []);
});

test("the public index includes only published Markdown posts", async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "jakedoesdev-updates-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(path.join(directory, "manual.md"), "---\ntitle: Manual note\ndate: 2026-09-30\nsummary: Reviewed text\npublished: true\n---\n\n- Public bullet\n");
  writeFileSync(path.join(directory, "draft.md"), "---\ntitle: Private draft\ndate: 2026-09-30\npublished: false\n---\n\n- Private bullet\n");
  await synchronizeApprovedUpdates({ outputDirectory: directory, fetchImpl: response({ updates: [] }) });
  assert.deepEqual(JSON.parse(readFileSync(path.join(directory, "index.json"), "utf8")), [{
    id: "manual", title: "Manual note", date: "2026-09-30", summary: "Reviewed text", bullets: ["Public bullet"],
  }]);
});
