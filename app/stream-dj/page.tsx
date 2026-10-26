import type { Metadata } from "next";
import { DesktopDownloadPage } from "../components/DesktopDownloadPage";
import { streamDjRelease } from "../data/desktop-releases";
export const metadata: Metadata = { title: "Stream DJ — Mac & Windows downloads", description: streamDjRelease.intro, alternates: { canonical: "https://jakedoesdev.com/stream-dj/" }, openGraph: { images: ["https://jakedoesdev.com/projects/stream-dj/studio.webp"] } };
export default function Page() { return <DesktopDownloadPage app={streamDjRelease} />; }
