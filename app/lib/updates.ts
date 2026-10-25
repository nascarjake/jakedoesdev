import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const UPDATES_DIRECTORY = path.join(process.cwd(), "content", "updates");

export type Update = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
};

type Frontmatter = Record<string, string>;

function stripQuotes(value: string) {
  return value.replace(/^['\"]|['\"]$/g, "");
}

function splitFrontmatter(source: string): { frontmatter: Frontmatter; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { frontmatter: {}, body: source.trim() };
  }

  const frontmatter = match[1].split(/\r?\n/).reduce<Frontmatter>((fields, line) => {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (field) {
      fields[field[1]] = stripQuotes(field[2].trim());
    }
    return fields;
  }, {});

  return { frontmatter, body: match[2].trim() };
}

function readUpdate(filename: string): Update | null {
  const slug = filename.replace(/\.md$/, "");
  const source = readFileSync(path.join(UPDATES_DIRECTORY, filename), "utf8");
  const { frontmatter, body } = splitFrontmatter(source);

  if (frontmatter.published !== "true") {
    return null;
  }

  return {
    slug,
    title: frontmatter.title ?? slug,
    date: frontmatter.date ?? "",
    summary: frontmatter.summary ?? "",
    body,
  };
}

export function getPublishedUpdates() {
  if (!existsSync(UPDATES_DIRECTORY)) {
    return [];
  }

  return readdirSync(UPDATES_DIRECTORY)
    .filter((filename) => filename.endsWith(".md"))
    .map(readUpdate)
    .filter((update): update is Update => update !== null)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getPublishedUpdate(slug: string) {
  return getPublishedUpdates().find((update) => update.slug === slug) ?? null;
}
