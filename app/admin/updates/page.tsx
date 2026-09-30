import type { Metadata } from "next";
import { UpdatesStudio } from "../../components/admin/UpdatesStudio";

export const metadata: Metadata = {
  title: "Update Review",
  description: "Review and approve field note drafts.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminUpdatesPage() {
  return <UpdatesStudio />;
}
