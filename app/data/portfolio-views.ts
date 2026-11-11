import type { Project } from './portfolio';

export const featuredProjectIds = ['straight-desk', 'ignite-ai', 'luminary'] as const;

// Never infer a launch date from a job or a broad category. Undated records stay undated.
export function startYear(label: string): number | null {
  const match = label.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}
export function timelineGroups(catalog: Project[]) {
  const years = [...new Set(catalog.map(p => startYear(p.year)).filter((n): n is number => n !== null))].sort((a,b) => b-a);
  return years.map(year => ({year, projects: catalog.filter(p => startYear(p.year) === year)}));
}
