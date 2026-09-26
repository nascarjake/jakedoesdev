"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { projects, type Project } from "../data/portfolio";
import { openWorkbenchPanel } from "../lib/workbench-navigation";
import { Icon } from "./WorkbenchIcons";
import { WorkbenchShell, WorkspaceToolbar } from "./WorkbenchShell";
import dynamic from "next/dynamic";
import { projectMedia } from "../data/project-media";
import { ProjectMedia, EzformsClients } from "./ProjectMedia";

const BiopsyDemo = dynamic(() => import("./BiopsyDemo"), { ssr: false, loading: () => <p>Preparing the synthetic biopsy walkthrough…</p> });

function subscribeToProject(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}
function getProjectHash() {
  return window.location.hash.slice(1);
}
const filters = [
  "All projects",
  "Enterprise",
  "AI + Automation",
  "Mobile",
  "Games",
  "Creative Tools",
  "SaaS",
];

function ProjectIllustration({ project }: { project: Project }) {
  const mobile = project.category === "Mobile";
  const game = project.category === "Games";
  return (
    <div
      className={`project-illustration illustration-${project.accent} ${mobile ? "illustration-mobile" : ""} ${game ? "illustration-game" : ""}`}
      aria-hidden="true"
    >
      <div className="illustration-grid" />
      <span className="illustration-label">
        {project.category} / {project.signal}
      </span>
      {mobile ? (
        <div className="illustrated-phone">
          <span className="phone-camera" />
          <span className="phone-app-icon">
            <Icon name="phone" size={30} />
          </span>
          <strong>{project.title}</strong>
          <span className="phone-line" />
          <span className="phone-line short" />
          <div className="phone-tiles">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="phone-action">IN THE FIELD →</span>
        </div>
      ) : game ? (
        <div className="project-game-art">
          <span className="game-orbit orbit-a" />
          <span className="game-orbit orbit-b" />
          <span className="game-art-symbol">
            {project.id === "daho" ? "16" : "TUG"}
          </span>
          <span className="game-art-note">{project.eyebrow}</span>
        </div>
      ) : (
        <div className="architecture-art">
          <div className="architecture-node">
            <Icon name="code" size={24} />
            <span>{project.stack[0]}</span>
          </div>
          <span className="architecture-connector" />
          <div className="architecture-hub">
            <span>{project.signal}</span>
            <small>
              {project.category === "Creative Tools"
                ? "CREATE + ITERATE"
                : "BUILD + CONNECT"}
            </small>
          </div>
          <span className="architecture-connector" />
          <div className="architecture-node">
            <Icon
              name={project.category === "Creative Tools" ? "grid" : "folder"}
              size={24}
            />
            <span>{project.stack[project.stack.length - 1]}</span>
          </div>
        </div>
      )}
      <div className="illustration-caption">
        <span>PROJECT {project.index}</span>
        <span>{project.year}</span>
      </div>
    </div>
  );
}

export function UniverseExperience() {
  const hash = useSyncExternalStore(
    subscribeToProject,
    getProjectHash,
    () => "",
  );
  const view = projects.some((project) => project.id === hash) ? "preview" : "directory";
  function setView(next: "preview" | "directory") {
    openWorkbenchPanel(next === "directory" ? "directory" : selected.id);
  }
  const [filter, setFilter] = useState("All projects");
  const [query, setQuery] = useState("");
  const selected =
    projects.find((project) => project.id === hash) ?? projects[0];
  const filtered = projects.filter(
    (project) =>
      (filter === "All projects" || project.category === filter) &&
      `${project.title} ${project.summary} ${project.stack.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function select(project: Project) {
    openWorkbenchPanel(project.id);
  }
  return (
    <WorkbenchShell section="projects" selectedProject={view === "preview" ? selected.id : undefined}>
      <WorkspaceToolbar label="Project archive">
        <div className="view-switch" role="group" aria-label="Project view">
          <button
            aria-pressed={view === "preview"}
            onClick={() => setView("preview")}
          >
            <Icon name="file" size={14} /> Preview
          </button>
          <button
            aria-pressed={view === "directory"}
            onClick={() => setView("directory")}
          >
            <Icon name="grid" size={14} /> All projects
          </button>
        </div>
      </WorkspaceToolbar>
      {view === "preview" ? (
        <article className="project-detail" key={selected.id}>
          <header className="detail-heading">
            <p className="eyebrow">
              {selected.category} <span className="eyebrow-divider">/</span>{" "}
              {selected.year}
            </p>
            <h1>
              {selected.title}
              <span>.</span>
            </h1>
            <p>{selected.eyebrow}</p>
          </header>
          {selected.id === "tumor-identifier" ? <BiopsyDemo /> : projectMedia[selected.id] ? <ProjectMedia media={projectMedia[selected.id]} title={selected.title} /> : <ProjectIllustration project={selected} />}
          {selected.id === "ezforms" && <EzformsClients />}
          <div className="project-facts">
            <div>
              <span>MY ROLE</span>
              <strong>{selected.role}</strong>
            </div>
            <div>
              <span>BUILT WITH</span>
              <strong>{selected.stack.join(" · ")}</strong>
            </div>
            <div>
              <span>PROJECT STATUS</span>
              <strong>{selected.status}</strong>
            </div>
          </div>
          <section className="project-story-copy">
            <div>
              <p className="eyebrow">THE SHORT VERSION</p>
              <h2>
                From idea to
                <br />
                something useful.
              </h2>
            </div>
            <div>
              <p className="project-summary">{selected.summary}</p>
              <ul>
                {selected.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </section>
          <footer className="project-detail-footer">
            <button className="text-link" onClick={() => setView("directory")}>
              <Icon name="grid" size={17} /> See all {projects.length} projects
            </button>
            <button
              className="text-link"
              onClick={() =>
                select(
                  projects[(projects.indexOf(selected) + 1) % projects.length],
                )
              }
            >
              Next project <Icon name="arrow" size={18} />
            </button>
          </footer>
        </article>
      ) : (
        <section className="project-index">
          <header className="detail-heading">
            <p className="eyebrow">THE COMPLETE COLLECTION</p>
            <h1>
              Things I’ve <em>built.</em>
            </h1>
            <p>
              Products, platforms, experiments. A few decades of following the
              interesting problems.
            </p>
          </header>
          <div className="index-tools">
            <label className="index-search">
              <Icon name="search" size={18} />
              <input
                type="search"
                aria-label="Search the complete project archive"
                placeholder="Search names, technologies, or ideas…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div
              className="filter-chips"
              role="group"
              aria-label="Filter projects"
            >
              {filters.map((item) => (
                <button
                  key={item}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <p className="results-count" aria-live="polite">
            {filtered.length} PROJECT{filtered.length === 1 ? "" : "S"} IN VIEW
          </p>
          <div className="project-index-grid">
            {filtered.map((project) => (
              <button
                key={project.id}
                onClick={() => select(project)}
                className={`index-card index-${project.accent}`}
              >
                <div>
                  <span>{project.signal}</span>
                  <Icon name="arrow" size={19} />
                </div>
                <p className="eyebrow">{project.category}</p>
                <h2>{project.title}</h2>
                <p>{project.eyebrow}</p>
                <footer>
                  <span>{project.year}</span>
                  <span>{project.status}</span>
                </footer>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className="journal-empty">
              <h2>No projects match just yet.</h2>
              <p>Try another technology or reset the filters.</p>
              <button
                className="button button-ink"
                onClick={() => {
                  setQuery("");
                  setFilter("All projects");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </section>
      )}
      <div className="project-contact-strip">
        <span>Have a wonderfully difficult problem?</span>
        <Link href="/resume">
          Get to know the builder <Icon name="arrow" size={16} />
        </Link>
      </div>
    </WorkbenchShell>
  );
}
