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
            <p>Transmission queue is clear.</p>
            <span>The first public field note is being prepared.</span>
          </div>
        )}
      </section>
    </JournalShell>
  );
}
