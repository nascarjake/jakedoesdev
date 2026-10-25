export type UpdateProject = {
  id: string; name: string; excluded: number; canonicalId: string | null;
  identityStatus: "verified" | "unresolved"; locked: number; version: number;
};

export async function updateProjects(env: Env): Promise<UpdateProject[]> {
  const folders = (await env.DB.prepare(`SELECT id,name,excluded,id AS canonicalId,
    'verified' AS identityStatus,policy_locked AS locked,version FROM update_folders
    ORDER BY name COLLATE NOCASE,id`).all<UpdateProject>()).results;
  const legacy = (await env.DB.prepare(`SELECT p.id,COALESCE(f.name,p.name) AS name,
    CASE WHEN f.id IS NULL THEN 1 ELSE f.excluded END AS excluded,
    f.id AS canonicalId,CASE WHEN f.id IS NULL THEN 'unresolved' ELSE 'verified' END AS identityStatus,
    COALESCE(f.policy_locked,1) AS locked,COALESCE(f.version,0) AS version
    FROM update_projects p LEFT JOIN update_project_folder_aliases a ON a.alias_id=p.id
    LEFT JOIN update_folders f ON f.id=a.folder_id ORDER BY name COLLATE NOCASE,p.id`).all<UpdateProject>()).results;
  return [...folders, ...legacy];
}

export function projectDto(row: UpdateProject) {
  return { ...row, excluded: row.excluded === 1, locked: row.locked === 1 };
}

export type ExclusionChange = { id: string; excluded: boolean; version: number };
export function validateExclusionChanges(value: unknown): ExclusionChange[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 500) return null;
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" ||
      !/^folder-[a-f0-9]{64}$/.test(item.id) || typeof item.excluded !== "boolean" ||
      !Number.isSafeInteger(item.version) || item.version < 1 || ids.has(item.id) ||
      Object.keys(item).some((key) => !["id", "excluded", "version"].includes(key))) return null;
    ids.add(item.id);
  }
  return value;
}

// A single SQL statement validates every expected version and policy before
// changing any row. Concurrent batches either apply in full or change nothing.
export const SAVE_EXCLUSIONS_SQL = `WITH requested AS (
  SELECT json_extract(value,'$.id') AS id,json_extract(value,'$.excluded') AS excluded,
    json_extract(value,'$.version') AS version FROM json_each(?)
), valid AS (
  SELECT count(*) AS count FROM requested r JOIN update_folders f ON f.id=r.id
  WHERE f.version=r.version AND (r.excluded=1 OR f.policy_locked=0)
)
UPDATE update_folders SET excluded=(SELECT excluded FROM requested WHERE requested.id=update_folders.id),
  version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM requested) AND (SELECT count FROM valid)=?`;

export async function saveExclusions(env: Env, changes: ExclusionChange[]) {
  const result = await env.DB.prepare(SAVE_EXCLUSIONS_SQL).bind(JSON.stringify(changes), changes.length).run();
  return result.meta.changes === changes.length;
}

export function containsLocalPath(value: string) {
  return /(?:\/(?:Users|home|Volumes|tmp|private|var|mnt|opt|workspace)\/|[a-z]:[\\/]|~\/)/i.test(value);
}

export function visibleProject(project: UpdateProject | undefined) {
  return project?.identityStatus === "verified" && project.canonicalId && !project.excluded && !project.locked;
}
