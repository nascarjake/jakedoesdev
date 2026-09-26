import type { Metadata } from "next";
import { LandingExperience } from "./components/LandingExperience";

export const metadata: Metadata = {
  title: { absolute: "Jacob Clark — The Workbench" },
  description:
    "Serious code. Playful instincts. Explore Jacob Clark’s products, developer tools, and Goose Games arcade.",
};

export default function Home() {
  return <LandingExperience />;
}
