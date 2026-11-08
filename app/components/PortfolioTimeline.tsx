'use client';
import { useState } from 'react';
import Link from 'next/link';
import { experiences, type Project } from '../data/portfolio';
import { startYear } from '../data/portfolio-views';
import styles from './PortfolioViews.module.css';

export function PortfolioTimeline({catalog, onSelect}: {catalog: Project[]; onSelect: (project: Project) => void}) {
  const [order, setOrder] = useState<'recent' | 'earliest'>('recent');
  const years = [...new Set([...catalog.map(p => startYear(p.year)), ...experiences.map(e => startYear(e.period))].filter((n): n is number => n !== null))].sort((a,b) => order === 'recent' ? b-a : a-b);
  const undated = catalog.filter(p => startYear(p.year) === null);
  function product(p: Project) {
    return <article className={styles.timelineProduct} key={p.id}>
      <div className={styles.timelineMeta}><span>{p.category}</span><span>{p.year}</span></div>
      <button onClick={() => onSelect(p)} className={styles.productLink}><h3>{p.title}</h3><span>↗</span></button>
      <p>{p.summary}</p><details><summary>Product development</summary><p>{p.role}</p><ul>{p.highlights.map(h => <li key={h}>{h}</li>)}</ul><small>Highlights from the project record; individual milestone dates are not recorded.</small></details>
      <footer><span className={styles.status}>{p.status}</span>{p.id === 'luminary' && <Link href="/luminary/">Watch the walkthrough →</Link>}</footer>
    </article>;
  }
  return <section className={styles.timeline}>
    <header><p className="eyebrow">PRODUCTS + CAREER</p><h1>A timeline of the work</h1><p>Follow the products alongside the roles that shaped them.</p><Link href="/resume">Full résumé →</Link></header>
    <div className={styles.timelineControls}><div role="group" aria-label="Timeline order"><button aria-pressed={order === 'recent'} onClick={() => setOrder('recent')}>Recent first</button><button aria-pressed={order === 'earliest'} onClick={() => setOrder('earliest')}>Earliest first</button></div><nav aria-label="Jump to year">{years.map(y => <a key={y} href={`#year-${y}`} onClick={e => {e.preventDefault(); document.getElementById(`year-${y}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{y}</a>)}{undated.length > 0 && <a href="#archive" onClick={e => {e.preventDefault(); document.getElementById('timeline-archive')?.scrollIntoView({behavior:'smooth'});}}>Undated</a>}</nav></div>
    <div className={styles.timelineTrack}>{years.map(year => <section className={styles.era} id={`year-${year}`} key={year}><div className={styles.year}>{year}</div><div className={styles.eraContent}>
      {experiences.filter(e => startYear(e.period) === year).map(e => <article key={e.company} className={styles.career}><span>CAREER · {e.period}</span><h2>{e.company}</h2><strong>{e.role}</strong><p>{e.summary}</p><Link href="/resume">Career details →</Link></article>)}
      <div className={styles.eraProducts}>{catalog.filter(p => startYear(p.year) === year).map(product)}</div>
    </div></section>)}</div>
    {undated.length > 0 && <section className={styles.archive} id="timeline-archive"><h2>More from the archive</h2><p>These projects have no verified year in the catalogue, so they aren’t placed on the dated timeline.</p><div className={styles.eraProducts}>{undated.map(product)}</div></section>}
  </section>;
}
