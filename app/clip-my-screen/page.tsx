/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { WorkbenchHeader } from "../components/WorkbenchHeader";
import styles from "./page.module.css";

const repo = "https://github.com/nascarjake/clip-my-screen";
const download = `${repo}/releases/latest/download/Clip-My-Screen-`;
export const metadata: Metadata = {
  title: "Clip My Screen — Free screen replay for Mac and Windows | JakeDoesDev",
  description: "Save the last 1, 5, or 15 minutes with a shortcut. Free, open-source screen replay and visual video editing for Mac and Windows. Save the last 15 minutes, trim on a thumbnail timeline, and share local clips.",
  alternates: { canonical: "https://jakedoesdev.com/clip-my-screen/" },
  openGraph: { title: "Clip My Screen — Save the moment after it happens", description: "Free screen replay for Mac and Windows. Your clips, on your computer.", images: ["https://jakedoesdev.com/projects/clip-my-screen/editor.webp"] },
};
const platforms = [
  { name: "Mac · Apple Silicon", detail: "M1 or newer · macOS 15+", file: "macOS-arm64.dmg", portable: "macOS-arm64.zip", alternate: "Download ZIP", label: "Download Mac DMG" },
  { name: "Mac · Intel", detail: "Intel processor · macOS 15+", file: "macOS-x64.dmg", portable: "macOS-x64.zip", alternate: "Download ZIP", label: "Download Intel Mac DMG" },
  { name: "Windows", detail: "Windows 10/11 · Intel/AMD 64-bit", file: "Windows-x64-Setup.exe", portable: "Windows-x64-Portable.exe", alternate: "Download portable EXE", label: "Download Windows installer" },
];
export default function ClipMyScreenPage() {
  return <main className={styles.page}>
    <div className={styles.frame}>
      <WorkbenchHeader section="lab" />
      <section className={styles.hero}>
        <div className={styles.eyebrow}><img src="/projects/clip-my-screen/icon.png" alt="" width="64" height="64" /><span>CLIP MY SCREEN<br /><small>FREE · OPEN SOURCE · MAC + WINDOWS</small></span></div>
        <h1>The good bit<br />already happened.<br /><em>Save it anyway.</em></h1>
        <p>A bug finally reproduces. A game does something brilliant. A teammate explains it perfectly. Save the last 1, 5, or 15 minutes with a shortcut, then make it yours in a visual editor. Scrub, drag to trim, split, and arrange clips without changing your originals.</p>
        <div className={styles.heroLinks}><a href="#download">Get Clip My Screen ↓</a><a href={repo}>Explore the source ↗</a><Link href="/lab/#clip-my-screen">Back to the AI Lab ↗</Link></div>
      </section>
      <figure className={styles.screenshot}><img src="/projects/clip-my-screen/editor.webp" alt="Clip My Screen visual editor with a video preview, thumbnail timeline, gold trim handles, and a two-clip sequence" width="1440" height="900" /><figcaption>The real visual editor with generated demo video. Drag the gold edges to keep your moment.</figcaption></figure>
      <section className={styles.downloads} id="download" aria-labelledby="downloads-heading">
        <span className={styles.overline}>01 / LATEST RELEASE · MAC + WINDOWS</span><h2 id="downloads-heading">A small home for the moments worth keeping.</h2>
        <div className={styles.platforms}>{platforms.map(platform => <article key={platform.name}><h3>{platform.name}</h3><p>{platform.detail}</p><a href={`${download}${platform.file}`}>{platform.label} ↓</a><a className={styles.alternateDownload} href={`${download}${platform.portable}`}>{platform.alternate} ↗</a></article>)}</div>
        <p className={styles.note}>Early-release builds: Mac apps are ad-hoc signed and unnotarized; Windows apps are unsigned. Your OS may block or warn about downloads without a trusted publisher signature. No security-bypass launcher is included. <a href={`${repo}#build-from-source`}>Building the source</a> is another option.</p>
        <div className={styles.moreLinks}><a href={`${repo}/releases/latest`}>ZIPs, Windows portable, checksums, and release notes ↗</a><a href={`${repo}#your-first-clip`}>Installation guide ↗</a></div>
      </section>
      <section className={styles.features} aria-label="Features">
        <article><span>↶</span><h3>Save what just happened.</h3><p>A rolling replay buffer keeps up to 15 minutes nearby while capture is enabled. Save a replay, take a screenshot, or record a longer session.</p></article>
        <article><span>▦</span><h3>Make the cut visually.</h3><p>Scrub a thumbnail timeline, drag trim handles, split at the playhead, and arrange a sequence. Frame stepping and undo help you get the cut right.</p></article>
        <article><span>↗</span><h3>Share when you choose.</h3><p>Create a revocable link for a saved capture. Local sharing works on your network; internet sharing is an optional tunnel.</p></article>
      </section>
      <section className={styles.start} aria-labelledby="start-heading">
        <div><span className={styles.overline}>02 / YOUR FIRST CLIP</span><h2 id="start-heading">Open it.<br />Choose your screen.<br /><em>Catch the next moment.</em></h2><p>Capture starts when the app opens. First-run setup helps you choose a display, resolution, audio, and whether to start with your computer. Pause or quit from the menu bar or taskbar icon whenever you need.</p></div>
        <ol><li><strong>Install and open.</strong> Mac: drag the app from the DMG into Applications. Windows: run the installer, or use the portable EXE.</li><li><strong>Set up your display.</strong> Choose your display, recording quality, audio, and startup preference in the welcome screen. You can change these later in Settings. Mac needs Screen Recording permission in System Settings; see the <a href={`${repo}#your-first-clip`}>first-run guide</a>. Windows capture is currently video-only.</li><li><strong>Save a moment.</strong> Mac: <kbd>⌘ ⌥ 1</kbd>. Windows: <kbd>Ctrl Alt 1</kbd>. That saves the last minute. Use 2 for five minutes or 3 for fifteen.</li><li><strong>Keep the good part.</strong> Open a clip in the visual editor, drag to trim or split it, and export a new clip. Give it a name or create a share link from your library.</li></ol>
      </section>
      <div className={styles.gallery}><figure><img src="/projects/clip-my-screen/dashboard.webp" alt="Capture dashboard with recording explicitly paused" width="1440" height="1200" loading="lazy" /><figcaption>Capture stays under your control.</figcaption></figure><figure><img src="/projects/clip-my-screen/settings.webp" alt="Settings for display, replay duration, frame rate, audio, sharing, and local files" width="1440" height="1000" loading="lazy" /><figcaption>Choose the setup that fits your machine.</figcaption></figure></div>
      <section className={styles.editorFeature} aria-labelledby="editor-heading"><span className={styles.overline}>VISUAL EDITING / KEEP THE GOOD PARTS</span><h2 id="editor-heading">See the cut.<br /><em>Shape the story.</em></h2><p>Move through your footage with a thumbnail timeline and a live preview. Set in and out points by dragging, split at the playhead, duplicate a moment, and drag clips into the right order. Save edits to revisit later, or export a new video while your source recordings stay intact.</p><figure className={styles.screenshot}><img src="/projects/clip-my-screen/editor-sequence.webp" alt="A second clip selected in the visual editor, with its source timeline and the arranged video sequence below" width="1440" height="900" loading="lazy" /><figcaption>One workspace for previewing, trimming, arranging, and exporting. Illustrative demo media only.</figcaption></figure><p className={styles.note}>The app checks for updates when it opens. Choose Update now to pause capture and download the verified installer; active recordings and clip exports finish first. Installation is manual.</p></section>
      <section className={styles.community}><span className={styles.overline}>03 / BUILT IN THE OPEN</span><h2>Make it better with me.</h2><p>Source code is MIT licensed. Bug reports, accessibility fixes, and careful real-device performance measurements are welcome. This is early software: live capture performance, audio sync, and the reported Finder privacy-indicator behavior still need broader validation.</p><div className={styles.moreLinks}><a href={repo}>Read the README and source ↗</a><a href={`${repo}/issues/new/choose`}>Report a bug ↗</a><a href={`${repo}/blob/main/CONTRIBUTING.md`}>Contribute ↗</a></div></section>
      <footer className={styles.footer}><span>CLIP MY SCREEN / BY JAKEDOESDEV</span><Link href="/lab/">More experiments ↗</Link></footer>
    </div>
  </main>;
}
