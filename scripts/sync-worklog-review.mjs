#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseLedger } from "./project-identity.mjs";
import { PROFILE, verifyCloudflareAccount } from "./verify-cloudflare-account.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER_DIR = path.join(ROOT, ".worklog", "weeks");
const PUBLIC_UPDATES_API = "https://jakedoesdev.com/api/updates";

function isoWeek(date = new Date()) {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value - yearStart) / 86_400_000 + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function localDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function weekEndDate(week) {
  const [year, number] = week.split("-W").map(Number);
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const mondayOffset = (januaryFourth.getUTCDay() + 6) % 7;
  januaryFourth.setUTCDate(januaryFourth.getUTCDate() - mondayOffset + (number - 1) * 7 + 6);
  return januaryFourth.toISOString().slice(0, 10);
}


const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
async function queryD1(sql, params = []) {
  // Parameters originate in private ledger files. Quote as SQL literals in a
  // private file, never as shell arguments or logged command text.
  let index = 0;
  const statement = sql.replace(/\?/g, () => quote(params[index++]));
  if (index !== params.length) throw new Error("Invalid query parameter count.");
  const directory = path.join(ROOT, ".worklog", "sync");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = path.join(directory, "pending.sql");
  writeFileSync(filename, statement, { mode: 0o600 });
  try {
    const raw = execFileSync(path.join(ROOT, "node_modules", ".bin", "wrangler"),
      ["d1", "execute", "jakedoesdev-portfolio", "--remote", "--profile", PROFILE, "--file", filename, "--json"],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const response = JSON.parse(raw);
    if (!Array.isArray(response) || response.some((item) => item.success === false)) throw new Error();
    const result = response[0];
    if (/^UPDATE /i.test(statement) && result.meta?.changes !== 1) throw new Error("The review draft changed concurrently; nothing was overwritten. Retry sync.");
    return result.results ?? [];
  } catch (error) {
    throw new Error(error.message?.startsWith("The review draft") ? error.message : "The verified personal D1 sync failed. No credentials or private query details were logged; retry is safe.");
  }
}

export async function syncWeek(week, entries, { query = queryD1 } = {}) {
  const id = `week-${week.toLowerCase()}`;
  const existing = await query(
    "SELECT bullets_json, entries_json, source_keys_json, published FROM updates WHERE id = ? LIMIT 1", [id]);

  for (const entry of entries.filter((item) => item.folder)) {
    await query(
      "INSERT INTO update_folders (id,name,excluded,policy_locked) VALUES (?,?,1,1) ON CONFLICT(id) DO NOTHING",
      [entry.folder.id, entry.folder.name]);
  }
  if (existing[0]?.published === 1) {
    console.log(`The ${week} update is already approved; raw history was left unchanged.`);
    return;
  }
  let bullets = [];
  let items = [];
  let sourceKeys = [];
  if (existing[0]) {
    try {
      bullets = JSON.parse(existing[0].bullets_json);
      items = JSON.parse(existing[0].entries_json);
      sourceKeys = JSON.parse(existing[0].source_keys_json);
    } catch { throw new Error("Stored review history is invalid; nothing was overwritten."); }
  }
  if (![bullets, items, sourceKeys].every(Array.isArray)) throw new Error("Stored review history is invalid; nothing was overwritten.");
  // Legacy bullets without provenance stay untouched. Never reconstruct
  // identity by matching text or assigning a "previously approved" group.
  const knownKeys = new Set(sourceKeys.filter((key) => typeof key === "string"));
  const additions = entries.filter((entry) => entry.folder && !knownKeys.has(entry.sourceKey));
  for (const entry of additions) {
    if (!items.some((item) => item.projectId === entry.folder.id && item.text === entry.summary)) {
      bullets.push(entry.summary);
      items.push({ projectId: entry.folder.id, text: entry.summary });
    }
    sourceKeys.push(entry.sourceKey);
    knownKeys.add(entry.sourceKey);
  }
  if (!additions.length && existing[0]) {
    console.log(`No new summaries for ${week}; the review draft is unchanged.`);
    return;
  }

  if (!additions.length) return;
  const { year, month, day } = localDate();
  const date = week === isoWeek() ? `${year}-${month}-${day}` : weekEndDate(week);
  const title = `Field notes · ${week}`;
  const summary = "A running notebook of ideas, builds, and lessons from the week.";
  if (existing[0]) {
    await query(
      "UPDATE updates SET bullets_json = ?, entries_json = ?, source_keys_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND published = 0 AND entries_json = ? AND source_keys_json = ?",
      [JSON.stringify(bullets), JSON.stringify(items), JSON.stringify(sourceKeys), id, existing[0].entries_json, existing[0].source_keys_json]);
  } else {
    await query(
      "INSERT INTO updates (id, title, date, summary, bullets_json, entries_json, source_keys_json, published, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
      [id, title, date, summary, JSON.stringify(bullets), JSON.stringify(items), JSON.stringify(sourceKeys), "daily work log"]);
  }
  console.log(`Sent ${additions.length} new summaries to the private ${week} portal draft.`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((arg) => !["--all", "--plan"].includes(arg))) throw new Error("Usage: sync-worklog-review.mjs [--all] [--plan]");
  const weeks = args.has("--all")
    ? (existsSync(LEDGER_DIR) ? readdirSync(LEDGER_DIR).filter((name) => /^\d{4}-W\d{2}\.md$/.test(name)).map((name) => name.slice(0, -3)).sort() : [])
    : [isoWeek()];
  const batches = weeks.flatMap((week) => {
    const ledgerPath = path.join(LEDGER_DIR, `${week}.md`);
    return existsSync(ledgerPath) ? [{ week, entries: parseLedger(readFileSync(ledgerPath, "utf8"), { workspaceRoot: path.dirname(ROOT) }) }] : [];
  }).filter(({ entries }) => entries.length > 0);
  if (!batches.length) {
    console.log("No non-private ledger summaries are ready for review.");
    return;
  }

  const allEntries = batches.flatMap((batch) => batch.entries);
  const unresolved = allEntries.filter((entry) => !entry.folder).length;
  console.log(`${allEntries.length - unresolved} verified folder records; ${unresolved} unresolved records withheld.`);
  if (args.has("--plan")) {
    const directory = path.join(ROOT, ".worklog", "sync");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    writeFileSync(path.join(directory, "provenance-plan.json"), JSON.stringify({ batches }, null, 2), { mode: 0o600 });
    console.log("Private provenance plan prepared. No remote writes or publishing approvals.");
    return;
  }
  if (!allEntries.some((entry) => entry.folder)) return;
  let publicApi;
  try {
    publicApi = await fetch(PUBLIC_UPDATES_API, { signal: AbortSignal.timeout(10_000) });
  } catch {
    console.log("The portal review API could not be reached; the private ledger was left unchanged.");
    return;
  }
  if (!publicApi.ok || !publicApi.headers.get("content-type")?.includes("application/json")) {
    console.log("The portal review API is not live yet; the draft remains private until the site rollout is deployed.");
    return;
  }

  await verifyCloudflareAccount();
  for (const { week, entries } of batches) await syncWeek(week, entries);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((caught) => {
  console.error(caught instanceof Error ? caught.message : "Could not sync the private work log to the update review portal.");
  process.exitCode = 1;
});
