#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORKLOG_DIRECTORY = path.join(ROOT, ".worklog");
const WEEKS_DIRECTORY = path.join(WORKLOG_DIRECTORY, "weeks");
const CANDIDATES_DIRECTORY = path.join(WORKLOG_DIRECTORY, "candidates");
const UPDATES_DIRECTORY = path.join(ROOT, "content", "updates");
const VALID_VISIBILITIES = new Set(["public", "abstract", "private"]);
const SENSITIVE_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /(?:api[_-]?key|secret|token|password)\s*[:=]/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bBearer\s+[A-Za-z0-9._-]{16,}\b/i,
];

function argumentMap(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 1) {
    if (args[index].startsWith("--")) {
      values.set(args[index].slice(2), args[index + 1] ?? "");
      index += 1;
    }
  }
  return values;
}

function isoWeek(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / 86_400_000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clean(value) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function weekPath(week) {
  return path.join(WEEKS_DIRECTORY, `${week}.md`);
}

function candidatePath(week) {
  return path.join(CANDIDATES_DIRECTORY, `${week}.md`);
}

function ensureWeek(week) {
  mkdirSync(WEEKS_DIRECTORY, { recursive: true });
  const filename = weekPath(week);
  if (!existsSync(filename)) {
    writeFileSync(
      filename,
      `---\nweek: ${week}\ncreated: ${today()}\nstatus: collecting\n---\n\n# Private weekly activity ledger\n\nThis file is local-only. It is source material, not a public post.\n\n## Entries\n`,
    );
    console.log(`Created ${path.relative(ROOT, filename)}`);
  }
  return filename;
}

function validateText(source) {
  return SENSITIVE_PATTERNS.filter((pattern) => pattern.test(source)).map(String);
}

function parseEntries(source) {
  const entries = [];
  const blocks = source.split(/^###\s+/m).slice(1);

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    const heading = lines.shift() ?? "";
    const fields = Object.fromEntries(
      lines
        .map((line) => line.match(/^-\s+([a-z]+):\s*(.+)$/i))
        .filter(Boolean)
        .map((match) => [match[1].toLowerCase(), match[2].trim()]),
    );

    if (fields.summary && fields.visibility && fields.publish) {
      entries.push({ heading, ...fields });
    }
  }
  return entries;
}

function commandNew(args) {
  ensureWeek(args.get("week") || isoWeek());
}

function commandAppend(args) {
  const week = args.get("week") || isoWeek();
  const project = clean(args.get("project") || "");
  const visibility = clean(args.get("visibility") || "abstract").toLowerCase();
  const summary = clean(args.get("summary") || "");
  const publish = clean(args.get("publish") || "no").toLowerCase() === "yes" ? "yes" : "no";

  if (!project || !summary || !VALID_VISIBILITIES.has(visibility)) {
    throw new Error("append requires --project, --summary, and --visibility public|abstract|private");
  }
  if (validateText(`${project} ${summary}`).length) {
    throw new Error("Refusing to write a value that resembles a credential or secret.");
  }
  if (visibility === "private" && publish === "yes") {
    throw new Error("Private entries cannot be marked for publication.");
  }

  const filename = ensureWeek(week);
  writeFileSync(
    filename,
    `\n### ${today()} · ${project}\n- visibility: ${visibility}\n- publish: ${publish}\n- summary: ${summary}\n`,
    { flag: "a" },
  );
  console.log(`Added a ${visibility} entry to ${path.relative(ROOT, filename)}`);
}

function commandValidate(args) {
  const week = args.get("week") || isoWeek();
  const filename = weekPath(week);
  if (!existsSync(filename)) {
    throw new Error(`No ledger exists for ${week}. Run new first.`);
  }

  const source = readFileSync(filename, "utf8");
  const problems = validateText(source);
  const entries = parseEntries(source);
  const invalidEntry = entries.find(
    (entry) => !VALID_VISIBILITIES.has(entry.visibility) || !["yes", "no"].includes(entry.publish),
  );

  if (problems.length || invalidEntry) {
    throw new Error(
      problems.length
        ? `Potential sensitive content matched: ${problems.join(", ")}`
        : "An entry has an invalid visibility or publish value.",
    );
  }
  console.log(`${week} is valid (${entries.length} structured entries).`);
}

function commandDraft(args) {
  const week = args.get("week") || isoWeek();
  const filename = weekPath(week);
  if (!existsSync(filename)) {
    throw new Error(`No ledger exists for ${week}. Run new first.`);
  }

  const source = readFileSync(filename, "utf8");
  const problems = validateText(source);
  if (problems.length) {
    throw new Error(`Potential sensitive content matched: ${problems.join(", ")}`);
  }

  const entries = parseEntries(source).filter(
    (entry) => entry.publish === "yes" && entry.visibility !== "private",
  );
  if (!entries.length) {
    console.log(`No publish-approved entries for ${week}; no candidate created.`);
    return;
  }

  mkdirSync(CANDIDATES_DIRECTORY, { recursive: true });
  const candidate = candidatePath(week);
  const title = `Weekly notes — ${week}`;
  const body = entries.map((entry) => `- ${entry.summary}`).join("\n");
  writeFileSync(
    candidate,
    `---\ntitle: "${title}"\ndate: "${today()}"\nsummary: "A weekly development note from Jacob Clark."\npublished: false\n---\n\n## This week\n\n${body}\n`,
  );
  console.log(`Created review candidate ${path.relative(ROOT, candidate)}`);
}

function commandPromote(args) {
  const week = args.get("week") || isoWeek();
  if (args.get("confirm") !== "publish") {
    throw new Error("Promotion requires --confirm publish after reviewing the candidate.");
  }

  const candidate = candidatePath(week);
  const destination = path.join(UPDATES_DIRECTORY, `${week.toLowerCase()}.md`);
  if (!existsSync(candidate)) {
    throw new Error(`No candidate exists for ${week}. Run draft first.`);
  }
  if (existsSync(destination)) {
    throw new Error(`Refusing to overwrite existing public post ${path.relative(ROOT, destination)}.`);
  }

  const source = readFileSync(candidate, "utf8");
  const problems = validateText(source);
  if (problems.length) {
    throw new Error(`Potential sensitive content matched: ${problems.join(", ")}`);
  }

  mkdirSync(UPDATES_DIRECTORY, { recursive: true });
  writeFileSync(destination, source.replace("published: false", "published: true"));
  console.log(`Promoted ${path.relative(ROOT, destination)}. Review and commit it to publish.`);
}

const [command, ...rest] = process.argv.slice(2);
const args = argumentMap(rest);

try {
  if (command === "new") commandNew(args);
  else if (command === "append") commandAppend(args);
  else if (command === "validate") commandValidate(args);
  else if (command === "draft") commandDraft(args);
  else if (command === "promote") commandPromote(args);
  else throw new Error("Use one of: new, append, validate, draft, promote");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
