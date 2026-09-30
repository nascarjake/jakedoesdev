"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ezformsClients, type ProjectMediaEntry } from "../data/project-media";
import type { ProjectMediaAsset } from "../data/portfolio";
import styles from "./ProjectMedia.module.css";

function youtubeId(url: string): string | null {
  if (/^[\w-]{8,}$/.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v") ?? parsed.pathname.match(/\/embed\/([^/]+)/)?.[1] ?? null;
  } catch { return null; }
  return null;
}

function vimeoId(url: string): string | null {
  try { return new URL(url).pathname.match(/\/(\d+)/)?.[1] ?? null; } catch { return null; }
}

function legacyAssets(media?: ProjectMediaEntry): ProjectMediaAsset[] {
  if (!media) return [];
  const assets: ProjectMediaAsset[] = [];
  if (media.video) assets.push({ id: `video-${media.video}`, kind: "video", url: media.video, caption: "Product walkthrough", altText: "", autoplay: true, preload: "metadata" });
  media.shots.forEach((shot, index) => assets.push({ id: `image-${index}-${shot.src}`, kind: "image", url: shot.src, caption: shot.caption, altText: shot.caption, autoplay: false, preload: index === 0 ? "auto" : "metadata" }));
  return assets;
}

function MediaStage({ asset, title, nearby }: { asset: ProjectMediaAsset; title: string; nearby: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!video.current) return;
    if (nearby && asset.autoplay) void video.current.play().catch(() => undefined);
    else video.current.pause();
  }, [nearby, asset.autoplay]);
  if (asset.kind === "image") return <Image className={styles.dynamicImage} src={asset.url} alt={asset.altText || asset.caption || `${title} project screenshot`} fill unoptimized priority sizes="(max-width: 800px) 94vw, 70vw" style={{ objectFit: "contain" }} />;
  const youtube = youtubeId(asset.url);
  if (youtube) return nearby ? <iframe title={`${title} video walkthrough`} src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=${asset.autoplay ? 1 : 0}&mute=1&playsinline=1&rel=0&loop=1&playlist=${youtube}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className={styles.videoCover}><span className={styles.playIcon}>▶</span><h3>{title}</h3><p>Video loads as it approaches the viewport.</p></div>;
  const vimeo = vimeoId(asset.url);
  if (vimeo) return nearby ? <iframe title={`${title} video walkthrough`} src={`https://player.vimeo.com/video/${vimeo}?autoplay=${asset.autoplay ? 1 : 0}&muted=1&loop=1&title=0&byline=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <div className={styles.videoCover}><span className={styles.playIcon}>▶</span><h3>{title}</h3></div>;
  return <video ref={video} src={asset.url} poster={asset.posterUrl ?? undefined} muted loop playsInline controls preload={asset.preload} aria-label={asset.caption || `${title} project video`} />;
}

export function ProjectMedia({ media, assets, title }: { media?: ProjectMediaEntry; assets?: ProjectMediaAsset[]; title: string }) {
  const items = useMemo(() => {
    const source = assets?.length ? assets : legacyAssets(media);
    return [...source].sort((left, right) => Number(right.kind === "video") - Number(left.kind === "video") || (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }, [assets, media]);
  const [index, setIndex] = useState(0);
  const [nearby, setNearby] = useState(false);
  const [playing, setPlaying] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  const current = items[Math.min(index, Math.max(0, items.length - 1))];

  useEffect(() => {
    if (!panel.current) return;
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: "500px 0px" });
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => restoreScroll.current?.(), []);
  useEffect(() => {
    const next = items[(index + 1) % items.length];
    if (nearby && next?.kind === "image") { const preload = new window.Image(); preload.src = next.url; }
  }, [index, items, nearby]);
  useEffect(() => {
    if (!playing || items.length < 2) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex((value) => (value + 1) % items.length); }, current?.kind === "video" ? 9000 : 4500);
    return () => window.clearInterval(timer);
  }, [playing, items.length, current?.kind]);
  const step = (amount: number) => { setPlaying(false); setIndex((value) => (value + amount + items.length) % items.length); };

  if (!current) return <section className={styles.panel}><div className={styles.archiveNotice}><span>ARCHIVED PRODUCT</span><h3>{title}</h3><p>No original media is available.</p></div></section>;
  return <section ref={panel} className={styles.panel} aria-label={`${title} project media`}>
    <header className={styles.toolbar}><span className={styles.label}>MEDIA REEL · VIDEO FIRST</span><div className={styles.actions}><span>{index + 1} / {items.length}</span>{media?.website && <a href={media.website} target="_blank" rel="noreferrer">Company website ↗</a>}</div></header>
    <div className={`${styles.stage} ${current.kind === "video" ? styles.video : ""}`}><MediaStage asset={current} title={title} nearby={nearby} />{current.kind === "image" && <button ref={opener} className={styles.expand} onClick={() => { setPlaying(false); dialog.current?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; restoreScroll.current = () => { document.body.style.overflow = previous; }; }}>Enlarge image ↗</button>}</div>
    <div className={styles.caption}><span>{current.caption || (current.kind === "video" ? "Project walkthrough" : "Project image")}</span>{items.length > 1 && <div className={styles.actions}><button aria-label="Previous project media" onClick={() => step(-1)}>←</button><button aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? "Pause reel" : "Play reel"}</button><button aria-label="Next project media" onClick={() => step(1)}>→</button></div>}</div>
    {items.length > 1 && <div className={styles.thumbnails}>{items.map((item, itemIndex) => <button key={item.id} aria-label={item.caption || `${item.kind} ${itemIndex + 1}`} aria-pressed={itemIndex === index} onClick={() => { setIndex(itemIndex); setPlaying(false); }}>{item.kind === "image" ? <Image src={item.url} alt="" fill unoptimized sizes="86px" /> : <span className={styles.videoThumb}>▶ VIDEO</span>}</button>)}</div>}
    {current.kind === "image" && <dialog className={styles.dialog} ref={dialog} onClose={() => { restoreScroll.current?.(); restoreScroll.current = null; opener.current?.focus(); }} aria-label={`${title} enlarged image`}><div className={styles.toolbar}><span>{current.caption}</span><button onClick={() => dialog.current?.close()}>Close ×</button></div><div className={styles.fullImage}><Image src={current.url} alt={current.altText || current.caption} fill unoptimized sizes="95vw" style={{ objectFit: "contain" }} /></div></dialog>}
    {(media?.note || media?.video) && <footer className={styles.note}>{media.note && <p>{media.note}</p>}{media.video && <a href={`https://www.youtube.com/watch?v=${media.video}`} target="_blank" rel="noreferrer">Open video on YouTube ↗</a>}</footer>}
  </section>;
}

export function EzformsClients() {
  return <section className={styles.clients} aria-label="Selected EZFORMS clients"><p className={styles.label}>BUILT FOR REAL-WORLD OPERATIONS</p><h2>A platform used by familiar names.</h2><div className={styles.logoGrid}>{ezformsClients.map((client) => <figure key={client.name} className={client.image === "bsa.svg" ? styles.darkLogo : undefined}><div><Image className={styles.clientLogo} src={`/projects/clients/${client.image}`} alt={`${client.name} logo`} fill unoptimized sizes="(max-width: 700px) 42vw, 18vw" style={{ objectFit: "contain" }} /></div><figcaption>{client.name}</figcaption></figure>)}</div><p>Selected EZFORMS clients, as listed in <a href="https://docs.google.com/document/d/1kvA9sHy8pTBD7Y3VXrZazCPcAgISGe47uS0tOqPPiBc/edit" target="_blank" rel="noreferrer">my résumé ↗</a>. The platform also served city municipalities. Logos identify the organizations; they do not imply endorsement.</p></section>;
}
