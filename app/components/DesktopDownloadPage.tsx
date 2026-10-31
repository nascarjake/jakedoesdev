import Link from "next/link";
import { WorkbenchHeader } from "./WorkbenchHeader";
import { Icon } from "./WorkbenchIcons";
import { LatestDesktopDownloads } from "./LatestDesktopDownloads";
import styles from "./DesktopDownloadPage.module.css";
export type DesktopRelease = {
  id: string; slug: string; name: string; version: string; prerelease?: boolean; tag: string; heading: string; intro: string;
  files: { label: string; detail: string; filename: string; sha256: string; bytes: number }[];
  features: { title: string; text: string }[]; steps: { title: string; text: string }[];
  requirements: string; limitations: string; screenshots: { name: string; caption: string }[];
};
export const releaseBase = (app: DesktopRelease) => `/api/media/projects/releases/${app.slug}/${app.version}/`;
export function DesktopDownloadPage({ app }: { app: DesktopRelease }) {
 return <><a className="skip-link" href="#main-content">Skip to content</a><main id="main-content" className={styles.page} data-app={app.slug}><div className={styles.frame}>
  <WorkbenchHeader section="lab" />
  <section className={styles.hero}><Link href={`/lab/#${app.id}`} className={styles.back}>← AI LAB / DESKTOP TOOLS</Link><p className={styles.kicker}>{app.name} <span>LATEST RELEASE · MAC + WINDOWS</span></p><h1>{app.heading}</h1><p className={styles.intro}>{app.intro}</p><a className={styles.button} href="#download">Choose your download ↓</a><a className={styles.textLink} href="#start">How to get started <Icon name="arrow" size={14} className={styles.downRightArrow} /></a></section>
  <figure className={styles.cover}><img src={`/projects/${app.slug}/${app.screenshots[0].name}.webp`} alt={app.screenshots[0].caption} width="1440" height="1000" /><figcaption>{app.screenshots[0].caption} Synthetic demo data in the real desktop app.</figcaption></figure>
  <section id="download" className={styles.section}><p className={styles.kicker}>01 / DOWNLOAD</p><h2>Your studio. On your computer.</h2><LatestDesktopDownloads app={app} /></section>
  <section className={styles.features}>{app.features.map(feature => <article key={feature.title}><span><Icon name="arrow" size={27} className={styles.upRightArrow} /></span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</section>
  <section id="start" className={`${styles.section} ${styles.start}`}><div><p className={styles.kicker}>02 / FIRST SESSION</p><h2>{app.tag}</h2><p>{app.requirements}</p></div><ol>{app.steps.map(step => <li key={step.title}><strong>{step.title}</strong><p>{step.text}</p></li>)}</ol></section>
  {app.screenshots.length > 1 && <div className={styles.gallery}>{app.screenshots.slice(1).map(shot => <figure key={shot.name}><img src={`/projects/${app.slug}/${shot.name}.webp`} alt={shot.caption} width="1440" height="1000" loading="lazy" /><figcaption>{shot.caption}</figcaption></figure>)}</div>}
  <section className={`${styles.section} ${styles.limits}`}><p className={styles.kicker}>03 / RELEASE NOTES</p><h2>A working desktop release, with clear limits.</h2><p>{app.limitations}</p><p>Documentation images capture only the app’s own interface with synthetic fixtures. No screen, camera, or microphone recording, personal media, voice cloning, or paid AI generation was used.</p></section>
  <footer className={styles.footer}><span>{app.name.toUpperCase()} / BY JAKEDOESDEV</span><Link href="/lab/">Explore the AI Lab <Icon name="external" size={13} /></Link></footer>
 </div></main></>;
}
