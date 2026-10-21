import type { Metadata } from "next";
import { DesktopDownloadPage } from "../components/DesktopDownloadPage";
import { podcastRelease } from "../data/desktop-releases";
export const metadata: Metadata = { title: "Markdown Podcast Studio — Mac & Windows downloads", description: podcastRelease.intro, alternates: { canonical: "https://jakedoesdev.com/markdown-podcast-studio/" }, openGraph: { images: ["https://jakedoesdev.com/projects/markdown-podcast-studio/studio.webp"] } };
export default function Page() { return <DesktopDownloadPage app={podcastRelease} />; }
