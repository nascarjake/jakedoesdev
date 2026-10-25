import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseLedger, resolveProjectIdentity, verifiedProvenance } from "../scripts/project-identity.mjs";
import { planReconciliation } from "../scripts/reconcile-update-folders.mjs";

function fixture(t) {
  const base = mkdtempSync(path.join(os.tmpdir(), "folder-identity-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, "project"); mkdirSync(root);
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { stdio: "ignore" });
  git("init", "-b", "main");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "--allow-empty", "-m", "Fixture");
  return { base, root, git };
}
const ledger = (label, root, summary = "A reviewed improvement.") => `### 2026-10-25 · ${label}\n- visibility: abstract\n- publish: no\n- summary: ${summary}\n${root ? `- folder-root: ${root}\n` : ""}`;

test("one actual folder has one identity regardless of AI label", (t) => {
  const { root } = fixture(t);
  const first = parseLedger(ledger("Some AI label", root))[0];
  const second = parseLedger(ledger("Another label", root))[0];
  assert.equal(first.folder.id, second.folder.id);
  assert.notEqual(first.legacyId, second.legacyId);
  assert.equal(first.folder.name, "project");
});

test("nested directories, symlinks and worktrees resolve to the main repository", (t) => {
  const { base, root, git } = fixture(t);
  const nested = path.join(root, "src", "feature"); mkdirSync(nested, { recursive: true });
  const linked = path.join(base, "linked"); git("worktree", "add", "-b", "linked", linked);
  const alias = path.join(base, "symlink"); symlinkSync(root, alias);
  for (const cwd of [root, nested, linked, alias]) assert.equal(resolveProjectIdentity(cwd).id, resolveProjectIdentity(root).id);
  const distinct = path.join(root, "independent"); mkdirSync(distinct);
  execFileSync("git", ["-C", distinct, "init"], { stdio: "ignore" });
  assert.notEqual(resolveProjectIdentity(distinct).id, resolveProjectIdentity(root).id);
});

test("separate folders with the same basename are distinct; nonrepo nested cwd uses workspace child", (t) => {
  const { base, root } = fixture(t);
  const other = path.join(base, "other", "project"); mkdirSync(path.join(other, "nested"), { recursive: true });
  const options = { workspaceRoot: path.dirname(other) };
  assert.equal(resolveProjectIdentity(path.join(other, "nested"), options).root, realpathSync(other));
  assert.notEqual(resolveProjectIdentity(other, options).id, resolveProjectIdentity(root).id);
  assert.equal(resolveProjectIdentity(options.workspaceRoot, options), null);
  const collection = path.join(base, "collection");
  for (const name of ["one", "two"]) {
    mkdirSync(path.join(collection, name, "src"), { recursive: true });
    writeFileSync(path.join(collection, name, "package.json"), "{}");
  }
  assert.notEqual(resolveProjectIdentity(path.join(collection, "one", "src"), { workspaceRoot: base }).id,
    resolveProjectIdentity(path.join(collection, "two", "src"), { workspaceRoot: base }).id);
});

test("old logs, conflicting roots and forged folder IDs remain unresolved", (t) => {
  const { base, root } = fixture(t);
  assert.equal(parseLedger(ledger("Personal sounding label"))[0].folder, null);
  assert.equal(verifiedProvenance({ "folder-root": root, "folder-id": "forged" }), null);
  assert.equal(verifiedProvenance({ "folder-root": root, "thread-cwd": base }), null);
  assert.equal(parseLedger(ledger("Private", root).replace("abstract", "private")).length, 0);
});

test("the append helper stores provenance in the central ledger when called from another project", (t) => {
  const { base, root } = fixture(t);
  const helper = path.join(base, "studio", "scripts"); mkdirSync(helper, { recursive: true });
  for (const name of ["worklog.mjs", "project-identity.mjs"]) copyFileSync(new URL(`../scripts/${name}`, import.meta.url), path.join(helper, name));
  execFileSync(process.execPath, [path.join(helper, "worklog.mjs"), "append", "--project", "Arbitrary label", "--summary", "A private test outcome", "--visibility", "abstract", "--publish", "no"], { cwd: root, stdio: "ignore" });
  const weeks = path.join(base, "studio", ".worklog", "weeks");
  const recorded = parseLedger(readFileSync(path.join(weeks, readdirSync(weeks)[0]), "utf8"))[0];
  assert.equal(recorded.folder.id, resolveProjectIdentity(root).id);
  assert.equal(recorded.summary, "A private test outcome");
});

function snapshot(entries, excluded = [0, 1]) {
  return {
    projects: entries.map((entry, index) => ({ id: entry.legacyId, excluded: excluded[index] ?? 0 })),
    updates: [{ id: "old", source_keys_json: JSON.stringify(entries.map((entry) => entry.sourceKey)), entries_json: JSON.stringify(entries.map((entry) => ({ projectId: entry.legacyId, text: entry.summary }))) }],
  };
}

test("verified aliases merge, exclusion intent propagates, history remains byte-for-byte intact", (t) => {
  const { root } = fixture(t);
  const entries = [parseLedger(ledger("Label one", root))[0], parseLedger(ledger("Label two", root))[0]];
  const source = snapshot(entries); const before = JSON.stringify(source);
  const plan = planReconciliation(source, entries);
  assert.equal(plan.mappings.length, 2); assert.equal(plan.folders.length, 1);
  assert.equal(plan.folders[0].excluded, 1); assert.equal(plan.folders[0].policy_locked, 1);
  assert.equal(JSON.stringify(source), before);
  assert.ok(!JSON.stringify(plan).includes(root));
  assert.match(plan.rollbackSql, /DELETE FROM update_project_folder_aliases/);
});

test("an alias spanning folders or lacking even one historical source key fails closed", (t) => {
  const { base, root } = fixture(t);
  const distinct = path.join(base, "distinct"); mkdirSync(distinct); execFileSync("git", ["-C", distinct, "init"], { stdio: "ignore" });
  const a = parseLedger(ledger("Same label", root))[0], b = parseLedger(ledger("Same label", distinct, "Different change."))[0];
  const source = snapshot([a]); source.updates[0].entries_json = JSON.stringify([{ projectId: a.legacyId, text: a.summary }, { projectId: a.legacyId, text: b.summary }]);
  assert.equal(planReconciliation(source, [a, b]).mappings.length, 0);
  assert.equal(planReconciliation(source, [a]).mappings.length, 0);
  assert.equal(planReconciliation(snapshot([a]), [{ ...a, folder: { ...a.folder, id: "forged" } }]).mappings.length, 0);
});
