import type { Metadata } from "next";
import { LabExperience } from "../components/LabExperience";

export const metadata: Metadata = {
  title: "AI Lab — Experiments by Jake",
  description: "A collection of small tools and open-ended experiments by Jacob Clark. Explore screen replay, audio and music, live shows, and household planning.",
};

export default function LabPage() {
  return <LabExperience />;
}
