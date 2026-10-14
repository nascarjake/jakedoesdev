import Link from "next/link";
import styles from "./LandingExperience.module.css";

const paths = [
  { number: "01", label: "PORTFOLIO / RÉSUMÉ", href: "/universe", theme: styles.portfolio, description: "Production products, the people behind them, and the experience that brought them to life.", action: "Explore shipped work" },
  { number: "02", label: "AI LAB", href: "/lab", theme: styles.lab, description: "Experiments and prototypes at the edge of AI, interfaces, and practical curiosity.", action: "Enter the lab" },
  { number: "03", label: "ARCADE", href: "/arcade", theme: styles.arcade, description: "Goose Games, playable ideas, and a few reasons to press start.", action: "Visit the arcade" },
];

export function LandingExperience() {
  return <main className={styles.page}>
    <div className={styles.inner}>
      <header className={styles.header}>
        <Link href="/" className={styles.identity} aria-label="Jacob Clark, home">jc<span>.</span></Link>
        <span>JACOB CLARK / ENGINEER & MAKER</span>
        <Link href="/resume" className={styles.about}>About me <span aria-hidden="true">↗</span></Link>
      </header>
      <section className={styles.intro} aria-labelledby="landing-title">
        <div className={styles.introCopy}>
          <p className={styles.kicker}><span /> THREE DOORS. ONE WORKBENCH.</p>
          <h1 id="landing-title">Where do you want <em>to start?</em></h1>
          <p>Some work ships. Some work explores. Some work is better with a start button. Pick the part you came to see.</p>
        </div>
        <div className={styles.introMark} aria-hidden="true"><span>J</span><span>C</span><i>EST. 2002</i></div>
      </section>
      <nav className={styles.paths} aria-label="Choose a part of the site">
        {paths.map((path) => <Link href={path.href} className={`${styles.path} ${path.theme}`} key={path.number}>
          <span className={styles.pathTop}><span>{path.number} / 03</span><span aria-hidden="true">↗</span></span>
          <strong className={styles.pathTitle}>{path.label}</strong>
          <span className={styles.pathArt} aria-hidden="true">
            {path.number === "01" && <><i className={styles.paperBack} /><i className={styles.paperFront}><b>JC</b><span>SELECTED WORK<br />2002 → NOW</span><small>PRODUCTION / PEOPLE / PROCESS</small></i></>}
            {path.number === "02" && <><i className={styles.labOrb} /><i className={styles.labGrid} /><span className={styles.labReadout}>EXP_001<br />STATUS: EXPLORING</span></>}
            {path.number === "03" && <><i className={styles.cabinet}><b>GOOSE<br />GAMES</b><span>▶ START</span></i><i className={styles.arcadeStar}>✳</i></>}
          </span>
          <span className={styles.pathBody}><span>{path.description}</span><span className={styles.pathAction}>{path.action} <span aria-hidden="true">→</span></span></span>
        </Link>)}
      </nav>
      <footer className={styles.footer}><span>BUILT WITH CURIOSITY.</span><Link href="/updates">Field notes ↗</Link></footer>
    </div>
  </main>;
}
