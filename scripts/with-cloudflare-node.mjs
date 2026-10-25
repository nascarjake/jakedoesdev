#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PINNED_NODE_VERSION = readFileSync(path.join(ROOT, ".nvmrc"), "utf8").trim();

function versionOf(executable) {
  const result = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 5_000 });
  return result.status === 0 ? result.stdout.trim().replace(/^v/, "") : null;
}

function resolvePinnedNode() {
  const candidates = [
    process.execPath,
    path.join(process.env.NVM_DIR || path.join(os.homedir(), ".nvm"), "versions", "node", `v${PINNED_NODE_VERSION}`, "bin", "node"),
    "/opt/homebrew/bin/node",
    "/usr/local/bin/node",
  ];
  for (const candidate of [...new Set(candidates)]) {
    if (!existsSync(candidate)) continue;
    if (versionOf(candidate) === PINNED_NODE_VERSION) return candidate;
  }
  throw new Error(`Node ${PINNED_NODE_VERSION} is required for Cloudflare commands. It is not installed at the project's pinned runtime path; install nothing automatically and run this command after selecting the project runtime.`);
}

const scripts = {
  deploy: "scripts/deploy-cloudflare.mjs",
  migrate: "scripts/migrate-cloudflare.mjs",
  "migrate-local": "scripts/migrate-local-cloudflare.mjs",
  verify: "scripts/verify-cloudflare-account.mjs",
  worklog: "scripts/sync-worklog-review.mjs",
};

const action = process.argv[2];
if (!scripts[action] && action !== "version") {
  console.error("Usage: with-cloudflare-node.mjs <deploy|migrate|migrate-local|verify|worklog|version>");
  process.exitCode = 2;
} else {
  try {
    const node = resolvePinnedNode();
    const env = {
      ...process.env,
      PATH: `${path.dirname(node)}${path.delimiter}${process.env.PATH || ""}`,
      WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH || path.join(os.tmpdir(), "wrangler-jakedoesdev.log"),
    };
    if (scripts[action] && !env.CLOUDFLARE_AUTH_MODE) env.CLOUDFLARE_AUTH_MODE = "profile";
    if (action === "version") {
      const wrangler = path.join(ROOT, "node_modules", ".bin", "wrangler");
      const runtime = spawnSync(node, ["--version"], { cwd: ROOT, env, encoding: "utf8" });
      const cli = spawnSync(wrangler, ["--version"], { cwd: ROOT, env, encoding: "utf8" });
      if (runtime.status !== 0 || cli.status !== 0) {
        throw new Error("Could not inspect the pinned Node.js and Wrangler versions.");
      }
      console.log(`Node.js ${runtime.stdout.trim()} · Wrangler ${cli.stdout.trim()}`);
      process.exitCode = 0;
    } else {
      const result = spawnSync(node, [path.join(ROOT, scripts[action]), ...process.argv.slice(3)], {
        cwd: ROOT,
        env,
        stdio: "inherit",
      });
      if (result.error) throw result.error;
      process.exitCode = result.status ?? 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Cloudflare command could not start.");
    process.exitCode = 1;
  }
}
