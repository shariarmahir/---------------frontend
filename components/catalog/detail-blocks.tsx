import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Access, Pipeline } from "@/data/catalog";
import { completePercent } from "@/data/catalog";
import type { Phase, Stat, Source } from "@/data/products";
import { cn } from "@/lib/utils";
import { SourceLink } from "./source-link";

/** A small gold dot that breathes: something is running. */
export function LiveDot() {
  return (
    <span aria-hidden className="relative flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal-orange opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex size-2.5 rounded-full bg-signal-orange" />
    </span>
  );
}

/* ── Section frame ────────────────────────────────────────────────────── */

/** A detail section: gold title and an optional lead, then its content. */
export function DetailSection({
  id,
  title,
  lead,
  leadLang,
  children,
  className,
}: {
  id: string;
  title: string;
  lead?: string;
  leadLang?: "bn";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("section-band-tinted mx-auto max-w-7xl scroll-mt-header px-gutter-x lg:scroll-mt-header-lg", className)}>
      <div className="story-reveal mb-10 flex max-w-3xl flex-col gap-3">
        <h2 id={`${id}-title`} className="font-grotesk text-3xl font-bold tracking-tight text-signal-orange sm:text-4xl">
          {title}
        </h2>
        {lead ? (
          <p lang={leadLang} className={cn("text-base leading-relaxed text-white/80", leadLang === "bn" ? "font-bengali text-lg" : "font-sans")}>
            {lead}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ── Status: running, complete, access ────────────────────────────────── */

const CARD = "story-reveal flex flex-col gap-4 rounded-3xl p-7 ring-1 ring-white/12";

/** What is running now: the current stage, live. */
export function RunningCard({ title, note, label = "Running now" }: { title: string; note: string; label?: string }) {
  return (
    <div className={cn(CARD, "bg-bdnavy-900 text-white")}>
      <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-white/80">
        <LiveDot /> {label}
      </span>
      <p className="font-grotesk text-3xl font-bold text-signal-orange">{title}</p>
      <p className="font-sans text-base leading-relaxed text-white/80">{note}</p>
    </div>
  );
}

/** How much of the pipeline is finished, as a ring and in words. */
export function CompleteCard({ pipeline }: { pipeline: Pipeline }) {
  const percent = completePercent(pipeline);
  const r = 34;
  const length = 2 * Math.PI * r;
  return (
    <div className={cn(CARD, "bg-text-primary text-white")}>
      <span className="font-sans text-sm font-semibold text-white/80">Complete</span>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90" aria-hidden>
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" className="stroke-white/12" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - percent / 100)}
            className="stroke-signal-orange"
          />
        </svg>
        <p className="font-grotesk text-5xl font-bold text-signal-orange tabular-nums">{percent}%</p>
      </div>
      <p className="font-sans text-base leading-relaxed text-white/80">
        {pipeline.current} of {pipeline.stages.length} stages finished; {pipeline.stages[pipeline.current]} is under way.
      </p>
    </div>
  );
}

/** How to get it today: download, beta, waitlist or partnership. */
export function AccessCard({ access, label = "Download" }: { access: Access; label?: string }) {
  const internal = access.href.startsWith("/") || access.href.startsWith("#");
  return (
    <div className={cn(CARD, "bg-cobalt text-white")}>
      <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-white/80">
        <Icon name={access.icon} className="text-xl text-signal-orange" /> {label}
      </span>
      <p className="font-grotesk text-3xl font-bold text-signal-orange">{access.label}</p>
      <p className="font-sans text-base leading-relaxed text-white/80">{access.note}</p>
      {internal ? (
        <Link href={access.href} className={cn(btn.gold, "mt-auto self-start")}>
          {access.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Where a service's skill already runs: links to those products. */
export function RunsInCard({ proof, products }: { proof: string; products: { name: string; href: string }[] }) {
  return (
    <div className={cn(CARD, "bg-text-primary text-white")}>
      <span className="font-sans text-sm font-semibold text-white/80">Already running in</span>
      <ul className="flex flex-wrap gap-2">
        {products.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 font-grotesk text-base font-bold text-signal-orange ring-1 ring-signal-orange/50 transition-colors duration-200 hover:bg-signal-orange/12 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className="font-sans text-base leading-relaxed text-white/80">{proof}</p>
    </div>
  );
}

/* ── Pipeline ─────────────────────────────────────────────────────────── */

/**
 * The build path as a track of nodes: finished stages filled gold with a
 * tick, the current one ringed and breathing, the rest outlined. A gold
 * rule runs behind the finished part. With `steps`, it is a process
 * rather than a status: every node is a numbered gold ring and nothing
 * is marked finished.
 */
export function PipelineTrack({ pipeline, notes, steps = false }: { pipeline: Pipeline; notes?: string[]; steps?: boolean }) {
  const { stages, current } = pipeline;
  const span = 100 - 100 / stages.length;
  const filled = steps ? 0 : (Math.min(current, stages.length - 1) / (stages.length - 1)) * span;
  return (
    <div className="story-reveal relative rounded-3xl bg-text-primary px-4 py-8 ring-1 ring-white/12 sm:px-8">
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        <span aria-hidden className="absolute top-5 h-0.5 -translate-y-1/2 bg-white/15" style={{ left: `${50 / stages.length}%`, width: `${span}%` }} />
        <span aria-hidden className="absolute top-5 h-0.5 -translate-y-1/2 bg-signal-orange" style={{ left: `${50 / stages.length}%`, width: `${filled}%` }} />
        {stages.map((stage, i) => {
          const done = !steps && i < current;
          const now = !steps && i === current;
          return (
            <li key={stage} aria-current={now ? "step" : undefined} className="relative flex flex-col items-center gap-3 px-1 text-center">
              <span
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-full font-grotesk text-sm font-bold",
                  done && "bg-signal-orange text-text-primary",
                  now && "bg-text-primary text-signal-orange ring-2 ring-signal-orange",
                  steps && "bg-text-primary text-signal-orange ring-2 ring-signal-orange",
                  !steps && !done && !now && "bg-text-primary text-white/65 ring-1 ring-white/25",
                )}
              >
                {now ? <span aria-hidden className="absolute inset-0 animate-ping rounded-full ring-2 ring-signal-orange/60 motion-reduce:hidden" /> : null}
                {done ? <Icon name="check" className="text-xl" /> : i + 1}
              </span>
              <span className={cn("font-grotesk text-xs font-bold sm:text-sm", now ? "text-signal-orange" : done || steps ? "text-white" : "text-white/65")}>
                {stage}
                {steps ? null : <span className="sr-only">{done ? " (finished)" : now ? " (in progress)" : " (to come)"}</span>}
              </span>
              {notes?.[i] ? <span className="hidden font-sans text-xs leading-relaxed text-white/65 md:block">{notes[i]}</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Uses ─────────────────────────────────────────────────────────────── */

/**
 * How an icon moves, read from what it shows: hearts and health beat,
 * signals and alerts pulse, everything else floats. Straight motion only,
 * never a tilt (`use-icon-*` in globals.css).
 */
function iconMotion(icon: string) {
  if (/heart|monitor|favorite|health|medical|stethoscope|spo2|vaccines/.test(icon)) return "use-icon-beat";
  if (/notif|alarm|sensors|wifi|signal|campaign|cell|bolt|battery/.test(icon)) return "use-icon-pulse";
  return "use-icon-float";
}

/**
 * Flat navy tiles: the gold icon and the title on one line, the icon bare
 * and gently moving, then one line of text; an optional tag closes the
 * heading row.
 */
export function UseGrid({ items }: { items: { icon?: string; tag?: string; title: string; body: string }[] }) {
  return (
    // Three to a row when they fill it evenly, otherwise two, so no tile sits alone.
    <ul className={cn("grid gap-4 sm:grid-cols-2", items.length % 3 === 0 && "lg:grid-cols-3")}>
      {items.map((item) => (
        <li key={item.title} className="story-reveal flex flex-col gap-3 rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12">
          <div className="flex items-center gap-3">
            {item.icon ? <Icon name={item.icon} className={cn("shrink-0 text-3xl! text-signal-orange", iconMotion(item.icon))} /> : null}
            <h3 className="min-w-0 flex-1 font-grotesk text-lg leading-snug font-bold text-white">{item.title}</h3>
            {item.tag ? <span className="shrink-0 rounded-full px-3 py-1 font-sans text-xs font-semibold text-white/80 ring-1 ring-white/20">{item.tag}</span> : null}
          </div>
          <p className="font-sans text-sm leading-relaxed text-white/80">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/* ── Problem and fix ──────────────────────────────────────────────────── */

/** The core problem on ink beside the fix on cobalt. */
export function ProblemSolve({ problem, solve }: { problem: { statement: string; detail: string }; solve: { statement: string; detail: string } }) {
  const panel = "story-reveal flex flex-col gap-4 rounded-3xl p-7 ring-1 ring-white/12 sm:p-9";
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={cn(panel, "bg-text-primary")}>
        <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-white/80">
          <Icon name="error" className="text-xl text-national-crimson" /> The problem
        </span>
        <p className="font-grotesk text-2xl leading-snug font-bold text-white">{problem.statement}</p>
        <p className="font-sans text-base leading-relaxed text-white/80">{problem.detail}</p>
      </div>
      <div className={cn(panel, "bg-cobalt")}>
        <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-white/80">
          <Icon name="task_alt" className="text-xl text-signal-orange" /> How it solves it
        </span>
        <p className="font-grotesk text-2xl leading-snug font-bold text-signal-orange">{solve.statement}</p>
        <p className="font-sans text-base leading-relaxed text-white/80">{solve.detail}</p>
      </div>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const STAT_FIELDS = ["bg-cobalt", "bg-bdnavy-900", "bg-text-primary", "bg-bdnavy-900"];

/**
 * The data behind a product: what it reads, the national figures that
 * make the case (each linked to its source), and the research findings.
 */
export function DataBlock({ reads, stats, findings }: { reads: string[]; stats: Stat[]; findings: { text: string; source: Source }[] }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="story-reveal flex flex-col gap-4">
        <h3 className="font-grotesk text-lg font-bold text-white">What it reads</h3>
        <ul className="flex flex-wrap gap-2">
          {reads.map((r) => (
            <li key={r} className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-semibold text-white/80 ring-1 ring-white/20">
              <Icon name="sensors" className="text-lg text-signal-orange" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <li key={stat.label} className={cn("story-reveal flex flex-col justify-between gap-6 rounded-3xl p-6 text-white ring-1 ring-white/12", STAT_FIELDS[i % STAT_FIELDS.length])}>
            <div className="flex flex-col gap-2">
              <span className="font-grotesk text-4xl font-bold tracking-tight text-signal-orange tabular-nums">{stat.value}</span>
              <span className="font-sans text-sm leading-relaxed text-white/80">{stat.label}</span>
            </div>
            <SourceLink source={stat.source} className="text-white/80" />
          </li>
        ))}
      </ul>

      <div className="story-reveal flex flex-col gap-4">
        <h3 className="font-grotesk text-lg font-bold text-white">What the research says</h3>
        <ul className="grid gap-x-10 gap-y-5 border-t border-white/12 pt-6 md:grid-cols-2">
          {findings.map((f) => (
            <li key={f.text} className="flex flex-col gap-2">
              <p className="font-sans text-base leading-relaxed text-white/80">{f.text}</p>
              <SourceLink source={f.source} className="self-start" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Roadmap ──────────────────────────────────────────────────────────── */

/** The growth phases, each with its goal labelled as a target, not a result. */
export function RoadmapGrid({ phases }: { phases: Phase[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {phases.map((p) => (
        <li key={p.phase} className="story-reveal flex flex-col gap-3 rounded-3xl bg-text-primary p-6 ring-1 ring-white/12">
          <span className="font-sans text-sm font-semibold text-white/65">{p.phase}</span>
          <h3 className="font-grotesk text-xl font-bold text-signal-orange">{p.title}</h3>
          <p className="font-sans text-sm leading-relaxed text-white/80">{p.body}</p>
          <p className="mt-auto border-t border-white/12 pt-3 font-sans text-xs font-semibold text-white/65">Target: {p.target}</p>
        </li>
      ))}
    </ol>
  );
}
