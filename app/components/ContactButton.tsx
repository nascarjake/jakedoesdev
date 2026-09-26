"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "./WorkbenchIcons";
import "./ContactButton.css";

const email = "jakeleeclark@gmail.com";

export function ContactButton({
  className = "contact-button",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const restoreScroll = useRef<null | (() => void)>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "select">(
    "idle",
  );
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => () => restoreScroll.current?.(), []);

  function open() {
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    restoreScroll.current = () => {
      document.body.style.overflow = previousOverflow;
    };
  }

  function closed() {
    restoreScroll.current?.();
    restoreScroll.current = null;
    setCopyState("idle");
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
    } catch {
      address.current?.focus();
      address.current?.select();
      setCopyState("select");
    }
  }

  return (
    <>
      <button className={className} onClick={open} aria-haspopup="dialog">
        {children ?? (
          <>
            Let’s talk <Icon name="arrow" size={16} />
          </>
        )}
      </button>
      <dialog
        ref={dialog}
        className="contact-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={closed}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="contact-dialog-inner">
          <button
            className="contact-close"
            onClick={() => dialog.current?.close()}
            aria-label="Close contact panel"
          >
            <Icon name="close" />
          </button>
          <span className="contact-dialog-mark">
            <Icon name="mail" size={27} />
          </span>
          <p className="eyebrow">GOOD THINGS START WITH A CONVERSATION</p>
          <h2 id={titleId}>
            Let’s make
            <br />
            <em>something interesting.</em>
          </h2>
          <p id={descriptionId}>
            A tricky problem, a new idea, or just a hello. Here’s where to find
            me.
          </p>
          <label className="contact-address-label" htmlFor={`${titleId}-email`}>
            EMAIL JACOB
          </label>
          <div className="contact-address">
            <input
              id={`${titleId}-email`}
              ref={address}
              readOnly
              value={email}
              aria-label="Jacob’s email address"
              onFocus={(event) => event.currentTarget.select()}
            />
            <button onClick={copyEmail}>
              {copyState === "copied" ? "Copied ✓" : "Copy email"}
            </button>
          </div>
          <p className="contact-copy-status" role="status">
            {copyState === "copied"
              ? "Email address copied to your clipboard."
              : copyState === "select"
                ? "Address selected. Press ⌘C or Ctrl+C to copy."
                : "Copy the address, or choose a way to say hello below."}
          </p>
          <div className="contact-options">
            <a href={`mailto:${email}`} className="button button-ink">
              Open email app <Icon name="mail" size={16} />
            </a>
            <a
              href="https://discord.gg/6BJTUpDSsE"
              className="button contact-discord"
              target="_blank"
              rel="noreferrer"
            >
              Join the Discord <Icon name="external" size={15} />
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
