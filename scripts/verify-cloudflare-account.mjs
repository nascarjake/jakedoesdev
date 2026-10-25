#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, symlinkSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROFILE = "personal";
export const EXPECTED_ACCOUNT_ID = "01f53095bb8f6eec6d75040c4232602a";
const MIN_NODE = [22, 13, 0];

export function supportedNodeRuntime(version = process.versions.node) {
  const parts = version.split(".").map(Number);
  return parts.length >= 3 && parts.every(Number.isFinite) &&
    (parts[0] > MIN_NODE[0] || (parts[0] === MIN_NODE[0] &&
      (parts[1] > MIN_NODE[1] || (parts[1] === MIN_NODE[1] && parts[2] >= MIN_NODE[2]))));
}

export function describeWranglerFailure(error) {
  const stderr = Buffer.isBuffer(error?.stderr) ? error.stderr.toString("utf8") : String(error?.stderr ?? "");
  const diagnostic = `${error?.message ?? ""}\n${stderr}`;
  if (/requires at least Node\.js|Node\.js v?2[0-1]\./i.test(diagnostic)) {
    return "Wrangler needs Node.js 22.13.0 or newer. Run the project Cloudflare script, which selects the pinned Node 22.22.3 runtime.";
  }
  if (/Unknown arguments|Unknown command|not a wrangler command/i.test(diagnostic)) {
    return "The project-local Wrangler rejected the requested command or arguments. Check the pinned CLI invocation and help output.";
  }
  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|network/i.test(diagnostic)) {
    return "Could not reach Cloudflare while checking the personal Wrangler profile. Check DNS/network access and retry the read-only check.";
  }
  if (/not logged in|not authenticated|authentication required|no auth|login required|unauthorized/i.test(diagnostic)) {
    return `The local ${PROFILE} profile is not authenticated or bound. Use Wrangler's supported profile setup for this repository, then rerun the read-only verifier; no other account was used.`;
  }
  if (error?.code === "ENOENT") {
    return "The project-local Wrangler executable is missing. Restore the existing project dependencies before any Cloudflare action.";
  }
  return `The project-local Wrangler check failed (${error?.code || "unknown command error"}). No account identity was confirmed.`;
}

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

export function cloudflareAuthMode(env = process.env) {
  const mode = env.CLOUDFLARE_AUTH_MODE;
  if (!mode) {
    throw new Error("Set CLOUDFLARE_AUTH_MODE=profile for local OAuth verification. API-token mode is planned but not implemented.");
  }
  if (mode === "api-token") {
    throw new Error("CLOUDFLARE_AUTH_MODE=api-token is planned but not implemented. No token or cloud command was used.");
  }
  if (mode !== "profile") {
    throw new Error("CLOUDFLARE_AUTH_MODE must be 'profile'; no cloud command was used.");
  }
  if (env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_KEY || env.CLOUDFLARE_EMAIL) {
    throw new Error("Profile mode refuses ambient Cloudflare API credentials. Unset them; verification will not fall back to a token or API key.");
  }
  return mode;
}

function profileCommandEnv() {
  cloudflareAuthMode();
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  delete env.CLOUDFLARE_API_KEY;
  delete env.CLOUDFLARE_EMAIL;
  env.WRANGLER_LOG_PATH = process.env.WRANGLER_LOG_PATH || path.join(os.tmpdir(), "wrangler-jakedoesdev.log");
  return env;
}

function runWrangler(args) {
  const secretOutput = args[0] === "auth" && args[1] === "token";
  const logDirectory = secretOutput ? mkdtempSync(path.join(os.tmpdir(), "jdd-auth-log-")) : null;
  // Wrangler treats paths without a .log suffix as directories. Route its
  // credential-command log through a temporary .log symlink to the null device.
  const discardLog = logDirectory ? path.join(logDirectory, "session.log") : null;
  try {
    if (discardLog) symlinkSync(os.devNull, discardLog);
    return execFileSync(path.join(ROOT, "node_modules", ".bin", "wrangler"), args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: secretOutput
        ? { ...profileCommandEnv(), WRANGLER_LOG_PATH: discardLog, WRANGLER_LOG: "log", WRANGLER_SEND_METRICS: "false" }
        : profileCommandEnv(),
    });
  } catch (error) {
    throw new Error(describeWranglerFailure(error));
  } finally {
    if (logDirectory) rmSync(logDirectory, { recursive: true, force: true });
  }
}

export function activeProfileForProject(output) {
  const bindings = output.split(/\r?\n/).flatMap((line) => {
    const columns = line.split("│").map((column) => column.trim());
    const profile = columns[1];
    if (!profile || profile === "Profile" || !columns[2]) return [];
    return columns[2].split(",").map((directory) => directory.trim()).filter((directory) => directory && directory !== "-")
      .map((directory) => ({ profile, directory: path.resolve(directory) }));
  });
  const applicable = bindings.filter(({ directory }) => ROOT === directory || ROOT.startsWith(`${directory}${path.sep}`));
  applicable.sort((left, right) => right.directory.length - left.directory.length);
  return applicable[0]?.profile ?? null;
}

function databaseRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.databases)) return payload.databases;
  return [];
}

export function profileIdentity() {
  cloudflareAuthMode();
  const authList = runWrangler(["auth", "list"]);
  const activeProfile = activeProfileForProject(authList);
  if (activeProfile !== PROFILE) {
    throw new Error(`The nearest Wrangler profile for this project is ${activeProfile ?? "unbound"}, not ${PROFILE}. Bind ${PROFILE} to ${ROOT}; the verifier will not fall back to another account.`);
  }

  let identity;
  try {
    identity = JSON.parse(runWrangler(["whoami", "--json"]));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Wrangler returned unreadable identity metadata.");
    throw error;
  }
  if (identity?.loggedIn !== true || typeof identity.email !== "string" || !Array.isArray(identity.accounts)) {
    throw new Error(`Wrangler could not confirm the active ${PROFILE} identity. No default or alternate profile was used.`);
  }

  let databases;
  try {
    databases = databaseRows(JSON.parse(runWrangler(["d1", "list", "--profile", PROFILE, "--json"])));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Wrangler returned an unreadable D1 listing.");
    throw error;
  }
  return { identity, databases };
}

function profileCredentials() {
  cloudflareAuthMode();
  // auth token and whoami intentionally use the directory binding; Wrangler
  // does not support --profile on these auth commands.
  if (activeProfileForProject(runWrangler(["auth", "list"])) !== PROFILE) {
    throw new Error(`The project must stay bound to ${PROFILE} while verifying its zone.`);
  }
  try { return JSON.parse(runWrangler(["auth", "token", "--json"])); }
  catch { throw new Error("Could not obtain the selected profile's OAuth session for zone verification."); }
}

// https://developers.cloudflare.com/workers/wrangler/commands/general/#auth-token
// The supported CLI returns the active OAuth session directly into this process.
// No credentials are returned, written to disk, passed in argv, or logged.
export async function readProfileZones({ fetchImpl = fetch, loadCredentials = profileCredentials } = {}) {
  const credentials = loadCredentials();
  if (credentials?.type !== "oauth" || typeof credentials.token !== "string" || !credentials.token || /[\r\n]/.test(credentials.token)) {
    throw new Error("Zone verification requires the selected OAuth profile; token/key fallback is refused.");
  }
  const url = new URL("https://api.cloudflare.com/client/v4/zones");
  url.search = new URLSearchParams({ name: "jakedoesdev.com", "account.id": EXPECTED_ACCOUNT_ID, status: "active", per_page: "50" }).toString();
  try {
    const response = await fetchImpl(url, { method: "GET", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${credentials.token}`, Accept: "application/json" } });
    if (!response.ok) throw new Error("Zone request rejected");
    const payload = await response.json();
    if (payload.success !== true || !Array.isArray(payload.result)) throw new Error("Invalid zone response");
    return payload.result.map(zone => ({ id: zone.id, name: zone.name, status: zone.status, account: { id: zone.account?.id } }));
  } catch {
    throw new Error("Could not verify zone ownership with the personal OAuth profile. No deployment was performed.");
  }
}

export async function verifyCloudflareAccount({
  checkDatabase = true,
  checkZone = true,
  authMode = process.env.CLOUDFLARE_AUTH_MODE,
  identityProvider = profileIdentity,
  zoneProvider = readProfileZones,
  expectedEmailValue,
} = {}) {
  cloudflareAuthMode({ ...process.env, CLOUDFLARE_AUTH_MODE: authMode });
  const { accountId, databaseId } = projectConfig();
  const email = expectedEmailValue ?? expectedEmail();
  const { identity, databases } = await identityProvider();
  if (identity.email?.toLowerCase() !== email) {
    throw new Error(`The active ${PROFILE} profile is signed into a different Cloudflare email than this project's private identity file.`);
  }
  if (!identity.accounts.some((account) => account.id === accountId)) {
    throw new Error(`The active ${PROFILE} profile cannot access the pinned personal Cloudflare account.`);
  }
  if (checkDatabase) {
    if (!databases.some((database) => (database.uuid ?? database.id) === databaseId)) {
      throw new Error("The configured D1 database is not visible to the named personal Wrangler profile.");
    }
  }
  if (checkZone) {
    const zones = await zoneProvider();
    if (!Array.isArray(zones) || zones.length !== 1 || zones[0].name !== "jakedoesdev.com" ||
        zones[0].status !== "active" || zones[0].account?.id !== accountId || !/^[a-f0-9]{32}$/i.test(zones[0].id || "")) {
      throw new Error("jakedoesdev.com is not an active zone in the pinned personal account. No deployment was performed.");
    }
  }
  return { accountId, databaseId, email, profile: PROFILE };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!supportedNodeRuntime()) {
    console.error(`Node.js ${process.versions.node} is below this project's required Node 22.13.0. Run 'npm run deploy:cloudflare' or 'npm run db:migrate:remote' to select the pinned runtime.`);
    process.exitCode = 1;
  } else verifyCloudflareAccount().then(() => {
    console.log("Verified the personal Wrangler profile, account, D1 database, and active domain.");
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : "Cloudflare account verification failed.");
    process.exitCode = 1;
  });
}
