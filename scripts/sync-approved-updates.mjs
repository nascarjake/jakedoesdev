#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_ENDPOINT = "https://jakedoesdev.com/api/updates";
const MANAGED_SOURCE = "admin-review";

function cleanText(value, maximum) {
  return typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim().slice(0, maximum) : "";
}

function validUpdate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = cleanText(value.id, 80).toLowerCase();
  const title = cleanText(value.title, 140);
  const date = cleanText(value.date, 10);
  const summary = cleanText(value.summary, 500);
  const bullets = Array.isArray(value.bullets)
    ? value.bullets.map((bullet) => cleanText(bullet, 800)).filter(Boolean)
    : [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !title || !summary || bullets.length === 0 || bullets.length > 50) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return null;
  return { id, title, date, summary, bullets };
}

function quote(value) {
  return JSON.stringify(value);
}

function markdown(update) {
  return `---\ntitle: ${quote(update.title)}\ndate: ${quote(update.date)}\nsummary: ${quote(update.summary)}\npublished: true\nsource: ${quote(MANAGED_SOURCE)}\n---\n\n## This week\n\n${update.bullets.map((bullet) => `- ${bullet}`).join("\n")}\n`;
}

function isManagedFile(filename) {
  if (!existsSync(filename)) return true;
  return /^source:\s*["']?admin-review["']?\s*$/m.test(readFileSync(filename, "utf8"));
}

export async function synchronizeApprovedUpdates({
  endpoint = DEFAULT_ENDPOINT,
  outputDirectory = path.join(ROOT, "content", "updates"),
  dryRun = false,
  fetchImpl = fetch,
} = {}) {
  const response = await fetchImpl(endpoint, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Approved updates API returned HTTP ${response.status}.`);
  const payload = await response.json();
  if (!payload || !Array.isArray(payload.updates)) throw new Error("Approved updates API returned an invalid payload.");

  const updates = payload.updates.map(validUpdate).filter(Boolean);
  if (updates.length !== payload.updates.length) throw new Error("Approved updates API returned an invalid update.");
  const duplicate = updates.find((update, index) => updates.findIndex((candidate) => candidate.id === update.id) !== index);
  if (duplicate) throw new Error(`Approved updates API returned duplicate slug ${duplicate.id}.`);

  const result = { created: [], updated: [], unchanged: [] };
  for (const update of updates) {
    const destination = path.join(outputDirectory, `${update.id}.md`);
    if (!isManagedFile(destination)) throw new Error(`Refusing to replace the manually managed public post ${destination}.`);
    const next = markdown(update);
    const current = existsSync(destination) ? readFileSync(destination, "utf8") : null;
    if (current === next) {
      result.unchanged.push(update.id);
    } else if (current === null) {
      result.created.push(update.id);
      if (!dryRun) {
        mkdirSync(outputDirectory, { recursive: true });
        writeFileSync(destination, next);
      }
    } else {
      result.updated.push(update.id);
      if (!dryRun) writeFileSync(destination, next);
    }
  }
  return result;
}

function commandLine() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((arg) => arg !== "--dry-run")) throw new Error("Usage: sync-approved-updates.mjs [--dry-run]");
  return { dryRun: args.has("--dry-run") };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { dryRun } = commandLine();
  synchronizeApprovedUpdates({
    endpoint: process.env.UPDATES_API_URL?.trim() || DEFAULT_ENDPOINT,
    outputDirectory: process.env.UPDATES_OUTPUT_DIRECTORY?.trim() || path.join(ROOT, "content", "updates"),
    dryRun,
  }).then((result) => {
    console.log(`Approved update sync: ${result.created.length} created, ${result.updated.length} updated, ${result.unchanged.length} unchanged${dryRun ? " (dry run)" : ""}.`);
  }).catch((caught) => {
    console.error(caught instanceof Error ? caught.message : "Approved update sync failed.");
    process.exitCode = 1;
  });
}
