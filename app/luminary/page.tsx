import type { Metadata } from "next";
import Link from "next/link";
import { WorkbenchHeader } from "../components/WorkbenchHeader";
import styles from "./page.module.css";
const repo = "https://github.com/nascarjake/luminary";
export const metadata: Metadata = {
  title: "Luminary — Visual AI workflows | JakeDoesDev",
  description: "An open-source visual workflow builder for AI assistants, schemas, and custom functions. Watch the original walkthrough and explore the source.",
  alternates: { canonical: "https://jakedoesdev.com/luminary/" },
};
export default function LuminaryPage() {
  return <main className={styles.page}><div className={styles.frame}>
    <WorkbenchHeader section="lab" />
    <header className={styles.hero}><p className={styles.eyebrow}>LUMINARY / OPEN-SOURCE DESKTOP TOOL</p><h1>Build AI workflows.<br /><span>See how they connect.</span></h1><p className={styles.intro}>A visual editor for connecting specialized AI assistants, structured data, and custom code. I built Luminary to make multi-step agent workflows easier to design and inspect.</p><div className={styles.actions}><a href={repo}>Get started on GitHub ↗</a><a href="#walkthrough">Watch the walkthrough ↓</a></div></header>
    <section id="walkthrough" className={styles.demo} aria-labelledby="demo-heading"><div className={styles.sectionHeading}><h2 id="demo-heading">The actual application</h2><a href="https://www.youtube.com/watch?v=LyOMJq47ASQ">Watch on YouTube ↗</a></div><div className={styles.video}><iframe title="Luminary — original workflow builder walkthrough by JakeDoesDev" src="https://www.youtube-nocookie.com/embed/LyOMJq47ASQ?rel=0" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><p className={styles.caption}>The original project walkthrough, recorded by JakeDoesDev. This shows the application at the time of recording.</p></section>
    <section className={styles.features} aria-label="What Luminary does"><article><span>01</span><h2>Compose the workflow</h2><p>Arrange assistants in a visual graph, connect their inputs and outputs, and give each assistant a focused role.</p></article><article><span>02</span><h2>Define the data</h2><p>Use the schema designer to describe the objects moving between steps. Keep the data structure visible alongside the workflow.</p></article><article><span>03</span><h2>Connect your code</h2><p>Add custom functions as tools or pipeline nodes. The separate pipeline engine is designed to run workflows outside the desktop editor.</p></article></section>
    <section className={styles.start}><div><p className={styles.eyebrow}>SOURCE, SETUP & RELEASES</p><h2>Explore Luminary</h2><p>The Electron and Angular application is MIT licensed. Start with the repository for installation instructions, available releases, and the architecture.</p><p className={styles.note}>The original implementation uses the OpenAI Assistants API. Check the current source and provider requirements before running it; this page does not claim compatibility with every current model or API.</p></div><div className={styles.links}><a href={repo}>Repository & setup ↗</a><a href={`${repo}/releases`}>Available releases ↗</a><a href={`${repo}/issues`}>Issues & discussion ↗</a></div></section>
    <footer className={styles.footer}><span>LUMINARY / JACOB CLARK</span><Link href="/universe/#luminary">Portfolio ↗</Link><Link href="/lab/#luminary">AI Lab ↗</Link></footer>
  </div></main>;
}
