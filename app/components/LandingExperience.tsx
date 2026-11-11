"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContactButton } from "./ContactButton";
import styles from "./LandingExperience.module.css";

// Published catalogue snapshot, verified 2026-11-08; refresh from the same
// source as Portfolio and AI Lab. These are catalogue counts, not repo totals.
const initialCounts = { portfolio: 20, lab: 7 };
export function LandingExperience() {
  const [counts, setCounts] = useState(initialCounts);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal }).then(r => r.ok ? r.json() as Promise<{ projects?: Array<{ id: string; mode?: string; published?: boolean }> }> : null).then(payload => {
      if (!Array.isArray(payload?.projects)) return;
      const visible = payload.projects.filter((p: { published?: boolean }) => p.published !== false);
      setCounts({ portfolio: visible.filter((p: { mode?: string }) => p.mode !== "lab").length,
        lab: visible.filter((p: { mode?: string; id: string }) => p.mode === "lab" || p.id === "luminary").length });
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <><a className="skip-link" href="#main-content">Skip to content</a><main id="main-content" className={styles.page}><div className={styles.inner}>
    <header className={styles.header}><Link href="/" className={styles.identity} aria-label="Jake Clark, home">jake<span>does</span>dev<span className={styles.dot}>.</span></Link><div className={styles.headerLinks}><a href="https://github.com/nascarjake">GitHub ↗</a><Link href="/resume">Résumé ↗</Link></div></header>
    <section className={styles.intro} aria-labelledby="landing-title"><div><p className={styles.role}>SOFTWARE ENGINEER · FOUNDER</p><h1 id="landing-title">Jake Clark</h1></div><div className={styles.bio}><p><strong>20+ years building software.</strong> I build products and the tools behind them, from architecture to the interface.</p><p className={styles.industries}>Medical AI & imaging · Restaurant & retail POS · Enterprise documents · Game-engine tools · Finance & banking</p></div></section>
    <nav className={styles.paths} aria-label="Main navigation">
      <Link href="/universe" className={styles.portfolio}><div className={styles.portfolioCopy}><span className={styles.sectionNumber}>01 / PROFESSIONAL WORK</span><h2>Portfolio</h2><p>Products I’ve built.<br />Teams I’ve helped lead.</p><span className={styles.primaryAction}>Explore {counts.portfolio} products & tools <span aria-hidden="true">↗</span></span></div><div className={styles.productImages} aria-hidden="true"><img className={styles.productMain} src="/projects/ezforms/dashboard.webp" alt="" /><img className={styles.productSecondary} src="/projects/traxo/itinerary.webp" alt="" /><span className={styles.imageCaption}>ezForms / Traxo</span></div></Link>
      <div className={styles.secondaryPaths}><Link href="/lab" className={`${styles.secondary} ${styles.lab}`}><div className={styles.secondaryTop}><span className={styles.sectionNumber}>02</span><span aria-hidden="true">↗</span></div><h2>AI Lab</h2><p>{counts.lab} open-source projects<br className={styles.desktopBreak} /> & experiments.</p><span className={styles.secondaryAction}>Browse the lab <span aria-hidden="true">→</span></span></Link><Link href="/arcade" className={`${styles.secondary} ${styles.arcade}`}><div className={styles.secondaryTop}><span className={styles.sectionNumber}>03</span><span aria-hidden="true">↗</span></div><h2>Arcade</h2><p>Original games.<br className={styles.desktopBreak} /> Play in your browser.</p><span className={styles.secondaryAction}>Choose a game <span aria-hidden="true">→</span></span></Link></div>
    </nav><footer className={styles.footer}><ContactButton className={styles.contact}>Contact Jake</ContactButton><Link href="/updates">Project updates ↗</Link></footer>
  </div></main></>;
}
