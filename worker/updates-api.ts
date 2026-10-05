import type { AdminIdentity } from "./access";

type UpdateRow = {
  id: string;
  title: string;
  date: string;
  summary: string;
  bullets_json: string;
  source_keys_json: string;
  published: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type UpdateInput = {
  id?: unknown;
  title?: unknown;
  date?: unknown;
  summary?: unknown;
  bullets?: unknown;
  published?: unknown;
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, { status });
}

function parseArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function dto(row: UpdateRow) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    summary: row.summary,
    bullets: parseArray(row.bullets_json),
    published: row.published === 1,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function publicDto(row: UpdateRow) {
  const { createdBy: _createdBy, ...publicUpdate } = dto(row);
  return publicUpdate;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanBullets(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const bullets = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 800))
    .filter(Boolean);
  return bullets.length === value.length ? bullets : null;
}

async function readInput(request: Request): Promise<UpdateInput | Response> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 100_000) return error("Update draft is too large.", 413);
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return error("Send an update draft object.");
    return value as UpdateInput;
  } catch {
    return error("Request body must be valid JSON.");
  }
}

function validate(input: UpdateInput) {
  const id = cleanText(input.id, 80).toLowerCase();
  const title = cleanText(input.title, 140);
  const date = cleanText(input.date, 10);
  const summary = cleanText(input.summary, 500);
  const bullets = cleanBullets(input.bullets);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return "Use a lowercase, hyphenated update slug.";
  if (!title) return "Update title is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) return "Use a valid YYYY-MM-DD date.";
  if (!summary) return "Add a short summary before saving.";
  if (!bullets) return "Keep up to 100 non-empty bullets, each under 800 characters.";
  if (input.published === true && bullets.length === 0) return "Add at least one bullet before publishing.";
  return { id, title, date, summary, bullets, published: input.published === true };
}

async function selectUpdates(env: Env, includeDrafts: boolean) {
  const rows = includeDrafts
    ? await env.DB.prepare("SELECT id, title, date, summary, bullets_json, source_keys_json, published, created_by, created_at, updated_at FROM updates ORDER BY date DESC, updated_at DESC LIMIT 100").all<UpdateRow>()
    : await env.DB.prepare("SELECT id, title, date, summary, bullets_json, source_keys_json, published, created_by, created_at, updated_at FROM updates WHERE published = 1 ORDER BY date DESC, updated_at DESC LIMIT 100").all<UpdateRow>();
  return rows.results;
}

export async function handlePublicUpdates(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") return error("Method not allowed.", 405);
  try {
    const rows = await selectUpdates(env, false);
    return json({ updates: rows.map(publicDto) });
  } catch (caught) {
    console.error(JSON.stringify({ event: "public_updates_failed", error: caught instanceof Error ? caught.message : "unknown" }));
    return error("Published updates could not be loaded.", 500);
  }
}

async function createUpdate(request: Request, env: Env, identity: AdminIdentity): Promise<Response> {
  const input = await readInput(request);
  if (input instanceof Response) return input;
  const clean = validate(input);
  if (typeof clean === "string") return error(clean);
  if (clean.published) return error("Save the draft first, then use Approve & publish.");
  try {
    await env.DB.prepare(`INSERT INTO updates (id, title, date, summary, bullets_json, published, created_by)
      VALUES (?, ?, ?, ?, ?, 0, ?)`)
      .bind(clean.id, clean.title, clean.date, clean.summary, JSON.stringify(clean.bullets), identity.email)
      .run();
    const row = await env.DB.prepare("SELECT * FROM updates WHERE id = ?").bind(clean.id).first<UpdateRow>();
    return json({ update: row ? dto(row) : null }, { status: 201 });
  } catch (caught) {
    const duplicate = caught instanceof Error && caught.message.includes("UNIQUE constraint failed");
    return error(duplicate ? "An update with that slug already exists." : "The update draft could not be saved.", duplicate ? 409 : 500);
  }
}

async function saveUpdate(request: Request, env: Env, id: string): Promise<Response> {
  const input = await readInput(request);
  if (input instanceof Response) return input;
  const clean = validate({ ...input, id });
  if (typeof clean === "string") return error(clean);
  try {
    const result = await env.DB.prepare(`UPDATE updates
      SET title = ?, date = ?, summary = ?, bullets_json = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .bind(clean.title, clean.date, clean.summary, JSON.stringify(clean.bullets), clean.published ? 1 : 0, id)
      .run();
    if (result.meta.changes === 0) return error("Update draft not found.", 404);
    const row = await env.DB.prepare("SELECT * FROM updates WHERE id = ?").bind(id).first<UpdateRow>();
    return json({ update: row ? dto(row) : null });
  } catch (caught) {
    console.error(JSON.stringify({ event: "save_update_failed", id, error: caught instanceof Error ? caught.message : "unknown" }));
    return error("The update could not be saved.", 500);
  }
}

export async function handleAdminUpdates(
  request: Request,
  env: Env,
  _identity: AdminIdentity,
): Promise<Response> {
  const path = new URL(request.url).pathname;
  try {
    if (path === "/api/admin/updates" && request.method === "GET") {
      const rows = await selectUpdates(env, true);
      return json({ updates: rows.map(dto) });
    }
    if (path === "/api/admin/updates" && request.method === "POST") {
      return createUpdate(request, env, _identity);
    }
    const update = path.match(/^\/api\/admin\/updates\/([^/]+)$/);
    if (update && request.method === "PUT") {
      return saveUpdate(request, env, decodeURIComponent(update[1]));
    }
    if (update && request.method === "DELETE") {
      const result = await env.DB.prepare("DELETE FROM updates WHERE id = ? AND published = 0").bind(decodeURIComponent(update[1])).run();
      return result.meta.changes ? json({ deleted: true }) : error("Only unpublished drafts can be deleted.", 409);
    }
    return error("Update admin endpoint not found.", 404);
  } catch (caught) {
    console.error(JSON.stringify({ event: "admin_updates_failed", path, error: caught instanceof Error ? caught.message : "unknown" }));
    return error("The update request could not be completed.", 500);
  }
}
