"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "../data/portfolio";
import { projectMedia } from "../data/project-media";
import { defaultLabFilters, filterLabProjects, getLabDiscovery, isLabRelease, labNeeds, labSkills, readLabFilters, writeLabFilters, type LabFilters } from "../data/lab-discovery";
import { ExperimentVisual } from "./LabVisuals";
import { ProjectMedia } from "./ProjectMedia";
import { WorkbenchHeader } from "./WorkbenchHeader";
import styles from "./LabExperience.module.css";

const byLabOrder = (a: Project, b: Project) => Number(isLabRelease(b)) - Number(isLabRelease(a)) || (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
const initialExperiments = projects.filter((project) => project.mode === "lab").sort(byLabOrder);

export function LabExperience() {
  const [experiments, setExperiments] = useState<Project[]>(initialExperiments);
  const [activeId, setActiveId] = useState("");
  const [filters, setFilters] = useState<LabFilters>(defaultLabFilters);
  const detailRef = useRef<HTMLElement>(null);
  const browseRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const focusDetail = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Lab catalogue unavailable");
        return await response.json() as { projects?: Project[] };
      })
      .then((payload) => {
        if (Array.isArray(payload.projects)) setExperiments(payload.projects.filter((project) => project.mode === "lab").sort(byLabOrder));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const syncLocation = () => {
      setFilters(readLabFilters(window.location.search));
      setActiveId(window.location.hash.slice(1));
    };
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, []);

  const active = experiments.find((project) => project.id === activeId);
  useEffect(() => {
    if (!active) return;
    // Defer until React has mounted the shared-link target, including API-only tools.
    const frame = requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      if (focusDetail.current) detailRef.current?.focus({ preventScroll: true });
      focusDetail.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const results = filterLabProjects(experiments, filters);
  const needCounts = new Map(labNeeds.map((need) => [need.id, experiments.filter((project) => getLabDiscovery(project).needs.includes(need.id)).length]));
  const media = active ? projectMedia[active.id] : undefined;
  const hasMedia = Boolean(active && (active.media?.length || media));
  const filtering = filters.query !== "" || filters.need !== "all" || filters.skill !== "all" || filters.availability !== "all";

  function updateFilters(next: LabFilters) {
    setFilters(next);
    window.history.replaceState(null, "", window.location.pathname + writeLabFilters(window.location.search, next) + window.location.hash);
  }

  function closeDetails() {
    setActiveId("");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (opener.current?.isConnected) opener.current.focus();
    else browseRef.current?.focus();
  }

  return <main className={styles.page}>
    <div className={styles.frame}>
      <div className={styles.headerTheme}><WorkbenchHeader section="lab" /></div>
      <section className={styles.intro} aria-labelledby="lab-title">
        <span className={styles.overline}>JAKE DOES DEV / AI LAB</span>
        <div className={styles.introMain}>
          <h1 id="lab-title">Start with a need.<br /><em>Find your next tool.</em></h1>
          <div><p>Something to capture, create, or make easier? Explore tools by what they help you do.</p><span className={styles.introNote}>{experiments.length} TOOLS & EXPERIMENTS · BUILT BY JACOB CLARK</span></div>
        </div>
        <div className={styles.introFoot}><span>Public releases sit alongside prototypes and research. Each tool tells you where it stands.</span><a href="#find-a-tool">FIND A TOOL <span aria-hidden="true">↘</span></a></div>
      </section>

      <section className={styles.browser} id="find-a-tool" aria-labelledby="browse-title">
        <div className={styles.sectionHeading}><div><span className={styles.overline}>01 / WHAT DO YOU WANT TO DO?</span><h2 ref={browseRef} tabIndex={-1} id="browse-title">Browse by need.</h2></div><button type="button" className={styles.textButton} onClick={() => updateFilters(defaultLabFilters)}>Show everything ↗</button></div>
        <div className={styles.needs} role="group" aria-label="Browse by need">
          {labNeeds.map((need) => <button type="button" key={need.id} aria-pressed={filters.need === need.id} className={styles.need} onClick={() => updateFilters({ ...filters, need: filters.need === need.id ? "all" : need.id })}>
            <span className={styles.needTop}><span aria-hidden="true">{need.symbol}</span><small>{needCounts.get(need.id)} {needCounts.get(need.id) === 1 ? "TOOL" : "TOOLS"}</small></span>
            <strong>{need.label}</strong><span>{need.description}</span>
          </button>)}
        </div>
        <div className={styles.filters}>
          <label className={styles.search}><span>Search a task or tool</span><input type="search" value={filters.query} onChange={(event) => updateFilters({ ...filters, query: event.target.value })} placeholder="Try “research notes” or “screen replay”" /></label>
          <label><span>Skill / capability</span><select value={filters.skill} onChange={(event) => updateFilters({ ...filters, skill: event.target.value as LabFilters["skill"] })}><option value="all">All capabilities</option>{labSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}</select></label>
          <label><span>Availability</span><select value={filters.availability} onChange={(event) => updateFilters({ ...filters, availability: event.target.value as LabFilters["availability"] })}><option value="all">Releases + experiments</option><option value="release">Public releases</option><option value="in-progress">Prototypes + research</option></select></label>
        </div>
        <div className={styles.resultsHeading}><h2>Tools for the job</h2><p role="status" aria-live="polite" aria-atomic="true">{results.length} of {experiments.length} tools{filters.need !== "all" ? " · " + labNeeds.find((need) => need.id === filters.need)?.label : ""}</p>{filtering && <button type="button" className={styles.textButton} onClick={() => updateFilters(defaultLabFilters)}>Clear filters ×</button>}</div>
        <div className={styles.cards}>
          {results.map((project) => {
            const info = getLabDiscovery(project);
            return <article className={styles.card} key={project.id} data-release={isLabRelease(project)}>
              <div className={styles.cardTop}><span>{project.title}</span><span className={styles.status}>{project.status}</span></div>
              <div className={styles.flow} aria-label={info.flow.join(" to ")}><span>{info.flow[0]}</span><i aria-hidden="true">→</i><strong>{info.flow[1]}</strong></div>
              <h3>{info.outcome}</h3>
              <ul className={styles.uses}>{info.uses.map((use) => <li key={use}>{use}</li>)}</ul>
              <div className={styles.skills} aria-label="Capabilities">{labSkills.filter((skill) => info.skills.includes(skill.id)).map((skill) => <button type="button" key={skill.id} aria-pressed={filters.skill === skill.id} onClick={() => updateFilters({ ...filters, skill: filters.skill === skill.id ? "all" : skill.id })}>{skill.label}</button>)}</div>
              <div className={styles.cardActions}>{project.dossier.source && <a className={styles.primaryAction} href={project.dossier.source.url}>{project.dossier.source.label} <span aria-hidden="true">↗</span></a>}<a href={"#" + project.id} aria-label={"Explore " + project.title} onClick={(event) => { opener.current = event.currentTarget; focusDetail.current = true; if (activeId === project.id) detailRef.current?.scrollIntoView({ behavior: "instant" }); }}>Explore {project.dossier.source ? "details" : "the experiment"} <span aria-hidden="true">→</span></a></div>
            </article>;
          })}
        </div>
        {!results.length && <div className={styles.empty}><h3>{experiments.length ? "No tools match this combination yet." : "New tools are on the way."}</h3><p>Try another need or capability, or browse the whole Lab.</p><button type="button" onClick={() => updateFilters(defaultLabFilters)}>Show all tools →</button></div>}
      </section>

      {active && <section className={styles.detail} ref={detailRef} tabIndex={-1} id={active.id} aria-labelledby="lab-tool-title">
        <div className={styles.detailHeading}><span className={styles.overline}>02 / A CLOSER LOOK</span><button type="button" onClick={closeDetails}>Back to browsing ↑</button></div>
        <div className={styles.detailColumns}>
          <div className={styles.detailCopy}><span className={styles.status}>{active.status}</span><h2 id="lab-tool-title">{active.title}</h2><p>{active.summary}</p><h3>What you can do</h3><ul>{active.highlights.map((item) => <li key={item}>{item}</li>)}</ul>{active.dossier.source && <a className={styles.primaryAction} href={active.dossier.source.url}>{active.dossier.source.label} ↗</a>}{active.dossier.note && <p className={styles.note}>{active.dossier.note}</p>}
            <details className={styles.buildNotes}><summary>How it’s built</summary><p>{active.dossier.scope || active.eyebrow}</p><ul>{active.dossier.ownership.map((item) => <li key={item}>{item}</li>)}</ul><div className={styles.stack}>{active.stack.map((item) => <span key={item}>{item}</span>)}</div></details>
          </div>
          <div className={styles.preview}><div className={styles.previewLabel}>{hasMedia ? "PROJECT MEDIA" : "CONCEPT VISUAL · NOT A PRODUCT SCREENSHOT"}</div><div className={styles.previewStage} key={active.id}>{hasMedia ? <ProjectMedia media={media} assets={active.media} title={active.title} /> : <ExperimentVisual id={active.id} title={active.title} signal={active.signal} />}</div></div>
        </div>
      </section>}
      <footer className={styles.footer}><span>SMALL TOOLS. NEW POSSIBILITIES.</span><Link href="/universe">Explore the engineering work ↗</Link></footer>
    </div>
  </main>;
}
