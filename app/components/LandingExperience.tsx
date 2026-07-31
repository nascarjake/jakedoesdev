"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AmbientField } from "./AmbientField";

export function LandingExperience() {
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 120);
    const handlePointer = (event: PointerEvent) => {
      setPointer({
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  const enterUniverse = () => {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => router.push("/universe"), 760);
  };

  return (
    <main
      className={`landing ${loaded ? "is-loaded" : ""} ${launching ? "is-launching" : ""}`}
      style={
        {
          "--px": pointer.x,
          "--py": pointer.y,
        } as React.CSSProperties
      }
    >
      <AmbientField />
      <div className="noise" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />

      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Jacob Clark, home">
          <span className="wordmark-mark">JC</span>
          <span className="wordmark-copy">
            JACOB CLARK
            <small>INDEPENDENT DEVELOPER</small>
          </span>
        </Link>
        <div className="header-coordinates" aria-label="Current location">
          <span>41.8781° N</span>
          <span>87.6298° W</span>
        </div>
        <div className="landing-header-actions">
          <Link href="/resume">READ RÉSUMÉ ↗</Link>
          <div className="availability">
            <i />
            OPEN TO HARD PROBLEMS
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow reveal reveal-one">
            <span>24+ YEARS IN THE FIELD</span>
            <span>EST. 2002</span>
          </div>
          <h1 className="reveal reveal-two">
            I BUILD
            <br />
            <span>WHAT&apos;S NEXT.</span>
          </h1>
          <p className="hero-intro reveal reveal-three">
            I&apos;m Jacob Clark—developer, systems thinker, and relentless
            maker. For over two decades, I&apos;ve turned strange ideas and hard
            problems into software that feels inevitable.
          </p>
          <Link className="resume-fast-path reveal reveal-three" href="/resume">
            <span>SHORT ON TIME?</span>
            <b>READ THE 60-SECOND RÉSUMÉ</b>
            <i>↗</i>
          </Link>
          <div className="hero-actions reveal reveal-four">
            <button className="primary-cta" onClick={enterUniverse}>
              <span>SEE COOL STUFF</span>
              <span className="cta-symbol">↗</span>
            </button>
            <a
              className="secondary-cta"
              href="https://discord.com/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="discord-glyph">◉</span>
              JOIN DISCORD
            </a>
          </div>
        </div>

        <div className="core-stage" aria-label="Interactive experience core">
          <div className="core-label core-label-top">
            <span>EXPERIENCE CORE</span>
            <b>ONLINE</b>
          </div>
          <div className="core-shadow" aria-hidden="true" />
          <div className="core-wrap" aria-hidden="true">
            <div className="orbit orbit-a"><i /><i /><i /></div>
            <div className="orbit orbit-b"><i /><i /></div>
            <div className="orbit orbit-c"><i /></div>
            <div className="core-sphere">
              <div className="sphere-grid" />
              <div className="sphere-glow" />
              <div className="sphere-seam" />
            </div>
            <div className="core-crosshair crosshair-x" />
            <div className="core-crosshair crosshair-y" />
          </div>
          <div className="core-readout">
            <span>INPUT</span>
            <b>AMBIGUITY</b>
            <i />
            <span>OUTPUT</span>
            <b>MOMENTUM</b>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="scroll-cue">
          <span>NO SCROLL REQUIRED</span>
          <i />
          <span>USE YOUR CURIOSITY</span>
        </div>
        <div className="discipline-ticker" aria-label="Areas of expertise">
          <span>PRODUCT ENGINEERING</span>
          <i>✦</i>
          <span>CREATIVE CODE</span>
          <i>✦</i>
          <span>AI SYSTEMS</span>
          <i>✦</i>
          <span>DEVELOPER TOOLS</span>
        </div>
        <span className="edition">PORTFOLIO / 26</span>
      </footer>

      <div className="warp" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
        <span>ENTERING THE ARCHIVE</span>
      </div>
    </main>
  );
}
