import Link from "next/link";
import type { ReactNode } from "react";

type JournalShellProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function JournalShell({ eyebrow, title, children }: JournalShellProps) {
  return (
    <main className="journal-shell">
      <header className="journal-header">
        <Link href="/" className="journal-mark" aria-label="Jacob Clark, home">
          JC
        </Link>
        <nav className="journal-nav" aria-label="Primary navigation">
          <Link href="/universe">Projects</Link>
          <Link href="/resume">Résumé</Link>
          <Link href="/updates">Notes</Link>
          <Link href="/arcade">Arcade</Link>
        </nav>
      </header>
      <section className="journal-heading">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </section>
      {children}
    </main>
  );
}
