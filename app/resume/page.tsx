import type { Metadata } from "next";
import { ResumeExperience } from "../components/ResumeExperience";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Jacob Clark’s experience across backend systems, product engineering, developer tools, mobile, games, and AI automation.",
};

export default function ResumePage() {
  return <ResumeExperience />;
}
