import type { Metadata } from "next";
import Link from "next/link";
import { JournalShell } from "../components/JournalShell";
import { getPublishedUpdates } from "../lib/updates";

export const metadata: Metadata = {
  title: "Field Notes",
  description: "Weekly notes from Jacob Clark's development practice.",
};

export default function UpdatesPage() {
  const updates = getPublishedUpdates();

  return (
    <JournalShell eyebrow="DEVELOPER LOG" title="Field notes from the work.">
      <section className="journal-list" aria-label="Published updates">
        {updates.length ? (
          updates.map((update) => (
            <Link className="journal-card" href={`/updates/${update.slug}`} key={update.slug}>
              <span>{update.date}</span>
              <h2>{update.title}</h2>
              {update.summary && <p>{update.summary}</p>}
              <b>Read note ↗</b>
            </Link>
          ))
        ) : (
          <div className="journal-empty">
            <span className="empty-note-icon" aria-hidden="true">✳</span>
            <h2>A fresh page.</h2>
            <p>Notes on building, experimenting, and figuring things out along the way. The first entry is still on the workbench.</p>
            <Link className="text-link" href="/universe">Explore the projects in the meantime →</Link>
          </div>
        )}
      </section>
    </JournalShell>
  );
}
