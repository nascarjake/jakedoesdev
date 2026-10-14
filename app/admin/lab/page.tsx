import type { Metadata } from "next";
import { AdminPanel } from "../../components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "AI Lab Studio",
  description: "Private AI experiment editor.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLabPage() {
  return <AdminPanel initialMode="lab" />;
}
