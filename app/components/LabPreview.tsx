import Image from "next/image";
import type { Project } from "../data/portfolio";
import { projectMedia } from "../data/project-media";
import styles from "./LabPreview.module.css";

const wave = [14, 25, 17, 37, 49, 27, 58, 39, 20, 46, 62, 31, 50, 23, 41, 57, 33, 16, 45, 30, 53, 21, 37, 18];

// Original editorial illustrations. Only actual project assets are labeled screenshots.
export function LabPreview({ project }: { project: Project }) {
  const image = project.media?.find((asset) => asset.kind === "image");
  const shot = image ? { src: image.url, alt: image.altText || image.caption } : projectMedia[project.id]?.shots[0];
  if (shot) return <div className={styles.capture}>
    <span className={styles.label}>APP SCREENSHOT</span>
    <div className={styles.captureWindow}><Image src={shot.src} alt={"alt" in shot ? shot.alt : shot.caption} width={1100} height={720} unoptimized sizes="(max-width: 700px) 90vw, 60vw" /></div>
    <span className={styles.captureKey}>{project.id === "clip-my-screen" ? "↖ A little late? Right on time." : project.eyebrow}</span>
  </div>;

  if (project.id === "markdown-podcast-narrator") return <div className={styles.podcast} aria-hidden="true">
    <span className={styles.label}>CONCEPT STUDY</span>
    <div className={styles.paper}><span>notes.md</span><i /><i /><i /><i /><b>Let’s talk<br />about it.</b></div>
    <div className={styles.voiceOne}><span>A</span><div>{wave.slice(0, 15).map((height, i) => <i key={i} style={{ height: height * .55 }} />)}</div></div>
    <div className={styles.voiceTwo}><span>B</span><div>{wave.slice(9).map((height, i) => <i key={i} style={{ height: height * .55 }} />)}</div></div>
    <span className={styles.podcastFoot}>TWO VOICES. YOUR WORDS.</span>
  </div>;

  if (project.id === "stream-dj") return <div className={styles.dj} aria-hidden="true">
    <span className={styles.label}>CONCEPT STUDY</span>
    <div className={styles.disc}><div><span>SDJ</span><i /></div></div>
    <div className={styles.request}><span>UP NEXT</span><strong>The audience<br />has a say.</strong><div>{[46, 67, 31].map((width, i) => <i key={i} style={{ width: width + "%" }} />)}</div></div>
    <span className={styles.djFoot}>REQUESTS / VOICE / PLAYBACK</span>
  </div>;

  if (project.id === "jcal") return <div className={styles.calendar} aria-hidden="true">
    <span className={styles.label}>CONCEPT STUDY</span>
    <div className={styles.week}><div className={styles.weekHeading}><strong>This week</strong><span>jcal ✳</span></div><div className={styles.days}>{["M", "T", "W", "T", "F"].map((day, i) => <div key={i}><span>{day}</span><b>{12 + i}</b>{i === 1 && <i className={styles.eventOne}>Family</i>}{i === 3 && <i className={styles.eventTwo}>Plans</i>}{i === 4 && <i className={styles.eventThree}>Dinner</i>}</div>)}</div></div>
    <div className={styles.calendarNote}>A week, together.<span>✓ The whole household</span></div>
  </div>;

  if (project.id === "music-writer") return <div className={styles.music} aria-hidden="true">
    <span className={styles.label}>CONCEPT STUDY</span>
    <div className={styles.musicWave}>{wave.map((height, i) => <i key={i} style={{ height: height * .6 }} />)}</div>
    <div className={styles.piano}>{["C", "B", "A", "G"].map((note, i) => <div key={note}><span>{note}</span><i style={{ left: (i * 21 + 4) + "%", width: (17 + i * 3) + "%" }} /><i style={{ left: (i * 9 + 48) + "%", width: "10%" }} /></div>)}</div>
    <code>sound → stems → strudel</code>
  </div>;

  return <div className={styles.generic} aria-hidden="true"><span className={styles.label}>EXPERIMENT</span><span>{project.signal}</span><i /><small>{project.eyebrow}</small></div>;
}
