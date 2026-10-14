"use client";

import Link from "next/link";
import { Icon } from "./WorkbenchIcons";
import { ContactButton } from "./ContactButton";

export type WorkbenchSection = "arcade" | "projects" | "resume" | "notes" | "lab";

export function WorkbenchHeader({ section }: { section: WorkbenchSection }) {
  return (
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
        <Link href="/universe" aria-current={section === "projects" || section === "resume" ? "page" : undefined}>Portfolio / résumé</Link>
        <Link href="/lab" aria-current={section === "lab" ? "page" : undefined}>AI Lab</Link>
        <Link href="/arcade" aria-current={section === "arcade" ? "page" : undefined}>Arcade</Link>
        <Link href="/updates" aria-current={section === "notes" ? "page" : undefined}>Field notes</Link>
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
  );
}
