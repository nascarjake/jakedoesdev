import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveProjectIdentity } from "./project-identity.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

// A legacy alias can resolve only when every historical occurrence has an
// exact source-key link to a locally verified folder. Text equality alone is
// never provenance. No raw updates or ledger history are rewritten.
export function planReconciliation(snapshot, evidence, { workspaceRoot = path.dirname(ROOT) } = {}) {
  evidence = evidence.map((entry) => {
    const folder = resolveProjectIdentity(entry.folder?.root, { workspaceRoot });
    return { ...entry, folder: folder?.id === entry.folder?.id ? folder : null };
  });
  const mappings = [], unresolved = [], folders = new Map();
  for (const project of snapshot.projects) {
    const candidates = evidence.filter((entry) => entry.legacyId === project.id);
    const occurrences = snapshot.updates.flatMap((update) => {
      const keys = new Set(JSON.parse(update.source_keys_json || "[]"));
      return JSON.parse(update.entries_json || "[]").filter((entry) => entry.projectId === project.id).map((entry) => ({ ...entry, keys }));
    });
    const ids = new Set(candidates.map((entry) => entry.folder?.id));
    const covered = !snapshot.metadataOnly && occurrences.length > 0 && occurrences.every((item) => candidates.some((entry) => entry.folder && typeof entry.summary === "string" && entry.summary.length > 0 && /^[a-f0-9]{64}$/.test(entry.sourceKey) && item.keys.has(entry.sourceKey) && entry.summary === item.text));
    if (!covered || ids.size !== 1 || ids.has(undefined)) {
      unresolved.push({ aliasId: project.id, records: occurrences.length, reason: "Missing or conflicting verified folder provenance" });
      continue;
    }
    const folder = candidates[0].folder;
    const previous = (snapshot.aliases || []).find((alias) => alias.alias_id === project.id);
    if (previous && previous.folder_id !== folder.id) throw new Error("Existing alias conflicts with verified provenance; no plan was produced.");
    const stored = (snapshot.folders || []).find((item) => item.id === folder.id);
    const current = folders.get(folder.id) || { id: folder.id, name: folder.name, excluded: stored?.excluded ?? 1, policy_locked: stored?.policy_locked ?? 1 };
    if (!previous && project.excluded) current.excluded = 1;
    folders.set(folder.id, current);
    if (!previous) mappings.push({ aliasId: project.id, folderId: folder.id, records: occurrences.length });
  }
  const forward = [], rollback = [];
  for (const folder of folders.values()) {
    const stored = (snapshot.folders || []).find((item) => item.id === folder.id);
    if (stored) {
      if (folder.excluded !== stored.excluded) {
        forward.push(`UPDATE update_folders SET excluded=1,version=version+1 WHERE id=${quote(folder.id)} AND version=${Number(stored.version)};`);
        rollback.unshift(`UPDATE update_folders SET excluded=${Number(stored.excluded)},version=version+1 WHERE id=${quote(folder.id)} AND version=${Number(stored.version) + 1};`);
      }
    } else {
      forward.push(`INSERT INTO update_folders (id,name,excluded,policy_locked) VALUES (${quote(folder.id)},${quote(folder.name)},1,1);`);
      rollback.push(`DELETE FROM update_folders WHERE id=${quote(folder.id)} AND version=1 AND NOT EXISTS (SELECT 1 FROM update_project_folder_aliases WHERE folder_id=${quote(folder.id)});`);
    }
  }
  for (const mapping of mappings) {
    forward.push(`INSERT INTO update_project_folder_aliases (alias_id,folder_id) VALUES (${quote(mapping.aliasId)},${quote(mapping.folderId)});`);
    rollback.unshift(`DELETE FROM update_project_folder_aliases WHERE alias_id=${quote(mapping.aliasId)} AND folder_id=${quote(mapping.folderId)};`);
  }
  return { mappings, folders: [...folders.values()], unresolved, forwardSql: forward.join("\n"), rollbackSql: rollback.join("\n") };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [snapshotPath, evidencePath] = process.argv.slice(2);
    if (!snapshotPath || !evidencePath || process.argv.length !== 4) throw new Error("Usage: reconcile-update-folders.mjs <private-snapshot.json> <verified-local-evidence.json>. Plans only; no remote writes.");
    const directory = path.join(ROOT, ".worklog", "reconciliation", new Date().toISOString().replace(/[:.]/g, "-"));
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    // Back up the readable original input before creating the mapping.
    copyFileSync(snapshotPath, path.join(directory, "snapshot.json"));
    const plan = planReconciliation(JSON.parse(readFileSync(snapshotPath, "utf8")), JSON.parse(readFileSync(evidencePath, "utf8")));
    writeFileSync(path.join(directory, "plan.json"), JSON.stringify(plan, null, 2), { mode: 0o600 });
    console.log(`Private plan: ${plan.mappings.length} verified aliases; ${plan.unresolved.length} unresolved aliases. No remote changes applied.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
