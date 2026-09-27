"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { projects, type ProjectCategory } from "../data/portfolio";
import { openWorkbenchPanel } from "../lib/workbench-navigation";
import { Icon, type IconName } from "./WorkbenchIcons";
import { ContactButton } from "./ContactButton";

const groups: {
  title: string;
  icon: IconName;
  categories: ProjectCategory[];
}[] = [
  {
    title: "Products & platforms",
    icon: "folder",
    categories: ["Enterprise", "AI + Automation", "SaaS"],
  },
  { title: "Mobile applications", icon: "phone", categories: ["Mobile"] },
  { title: "Games & interactive", icon: "game", categories: ["Games"] },
  { title: "Developer tools", icon: "code", categories: ["Creative Tools"] },
];

export function WorkbenchShell({
  children,
  section = "arcade",
  selectedProject,
}: {
  children: ReactNode;
  section?: "arcade" | "projects" | "resume" | "notes";
  selectedProject?: string;
}) {
  const [query, setQuery] = useState("");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const pathname = usePathname();
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const target = event.target;
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !(
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            /INPUT|TEXTAREA|SELECT/.test(target.tagName))
        )
      ) {
        event.preventDefault();
        setDirectoryOpen(true);
        requestAnimationFrame(() => searchInput.current?.focus());
      }
      if (event.key === "Escape") setDirectoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const filtered = projects.filter((project) =>
    `${project.title} ${project.category} ${project.stack.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="workbench-app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="identity" aria-label="Jacob Clark, home">
          <span className="identity-monogram">
            jc<span>.</span>
          </span>
          <span>
            <strong>JACOB CLARK</strong>
            <small>ENGINEER. BUILDER. GAME MAKER.</small>
          </span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          <Link
            href="/"
            aria-current={
              section === "arcade" || section === "projects"
                ? "page"
                : undefined
            }
          >
            Workbench
          </Link>
          <Link
            href="/resume"
            aria-current={section === "resume" ? "page" : undefined}
          >
            About me
          </Link>
          <Link
            href="/updates"
            aria-current={section === "notes" ? "page" : undefined}
          >
            Field notes
          </Link>
        </nav>
        <a
          className="top-discord"
          href="https://discord.gg/6BJTUpDSsE"
          target="_blank"
          rel="noreferrer"
          aria-label="Join the Discord"
        >
          <Icon name="discord" size={19} />
        </a>
        <ContactButton />
      </header>

      <div className="intro-strip">
        <span>
          <Icon name="terminal" size={18} /> A LIFETIME OF MAKING THINGS. STILL
          JUST GETTING STARTED.
        </span>
        <Link href="/resume">
          24+ years in the field <Icon name="arrow" size={15} />
        </Link>
      </div>

      <div className="workbench-layout">
        <button
          className="mobile-directory-toggle"
          aria-expanded={directoryOpen}
          aria-controls="project-directory"
          onClick={() => setDirectoryOpen(!directoryOpen)}
        >
          <Icon name="folder" size={18} /> Browse the work{" "}
          <span>{directoryOpen ? "−" : "+"}</span>
        </button>
        <aside
          className={`directory-sidebar ${directoryOpen ? "mobile-open" : ""}`}
          id="project-directory"
          aria-label="Project directory"
        >
          <div className="sidebar-heading">
            <span>THE WORKBENCH</span>
            <span className="tiny-counter">{projects.length}</span>
          </div>
          <label className="sidebar-search">
            <Icon name="search" size={16} />
            <input
              ref={searchInput}
              type="search"
              aria-label="Search projects"
              placeholder="Find a project…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <Link
            href="/arcade"
            className={`arcade-directory-link ${section === "arcade" ? "selected" : ""}`}
            aria-current={section === "arcade" ? "page" : undefined}
            onClick={() => setDirectoryOpen(false)}
          >
            <span className="arcade-link-icon">
              <Icon name="game" />
            </span>
            <span>
              <strong>Goose Games Arcade</strong>
              <small>A little more play.</small>
            </span>
            <Icon name="arrow" size={16} />
          </Link>
          <nav className="project-groups" aria-label="Projects by discipline">
            {groups.map((group) => {
              const items = filtered.filter((project) =>
                group.categories.includes(project.category),
              );
              if (!items.length) return null;
              return (
                <section className="project-group" key={group.title}>
                  <h2>
                    <Icon name={group.icon} size={15} />
                    {group.title}
                    <span>{items.length}</span>
                  </h2>
                  {items.map((project) => (
                    <Link
                      href={`/universe#${project.id}`}
                      className={
                        selectedProject === project.id ? "selected" : ""
                      }
                      aria-current={
                        selectedProject === project.id ? "true" : undefined
                      }
                      key={project.id}
                      onClick={(event) => {
                        setDirectoryOpen(false);
                        if (
                          pathname.replace(/\/$/, "") === "/universe" &&
                          !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
                        ) {
                          event.preventDefault();
                          openWorkbenchPanel(project.id);
                        }
                      }}
                    >
                      <span className={`project-dot dot-${project.accent}`} />
                      <span>{project.title}</span>
                      {selectedProject === project.id && (
                        <Icon name="arrow" size={13} />
                      )}
                    </Link>
                  ))}
                </section>
              );
            })}
            {!filtered.length && (
              <p className="search-empty">
                No projects found. Try a name or technology.
              </p>
            )}
          </nav>
          <div className="sidebar-bottom">
            <Link href="/resume">
              <Icon name="file" size={16} /> The 60-second résumé{" "}
              <Icon name="external" size={13} />
            </Link>
            <a
              href="https://discord.gg/6BJTUpDSsE"
              target="_blank"
              rel="noreferrer"
            >
              Join the Discord <Icon name="external" size={13} />
            </a>
            <p>Ideas → code → real things.</p>
          </div>
        </aside>

        <main
          id="main-content"
          className={`workspace-main workspace-${section}`}
          key={pathname}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <footer className="status-bar">
        <span>
          <i className="status-light" /> INDEPENDENT SPIRIT. COLLABORATIVE BY
          NATURE.
        </span>
        <span>
          {projects.length} projects <i>/</i> Building since 2002
        </span>
        <span>
          MADE WITH CURIOSITY <span className="footer-wave">⌁</span>
        </span>
      </footer>
    </div>
  );
}

export function WorkspaceToolbar({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="workspace-toolbar">
      <span>
        <Icon name="folder" size={17} />
        <span>Workbench</span>
        <i>/</i>
        <strong>{label}</strong>
      </span>
      <div>{children}</div>
    </div>
  );
}
