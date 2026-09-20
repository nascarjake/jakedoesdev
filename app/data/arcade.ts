export type ArcadeGame = {
  title: string;
  format: "Godot" | "WebGL" | "Other";
  description: string;
  playUrl: string;
  sourceUrl?: string;
  status: "released" | "in-progress";
};

// Add only games with public play URLs. The arcade route intentionally has no
// placeholders so it never advertises an unpublished project.
export const arcadeGames: ArcadeGame[] = [];
