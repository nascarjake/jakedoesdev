export type PublishedUpdate = {
  id: string;
  title: string;
  date: string;
  summary: string;
  bullets: string[];
};

export function UpdatesFeed({ initialUpdates }: { initialUpdates: PublishedUpdate[] }) {
  if (!initialUpdates.length) {
    return <div className="journal-empty">
      <span className="empty-note-icon" aria-hidden="true">✳</span>
      <h2>A fresh page.</h2>
      <p>Notes on building, experimenting, and figuring things out along the way. The first entry is still on the workbench.</p>
    </div>;
  }

  return <section className="journal-list" aria-label="Published updates">
    {initialUpdates.map((update) => <article className="journal-card" key={update.id}>
      <span>{update.date}</span>
      <h2>{update.title}</h2>
      {update.summary && <p>{update.summary}</p>}
      {update.bullets.length > 0 && <ul className="journal-bullets">{update.bullets.map((bullet, index) => <li key={`${update.id}-${index}`}>{bullet}</li>)}</ul>}
    </article>)}
  </section>;
}
