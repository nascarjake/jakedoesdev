import type { Metadata } from "next";
import { GameStudio } from "../../components/admin/GameStudio";

export const metadata: Metadata = {
  title: "Goose Games Catalogue",
  description: "Private Goose Games catalogue editor.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminGamesPage() {
  return <GameStudio />;
}
