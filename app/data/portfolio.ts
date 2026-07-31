export type Project = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  summary: string;
  role: string;
  year: string;
  stack: string[];
  signal: string;
  accent: "acid" | "amber" | "ice";
};

// Add, remove, or reorder entries here. The universe rebalances itself.
export const projects: Project[] = [
  {
    id: "realtime-systems",
    index: "01",
    title: "Realtime Systems",
    eyebrow: "Distributed experiences",
    summary:
      "Interfaces where state, people, and machines stay perfectly in sync.",
    role: "Architecture · Engineering",
    year: "Current orbit",
    stack: ["Realtime", "Edge", "WebSockets"],
    signal: "SYN",
    accent: "acid",
  },
  {
    id: "intelligent-tools",
    index: "02",
    title: "Intelligent Tools",
    eyebrow: "AI-native products",
    summary:
      "Useful intelligence embedded in the workflow—not pasted on top of it.",
    role: "Product · Systems",
    year: "Active research",
    stack: ["Agents", "LLMs", "Automation"],
    signal: "INT",
    accent: "amber",
  },
  {
    id: "developer-platforms",
    index: "03",
    title: "Developer Platforms",
    eyebrow: "Tools for builders",
    summary:
      "APIs, consoles, and infrastructure that make complex systems feel obvious.",
    role: "DX · Architecture",
    year: "Deep archive",
    stack: ["TypeScript", "Cloud", "APIs"],
    signal: "DEV",
    accent: "ice",
  },
  {
    id: "product-engineering",
    index: "04",
    title: "Product Engineering",
    eyebrow: "Zero-to-one launches",
    summary:
      "From an ambiguous first sketch to a product people can depend on.",
    role: "Lead · Full stack",
    year: "24+ year continuum",
    stack: ["Product", "Web", "Scale"],
    signal: "PRD",
    accent: "acid",
  },
  {
    id: "creative-code",
    index: "05",
    title: "Creative Code",
    eyebrow: "Interfaces with gravity",
    summary:
      "Motion, dimensionality, and interaction used to make software memorable.",
    role: "Creative development",
    year: "Experimental lab",
    stack: ["WebGL", "Motion", "Canvas"],
    signal: "VIS",
    accent: "amber",
  },
  {
    id: "open-source",
    index: "06",
    title: "Open Source Lab",
    eyebrow: "Things worth sharing",
    summary:
      "Small, sharp tools and public experiments built to move the web forward.",
    role: "Maker · Maintainer",
    year: "Always shipping",
    stack: ["OSS", "Tooling", "R&D"],
    signal: "OSS",
    accent: "ice",
  },
];

export const timeline = [
  {
    year: "2002",
    title: "First signal",
    copy: "Started building for the web before responsive design had a name.",
  },
  {
    year: "2010s",
    title: "Products at scale",
    copy: "Moved through platforms, teams, and generations of the modern stack.",
  },
  {
    year: "NOW",
    title: "Still at the edge",
    copy: "Exploring realtime systems, AI-native software, and expressive interfaces.",
  },
];
