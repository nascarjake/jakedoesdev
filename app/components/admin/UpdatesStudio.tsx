"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminPanel.module.css";

type UpdateDraft = {
  id: string;
  title: string;
  date: string;
  summary: string;
  bullets: string[];
  published: boolean;
  updatedAt: string;
};

type Notice = { type: "error" | "success"; text: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "x-portfolio-admin": "1",
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);
  return result;
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 76);
}

function emptyDraft(): UpdateDraft {
  const date = today();
  return { id: `field-notes-${date}-${crypto.randomUUID().slice(0, 8)}`, title: "Field notes", date, summary: "", bullets: [""], published: false, updatedAt: "" };
}

export function UpdatesStudio() {
  const [updates, setUpdates] = useState<UpdateDraft[]>([]);
  const [selected, setSelected] = useState<UpdateDraft | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      api<{ user: { email: string } }>("/api/admin/session"),
      api<{ updates: UpdateDraft[] }>("/api/admin/updates"),
    ]).then(([session, response]) => {
      if (!active) return;
      setEmail(session.user.email);
      setUpdates(response.updates);
      setSelected(response.updates[0] ?? null);
    }).catch((caught) => {
      if (active) setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Could not load updates." });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const choose = (draft: UpdateDraft) => {
    if (selected && JSON.stringify(selected) !== JSON.stringify(updates.find((item) => item.id === selected.id)) && !window.confirm("Discard unsaved changes?")) return;
    setSelected({ ...draft, bullets: [...draft.bullets] });
    setNotice(null);
  };

  const create = () => {
    if (selected && JSON.stringify(selected) !== JSON.stringify(updates.find((item) => item.id === selected.id)) && !window.confirm("Discard unsaved changes?")) return;
    setSelected(emptyDraft());
    setNotice(null);
  };

  const update = (patch: Partial<UpdateDraft>) => setSelected((current) => current ? { ...current, ...patch } : current);
  const updateBullet = (index: number, value: string) => setSelected((current) => current ? {
    ...current,
    bullets: current.bullets.map((bullet, bulletIndex) => bulletIndex === index ? value : bullet),
  } : current);
  const removeBullet = (index: number) => setSelected((current) => current ? {
    ...current,
    bullets: current.bullets.filter((_, bulletIndex) => bulletIndex !== index),
  } : current);

  const dirty = useMemo(() => selected
    ? JSON.stringify(selected) !== JSON.stringify(updates.find((item) => item.id === selected.id))
    : false, [selected, updates]);

  const save = async (publish: boolean) => {
    if (!selected) return;
    const draft = { ...selected, bullets: selected.bullets.map((item) => item.trim()).filter(Boolean), published: publish || selected.published };
    if (!draft.title.trim() || !draft.summary.trim() || !draft.bullets.length) {
      setNotice({ type: "error", text: "Add a title, short summary, and at least one bullet." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const fresh = updates.some((item) => item.id === selected.id);
      const endpoint = fresh ? `/api/admin/updates/${encodeURIComponent(selected.id)}` : "/api/admin/updates";
      const result = await api<{ update: UpdateDraft }>(endpoint, {
        method: fresh ? "PUT" : "POST",
        body: JSON.stringify({ ...draft, id: slugify(draft.id) }),
      });
      setSelected(result.update);
      setUpdates((current) => [result.update, ...current.filter((item) => item.id !== result.update.id)]);
      setNotice({ type: "success", text: publish ? "Approved. It will appear on /updates after the next static sync." : "Draft saved in the review queue." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Could not save this update." });
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    if (!selected || !window.confirm("Remove this update from the public page?")) return;
    setSaving(true);
    try {
      const result = await api<{ update: UpdateDraft }>(`/api/admin/updates/${encodeURIComponent(selected.id)}`, {
        method: "PUT",
        body: JSON.stringify({ ...selected, published: false }),
      });
      setSelected(result.update);
      setUpdates((current) => current.map((item) => item.id === result.update.id ? result.update : item));
      setNotice({ type: "success", text: "Unpublished. It will be removed from /updates after the next static sync." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Could not unpublish this update." });
    } finally {
      setSaving(false);
    }
  };

  const removeDraft = async () => {
    if (!selected || selected.published || !window.confirm(`Delete “${selected.title}”?`)) return;
    setSaving(true);
    try {
      await api(`/api/admin/updates/${encodeURIComponent(selected.id)}`, { method: "DELETE", body: "{}" });
      setUpdates((current) => current.filter((item) => item.id !== selected.id));
      setSelected(null);
      setNotice({ type: "success", text: "Draft deleted." });
    } catch (caught) {
      setNotice({ type: "error", text: caught instanceof Error ? caught.message : "Could not delete this draft." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className={styles.shell}><div className={styles.loading}><div><div className={styles.mark}>JC</div><h1>Opening update review…</h1></div></div></main>;
  if (!email) return <main className={styles.shell}><div className={styles.empty}><div><h1>Update review is locked</h1><p className={styles.muted}>{notice?.text ?? "Sign in through Cloudflare Access to continue."}</p></div></div></main>;

  return <main className={styles.shell}>
    <header className={styles.topbar}>
      <div className={styles.brand}><span className={styles.mark}>JC</span><div><strong>Update Review</strong><span>{email}</span></div></div>
      <div className={styles.topActions}><a className={styles.ghost} href="/admin/">Project Studio</a><a className={styles.ghost} href="/updates/" target="_blank" rel="noreferrer">Public updates</a></div>
    </header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <button className={styles.button} type="button" onClick={create}>+ New update</button>
        <div className={styles.projectList}>
          {updates.map((item) => <button type="button" className={styles.projectItem} data-active={selected?.id === item.id} onClick={() => choose(item)} key={item.id}>
            <div><strong>{item.title}</strong><span>{item.date} · {item.published ? "Published" : "Needs review"}</span></div>
            <i className={`${styles.dot} ${item.published ? styles.published : ""}`} />
          </button>)}
          {!updates.length && <p className={styles.hint}>No updates are waiting for review.</p>}
        </div>
      </aside>
      {selected ? <section className={styles.main}>
        {notice && <div className={notice.type === "error" ? styles.error : styles.success}>{notice.text}</div>}
        <div className={styles.section}>
          <header className={styles.sectionHeader}><h2>Post details</h2><p>Review the wording before anything goes public.</p></header>
          <div className={styles.sectionBody}>
            <label className={styles.label}>Title<input className={styles.input} value={selected.title} onChange={(event) => update({ title: event.target.value })} /></label>
            <div className={styles.grid2}>
              <label className={styles.label}>Date<input className={styles.input} type="date" value={selected.date} onChange={(event) => update({ date: event.target.value })} /></label>
              <label className={styles.label}>Post slug<input className={`${styles.input} ${styles.slug}`} value={selected.id} disabled={updates.some((item) => item.id === selected.id)} onChange={(event) => update({ id: slugify(event.target.value) })} /></label>
            </div>
            <label className={styles.label}>Short summary<textarea className={styles.textarea} value={selected.summary} onChange={(event) => update({ summary: event.target.value })} /></label>
          </div>
        </div>
        <div className={styles.section}>
          <header className={styles.sectionHeader}><h2>What readers will see</h2><p>Remove any item you don’t want in this post. You can also edit the wording.</p></header>
          <div className={styles.sectionBody}>
            {selected.bullets.map((bullet, index) => <div className={styles.listRow} key={`${selected.id}-${index}`}>
              <textarea className={styles.textarea} aria-label={`Post bullet ${index + 1}`} value={bullet} onChange={(event) => updateBullet(index, event.target.value)} placeholder="Write one concise update…" />
              <button className={styles.danger} type="button" onClick={() => removeBullet(index)} aria-label={`Remove bullet ${index + 1}`}>Remove</button>
            </div>)}
            <button className={styles.ghost} type="button" onClick={() => update({ bullets: [...selected.bullets, ""] })}>+ Add a bullet</button>
          </div>
        </div>
        <div className={styles.section}>
          <header className={styles.sectionHeader}><h2>{selected.published ? "Published" : "Approval"}</h2><p>{selected.published ? "This version is queued for the next static updates sync." : "Only an approved post appears on the public updates page."}</p></header>
          <div className={styles.sectionBody}>
            <div className={styles.row}>
              <button className={styles.button} type="button" disabled={saving || !dirty} onClick={() => void save(false)}>{saving ? "Saving…" : selected.published ? "Save changes" : "Save draft"}</button>
              {!selected.published && <button className={styles.button} type="button" disabled={saving} onClick={() => void save(true)}>{saving ? "Publishing…" : "Approve & publish"}</button>}
              {selected.published && <button className={styles.ghost} type="button" disabled={saving} onClick={() => void unpublish()}>Unpublish</button>}
              {!selected.published && updates.some((item) => item.id === selected.id) && <button className={styles.danger} type="button" disabled={saving} onClick={() => void removeDraft()}>Delete draft</button>}
            </div>
            {selected.updatedAt && <p className={styles.hint}>Last saved {new Date(`${selected.updatedAt.replace(" ", "T")}Z`).toLocaleString()}</p>}
          </div>
        </div>
      </section> : <section className={styles.empty}><div><h1>Daily update review</h1><p>Drafts sent from the private work log will show up here. Remove or rewrite bullets, then approve a post when it’s ready.</p><button className={styles.button} type="button" onClick={create}>Create an update</button></div></section>}
    </div>
  </main>;
}
