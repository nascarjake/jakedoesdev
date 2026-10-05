import type { Metadata } from "next";
import { JournalShell } from "../components/JournalShell";
import { UpdatesFeed, type PublishedUpdate } from "../components/UpdatesFeed";
import { getPublishedUpdates } from "../lib/updates";

export const metadata: Metadata = {
  title: "Field Notes",
  description: "Weekly notes from Jacob Clark's development practice.",
};

export default function UpdatesPage() {
  const updates: PublishedUpdate[] = getPublishedUpdates().map((update) => ({
    id: update.slug,
    title: update.title,
    date: update.date,
    summary: update.summary,
    bullets: update.body.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[-*]\s+/.test(line)).map((line) => line.replace(/^[-*]\s+/, "")),
    projects: (() => {
      const groups: { id: string; name: string; bullets: string[] }[] = [];
      for (const line of update.body.split(/\r?\n/)) {
        const heading = line.match(/^##\s+(.+)$/);
        if (heading) groups.push({ id: heading[1], name: heading[1], bullets: [] });
        else if (/^[-*]\s+/.test(line.trim())) {
          if (!groups.length) groups.push({ id: "general", name: "General", bullets: [] });
          groups.at(-1)?.bullets.push(line.trim().replace(/^[-*]\s+/, ""));
        }
      }
      return groups;
    })(),
  }));

  return (
    <JournalShell eyebrow="DEVELOPER LOG" title="Field notes from the work.">
      <UpdatesFeed initialUpdates={updates} />
    </JournalShell>
  );
}
