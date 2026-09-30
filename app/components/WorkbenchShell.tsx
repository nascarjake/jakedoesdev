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

type DirectoryProject = {
  id: string;
  title: string;
  category: ProjectCategory;
  stack: string[];
  accent: "acid" | "amber" | "ice";
};

const categories = new Set<ProjectCategory>([
  "Enterprise",
  "AI + Automation",
  "Creative Tools",
  "Mobile",
  "Games",
  "SaaS",
]);

function directoryProjectFromApi(value: unknown): DirectoryProject | null {
  if (!value || typeof value !== "object") return null;
  const project = value as Record<string, unknown>;
  const id = typeof project.id === "string" ? project.id : "";
  const title = typeof project.title === "string" ? project.title : "";
  const category = typeof project.category === "string" && categories.has(project.category as ProjectCategory)
    ? project.category as ProjectCategory
    : null;
  const accent = project.accent === "acid" || project.accent === "amber" || project.accent === "ice"
    ? project.accent
    : null;
  if (!id || !title || !category || !accent || !Array.isArray(project.stack)) return null;
  const stack = project.stack.filter((item): item is string => typeof item === "string");
  return { id, title, category, stack, accent };
}

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
  const [catalog, setCatalog] = useState<DirectoryProject[]>(projects);
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
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return await response.json() as { projects?: unknown };
      })
      .then((payload) => {
        if (!Array.isArray(payload.projects)) return;
        const next = payload.projects.map(directoryProjectFromApi);
        if (next.every((project): project is DirectoryProject => project !== null)) setCatalog(next);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  const filtered = catalog.filter((project) =>
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
          <Icon name="folder" size={18} /> Browse shipped work{" "}
          <span>{directoryOpen ? "−" : "+"}</span>
        </button>
        <aside
          className={`directory-sidebar ${directoryOpen ? "mobile-open" : ""}`}
          id="project-directory"
          aria-label="Shipped product directory"
        >
          <div className="sidebar-heading">
            <span>
              THE WORKBENCH
              <small>SHIPPED PRODUCT ARCHIVE</small>
            </span>
            <span
              className="tiny-counter"
              aria-label={`${catalog.length} shipped production products`}
            >
              {catalog.length}
            </span>
          </div>
          <label className="sidebar-search">
            <Icon name="search" size={16} />
            <input
              ref={searchInput}
              type="search"
              aria-label="Search shipped production products"
              placeholder="Find shipped work…"
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
          <section className="production-directory" aria-labelledby="production-directory-title">
            <div className="production-directory-heading">
              <h2 id="production-directory-title">Shipped production products</h2>
              <p>Released apps, platforms, and tools.</p>
            </div>
            <nav className="project-groups" aria-label="Shipped production products by discipline">
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
                  No shipped products found. Try a name or technology.
                </p>
              )}
            </nav>
          </section>
          <section className="lab-directory" aria-labelledby="lab-directory-title">
            <span className="lab-directory-icon">
              <Icon name="code" size={17} />
            </span>
            <div>
              <div className="lab-directory-heading">
                <h2 id="lab-directory-title">Lab bench</h2>
                <span>Next up</span>
              </div>
              <p>Experiments, prototypes, and utility tools will live here.</p>
            </div>
          </section>
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
          {catalog.length} projects <i>/</i> Building since 2002
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
