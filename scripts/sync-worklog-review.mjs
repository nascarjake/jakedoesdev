#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyCloudflareAccount } from "./verify-cloudflare-account.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER_DIR = path.join(ROOT, ".worklog", "weeks");
const API_ROOT = "https://api.cloudflare.com/client/v4";
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

function parseLedger(source) {
  return source.split(/^###\s+/m).slice(1).flatMap((block) => {
    const lines = block.trim().split(/\r?\n/);
    const heading = lines.shift() ?? "";
    const fields = Object.fromEntries(lines.map((line) => line.match(/^[-*]\s+([a-z]+):\s*(.+)$/i)).filter(Boolean).map((match) => [match[1].toLowerCase(), match[2].trim()]));
    if (!fields.summary || fields.visibility === "private") return [];
    const summary = fields.summary.replace(/^(["'])(.*)\1$/, "$2").trim();
    if (!summary) return [];
    const sourceKey = createHash("sha256").update(`${heading}\n${summary}`).digest("hex");
    return [{ summary, sourceKey }];
  });
}

async function cloudflare(pathname, token, init = {}) {
  const response = await fetch(`${API_ROOT}${pathname}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    const code = body.errors?.[0]?.code;
    throw new Error(code === 10000 || response.status === 403
      ? "The personal Wrangler profile needs D1 Read and D1 Write access for this account."
      : `Cloudflare D1 request failed (${response.status}).`);
  }
  return body;
}

async function queryD1(token, accountId, databaseId, sql, params = []) {
  const response = await cloudflare(`/accounts/${accountId}/d1/database/${databaseId}/query`, token, {
    method: "POST",
    body: JSON.stringify({ sql, params }),
  });
  if (response.result?.some((item) => item.success === false)) throw new Error("D1 rejected the update review write.");
  return response.result?.[0]?.results ?? [];
}

async function syncWeek(week, entries, { token, accountId, databaseId }) {
  const id = `week-${week.toLowerCase()}`;
  const existing = await queryD1(token, accountId, databaseId,
    "SELECT bullets_json, source_keys_json, published FROM updates WHERE id = ? LIMIT 1", [id]);

  if (existing[0]?.published === 1) {
    console.log(`The ${week} update is already published; the automation left it unchanged.`);
    return;
  }

  let bullets = [];
  let sourceKeys = [];
  if (existing[0]) {
    try { bullets = JSON.parse(existing[0].bullets_json); } catch { bullets = []; }
    try { sourceKeys = JSON.parse(existing[0].source_keys_json); } catch { sourceKeys = []; }
  }
  if (!Array.isArray(bullets)) bullets = [];
  if (!Array.isArray(sourceKeys)) sourceKeys = [];
  const knownKeys = new Set(sourceKeys.filter((key) => typeof key === "string"));
  const knownBullets = new Set(bullets.filter((bullet) => typeof bullet === "string"));
  const additions = entries.filter((entry) => !knownKeys.has(entry.sourceKey));
  for (const entry of additions) {
    if (!knownBullets.has(entry.summary)) bullets.push(entry.summary);
    sourceKeys.push(entry.sourceKey);
    knownKeys.add(entry.sourceKey);
    knownBullets.add(entry.summary);
  }
  if (!additions.length && existing[0]) {
    console.log(`No new summaries for ${week}; the review draft is unchanged.`);
    return;
  }

  const { year, month, day } = localDate();
  const date = week === isoWeek() ? `${year}-${month}-${day}` : weekEndDate(week);
  const title = `Field notes · ${week}`;
  const summary = "A running notebook of ideas, builds, and lessons from the week.";
  if (existing[0]) {
    await queryD1(token, accountId, databaseId,
      "UPDATE updates SET bullets_json = ?, source_keys_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND published = 0",
      [JSON.stringify(bullets), JSON.stringify(sourceKeys), id]);
  } else {
    await queryD1(token, accountId, databaseId,
      "INSERT INTO updates (id, title, date, summary, bullets_json, source_keys_json, published, created_by) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
      [id, title, date, summary, JSON.stringify(bullets), JSON.stringify(sourceKeys), "daily work log"]);
  }
  console.log(`Sent ${additions.length} new summaries to the private ${week} portal draft.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--all")) {
    throw new Error("Usage: sync-worklog-review.mjs [--all]");
  }
  const weeks = args[0] === "--all"
    ? (existsSync(LEDGER_DIR) ? readdirSync(LEDGER_DIR).filter((name) => /^\d{4}-W\d{2}\.md$/.test(name)).map((name) => name.slice(0, -3)).sort() : [])
    : [isoWeek()];
  const batches = weeks.flatMap((week) => {
    const ledgerPath = path.join(LEDGER_DIR, `${week}.md`);
    return existsSync(ledgerPath) ? [{ week, entries: parseLedger(readFileSync(ledgerPath, "utf8")) }] : [];
  }).filter(({ entries }) => entries.length > 0);
  if (!batches.length) {
    console.log("No non-private ledger summaries are ready for review.");
    return;
  }

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

  const account = await verifyCloudflareAccount();
  for (const { week, entries } of batches) await syncWeek(week, entries, account);
}

main().catch((caught) => {
  console.error(caught instanceof Error ? caught.message : "Could not sync the private work log to the update review portal.");
  process.exitCode = 1;
});
