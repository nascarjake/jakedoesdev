#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PROFILE, ROOT, EXPECTED_ACCOUNT_ID, verifyCloudflareAccount } from "./verify-cloudflare-account.mjs";

try {
  await verifyCloudflareAccount();
  console.log("Verified personal Cloudflare account; building the Worker.");
  execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
  const builtConfig = JSON.parse(readFileSync(path.join(ROOT, "dist", "server", "wrangler.json"), "utf8"));
  if (builtConfig.account_id !== EXPECTED_ACCOUNT_ID) {
    throw new Error("The generated Worker config lost the pinned personal account ID.");
  }
  execFileSync(path.join(ROOT, "node_modules", ".bin", "wrangler"),
    ["deploy", "--profile", PROFILE], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, WRANGLER_LOG_PATH: path.join(ROOT, ".wrangler", "wrangler.log") },
    });
} catch (error) {
  console.error(error instanceof Error ? error.message : "Cloudflare deployment failed.");
  process.exitCode = 1;
}
