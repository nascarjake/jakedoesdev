"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ezformsClients, type ProjectMediaEntry } from '../data/project-media';
import styles from './ProjectMedia.module.css';

export function ProjectMedia({ media, title }: { media: ProjectMediaEntry; title: string }) {
  const [index, setIndex] = useState(0);
  const [video, setVideo] = useState(!media.shots.length && !!media.video);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  useEffect(() => () => restoreScroll.current?.(), []);
  const current = media.shots[index];
  useEffect(() => {
    if (!playing || video || media.shots.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % media.shots.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [playing, video, media.shots.length]);
  const step = (n: number) => { setPlaying(false); setIndex(i => (i + n + media.shots.length) % media.shots.length); };
  return <section className={styles.panel} aria-label={`${title} project media`}>
    <header className={styles.toolbar}>
      <span className={styles.label}>FROM THE ARCHIVE</span>
      <div className={styles.actions}>
        {!!media.shots.length && <button aria-pressed={!video} onClick={() => { setVideo(false); setLoaded(false); }}>Images · {media.shots.length}</button>}
        {media.video && <button aria-pressed={video} onClick={() => { setVideo(true); setPlaying(false); }}>Watch video</button>}
        {media.website && <a href={media.website} target="_blank" rel="noreferrer">Company website ↗</a>}
      </div>
    </header>
    {video ? <div className={`${styles.stage} ${styles.video}`}>
      {loaded ? <iframe title={`${title} video walkthrough`} src={`https://www.youtube-nocookie.com/embed/${media.video}`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className={styles.videoCover}>
        <span className={styles.playIcon} aria-hidden="true">▶</span><h3>{title}</h3><p>A closer look at the product.</p>
        <button onClick={() => setLoaded(true)}>Load video walkthrough</button><small>YouTube loads only when you choose to watch.</small>
      </div>}
    </div> : current ? <>
      <div className={styles.stage}>
        <Image src={current.src} alt={current.caption} fill unoptimized sizes="(max-width: 800px) 90vw, 65vw" className={styles.image} />
        <button ref={opener} className={styles.expand} onClick={() => { setPlaying(false); dialog.current?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; restoreScroll.current = () => { document.body.style.overflow = previous; }; }}>Enlarge image ↗</button>
      </div>
      <div className={styles.caption}><span>{current.caption}</span>{media.shots.length > 1 && <div className={styles.actions}>
        <button aria-label="Previous project image" onClick={() => step(-1)}>←</button><span>{index + 1} / {media.shots.length}</span><button aria-label="Next project image" onClick={() => step(1)}>→</button>
        <button aria-pressed={playing} onClick={() => setPlaying(p => !p)}>{playing ? 'Pause slideshow' : 'Slideshow'}</button>
      </div>}</div>
      {media.shots.length > 1 && <div className={styles.thumbnails}>{media.shots.map((shot, i) => <button key={shot.src} aria-label={shot.caption} aria-pressed={i === index} onClick={() => { setIndex(i); setPlaying(false); }}><Image src={shot.src} alt="" fill unoptimized sizes="90px" /></button>)}</div>}
      <dialog className={styles.dialog} ref={dialog} onClose={() => { restoreScroll.current?.(); restoreScroll.current = null; opener.current?.focus(); }} aria-label={`${title} enlarged image`}>
        <div className={styles.toolbar}><span>{current.caption}</span><button onClick={() => dialog.current?.close()}>Close ×</button></div>
        <div className={styles.fullImage}><Image src={current.src} alt={current.caption} fill unoptimized sizes="95vw" /></div>
        {media.shots.length > 1 && <div className={styles.caption}><button onClick={() => step(-1)}>← Previous</button><span>{index + 1} / {media.shots.length}</span><button onClick={() => step(1)}>Next →</button></div>}
      </dialog>
    </> : <div className={styles.archiveNotice}><span>ARCHIVED PRODUCT</span><h3>{title}</h3><p>No original screenshots available.</p></div>}
    <footer className={styles.note}><p>{media.note}</p>{media.video && <a href={`https://www.youtube.com/watch?v=${media.video}`} target="_blank" rel="noreferrer">Open video on YouTube ↗</a>}</footer>
  </section>;
}

export function EzformsClients() {
  return <section className={styles.clients} aria-label="Selected EZFORMS clients">
    <p className={styles.label}>BUILT FOR REAL-WORLD OPERATIONS</p><h2>A platform used by familiar names.</h2>
    <div className={styles.logoGrid}>{ezformsClients.map(client => <figure key={client.name} className={client.image === 'bsa.svg' ? styles.darkLogo : undefined}><div><Image src={`/projects/clients/${client.image}`} alt={`${client.name} logo`} fill unoptimized sizes="150px" /></div><figcaption>{client.name}</figcaption></figure>)}</div>
    <p>Selected EZFORMS clients, as listed in <a href="https://docs.google.com/document/d/1kvA9sHy8pTBD7Y3VXrZazCPcAgISGe47uS0tOqPPiBc/edit" target="_blank" rel="noreferrer">my résumé ↗</a>. The platform also served city municipalities. Logos identify the organizations; they do not imply endorsement.</p>
  </section>;
}
