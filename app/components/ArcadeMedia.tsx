"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ArcadeGame } from "../data/arcade";
import styles from "./ArcadeMedia.module.css";

type Mode = "gallery" | "video" | "play" | "art";
export type ArcadeMediaHandle = { open: () => void };

export const ArcadeMedia = forwardRef<ArcadeMediaHandle, { game: ArcadeGame }>(
  function ArcadeMedia({ game }, ref) {
    const initialMode: Mode = game.video
      ? "video"
      : game.screenshots.length
        ? "gallery"
        : "art";
    const [mode, setMode] = useState<Mode>(initialMode);
    const [slide, setSlide] = useState(0);
    const [slideshow, setSlideshow] = useState(false);
    const [loaded, setLoaded] = useState(Boolean(game.video));
    const [expanded, setExpanded] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const expandButton = useRef<HTMLButtonElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const restoreScroll = useRef<null | (() => void)>(null);

    function open() {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setExpanded(true);
      setSlideshow(false);
      const previous = document.body.style.overflow;
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
      restoreScroll.current = () => {
        document.body.style.overflow = previous;
      };
    }
    useImperativeHandle(ref, () => ({ open }));
    useEffect(() => () => restoreScroll.current?.(), []);
    useEffect(() => {
      if (!slideshow || mode !== "gallery" || game.screenshots.length < 2)
        return;
      const timer = setInterval(
        () => setSlide((value) => (value + 1) % game.screenshots.length),
        4000,
      );
      return () => clearInterval(timer);
    }, [slideshow, mode, game.screenshots.length]);

    function close() {
      setExpanded(false);
      setLoaded(false);
      setSlideshow(false);
      restoreScroll.current?.();
      restoreScroll.current = null;
      requestAnimationFrame(() => {
        if (opener.current?.isConnected)
          opener.current.focus({ preventScroll: true });
        else expandButton.current?.focus({ preventScroll: true });
      });
    }
    function changeMode(next: Mode) {
      setMode(next);
      setLoaded(next === "video");
      setSlideshow(false);
      setVideoFailed(false);
    }
    function move(direction: number) {
      setSlide(
        (value) =>
          (value + direction + game.screenshots.length) %
          game.screenshots.length,
      );
    }
    const modes: { id: Mode; label: string }[] = [
      ...(game.screenshots.length
        ? [{ id: "gallery" as const, label: "Screenshots" }]
        : [{ id: "art" as const, label: "Cover art" }]),
      ...(game.video ? [{ id: "video" as const, label: "Video" }] : []),
      ...(game.embedUrl ? [{ id: "play" as const, label: "Play here" }] : []),
    ];
    const external = mode === "play" ? game.playUrl : game.video?.externalUrl;

    function surface() {
      if (mode === "gallery") {
        const shot = game.screenshots[slide];
        return (
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            unoptimized
            sizes="(max-width: 620px) 90vw, 70vw"
            className={styles.screenshot}
          />
        );
      }
      if (mode === "art")
        return (
          <>
            <Image
              src={game.cover}
              alt={`${game.title} promotional cover illustration`}
              fill
              unoptimized
              sizes="50vw"
              className={styles.screenshot}
            />
            <span className={styles.artLabel}>
              {game.id === "daho"
                ? "CONCEPT COVER · SCREENSHOTS COMING LATER"
                : "PROMOTIONAL COVER ART"}
            </span>
          </>
        );
      if (mode === "video" && game.video?.embedNotice)
        return (
          <div className={styles.loadScreen}>
            <Image
              src={game.cover}
              alt=""
              fill
              unoptimized
              sizes="50vw"
              className={styles.backdrop}
            />
            <div>
              <span>GAMEPLAY PREVIEW</span>
              <a
                className={styles.externalVideo}
                href={game.video.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube ↗
              </a>
              <p>{game.video.embedNotice}</p>
            </div>
          </div>
        );
      if ((!loaded && mode !== "video") || videoFailed)
        return (
          <div className={styles.loadScreen}>
            <Image
              src={game.screenshots[0]?.src ?? game.cover}
              alt=""
              fill
              unoptimized
              sizes="50vw"
              className={styles.backdrop}
            />
            <div>
              <span>
                {mode === "play" ? "BROWSER GAME" : "GAMEPLAY PREVIEW"}
              </span>
              <button
                onClick={() => {
                  setLoaded(true);
                  setVideoFailed(false);
                }}
              >
                {videoFailed
                  ? "Retry video"
                  : mode === "play"
                    ? "Load game"
                    : "Load video"}{" "}
                <b aria-hidden="true">▶</b>
              </button>
              <p>
                {videoFailed
                  ? "The video could not load. Try the original link below."
                  : "External content loads only when you choose."}
              </p>
            </div>
          </div>
        );
      if (mode === "play")
        return (
          <iframe
            key={game.id}
            title={`Play ${game.title}`}
            src={game.embedUrl}
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        );
      if (game.video?.type === "mp4")
        return (
          <video
            src={game.video.src}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label={`${game.title} gameplay preview`}
            onError={() => setVideoFailed(true)}
          />
        );
      return (
        <iframe
          title={`${game.title} gameplay video`}
          src={`${game.video?.src}${game.video?.src.includes("?") ? "&" : "?"}autoplay=1&mute=1`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }

    function viewer(large: boolean) {
      return (
        <div className={styles.viewer}>
          <div
            className={styles.tabs}
            role="group"
            aria-label={`${game.title} preview type`}
          >
            {modes.map((item) => (
              <button
                key={item.id}
                onClick={() => changeMode(item.id)}
                aria-pressed={mode === item.id}
              >
                {item.label}
              </button>
            ))}
            {!large && (
              <button
                className={styles.expand}
                ref={expandButton}
                onClick={open}
                aria-label={`Expand ${game.title} preview`}
              >
                ⤢ <span>Expand</span>
              </button>
            )}
          </div>
          <div
            className={`${styles.surface} ${large ? styles.largeSurface : ""}`}
          >
            {surface()}
          </div>
          {mode === "gallery" && (
            <>
              <div className={styles.galleryControls}>
                <button
                  onClick={() => {
                    setSlideshow(false);
                    move(-1);
                  }}
                  disabled={game.screenshots.length < 2}
                  aria-label="Previous screenshot"
                >
                  ‹
                </button>
                <span aria-live={slideshow ? "off" : "polite"}>
                  {slide + 1} / {game.screenshots.length}
                </span>
                <button
                  onClick={() => {
                    setSlideshow(false);
                    move(1);
                  }}
                  disabled={game.screenshots.length < 2}
                  aria-label="Next screenshot"
                >
                  ›
                </button>
                {game.screenshots.length > 1 && (
                  <button
                    className={styles.slideshow}
                    aria-pressed={slideshow}
                    onClick={() => setSlideshow(!slideshow)}
                  >
                    {slideshow ? "Pause slideshow" : "Start slideshow"}
                  </button>
                )}
              </div>
              <p className={styles.caption}>{game.screenshots[slide].alt}</p>
            </>
          )}
          {(mode === "play" || mode === "video") && (
            <div className={styles.fallback}>
              <span>
                {mode === "play"
                  ? `${game.controlsHint ?? "Keyboard/gamepad recommended."} Embed not working?`
                  : "Preview unavailable?"}
              </span>
              <a href={external} target="_blank" rel="noreferrer">
                {mode === "play" ? "Open game ↗" : "Open original ↗"}
              </a>
              {loaded && (
                <button onClick={() => setLoaded(false)}>Unload</button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        {expanded ? (
          <button
            className={styles.returnToPreview}
            onClick={() => dialog.current?.focus()}
          >
            Preview open in theater view
          </button>
        ) : (
          viewer(false)
        )}
        <dialog
          ref={dialog}
          className={styles.dialog}
          aria-label={`${game.title} preview theater`}
          onClose={close}
          onClick={(event) => {
            if (event.target === event.currentTarget) dialog.current?.close();
          }}
        >
          <div className={styles.dialogInner}>
            <header>
              <div>
                <span>GOOSE GAMES / NOW SHOWING</span>
                <h2>{game.title}</h2>
              </div>
              <button
                autoFocus
                onClick={() => dialog.current?.close()}
                aria-label="Close preview"
              >
                ✕
              </button>
            </header>
            {expanded && viewer(true)}
          </div>
        </dialog>
      </>
    );
  },
);
