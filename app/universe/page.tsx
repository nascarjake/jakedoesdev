import type { Metadata } from "next";
import { UniverseExperience } from "../components/UniverseExperience";

export const metadata: Metadata = {
  title: "The Developer Universe",
  description:
    "Explore Jacob Clark's work, experience, and experiments as a spatial archive.",
};

export default function UniversePage() {
  return <UniverseExperience />;
}
