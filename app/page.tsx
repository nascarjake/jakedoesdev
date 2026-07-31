import type { Metadata } from "next";
import { LandingExperience } from "./components/LandingExperience";

export const metadata: Metadata = {
  title: "Jacob Clark — Creative Developer",
  description:
    "Jacob Clark is a developer with 24+ years of experience building ambitious products, platforms, and experiments.",
};

export default function Home() {
  return <LandingExperience />;
}
