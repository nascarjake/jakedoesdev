import { execFileSync } from "node:child_process";
export function verifyDeploySource(root, run = (args) => execFileSync("git", args, {cwd: root, encoding: "utf8"}).trim()) {
  const dirty = run(["status", "--porcelain", "--untracked-files=no"]);
  if (dirty) throw new Error("Commit reviewed tracked changes before deploying; unpublished working-tree changes cannot define production.");
  const remote = run(["ls-remote", "origin", "refs/heads/main"]).split(/\s+/)[0];
  if (!/^[a-f0-9]{40}$/.test(remote)) throw new Error("Cannot verify the current origin/main deployment baseline.");
  try { run(["merge-base", "--is-ancestor", remote, "HEAD"]); }
  catch { throw new Error("This checkout omits commits on origin/main. Fetch and merge the current site before deploying; an old release worktree must not replace newer pages."); }
  return remote;
}
