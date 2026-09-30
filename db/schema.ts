import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    sortOrder: integer("sort_order").notNull().default(0),
    title: text("title").notNull(),
    eyebrow: text("eyebrow").notNull().default(""),
    summary: text("summary").notNull().default(""),
    storyHtml: text("story_html").notNull().default(""),
    role: text("role").notNull().default(""),
    year: text("year").notNull().default(""),
    stackJson: text("stack_json").notNull().default("[]"),
    signal: text("signal").notNull().default("PRJ"),
    accent: text("accent", { enum: ["acid", "amber", "ice"] })
      .notNull()
      .default("acid"),
    category: text("category").notNull().default("SaaS"),
    status: text("status").notNull().default("Draft"),
    highlightsJson: text("highlights_json").notNull().default("[]"),
    scope: text("scope").notNull().default(""),
    ownershipJson: text("ownership_json").notNull().default("[]"),
    systemsJson: text("systems_json").notNull().default("[]"),
    note: text("note"),
    sourceLabel: text("source_label"),
    sourceUrl: text("source_url"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    version: integer("version").notNull().default(1),
    archivedAt: text("archived_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("projects_published_sort_idx").on(
      table.published,
      table.archivedAt,
      table.sortOrder,
    ),
  ],
);

export const projectMedia = sqliteTable(
  "project_media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["video", "image"] }).notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    posterUrl: text("poster_url"),
    caption: text("caption").notNull().default(""),
    altText: text("alt_text").notNull().default(""),
    mimeType: text("mime_type"),
    sortOrder: integer("sort_order").notNull().default(0),
    autoplay: integer("autoplay", { mode: "boolean" }).notNull().default(true),
    preload: text("preload", { enum: ["none", "metadata", "auto"] })
      .notNull()
      .default("metadata"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("project_media_project_sort_idx").on(table.projectId, table.kind, table.sortOrder)],
);

export const projectRevisions = sqliteTable(
  "project_revisions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    editedBy: text("edited_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("project_revisions_project_idx").on(table.projectId, table.version)],
);

// Games are intentionally separate from portfolio projects: a game can have an
// optional production-project companion, while smaller arcade releases stay out
// of the shipped-products directory.
export const games = sqliteTable(
  "games",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    title: text("title").notNull(),
    genre: text("genre").notNull().default(""),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    coverStorageKey: text("cover_storage_key"),
    coverAlt: text("cover_alt").notNull().default(""),
    playUrl: text("play_url"),
    embedUrl: text("embed_url"),
    controlsHint: text("controls_hint"),
    videoType: text("video_type", { enum: ["mp4", "youtube"] }),
    videoUrl: text("video_url"),
    videoExternalUrl: text("video_external_url"),
    videoEmbedNotice: text("video_embed_notice"),
    caseStudyUrl: text("case_study_url"),
    availability: text("availability", {
      enum: ["playable", "preview", "archive"],
    })
      .notNull()
      .default("preview"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    version: integer("version").notNull().default(1),
    archivedAt: text("archived_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("games_published_sort_idx").on(
      table.published,
      table.archivedAt,
      table.sortOrder,
    ),
    index("games_cover_storage_key_idx").on(table.coverStorageKey),
    uniqueIndex("games_project_idx").on(table.projectId),
  ],
);

export const gameMedia = sqliteTable(
  "game_media",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["image", "video"] }).notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    caption: text("caption").notNull().default(""),
    altText: text("alt_text").notNull().default(""),
    mimeType: text("mime_type"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("game_media_game_sort_idx").on(table.gameId, table.sortOrder),
    index("game_media_storage_key_idx").on(table.storageKey),
  ],
);

export const gameRevisions = sqliteTable(
  "game_revisions",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    editedBy: text("edited_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("game_revisions_game_idx").on(table.gameId, table.version)],
);

export const updates = sqliteTable(
  "updates",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    summary: text("summary").notNull().default(""),
    bulletsJson: text("bullets_json").notNull().default("[]"),
    sourceKeysJson: text("source_keys_json").notNull().default("[]"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("updates_published_date_idx").on(table.published, table.date)],
);
