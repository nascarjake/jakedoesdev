"use client";
/* eslint-disable @next/next/no-img-element -- editor previews may point at an external game asset */

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminPanel.module.css";

type Screenshot = {
  id?: string;
  src: string;
  alt: string;
  storageKey?: string | null;
  caption?: string;
  mimeType?: string | null;
};

type Video = {
  type: "mp4" | "youtube";
  src: string;
  externalUrl: string;
  embedNotice?: string;
};

type Game = {
  id: string;
  sortOrder: number;
  title: string;
  genre: string;
  tagline: string;
  description: string;
  cover: string;
  coverAlt: string;
  coverStorageKey: string | null;
  screenshots: Screenshot[];
  playUrl: string;
  embedUrl: string;
  controlsHint: string;
  video: Video | null;
  caseStudy: string;
  portfolioProjectId: string | null;
  availability: "playable" | "preview" | "archive";
  published: boolean;
  featured: boolean;
  version: number;
};

type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  published: boolean;
};

type ApiError = { error?: string };

class ApiRequestError extends Error {
  readonly status: number;
  readonly current: unknown;

  constructor(message: string, status: number, current?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.current = current;
  }
}

const emptyGame = (sortOrder = 0): Game => ({
  id: "",
  sortOrder,
  title: "",
  genre: "",
  tagline: "",
  description: "",
  cover: "",
  coverAlt: "",
  coverStorageKey: null,
  screenshots: [],
  playUrl: "",
  embedUrl: "",
  controlsHint: "",
  video: null,
  caseStudy: "",
  portfolioProjectId: null,
  availability: "preview",
  published: false,
  featured: false,
  version: 0,
});

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "x-portfolio-admin": "1",
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as ApiError & T & { current?: unknown };
  if (!response.ok) throw new ApiRequestError(body.error ?? `Request failed (${response.status})`, response.status, body.current);
  return body;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function screenshotFromApi(value: unknown): Screenshot | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const src = stringValue(item.url ?? item.src);
  if (!src || (item.kind !== undefined && item.kind !== "image")) return null;
  return {
    ...(stringValue(item.id) ? { id: stringValue(item.id) } : {}),
    src,
    alt: stringValue(item.altText ?? item.alt),
    ...(typeof item.storageKey === "string" ? { storageKey: item.storageKey } : {}),
    ...(stringValue(item.caption) ? { caption: stringValue(item.caption) } : {}),
    ...(typeof item.mimeType === "string" ? { mimeType: item.mimeType } : {}),
  };
}

function videoFromApi(value: unknown): Video | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const type = item.type === "youtube" ? "youtube" : item.type === "mp4" ? "mp4" : null;
  const src = stringValue(item.src);
  if (!type || !src) return null;
  const externalUrl = stringValue(item.externalUrl);
  const embedNotice = stringValue(item.embedNotice);
  return { type, src, externalUrl, ...(embedNotice ? { embedNotice } : {}) };
}

function gameFromApi(value: unknown): Game {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const rawScreenshots = Array.isArray(item.media)
    ? item.media
    : Array.isArray(item.screenshots)
      ? item.screenshots
      : [];
  const rawProjectId = item.projectId ?? item.portfolioProjectId;
  const video = videoFromApi(item.video) ?? videoFromApi({
    type: item.videoType,
    src: item.videoUrl,
    externalUrl: item.videoExternalUrl,
    embedNotice: item.videoEmbedNotice,
  });
  return {
    id: stringValue(item.id),
    sortOrder: numberValue(item.sortOrder),
    title: stringValue(item.title),
    genre: stringValue(item.genre),
    tagline: stringValue(item.tagline),
    description: stringValue(item.description),
    cover: stringValue(item.coverUrl ?? item.cover),
    coverAlt: stringValue(item.coverAlt),
    coverStorageKey: typeof item.coverStorageKey === "string" ? item.coverStorageKey : null,
    screenshots: rawScreenshots.map(screenshotFromApi).filter((screenshot): screenshot is Screenshot => Boolean(screenshot)),
    playUrl: stringValue(item.playUrl),
    embedUrl: stringValue(item.embedUrl),
    controlsHint: stringValue(item.controlsHint),
    video,
    caseStudy: stringValue(item.caseStudyUrl ?? item.caseStudy),
    portfolioProjectId: typeof rawProjectId === "string" && rawProjectId ? rawProjectId : null,
    availability: item.availability === "playable" || item.availability === "archive" ? item.availability : "preview",
    published: item.published === true,
    featured: item.featured === true,
    version: numberValue(item.version),
  };
}

function gameToApi(game: Game) {
  return {
    id: game.id,
    sortOrder: game.sortOrder,
    title: game.title,
    genre: game.genre,
    tagline: game.tagline,
    description: game.description,
    projectId: game.portfolioProjectId,
    coverUrl: game.cover,
    coverStorageKey: game.coverStorageKey,
    coverAlt: game.coverAlt,
    playUrl: game.playUrl || null,
    embedUrl: game.embedUrl || null,
    controlsHint: game.controlsHint || null,
    videoType: game.video?.type ?? null,
    videoUrl: game.video?.src ?? null,
    videoExternalUrl: game.video?.externalUrl ?? null,
    videoEmbedNotice: game.video?.embedNotice ?? null,
    caseStudyUrl: game.caseStudy || null,
    availability: game.availability,
    published: game.published,
    featured: game.featured,
    version: game.version,
    media: game.screenshots.map((screenshot, sortOrder) => ({
      ...(screenshot.id ? { id: screenshot.id } : {}),
      kind: "image",
      url: screenshot.src,
      storageKey: screenshot.storageKey ?? null,
      caption: screenshot.caption ?? "",
      altText: screenshot.alt,
      mimeType: screenshot.mimeType ?? null,
      sortOrder,
    })),
  };
}

function projectFromApi(value: unknown): PortfolioProject | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const id = stringValue(item.id);
  const title = stringValue(item.title);
  return id && title
    ? { id, title, category: stringValue(item.category), published: item.published === true }
    : null;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sortGames(games: Game[]) {
  return [...games].sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function GameStudio() {
  const [games, setGames] = useState<Game[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const loadGames = useCallback(async (selectId?: string) => {
    const [gamesResponse, projectsResponse] = await Promise.all([
      api<{ games: unknown[] }>("/api/admin/games"),
      api<{ projects: unknown[] }>("/api/admin/projects"),
    ]);
    const nextGames = sortGames(gamesResponse.games.map(gameFromApi));
    const nextProjects = projectsResponse.projects
      .map(projectFromApi)
      .filter((project): project is PortfolioProject => Boolean(project))
      .sort((left, right) => left.title.localeCompare(right.title));
    setGames(nextGames);
    setProjects(nextProjects);
    setGame((current) => {
      const id = selectId ?? current?.id;
      return nextGames.find((item) => item.id === id) ?? nextGames[0] ?? null;
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGames()
        .catch((caught: Error) => setNotice({
          type: "error",
          text: caught.message.includes("(404)")
            ? "The Games API is not deployed yet. Publish the worker update, then reload this page."
            : caught.message,
        }))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadGames]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const update = <K extends keyof Game>(key: K, value: Game[K]) => {
    setGame((current) => current ? { ...current, [key]: value } : current);
    setDirty(true);
    setNotice(null);
  };

  const select = (next: Game) => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setGame(next);
    setDirty(false);
    setNotice(null);
  };

  const newGame = () => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    const lastGame = games[games.length - 1];
    setGame(emptyGame((lastGame?.sortOrder ?? -1) + 1));
    setDirty(true);
    setNotice(null);
  };

  const save = useCallback(async () => {
    if (!game || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const path = game.version ? `/api/admin/games/${encodeURIComponent(game.id)}` : "/api/admin/games";
      const response = await api<{ game: unknown }>(path, {
        method: game.version ? "PUT" : "POST",
        body: JSON.stringify(gameToApi(game)),
      });
      const saved = gameFromApi(response.game);
      setGame(saved);
      setDirty(false);
      await loadGames(saved.id);
      setNotice({
        type: "success",
        text: saved.published ? "Game saved and queued for Goose Games." : "Game draft saved.",
      });
    } catch (caught) {
      if (caught instanceof ApiRequestError && caught.status === 409 && caught.current) {
        setGame(gameFromApi(caught.current));
        setDirty(false);
        setNotice({ type: "error", text: "This game changed in another session. The latest version is loaded; review it before saving again." });
        return;
      }
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }, [game, loadGames, saving]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [save]);

  const remove = async () => {
    if (!game?.version || !window.confirm(`Delete “${game.title || game.id}”? This removes it from the Goose Games catalogue.`)) return;
    try {
      await api(`/api/admin/games/${encodeURIComponent(game.id)}`, { method: "DELETE", body: "{}" });
      setDirty(false);
      await loadGames();
      setNotice({ type: "success", text: "Game removed from the catalogue." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Delete failed." });
    }
  };

  const updateScreenshot = (index: number, patch: Partial<Screenshot>) => {
    if (!game) return;
    update("screenshots", game.screenshots.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return games.filter((item) => `${item.title} ${item.genre} ${item.tagline}`.toLowerCase().includes(normalized));
  }, [games, query]);

  if (loading) return <main className={styles.shell}><div className={styles.loading}><div><div className={styles.mark}>GG</div><h1>Opening Goose Games catalogue…</h1></div></div></main>;

  return <main className={styles.shell}>
    <header className={styles.topbar}>
      <div className={styles.brand}><span className={styles.mark}>GG</span><div><strong>Goose Games catalogue</strong><span>One list for goosegames.dev</span></div></div>
      <div className={styles.topActions}>
        <a className={styles.ghost} href="/admin/">Project Studio</a>
        <a className={styles.ghost} href="https://goosegames.dev" target="_blank" rel="noreferrer">View Goose Games ↗</a>
        <div className={styles.saveCluster}><span className={styles.status}>{dirty ? "UNSAVED" : game?.version ? `SAVED · V${game.version}` : "NEW GAME"}</span><button className={styles.button} type="button" disabled={!game || saving} onClick={() => void save()}>{saving ? "Saving…" : game?.published ? "Save & publish" : "Save draft"}</button></div>
      </div>
    </header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <button className={styles.button} type="button" onClick={newGame}>+ New game</button>
        <input className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games…" />
        <div className={styles.projectList}>
          {filtered.map((item) => <button type="button" className={styles.projectItem} data-active={game?.id === item.id} onClick={() => select(item)} key={item.id}>
            <div><strong>{item.title || item.id}</strong><span>{item.genre || "Uncategorized"}</span></div><i className={`${styles.dot} ${item.published ? styles.published : ""}`} />
          </button>)}
        </div>
      </aside>
      {game ? <section className={styles.main}>
        {notice && <div className={notice.type === "error" ? styles.error : styles.success}>{notice.text}</div>}
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Catalog identity</h2><p>Published games become the public catalogue for goosegames.dev.</p></header><div className={styles.sectionBody}>
          <label className={styles.label}>Title<input className={styles.input} value={game.title} onChange={(event) => { update("title", event.target.value); if (!game.version && (!game.id || game.id === slugify(game.title))) update("id", slugify(event.target.value)); }} /></label>
          <div className={styles.grid3}><label className={styles.label}>Slug<input className={`${styles.input} ${styles.slug}`} value={game.id} disabled={Boolean(game.version)} onChange={(event) => update("id", slugify(event.target.value))} /></label><label className={styles.label}>Sort order<input className={styles.input} type="number" value={game.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label><label className={styles.label}>Genre<input className={styles.input} value={game.genre} onChange={(event) => update("genre", event.target.value)} /></label></div>
          <label className={styles.label}>Tagline<input className={styles.input} value={game.tagline} onChange={(event) => update("tagline", event.target.value)} placeholder="A concise hook for the game card" /></label>
          <label className={styles.label}>Description<textarea className={styles.textarea} value={game.description} onChange={(event) => update("description", event.target.value)} placeholder="What players do, what makes it memorable, and why it exists." /></label>
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Artwork and play</h2><p>Use public, stable asset URLs. The cover anchors the game card; screenshots enrich its game page.</p></header><div className={styles.sectionBody}>
          <div className={styles.grid2}><label className={styles.label}>Cover image URL<input className={styles.input} type="text" inputMode="url" value={game.cover} onChange={(event) => update("cover", event.target.value)} placeholder="https://… or /arcade/…" /></label><label className={styles.label}>Cover alt text<input className={styles.input} value={game.coverAlt} onChange={(event) => update("coverAlt", event.target.value)} placeholder="Describe the cover artwork" /></label></div>
          <div className={styles.grid2}><label className={styles.label}>Play URL<input className={styles.input} type="url" value={game.playUrl} onChange={(event) => update("playUrl", event.target.value)} placeholder="https://play.example" /></label><label className={styles.label}>Embeddable game URL<input className={styles.input} type="url" value={game.embedUrl} onChange={(event) => update("embedUrl", event.target.value)} placeholder="https://embed.example" /></label></div>
          <label className={styles.label}>Controls hint<input className={styles.input} value={game.controlsHint} onChange={(event) => update("controlsHint", event.target.value)} placeholder="Mouse or touch controls." /></label>
          <div className={styles.list}>
            <div className={styles.row}><strong>Screenshots</strong><button className={styles.ghost} type="button" onClick={() => update("screenshots", [...game.screenshots, { src: "", alt: "" }])}>+ Add screenshot</button></div>
            {game.screenshots.length === 0 && <p className={styles.hint}>No screenshots yet. A cover-only game is fine while it is in progress.</p>}
            {game.screenshots.map((screenshot, index) => <div className={styles.listRow} key={`${screenshot.src}-${index}`}><div className={styles.grid2}><input className={styles.input} type="text" inputMode="url" value={screenshot.src} onChange={(event) => updateScreenshot(index, { src: event.target.value })} placeholder="Screenshot URL" /><input className={styles.input} value={screenshot.alt} onChange={(event) => updateScreenshot(index, { alt: event.target.value })} placeholder="Describe the actual screen" /></div><button className={styles.iconButton} type="button" aria-label="Remove screenshot" onClick={() => update("screenshots", game.screenshots.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}
          </div>
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Video preview</h2><p>Optional. Use an MP4 preview or a YouTube embed. The external URL gives players a reliable fallback.</p></header><div className={styles.sectionBody}>
          <label className={styles.check}><input type="checkbox" checked={Boolean(game.video)} onChange={(event) => update("video", event.target.checked ? { type: "mp4", src: "", externalUrl: "" } : null)} /> Include a video preview</label>
          {game.video && <><div className={styles.grid3}><label className={styles.label}>Type<select className={styles.select} value={game.video.type} onChange={(event) => update("video", { ...game.video!, type: event.target.value as Video["type"] })}><option value="mp4">MP4</option><option value="youtube">YouTube</option></select></label><label className={styles.label} style={{ gridColumn: "span 2" }}>Embed / video URL<input className={styles.input} type="url" value={game.video.src} onChange={(event) => update("video", { ...game.video!, src: event.target.value })} placeholder={game.video.type === "youtube" ? "https://www.youtube-nocookie.com/embed/…" : "https://…/preview.mp4"} /></label></div><label className={styles.label}>External video URL<input className={styles.input} type="url" value={game.video.externalUrl} onChange={(event) => update("video", { ...game.video!, externalUrl: event.target.value })} placeholder="https://youtu.be/… or a direct video URL" /></label><label className={styles.label}>Embed notice <span className={styles.muted}>(optional)</span><input className={styles.input} value={game.video.embedNotice ?? ""} onChange={(event) => { const embedNotice = event.target.value; update("video", { ...game.video!, ...(embedNotice ? { embedNotice } : {}) }); }} placeholder="Explain why this preview must be watched elsewhere, if needed." /></label></>}
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Portfolio connection</h2><p>Only substantial games need a companion in the production-products portfolio. The rest can live solely on Goose Games.</p></header><div className={styles.sectionBody}>
          <label className={styles.label}>Portfolio companion<select className={styles.select} value={game.portfolioProjectId ?? ""} onChange={(event) => update("portfolioProjectId", event.target.value || null)}><option value="">No companion — Goose Games only</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}{project.published ? "" : " (draft)"}{project.category ? ` · ${project.category}` : ""}</option>)}</select></label>
          <label className={styles.label}>Case study URL <span className={styles.muted}>(optional)</span><input className={styles.input} type="url" value={game.caseStudy} onChange={(event) => update("caseStudy", event.target.value)} placeholder="https://jakedoesdev.com/universe/#rack-ruin" /></label>
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Publishing</h2><p>A game remains private until this is enabled and saved.</p></header><div className={styles.sectionBody}><div className={styles.grid2}><label className={styles.label}>Availability<select className={styles.select} value={game.availability} onChange={(event) => update("availability", event.target.value as Game["availability"])}><option value="playable">Playable</option><option value="preview">Preview</option><option value="archive">Archive</option></select></label><div className={styles.checks}><label className={styles.check}><input type="checkbox" checked={game.published} onChange={(event) => update("published", event.target.checked)} /> Publish to Goose Games</label><label className={styles.check}><input type="checkbox" checked={game.featured} onChange={(event) => update("featured", event.target.checked)} /> Feature in the studio</label></div></div><div className={styles.row}><button className={styles.danger} type="button" disabled={!game.version} onClick={() => void remove()}>Delete game</button></div></div></div>
      </section> : <section className={styles.empty}><div><h1>No games yet</h1><p>Start the Goose Games catalogue with the first game.</p></div></section>}
      <aside className={styles.assistant}>
        <div><h2>Goose Games source of truth</h2><p>This editor owns the published game catalogue for goosegames.dev. Set a game live here to include it in the public studio; leave drafts unpublished until artwork and links are ready.</p></div>
        {game && <div className={styles.preview}><h2>Card preview</h2><div className={styles.previewCard}><div className={styles.previewVisual}>{game.cover ? <img src={game.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : game.title.slice(0, 2).toUpperCase() || "GG"}</div><div className={styles.previewBody}><small>{game.genre || "GENRE"}</small><h3>{game.title || "Game title"}</h3><p>{game.tagline || game.description || "Add a hook players will remember."}</p></div></div></div>}
      </aside>
    </div>
  </main>;
}
