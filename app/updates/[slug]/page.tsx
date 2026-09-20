import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalShell } from "../../components/JournalShell";
import { MarkdownArticle } from "../../components/MarkdownArticle";
import { getPublishedUpdate, getPublishedUpdates } from "../../lib/updates";

type UpdatePageProps = {
  params: Promise<{ slug: string }>;
};

// Static export must know the complete set of public post URLs at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  const updates = getPublishedUpdates().map(({ slug }) => ({ slug }));

  // Next's static exporter rejects an entirely empty dynamic route. This
  // reserved path renders the normal 404 until the first published note exists.
  return updates.length ? updates : [{ slug: "__reserved" }];
}

export async function generateMetadata({ params }: UpdatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const update = getPublishedUpdate(slug);

  return update
    ? { title: update.title, description: update.summary }
    : { title: "Note not found" };
}

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug } = await params;
  const update = getPublishedUpdate(slug);

  if (!update) {
    notFound();
  }

  return (
    <JournalShell eyebrow={update.date || "FIELD NOTE"} title={update.title}>
      <MarkdownArticle source={update.body} />
    </JournalShell>
  );
}
