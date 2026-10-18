import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Access, Pipeline } from "@/data/catalog";
import type { Scenario, Source } from "@/data/products";
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

/* ── Status: running, access ──────────────────────────────────────────── */

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

type Readout = { statement: string; detail: string };

/**
 * How each side of the problem/fix pair reads: its field, its accent, and
 * where on the way from start to due the trouble is seen (`mark`, in %).
 */
const SIDES = {
  problem: {
    label: "The problem",
    field: "bg-text-primary",
    icon: "hourglass_bottom",
    badge: "bg-national-crimson text-white",
    dot: "bg-national-crimson",
    fill: "bg-white/40",
    statement: "text-white",
    pace: "late",
    mark: 90,
  },
  fix: {
    label: "How it solves it",
    field: "bg-cobalt",
    icon: "notifications_active",
    badge: "bg-signal-orange text-black",
    dot: "bg-signal-orange",
    fill: "bg-signal-orange",
    statement: "text-signal-orange",
    pace: "early",
    mark: 26,
  },
} as const;

/**
 * The batch's way from start to due, and the moment the trouble is seen.
 * Late: time runs almost out before the red marker appears. Early: the
 * gold marker appears a quarter of the way in with a ping (the alert), and
 * the rest of the track lights up as the time left to act.
 */
function SeenBar({ side }: { side: keyof typeof SIDES }) {
  const s = SIDES[side];
  return (
    <div aria-hidden className="ps-cycle relative mt-auto h-1.5 rounded-full bg-white/15" style={{ "--mark": `${s.mark}%` } as CSSProperties}>
      {s.pace === "early" ? <span className="ps-window absolute inset-y-0 right-0 left-(--mark) origin-left rounded-r-full bg-white/45" /> : null}
      <span className={cn("absolute inset-y-0 left-0 w-(--mark) origin-left rounded-full", s.fill, `ps-fill-${s.pace}`)} />
      <span className="absolute top-1/2 left-(--mark) size-4 -translate-1/2">
        {s.pace === "early" ? <span className={cn("ps-ping absolute inset-0 rounded-full", s.dot)} /> : null}
        <span className={cn("absolute inset-0 rounded-full ring-4 ring-black/40", s.dot, `ps-mark-${s.pace}`)} />
      </span>
    </div>
  );
}

function ReadoutPanel({ side, readout }: { side: keyof typeof SIDES; readout: Readout }) {
  const s = SIDES[side];
  return (
    <article className={cn("story-reveal flex flex-col gap-5 rounded-3xl p-7 ring-1 ring-white/12 sm:p-8", s.field)}>
      <header className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", s.badge)}>
          <Icon name={s.icon} filled className="text-xl" />
        </span>
        <h3 className="font-grotesk text-base font-bold text-white">{s.label}</h3>
      </header>
      <p className={cn("font-grotesk text-xl leading-snug font-bold text-balance sm:text-2xl", s.statement)}>{readout.statement}</p>
      <p className="pb-3 font-sans text-base leading-relaxed text-white/80">{readout.detail}</p>
      <SeenBar side={side} />
    </article>
  );
}

/**
 * The core problem and its fix as two readout panels, ink and cobalt,
 * joined by a node that a gold pulse crosses from one to the other. Each
 * panel ends on the batch's way from start to due, marking when the
 * trouble is seen: near the end without the product, early with it and
 * time left to act. Everything moves only when motion is welcome (`ps-*`
 * in globals.css); otherwise the bars rest at their marks.
 */
export function ProblemSolve({ problem, solve }: { problem: Readout; solve: Readout }) {
  return (
    <div className="grid max-w-5xl lg:grid-cols-[1fr_3.5rem_1fr]">
      <ReadoutPanel side="problem" readout={problem} />
      <div aria-hidden className="relative flex h-14 items-center justify-center lg:h-auto">
        <span className="absolute inset-y-0 left-1/2 w-px bg-white/20 lg:inset-x-0 lg:inset-y-auto lg:top-1/2 lg:left-0 lg:h-px lg:w-auto" />
        <span className="ps-travel absolute top-1/2 left-0 hidden size-1.5 -translate-y-1/2 rounded-full bg-signal-orange lg:block" />
        <span className="relative flex size-10 items-center justify-center rounded-full bg-black ring-1 ring-signal-orange">
          <Icon name="bolt" filled className="text-lg text-signal-orange" />
        </span>
      </div>
      <ReadoutPanel side="fix" readout={solve} />
    </div>
  );
}

/* ── Figures and scenarios ─────────────────────────────────────────────── */

const FIGURE_FIELDS = ["bg-cobalt", "bg-bdnavy-900", "bg-text-primary"];
/** Sourced figures skip cobalt, where the blue source link would be hard to read. */
const SOURCED_FIELDS = ["bg-bdnavy-900", "bg-text-primary"];

/** Big figures on cobalt, navy and ink tiles; each links to its source when it has one. */
export function FigureTiles({ items }: { items: { value: string; label: string; source?: Source }[] }) {
  const fields = items.some((d) => d.source) ? SOURCED_FIELDS : FIGURE_FIELDS;
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", items.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {items.map((d, i) => (
        <li key={d.label} className={cn("story-reveal flex flex-col gap-2 rounded-3xl p-6 ring-1 ring-white/12", fields[i % fields.length])}>
          <span className="font-grotesk text-4xl font-bold tracking-tight text-signal-orange tabular-nums">{d.value}</span>
          <span className="font-sans text-sm leading-relaxed text-white/80">{d.label}</span>
          {d.source ? <SourceLink source={d.source} className="mt-auto pt-3 text-sm" /> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Real situations, a photo each: what happens today, and what happens with
 * the product. The icons match the problem and fix panels above.
 */
export function ScenarioGrid({ product, items }: { product: string; items: Scenario[] }) {
  return (
    <ul className="grid gap-6 lg:grid-cols-2">
      {items.map((s) => (
        <li key={s.title} className="story-reveal flex flex-col overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12">
          <div className="relative aspect-video">
            <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4 p-7 sm:p-8">
            <h3 className="font-grotesk text-xl font-bold text-signal-orange">{s.title}</h3>
            <p className="flex gap-3 font-sans text-base leading-relaxed text-white/80">
              <Icon name="hourglass_bottom" filled className="mt-0.5 shrink-0 text-xl text-national-crimson" />
              <span>
                <strong className="font-semibold text-white">Today. </strong>
                {s.without}
              </span>
            </p>
            <p className="flex gap-3 font-sans text-base leading-relaxed text-white/80">
              <Icon name="notifications_active" filled className="mt-0.5 shrink-0 text-xl text-signal-orange" />
              <span>
                <strong className="font-semibold text-white">With {product}. </strong>
                {s.withProduct}
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
