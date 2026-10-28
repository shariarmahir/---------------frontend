"use client";

import { useEffect, useRef } from "react";

/** How closely the brackets follow the pointer each frame (the pixel sits on it exactly). */
const FRAME_FOLLOW = 0.32;

/** Whole cards that open something: the brackets open wide around a word. */
const CARD = ".ms-root, [data-cursor='card'], li.group\\/card > button[aria-expanded='false']";
const INTERACTIVE = "a, button, [role='button'], [role='tab'], label, summary, select";
/** Fields keep the system's own cursor: the pointer steps aside over them. */
const FIELD = "input, textarea, select, [contenteditable='true']";
/** Figures: the brackets turn into a diamond, like a sight on a number. */
const DATA = ".tabular-nums, .reel-figure, [data-cursor='data']";
const PHOTO = "img, video, canvas, picture";

const GOLD = "#e4b027";
const NAVY = "#0b1849";
const WHITE = "#ffffff";

type Mode = "idle" | "link" | "card" | "text" | "data" | "field";

const hasOwnText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());

/** The pointer's colour for what lies under it: white on a photograph, navy on gold or a light field, gold on the dark. */
function toneUnder(target: Element): string {
  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el.matches(PHOTO) || el.querySelector(":scope > img, :scope > video")) return WHITE;
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/[\d.]+/g);
    if (!m || (m.length === 4 && +m[3] < 0.5)) continue;
    const [r, g, b] = m.map(Number);
    const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return light > 0.5 ? NAVY : GOLD;
  }
  return GOLD;
}

/** What the pointer is over: its mode, the card's word, the caret's height. */
function read(target: Element): { mode: Mode; label?: string; caret?: number } {
  if (target.closest(FIELD)) return { mode: "field" };
  const control = target.closest(INTERACTIVE);
  const card = target.closest(CARD);
  if (card && (!control || control === card)) {
    return { mode: "card", label: (card as HTMLElement).dataset.cursorLabel ?? (card.matches(".ms-root") ? "View" : "Open") };
  }
  if (control) return { mode: "link" };
  if (target.closest(DATA)) return { mode: "data" };
  if (hasOwnText(target)) return { mode: "text", caret: parseFloat(getComputedStyle(target).fontSize) * 1.2 };
  return { mode: "idle" };
}

/**
 * The home page's pointer (Mahir, 2026-10-29): a square pixel, the
 * brand's own unit, sitting exactly on the pointer, framed by four corner
 * brackets that glide after it. Nothing round. Over a link or button the
 * brackets close in and the pixel fills out; over a card they open wide
 * around "View" (or "Open" on a reel tile); over text the pixel becomes a
 * caret the height of that text; over a figure the brackets turn into a
 * diamond; a press squeezes them. Its colour reads what is underneath:
 * gold on the dark fields, navy on gold and light ones, white on a photo.
 *
 * Every move is a transform, and the frame loop runs only while the
 * brackets are catching up. Mouse and trackpad only, never on a touch
 * screen, and not under reduced motion: there the system cursor stays.
 * Fields keep the system cursor.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pixelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const frameEl = frameRef.current;
    const pixel = pixelRef.current;
    const label = labelRef.current;
    if (!root || !frameEl || !pixel || !label) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");
    const to = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let raf = 0;
    let last: Element | null = null;

    const step = () => {
      at.x += (to.x - at.x) * FRAME_FOLLOW;
      at.y += (to.y - at.y) * FRAME_FOLLOW;
      pixel.style.transform = `translate3d(${to.x}px, ${to.y}px, 0)`;
      frameEl.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      raf = Math.abs(to.x - at.x) + Math.abs(to.y - at.y) > 0.1 ? requestAnimationFrame(step) : 0;
    };

    const look = (target: Element) => {
      last = target;
      const { mode, label: word, caret } = read(target);
      root.dataset.mode = mode;
      root.style.setProperty("--cc", toneUnder(target));
      if (word) label.textContent = word;
      if (caret) root.style.setProperty("--caret", String(Math.min(64, Math.max(14, caret))));
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
    <div ref={rootRef} aria-hidden data-mode="idle" className="cursor">
      <div ref={frameRef} className="cursor-frame">
        <span className="cursor-corner" data-c="tl" />
        <span className="cursor-corner" data-c="tr" />
        <span className="cursor-corner" data-c="bl" />
        <span className="cursor-corner" data-c="br" />
        <span ref={labelRef} className="cursor-label">
          View
        </span>
      </div>
      <div ref={pixelRef} className="cursor-pixel">
        <span className="cursor-pixel-dot" />
        <span className="cursor-caret" />
      </div>
    </div>
  );
}
