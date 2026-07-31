"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects, timeline, type Project } from "../data/portfolio";
import { AmbientField } from "./AmbientField";

type View = "work" | "resume" | "signal";

export function UniverseExperience() {
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView] = useState<View>("work");
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, rotation: 0 });

  const step = 360 / projects.length;

  const rotate = useCallback(
    (direction: number) => {
      setSelected(null);
      setRotation((value) => value + step * direction);
    },
    [step],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selected) setSelected(null);
        else setView("work");
      }
      if (view !== "work" || selected) return;
      if (event.key === "ArrowRight") rotate(-1);
      if (event.key === "ArrowLeft") rotate(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rotate, selected, view]);

  const activeIndex = useMemo(() => {
    const normalized = ((-rotation / step) % projects.length + projects.length) % projects.length;
    return Math.round(normalized) % projects.length;
  }, [rotation, step]);

  return (
    <main
      className={`universe view-${view} ${dragging ? "is-dragging" : ""}`}
      onWheel={(event) => {
        if (view !== "work" || selected) return;
        if (Math.abs(event.deltaY) > 8) rotate(event.deltaY > 0 ? -1 : 1);
      }}
    >
      <AmbientField intensity={1.4} />
      <div className="noise" aria-hidden="true" />
      <div className="universe-grid" aria-hidden="true" />

      <header className="universe-header">
        <Link href="/" className="back-home">
          <span>←</span> EXIT UNIVERSE
        </Link>
        <nav aria-label="Portfolio sections">
          {(["work", "resume", "signal"] as View[]).map((item) => (
            <button
              key={item}
              className={view === item ? "active" : ""}
              onClick={() => {
                setSelected(null);
                setView(item);
              }}
            >
              {item === "work" ? "THE WORK" : item.toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="archive-status">
          <i />
          ARCHIVE ONLINE
        </div>
      </header>

      <section className="universe-title">
        <span>JACOB CLARK / SELECTED WORK</span>
        <h1>THE DEVELOPER UNIVERSE</h1>
        <p>Drag the field. Follow a signal. Open what pulls you in.</p>
      </section>

      <section
        className="project-space"
        aria-label="Interactive project constellation"
        onPointerDown={(event) => {
          if (view !== "work" || selected) return;
          setDragging(true);
          dragStart.current = { x: event.clientX, rotation };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging) return;
          setRotation(dragStart.current.rotation + (event.clientX - dragStart.current.x) * 0.24);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="space-axis axis-x" aria-hidden="true" />
        <div className="space-axis axis-y" aria-hidden="true" />
        <div className="central-reactor" aria-hidden="true">
          <div className="reactor-ring ring-one" />
          <div className="reactor-ring ring-two" />
          <div className="reactor-center">JC</div>
        </div>
        <div className="project-orbit" aria-hidden="true" />

        {projects.map((project, index) => {
          const angle = index * step + rotation;
          const radians = (angle * Math.PI) / 180;
          const x = Math.sin(radians) * 38;
          const z = Math.cos(radians);
          const y = Math.sin(radians * 1.35) * 7;
          const scale = 0.66 + (z + 1) * 0.21;
          const opacity = 0.25 + (z + 1) * 0.36;
          const tilt = x / -15;
          const isActive = index === activeIndex;

          return (
            <button
              key={project.id}
              className={`project-node accent-${project.accent} ${isActive ? "is-active" : ""}`}
              style={
                {
                  "--node-x": `${x}vw`,
                  "--node-y": `${y}vh`,
                  "--node-scale": scale,
                  "--node-opacity": opacity,
                  "--node-z": Math.round((z + 1) * 50),
                  "--node-tilt": `${tilt}deg`,
                } as React.CSSProperties
              }
              onClick={(event) => {
                event.stopPropagation();
                if (isActive) setSelected(project);
                else setRotation(-index * step);
              }}
              aria-label={`${project.title}. ${isActive ? "Open project signal" : "Bring into focus"}`}
            >
              <span className="node-signal">{project.signal}</span>
              <span className="node-index">/{project.index}</span>
              <strong>{project.title}</strong>
              <span className="node-eyebrow">{project.eyebrow}</span>
              <span className="node-open">{isActive ? "OPEN SIGNAL ↗" : "ACQUIRE"}</span>
              <i className="node-corner corner-a" />
              <i className="node-corner corner-b" />
            </button>
          );
        })}
      </section>

      <div className="universe-controls">
        <button onClick={() => rotate(1)} aria-label="Previous project">←</button>
        <span>
          <b>{String(activeIndex + 1).padStart(2, "0")}</b> / {String(projects.length).padStart(2, "0")}
        </span>
        <button onClick={() => rotate(-1)} aria-label="Next project">→</button>
      </div>

      <div className="input-hint">
        <span>MOUSE / TOUCH</span>
        <b>DRAG TO ORBIT</b>
        <i />
        <span>KEYS</span>
        <b>← →</b>
      </div>

      {selected && (
        <ProjectSignal project={selected} onClose={() => setSelected(null)} />
      )}

      <section className={`system-panel resume-panel ${view === "resume" ? "is-open" : ""}`}>
        <button className="panel-close" onClick={() => setView("work")} aria-label="Close resume">
          ×
        </button>
        <div className="panel-kicker">CAREER TELEMETRY / 24+ YEARS</div>
        <h2>LONG RANGE<br />THINKING.</h2>
        <p className="panel-lead">
          Two decades across shifting stacks, changing platforms, and one
          constant: make the complicated feel natural.
        </p>
        <div className="timeline">
          {timeline.map((item, index) => (
            <article key={item.year}>
              <span>0{index + 1}</span>
              <time>{item.year}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="resume-dropzone">
          <span>FULL RÉSUMÉ MODULE</span>
          <p>Ready for your PDF and complete work history.</p>
          <b>DATA PORT AVAILABLE</b>
        </div>
      </section>

      <section className={`system-panel signal-panel ${view === "signal" ? "is-open" : ""}`}>
        <button className="panel-close" onClick={() => setView("work")} aria-label="Close contact panel">
          ×
        </button>
        <div className="panel-kicker">OPEN CHANNEL / DIRECT</div>
        <h2>LET&apos;S MAKE<br />THE STRANGE<br />THING REAL.</h2>
        <p className="panel-lead">
          Bring a hard problem, an ambitious product, or an experiment that
          doesn&apos;t have a category yet.
        </p>
        <div className="signal-actions">
          <button type="button" disabled>
            EMAIL CHANNEL / ADD ADDRESS <span>○</span>
          </button>
          <a href="https://discord.com/" target="_blank" rel="noreferrer">
            JOIN DISCORD <span>↗</span>
          </a>
        </div>
        <div className="signal-wave" aria-hidden="true">
          {Array.from({ length: 42 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--wave": index,
                  "--wave-height": `${18 + Math.abs(Math.sin(index * 0.58)) * 100}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectSignal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <aside className={`project-signal accent-${project.accent}`}>
      <button className="panel-close" onClick={onClose} aria-label="Close project signal">
        ×
      </button>
      <div className="signal-meta">
        <span>SIGNAL / {project.signal}</span>
        <span>{project.year}</span>
      </div>
      <div className="signal-number">{project.index}</div>
      <div className="signal-body">
        <span className="signal-eyebrow">{project.eyebrow}</span>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <div className="signal-role">
          <span>ROLE</span>
          <b>{project.role}</b>
        </div>
        <div className="signal-stack">
          {project.stack.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      <div className="case-file">
        <span>CASE FILE STATUS</span>
        <b>READY FOR PROJECT DETAILS</b>
        <p>
          Drop the real screenshots, metrics, story, and links into this modular
          record when the archive is connected.
        </p>
      </div>
    </aside>
  );
}
