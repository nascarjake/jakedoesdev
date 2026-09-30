"use client";
/* eslint-disable @next/next/no-img-element -- editor previews display arbitrary R2/object URLs before publication */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AdminPanel.module.css";

type Media = {
  id: string;
  kind: "video" | "image";
  url: string;
  storageKey: string | null;
  posterUrl: string | null;
  caption: string;
  altText: string;
  mimeType: string | null;
  autoplay: boolean;
  preload: "none" | "metadata" | "auto";
};

type Project = {
  id: string;
  sortOrder: number;
  title: string;
  eyebrow: string;
  summary: string;
  storyHtml: string;
  role: string;
  year: string;
  stack: string[];
  signal: string;
  accent: "acid" | "amber" | "ice";
  category: string;
  status: string;
  highlights: string[];
  scope: string;
  ownership: string[];
  systems: string[];
  note: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  published: boolean;
  featured: boolean;
  version: number;
  media: Media[];
  updatedAt?: string;
};

type Revision = { id: string; version: number; edited_by: string; created_at: string };
type ImportEvidence = {
  sourceUrl: string;
  title: string;
  description: string;
  mediaFound: number;
  screenshotCaptured: boolean;
  warnings: string[];
};

const emptyProject = (sortOrder = 0): Project => ({
  id: "",
  sortOrder,
  title: "Untitled project",
  eyebrow: "",
  summary: "",
  storyHtml: "<p></p>",
  role: "",
  year: new Date().getFullYear().toString(),
  stack: [],
  signal: "PRJ",
  accent: "acid",
  category: "SaaS",
  status: "Draft",
  highlights: [],
  scope: "",
  ownership: [],
  systems: [],
  note: null,
  sourceLabel: null,
  sourceUrl: null,
  published: false,
  featured: false,
  version: 0,
  media: [],
});

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "x-portfolio-admin": "1",
      ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }),
      ...init?.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

function projectFromApi(value: Record<string, unknown>): Project {
  const dossier = (value.dossier ?? {}) as Record<string, unknown>;
  const source = (dossier.source ?? {}) as Record<string, unknown>;
  return {
    ...(value as unknown as Project),
    sortOrder: Number(value.sortOrder ?? 0),
    storyHtml: String(value.storyHtml ?? "<p></p>"),
    scope: String(dossier.scope ?? value.scope ?? ""),
    ownership: Array.isArray(dossier.ownership) ? (dossier.ownership as string[]) : [],
    systems: Array.isArray(dossier.systems) ? (dossier.systems as string[]) : [],
    note: (dossier.note ?? value.note ?? null) as string | null,
    sourceLabel: (source.label ?? value.sourceLabel ?? null) as string | null,
    sourceUrl: (source.url ?? value.sourceUrl ?? null) as string | null,
    media: Array.isArray(value.media) ? (value.media as Media[]) : [],
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ListEditor({ label, value, onChange }: { label: string; value: string[]; onChange(value: string[]): void }) {
  return <label className={styles.label}>{label}<div className={styles.list}>
    {value.map((item, index) => <div className={styles.listRow} key={`${label}-${index}`}>
      <input className={styles.input} value={item} onChange={(event) => onChange(value.map((entry, itemIndex) => itemIndex === index ? event.target.value : entry))} />
      <button className={styles.iconButton} type="button" aria-label={`Remove ${label} item`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>×</button>
    </div>)}
    <button className={styles.ghost} type="button" onClick={() => onChange([...value, ""])}>+ Add item</button>
  </div></label>;
}

function RichTextEditor({ value, onChange }: { value: string; onChange(value: string): void }) {
  const editor = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  useEffect(() => {
    if (editor.current && value !== lastValue.current && editor.current.innerHTML !== value) {
      editor.current.innerHTML = value;
      lastValue.current = value;
    }
  }, [value]);
  const command = (name: string, commandValue?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, commandValue);
    if (editor.current) onChange(editor.current.innerHTML);
  };
  return <div className={styles.richWrap}>
    <div className={styles.editorToolbar} role="toolbar" aria-label="Story formatting">
      <button className={styles.iconButton} type="button" onClick={() => command("bold")}><strong>B</strong></button>
      <button className={styles.iconButton} type="button" onClick={() => command("italic")}><em>I</em></button>
      <button className={styles.iconButton} type="button" onClick={() => command("formatBlock", "h2")}>H2</button>
      <button className={styles.iconButton} type="button" onClick={() => command("formatBlock", "p")}>P</button>
      <button className={styles.iconButton} type="button" onClick={() => command("insertUnorderedList")}>• List</button>
      <button className={styles.iconButton} type="button" onClick={() => { const url = window.prompt("HTTPS link"); if (url?.startsWith("https://")) command("createLink", url); }}>Link</button>
      <button className={styles.iconButton} type="button" onClick={() => command("removeFormat")}>Clear</button>
    </div>
    <div ref={editor} className={styles.rich} contentEditable suppressContentEditableWarning onInput={(event) => { const html = event.currentTarget.innerHTML; lastValue.current = html; onChange(html); }} dangerouslySetInnerHTML={{ __html: value }} />
  </div>;
}

export function AdminPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importEvidence, setImportEvidence] = useState<ImportEvidence | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggingMedia, setDraggingMedia] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const mediaInput = useRef<HTMLInputElement>(null);
  const mediaDragDepth = useRef(0);

  const loadProjects = useCallback(async (selectId?: string) => {
    const [session, response] = await Promise.all([
      api<{ user: { email: string } }>("/api/admin/session"),
      api<{ projects: Record<string, unknown>[] }>("/api/admin/projects"),
    ]);
    const next = response.projects.map(projectFromApi);
    setEmail(session.user.email);
    setProjects(next);
    if (selectId) setProject(next.find((item) => item.id === selectId) ?? next[0] ?? null);
    else setProject((current) => next.find((item) => item.id === current?.id) ?? next[0] ?? null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects()
        .catch((caught: Error) => setNotice({
          type: "error",
          text: caught.message.includes("(404)")
            ? "Open this page on the Cloudflare deployment and sign in through Access."
            : caught.message,
        }))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    if (!project || !dirty) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(`portfolio-draft:${project.id || "new"}`, JSON.stringify(project));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [project, dirty]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const update = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((current) => current ? { ...current, [key]: value } : current);
    setDirty(true);
    setNotice(null);
  };

  const select = (next: Project) => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    const savedDraft = localStorage.getItem(`portfolio-draft:${next.id}`);
    if (savedDraft && window.confirm("Restore the local draft for this project?")) {
      try { setProject(JSON.parse(savedDraft) as Project); setDirty(true); return; } catch { /* ignore malformed local draft */ }
    }
    setProject(next);
    setImportUrl(next.sourceUrl ?? "");
    setImportEvidence(null);
    setDirty(false);
    setNotice(null);
    setRevisions([]);
  };

  const save = useCallback(async () => {
    if (!project || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const path = project.version ? `/api/admin/projects/${project.id}` : "/api/admin/projects";
      const response = await api<{ project: Record<string, unknown> }>(path, { method: project.version ? "PUT" : "POST", body: JSON.stringify(project) });
      const saved = projectFromApi(response.project);
      setProject(saved);
      setDirty(false);
      localStorage.removeItem(`portfolio-draft:${project.id || "new"}`);
      await loadProjects(saved.id);
      setNotice({ type: "success", text: saved.published ? "Published changes saved." : "Draft saved." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Save failed." });
    } finally { setSaving(false); }
  }, [loadProjects, project, saving]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save(); } };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [save]);

  const runAi = async (mode: "generate" | "improve-summary" | "expand") => {
    if (!project) return;
    setAiBusy(true); setNotice(null);
    try {
      const response = await api<{ project: Partial<Project> }>("/api/admin/ai", { method: "POST", body: JSON.stringify({ mode, prompt: aiPrompt, project }) });
      setProject({ ...project, ...response.project, id: project.version ? project.id : (response.project.id ?? project.id), version: project.version, media: project.media, published: project.published, featured: project.featured });
      setDirty(true);
      setNotice({ type: "success", text: "AI draft applied. Review every field before saving." });
    } catch (caught) { setNotice({ type: "error", text: caught instanceof Error ? caught.message : "AI request failed." }); }
    finally { setAiBusy(false); }
  };

  const importFromUrl = async () => {
    if (!project || !importUrl.trim()) return;
    setAiBusy(true); setNotice(null); setImportEvidence(null);
    try {
      const response = await api<{ project: Partial<Project>; importedMedia: Media[]; evidence: ImportEvidence }>("/api/admin/ai/import-url", {
        method: "POST",
        body: JSON.stringify({ url: importUrl.trim(), notes: aiPrompt, project }),
      });
      const seen = new Set<string>();
      const media = [...project.media, ...response.importedMedia]
        .filter((item) => !seen.has(item.url) && Boolean(seen.add(item.url)))
        .sort((left, right) => Number(right.kind === "video") - Number(left.kind === "video"));
      setProject({
        ...project,
        ...response.project,
        id: project.version ? project.id : (response.project.id ?? project.id),
        version: project.version,
        media,
        published: project.published,
        featured: project.featured,
      });
      setImportUrl(response.evidence.sourceUrl);
      setImportEvidence(response.evidence);
      setDirty(true);
      setNotice({ type: "success", text: "Website evidence and media were added to this local draft. Review every field before saving." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Website import failed." });
    } finally { setAiBusy(false); }
  };

  const upload = async (files: Iterable<File> | null) => {
    const selected = files ? Array.from(files) : [];
    if (!project || !selected.length || !project.id) { setNotice({ type: "error", text: "Set the project slug before uploading media." }); return; }
    const unsupported = selected.find((file) => !file.type.startsWith("image/") && !["video/mp4", "video/webm"].includes(file.type));
    if (unsupported) { setNotice({ type: "error", text: `${unsupported.name} is not supported. Choose an image, MP4, or WebM video.` }); return; }
    const oversized = selected.find((file) => file.size > 25_000_000);
    if (oversized) { setNotice({ type: "error", text: `${oversized.name} exceeds the 25 MB per-file limit.` }); return; }
    setUploading(true);
    try {
      const additions: Media[] = [];
      for (const file of selected) {
        const form = new FormData(); form.set("file", file); form.set("projectId", project.id);
        const response = await api<{ media: Media }>("/api/admin/media", { method: "POST", body: form });
        additions.push(response.media);
      }
      update("media", [...project.media, ...additions].sort((a, b) => Number(b.kind === "video") - Number(a.kind === "video")));
    } catch (caught) { setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Upload failed." }); }
    finally { setUploading(false); }
  };

  const beginMediaDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    mediaDragDepth.current += 1;
    setDraggingMedia(true);
  };

  const endMediaDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    mediaDragDepth.current = Math.max(0, mediaDragDepth.current - 1);
    if (!mediaDragDepth.current) setDraggingMedia(false);
  };

  const dropMedia = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    mediaDragDepth.current = 0;
    setDraggingMedia(false);
    void upload(Array.from(event.dataTransfer.files));
  };

  const addUrl = () => {
    if (!project) return;
    const url = window.prompt("Paste an HTTPS image, video, YouTube, or Vimeo URL");
    if (!url?.startsWith("https://")) return;
    const video = /youtube|youtu\.be|vimeo|\.(mp4|webm)(\?|$)/i.test(url);
    const item: Media = { id: crypto.randomUUID(), kind: video ? "video" : "image", url, storageKey: null, posterUrl: null, caption: "", altText: "", mimeType: null, autoplay: video, preload: "metadata" };
    update("media", [...project.media, item].sort((a, b) => Number(b.kind === "video") - Number(a.kind === "video")));
  };

  const moveMedia = (index: number, direction: number) => {
    if (!project) return;
    const target = index + direction;
    if (target < 0 || target >= project.media.length || project.media[index].kind !== project.media[target].kind) return;
    const media = [...project.media]; [media[index], media[target]] = [media[target], media[index]]; update("media", media);
  };

  const updateMedia = (index: number, patch: Partial<Media>) => {
    if (!project) return;
    update("media", project.media.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const loadRevisions = async () => {
    if (!project?.version) return;
    const response = await api<{ revisions: Revision[] }>(`/api/admin/projects/${project.id}/revisions`);
    setRevisions(response.revisions);
  };

  const restore = async (revision: Revision) => {
    if (!window.confirm(`Restore version ${revision.version}? The current version will remain in history.`)) return;
    const response = await api<{ project: Record<string, unknown> }>(`/api/admin/revisions/${revision.id}/restore`, { method: "POST", body: "{}" });
    const restored = projectFromApi(response.project); setProject(restored); setDirty(false); await loadProjects(restored.id); await loadRevisions();
  };

  const archive = async () => {
    if (!project?.version || !window.confirm(`Archive “${project.title}”? It will disappear from the public site.`)) return;
    await api(`/api/admin/projects/${project.id}`, { method: "DELETE", body: "{}" }); setDirty(false); await loadProjects(); setNotice({ type: "success", text: "Project archived." });
  };

  const filtered = useMemo(() => projects.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  if (loading) return <main className={styles.shell}><div className={styles.loading}><div><div className={styles.mark}>JC</div><h1>Opening Project Studio…</h1></div></div></main>;
  if (!email) return <main className={styles.shell}><div className={styles.empty}><div><h1>Project Studio is locked</h1><p className={styles.muted}>{notice?.text ?? "Sign in through Cloudflare Access to continue."}</p></div></div></main>;

  return <main className={styles.shell}>
    <header className={styles.topbar}><div className={styles.brand}><span className={styles.mark}>JC</span><div><strong>Project Studio</strong><span>{email}</span></div></div><div className={styles.topActions}><a className={styles.ghost} href="/admin/updates/">Update review</a><a className={styles.ghost} href="/admin/games/">Goose Games catalogue</a><a className={styles.ghost} href="/universe/" target="_blank">View portfolio ↗</a><div className={styles.saveCluster}><span className={styles.status}>{dirty ? "LOCAL DRAFT" : project?.version ? `SAVED · V${project.version}` : "NEW PROJECT"}</span><button className={styles.button} type="button" disabled={!project || saving} onClick={() => void save()}>{saving ? "Saving…" : project?.published ? "Save & publish" : "Save draft"}</button></div></div></header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><button className={styles.button} type="button" onClick={() => { if (!dirty || window.confirm("Discard unsaved changes?")) { setProject(emptyProject(projects.length)); setImportUrl(""); setImportEvidence(null); setDirty(true); setRevisions([]); } }}>+ New project</button><input className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects…" />
        <div className={styles.projectList}>{filtered.map((item) => <button type="button" className={styles.projectItem} data-active={project?.id === item.id} onClick={() => select(item)} key={item.id}><div><strong>{item.title}</strong><span>{item.category} · {item.status}</span></div><i className={`${styles.dot} ${item.published ? styles.published : ""}`} /></button>)}</div>
      </aside>
      {project ? <section className={styles.main}>
        {notice && <div className={notice.type === "error" ? styles.error : styles.success}>{notice.text}</div>}
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Project identity</h2><p>The compact facts people see first.</p></header><div className={styles.sectionBody}>
          <label className={styles.label}>Title<input className={styles.input} value={project.title} onChange={(event) => { update("title", event.target.value); if (!project.version && (!project.id || project.id === slugify(project.title))) update("id", slugify(event.target.value)); }} /></label>
          <div className={styles.grid3}><label className={styles.label}>Slug<input className={`${styles.input} ${styles.slug}`} disabled={Boolean(project.version)} value={project.id} onChange={(event) => update("id", slugify(event.target.value))} /></label><label className={styles.label}>Signal<input className={styles.input} maxLength={5} value={project.signal} onChange={(event) => update("signal", event.target.value.toUpperCase())} /></label><label className={styles.label}>Order<input className={styles.input} type="number" value={project.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label></div>
          <label className={styles.label}>Eyebrow<input className={styles.input} value={project.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} placeholder="A crisp one-line positioning statement" /></label>
          <label className={styles.label}>Summary<textarea className={styles.textarea} value={project.summary} onChange={(event) => update("summary", event.target.value)} /></label>
          <div className={styles.grid2}><label className={styles.label}>Role<input className={styles.input} value={project.role} onChange={(event) => update("role", event.target.value)} /></label><label className={styles.label}>Year / period<input className={styles.input} value={project.year} onChange={(event) => update("year", event.target.value)} /></label></div>
          <div className={styles.grid3}><label className={styles.label}>Category<input className={styles.input} value={project.category} onChange={(event) => update("category", event.target.value)} /></label><label className={styles.label}>Accent<select className={styles.select} value={project.accent} onChange={(event) => update("accent", event.target.value as Project["accent"])}><option value="acid">Acid</option><option value="amber">Amber</option><option value="ice">Ice</option></select></label><label className={styles.label}>Status<input className={styles.input} value={project.status} onChange={(event) => update("status", event.target.value)} /></label></div>
          <ListEditor label="Technology stack" value={project.stack} onChange={(value) => update("stack", value)} />
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Rich story</h2><p>Format the longer narrative while seeing the result directly.</p></header><div className={styles.sectionBody}><RichTextEditor value={project.storyHtml} onChange={(value) => update("storyHtml", value)} /></div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Build record</h2><p>Specific work, ownership, and system shape.</p></header><div className={styles.sectionBody}>
          <label className={styles.label}>Scope<textarea className={styles.textarea} value={project.scope} onChange={(event) => update("scope", event.target.value)} /></label>
          <ListEditor label="What I owned" value={project.ownership} onChange={(value) => update("ownership", value)} /><ListEditor label="System shape" value={project.systems} onChange={(value) => update("systems", value)} /><ListEditor label="Highlights" value={project.highlights} onChange={(value) => update("highlights", value)} />
          <label className={styles.label}>Editorial / privacy note<textarea className={styles.textarea} value={project.note ?? ""} onChange={(event) => update("note", event.target.value || null)} /></label>
          <div className={styles.grid2}><label className={styles.label}>Source label<input className={styles.input} value={project.sourceLabel ?? ""} onChange={(event) => update("sourceLabel", event.target.value || null)} /></label><label className={styles.label}>Source HTTPS URL<input className={styles.input} type="url" value={project.sourceUrl ?? ""} onChange={(event) => update("sourceUrl", event.target.value || null)} /></label></div>
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Media reel</h2><p>Videos are always shown first, then images. Move items within their group.</p></header><div className={styles.sectionBody}>
          <div className={styles.mediaDrop} data-dragging={draggingMedia || undefined} onDragEnter={beginMediaDrag} onDragOver={(event) => event.preventDefault()} onDragLeave={endMediaDrag} onDrop={dropMedia}>
            <strong>{uploading ? "Uploading…" : draggingMedia ? "Drop files to upload" : "Drop images or short videos here"}</strong>
            <p className={styles.hint}>25 MB per file. Images, MP4, and WebM videos are supported.</p>
            <input ref={mediaInput} className={styles.mediaFileInput} type="file" accept="image/*,video/mp4,video/webm" multiple disabled={uploading} onChange={(event) => { const selected = Array.from(event.target.files ?? []); event.target.value = ""; void upload(selected); }} />
            <div className={styles.mediaDropActions}><button className={styles.ghost} type="button" disabled={uploading} onClick={() => mediaInput.current?.click()}>Browse files</button><button className={styles.ghost} type="button" onClick={addUrl}>Or add a media URL</button></div>
          </div>
          <div className={styles.mediaList}>{project.media.map((item, index) => <div className={styles.mediaItem} key={item.id}>
            <div className={styles.mediaLead}>{item.kind === "image" ? <img className={styles.mediaThumb} src={item.url} alt="" /> : <span className={styles.videoBadge}>VIDEO</span>}<div className={styles.mediaActions}><button className={styles.iconButton} type="button" aria-label="Move media up" onClick={() => moveMedia(index, -1)}>↑</button><button className={styles.iconButton} type="button" aria-label="Move media down" onClick={() => moveMedia(index, 1)}>↓</button></div></div>
            <div className={styles.mediaFields}>
              <div className={styles.mediaMetaGrid}><label className={styles.label}>Type<select className={styles.select} value={item.kind} onChange={(event) => updateMedia(index, { kind: event.target.value as Media["kind"], autoplay: event.target.value === "video" ? item.autoplay : false })}><option value="video">Video</option><option value="image">Image</option></select></label><label className={styles.label}>Preload<select className={styles.select} value={item.preload} onChange={(event) => updateMedia(index, { preload: event.target.value as Media["preload"] })}><option value="none">None</option><option value="metadata">Metadata</option><option value="auto">Auto</option></select></label><label className={styles.check}><input type="checkbox" checked={item.autoplay} disabled={item.kind !== "video"} onChange={(event) => updateMedia(index, { autoplay: event.target.checked })} /> Autoplay</label></div>
              <label className={styles.label}>Media URL<input className={styles.input} type="text" inputMode="url" placeholder="https://... or /projects/..." value={item.url} onChange={(event) => updateMedia(index, { url: event.target.value })} /></label>
              <div className={styles.grid2}><label className={styles.label}>Caption<input className={styles.input} value={item.caption} onChange={(event) => updateMedia(index, { caption: event.target.value })} /></label><label className={styles.label}>Alt text<input className={styles.input} value={item.altText} onChange={(event) => updateMedia(index, { altText: event.target.value })} /></label></div>
              {item.kind === "video" && <label className={styles.label}>Poster URL<input className={styles.input} type="text" inputMode="url" placeholder="https://... or /projects/..." value={item.posterUrl ?? ""} onChange={(event) => updateMedia(index, { posterUrl: event.target.value || null })} /></label>}
            </div>
            <button className={styles.danger} type="button" onClick={() => update("media", project.media.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>)}</div>
        </div></div>
        <div className={styles.section}><header className={styles.sectionHeader}><h2>Publishing</h2><p>Draft changes stay private until you publish.</p></header><div className={styles.sectionBody}><div className={styles.checks}><label className={styles.check}><input type="checkbox" checked={project.published} onChange={(event) => update("published", event.target.checked)} /> Published</label><label className={styles.check}><input type="checkbox" checked={project.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured</label></div><div className={styles.row}><button className={styles.ghost} type="button" disabled={!project.version} onClick={() => void loadRevisions()}>Load revision history</button><button className={styles.danger} type="button" disabled={!project.version} onClick={() => void archive()}>Archive project</button></div>{revisions.length > 0 && <div className={styles.revisionList}>{revisions.map((revision) => <div className={styles.revision} key={revision.id}><span>Version {revision.version} · {new Date(revision.created_at).toLocaleString()}</span><button className={styles.ghost} type="button" onClick={() => void restore(revision)}>Restore</button></div>)}</div>}</div></div>
      </section> : <section className={styles.empty}><p>No projects yet. Create the first one.</p></section>}
      <aside className={styles.assistant}><div><h2>AI writing partner</h2><p>Give it rough notes. It can create a complete draft or tighten the selected project without inventing facts.</p><textarea className={styles.prompt} value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="What did you build, why did it matter, and what did you personally own?" /><div className={styles.aiButtons}><button className={styles.button} type="button" disabled={aiBusy || !project} onClick={() => void runAi("generate")}>{aiBusy ? "Thinking…" : "Build project from prompt"}</button><button className={styles.ghost} type="button" disabled={aiBusy || !project} onClick={() => void runAi("improve-summary")}>Improve copy</button><button className={styles.ghost} type="button" disabled={aiBusy || !project} onClick={() => void runAi("expand")}>Expand record</button></div>
        <div className={styles.urlImport}><h3>Enrich from a live site</h3><p>Paste a new project link. The importer reads public page evidence, captures a preview when available, and merges the findings into this unsaved draft.</p><input className={styles.input} type="url" value={importUrl} onChange={(event) => setImportUrl(event.target.value)} placeholder="https://project.example" /><button className={styles.button} type="button" disabled={aiBusy || !project || !importUrl.trim()} onClick={() => void importFromUrl()}>{aiBusy ? "Inspecting site…" : "Inspect & enrich draft"}</button>{importEvidence && <div className={styles.importReport}><strong>{importEvidence.title || "Website inspected"}</strong><span>{importEvidence.mediaFound} media item{importEvidence.mediaFound === 1 ? "" : "s"} found · {importEvidence.screenshotCaptured ? "screenshot captured" : "no screenshot"}</span>{importEvidence.description && <p>{importEvidence.description}</p>}{importEvidence.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}</div>
      </div>
        {project && <div className={styles.preview}><h2>Card preview</h2><div className={styles.previewCard}><div className={styles.previewVisual}>{project.media[0]?.kind === "video" ? <video src={project.media[0].url} poster={project.media[0].posterUrl ?? undefined} muted autoPlay loop playsInline preload={project.media[0].preload} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : project.media[0]?.kind === "image" ? <img src={project.media[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : project.signal}</div><div className={styles.previewBody}><small>{project.category} · {project.year}</small><h3>{project.title}</h3><p>{project.eyebrow || project.summary || "Add a clear project introduction."}</p></div></div></div>}
      </aside>
    </div>
  </main>;
}
