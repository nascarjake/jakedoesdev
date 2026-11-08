import type { Metadata } from "next";
import { LandingExperience } from "./components/LandingExperience";

export const metadata: Metadata = {
  openGraph: { title: "Jake Clark — Software engineer & founder", description: "20+ years building software. Portfolio, open-source projects, AI experiments, and games.", images: ["/og-workbench.png"] },
  twitter: { card: "summary_large_image", title: "Jake Clark — Software engineer & founder", description: "20+ years building software. Portfolio, open-source projects, AI experiments, and games.", images: ["/og-workbench.png"] },
  title: { absolute: "Jacob Clark — Portfolio, AI Lab & Arcade" },
  description:
    "Jake Clark is a software engineer and founder with 20+ years building products across medical technology, enterprise software, finance, and games. Explore his portfolio, AI Lab, and arcade.",
};

export default function Home() {
  return <LandingExperience />;
}
