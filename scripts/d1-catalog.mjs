#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

export const ACCOUNT_ID = "01f53095bb8f6eec6d75040c4232602a";
export const DATABASE_ID = "26609868-e1a1-42b7-a650-5f077b911d4a";
const API_ROOT = "https://api.cloudflare.com/client/v4";
const FIELD_LIMITS = Object.freeze({ tagline: 300, description: 10_000, controls_hint: 500 });
const GAME_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REVIEWED_GAME_IDS = new Set(["orbital-smash", "revo", "downbeat", "dye-day", "daho", "rack-ruin", "pinfall", "netrunner", "rift-riot", "millionaire", "fortune-quest"]);

function assertSafeGameId(id) {
  if (typeof id !== "string" || !GAME_ID.test(id) || id.length > 80) {
    throw new Error("Provide one valid catalog game id.");
  }
}

function assertVersion(version) {
  if (!Number.isSafeInteger(version) || version < 1) throw new Error("Provide the expected current game version.");
}

export function validateChanges(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new Error("Changes must be a JSON object of approved catalog fields.");
  }
  const keys = Object.keys(changes);
  if (!keys.length || keys.some((key) => !Object.hasOwn(FIELD_LIMITS, key))) {
    throw new Error("Only tagline, description, and controls_hint can be updated by this tool.");
  }
  for (const [key, value] of Object.entries(changes)) {
    if (typeof value !== "string" || value.length > FIELD_LIMITS[key]) {
      throw new Error(`${key} must be text no longer than ${FIELD_LIMITS[key]} characters.`);
    }
  }
  return changes;
}

function requireToken(token) {
  if (typeof token !== "string" || token.trim().length < 20) {
    throw new Error("Set CLOUDFLARE_D1_API_TOKEN in the protected workflow environment. Token values are never printed.");
  }
  return token.trim();
}

export function assertD1AuthMode(mode, env = process.env) {
  if (mode !== "api-token") throw new Error("Set D1_CATALOG_AUTH_MODE=api-token explicitly for this D1-only tool.");
  if (env.CLOUDFLARE_AUTH_MODE || env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_KEY || env.CLOUDFLARE_EMAIL) {
    throw new Error("The D1 API-token tool refuses Wrangler profile or generic Cloudflare credentials; use only CLOUDFLARE_D1_API_TOKEN.");
  }
}

function unpackQuery(body) {
  if (!body || body.success !== true || !Array.isArray(body.result) || body.result[0]?.success === false) {
    throw new Error("Cloudflare D1 request failed; response details were omitted.");
  }
  return body.result[0]?.results ?? [];
}

export async function queryD1(sql, params, { authMode, token, fetchImpl = fetch } = {}) {
  assertD1AuthMode(authMode);
  const secret = requireToken(token);
  let response;
  try {
    response = await fetchImpl(`${API_ROOT}/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ sql, params }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error("Could not reach Cloudflare D1; response details were omitted.");
  }
  if (!response.ok) throw new Error(`Cloudflare D1 request failed with HTTP ${response.status}; response details were omitted.`);
  let body;
  try { body = await response.json(); } catch { throw new Error("Cloudflare D1 returned unreadable JSON."); }
  return unpackQuery(body);
}

export async function readGame(id, options) {
  assertSafeGameId(id);
  const rows = await queryD1("SELECT * FROM games WHERE id = ? LIMIT 2", [id], options);
  if (rows.length !== 1 || rows[0].id !== id) throw new Error("The requested game did not resolve to exactly one catalog row.");
  return rows[0];
}

export async function listGames(options) {
  return queryD1("SELECT id, title, tagline, description, controls_hint, version, published, availability FROM games ORDER BY sort_order, id", [], options);
}

export function safeReceipts(result) {
  const rows = Array.isArray(result) ? result : [result];
  return rows.map(({ id: gameId, title, version, published, availability, description, tagline, controls_hint: controlsHint }) => ({
    id: gameId,
    title,
    version,
    published: Boolean(published),
    availability,
    hasDescription: typeof description === "string" && description.length > 0,
    descriptionLength: typeof description === "string" ? description.length : 0,
    hasFeaturesSection: typeof description === "string" && /^Features:\s*$/m.test(description),
    hasTagline: typeof tagline === "string" && tagline.length > 0,
    hasControlsHint: typeof controlsHint === "string" && controlsHint.length > 0,
  }));
}

function revisionSnapshot(game, media) {
  return {
    id: game.id,
    projectId: game.project_id,
    sortOrder: game.sort_order,
    title: game.title,
    genre: game.genre,
    tagline: game.tagline,
    description: game.description,
    coverUrl: game.cover_url,
    coverStorageKey: game.cover_storage_key,
    coverAlt: game.cover_alt,
    playUrl: game.play_url,
    embedUrl: game.embed_url,
    controlsHint: game.controls_hint,
    videoType: game.video_type,
    videoUrl: game.video_url,
    videoExternalUrl: game.video_external_url,
    videoEmbedNotice: game.video_embed_notice,
    caseStudyUrl: game.case_study_url,
    availability: game.availability,
    published: Boolean(game.published),
    featured: Boolean(game.featured),
    version: game.version,
    archivedAt: game.archived_at,
    createdAt: game.created_at,
    updatedAt: game.updated_at,
    media: media.map((item) => ({
      id: item.id,
      kind: item.kind,
      url: item.url,
      storageKey: item.storage_key,
      caption: item.caption,
      altText: item.alt_text,
      mimeType: item.mime_type,
      sortOrder: item.sort_order,
    })),
  };
}

export async function updateGame({ id, expectedVersion, changes, token, fetchImpl = fetch }) {
  assertSafeGameId(id);
  assertVersion(expectedVersion);
  validateChanges(changes);
  const before = await readGame(id, { authMode: "api-token", token, fetchImpl });
  if (before.version !== expectedVersion) throw new Error("The game changed since it was reviewed. Read it again before preparing an update.");
  const media = await queryD1("SELECT id, kind, url, storage_key, caption, alt_text, mime_type, sort_order FROM game_media WHERE game_id = ? ORDER BY sort_order", [id], {
    authMode: "api-token", token, fetchImpl,
  });
  const snapshot = revisionSnapshot(before, media);
  const revisionId = randomUUID();
  await queryD1("INSERT INTO game_revisions (id, game_id, version, snapshot_json, edited_by) VALUES (?, ?, ?, ?, ?)",
    [revisionId, id, expectedVersion, JSON.stringify(snapshot), "manual-d1-catalog"], { authMode: "api-token", token, fetchImpl });
  const assignments = Object.keys(changes).map((field) => `${field} = ?`).join(", ");
  const values = Object.values(changes);
  await queryD1(`UPDATE games SET ${assignments}, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?`,
    [...values, id, expectedVersion], { authMode: "api-token", token, fetchImpl });
  const after = await readGame(id, { authMode: "api-token", token, fetchImpl });
  if (after.version !== expectedVersion + 1 || Object.entries(changes).some(([key, value]) => after[key] !== value)) {
    throw new Error("Post-write verification failed. The before-image was saved in the D1 game revision history; inspect it before any recovery action.");
  }
  return { id, version: after.version, changedFields: Object.keys(changes), revisionId, revisionSaved: true, verified: true };
}

export function validateBatchUpdates(updates) {
  if (!Array.isArray(updates) || updates.length !== 11) throw new Error("A catalog batch must contain exactly the 11 reviewed games.");
  const seen = new Set();
  for (const item of updates) {
    if (!item || typeof item !== "object" || Array.isArray(item) || Object.keys(item).some((key) => !["id", "expectedVersion", "changes"].includes(key))) {
      throw new Error("Each batch entry must contain only id, expectedVersion, and changes.");
    }
    assertSafeGameId(item.id);
    if (!REVIEWED_GAME_IDS.has(item.id)) throw new Error("A catalog batch may update only the 11 reviewed Goose Games ids.");
    if (seen.has(item.id)) throw new Error("A catalog batch cannot contain duplicate game ids.");
    seen.add(item.id);
    assertVersion(item.expectedVersion);
    validateChanges(item.changes);
  }
  if (seen.size !== REVIEWED_GAME_IDS.size || [...REVIEWED_GAME_IDS].some((id) => !seen.has(id))) {
    throw new Error("A catalog batch must contain the exact 11 reviewed Goose Games ids.");
  }
  return updates;
}

export async function updateGamesBatch({ updates, token, fetchImpl = fetch }) {
  const items = validateBatchUpdates(updates);
  const prepared = [];
  // Read and version-check every game before creating any backup or changing text.
  for (const item of items) {
    const before = await readGame(item.id, { authMode: "api-token", token, fetchImpl });
    if (before.version !== item.expectedVersion) throw new Error(`Batch preflight failed: catalog game '${item.id}' changed since review; no descriptions were updated.`);
    const media = await queryD1("SELECT id, kind, url, storage_key, caption, alt_text, mime_type, sort_order FROM game_media WHERE game_id = ? ORDER BY sort_order", [item.id], {
      authMode: "api-token", token, fetchImpl,
    });
    prepared.push({ item, before, media, revisionId: randomUUID() });
  }
  // Save all private D1 before-images before the first game row is updated.
  for (const { item, before, media, revisionId } of prepared) {
    await queryD1("INSERT INTO game_revisions (id, game_id, version, snapshot_json, edited_by) VALUES (?, ?, ?, ?, ?)",
      [revisionId, item.id, item.expectedVersion, JSON.stringify(revisionSnapshot(before, media)), "manual-d1-catalog-batch"], { authMode: "api-token", token, fetchImpl });
  }
  const results = [];
  for (const { item, revisionId } of prepared) {
    const assignments = Object.keys(item.changes).map((field) => `${field} = ?`).join(", ");
    await queryD1(`UPDATE games SET ${assignments}, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?`,
      [...Object.values(item.changes), item.id, item.expectedVersion], { authMode: "api-token", token, fetchImpl });
    const after = await readGame(item.id, { authMode: "api-token", token, fetchImpl });
    if (after.version !== item.expectedVersion + 1 || Object.entries(item.changes).some(([key, value]) => after[key] !== value)) {
      throw new Error(`Post-write verification failed for catalog game '${item.id}'. The before-image is saved in D1 revision ${revisionId}; inspect it before recovery.`);
    }
    results.push({ id: item.id, version: after.version, changedFields: Object.keys(item.changes), revisionId, revisionSaved: true, verified: true });
  }
  return results;
}

function parseJsonInput(value, label) {
  try { return JSON.parse(value); } catch { throw new Error(`${label} must be valid JSON.`); }
}

async function main() {
  const operation = process.env.D1_CATALOG_OPERATION || "read";
  const authMode = process.env.D1_CATALOG_AUTH_MODE;
  assertD1AuthMode(authMode);
  const token = process.env.CLOUDFLARE_D1_API_TOKEN;
  if (operation === "read") {
    const id = process.env.D1_CATALOG_GAME_ID;
    const result = id ? await readGame(id, { authMode, token }) : await listGames({ authMode, token });
    console.log(JSON.stringify(safeReceipts(result), null, 2));
    return;
  }
  if (operation === "update") {
    const changes = parseJsonInput(process.env.D1_CATALOG_CHANGES_JSON || "", "D1_CATALOG_CHANGES_JSON");
    const result = await updateGame({ id: process.env.D1_CATALOG_GAME_ID, expectedVersion: Number(process.env.D1_CATALOG_EXPECTED_VERSION), changes, token });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (operation === "batch") {
    const updates = parseJsonInput(process.env.D1_CATALOG_BATCH_JSON || "", "D1_CATALOG_BATCH_JSON");
    const result = await updateGamesBatch({ updates, token });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  throw new Error("Allowed operations are read, update, and one reviewed 11-game batch. Read is the default.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "D1 catalog operation failed.");
    process.exitCode = 1;
  });
}
