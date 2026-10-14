import type { Metadata } from "next";
import { LabExperience } from "../components/LabExperience";

export const metadata: Metadata = {
  title: "AI Lab",
  description: "Experiments and prototypes from Jacob Clark’s AI Lab.",
};

export default function LabPage() {
  return <LabExperience />;
}
