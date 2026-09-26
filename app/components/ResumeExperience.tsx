"use client";

import Link from "next/link";
import {
  experiences,
  projects,
  skillGroups,
  timeline,
} from "../data/portfolio";
import { Icon } from "./WorkbenchIcons";
import { ContactButton } from "./ContactButton";
import { WorkbenchShell, WorkspaceToolbar } from "./WorkbenchShell";

const sourceResume =
  "https://docs.google.com/document/d/1kvA9sHy8pTBD7Y3VXrZazCPcAgISGe47uS0tOqPPiBc/edit?usp=sharing";

export function ResumeExperience() {
  return (
    <WorkbenchShell section="resume">
      <WorkspaceToolbar label="About the builder">
        <button className="toolbar-link" onClick={() => window.print()}>
          <Icon name="file" size={15} /> Print / save PDF
        </button>
      </WorkspaceToolbar>
      <article className="resume-content">
        <header className="about-hero">
          <div>
            <p className="eyebrow">JACOB CLARK / THE 60-SECOND INTRODUCTION</p>
            <h1>
              Builder by trade.
              <br />
              <em>Curious by default.</em>
            </h1>
            <p>
              I’m a lead backend engineer, product builder, and founder. For
              more than two decades, I’ve turned complicated ideas into software
              people can actually use.
            </p>
            <div className="about-actions">
              <ContactButton className="button button-ink">
                Let’s make something <Icon name="arrow" size={16} />
              </ContactButton>
              <a
                className="text-link"
                href={sourceResume}
                target="_blank"
                rel="noreferrer"
              >
                Source résumé <Icon name="external" size={14} />
              </a>
            </div>
          </div>
          <div className="builder-card">
            <span>THE PERSON BEHIND THE PIXELS</span>
            <strong>
              jc<span>.</span>
            </strong>
            <p>
              Engineer.
              <br />
              Systems thinker.
              <br />
              Relentless maker.
            </p>
            <span>
              EST. 2002 <Icon name="code" size={22} />
            </span>
          </div>
        </header>
        <section className="career-stats" aria-label="Career highlights">
          <div>
            <strong>
              24<span>+</span>
            </strong>
            <span>YEARS OF BUILDING</span>
          </div>
          <div>
            <strong>{projects.length}</strong>
            <span>PROJECTS IN THE ARCHIVE</span>
          </div>
          <div>
            <strong>
              WEB <span>→</span> AI
            </strong>
            <span>ALWAYS EXPLORING WHAT’S NEXT</span>
          </div>
        </section>
        <section className="about-practice">
          <p className="eyebrow">HOW I THINK ABOUT THE WORK</p>
          <h2>
            Own the problem.
            <br />
            Build the missing piece.
          </h2>
          <p>
            My range runs from enterprise cloud infrastructure and AI-assisted
            workflows to game-engine tooling, mobile products, and realtime
            interfaces. The common thread is staying close to a problem, making
            it approachable, and following the work all the way into production.
          </p>
        </section>
        <section className="resume-experience">
          <div className="section-heading">
            <p className="eyebrow">THE EXPERIENCE</p>
            <span>2004 — PRESENT</span>
          </div>
          {experiences.map((experience, index) => (
            <article className="experience-entry" key={experience.company}>
              <span className="experience-number">0{index + 1}</span>
              <div className="experience-title">
                <span>{experience.period}</span>
                <h2>{experience.company}</h2>
                <h3>{experience.role}</h3>
              </div>
              <div className="experience-body">
                <p>{experience.summary}</p>
                <ul>
                  {experience.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                {experience.stack && (
                  <span className="experience-stack">{experience.stack}</span>
                )}
              </div>
            </article>
          ))}
        </section>
        <section className="skills-section">
          <div className="section-heading">
            <p className="eyebrow">TOOLS OF THE TRADE</p>
            <span>A FEW FAVORITES IN THE TOOLBOX</span>
          </div>
          <div className="skills-grid">
            {skillGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <div className="tags">
                  {group.items.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="career-timeline">
          <p className="eyebrow">SAME CURIOSITY. DIFFERENT CHAPTERS.</p>
          <div>
            {timeline.map((item) => (
              <article key={item.year}>
                <time>{item.year}</time>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="education-card">
          <Icon name="code" size={34} />
          <div>
            <p className="eyebrow">WHERE A LOT OF IT STARTED</p>
            <h2>Game &amp; Simulation Programming</h2>
            <p>DeVry University · Irving, Texas · 2009—2013</p>
            <p>
              DirectX rendering, custom 3D tools, and a homemade motion-capture
              system built with six PlayStation Eye cameras. The instinct to
              make things has always been there.
            </p>
          </div>
        </section>
        <footer className="about-footer">
          <h2>
            Good things start
            <br />
            with a conversation.
          </h2>
          <ContactButton className="button button-coral">
            Say hello <Icon name="arrow" size={18} />
          </ContactButton>
          <Link href="/">Or, back to the arcade ↗</Link>
        </footer>
      </article>
    </WorkbenchShell>
  );
}
