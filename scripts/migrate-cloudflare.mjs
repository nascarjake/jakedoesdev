#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { PROFILE, ROOT, verifyCloudflareAccount } from "./verify-cloudflare-account.mjs";

await verifyCloudflareAccount({ checkZone: true });
console.log("Verified personal Cloudflare account and D1 target; applying migrations.");
const wranglerEnv = { ...process.env };
delete wranglerEnv.CLOUDFLARE_API_TOKEN;
delete wranglerEnv.CLOUDFLARE_API_KEY;
delete wranglerEnv.CLOUDFLARE_EMAIL;
wranglerEnv.WRANGLER_LOG_PATH = process.env.WRANGLER_LOG_PATH || path.join(os.tmpdir(), "wrangler-jakedoesdev.log");
execFileSync(path.join(ROOT, "node_modules", ".bin", "wrangler"), [
  "d1", "migrations", "apply", "jakedoesdev-portfolio", "--remote", "--profile", PROFILE,
], {
  cwd: ROOT,
  stdio: "inherit",
  env: wranglerEnv,
});
