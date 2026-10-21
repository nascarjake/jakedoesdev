import type { Metadata } from "next";
import { LabExperience } from "../components/LabExperience";

export const metadata: Metadata = {
  title: "AI Lab — Find a tool for the job",
  description: "Browse tools by what you want to do: capture and explain, create audio and music, run a live show, or plan everyday life. Explore public releases, prototypes, and research.",
};

export default function LabPage() {
  return <LabExperience />;
}
