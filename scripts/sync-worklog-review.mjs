#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER_DIR = path.join(ROOT, ".worklog", "weeks");

function isoWeek(date = new Date()) {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value - yearStart) / 86_400_000 + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
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
    const project = heading.split(" · ").slice(1).join(" · ").trim() || "Unassigned";
    const slug = project.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "project";
    const projectId = `${slug}-${createHash("sha256").update(project).digest("hex").slice(0, 10)}`;
    return [{ summary, sourceKey, project, projectId }];
  });
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
  throw new Error("The worklog REST D1 writer is disabled in profile mode. A separate API-token mode is planned but not implemented; no D1 updates were written.");
}

main().catch((caught) => {
  console.error(caught instanceof Error ? caught.message : "Could not sync the private work log to the update review portal.");
  process.exitCode = 1;
});
