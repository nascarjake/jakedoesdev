import type { AdminIdentity } from "./access";

type GameRow = {
  id: string;
  project_id: string | null;
  sort_order: number;
  title: string;
  genre: string;
  tagline: string;
  description: string;
  cover_url: string;
  cover_storage_key: string | null;
  cover_alt: string;
  play_url: string | null;
  embed_url: string | null;
  controls_hint: string | null;
  video_type: "mp4" | "youtube" | null;
  video_url: string | null;
  video_external_url: string | null;
  video_embed_notice: string | null;
  case_study_url: string | null;
  availability: "playable" | "preview" | "archive";
  published: number;
  featured: number;
  version: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type GameMediaRow = {
  id: string;
  game_id: string;
  kind: "image" | "video";
  url: string;
  storage_key: string | null;
  caption: string;
  alt_text: string;
  mime_type: string | null;
  sort_order: number;
};

type RecordValue = Record<string, unknown>;

type SafeMedia = {
  id: string;
  kind: "image" | "video";
  url: string;
  storageKey: string | null;
  caption: string;
  altText: string;
  mimeType: string | null;
};

type SafeGame = {
  id: string;
  projectId: string | null;
  sortOrder: number;
  title: string;
  genre: string;
  tagline: string;
  description: string;
  coverUrl: string;
  coverStorageKey: string | null;
  coverAlt: string;
  playUrl: string | null;
  embedUrl: string | null;
  controlsHint: string | null;
  videoType: "mp4" | "youtube" | null;
  videoUrl: string | null;
  videoExternalUrl: string | null;
  videoEmbedNotice: string | null;
  caseStudyUrl: string | null;
  availability: "playable" | "preview" | "archive";
  published: boolean;
  featured: boolean;
  version: number;
  media: SafeMedia[];
};

const GAME_SELECT = `
  SELECT id, project_id, sort_order, title, genre, tagline, description,
    cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint,
    video_type, video_url, video_external_url, video_embed_notice, case_study_url,
    availability, published, featured, version, archived_at, created_at, updated_at
  FROM games`;

const GAME_COLUMNS = `
  id, project_id, sort_order, title, genre, tagline, description, cover_url,
  cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type,
  video_url, video_external_url, video_embed_notice, case_study_url, availability,
  published, featured, version, archived_at, created_at, updated_at`;

const LOCAL_ARCADE_ASSET_PATH = /^\/arcade\/[a-z0-9][a-z0-9._/-]*$/i;
const LOCAL_UPLOADED_GAME_MEDIA_PATH = /^\/api\/games\/media\/games\/[a-z0-9][a-z0-9._/-]*$/i;
const GAME_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GAME_MEDIA_KEY = /^games\/[a-z0-9][a-z0-9._/-]*$/i;
function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function error(message: string, status = 400, extra?: RecordValue): Response {
  return json({ error: message, ...extra }, { status });
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanOptional(value: unknown, max: number): string | null {
  const result = cleanText(value, max);
  return result || null;
}

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanUrl(value: unknown): string | null {
  const candidate = cleanText(value, 2_000);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function cleanGameId(value: unknown): string | null {
  const id = cleanText(value, 80).toLowerCase();
  return GAME_ID.test(id) ? id : null;
}

function cleanStorageKey(value: unknown, gameId: string): string | null {
  const key = cleanText(value, 512);
  if (
    !key ||
    !key.startsWith(`games/${gameId}/`) ||
    key.includes("..") ||
    key.includes("//") ||
    !GAME_MEDIA_KEY.test(key)
  ) {
    return null;
  }
  return key;
}

function isSafeLocalPath(value: string): boolean {
  return !value.includes("..") && !value.includes("//");
}

function isCurrentGameMediaPath(value: string, gameId: string): boolean {
  return (
    LOCAL_UPLOADED_GAME_MEDIA_PATH.test(value) &&
    isSafeLocalPath(value) &&
    value.startsWith(`/api/games/media/games/${gameId}/`)
  );
}

function cleanGameAssetUrl(value: unknown, gameId: string): string | null {
  const candidate = cleanText(value, 2_000);
  if (!candidate) return null;
  if (LOCAL_ARCADE_ASSET_PATH.test(candidate) && isSafeLocalPath(candidate)) return candidate;
  if (isCurrentGameMediaPath(candidate, gameId)) return candidate;
  return cleanUrl(candidate);
}

function cleanVideoType(value: unknown): "mp4" | "youtube" | null {
  return value === "mp4" || value === "youtube" ? value : null;
}

function cleanAvailability(value: unknown): "playable" | "preview" | "archive" {
  if (value === "playable" || value === "archive") return value;
  return "preview";
}

function cleanVideoUrl(value: unknown, type: "mp4" | "youtube", gameId: string): string | null {
  const candidate = cleanText(value, 2_000);
  if (type === "mp4" && isCurrentGameMediaPath(candidate, gameId)) return candidate;
  const url = cleanUrl(value);
  if (!url) return null;
  if (type !== "youtube") return url;
  const parsed = new URL(url);
  if (
    parsed.hostname !== "www.youtube-nocookie.com" ||
    !/^\/embed\/[A-Za-z0-9_-]{6,}$/.test(parsed.pathname)
  ) {
    return null;
  }
  return url;
}

function cleanMp4ExternalUrl(value: unknown, gameId: string): string | null {
  const candidate = cleanText(value, 2_000);
  return isCurrentGameMediaPath(candidate, gameId) ? candidate : cleanUrl(candidate);
}

function cleanMedia(value: unknown, gameId: string): SafeMedia[] | Response {
  if (value == null) return [];
  if (!Array.isArray(value)) return error("Game media must be a list.");
  if (value.length > 30) return error("A game can have at most 30 media items.");
  const seen = new Set<string>();
  const media: SafeMedia[] = [];
  for (const [sortOrder, candidate] of value.entries()) {
    if (!isRecord(candidate)) return error(`Game media item ${sortOrder + 1} is invalid.`);
    const id = cleanText(candidate.id, 80) || crypto.randomUUID();
    if (seen.has(id)) return error("Each game media item needs a unique id.");
    seen.add(id);
    const kind = candidate.kind === "video" ? "video" : candidate.kind === "image" ? "image" : null;
    const url = cleanGameAssetUrl(candidate.url, gameId);
    const suppliedStorageKey = cleanText(candidate.storageKey, 512);
    const storageKey = suppliedStorageKey
      ? cleanStorageKey(suppliedStorageKey, gameId)
      : null;
    if (!kind || !url) return error(`Game media item ${sortOrder + 1} needs a type and a valid URL.`);
    if (suppliedStorageKey && !storageKey) {
      return error(`Game media item ${sortOrder + 1} has an invalid storage key.`);
    }
    media.push({
      id,
      kind,
      url,
      storageKey,
      caption: cleanText(candidate.caption, 300),
      altText: cleanText(candidate.altText, 300),
      mimeType: cleanOptional(candidate.mimeType, 120),
    });
  }
  return media;
}

function cleanGame(input: RecordValue): SafeGame | Response {
  const id = cleanGameId(input.id);
  const title = cleanText(input.title, 140);
  if (!id) return error("Use a lowercase, hyphenated game slug.");
  if (!title) return error("Game title is required.");

  const coverUrl = cleanGameAssetUrl(input.coverUrl, id);
  if (!coverUrl) return error("A game cover needs an HTTPS URL or a local /arcade/ asset path.");
  const suppliedCoverKey = cleanText(input.coverStorageKey, 512);
  const coverStorageKey = suppliedCoverKey ? cleanStorageKey(suppliedCoverKey, id) : null;
  if (suppliedCoverKey && !coverStorageKey) return error("The game cover has an invalid storage key.");

  const projectIdValue = cleanOptional(input.projectId, 80);
  const projectId = projectIdValue ? cleanGameId(projectIdValue) : null;
  if (projectIdValue && !projectId) return error("Linked portfolio projects need a valid slug.");

  const playUrlValue = cleanOptional(input.playUrl, 2_000);
  const playUrl = playUrlValue ? cleanUrl(playUrlValue) : null;
  if (playUrlValue && !playUrl) return error("Play links must use HTTPS.");
  const embedUrlValue = cleanOptional(input.embedUrl, 2_000);
  const embedUrl = embedUrlValue ? cleanUrl(embedUrlValue) : null;
  if (embedUrlValue && !embedUrl) return error("Embed links must use HTTPS.");
  const caseStudyValue = cleanOptional(input.caseStudyUrl, 2_000);
  const caseStudyUrl = caseStudyValue ? cleanUrl(caseStudyValue) : null;
  if (caseStudyValue && !caseStudyUrl) return error("Case-study links must use HTTPS.");

  const videoType = cleanVideoType(input.videoType);
  const videoUrlValue = cleanOptional(input.videoUrl, 2_000);
  const videoExternalValue = cleanOptional(input.videoExternalUrl, 2_000);
  if (!videoType && (videoUrlValue || videoExternalValue)) {
    return error("Choose a video type before adding video links.");
  }
  const videoUrl = videoType && videoUrlValue ? cleanVideoUrl(videoUrlValue, videoType, id) : null;
  const videoExternalUrl = videoExternalValue
    ? videoType === "mp4"
      ? cleanMp4ExternalUrl(videoExternalValue, id)
      : cleanUrl(videoExternalValue)
    : null;
  if (videoType && (!videoUrl || !videoExternalUrl)) {
    return error("Video entries need valid HTTPS preview and original URLs.");
  }
  if (videoExternalValue && !videoExternalUrl) return error("Video links must use HTTPS.");

  const media = cleanMedia(input.media, id);
  if (media instanceof Response) return media;
  return {
    id,
    projectId,
    sortOrder: Math.max(0, Math.min(9_999, Math.trunc(Number(input.sortOrder) || 0))),
    title,
    genre: cleanText(input.genre, 100),
    tagline: cleanText(input.tagline, 240),
    description: cleanText(input.description, 2_000),
    coverUrl,
    coverStorageKey,
    coverAlt: cleanText(input.coverAlt, 300),
    playUrl,
    embedUrl,
    controlsHint: cleanOptional(input.controlsHint, 500),
    videoType,
    videoUrl,
    videoExternalUrl,
    videoEmbedNotice: cleanOptional(input.videoEmbedNotice, 600),
    caseStudyUrl,
    availability: cleanAvailability(input.availability),
    published: input.published === true,
    featured: input.featured === true,
    version: Math.max(0, Math.trunc(Number(input.version) || 0)),
    media,
  };
}

function mediaDto(row: GameMediaRow) {
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    storageKey: row.storage_key,
    caption: row.caption,
    altText: row.alt_text,
    mimeType: row.mime_type,
    sortOrder: row.sort_order,
  };
}

function adminGameDto(row: GameRow, media: GameMediaRow[]) {
  return {
    id: row.id,
    projectId: row.project_id,
    sortOrder: row.sort_order,
    title: row.title,
    genre: row.genre,
    tagline: row.tagline,
    description: row.description,
    coverUrl: row.cover_url,
    coverStorageKey: row.cover_storage_key,
    coverAlt: row.cover_alt,
    playUrl: row.play_url,
    embedUrl: row.embed_url,
    controlsHint: row.controls_hint,
    videoType: row.video_type,
    videoUrl: row.video_url,
    videoExternalUrl: row.video_external_url,
    videoEmbedNotice: row.video_embed_notice,
    caseStudyUrl: row.case_study_url,
    availability: row.availability,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    version: row.version,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: media.map(mediaDto),
  };
}

function encodedKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function publicAssetUrl(request: Request, url: string, storageKey: string | null): string {
  if (storageKey) {
    return new URL(`/api/games/media/${encodedKey(storageKey)}`, request.url).toString();
  }
  return LOCAL_UPLOADED_GAME_MEDIA_PATH.test(url)
    ? new URL(url, request.url).toString()
    : url;
}

function publicGameDto(request: Request, row: GameRow, media: GameMediaRow[]) {
  const video = row.video_type && row.video_url && row.video_external_url
    ? {
        type: row.video_type,
        src: publicAssetUrl(request, row.video_url, null),
        externalUrl: publicAssetUrl(request, row.video_external_url, null),
        ...(row.video_embed_notice ? { embedNotice: row.video_embed_notice } : {}),
      }
    : undefined;
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    cover: publicAssetUrl(request, row.cover_url, row.cover_storage_key),
    coverAlt: row.cover_alt,
    tagline: row.tagline,
    description: row.description,
    screenshots: media
      .filter((item) => item.kind === "image")
      .map((item) => ({
        id: item.id,
        src: publicAssetUrl(request, item.url, item.storage_key),
        alt: item.alt_text,
        caption: item.caption,
      })),
    ...(row.play_url ? { playUrl: row.play_url } : {}),
    ...(row.embed_url ? { embedUrl: row.embed_url } : {}),
    ...(row.controls_hint ? { controlsHint: row.controls_hint } : {}),
    ...(video ? { video } : {}),
    ...(row.case_study_url ? { caseStudy: row.case_study_url } : {}),
    availability: row.availability,
  };
}

async function listGameRows(env: Env, includeDrafts: boolean): Promise<{ games: GameRow[]; media: Map<string, GameMediaRow[]> }> {
  const condition = includeDrafts
    ? "WHERE archived_at IS NULL"
    : "WHERE published = 1 AND archived_at IS NULL";
  const gameResult = await env.DB.prepare(
    `${GAME_SELECT} ${condition} ORDER BY sort_order ASC, updated_at DESC`,
  ).all<GameRow>();
  const mediaResult = await env.DB.prepare(
    `SELECT id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order
     FROM game_media ORDER BY sort_order ASC`,
  ).all<GameMediaRow>();
  const media = new Map<string, GameMediaRow[]>();
  for (const item of mediaResult.results) {
    const entries = media.get(item.game_id) ?? [];
    entries.push(item);
    media.set(item.game_id, entries);
  }
  return { games: gameResult.results, media };
}

async function getGameRow(env: Env, id: string): Promise<GameRow | null> {
  return env.DB.prepare(`${GAME_SELECT} WHERE id = ? LIMIT 1`).bind(id).first<GameRow>();
}

async function getGameSnapshot(env: Env, id: string): Promise<RecordValue | null> {
  const game = await getGameRow(env, id);
  if (!game) return null;
  const media = await env.DB.prepare(
    `SELECT id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order
     FROM game_media WHERE game_id = ? ORDER BY sort_order ASC`,
  ).bind(id).all<GameMediaRow>();
  return adminGameDto(game, media.results);
}

async function readBody(request: Request): Promise<RecordValue | Response> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 150_000) return error("Game payload is too large.", 413);
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : error("Send a valid JSON game.");
  } catch {
    return error("Send a valid JSON game.");
  }
}

async function validateLinkedProject(env: Env, projectId: string | null): Promise<Response | null> {
  if (!projectId) return null;
  const project = await env.DB.prepare(
    "SELECT id FROM projects WHERE id = ? AND archived_at IS NULL LIMIT 1",
  ).bind(projectId).first<{ id: string }>();
  return project ? null : error("Choose an existing active portfolio project before linking it.");
}

async function saveGame(
  env: Env,
  request: Request,
  identity: AdminIdentity,
  routeId?: string,
): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  if (routeId && body.id && routeId !== body.id) return error("Game slug does not match the route.");
  if (routeId) body.id = routeId;
  const game = cleanGame(body);
  if (game instanceof Response) return game;

  const linkedProjectError = await validateLinkedProject(env, game.projectId);
  if (linkedProjectError) return linkedProjectError;
  const existing = await getGameRow(env, game.id);
  if (existing && game.version !== existing.version) {
    return error("This game changed in another session. Reload before saving.", 409, {
      current: await getGameSnapshot(env, game.id),
    });
  }
  if (!existing && routeId) return error("Game not found.", 404);
  if (existing && !routeId && request.method === "POST") return error("That game slug already exists.", 409);

  const nextVersion = existing ? existing.version + 1 : 1;
  const statements: D1PreparedStatement[] = [];
  if (existing) {
    const snapshot = await getGameSnapshot(env, game.id);
    statements.push(
      env.DB.prepare(
        `INSERT INTO game_revisions (id, game_id, version, snapshot_json, edited_by)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), game.id, existing.version, JSON.stringify(snapshot), identity.email),
    );
    statements.push(
      env.DB.prepare(
        `UPDATE games SET project_id = ?, sort_order = ?, title = ?, genre = ?, tagline = ?,
          description = ?, cover_url = ?, cover_storage_key = ?, cover_alt = ?, play_url = ?,
          embed_url = ?, controls_hint = ?, video_type = ?, video_url = ?,
          video_external_url = ?, video_embed_notice = ?, case_study_url = ?, availability = ?,
          published = ?, featured = ?, version = ?, archived_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      ).bind(
        game.projectId, game.sortOrder, game.title, game.genre, game.tagline, game.description,
        game.coverUrl, game.coverStorageKey, game.coverAlt, game.playUrl, game.embedUrl,
        game.controlsHint, game.videoType, game.videoUrl, game.videoExternalUrl,
        game.videoEmbedNotice, game.caseStudyUrl, game.availability, Number(game.published),
        Number(game.featured), nextVersion, game.id,
      ),
    );
  } else {
    statements.push(
      env.DB.prepare(
        `INSERT INTO games (${GAME_COLUMNS}) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
      ).bind(
        game.id, game.projectId, game.sortOrder, game.title, game.genre, game.tagline,
        game.description, game.coverUrl, game.coverStorageKey, game.coverAlt, game.playUrl,
        game.embedUrl, game.controlsHint, game.videoType, game.videoUrl, game.videoExternalUrl,
        game.videoEmbedNotice, game.caseStudyUrl, game.availability, Number(game.published),
        Number(game.featured), nextVersion,
      ),
    );
  }
  statements.push(env.DB.prepare("DELETE FROM game_media WHERE game_id = ?").bind(game.id));
  for (const [sortOrder, item] of game.media.entries()) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO game_media
          (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        item.id, game.id, item.kind, item.url, item.storageKey, item.caption, item.altText,
        item.mimeType, sortOrder,
      ),
    );
  }
  await env.DB.batch(statements);
  return json({ game: await getGameSnapshot(env, game.id) }, { status: existing ? 200 : 201 });
}

async function archiveGame(env: Env, id: string, identity: AdminIdentity): Promise<Response> {
  const snapshot = await getGameSnapshot(env, id);
  const current = await getGameRow(env, id);
  if (!snapshot || !current) return error("Game not found.", 404);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO game_revisions (id, game_id, version, snapshot_json, edited_by)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), id, current.version, JSON.stringify(snapshot), identity.email),
    env.DB.prepare(
      "UPDATE games SET archived_at = CURRENT_TIMESTAMP, published = 0, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).bind(id),
  ]);
  return json({ archived: true });
}

async function listRevisions(env: Env, id: string): Promise<Response> {
  const revisions = await env.DB.prepare(
    `SELECT id, version, edited_by, created_at
     FROM game_revisions WHERE game_id = ? ORDER BY version DESC LIMIT 30`,
  ).bind(id).all<{ id: string; version: number; edited_by: string; created_at: string }>();
  return json({ revisions: revisions.results });
}

async function restoreRevision(
  env: Env,
  revisionId: string,
  identity: AdminIdentity,
): Promise<Response> {
  const revision = await env.DB.prepare(
    "SELECT snapshot_json FROM game_revisions WHERE id = ? LIMIT 1",
  ).bind(revisionId).first<{ snapshot_json: string }>();
  if (!revision) return error("Revision not found.", 404);
  let snapshot: unknown;
  try {
    snapshot = JSON.parse(revision.snapshot_json);
  } catch {
    return error("The saved game revision is invalid.", 500);
  }
  if (!isRecord(snapshot)) return error("The saved game revision is invalid.", 500);
  const gameId = cleanGameId(snapshot.id);
  if (!gameId) return error("The saved game revision is invalid.", 500);
  const current = await getGameRow(env, gameId);
  if (!current) return error("Game not found.", 404);
  snapshot.version = current.version;
  return saveGame(
    env,
    new Request("https://admin.local/api/admin/games/restore", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(snapshot),
    }),
    identity,
    gameId,
  );
}

async function uploadGameMedia(env: Env, request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 26_000_000) return error("Uploads are limited to 25 MB.", 413);
  const form = await request.formData();
  const file = form.get("file");
  const gameId = cleanGameId(form.get("gameId"));
  if (!(file instanceof File)) return error("Choose an image or video file.");
  if (!gameId) return error("Choose a game first.");
  if (!await getGameRow(env, gameId)) return error("Save the game before uploading media.", 409);
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return error("Only image and video uploads are supported.");
  }
  if (file.size > 25_000_000) return error("Uploads are limited to 25 MB.", 413);

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-100) || "asset";
  const key = `games/${gameId}/${crypto.randomUUID()}-${safeName}`;
  await env.PROJECT_MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: { gameId, originalName: file.name.slice(0, 200) },
  });
  return json({
    media: {
      id: crypto.randomUUID(),
      kind: file.type.startsWith("video/") ? "video" : "image",
      url: `/api/games/media/${key}`,
      storageKey: key,
      caption: file.name.replace(/\.[^.]+$/, ""),
      altText: "",
      mimeType: file.type,
      sortOrder: 0,
    },
  }, { status: 201 });
}

function publicCorsHeaders(): Headers {
  const headers = new Headers();
  // This is a published-only catalog. A wildcard lets the static GitHub Pages
  // site work on its custom domain, GitHub preview domain, and local previews
  // without treating CORS as an authentication boundary.
  headers.set("access-control-allow-origin", "*");
  return headers;
}

async function catalogEtag(games: GameRow[]): Promise<string> {
  const source = games.map((game) => `${game.id}:${game.version}:${game.updated_at}`).join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  const value = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `"${value}"`;
}

async function isPublishedGameStorageKey(env: Env, storageKey: string): Promise<boolean> {
  const localMediaUrl = `/api/games/media/${storageKey}`;
  const match = await env.DB.prepare(
    `SELECT 1
       FROM games
      WHERE published = 1
        AND archived_at IS NULL
        AND (
          cover_storage_key = ?
          OR cover_url = ?
          OR video_url = ?
          OR video_external_url = ?
        )
     UNION ALL
     SELECT 1
       FROM game_media
       INNER JOIN games ON games.id = game_media.game_id
      WHERE games.published = 1
        AND games.archived_at IS NULL
        AND (game_media.storage_key = ? OR game_media.url = ?)
      LIMIT 1`,
  ).bind(
    storageKey,
    localMediaUrl,
    localMediaUrl,
    localMediaUrl,
    storageKey,
    localMediaUrl,
  ).first<{ 1: number }>();
  return Boolean(match);
}

export async function handlePublicGames(request: Request, env: Env): Promise<Response> {
  const headers = publicCorsHeaders();
  headers.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
  headers.set("x-content-type-options", "nosniff");
  if (request.method === "OPTIONS") {
    headers.set("access-control-allow-methods", "GET, HEAD, OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
    headers.set("access-control-max-age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("allow", "GET, HEAD, OPTIONS");
    return json({ error: "Method not allowed." }, { status: 405, headers });
  }
  try {
    const { games, media } = await listGameRows(env, false);
    const etag = await catalogEtag(games);
    headers.set("etag", etag);
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers });
    }
    if (request.method === "HEAD") return new Response(null, { headers });
    return json({ catalogVersion: 1, games: games.map((game) => publicGameDto(request, game, media.get(game.id) ?? [])) }, { headers });
  } catch (caught) {
    console.error(JSON.stringify({ event: "public_games_failed", error: caught instanceof Error ? caught.message : "unknown" }));
    return json({ error: "Game catalog is temporarily unavailable." }, { status: 503, headers });
  }
}

export async function handleGameMedia(request: Request, env: Env): Promise<Response> {
  const headers = publicCorsHeaders();
  if (request.method === "OPTIONS") {
    headers.set("access-control-allow-methods", "GET, HEAD, OPTIONS");
    headers.set("access-control-allow-headers", "Range");
    headers.set("access-control-max-age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("allow", "GET, HEAD, OPTIONS");
    return json({ error: "Method not allowed." }, { status: 405, headers });
  }
  const url = new URL(request.url);
  let key: string;
  try {
    key = decodeURIComponent(url.pathname.slice("/api/games/media/".length));
  } catch {
    return json({ error: "Media not found." }, { status: 404, headers });
  }
  if (!key.startsWith("games/") || key.includes("..") || !GAME_MEDIA_KEY.test(key)) {
    return json({ error: "Media not found." }, { status: 404, headers });
  }
  try {
    if (!await isPublishedGameStorageKey(env, key)) {
      return json({ error: "Media not found." }, { status: 404, headers });
    }
  } catch (caught) {
    console.error(JSON.stringify({
      event: "public_game_media_authorization_failed",
      error: caught instanceof Error ? caught.message : "unknown",
    }));
    return json({ error: "Game media is temporarily unavailable." }, { status: 503, headers });
  }
  if (request.method === "HEAD") {
    const metadata = await env.PROJECT_MEDIA.head(key);
    if (!metadata) return json({ error: "Media not found." }, { status: 404, headers });
    metadata.writeHttpMetadata(headers);
    headers.set("etag", metadata.httpEtag);
    headers.set("accept-ranges", "bytes");
    headers.set("cache-control", "public, max-age=60, must-revalidate");
    headers.set("x-content-type-options", "nosniff");
    headers.set("content-length", String(metadata.size));
    return new Response(null, { headers });
  }
  const rangeHeader = request.headers.get("range");
  const object = await env.PROJECT_MEDIA.get(key, rangeHeader ? { range: request.headers } : undefined);
  if (!object) return json({ error: "Media not found." }, { status: 404, headers });
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=60, must-revalidate");
  headers.set("x-content-type-options", "nosniff");
  let status = 200;
  if (
    object.range &&
    "offset" in object.range &&
    typeof object.range.offset === "number" &&
    typeof object.range.length === "number"
  ) {
    status = 206;
    headers.set(
      "content-range",
      `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`,
    );
    headers.set("content-length", String(object.range.length));
  }
  return new Response(object.body, { status, headers });
}

export async function handleAdminGamesApi(
  request: Request,
  env: Env,
  identity: AdminIdentity,
): Promise<Response> {
  const path = new URL(request.url).pathname;
  try {
    if (path === "/api/admin/games" && request.method === "GET") {
      const { games, media } = await listGameRows(env, true);
      return json({ games: games.map((game) => adminGameDto(game, media.get(game.id) ?? [])) });
    }
    if (path === "/api/admin/games" && request.method === "POST") {
      return saveGame(env, request, identity);
    }
    if (path === "/api/admin/games/media" && request.method === "POST") {
      return uploadGameMedia(env, request);
    }
    const restore = path.match(/^\/api\/admin\/game-revisions\/([^/]+)\/restore$/);
    if (restore && request.method === "POST") return restoreRevision(env, restore[1], identity);
    const revisions = path.match(/^\/api\/admin\/games\/([^/]+)\/revisions$/);
    if (revisions && request.method === "GET") return listRevisions(env, revisions[1]);
    const game = path.match(/^\/api\/admin\/games\/([^/]+)$/);
    if (game && request.method === "PUT") return saveGame(env, request, identity, game[1]);
    if (game && request.method === "DELETE") return archiveGame(env, game[1], identity);
    return error("Game admin endpoint not found.", 404);
  } catch (caught) {
    console.error(JSON.stringify({
      event: "admin_games_api_failed",
      path,
      email: identity.email,
      error: caught instanceof Error ? caught.message : "unknown",
    }));
    return error("The game admin request could not be completed.", 500);
  }
}
