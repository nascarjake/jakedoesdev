import type { Metadata } from "next";
import { AdminPanel } from "../components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Project Studio",
  description: "Private portfolio project editor.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminPanel />;
}
