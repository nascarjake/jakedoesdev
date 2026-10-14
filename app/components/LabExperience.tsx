"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "../data/portfolio";
import { projectMedia } from "../data/project-media";
import { ExperimentVisual } from "./LabVisuals";
import { ProjectMedia } from "./ProjectMedia";
import { WorkbenchHeader } from "./WorkbenchHeader";
import styles from "./LabExperience.module.css";

const byLabOrder = (a: Project, b: Project) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
const initialExperiments = projects.filter((project) => project.mode === "lab").sort(byLabOrder);

export function LabExperience() {
  const [experiments, setExperiments] = useState<Project[]>(initialExperiments);
  const [activeId, setActiveId] = useState(initialExperiments[0]?.id ?? "");
  const previewRef = useRef<HTMLDivElement>(null);

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
    const syncHash = () => setActiveId(window.location.hash.slice(1));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const active = experiments.find((project) => project.id === activeId) ?? experiments[0];
  const activeIndex = active ? experiments.findIndex((project) => project.id === active.id) : 0;
  const media = active ? projectMedia[active.id] : undefined;
  const hasMedia = Boolean(active && (active.media?.length || media));

  function selectExperiment(id: string) {
    setActiveId(id);
    window.history.replaceState(null, "", "#" + id);
    if (window.matchMedia("(max-width: 850px)").matches) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      previewRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function stepExperiment(direction: -1 | 1) {
    if (!experiments.length) return;
    const next = (activeIndex + direction + experiments.length) % experiments.length;
    selectExperiment(experiments[next].id);
  }

  return <main className={styles.page}>
    <div className={styles.frame}>
      <div className={styles.headerTheme}><WorkbenchHeader section="lab" /></div>

      <section className={styles.intro} aria-labelledby="lab-title">
        <div className={styles.introGlow} aria-hidden="true" />
        <div className={styles.introTop}><span><i /> JACOB CLARK / EXPERIMENTS</span><span>OPEN SYSTEMS · WORK IN MOTION</span></div>
        <div className={styles.introMain}>
          <h1 id="lab-title">Ideas in <em>motion.</em></h1>
          <p>Curious tools, rough edges, and the moments where an idea starts to behave like a product. Pick a project to explore its moving parts.</p>
        </div>
        <div className={styles.introBottom}><span>AI LAB / {String(experiments.length).padStart(2, "0")} PROJECTS</span><a href="#lab-workbench">EXPLORE THE WORKBENCH <span aria-hidden="true">↘</span></a></div>
      </section>

      <section className={styles.workbench} id="lab-workbench" aria-labelledby="lab-workbench-title">
        <div className={styles.workbenchHeading}>
          <div><span className={styles.overline}>01 / THE EXPERIMENT INDEX</span><h2 id="lab-workbench-title">Select a signal.</h2></div>
          <span className={styles.headingAside}><i /> PROJECT PREVIEWS / VISUAL STUDIES</span>
        </div>

        <div className={styles.explorer}>
          <nav className={styles.rail} aria-label="AI Lab projects">
            <div className={styles.railTop}><span>PROJECT FILES</span><span>{String(experiments.length).padStart(2, "0")} TOTAL</span></div>
            {experiments.map((project, index) => <button
              type="button"
              className={styles.projectChoice}
              data-active={active?.id === project.id}
              aria-pressed={active?.id === project.id}
              onClick={() => selectExperiment(project.id)}
              key={project.id}
            >
              <span className={styles.choiceIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.choiceCopy}><strong>{project.title}</strong><small>{project.eyebrow}</small></span>
              <span className={styles.choiceArrow} aria-hidden="true">↗</span>
            </button>)}
            {!experiments.length && <p className={styles.empty}>New experiments will appear here when they are published.</p>}
            <div className={styles.railFoot}><span>EXPLORE / QUESTION / BUILD</span><span aria-hidden="true">✳</span></div>
          </nav>

          <div className={styles.previewPane} ref={previewRef}>
            <div className={styles.previewTop}>
              <span><i /> {active ? "FILE " + String(activeIndex + 1).padStart(2, "0") + " / " + String(experiments.length).padStart(2, "0") : "AWAITING SIGNAL"}</span>
              <span>{hasMedia ? "PROJECT MEDIA" : "CONCEPT PREVIEW"}</span>
            </div>
            <div className={styles.previewStage} key={active?.id ?? "empty"}>
              {active ? hasMedia
                ? <ProjectMedia media={media} assets={active.media} title={active.title} />
                : <ExperimentVisual id={active.id} title={active.title} signal={active.signal} />
                : <div className={styles.noPreview}>No experiments published yet.</div>}
            </div>
            <div className={styles.previewBottom}>
              <span><strong>{active?.title ?? "The next experiment"}</strong><small>{active?.status ?? "On the bench"}</small></span>
              <div className={styles.previewControls}><button type="button" onClick={() => stepExperiment(-1)} disabled={!experiments.length} aria-label="Previous experiment">←</button><button type="button" onClick={() => stepExperiment(1)} disabled={!experiments.length} aria-label="Next experiment">→</button></div>
            </div>
          </div>
        </div>

        {active && <article className={styles.story} key={active.id} aria-labelledby="lab-project-title">
          <div className={styles.storyLead}>
            <span className={styles.overline}>02 / PROJECT RECORD · {active.signal}</span>
            <h2 id="lab-project-title">{active.title}</h2>
            <p>{active.summary}</p>
            {active.dossier.source && <a className={styles.source} href={active.dossier.source.url} target="_blank" rel="noreferrer">{active.dossier.source.label} <span aria-hidden="true">↗</span></a>}
          </div>
          <div className={styles.storyFacts}>
            <div className={styles.storyMeta}><span>{active.status}</span><span>{active.year}</span><span>{active.category}</span></div>
            <section><h3>The question</h3><p>{active.dossier.scope || active.eyebrow}</p></section>
            <section><h3>What I built</h3><ul>{(active.dossier.ownership.length ? active.dossier.ownership : active.highlights).map((item) => <li key={item}>{item}</li>)}</ul></section>
            {active.dossier.note && <p className={styles.note}>{active.dossier.note}</p>}
            <div className={styles.stack}><span>TOOLS IN PLAY</span>{active.stack.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </article>}
      </section>
      <footer className={styles.footer}><span>THE EXPERIMENT CONTINUES.</span><Link href="/universe">See production work <span aria-hidden="true">↗</span></Link></footer>
    </div>
  </main>;
}
