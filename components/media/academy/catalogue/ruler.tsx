"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { digits } from "@/lib/media/format";
import { useNumerals } from "../../ui/numerals";
import { NAV_H, useCatalogue } from "./catalogue-root";

/*
 * The page ruler, after getartcraft.com: a tick rail down the screen's right
 * edge that scrolls with the page, a needle riding it with a rolling percent
 * readout, and the page's sections as words — the one you are in large at
 * the top under the ones you passed, the ones ahead queued at the bottom.
 * As a section comes up, its word leaves the queue, rides the rail beside
 * the section's top edge, then flips letter by letter into the top stack.
 * Hover the rail and the whole page folds into it: a crosshair, a ghost line
 * where a click would land, click to jump, drag to scrub.
 */

/** Where things sit, in px unless named otherwise. */
const LAYOUT = {
  railW: 60,
  /** Inset of the needle's travel from the bar and the screen's bottom. */
  edgePad: 12,
  /** A tick every this many percent of the page; a numbered one every `labelPct`. */
  minorPct: 1,
  labelPct: 5,
  /** Where a riding word flips into the top stack, as a share of the screen height below the bar. */
  threshold: 0.12,
  headingPx: 34,
  ridingPx: 20,
  queuePx: 16,
  topPad: 28,
  currentGap: 26,
  queueSlot: 20,
  queuePad: 36,
};
/** How it moves. */
const MOTION = {
  /** Scroll distance over which a word flips from the rail into the top stack. */
  flipZone: 200,
  /** Scroll distance over which a queued word moves onto the rail. */
  detachZone: 240,
  /** Per-letter delay, as a share of the flip. */
  stagger: 0.16,
  /** How far each letter's path bows toward the page mid-flight. */
  arc: 28,
  /** Longest click jump, seconds; short hops take less. */
  jumpDur: 1.25,
  /** A flip left half-done resolves itself after the scroll rests this long. */
  snapDelay: 400,
  snapDur: 0.7,
  /** The ticks draw in top-down on arrival. */
  introDur: 1,
  introStagger: 0.01,
  /** Ticks this close to the needle stretch with scroll speed, by up to `velMax`. */
  velRadius: 180,
  velMax: 0.6,
  zoomDelay: 150,
  zoomLerp: 10,
  dragLerp: 0.18,
};
/** How it looks. */
const LOOK = {
  minorAlpha: 0.4,
  majorAlpha: 0.8,
  labelAlpha: 0.5,
  minorLen: 10,
  majorLen: 20,
  ghostThick: 3,
  /** Everything but the current heading: the stack above it, the queue, a riding word. */
  queueAlpha: 0.35,
  /** Below this percent of the page the needle and its readout stay hidden. */
  needleFadePct: 3,
  bracketAlpha: 0.1,
  poolPad: 64,
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** The needle's travel for a screen of height `vh`. */
function rulerMap(vh: number) {
  const base = NAV_H + LAYOUT.edgePad;
  return { base, span: Math.max(1, vh - NAV_H - 2 * LAYOUT.edgePad), drift: (f: number) => base - f * (NAV_H + 2 * LAYOUT.edgePad) };
}

/** The rail's frost: solid at the outer edge, feathering toward the page. */
function frostMask(solid = 40, gamma = 2.2) {
  const stops = [`black ${solid}%`];
  for (let k = 1; k < 8; k++) {
    const t = k / 8;
    stops.push(`rgba(0,0,0,${Math.pow(1 - t, gamma).toFixed(3)}) ${(solid + t * (100 - solid)).toFixed(1)}%`);
  }
  stops.push("transparent 100%");
  return `linear-gradient(to left, ${stops.join(", ")})`;
}
const POOL_MASK = (at: string) => `radial-gradient(100% 100% at 100% ${at}, black 38%, rgba(0,0,0,0.82) 56%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0.2) 86%, rgba(0,0,0,0.05) 94%, transparent 97%)`;

interface Section {
  id: string;
  label: string;
  el: HTMLElement;
  letters: string[];
}

interface Pose {
  x: number;
  y: number;
  rot: number;
  scale: number;
  alpha: number;
}

type Mode = "full" | "static";

/** On a desk screen with a mouse: the full instrument, or a still one with reduced motion. Nothing on touch screens. */
function useMode(): Mode | null {
  const [mode, setMode] = useState<Mode | null>(null);
  useEffect(() => {
    const touch = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const desk = matchMedia("(pointer: fine) and (hover: hover) and (min-width: 1024px)");
    const moving = matchMedia("(prefers-reduced-motion: no-preference)");
    const read = () => setMode(!touch && desk.matches ? (moving.matches ? "full" : "static") : null);
    read();
    desk.addEventListener("change", read);
    moving.addEventListener("change", read);
    return () => {
      desk.removeEventListener("change", read);
      moving.removeEventListener("change", read);
    };
  }, []);
  return mode;
}

export function CatalogueRuler() {
  const mode = useMode();
  const { scroller, glide } = useCatalogue();
  const { numerals } = useNumerals();
  const [sections, setSections] = useState<Section[]>([]);
  const [geom, setGeom] = useState({ docH: 0, vh: 0 });

  const rail = useRef<HTMLDivElement>(null);
  const tickStrip = useRef<HTMLDivElement>(null);
  const tickRows = useRef<(HTMLDivElement | null)[]>([]);
  const tickLines = useRef<(HTMLSpanElement | null)[]>([]);
  const needle = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const digitCols = useRef<(HTMLSpanElement | null)[]>([]);
  const bracket = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const topPool = useRef<HTMLDivElement>(null);
  const bottomPool = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[][]>([]);
  const hovered = useRef(-1);
  const flash = useRef<number[]>([]);

  /** Everything the frame loop and the pointer share, kept off React's renders. */
  const live = useRef({
    vel: 0,
    lastY: 0,
    introDone: false,
    prevPct: -1,
    prevDigits: [-1, -1, -1],
    readoutAbove: false,
    zoom: 0,
    zoomIntent: false,
    zoomTimer: 0,
    dragging: false,
    dragStartY: 0,
    dragMoved: 0,
    ghostOn: false,
    ghostY: 0,
    armed: false,
    jumping: false,
    snapping: false,
    snapSince: null as number | null,
    q: [] as number[],
    adv: [] as number[][],
  });

  // The page's sections, and its size, kept up to date as it grows (pictures load, fonts swap).
  useEffect(() => {
    const el = scroller();
    if (!mode || !el) return;
    el.dataset.ruler = "on";
    const graphemes = new Intl.Segmenter("bn", { granularity: "grapheme" });
    const read = () => {
      setGeom((g) => (g.docH === el.scrollHeight && g.vh === el.clientHeight ? g : { docH: el.scrollHeight, vh: el.clientHeight }));
      setSections((prev) => {
        const found = [...el.querySelectorAll<HTMLElement>("section[data-ruler-label]")].map((s) => {
          const label = s.dataset.rulerLabel ?? "";
          return { id: s.id, label, el: s, letters: [...graphemes.segment(label)].map((g) => g.segment) };
        });
        return prev.length === found.length && prev.every((p, i) => p.el === found[i].el) ? prev : found;
      });
    };
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    if (el.firstElementChild) watch.observe(el.firstElementChild);
    document.fonts?.ready.then(read).catch(() => {});
    return () => {
      watch.disconnect();
      delete el.dataset.ruler;
    };
  }, [mode, scroller]);

  const ticks = useMemo(() => {
    if (!geom.docH) return [];
    const out: { pct: number; docY: number; major: boolean; alpha: number }[] = [];
    for (let p = 0; p <= 100 + 1e-6; p += LAYOUT.minorPct) {
      const pct = Math.round(p * 100) / 100;
      const major = Math.abs(pct % LAYOUT.labelPct) < 1e-6;
      out.push({ pct, docY: (pct / 100) * geom.docH, major, alpha: major ? LOOK.majorAlpha : LOOK.minorAlpha });
    }
    return out;
  }, [geom.docH]);

  // Measure each word's letters once they are on the page in the display face.
  useEffect(() => {
    if (mode !== "full") return;
    const measure = () => {
      live.current.adv = sections.map((_, w) => (letters.current[w] ?? []).map((l) => l?.offsetWidth ?? 0));
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, [mode, sections]);

  // The ticks draw in, top-down, then hand over to the frame loop.
  useEffect(() => {
    if (mode !== "full" || !ticks.length) return;
    const lines = tickLines.current.filter((l): l is HTMLSpanElement => !!l);
    live.current.introDone = false;
    for (const [i, l] of lines.entries()) {
      l.style.transition = "none";
      l.style.transform = "scaleX(0)";
      l.style.opacity = "0";
      l.getBoundingClientRect();
      l.style.transition = `transform ${MOTION.introDur}s cubic-bezier(0.215,0.61,0.355,1) ${i * MOTION.introStagger}s, opacity ${MOTION.introDur}s ease ${i * MOTION.introStagger}s`;
      l.style.transform = "scaleX(1)";
      l.style.opacity = String(ticks[i]?.alpha ?? LOOK.minorAlpha);
    }
    const done = window.setTimeout(
      () => {
        for (const l of lines) l.style.transition = "none";
        live.current.introDone = true;
      },
      (MOTION.introDur + lines.length * MOTION.introStagger) * 1000,
    );
    return () => window.clearTimeout(done);
  }, [mode, ticks]);

  // Any wheel, touch or key from the reader arms the auto-resolve of a half-done flip.
  useEffect(() => {
    if (mode !== "full") return;
    const arm = () => {
      live.current.armed = true;
    };
    window.addEventListener("wheel", arm, { passive: true });
    window.addEventListener("touchmove", arm, { passive: true });
    window.addEventListener("keydown", arm);
    return () => {
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchmove", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [mode]);

  // The frame loop: rail, needle, readout, zoom, ghost, and every letter of every word.
  useEffect(() => {
    const el = scroller();
    if (!mode || !el || !geom.docH) return;
    const full = mode === "full";
    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const L = live.current;
      const dt = Math.min((now - last) / 1000, 0.1) || 0.016;
      last = now;
      const docH = el.scrollHeight;
      const vh = el.clientHeight;
      const vw = window.innerWidth;
      const s = el.scrollTop;
      const room = Math.max(1, docH - vh);
      const f = clamp01(s / room);
      L.vel += ((s - L.lastY) / dt - L.vel) * (1 - Math.exp(-6 * dt));
      L.lastY = s;
      const map = rulerMap(vh);
      const drift = map.drift(f);

      if (tickStrip.current) tickStrip.current.style.transform = `translate3d(0, ${-s + drift}px, 0)`;
      const at = map.base + f * map.span;
      if (needle.current) {
        needle.current.style.transform = `translate3d(0, ${at}px, 0)`;
        needle.current.style.opacity = String(clamp01(f / Math.max(0.001, LOOK.needleFadePct / 100)));
      }
      const above = at > vh - 26;
      if (readout.current && above !== L.readoutAbove) {
        L.readoutAbove = above;
        readout.current.style.top = above ? "-14px" : "4px";
      }
      const pct = Math.round(100 * f);
      if (pct !== L.prevPct) {
        L.prevPct = pct;
        rail.current?.setAttribute("aria-valuenow", String(pct));
        const three = String(pct).padStart(3, "0");
        for (let k = 0; k < 3; k++) {
          const d = three.charCodeAt(k) - 48;
          if (d === L.prevDigits[k]) continue;
          L.prevDigits[k] = d;
          const col = digitCols.current[k];
          if (col) col.style.transform = `translateY(${-d}em)`;
        }
      }

      // Hovering the rail folds the whole page into it.
      if (full) {
        const target = L.zoomIntent || L.dragging ? 1 : 0;
        L.zoom += (target - L.zoom) * (1 - Math.exp(-MOTION.zoomLerp * dt));
        if (target === 0 && L.zoom < 5e-4) L.zoom = 0;
        if (target === 1 && L.zoom > 0.9995) L.zoom = 1;
      }
      const z = full ? L.zoom : 0;
      if (bracket.current) {
        bracket.current.style.transform = `translate3d(0, ${map.base + (s / docH) * map.span}px, 0)`;
        bracket.current.style.height = `${(vh / docH) * map.span}px`;
        bracket.current.style.opacity = String(z);
      }
      if (ghost.current) {
        ghost.current.style.transform = `translate3d(0, ${L.ghostY - LOOK.ghostThick / 2}px, 0)`;
        ghost.current.style.opacity = L.ghostOn ? String(0.2 + 0.8 * z) : "0";
      }
      if (full && L.introDone) {
        const needleDoc = f * docH;
        const speed = clamp01(Math.abs(L.vel) / 3000);
        for (let n = 0; n < ticks.length; n++) {
          const t = ticks[n];
          const onScreen = t.docY - s + drift;
          const onMap = map.base + (t.pct / 100) * map.span;
          const row = tickRows.current[n];
          if (row) row.style.transform = z > 0 ? `translate3d(0, ${z * (onMap - onScreen)}px, 0)` : "";
          const line = tickLines.current[n];
          if (!line) continue;
          const dist = Math.abs(t.docY - needleDoc);
          if (dist < MOTION.velRadius) {
            const near = 1 - dist / MOTION.velRadius;
            const r = speed * near * near;
            line.style.transform = `scaleX(${1 + MOTION.velMax * r})`;
            line.style.opacity = String(Math.min(1, t.alpha + 0.6 * r));
          } else {
            line.style.transform = "scaleX(1)";
            line.style.opacity = String(t.alpha);
          }
        }
      }

      if (!full || !sections.length) return;

      // The words.
      const right = vw - LAYOUT.railW;
      const flipAt = NAV_H + LAYOUT.threshold * vh;
      const qs = LAYOUT.queuePx / LAYOUT.headingPx;
      const rs = LAYOUT.ridingPx / LAYOUT.headingPx;
      const tops = sections.map((sec) => sec.el.getBoundingClientRect().top - el.getBoundingClientRect().top);
      const flips = tops.map((top) => clamp01((flipAt + MOTION.flipZone - top) / MOTION.flipZone));
      let current = 0;
      flips.forEach((p, i) => {
        if (p >= 0.5) current = i;
      });
      let topBottom = NAV_H;
      let anyQueued = false;

      sections.forEach((sec, w) => {
        const adv = L.adv[w];
        const spans = letters.current[w];
        if (!adv?.length || !spans) return;
        const total = adv.reduce((a, b) => a + b, 0);
        // Growing into the current heading, or shrinking back into the stack, eases over ~80 ms.
        const goal = w === current ? 1 : 0;
        const was = L.q[w] ?? goal;
        const q = (L.q[w] = was + (goal - was) * (1 - Math.exp(-dt / 0.08)));
        const top = tops[w];
        const fp = flips[w];
        const dp = clamp01((vh - top) / MOTION.detachZone);

        let cum = 0;
        const stackScale = qs + (1 - qs) * q;
        const smallY = NAV_H + LAYOUT.topPad + w * LAYOUT.queueSlot + LAYOUT.queuePx / 2;
        const bigY = NAV_H + LAYOUT.topPad + w * LAYOUT.queueSlot + LAYOUT.currentGap + LAYOUT.headingPx / 2;
        const queueY = vh - LAYOUT.queuePad - (sections.length - 1 - w) * LAYOUT.queueSlot - LAYOUT.queuePx / 2;
        const poses = adv.map((a): { stack: Pose; riding: Pose; queue: Pose } => {
          const mid = cum + a / 2;
          cum += a;
          return {
            stack: { x: right - total * stackScale + mid * stackScale, y: smallY + (bigY - smallY) * q, rot: 0, scale: stackScale, alpha: LOOK.queueAlpha + (1 - LOOK.queueAlpha) * q },
            riding: { x: right - LAYOUT.ridingPx / 2 - 6, y: top + 14 + mid * rs, rot: 90, scale: rs, alpha: LOOK.queueAlpha },
            queue: { x: right - total * qs + mid * qs, y: queueY, rot: 0, scale: qs, alpha: LOOK.queueAlpha },
          };
        });

        // Which leg of the trip the word is on, and how far along.
        const toStack = fp > 0 || dp >= 1;
        const t = fp > 0 ? fp : dp >= 1 ? 0 : dp;
        const n = spans.length;
        const reach = 1 + (n - 1) * MOTION.stagger;
        // A word just clicked glows in the accent for a moment.
        const lit = clamp01(((flash.current[w] ?? 0) - now) / 350);
        let maxAlpha = 0;
        let minY = Infinity;
        let maxY = -Infinity;
        spans.forEach((span, k) => {
          if (!span) return;
          const p = poses[k];
          const from = toStack ? p.riding : p.queue;
          const to = toStack ? p.stack : p.riding;
          // Into the stack the last letter leads; out of the queue the first.
          const order = toStack ? n - 1 - k : k;
          const e = easeInOutCubic(clamp01(t * reach - order * MOTION.stagger));
          const u = 1 - e;
          const cx = (from.x + to.x) / 2 - MOTION.arc;
          const cy = (from.y + to.y) / 2;
          const x = u * u * from.x + 2 * u * e * cx + e * e * to.x;
          const y = u * u * from.y + 2 * u * e * cy + e * e * to.y;
          const rot = from.rot + (to.rot - from.rot) * e;
          const scale = from.scale + (to.scale - from.scale) * e;
          const alpha = from.alpha + (to.alpha - from.alpha) * e;
          span.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
          span.style.opacity = String(alpha);
          span.style.color = hovered.current === w || lit > 0 ? "var(--c-accent-ink)" : "var(--c-ink-strong)";
          span.style.pointerEvents = alpha > 0.05 ? "auto" : "none";
          maxAlpha = Math.max(maxAlpha, alpha);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
        if (fp >= 0.96) topBottom = Math.max(topBottom, maxY + LAYOUT.headingPx / 2);
        if (!toStack && t < 0.04) anyQueued = true;
      });

      if (topPool.current) {
        topPool.current.style.height = `${topBottom + LOOK.poolPad}px`;
        topPool.current.style.opacity = "1";
      }
      if (bottomPool.current) bottomPool.current.style.opacity = anyQueued ? "1" : "0";

      // A flip left half-done resolves itself once the reader stops.
      const g = glide.current;
      const half = flips.findIndex((p) => p > 0.04 && p < 0.96);
      if (L.dragging) L.armed = true;
      if (L.snapping) {
        if (half < 0) L.snapping = false;
      } else if (half >= 0 && L.armed && !L.jumping && Math.abs(L.vel) < 30 && g && L.zoom < 0.3) {
        if (L.snapSince === null) L.snapSince = now;
        else if (now - L.snapSince > MOTION.snapDelay) {
          const top = tops[half];
          const goal = flips[half] >= 0.5 ? s + top - (flipAt - 4) : s + top - (flipAt + MOTION.flipZone + 4);
          L.snapping = true;
          L.armed = false;
          L.snapSince = null;
          g.scrollTo(Math.max(0, Math.min(room, goal)), {
            duration: MOTION.snapDur,
            easing: easeInOutCubic,
            onComplete: () => {
              L.snapping = false;
            },
          });
        }
      } else L.snapSince = null;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [mode, geom.docH, ticks, sections, scroller, glide]);

  if (!mode || !geom.docH) return null;
  const full = mode === "full";
  const numeralCol = numerals === "bn" ? "০১২৩৪৫৬৭৮৯" : "0123456789";

  /** Scroll to a place, easing through the glide when there is one. */
  const scrollTo = (y: number, duration: number) => {
    const el = scroller();
    if (!el) return;
    const L = live.current;
    const g = glide.current;
    L.jumping = true;
    L.armed = false;
    if (g)
      g.scrollTo(y, {
        duration,
        easing: easeOutExpo,
        onComplete: () => {
          L.jumping = false;
        },
      });
    else {
      el.scrollTo({ top: y });
      L.jumping = false;
    }
  };
  /** Jump to a section; `at` is the click's timestamp, on the same clock as the frame loop. */
  const jumpTo = (sec: Section, w: number, at: number) => {
    const el = scroller();
    if (!el) return;
    flash.current[w] = at + 350;
    const y = el.scrollTop + sec.el.getBoundingClientRect().top - el.getBoundingClientRect().top - NAV_H;
    scrollTo(Math.max(0, y), MOTION.jumpDur);
  };
  const railToScroll = (clientY: number) => {
    const el = scroller();
    if (!el) return 0;
    const map = rulerMap(el.clientHeight);
    return clamp01((clientY - map.base) / map.span) * Math.max(1, el.scrollHeight - el.clientHeight);
  };
  const intend = (on: boolean) => {
    const L = live.current;
    window.clearTimeout(L.zoomTimer);
    L.zoomTimer = window.setTimeout(() => {
      L.zoomIntent = on;
    }, MOTION.zoomDelay);
  };
  const release = (e: React.PointerEvent) => {
    const L = live.current;
    if (!L.dragging) return;
    L.dragging = false;
    const box = rail.current?.getBoundingClientRect();
    const inside = box && e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
    if (!inside) {
      L.ghostOn = false;
      intend(false);
    }
  };

  const widest = Math.max(260, ...sections.map((s) => s.label.length * LAYOUT.headingPx * 0.62)) + LAYOUT.railW + LOOK.poolPad;

  return (
    <>
      {/* Contrast pools behind the top stack and the bottom queue, so the words read over cards. */}
      {full && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-39">
          <div
            ref={topPool}
            className="absolute top-0 right-0 opacity-0"
            style={{ width: widest, backdropFilter: "blur(9px)", WebkitBackdropFilter: "blur(9px)", backgroundColor: "color-mix(in srgb, var(--c-bg) 80%, transparent)", maskImage: POOL_MASK("0%"), WebkitMaskImage: POOL_MASK("0%") }}
          />
          <div
            ref={bottomPool}
            className="absolute right-0 bottom-0 opacity-0 transition-opacity duration-300"
            style={{
              width: widest,
              height: LAYOUT.queuePad + sections.length * LAYOUT.queueSlot + LOOK.poolPad,
              backdropFilter: "blur(9px)",
              WebkitBackdropFilter: "blur(9px)",
              backgroundColor: "color-mix(in srgb, var(--c-bg) 80%, transparent)",
              maskImage: POOL_MASK("100%"),
              WebkitMaskImage: POOL_MASK("100%"),
            }}
          />
        </div>
      )}

      <div
        ref={rail}
        role="scrollbar"
        aria-controls="academy-main"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-label="পাতার কোথায় আছেন"
        className="fixed inset-y-0 right-0 z-40 cursor-crosshair overflow-hidden"
        style={{ width: LAYOUT.railW }}
        onClick={(e) => {
          const L = live.current;
          if (L.dragMoved > 4) return;
          const el = scroller();
          if (!el) return;
          const y = railToScroll(e.clientY);
          const far = Math.abs(y - el.scrollTop);
          scrollTo(y, MOTION.jumpDur * (0.4 + 0.6 * Math.min(1, far / (2.5 * el.clientHeight))));
        }}
        onPointerEnter={full ? () => intend(true) : undefined}
        onPointerLeave={
          full
            ? () => {
                live.current.ghostOn = false;
                if (!live.current.dragging) intend(false);
              }
            : undefined
        }
        onPointerMove={
          full
            ? (e) => {
                const L = live.current;
                const el = scroller();
                if (!el) return;
                const map = rulerMap(el.clientHeight);
                L.ghostOn = true;
                L.ghostY = Math.max(map.base, Math.min(map.base + map.span, e.clientY));
                if (!L.dragging) return;
                L.dragMoved = Math.max(L.dragMoved, Math.abs(e.clientY - L.dragStartY));
                glide.current?.scrollTo(railToScroll(e.clientY), { lerp: MOTION.dragLerp });
              }
            : undefined
        }
        onPointerDown={
          full
            ? (e) => {
                e.preventDefault();
                const L = live.current;
                L.dragStartY = e.clientY;
                L.dragMoved = 0;
                L.dragging = true;
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerUp={full ? release : undefined}
        onPointerCancel={full ? release : undefined}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backdropFilter: "blur(9px)", WebkitBackdropFilter: "blur(9px)", backgroundColor: "color-mix(in srgb, var(--c-bg) 55%, transparent)", maskImage: frostMask(), WebkitMaskImage: frostMask() }}
        />
        <div ref={tickStrip} aria-hidden className="absolute inset-x-0 top-0" style={{ height: geom.docH }}>
          {ticks.map((t, n) => (
            <div
              key={t.pct}
              ref={(r) => {
                tickRows.current[n] = r;
              }}
              className="absolute inset-x-0"
              style={{ top: t.docY, height: 0 }}
            >
              <span
                ref={(r) => {
                  tickLines.current[n] = r;
                }}
                className="absolute top-0 right-0 block h-px origin-right bg-(--c-ink)"
                style={{ width: t.major ? LOOK.majorLen : LOOK.minorLen, opacity: full ? 0 : t.alpha }}
              />
              {t.major && (
                <span className="absolute top-0 -translate-y-1/2 font-mono text-[9px] tracking-[0.08em] text-(--c-ink)" style={{ right: LOOK.majorLen + 4, opacity: LOOK.labelAlpha }}>
                  {digits(t.pct, numerals)}
                </span>
              )}
            </div>
          ))}
        </div>
        {full && (
          <div ref={bracket} aria-hidden className="absolute inset-x-0 top-0 opacity-0" style={{ height: 0 }}>
            <div className="absolute inset-0 bg-(--c-ink)" style={{ opacity: LOOK.bracketAlpha }} />
            <span className="absolute inset-x-0 top-0 block h-px bg-(--c-ink) opacity-50" />
            <span className="absolute inset-x-0 bottom-0 block h-px bg-(--c-ink) opacity-50" />
          </div>
        )}
        <div ref={needle} aria-hidden className="absolute inset-x-0 top-0" style={{ height: 0 }}>
          <span className="absolute inset-x-0 top-0 block h-px bg-(--c-needle) shadow-[0_0_6px_var(--c-needle)]" />
          <span ref={readout} className="absolute right-0.5 font-mono text-[9px] tracking-[0.08em] whitespace-nowrap text-(--c-needle)" style={{ top: 4 }}>
            <span className="ruler-digits">
              {[0, 1, 2].map((k) => (
                <span
                  key={k}
                  ref={(r) => {
                    digitCols.current[k] = r;
                  }}
                  className="ruler-digit-col"
                >
                  {numeralCol.split("").map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </span>
              ))}
            </span>
            <span className="ml-0.5">%</span>
          </span>
        </div>
      </div>

      {full && (
        <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40" style={{ width: LAYOUT.railW }}>
          <div ref={ghost} className="absolute top-0 right-0 block bg-(--c-ink) opacity-0" style={{ width: LAYOUT.railW, height: LOOK.ghostThick }} />
        </div>
      )}

      {/* The section words: letters flying between the queue, the rail and the top stack. */}
      {full ? (
        <div className="pointer-events-none fixed inset-0 z-40">
          {sections.map((sec, w) => (
            <span key={sec.id}>
              {sec.letters.map((ch, k) => (
                <span
                  key={k}
                  ref={(r) => {
                    (letters.current[w] ??= [])[k] = r;
                  }}
                  aria-hidden
                  onClick={(e) => jumpTo(sec, w, e.timeStamp)}
                  onPointerEnter={() => {
                    hovered.current = w;
                  }}
                  onPointerLeave={() => {
                    if (hovered.current === w) hovered.current = -1;
                  }}
                  className="display absolute top-0 left-0 cursor-pointer whitespace-pre opacity-0 will-change-transform"
                  style={{ fontSize: LAYOUT.headingPx, lineHeight: 1, textShadow: "0 0 4px var(--c-bg), 0 0 10px var(--c-bg)" }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
          <nav aria-label="পাতার অংশ" className="sr-only">
            <ul>
              {sections.map((sec, w) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} onClick={(e) => (e.preventDefault(), jumpTo(sec, w, e.timeStamp))} className="pointer-events-auto">
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : (
        <nav aria-label="পাতার অংশ" className="fixed z-40 text-right" style={{ bottom: LAYOUT.queuePad, right: LAYOUT.railW }}>
          <ul className="relative flex flex-col gap-1.5">
            {sections.map((sec, w) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} onClick={(e) => (e.preventDefault(), jumpTo(sec, w, e.timeStamp))} className="display text-(--c-ink) hover:text-(--c-ink-strong) active:text-(--c-accent-ink)" style={{ fontSize: LAYOUT.queuePx + 2 }}>
                  {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
