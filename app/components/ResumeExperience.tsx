"use client";

import Link from "next/link";
import { experiences, skillGroups } from "../data/portfolio";
import { AmbientField } from "./AmbientField";

const sourceResume =
  "https://docs.google.com/document/d/1kvA9sHy8pTBD7Y3VXrZazCPcAgISGe47uS0tOqPPiBc/edit?usp=sharing";

export function ResumeExperience() {
  return (
    <main className="resume-page">
      <AmbientField intensity={0.45} />
      <div className="noise" aria-hidden="true" />

      <header className="resume-header">
        <Link href="/" className="resume-wordmark">
          <span>JC</span>
          <b>JACOB CLARK</b>
        </Link>
        <nav aria-label="Résumé actions">
          <Link href="/universe">EXPLORE PROJECTS ↗</Link>
          <a href={sourceResume} target="_blank" rel="noreferrer">
            OPEN SOURCE RÉSUMÉ ↗
          </a>
          <button onClick={() => window.print()}>PRINT / SAVE PDF</button>
        </nav>
      </header>

      <section className="resume-hero">
        <div className="resume-hero-kicker">
          <span>CAREER SIGNAL / 24+ YEARS</span>
          <span>UPDATED FROM SOURCE RÉSUMÉ</span>
        </div>
        <h1>
          BUILDER.
          <br />
          LEADER.
          <br />
          <span>SYSTEMS THINKER.</span>
        </h1>
        <div className="resume-summary">
          <p>
            I&apos;m Jacob Clark, a lead backend engineer, product builder, and
            founder who has spent more than two decades turning complicated
            ideas into software people can actually use.
          </p>
          <p>
            My range runs from enterprise cloud infrastructure and AI-assisted
            workflows to game-engine tooling, mobile products, realtime
            interfaces, and the early web.
          </p>
          <a href="mailto:jakeleeclark@gmail.com">
            jakeleeclark@gmail.com <span>↗</span>
          </a>
        </div>
      </section>

      <section className="resume-fast-facts" aria-label="Career highlights">
        <article>
          <b>24+</b>
          <span>YEARS BUILDING</span>
        </article>
        <article>
          <b>17</b>
          <span>PRODUCTION PROJECTS IN THIS ARCHIVE</span>
        </article>
        <article>
          <b>45%</b>
          <span>MEASURED SUPPORT PRODUCTIVITY GAIN</span>
        </article>
        <article>
          <b>WEB → AI</b>
          <span>A CAREER ACROSS GENERATIONS OF THE STACK</span>
        </article>
      </section>

      <div className="resume-layout">
        <aside className="resume-sidebar">
          <div>
            <span className="resume-section-label">CURRENT MODE</span>
            <h2>Lead Backend Engineer</h2>
            <p>Enterprise systems · Product architecture · AI automation</p>
          </div>

          <div className="resume-skills">
            {skillGroups.map((group) => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                <div>
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="experience-list">
          <div className="experience-heading">
            <span className="resume-section-label">EXPERIENCE / SELECTED</span>
            <p>
              The through-line is product ownership: understand the real
              problem, build the system, ship it, and stay close enough to make
              it better.
            </p>
          </div>

          {experiences.map((experience, index) => (
            <article className="experience-record" key={experience.company}>
              <div className="experience-index">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="experience-company">
                <span>{experience.period}</span>
                <h2>{experience.company}</h2>
                <h3>{experience.role}</h3>
              </div>
              <div className="experience-copy">
                <p>{experience.summary}</p>
                <ul>
                  {experience.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                {experience.stack && <div>{experience.stack}</div>}
              </div>
            </article>
          ))}
        </section>
      </div>

      <section className="resume-education">
        <div>
          <span className="resume-section-label">EDUCATION / ORIGIN STORY</span>
          <h2>GAME &amp; SIMULATION PROGRAMMING</h2>
          <p>DeVry University · Irving, Texas · 2009—2013</p>
        </div>
        <div className="education-copy">
          <p>
            Built a DirectX rendering pipeline, a 3D drag-and-drop level editor,
            and a custom DX3D interface framework.
          </p>
          <p>
            The senior project team created animated organic models with a
            custom motion-capture system built from six PlayStation Eye cameras.
          </p>
        </div>
      </section>

      <footer className="resume-footer">
        <div>
          <span>THE SHORT VERSION</span>
          <h2>I MAKE HARD THINGS FEEL POSSIBLE.</h2>
        </div>
        <Link href="/universe">ENTER THE PROJECT UNIVERSE ↗</Link>
      </footer>
    </main>
  );
}
