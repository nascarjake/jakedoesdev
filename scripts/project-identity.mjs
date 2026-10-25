import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, realpathSync, statSync } from "node:fs";
import path from "node:path";

const hash = (value) => createHash("sha256").update(value).digest("hex");
function git(cwd, ...args) {
  try { return execFileSync("git", ["-C", cwd, "rev-parse", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return null; }
}

// Names, summaries and remotes are never identity evidence. All paths stay local.
export function resolveProjectIdentity(cwd, { workspaceRoot } = {}) {
  if (typeof cwd !== "string" || !path.isAbsolute(cwd) || !existsSync(cwd)) return null;
  let folder = realpathSync(cwd);
  if (!statSync(folder).isDirectory()) return null;
  const top = git(folder, "--show-toplevel");
  if (top) {
    const common = git(folder, "--path-format=absolute", "--git-common-dir");
    if (!common || !existsSync(common)) return null;
    // Linked worktrees share the main checkout's .git directory. Nested repos
    // have their own common directory, even when remotes happen to match.
    const main = path.dirname(realpathSync(common));
    folder = path.basename(common) === ".git" ? main : realpathSync(top);
  } else {
    if (!workspaceRoot || !existsSync(workspaceRoot)) return null;
    const base = realpathSync(workspaceRoot);
    const relative = path.relative(base, folder);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
    const markers = [".project-root", "package.json", "pyproject.toml", "Cargo.toml", "go.mod"];
    let candidate = folder, marked = null;
    while (candidate !== base) {
      if (markers.some((marker) => existsSync(path.join(candidate, marker)))) { marked = candidate; break; }
      candidate = path.dirname(candidate);
    }
    folder = marked || path.join(base, relative.split(path.sep)[0]);
  }
  if (/[\r\n\0]/.test(folder)) return null;
  return { id: `folder-${hash(folder)}`, name: path.basename(folder), root: folder };
}

export function verifiedProvenance(fields, options) {
  const roots = ["folder-root", "repo-root", "workspace", "cwd", "thread-cwd"].flatMap((key) => fields[key] ? [fields[key]] : []);
  if (!roots.length) return null;
  const identities = roots.map((root) => resolveProjectIdentity(root, options));
  if (identities.some((item) => !item || item.id !== identities[0]?.id)) return null;
  const identity = identities[0];
  if (fields["folder-id"] && fields["folder-id"] !== identity.id) return null;
  return identity;
}

export function legacyProjectId(label) {
  const slug = label.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "project";
  return `${slug}-${hash(label).slice(0, 10)}`;
}

export function parseLedger(source, options) {
  return source.split(/^###\s+/m).slice(1).flatMap((block) => {
    const lines = block.trim().split(/\r?\n/), heading = lines.shift() ?? "";
    const fields = Object.fromEntries(lines.map((line) => line.match(/^[-*]\s+([a-z-]+):\s*(.+)$/i)).filter(Boolean).map((match) => [match[1].toLowerCase(), match[2].trim()]));
    if (!fields.summary || fields.visibility === "private") return [];
    const summary = fields.summary.replace(/^(["'])(.*)\1$/, "$2").trim();
    const label = heading.split(" · ").slice(1).join(" · ").trim() || "Unassigned";
    const folder = verifiedProvenance(fields, options);
    return [{ summary, sourceKey: hash(`${heading}\n${summary}`), legacyId: legacyProjectId(label), folder }];
  });
}
