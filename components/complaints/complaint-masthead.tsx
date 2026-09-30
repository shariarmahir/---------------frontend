"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PixelMark, SignalSeam, btn } from "@/components/ui/section-kit";
import { LIFT, glowStyle } from "@/components/ui/surfaces";
import { COMPLAINT_POLICY, COMPLAINT_POLICY_BN, complaintCategories, complaints, helplines } from "@/data/complaints";
import { cn } from "@/lib/utils";

const TICK_MS = 2600;

/** True when the visitor asked for less motion — the feed then holds still. */
const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeRM(fn: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

/** A number that runs up from zero in well under a second on first paint. */
function CountUp({ to, reduce }: { to: number; reduce: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, reduce]);
  return <>{(reduce ? to : n).toLocaleString("en-US")}</>;
}

/**
 * The প্রতিবাদ hero, in the home hero's frame: the `hero-band` height on
 * ink, the claim left with the gold primary action and the red emergency
 * call, and on the right a live board — the newest complaint slides in at
 * the top every few seconds over broadcast rings in red, gold and green.
 * The ink proof strip with the gold pulse closes the band; its figures run
 * up on load.
 */
export function ComplaintMasthead() {
  const reduce = useReducedMotion();
  const sorted = useMemo(() => [...complaints].sort((a, b) => +new Date(b.at) - +new Date(a.at)), []);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  const live = [0, 1, 2].map((k) => sorted[(tick + k) % sorted.length]);
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const supports = complaints.reduce((s, c) => s + c.supports, 0);

  const stats = [
    { label: "Complaints on record", value: complaints.length },
    { label: "Resolved", value: resolved },
    { label: "Supports", value: supports },
    { label: "Categories", value: complaintCategories.length },
  ];

  return (
    <section aria-labelledby="protibad-title" className="relative w-full">
      <div className="hero-band relative isolate flex w-full items-center overflow-hidden bg-text-primary">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-gutter-x py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:py-10">
          <div className="flex flex-col items-start gap-space-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-national-crimson px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-white uppercase">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              Live · Complaint Centre
            </span>
            <h1 id="protibad-title" className="font-bengali text-4xl leading-[1.12] font-bold text-white sm:text-5xl xl:text-6xl">
              অন্যায়ের বিরুদ্ধে{" "}
              <span className="text-national-crimson [text-shadow:0_0_32px_rgb(218_41_28/0.55)]">প্রতিবাদ</span>
            </h1>
            <p className="max-w-[48ch] font-sans text-body-md leading-relaxed text-white/85 lg:text-body-lg">
              Report extortion, bribery, land grabbing and service denial. Each category names the authority that actually handles it — and
              the complaint stays on public record here.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-space-xs">
              <Link href="#file-complaint" className={btn.gold}>
                <Icon name="edit_document" className="text-[18px]" />
                অভিযোগ দাখিল করুন
              </Link>
              <a
                href="tel:999"
                className={cn(btn.ink, "bg-national-crimson shadow-red-glow hover:bg-national-crimson focus-visible:ring-offset-text-primary")}
              >
                <Icon name="emergency" className="text-[18px]" filled />
                Call 999
              </a>
              <Link href="#community" className={btn.ghost}>
                <Icon name="forum" className="text-[18px] text-bdgreen-500" />
                Community
              </Link>
            </div>
          </div>

          {/* Live board. */}
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
              {[
                { c: "border-national-crimson", d: "0s" },
                { c: "border-signal-orange", d: "-0.85s" },
                { c: "border-bdgreen-500", d: "-1.7s" },
              ].map((r) => (
                <span key={r.d} className={cn("orbit-halo absolute size-72 rounded-full border-2", r.c)} style={{ animationDelay: r.d }} />
              ))}
            </div>

            <div className="relative rounded-3xl bg-black p-4 ring-1 ring-white/15 shadow-[0_30px_60px_-30px_var(--color-national-crimson)] sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-white uppercase">
                  <PixelMark tone="dark" className="py-0" />
                  Latest reports
                </span>
                <span className="font-mono text-[10px] text-white/60 uppercase">Sample data</span>
              </div>
              <ul className="flex flex-col gap-2.5" aria-live="off">
                {live.map((c, k) => {
                  const meta = complaintCategories.find((x) => x.id === c.category) ?? complaintCategories[0];
                  return (
                    <li
                      key={`${c.id}-${tick}-${k}`}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl p-3",
                        k === 0 ? "live-in bg-text-primary ring-1 ring-signal-orange/60" : "bg-text-primary/70",
                        k === 2 && "opacity-60",
                      )}
                    >
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", meta.chip)}>
                        <Icon name={meta.icon} className="text-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-sm font-bold text-white">{c.title}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 font-sans text-[11px] text-white/65">
                          <span className="font-bengali">{meta.labelBn}</span> · {c.district} ·{" "}
                          <span className="inline-flex items-center gap-0.5 text-signal-orange">
                            <Icon name="front_hand" className="text-[12px]" /> {c.supports}
                          </span>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Proof strip — the header's ink strip at full width, gold pulse on its seam. */}
      <div className="relative w-full bg-text-primary">
        <SignalSeam className="top-0" />
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-white/10"
            >
              <dt className="font-mono text-label-xs font-medium tracking-widest text-white/65 uppercase">{s.label}</dt>
              <dd className="font-grotesk text-lg font-bold text-signal-orange tabular-nums sm:text-xl">
                <CountUp to={s.value} reduce={reduce} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Helpline card colours: red for the two emergency lines, then the palette. */
const LINE_SURFACES = [
  { card: "bg-national-crimson text-white", tile: "bg-white text-national-crimson", glow: "var(--color-national-crimson)" },
  { card: "bg-national-crimson text-white", tile: "bg-white text-national-crimson", glow: "var(--color-national-crimson)" },
  { card: "bg-bd-green text-white", tile: "bg-signal-orange text-text-primary", glow: "var(--color-bd-green)" },
  { card: "bg-text-primary text-white", tile: "bg-signal-orange text-text-primary", glow: "var(--color-text-primary)" },
  { card: "bg-bdorange-600 text-text-primary", tile: "bg-text-primary text-signal-orange", glow: "var(--color-bdorange-600)" },
];

/**
 * Emergency first — a gold band. Someone arriving mid-crisis should reach
 * 999 without reading anything; a complaint form is the wrong response to
 * an emergency, so the helplines sit above it.
 */
export function EmergencyBand() {
  return (
    <section aria-labelledby="emergency-title" className="relative bg-signal-orange text-text-primary">
      <div className="mx-auto max-w-7xl px-gutter-x py-10 sm:py-14">
        <div className="story-reveal flex flex-col gap-3">
          <PixelMark tone="light" />
          <h2 id="emergency-title" className="font-grotesk text-2xl font-bold tracking-tight uppercase sm:text-3xl lg:text-4xl">
            In danger? <span className="text-national-crimson">Call first,</span> file later.
          </h2>
          <p className="max-w-2xl font-sans text-base leading-relaxed text-text-primary/85">999 and 109 are free national helplines, open 24 hours.</p>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
          {helplines.map((h, i) => {
            const t = LINE_SURFACES[i % LINE_SURFACES.length];
            return (
              <li key={h.number} className="story-reveal flex max-lg:last:col-span-2">
                <a
                  href={`tel:${h.number}`}
                  style={glowStyle(t.glow)}
                  className={cn("group flex w-full flex-col gap-3 rounded-3xl p-4 shadow-sm focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none sm:p-5", LIFT, t.card)}
                >
                  <span className="flex items-center justify-between">
                    <span className={cn("grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none", t.tile)}>
                      <Icon name={h.icon} className="text-[22px]" filled={h.emergency} />
                    </span>
                    <Icon name="call" className="text-[18px] opacity-80 transition-transform duration-300 group-hover:scale-125 motion-reduce:transition-none" />
                  </span>
                  <span className="font-grotesk text-3xl leading-none font-bold sm:text-4xl">{h.number}</span>
                  <span>
                    <span className="block font-bengali text-sm font-bold">{h.labelBn}</span>
                    <span className="mt-0.5 block font-sans text-xs leading-snug opacity-85">{h.note}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="story-reveal mt-6 flex items-start gap-3 rounded-2xl bg-text-primary p-4 text-white">
          <Icon name="info" className="mt-0.5 shrink-0 text-[18px] text-signal-orange" />
          <div className="flex flex-col gap-1 font-sans text-[0.8125rem] leading-relaxed">
            <p className="text-white/85">{COMPLAINT_POLICY}</p>
            <p className="font-bengali text-white/75">{COMPLAINT_POLICY_BN}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
