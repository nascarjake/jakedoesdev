#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROFILE = "jakedoesdev-personal";
export const EXPECTED_ACCOUNT_ID = "01f53095bb8f6eec6d75040c4232602a";
const API_ROOT = "https://api.cloudflare.com/client/v4";

function expectedEmail() {
  let source;
  try {
    source = readFileSync(path.join(ROOT, ".env.cloudflare-profile"), "utf8");
  } catch {
    throw new Error("Create the ignored .env.cloudflare-profile file with CLOUDFLARE_EXPECTED_EMAIL for this project's personal login.");
  }
  const email = source.match(/^CLOUDFLARE_EXPECTED_EMAIL=(.+)$/m)?.[1]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(".env.cloudflare-profile needs a valid CLOUDFLARE_EXPECTED_EMAIL.");
  }
  return email;
}

export function projectConfig() {
  const config = JSON.parse(readFileSync(path.join(ROOT, "wrangler.jsonc"), "utf8"));
  if (config.account_id !== EXPECTED_ACCOUNT_ID) {
    throw new Error("wrangler.jsonc does not target the personal Cloudflare account.");
  }
  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID !== EXPECTED_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID targets a different account. Unset it for this project.");
  }
  const databaseId = config.d1_databases?.find((database) => database.binding === "DB")?.database_id;
  if (!/^[0-9a-f-]{36}$/i.test(databaseId ?? "")) {
    throw new Error("The project D1 database ID is missing from wrangler.jsonc.");
  }
  if (!config.routes?.some((route) => route.pattern === "jakedoesdev.com/*" && route.zone_name === "jakedoesdev.com")) {
    throw new Error("The expected jakedoesdev.com route is missing from wrangler.jsonc.");
  }
  return { accountId: config.account_id, databaseId };
}

export function profileToken() {
  if (process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_EMAIL) {
    throw new Error("Unset ambient Cloudflare credentials; this project uses the named personal Wrangler profile.");
  }
  let output;
  try {
    output = execFileSync(path.join(ROOT, "node_modules", ".bin", "wrangler"),
      ["auth", "token", "--profile", PROFILE, "--json"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, WRANGLER_LOG_PATH: path.join(ROOT, ".wrangler", "wrangler.log") },
      });
  } catch {
    throw new Error(`The ${PROFILE} Wrangler login is unavailable. Sign into the personal Cloudflare account with \`npx wrangler auth create ${PROFILE} --browser=false\`.`);
  }
  let credentials;
  try {
    credentials = JSON.parse(output);
  } catch {
    throw new Error("Wrangler returned an unreadable authentication response.");
  }
  if (credentials.type !== "oauth" || !credentials.token) {
    throw new Error(`The ${PROFILE} profile must be a personal Cloudflare OAuth login.`);
  }
  return credentials.token;
}

async function cloudflare(pathname, token) {
  const response = await fetch(`${API_ROOT}${pathname}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success !== true) {
    throw new Error(`Cloudflare identity check failed (HTTP ${response.status}). Check the personal profile's access.`);
  }
  return body.result;
}

export async function verifyCloudflareAccount({ checkDatabase = true } = {}) {
  const { accountId, databaseId } = projectConfig();
  const email = expectedEmail();
  const token = profileToken();
  const user = await cloudflare("/user", token);
  if (user?.email?.toLowerCase() !== email) {
    throw new Error(`The ${PROFILE} profile is signed into a different Cloudflare email than this project's private identity file.`);
  }
  const zones = await cloudflare("/zones?name=jakedoesdev.com", token);
  if (!Array.isArray(zones) || zones.length !== 1 || zones[0].account?.id !== accountId) {
    throw new Error("The personal profile cannot verify ownership of jakedoesdev.com in the pinned account.");
  }
  if (checkDatabase) {
    const database = await cloudflare(`/accounts/${accountId}/d1/database/${databaseId}`, token);
    if (database?.uuid !== databaseId) {
      throw new Error("The configured D1 database does not belong to the pinned personal account.");
    }
  }
  return { accountId, databaseId, token };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyCloudflareAccount().then(() => {
    console.log("Verified the personal Cloudflare login, zone, and D1 database.");
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : "Cloudflare account verification failed.");
    process.exitCode = 1;
  });
}
