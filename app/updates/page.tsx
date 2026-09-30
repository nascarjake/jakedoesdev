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
  }));

  return (
    <JournalShell eyebrow="DEVELOPER LOG" title="Field notes from the work.">
      <UpdatesFeed initialUpdates={updates} />
    </JournalShell>
  );
}
