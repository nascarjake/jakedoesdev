"use client";

import { useEffect, useState } from "react";

export type PublishedUpdate = {
  id: string;
  title: string;
  date: string;
  summary: string;
  bullets: string[];
  projects?: { id: string; name: string; bullets: string[] }[];
};

export function UpdateCards({ updates }: { updates: PublishedUpdate[] }) {
  if (!updates.length) {
    return <div className="journal-empty">
      <span className="empty-note-icon" aria-hidden="true">✳</span>
      <h2>A fresh page.</h2>
      <p>Notes on building, experimenting, and figuring things out along the way. The first entry is still on the workbench.</p>
    </div>;
  }
  return <section className="journal-list" aria-label="Published updates">
    {updates.map((update) => <article className="journal-card" key={update.id}>
      <span>{update.date}</span>
      <h2>{update.title}</h2>
      {update.summary && <p>{update.summary}</p>}
      {(update.projects?.length ? update.projects : [{ id: "general", name: "General", bullets: update.bullets }]).map((project) =>
        <div className="journal-project" key={project.id}>
          <h3>{project.name}</h3>
          <ul className="journal-bullets">{project.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>
        </div>)}
    </article>)}
  </section>;
}

export function UpdatesFeed({ initialUpdates }: { initialUpdates: PublishedUpdate[] }) {
  const [updates, setUpdates] = useState(initialUpdates);

  useEffect(() => {
    let active = true;
    void fetch("https://raw.githubusercontent.com/nascarjake/jakedoesdev/main/content/updates/index.json", {
      headers: { accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("The published updates index is unavailable.");
        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every((item): item is PublishedUpdate =>
          item && typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.date === "string" &&
          typeof item.summary === "string" &&
          (item.projects === undefined || (Array.isArray(item.projects) && item.projects.every((project: unknown) =>
            !!project && typeof project === "object" && typeof (project as { name?: unknown }).name === "string" &&
            Array.isArray((project as { bullets?: unknown }).bullets)))) &&
          Array.isArray(item.bullets) && item.bullets.every((bullet: unknown) => typeof bullet === "string"),
        )) throw new Error("The published updates index returned an invalid post.");
        return payload as PublishedUpdate[];
      })
      .then((published) => { if (active) setUpdates(published); })
      .catch(() => { /* The GitHub Pages export keeps its static content. */ });
    return () => { active = false; };
  }, [initialUpdates]);

  return <UpdateCards updates={updates} />;
}
