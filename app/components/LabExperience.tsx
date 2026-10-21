"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "../data/portfolio";
import { projectMedia } from "../data/project-media";
import { defaultLabFilters, filterLabProjects, getLabDiscovery, isLabRelease, labNeeds, labSkills, readLabFilters, writeLabFilters, type LabFilters } from "../data/lab-discovery";
import { LabPreview } from "./LabPreview";
import { ProjectMedia } from "./ProjectMedia";
import { WorkbenchHeader } from "./WorkbenchHeader";
import { Icon, type IconName } from "./WorkbenchIcons";
import styles from "./LabExperience.module.css";

const byLabOrder = (a: Project, b: Project) => Number(isLabRelease(b)) - Number(isLabRelease(a)) || (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
const initialExperiments = projects.filter((project) => project.mode === "lab").sort(byLabOrder);
const needIcons: IconName[] = ["folder", "sound", "game", "grid"];

export function LabExperience() {
  const [experiments, setExperiments] = useState<Project[]>(initialExperiments);
  const [activeId, setActiveId] = useState("");
  const [filters, setFilters] = useState<LabFilters>(defaultLabFilters);
  const detailRef = useRef<HTMLDialogElement>(null);
  const browseRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);

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
  const activeKey = active?.id;
  useEffect(() => {
    const dialog = detailRef.current;
    if (!dialog || !activeKey) return;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => dialog.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(focusFrame);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [activeKey]);

  const results = filterLabProjects(experiments, filters);
  const needCounts = new Map(labNeeds.map((need) => [need.id, experiments.filter((project) => getLabDiscovery(project).needs.includes(need.id)).length]));
  const media = active ? projectMedia[active.id] : undefined;
  const hasMedia = Boolean(active && (active.media?.length || media));
  const filtering = filters.query !== "" || filters.need !== "all" || filters.skill !== "all" || filters.availability !== "all";
  const collection = labNeeds.find((need) => need.id === filters.need);

  function updateFilters(next: LabFilters) {
    setFilters(next);
    window.history.replaceState(null, "", window.location.pathname + writeLabFilters(window.location.search, next) + window.location.hash);
  }

  function closeDetails() {
    detailRef.current?.close();
    setActiveId("");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      else browseRef.current?.focus({ preventScroll: true });
    });
  }

  function rememberOpener(anchor: HTMLAnchorElement) {
    opener.current = anchor;
    // A repeated click on the same hash still opens its panel.
    if (window.location.hash === anchor.hash) setActiveId(anchor.hash.slice(1));
  }

  return <main className={styles.page}>
    <div className={styles.masthead}><WorkbenchHeader section="lab" /></div>
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Lab collections">
        <Link className={styles.labMark} href="/lab"><span aria-hidden="true">✳</span><strong>the lab<span>by Jake</span></strong></Link>
        <div className={styles.collectionLabel}>COLLECTIONS</div>
        <div className={styles.collections} role="group" aria-label="Browse by need">
          <button type="button" aria-pressed={filters.need === "all"} onClick={() => updateFilters({ ...filters, need: "all" })}><Icon name="grid" size={16} /><span>All experiments</span><small>{experiments.length}</small></button>
          {labNeeds.map((need, i) => <button type="button" key={need.id} aria-pressed={filters.need === need.id} onClick={() => updateFilters({ ...filters, need: filters.need === need.id ? "all" : need.id })}><Icon name={needIcons[i]} size={16} /><span>{need.label}</span><small>{needCounts.get(need.id)}</small></button>)}
        </div>
        <div className={styles.sidebarNote}><span className={styles.noteSymbol} aria-hidden="true">↳</span><p>Things I wanted<br />to exist.</p><span>AN ONGOING COLLECTION</span></div>
        <a className={styles.githubLink} href="https://github.com/nascarjake" target="_blank" rel="noreferrer"><Icon name="code" size={15} /> Find me on GitHub <Icon name="external" size={12} /></a>
      </aside>

      <section className={styles.browser} id="find-a-tool" aria-labelledby="lab-title">
        <header className={styles.browserHeading}>
          <div><h1 ref={browseRef} tabIndex={-1} id="lab-title">{collection?.label ?? "AI Lab"}<span className={styles.titleDot}>.</span></h1><p>{collection?.description ?? "Small tools and open-ended experiments from my workbench."}</p></div>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.search}><Icon name="search" size={17} /><span className={styles.srOnly}>Search a task or tool</span><input type="search" value={filters.query} onChange={(event) => updateFilters({ ...filters, query: event.target.value })} placeholder="Search experiments…" /></label>
          <label className={styles.select}><span className={styles.srOnly}>Skill / capability</span><select value={filters.skill} onChange={(event) => updateFilters({ ...filters, skill: event.target.value as LabFilters["skill"] })}><option value="all">Any capability</option>{labSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}</select></label>
          <label className={styles.select}><span className={styles.srOnly}>Availability</span><select value={filters.availability} onChange={(event) => updateFilters({ ...filters, availability: event.target.value as LabFilters["availability"] })}><option value="all">All stages</option><option value="release">Public releases</option><option value="in-progress">Prototypes + research</option></select></label>
        </div>
        <div className={styles.resultsHeading}><p role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? "experiment" : "experiments"}{filtering ? " found" : " on the bench"}</p>{filtering ? <button type="button" onClick={() => updateFilters(defaultLabFilters)}>Reset filters <span aria-hidden="true">×</span></button> : null}</div>

        <div className={styles.cards} data-filtered={filtering}>
          {results.map((project) => {
            const info = getLabDiscovery(project);
            return <article className={styles.card} key={project.id} data-featured={!filtering && project.id === "clip-my-screen"}>
              <a className={styles.cardPreview} href={"#" + project.id} aria-label={"Preview " + project.title} onClick={(event) => rememberOpener(event.currentTarget)}><LabPreview project={project} /><span className={styles.previewArrow}><Icon name="arrow" size={19} /></span></a>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}><h2><a href={"#" + project.id} aria-label={"Explore " + project.title} onClick={(event) => rememberOpener(event.currentTarget)}>{project.title}</a></h2><span className={styles.status} data-release={isLabRelease(project)}><i />{project.status}</span></div>
                <p>{info.outcome}</p>
                <div className={styles.cardFoot}><div className={styles.skills} aria-label="Capabilities">{labSkills.filter((skill) => info.skills.includes(skill.id)).map((skill) => <button type="button" key={skill.id} aria-pressed={filters.skill === skill.id} onClick={() => updateFilters({ ...filters, skill: filters.skill === skill.id ? "all" : skill.id })}>{skill.label}</button>)}</div>{project.dossier.source && <a className={styles.sourceLink} href={project.dossier.source.url} aria-label={project.dossier.source.label}>{project.id === "clip-my-screen" ? "Download" : "Source"}<Icon name="external" size={12} /></a>}</div>
              </div>
            </article>;
          })}
        </div>
        {!results.length && <div className={styles.empty}><span aria-hidden="true">∅</span><h2>{experiments.length ? "Nothing on this shelf. Yet." : "More experiments are on their way."}</h2><p>Try another search or clear a filter to see the rest of the collection.</p><button type="button" onClick={() => updateFilters(defaultLabFilters)}>See all experiments <Icon name="arrow" size={15} /></button></div>}
        <footer className={styles.footer}><span>Built, broken, rebuilt. By <Link href="/resume">Jacob Clark</Link>.</span><Link href="/updates">Notes from the workbench <Icon name="arrow" size={13} /></Link></footer>
      </section>
    </div>

    <dialog className={styles.detail} ref={detailRef} aria-labelledby="lab-tool-title" onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); closeDetails(); }} onClick={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
      {active && <div className={styles.detailInner} id={active.id}>
        <div className={styles.detailToolbar}><span>THE LAB / {active.signal}</span><button type="button" onClick={closeDetails} aria-label="Close experiment details"><Icon name="close" size={18} /></button></div>
        <div className={styles.detailPreview} key={active.id}>{hasMedia ? <ProjectMedia media={media} assets={active.media} title={active.title} /> : <LabPreview project={active} />}</div>
        <div className={styles.detailCopy}><span className={styles.status} data-release={isLabRelease(active)}><i />{active.status}</span><h2 id="lab-tool-title">{active.title}</h2><p>{active.summary}</p>
          {active.dossier.source && <a className={styles.primaryAction} href={active.dossier.source.url}>{active.dossier.source.label}<Icon name="external" size={15} /></a>}
          <section><h3>Put it to use</h3><ul>{getLabDiscovery(active).uses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h3>Inside the experiment</h3><ul>{active.highlights.map((item) => <li key={item}>{item}</li>)}</ul></section>
          {active.dossier.note && <p className={styles.note}>{active.dossier.note}</p>}
          <details className={styles.buildNotes}><summary>Under the hood</summary><p>{active.dossier.scope || active.eyebrow}</p><ul>{active.dossier.ownership.map((item) => <li key={item}>{item}</li>)}</ul><div className={styles.stack}>{active.stack.map((item) => <span key={item}>{item}</span>)}</div></details>
          {!hasMedia && <p className={styles.illustrationNote}>The illustration is a concept study, not a product screenshot.</p>}
        </div>
      </div>}
    </dialog>
  </main>;
}
