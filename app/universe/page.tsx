import type { Metadata } from "next";
import { UniverseExperience } from "../components/UniverseExperience";

export const metadata: Metadata = {
  title: "Project Workbench",
  description:
    "Browse Jacob Clark’s project workbench: products, platforms, mobile applications, games, and developer tools.",
};

export default function UniversePage() {
  return <UniverseExperience />;
}
