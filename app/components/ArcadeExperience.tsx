"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  arcadeGames,
  studioCartridge,
  type ArcadeGame,
} from "../data/arcade";
import { Icon } from "./WorkbenchIcons";
import { WorkbenchShell, WorkspaceToolbar } from "./WorkbenchShell";
import { ArcadeScreen } from "./ArcadeScreen";
import { ArcadeMedia, type ArcadeMediaHandle } from "./ArcadeMedia";
import styles from "./ArcadeExperience.module.css";

function Screws() {
  return (
    <>
      <i className={styles.screw} />
      <i className={styles.screw} />
      <i className={styles.screw} />
      <i className={styles.screw} />
    </>
  );
}

export function ArcadeExperience() {
  const [games, setGames] = useState<ArcadeGame[]>(arcadeGames);
  const [selectedSlot, setSelected] = useState(0);
  const selected = Math.min(selectedSlot, games.length);
  const [wideLayout, setWideLayout] = useState(false);
  const [sound, setSound] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);
  const [inserted, setInserted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const insertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const media = useRef<ArcadeMediaHandle>(null);
  const cabinet = useRef<HTMLElement>(null);
  const cartridges = [
    { ...studioCartridge, description: `${games.length} games. Plenty of curiosity. Browse the cartridges, watch real gameplay, or load a browser game right here.` },
    ...games,
  ];
  const cartridge = cartridges[selected];
  const running = playing;
  const shelfOffset = wideLayout && games.length ? 1 : 0;
  const shelfCartridges = wideLayout && games.length ? games : cartridges;
  const shelfSelected = Math.max(0, selected - shelfOffset);
  const shelfStart = Math.min(
    Math.floor(shelfSelected / 3) * 3,
    Math.max(0, shelfCartridges.length - 3),
  );
  const visibleCartridges = shelfCartridges.slice(
    shelfStart,
    shelfStart + 3,
  );
  const currentNumber = shelfOffset ? selected : selected + 1;
  const totalCartridges = shelfOffset ? games.length : cartridges.length;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/games", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Game catalogue unavailable");
        return await response.json() as { games?: ArcadeGame[] };
      })
      .then((payload) => {
        if (Array.isArray(payload.games)) setGames(payload.games);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1101px)");
    const syncLayout = () => {
      setWideLayout(query.matches);
      if (query.matches && games.length) {
        setSelected((current) => (current === 0 ? 1 : current));
        setPlaying(false);
        setInserted(false);
      }
    };

    syncLayout();
    query.addEventListener("change", syncLayout);
    return () => query.removeEventListener("change", syncLayout);
  }, [games.length]);

  useEffect(
    () => () => {
      if (insertTimer.current) clearTimeout(insertTimer.current);
      void audio.current?.close();
    },
    [],
  );

  function select(index: number) {
    const first = wideLayout && games.length ? 1 : 0;
    const length = cartridges.length - first;
    const normalized = ((index - first + length) % length) + first;
    setSelected(normalized);
    setPlaying(false);
    setInserted(false);
    setAnnouncement("");
  }
  function playSound() {
    if (!sound) return;
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(360, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      180,
      context.currentTime + 0.16,
    );
    gain.gain.setValueAtTime(0.07, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.21);
  }
  function insertCartridge() {
    setInserted(true);
    setAnnouncement(
      `${cartridge.title} inserted. ${selected === 0 ? "Welcome to the arcade." : "Opening preview."}`,
    );
    if (selected !== 0) media.current?.open();
    playSound();
    if (insertTimer.current) clearTimeout(insertTimer.current);
    insertTimer.current = setTimeout(() => setInserted(false), 400);
  }
  function demo() {
    if (selected !== 0) {
      media.current?.open();
      return;
    }
    setPlaying(!running);
    if (!running) setRunId((id) => id + 1);
    setAnnouncement(
      running
        ? "Run stopped early."
        : `Goose Run started. Jump with Space or Up, duck with Down, or tap the screen.`,
    );
    if (!running) playSound();
  }

  return (
    <WorkbenchShell section="arcade">
      <WorkspaceToolbar label="Goose Games Arcade">
        <span className="toolbar-label">PICK A CARTRIDGE. PRESS START.</span>
        <a
          className="toolbar-link"
          href="https://goosegames.dev"
          target="_blank"
          rel="noreferrer"
        >
          GooseGames.dev <Icon name="external" size={13} />
        </a>
      </WorkspaceToolbar>
      <div className={styles.stage}>
        <div className={styles.blueStripe} aria-hidden="true" />
        <div className={styles.yellowStripe} aria-hidden="true" />
        <span className={styles.handwriting} aria-hidden="true">
          BUILD
          <br />› SHIP
          <br />› PLAY
          <br />› REPEAT
        </span>
        <aside className={styles.studioPanel} aria-label="About Goose Games">
          <span className={styles.studioTab}>THE STUDIO</span>
          <div className={styles.studioHeading}>
            <div>
              <p>INDEPENDENT GAME STUDIO</p>
              <h2>{studioCartridge.title}</h2>
            </div>
            <span aria-label={`${games.length} games`}>
              {String(games.length).padStart(2, "0")}
            </span>
          </div>
          <div className={styles.studioBody}>
            <div className={styles.studioCover}>
              <Image
                src={studioCartridge.cover}
                alt="Goose Games illustrated cartridge cover"
                fill
                sizes="160px"
                priority
                unoptimized
              />
            </div>
            <div className={styles.studioCopy}>
              <p className={styles.studioTagline}>{studioCartridge.tagline}</p>
              <p>{studioCartridge.description}</p>
              <div className={styles.studioFacts}>
                <span>PLAY IN BROWSER</span>
                <span>REAL GAMEPLAY</span>
                <span>BUILT WITH CURIOSITY</span>
              </div>
            </div>
          </div>
          <div className={styles.studioActions}>
            <a
              className={styles.studioLink}
              href={studioCartridge.playUrl}
              target="_blank"
              rel="noreferrer"
            >
              VISIT GOOSEGAMES.DEV <Icon name="external" size={18} />
            </a>
            <a
              className={styles.studioDiscord}
              href="https://discord.gg/6BJTUpDSsE"
              target="_blank"
              rel="noreferrer"
              aria-label="Join the Goose Games Discord"
            >
              <Icon name="discord" size={20} />
            </a>
          </div>
        </aside>
        <section
          ref={cabinet}
          tabIndex={-1}
          className={styles.machine}
          aria-label="Goose Games arcade cabinet"
        >
          <div className={styles.outerShell} aria-hidden="true" />
          <header className={styles.marquee}>
            <span className={styles.marqueeBolt} />
            <h1>ARCADE MODE</h1>
            <p>
              SAME SKILLS.
              <br />
              MORE FUN.
            </p>
            <span className={styles.slashes} aria-hidden="true">
              {"///"}
            </span>
          </header>
          <div className={styles.marqueeRail}>
            <i />
            <span>
              GAMES <b>✦</b> EXPERIMENTS <b>✦</b> PLAYABLE IDEAS
            </span>
          </div>
          <div className={styles.shelf}>
            <div
              className={styles.cartridges}
              role="group"
              aria-label="Choose a cartridge"
            >
              {visibleCartridges.map((item, slot) => {
                const index = shelfOffset + shelfStart + slot;
                return (
                  <button
                    key={item.id}
                    className={styles.cartridge}
                    data-selected={selected === index}
                    data-inserted={selected === index && inserted}
                    onClick={() => select(index)}
                    aria-pressed={selected === index}
                    aria-label={`Select ${item.title}`}
                  >
                    <span className={styles.cartridgeNotch} />
                    <span className={styles.labelFrame}>
                      <Image
                        src={item.cover}
                        alt=""
                        fill
                        sizes="(max-width: 620px) 29vw, (max-width: 1100px) 21vw, 25vw"
                        priority
                        unoptimized
                      />
                    </span>
                    <span
                      className={styles.cartridgeStatus}
                      data-game={item.id}
                    >
                      <i />
                      {item.id === "goose"
                        ? "STUDIO"
                        : item.embedUrl
                          ? "PLAY"
                          : item.id === "daho"
                            ? "ARCHIVE"
                            : "PREVIEW"}
                    </span>
                    {selected === index && (
                      <span className={styles.selectedLabel}>SELECTED</span>
                    )}
                    <span className={styles.cartridgeScrew} />
                  </button>
                );
              })}
            </div>
            <button
              className={`${styles.shelfArrow} ${styles.arrowLeft}`}
              onClick={() => select(selected - 1)}
              aria-label="Previous cartridge"
            >
              ‹
            </button>
            <button
              className={`${styles.shelfArrow} ${styles.arrowRight}`}
              onClick={() => select(selected + 1)}
              aria-label="Next cartridge"
            >
              ›
            </button>
          </div>
          <div className={styles.console}>
            <div className={styles.consoleTop}>
              <Screws />
              <div className={styles.nowPlaying}>
                <p className={styles.nowLabel}>
                  {selected === 0
                    ? "NOW PLAYING"
                    : cartridge.genre.toUpperCase()}
                </p>
                <h2>{cartridge.title}</h2>
                <p className={styles.tagline}>{cartridge.tagline}</p>
                <p className={styles.description}>{cartridge.description}</p>
                {cartridge.playUrl ? (
                  <a
                    className={styles.playLink}
                    href={cartridge.playUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selected === 0 ? "VISIT GOOSEGAMES.DEV" : "OPEN GAME"}{" "}
                    <Icon name="external" size={18} />
                  </a>
                ) : (
                  <button className={styles.playLink} onClick={demo}>
                    OPEN PREVIEW <Icon name="arrow" size={18} />
                  </button>
                )}
                {cartridge.caseStudy && (
                  <Link className={styles.caseStudy} href={cartridge.caseStudy}>
                    Read the project story <Icon name="arrow" size={15} />
                  </Link>
                )}
                {selected !== 0 && !cartridge.playUrl && (
                  <p className={styles.availability}>
                    {cartridge.id === "daho"
                      ? "Archive entry · screenshots to follow."
                      : "Preview available · no public play link yet."}
                  </p>
                )}
              </div>
              <div className={styles.monitor}>
                <Screws />
                {selected === 0 ? (
                  <div className={styles.monitorGlass}>
                    <ArcadeScreen
                      selected={cartridge.id}
                      running={running}
                      restartKey={runId}
                      onGameOver={(score) => {
                        setPlaying(false);
                        setAnnouncement(`Run over. Final score ${String(score).padStart(5, "0")}.`);
                      }}
                    />
                    <span className={styles.scanlines} />
                  </div>
                ) : (
                  <ArcadeMedia
                    key={cartridge.id}
                    game={cartridge}
                    ref={media}
                  />
                )}
              </div>
            </div>
            <div className={styles.controls}>
              <button className={styles.insertButton} onClick={insertCartridge}>
                <span className={styles.redButton} />
                INSERT CARTRIDGE
              </button>
              <button
                className={styles.demoButton}
                onClick={demo}
                aria-pressed={selected === 0 ? running : undefined}
              >
                <span className={styles.silverButton} />
                {selected === 0
                    ? running
                    ? "STOP RUN"
                    : "PLAY GOOSE RUN"
                  : "VIEW PREVIEW"}
              </button>
              <div className={styles.lampBoard}>
                <div>
                  <span>{selected === 0 ? "CANVAS" : "MEDIA"}</span>
                  <i data-lit="true" />
                  <i data-lit="true" />
                  <i data-lit={running} />
                  <i />
                </div>
                <button
                  aria-pressed={sound}
                  aria-label={sound ? "Turn sound off" : "Turn sound on"}
                  onClick={() => setSound(!sound)}
                >
                  <span>AUDIO</span>
                  <i data-lit={sound} />
                  <i data-lit={sound} />
                  <i />
                  <small>{sound ? "ON" : "OFF"}</small>
                </button>
              </div>
              <span className={styles.signoff} aria-hidden="true">
                GOOD
                <br />
                GAMES
                <br />
                BETTER
                <br />
                SOFTWARE.
              </span>
            </div>
          </div>
          <div className={styles.bottomPlinth} aria-hidden="true" />
        </section>
        <span className={styles.stageSignature}>BUILT WITH CURIOSITY ↗</span>
        <p className={styles.announcement} role="status">
          {announcement}
        </p>
      </div>
      <div className={styles.belowCabinet}>
        <span>
          {String(currentNumber).padStart(2, "0")} / {totalCartridges}{" "}
          {shelfOffset ? "GAMES" : "CARTRIDGES"} · {games.length} REAL
          GAMES
        </span>
        <Link href="/universe">
          Explore my shipped projects <Icon name="arrow" size={15} />
        </Link>
      </div>
      <section className={styles.gameLibrary} aria-label="Game library">
        <div className={styles.libraryHeader}>
          <div>
            <p className="eyebrow">THE CARTRIDGE COLLECTION</p>
            <h2>Find your next obsession.</h2>
          </div>
          <span>{games.length} games / made with curiosity</span>
        </div>
        <div className={styles.libraryGrid}>
          {games.map((game, index) => (
            <article key={game.id} data-selected={selected === index + 1}>
              <button
                onClick={() => {
                  select(index + 1);
                  requestAnimationFrame(() =>
                    cabinet.current?.focus({ preventScroll: true }),
                  );
                  cabinet.current?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  });
                }}
                aria-label={`Browse ${game.title}`}
                aria-pressed={selected === index + 1}
              >
                <span className={styles.libraryCover}>
                  <Image
                    src={game.cover}
                    alt={`${game.title} illustrated cartridge cover`}
                    fill
                    unoptimized
                    sizes="(max-width: 620px) 42vw, 18vw"
                  />
                </span>
                <span className={styles.libraryGenre}>{game.genre}</span>
                <h3>{game.title}</h3>
              </button>
              <div className={styles.libraryLinks}>
                {game.playUrl ? (
                  <a href={game.playUrl} target="_blank" rel="noreferrer">
                    Play game ↗
                  </a>
                ) : (
                  <span>{game.id === "daho" ? "Archive" : "Preview"}</span>
                )}
                <span>
                  {game.screenshots.length
                    ? `${game.screenshots.length} photos`
                    : game.video
                      ? "Video"
                      : game.embedUrl
                        ? "Play here"
                        : "Concept cover"}
                </span>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.libraryNote}>
          Illustrated covers up front. Original gameplay screenshots and videos
          inside. Browser games load on demand; other entries are previews, not
          playable releases.
        </p>
      </section>
    </WorkbenchShell>
  );
}
