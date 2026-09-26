import type { Metadata } from "next";
import { ArcadeExperience } from "../components/ArcadeExperience";

export const metadata: Metadata = {
  title: "Goose Games Arcade",
  description: "The playful side of Jacob Clark’s workbench. Meet Goose Games and explore a career in games and interactive tools.",
};

export default function ArcadePage() {
  return <ArcadeExperience />;
}
