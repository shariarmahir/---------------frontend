"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export interface PosterLive {
  /** The film (the largest MP4 its host keeps). */
  film: string;
  /** Its first frame: the haze behind the film, and the whole shot when the film stays off. */
  still: string;
  /** The film's width over its height. */
  ratio: number;
  /**
   * "subject": cut to one subject centred at `at` (CSS object-position `position` brings it
   * there), floating free of its background with rings orbiting it and sparks around it.
   * "frame": the whole film, `zoom` times the frame's width, centred over its own haze.
   */
  fit: "subject" | "frame";
  position?: string;
  at?: string;
  zoom?: number;
  /** A film on a plain backdrop: that colour behind it, in place of the haze (which would smear the film's middle). */
  ground?: string;
  /** For a "frame" shot: the point across the film's width (percent) brought to the frame's centre (default 50). */
  focusX?: number;
}

/**
 * A card's 3D film (Mahir, 2026-10-29: his four Pinterest pins, one per service). The shot is
 * built in depth: the film's first frame, blurred to a haze, is pushed 260px back in 3D, and the
 * film plays in front; the stage sways slowly, so the two part like a camera move, and a fine
 * pointer tilts it. A "subject" shot (the AI brain) is cut out of its background and floats,
 * the background behind it has the subject cut out of it, two rings orbit through the subject
 * (the browser sorts their back halves behind it), and sparks and signals are drawn on a canvas.
 *
 * Each film is Pinterest's largest MP4 (its embed shows only a smaller still). Loaded once the
 * card is near the screen; plays only on screen; fades in over the card's drawing at the first
 * frame, and the drawing stays if neither film nor still loads. Under reduced motion, or with
 * data saving on (or a 2G link), the film stays off and the still stands in, without motion.
 */
export function CardLive({ live, onScreen, onReady }: { live: PosterLive; onScreen: boolean; onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const saving = useSaveData();
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [filmFailed, setFilmFailed] = useState(false);
  if (onScreen && !armed) setArmed(true);
  const still = reduced || saving || filmFailed;
  const subject = live.fit === "subject";

  const show = () => {
    if (shown) return;
    setShown(true);
    onReady();
  };

  // With the film off, the still is decoded before the shot shows, so its layers arrive together.
  useEffect(() => {
    if (!armed || !still) return;
    let current = true;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = live.still;
    img
      .decode()
      .then(() => {
        if (current) show();
      })
      .catch(() => {});
    return () => {
      current = false;
    };
    // show is a fresh closure each render; the decode runs once per still.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, still, live.still]);

  // A fine pointer tilts the shot toward itself.
  useEffect(() => {
    const el = root.current;
    const card = el?.closest<HTMLElement>(".ms-root");
    if (!el || !card || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      el.style.setProperty("--lv-tx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--lv-ty", (((e.clientY - r.top) / r.width) * 2 - 1.25).toFixed(3));
    };
    const leave = () => {
      el.style.removeProperty("--lv-tx");
      el.style.removeProperty("--lv-ty");
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !subject || !shown || !onScreen || reduced) return;
    return runSparks(c, live.at ?? "50% 50%");
  }, [subject, shown, onScreen, reduced, live.at]);

  const at = live.at ?? "50% 50%";
  const front = still ? (
    <Still src={live.still} position={live.position} />
  ) : (
    <Film src={live.film} still={live.still} position={live.position} play={onScreen} onFirstFrame={show} onFail={() => setFilmFailed(true)} />
  );
  return (
    <div
      ref={root}
      aria-hidden
      data-fit={live.fit}
      style={{ "--lv-at": at, "--lv-y": at.split(" ")[1] } as CSSProperties}
      className={cn(
        "lv-root pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-out",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      {armed && (
        <>
          <div className="lv-tilt">
            <div className="lv-stage">
              <div className="lv-far">
                {live.ground ? (
                  <span className="absolute inset-0" style={{ background: live.ground }} />
                ) : (
                  <Still src={live.still} position={live.position} className="lv-haze" />
                )}
                {subject && <Still src={live.still} position={live.position} className="lv-field" />}
              </div>
              {subject && (
                <>
                  <span className="lv-ring lv-ring-a" />
                  <span className="lv-ring lv-ring-b" />
                </>
              )}
              <div className="lv-near">
                {subject ? (
                  <>
                    {front}
                    <span className="lv-glow absolute inset-0" />
                    <span className="lv-sweep absolute inset-0" />
                  </>
                ) : (
                  // The whole film, sized by its own ratio and centred; its edges fade into the haze.
                  <div
                    className="lv-plate"
                    style={{
                      width: `${(live.zoom ?? 1) * 100}%`,
                      aspectRatio: live.ratio,
                      translate: live.focusX === undefined ? undefined : `-${live.focusX}% -50%`,
                    }}
                  >
                    {front}
                  </div>
                )}
              </div>
            </div>
          </div>
          {subject && <canvas ref={canvas} className="absolute inset-0 size-full" />}
          {/* A soft vignette joins the shot to the card's frame. */}
          <span className="lv-vignette absolute inset-0" />
        </>
      )}
    </div>
  );
}

function Still({ src, position, className }: { src: string; position?: string; className?: string }) {
  return (
    // A remote still, drawn by the browser at its own size: next/image would only re-encode it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      referrerPolicy="no-referrer"
      decoding="async"
      style={{ objectPosition: position }}
      className={cn("absolute inset-0 size-full max-w-none object-cover select-none", className)}
    />
  );
}

/** The film: muted, looped, inline; plays while `play` holds. */
function Film({
  src,
  still,
  position,
  play,
  onFirstFrame,
  onFail,
}: {
  src: string;
  still: string;
  position?: string;
  play: boolean;
  onFirstFrame: () => void;
  onFail: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) v.play().catch(() => {});
    else v.pause();
  }, [play]);
  return (
    <video
      ref={ref}
      src={src}
      poster={still}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      onLoadedData={onFirstFrame}
      onError={onFail}
      style={{ objectPosition: position }}
      className="absolute inset-0 size-full object-cover"
    />
  );
}

type Connection = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, f: () => void) => void;
  removeEventListener?: (type: string, f: () => void) => void;
};
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

/** True when the visitor asks to save data, or is on a 2G link: the films then stay off. */
function useSaveData() {
  return useSyncExternalStore(
    (onChange) => {
      const c = connection();
      c?.addEventListener?.("change", onChange);
      return () => c?.removeEventListener?.("change", onChange);
    },
    () => {
      const c = connection();
      return !!c && (c.saveData === true || c.effectiveType === "2g" || c.effectiveType === "slow-2g");
    },
    () => false,
  );
}

type Spark = { x: number; y: number; vx: number; vy: number; r: number; phase: number; hue: string };
type Flash = { x: number; y: number; born: number; life: number; hue: string };
type Signal = { a: number; born: number; life: number; reach: number; hue: string };

// White, the brand's light blue and gold, the picture's violet and pink.
const HUES = ["255 255 255", "143 161 227", "228 176 39", "190 150 255", "240 168 255"];
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/**
 * Sparks on the canvas: dust that drifts out from the subject and twinkles, synapse flashes
 * across it, and signals that shoot outward along rays. Returns the stop function.
 */
function runSparks(c: HTMLCanvasElement, at: string) {
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const [ax, ay] = at.split(" ").map((v) => parseFloat(v) / 100);
  let w = 0;
  let h = 0;
  let dpr = 1;
  let dust: Spark[] = [];
  const flashes: Flash[] = [];
  const signals: Signal[] = [];

  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth;
    h = c.clientHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const count = Math.round((w * h) / 2600);
    dust = Array.from({ length: count }, () => newDust(true));
  };
  const newDust = (anywhere: boolean): Spark => {
    const cx = ax * w;
    const cy = ay * h;
    const t = Math.random() * Math.PI * 2;
    const d = anywhere ? Math.random() * Math.max(w, h) * 0.7 : Math.random() * w * 0.3;
    const speed = 4 + Math.random() * 10;
    return {
      x: cx + Math.cos(t) * d,
      y: cy + Math.sin(t) * d * 0.8,
      vx: Math.cos(t) * speed,
      vy: Math.sin(t) * speed * 0.8 - 2,
      r: 0.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.6 ? HUES[0] : pick(HUES),
    };
  };

  size();
  const ro = new ResizeObserver(size);
  ro.observe(c);

  let raf = 0;
  let last = performance.now();
  let nextFlash = 0;
  let nextSignal = 0;
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const cx = ax * w;
    const cy = ay * h;

    for (let i = 0; i < dust.length; i++) {
      const s = dust[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.x < -4 || s.x > w + 4 || s.y < -4 || s.y > h + 4) {
        dust[i] = newDust(false);
        continue;
      }
      const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(now / 420 + s.phase));
      ctx.fillStyle = `rgb(${s.hue} / ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Synapse flashes across the subject.
    if (now > nextFlash) {
      const t = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random());
      flashes.push({ x: cx + Math.cos(t) * d * w * 0.36, y: cy + Math.sin(t) * d * h * 0.19, born: now, life: 500 + Math.random() * 500, hue: pick(HUES) });
      nextFlash = now + 90 + Math.random() * 220;
    }
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const p = (now - f.born) / f.life;
      if (p >= 1) {
        flashes.splice(i, 1);
        continue;
      }
      const a = Math.sin(p * Math.PI);
      const r = 2 + p * 10;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgb(${f.hue} / ${(0.95 * a).toFixed(3)})`);
      g.addColorStop(1, `rgb(${f.hue} / 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signals shooting outward from the subject along rays.
    if (now > nextSignal) {
      signals.push({
        a: Math.random() * Math.PI * 2,
        born: now,
        life: 1100 + Math.random() * 700,
        reach: 0.55 + Math.random() * 0.4,
        hue: pick(HUES.slice(1)),
      });
      nextSignal = now + 380 + Math.random() * 600;
    }
    ctx.lineCap = "round";
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      const p = (now - s.born) / s.life;
      if (p >= 1) {
        signals.splice(i, 1);
        continue;
      }
      const ease = 1 - (1 - p) ** 3;
      const rx = w * 0.3 + ease * w * s.reach;
      const ry = h * 0.16 + ease * h * s.reach * 0.6;
      const hx = cx + Math.cos(s.a) * rx;
      const hy = cy + Math.sin(s.a) * ry;
      const tx = cx + Math.cos(s.a) * (rx - w * 0.12);
      const ty = cy + Math.sin(s.a) * (ry - h * 0.07);
      const fade = Math.sin(p * Math.PI);
      const g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, `rgb(${s.hue} / 0)`);
      g.addColorStop(1, `rgb(${s.hue} / ${(0.9 * fade).toFixed(3)})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.fillStyle = `rgb(255 255 255 / ${fade.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    ctx.clearRect(0, 0, c.width, c.height);
  };
}
