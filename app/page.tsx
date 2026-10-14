import type { Metadata } from "next";
import { LandingExperience } from "./components/LandingExperience";

export const metadata: Metadata = {
  title: { absolute: "Jacob Clark — Portfolio, AI Lab & Arcade" },
  description:
    "Choose a path through Jacob Clark’s production portfolio, AI experiments, and Goose Games arcade.",
};

export default function Home() {
  return <LandingExperience />;
}
