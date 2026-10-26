import type { Project } from "./portfolio";

// Visitor-facing needs and skills are independent of the portfolio's technical categories.
export const labNeeds = [
  { id: "capture-explain", label: "Capture & explain", description: "Keep a screen moment. Make an idea easier to share.", symbol: "↙" },
  { id: "audio-music", label: "Create audio & music", description: "Turn notes into voices and recordings into music code.", symbol: "≈" },
  { id: "live-show", label: "Run a live show", description: "Explore requests, DJ voice links, and show programming.", symbol: "◉" },
  { id: "everyday-planning", label: "Plan everyday life", description: "Bring household calendars and lists into one place.", symbol: "✳" },
] as const;

export const labSkills = [
  { id: "screen-replay", label: "Screen replay" },
  { id: "voice-generation", label: "Voice generation" },
  { id: "script-writing", label: "Script writing" },
  { id: "music-analysis", label: "Music analysis" },
  { id: "request-queues", label: "Request queues" },
  { id: "calendar-planning", label: "Calendar planning" },
] as const;

export type LabNeed = typeof labNeeds[number]["id"];
export type LabSkill = typeof labSkills[number]["id"];
export type LabAvailability = "all" | "release" | "in-progress";
export type LabFilters = { query: string; need: LabNeed | "all"; skill: LabSkill | "all"; availability: LabAvailability };
export const defaultLabFilters: LabFilters = { query: "", need: "all", skill: "all", availability: "all" };

type Discovery = { outcome: string; needs: LabNeed[]; skills: LabSkill[]; uses: string[]; flow: [string, string] };
const discovery: Record<string, Discovery> = {
  "clip-my-screen": {
    outcome: "Save the moment after it happens.",
    needs: ["capture-explain"], skills: ["screen-replay"],
    uses: ["Keep a bug reproduction to explain what went wrong.", "Save a great play or a useful on-screen explanation."],
    flow: ["A moment on screen", "A clip to keep"],
  },
  "markdown-podcast-narrator": {
    outcome: "Give your written notes a voice.",
    needs: ["audio-music", "capture-explain"], skills: ["voice-generation", "script-writing"],
    uses: ["Listen to research notes as a two-host conversation.", "Edit a script, choose local voices, and export an MP3."],
    flow: ["Markdown & notes", "A spoken episode"],
  },
  "stream-dj": {
    outcome: "Shape the sound of a live show.",
    needs: ["live-show", "audio-music"], skills: ["voice-generation", "request-queues"],
    uses: ["Explore a moderated queue for audience music requests.", "Plan DJ voice links and reusable show blocks."],
    flow: ["Requests & tracks", "A show in motion"],
  },
  "jcal": {
    outcome: "Get the household on the same page.",
    needs: ["everyday-planning"], skills: ["calendar-planning"],
    uses: ["See family calendars together on a shared touch display.", "Explore everyday lists and natural-language planning."],
    flow: ["Calendars & lists", "One shared view"],
  },
  "music-writer": {
    outcome: "Explore how a recording becomes music code.",
    needs: ["audio-music"], skills: ["music-analysis"],
    uses: ["Study instrumental stems, notes, and drum events.", "Explore a reproducible Strudel reconstruction."],
    flow: ["Recorded audio", "Editable music code"],
  },
};

export function getLabDiscovery(project: Project): Discovery {
  return discovery[project.id] ?? {
    outcome: project.eyebrow || project.title, needs: [], skills: [],
    uses: project.highlights.slice(0, 2), flow: ["Explore the idea", project.title],
  };
}

export function isLabRelease(project: Project): boolean {
  return Boolean(project.dossier.source && /^(?:open-source[\s·]+|public\s+|desktop\s+)?(?:early\s+)?release(?: · Mac \+ Windows)?$/i.test(project.status.trim()));
}

export function filterLabProjects(projects: Project[], filters: LabFilters): Project[] {
  const terms = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    const info = getLabDiscovery(project);
    if (filters.need !== "all" && !info.needs.includes(filters.need)) return false;
    if (filters.skill !== "all" && !info.skills.includes(filters.skill)) return false;
    if (filters.availability === "release" && !isLabRelease(project)) return false;
    if (filters.availability === "in-progress" && isLabRelease(project)) return false;
    const text = [project.title, project.eyebrow, project.summary, project.status, ...project.highlights, info.outcome, ...info.uses,
      ...labNeeds.filter((need) => info.needs.includes(need.id)).map((need) => need.label),
      ...labSkills.filter((skill) => info.skills.includes(skill.id)).map((skill) => skill.label),
    ].join(" ").toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function readLabFilters(search: string): LabFilters {
  const params = new URLSearchParams(search);
  const need = params.get("need"), skill = params.get("skill"), availability = params.get("availability");
  return {
    query: params.get("q") ?? "",
    need: labNeeds.find((item) => item.id === need)?.id ?? "all",
    skill: labSkills.find((item) => item.id === skill)?.id ?? "all",
    availability: availability === "release" || availability === "in-progress" ? availability : "all",
  };
}

export function writeLabFilters(search: string, filters: LabFilters): string {
  const params = new URLSearchParams(search);
  for (const [key, value] of [["q", filters.query], ["need", filters.need], ["skill", filters.skill], ["availability", filters.availability]]) {
    if (!value || value === "all") params.delete(key); else params.set(key, value);
  }
  return params.size ? "?" + params.toString() : "";
}
