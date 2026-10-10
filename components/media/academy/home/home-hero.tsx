"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { Landmark, Ticket } from "lucide-react";
import type { School } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Turn } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { toneStyle } from "../catalogue/tones";
import { DeptIcon } from "../departments/dept-icons";

export interface HeroTile {
  id: string;
  name: string;
  school: School;
  tone: number;
}

/** The wordmark, cut where Bangla letters join, so each part can rise on its own. */
const WORDMARK = ["কা", "ণ্ডা", "রী"];

/**
 * Where the tiles sit: two arcs down the sides, bowing outward at the middle
 * where the words are widest and leaning in at the top and bottom corners.
 */
function place(i: number, count: number) {
  const side = i % 2;
  const rows = Math.ceil(count / 2);
  const row = Math.floor(i / 2);
  const t = rows > 1 ? row / (rows - 1) : 0.5;
  const inset = 5 + 13 * (1 - Math.sin(Math.PI * t)) + (row % 2 ? 3 : 0);
  return {
    left: side ? 100 - inset : inset,
    top: 9 + t * 80 + (side ? 3 : 0),
    depth: [1, 0.55, 0.8, 0.4, 0.7][i % 5],
    // Phones keep only the corners, clear of the words; tablets add every other row.
    shown: row === 0 || row === rows - 1 ? "" : row % 2 ? "hidden md:block" : "hidden sm:block",
  };
}

/**
 * The home page's first screen, after the reference's: the academy's name
 * set huge, its parts rising one after another; under it the promise in one
 * line, the two ways in and the plain facts. Around it every department
 * floats as its own tile, drifting slowly and leaning toward the pointer —
 * each tile is a door into that department. A ticker of the departments
 * runs under the screen.
 */
export function HomeHero({ tiles, facts, children }: { tiles: HeroTile[]; facts: React.ReactNode[]; children: React.ReactNode }) {
  const field = useRef<HTMLDivElement>(null);

  // The tiles lean toward the pointer, eased so they glide rather than jump.
  useEffect(() => {
    const el = field.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      tx = ((e.clientX - box.left) / box.width - 0.5) * 2;
      ty = ((e.clientY - box.top) / box.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const host = el.parentElement ?? el;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="hero" data-ruler-label="শুরু" className="relative">
      <div className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
        <div ref={field} className="absolute inset-0" style={{ "--px": 0, "--py": 0 } as CSSProperties}>
          {tiles.map((t, i) => {
            const p = place(i, tiles.length);
            return (
              <Link
                key={t.id}
                href={`/media/academy/dept/${t.id}`}
                title={`${t.name} বিভাগ`}
                aria-label={`${t.name} বিভাগ`}
                style={{ ...toneStyle(t.tone), left: `${p.left}%`, top: `${p.top}%`, "--depth": p.depth, "--i": i } as CSSProperties}
                className={cn("tone hero-tile group absolute -translate-1/2", p.shown)}
              >
                <span className="hero-float block">
                  <span
                    className="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_8px_18px_rgba(0,0,0,0.32)] transition-transform duration-300 ease-out group-hover:scale-110 sm:size-18 sm:rounded-[1.2rem] lg:size-20"
                    style={{ opacity: 0.55 + p.depth * 0.45 }}
                  >
                    <DeptIcon dept={t.id} school={t.school} className="size-8 sm:size-10 lg:size-11" />
                  </span>
                  <span className="hud pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 bg-(--c-invert-bg) px-2 py-0.5 whitespace-nowrap text-(--c-invert-fg) opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {t.name}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="pointer-events-none relative z-40 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-14 md:px-10">
          <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
            <div aria-hidden className="absolute -inset-x-32 -inset-y-24" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--c-bg) 82%, transparent), transparent)" }} />
            <div className="relative w-full" style={{ containerType: "inline-size" }}>
              <p role="img" aria-label="কাণ্ডারী" className="relative font-bold whitespace-pre text-(--c-ink-strong)" style={{ fontSize: "24cqw", lineHeight: 1.15, fontFamily: "var(--font-m-hind), var(--font-bengali), sans-serif" }}>
                {WORDMARK.map((part, i) => (
                  <span
                    key={part}
                    aria-hidden
                    className="wm-letter inline-block"
                    style={{ "--i": i, textShadow: "0 0 0.6vw color-mix(in srgb, var(--c-bg) 92%, transparent), 0 0.4vw 5vw color-mix(in srgb, var(--c-bg) 55%, transparent)" } as CSSProperties}
                  >
                    {part}
                  </span>
                ))}
              </p>
            </div>
            <h1 data-reveal data-in className="display relative mt-4 text-3xl leading-[1.15] text-(--c-ink-strong) sm:text-4xl">
              দক্ষ হাতের ছোট <Turn>বিশ্ববিদ্যালয়</Turn>।
            </h1>
            {children}
            <div data-reveal data-in className="pointer-events-auto relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/media/academy/courses" className={primaryBtn}>
                <Ticket className="size-4" aria-hidden />
                ভর্তি হোন
              </Link>
              <Link href="/media/academy/academies" className={secondaryBtn}>
                <Landmark className="size-4" aria-hidden />
                একাডেমি দেখুন
              </Link>
            </div>
            <ul data-reveal data-in className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {facts.map((f, i) => (
                <li key={i} className="hud text-(--c-faint)">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="marquee border-t border-(--c-line)">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 || undefined} className="marquee-track items-center">
            {tiles.map((t) => (
              <li key={t.id} className="hud flex items-center px-6 py-3 whitespace-nowrap text-(--c-muted)">
                <span aria-hidden className="mr-6 text-(--c-accent-ink)">
                  ▪
                </span>
                {t.name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
