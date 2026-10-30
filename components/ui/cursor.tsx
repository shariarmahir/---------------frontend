"use client";

import { useEffect, useRef } from "react";

/** How closely the brain follows the pointer each frame (the arrow sits on it exactly). */
const FOLLOW = 0.35;

/** Anything that can be clicked: the brain lights up into an idea. */
const ACTION = "a, button, [role='button'], [role='tab'], label, summary, select, .ms-root, [data-cursor='card']";
/** Fields keep the system's own cursor: the pointer steps aside over them. */
const FIELD = "input, textarea, select, [contenteditable='true']";
/** Figures, data and the words that carry content: the brain asks a question. */
const DATA =
  ".tabular-nums, .reel-figure, [data-cursor='data'], p, li, dt, dd, td, th, blockquote, figcaption, h1, h2, h3, h4, h5, h6";

type Mode = "think" | "idea" | "ask" | "field";

function read(target: Element): Mode {
  if (target.closest(FIELD)) return "field";
  if (target.closest(ACTION)) return "idea";
  if (target.closest(DATA)) return "ask";
  return "think";
}

/**
 * The home page's pointer (Mahir, 2026-10-29): a colourful arrow on the
 * exact point, so aiming stays precise, and a small animated brain, the
 * lab's thinking, riding just below it with signals running its folds.
 * Over anything that can be clicked the brain lights up into a glowing idea
 * bulb; over a figure or the words of the content it turns into a question
 * mark; a press squeezes it.
 *
 * Every change is a crossfade or a transform, and the frame loop runs only
 * while the brain is catching up. Mouse and trackpad only, never on a touch
 * screen, and not under reduced motion: there the system cursor stays.
 * Fields keep the system cursor.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mark = markRef.current;
    const tip = tipRef.current;
    if (!root || !mark || !tip) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");
    const to = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let raf = 0;
    let last: Element | null = null;

    const step = () => {
      at.x += (to.x - at.x) * FOLLOW;
      at.y += (to.y - at.y) * FOLLOW;
      tip.style.transform = `translate3d(${to.x}px, ${to.y}px, 0)`;
      mark.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      raf = Math.abs(to.x - at.x) + Math.abs(to.y - at.y) > 0.1 ? requestAnimationFrame(step) : 0;
    };
    const look = (target: Element) => {
      last = target;
      root.dataset.mode = read(target);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      to.x = e.clientX;
      to.y = e.clientY;
      if (!("on" in root.dataset)) {
        at.x = to.x;
        at.y = to.y;
        root.dataset.on = "";
      }
      if (e.target instanceof Element && e.target !== last) look(e.target);
      if (!raf) raf = requestAnimationFrame(step);
    };
    // A scroll moves the page under a still pointer: read what is under it now.
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf || !("on" in root.dataset)) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const under = document.elementFromPoint(to.x, to.y);
        if (under && under !== last) look(under);
      });
    };
    const onLeave = () => delete root.dataset.on;
    const onDown = () => (root.dataset.down = "");
    const onUp = () => delete root.dataset.down;

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden data-mode="think" className="cursor">
      <div ref={markRef} className="cursor-mark">
        <div className="cursor-art">
          {/* Thinking: a brain seen from the side, signals running its folds. */}
          <svg viewBox="0 0 40 40" className="cursor-brain" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 26.5 C24.6 29.5 24.2 32.5 22.6 35.2 H26 C27.2 32.6 27.6 29.6 27 26.5 Z" fill="#d9667f" stroke="#5b1a33" strokeWidth="1" />
            <path d="M25.6 25.2 C26.4 29.4 31.2 30.8 33.6 27.8 C34.8 26.2 34 24.4 32.2 24.2 Z" fill="#e8849b" stroke="#5b1a33" strokeWidth="1" />
            <path d="M27.5 26.6 C29 27.6 30.8 27.6 32.4 26.4 M28.2 28.4 C29.6 29 31 28.8 32 28" stroke="#b9476a" strokeWidth="0.9" />
            <path
              d="M8 20 C6 13 11 7 18 7 C21 4.5 27 5 29.5 8.5 C34 9 36.5 13 35.5 17.5 C37 21 34.5 25.5 30 25.5 C28 28 23.5 28.5 21 26.5 C17.5 28.5 12 27.5 10.5 24.5 C8.5 23.8 7.6 22 8 20 Z"
              fill="#f7a1b5"
              stroke="#5b1a33"
              strokeWidth="1.1"
            />
            <g stroke="#c4506d" strokeWidth="1.15">
              <path d="M12 15 C14 13 16 16 18.5 14" />
              <path d="M20 10 C22 12 25 9 27 11.5" />
              <path d="M22.5 14.5 C25 13.5 26.5 16.5 29.5 15" />
              <path d="M27 21.5 C29 20 31 22 33.5 20.5" />
              <path d="M15 24.5 C16.5 23 18.5 24.5 20 23.5" />
              <path d="M31 11 C32.5 12.5 32 14.5 33.5 15.5" />
            </g>
            <path d="M13 10.5 C15 9 17 8.6 19 8.8" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.4" />
            <path className="cursor-signal" d="M10.5 20.5 C13 19 15 22.5 18 20.5 C20 19.5 21.5 21.5 24 20" pathLength={100} stroke="#e4b027" strokeWidth="1.6" />
            <path className="cursor-signal cursor-signal-late" d="M18.5 14 C20 12.5 22 15.5 24.5 13.5 C27 12 29 14 31.5 12.5" pathLength={100} stroke="#4bb3fd" strokeWidth="1.6" />
            <circle className="cursor-node" cx="24" cy="20" r="1.5" fill="#fff6c2" />
            <circle className="cursor-node cursor-node-late" cx="12" cy="15" r="1.4" fill="#4bb3fd" />
          </svg>
          {/* An idea: a glass bulb lit from its filament, its rays turning. */}
          <svg viewBox="0 0 40 40" className="cursor-idea" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <radialGradient id="cursor-bulb-glass" cx="0.42" cy="0.38" r="0.65">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.35" stopColor="#fff2a8" />
                <stop offset="1" stopColor="#f5b120" />
              </radialGradient>
            </defs>
            <g className="cursor-rays" stroke="#ffd34d" strokeWidth="2">
              <path d="M20 1.5 V4.5 M7.5 6.5 L9.7 8.7 M32.5 6.5 L30.3 8.7 M2.5 17.5 H5.5 M34.5 17.5 H37.5" />
            </g>
            <path
              d="M20 8 C14.5 8 10.5 12.2 10.5 17.4 C10.5 20.8 12.3 23.2 14.4 25 C15.3 25.8 15.6 26.6 15.6 27.6 V28.5 H24.4 V27.6 C24.4 26.6 24.7 25.8 25.6 25 C27.7 23.2 29.5 20.8 29.5 17.4 C29.5 12.2 25.5 8 20 8 Z"
              fill="url(#cursor-bulb-glass)"
              stroke="#8a5a00"
              strokeWidth="1.1"
            />
            <path d="M17 24.5 V20 L18.5 18 L20 20.5 L21.5 18 L23 20 V24.5" stroke="#d9480f" strokeWidth="1.1" />
            <path d="M14.5 13.5 C15.4 11.6 17 10.5 18.8 10.2" stroke="#ffffff" strokeWidth="1.6" />
            <rect x="15.4" y="28.5" width="9.2" height="5.4" rx="1.4" fill="#c9d1dc" stroke="#4a5563" strokeWidth="1" />
            <path d="M15.6 30.3 H24.4 M15.6 32.1 H24.4" stroke="#7b8796" strokeWidth="0.9" />
            <path d="M18 34 H22 L21 36 H19 Z" fill="#4a5563" />
          </svg>
          {/* A question: a glossy badge. */}
          <svg viewBox="0 0 40 40" className="cursor-ask" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <radialGradient id="cursor-ask-glass" cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#8fa8ff" />
                <stop offset="0.6" stopColor="#3f5bd8" />
                <stop offset="1" stopColor="#1c2a7a" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="15" fill="url(#cursor-ask-glass)" stroke="#0b1849" strokeWidth="1.2" />
            <ellipse cx="16" cy="11.5" rx="7" ry="3.2" fill="#ffffff" fillOpacity="0.35" />
            <path d="M15.2 16 C15.2 12.6 17.6 10.8 20.2 10.8 C23.1 10.8 25.2 12.7 25.2 15.3 C25.2 18.6 20.6 19.1 20.6 22.6" stroke="#0b1849" strokeOpacity="0.45" strokeWidth="4" transform="translate(0.6 0.8)" />
            <path d="M15.2 16 C15.2 12.6 17.6 10.8 20.2 10.8 C23.1 10.8 25.2 12.7 25.2 15.3 C25.2 18.6 20.6 19.1 20.6 22.6" stroke="#ffffff" strokeWidth="3.4" />
            <circle cx="20.6" cy="28" r="2.1" fill="#e4b027" stroke="#ffffff" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
      {/* The arrow on the exact point: its colour turns gold, rose, sky and back; a dark edge holds it on any ground. */}
      <div ref={tipRef} className="cursor-tip">
        <svg viewBox="0 0 24 24" className="cursor-arrow" strokeLinejoin="round">
          <path d="M2 1.5 L2 19.5 L7 15 L10.6 22.6 L14 21.1 L10.5 13.6 L17 13.6 Z" stroke="#0b1849" strokeWidth="1.6" />
          <path d="M4 6 L4 11" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
