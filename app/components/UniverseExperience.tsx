"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  projects,
  type Project,
  type ProjectCategory,
} from "../data/portfolio";
import { AmbientField } from "./AmbientField";

type View = "work" | "directory" | "signal";

export function UniverseExperience() {
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView] = useState<View>("work");
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "All">("All");
  const dragStart = useRef({ x: 0, rotation: 0 });
  const lastWheel = useRef(0);

  const step = 360 / projects.length;
  const categories = useMemo(
    () =>
      ["All", ...Array.from(new Set(projects.map((project) => project.category)))] as const,
    [],
  );
  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory =
        category === "All" || project.category === category;
      const matchesQuery =
        !needle ||
        [
          project.title,
          project.eyebrow,
          project.summary,
          project.category,
          project.role,
          ...project.stack,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

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

  const openProject = (project: Project) => {
    const index = projects.findIndex((item) => item.id === project.id);
    setRotation(-index * step);
    setView("work");
    setSelected(project);
  };

  return (
    <main
      className={`universe view-${view} ${dragging ? "is-dragging" : ""}`}
      onWheel={(event) => {
        if (view !== "work" || selected) return;
        const now = Date.now();
        if (Math.abs(event.deltaY) > 8 && now - lastWheel.current > 420) {
          lastWheel.current = now;
          rotate(event.deltaY > 0 ? -1 : 1);
        }
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
          <button
            className={view === "work" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("work");
            }}
          >
            EXPLORE
          </button>
          <button
            className={view === "directory" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("directory");
            }}
          >
            DIRECTORY <sup>{projects.length}</sup>
          </button>
          <Link href="/resume">RÉSUMÉ</Link>
          <button
            className={view === "signal" ? "active" : ""}
            onClick={() => {
              setSelected(null);
              setView("signal");
            }}
          >
            SIGNAL
          </button>
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
          const outerRing = index % 2 === 1;
          const x = Math.sin(radians) * (outerRing ? 44 : 34);
          const z = Math.cos(radians);
          const y =
            Math.sin(radians * 1.35) * 6 + (outerRing ? 9 : -7);
          const scale = 0.56 + (z + 1) * 0.22;
          const opacity = 0.08 + (z + 1) * 0.43;
          const tilt = x / -15;
          const isActive = index === activeIndex;

          return (
            <button
              key={project.id}
              className={`project-node accent-${project.accent} ${isActive ? "is-active" : ""} ${z < -0.25 ? "is-distant" : ""}`}
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

      <button
        className="directory-shortcut"
        onClick={() => {
          setSelected(null);
          setView("directory");
        }}
      >
        <span>CAN&apos;T MISS A THING</span>
        <b>OPEN COMPLETE DIRECTORY</b>
        <i>{projects.length}</i>
      </button>

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

      <section
        className={`directory-panel ${view === "directory" ? "is-open" : ""}`}
        aria-label="Complete project directory"
      >
        <button
          className="panel-close"
          onClick={() => setView("work")}
          aria-label="Close project directory"
        >
          ×
        </button>
        <header className="directory-heading">
          <div>
            <span className="panel-kicker">
              COMPLETE ARCHIVE / {projects.length} OBJECTS
            </span>
            <h2>PROJECT<br />DIRECTORY.</h2>
          </div>
          <p>
            The universe is for wandering. This is the map. Every known
            production project is indexed here—even when screenshots, video, or
            a live URL haven&apos;t been connected yet.
          </p>
        </header>

        <div className="directory-tools">
          <label>
            <span>SEARCH ARCHIVE</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try AI, mobile, WebGL, enterprise…"
            />
          </label>
          <div className="directory-filters" aria-label="Project categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="directory-results" aria-live="polite">
          <div className="directory-count">
            SHOWING {filteredProjects.length} / {projects.length}
          </div>
          {filteredProjects.map((project) => (
            <button
              className={`directory-record accent-${project.accent}`}
              key={project.id}
              onClick={() => openProject(project)}
            >
              <span className="directory-index">{project.index}</span>
              <span className="directory-title">
                <b>{project.title}</b>
                <small>{project.eyebrow}</small>
              </span>
              <span className="directory-category">{project.category}</span>
              <span className="directory-status">{project.status}</span>
              <span className="directory-open">OPEN OBJECT ↗</span>
            </button>
          ))}
          {filteredProjects.length === 0 && (
            <div className="directory-empty">
              NO SIGNALS MATCH THAT SEARCH.
            </div>
          )}
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
          <a href="mailto:jakeleeclark@gmail.com">
            SEND AN EMAIL <span>↗</span>
          </a>
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
      <ul className="signal-highlights">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="case-file">
        <span>OBJECT STATUS</span>
        <b>{project.status.toUpperCase()}</b>
        <p>
          Narrative loaded. Screenshots, video, metrics, and live links can be
          connected to this record when available.
        </p>
      </div>
    </aside>
  );
}
