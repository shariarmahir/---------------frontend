"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { num } from "@/lib/hq/rules";
import { duration } from "@/lib/hq/format";
import type { Person } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { useNow } from "./provider";

/**
 * Kandari HQ's parts, in the landing page's dress (CLAUDE.md §4, memory
 * "Cards flat, three colours"): a pitch-black ground; fields only navy
 * #0B1849, ink #032017 or cobalt #035397, each with a faint white ring;
 * gold #E4B027 for titles, buttons and highlights; red #DA291C only for
 * urgency. No gradients, glows, uppercase or eyebrows; no text under 12px.
 * Every page under /hq builds from these so the control room reads as one.
 */

export type Field = "navy" | "ink" | "cobalt";
export const FIELD: Record<Field, string> = { navy: "bg-bdnavy-900", ink: "bg-text-primary", cobalt: "bg-cobalt" };

/* ───────────── buttons ───────────── */

const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const B = cn("inline-flex items-center justify-center gap-2 rounded-xl font-grotesk font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black", LIFT);
const MD = "min-h-11 px-5 text-sm";
const SM = "min-h-9 px-3.5 text-xs";

/** HQ buttons: gold primary; gold outline on a navy fill; quiet navy; red only for urgent or destructive. Use `hb.x` (44px) or `hb.xSm` (36px, inside dense panels). */
export const hb = {
  gold: cn(B, MD, "bg-signal-orange text-text-primary focus-visible:ring-signal-orange"),
  goldSm: cn(B, SM, "bg-signal-orange text-text-primary focus-visible:ring-signal-orange"),
  outline: cn(B, MD, "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange hover:text-text-primary focus-visible:ring-signal-orange"),
  outlineSm: cn(B, SM, "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange hover:text-text-primary focus-visible:ring-signal-orange"),
  quiet: cn(B, MD, "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14 hover:text-signal-orange focus-visible:ring-signal-orange"),
  quietSm: cn(B, SM, "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14 hover:text-signal-orange focus-visible:ring-signal-orange"),
  danger: cn(B, MD, "bg-national-crimson text-white focus-visible:ring-national-crimson"),
  dangerSm: cn(B, SM, "bg-national-crimson text-white focus-visible:ring-national-crimson"),
  /** A round icon button (44px); give it an aria-label. */
  icon: cn(B, "size-11 shrink-0 bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14 hover:text-signal-orange focus-visible:ring-signal-orange"),
  iconSm: cn(B, "size-9 shrink-0 rounded-lg bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14 hover:text-signal-orange focus-visible:ring-signal-orange"),
};

/* ───────────── page and panels ───────────── */

export function PageHead({ title, lead, actions, className }: { title: ReactNode; lead?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8", className)}>
      <div className="min-w-0">
        <h1 className="font-grotesk text-[1.75rem] leading-tight font-bold tracking-tight text-signal-orange sm:text-3xl lg:text-4xl">{title}</h1>
        {lead ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** A dashboard panel: a navy, ink or cobalt field, gold title with its icon, an action on the right. */
export function Panel({
  title,
  icon: Icon,
  sub,
  field = "navy",
  action,
  href,
  children,
  className,
  bodyClassName,
  id,
}: {
  title: ReactNode;
  icon?: LucideIcon;
  sub?: ReactNode;
  field?: Field;
  action?: ReactNode;
  /** Makes the title a link to the full page. */
  href?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  const heading = (
    <span className="flex min-w-0 items-center gap-2.5">
      {Icon ? <Icon aria-hidden className="size-5 shrink-0 text-signal-orange" /> : null}
      <span className="truncate font-grotesk text-base font-bold text-signal-orange">{title}</span>
    </span>
  );
  return (
    <section id={id} className={cn("hq-rise flex min-w-0 flex-col rounded-2xl text-white ring-1 ring-white/12", FIELD[field], className)}>
      <header className="flex min-h-14 items-center gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          {href ? (
            <Link href={href} className="rounded-md hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <h2>{heading}</h2>
            </Link>
          ) : (
            <h2>{heading}</h2>
          )}
          {sub ? <p className="mt-0.5 truncate text-xs text-white/60">{sub}</p> : null}
        </div>
        {action}
      </header>
      <div className={cn("min-h-0 flex-1 px-5 pb-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** One headline figure. `delta` > 0 shows gold up, < 0 red down (only when down is bad: pass `goodDown` for costs). */
export function Stat({
  label,
  value,
  sub,
  delta,
  goodDown,
  icon: Icon,
  field = "navy",
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  delta?: number;
  goodDown?: boolean;
  icon?: LucideIcon;
  field?: Field;
  href?: string;
  className?: string;
}) {
  const up = delta !== undefined && delta > 0;
  const bad = delta !== undefined && delta !== 0 && (goodDown ? up : !up);
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/75">{label}</span>
        {Icon ? (
          <span className="grid size-9 place-items-center rounded-xl bg-white/8 ring-1 ring-white/12">
            <Icon aria-hidden className="size-4.5 text-signal-orange" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-grotesk text-3xl leading-none font-bold tracking-tight text-white tabular-nums">{value}</div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60">
        {delta !== undefined ? (
          <span className={cn("font-bold", bad ? "text-crimson-bright" : "text-signal-orange")}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(Math.round(delta * 10) / 10)}%
          </span>
        ) : null}
        {sub}
      </div>
    </>
  );
  const cls = cn("hq-rise block rounded-2xl p-5 text-white ring-1 ring-white/12", FIELD[field], href && "transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0", className);
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* ───────────── small pieces ───────────── */

export type Tone = "gold" | "navy" | "cobalt" | "ink" | "red" | "muted" | "white";
const TONE: Record<Tone, string> = {
  gold: "bg-signal-orange text-text-primary",
  navy: "bg-bdnavy-900 text-bdnavy-300 ring-1 ring-bdnavy-400/40",
  cobalt: "bg-cobalt text-white",
  ink: "bg-text-primary text-white ring-1 ring-white/15",
  red: "bg-national-crimson text-white",
  muted: "bg-white/8 text-white/75 ring-1 ring-white/12",
  white: "bg-white text-text-primary",
};

export function Pill({ tone = "muted", icon: Icon, children, className }: { tone?: Tone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-6 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", TONE[tone], className)}>
      {Icon ? <Icon aria-hidden className="size-3.5" /> : null}
      {children}
    </span>
  );
}

const AV = { xs: "size-6 text-xs", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-24 text-3xl" } as const;
const AV_PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 } as const;

/** A member's picture, or their initial on navy. `online` adds the presence dot (checked in today). */
export function Avatar({ person, size = "md", online, className }: { person?: Pick<Person, "name" | "photo"> | null; size?: keyof typeof AV; online?: boolean; className?: string }) {
  const initial = (person?.name || "?").trim().charAt(0).toUpperCase();
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full bg-bdnavy-700 font-grotesk font-bold text-signal-orange ring-1 ring-white/20", AV[size], className)}>
      {person?.photo ? (
        <Image src={person.photo} alt="" width={AV_PX[size]} height={AV_PX[size]} unoptimized={person.photo.startsWith("data:")} className="size-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
      {online !== undefined ? (
        <span aria-hidden className={cn("absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-black", online ? "bg-signal-orange" : "bg-white/30")} />
      ) : null}
    </span>
  );
}

/** Overlapping avatars with a "+N". */
export function AvatarStack({ people, max = 4, size = "sm" }: { people: Pick<Person, "id" | "name" | "photo">[]; max?: number; size?: "xs" | "sm" | "md" }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <Avatar key={p.id} person={p} size={size} className="ring-2 ring-black" />
      ))}
      {people.length > max ? <span className={cn("grid place-items-center rounded-full bg-white/10 font-bold text-white ring-2 ring-black", AV[size])}>+{people.length - max}</span> : null}
    </span>
  );
}

export function Empty({ icon: Icon, title, children, action, className }: { icon?: LucideIcon; title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-10 text-center ring-1 ring-white/10 ring-inset", className)}>
      {Icon ? <Icon aria-hidden className="size-8 text-signal-orange" /> : null}
      <p className="font-grotesk text-base font-bold text-white">{title}</p>
      {children ? <p className="max-w-md text-sm leading-relaxed text-white/65">{children}</p> : null}
      {action}
    </div>
  );
}

export function Progress({ value, tone = "gold", label, className }: { value: number; tone?: "gold" | "navy" | "red"; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-label={label} className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none", tone === "gold" ? "bg-signal-orange" : tone === "red" ? "bg-national-crimson" : "bg-bdnavy-300")} style={{ width: `${v}%` }} />
    </div>
  );
}

/** A live countdown to `to`; red once overdue. */
export function Countdown({ to, className, suffix = "left" }: { to: string; className?: string; suffix?: string }) {
  const now = useNow(1000);
  const left = Date.parse(to) - now;
  const over = left < 0;
  return (
    <span className={cn("font-mono text-xs font-semibold tabular-nums", over ? "text-crimson-bright" : left < 6 * 3600_000 ? "text-signal-orange" : "text-white/75", className)}>
      {over ? `${duration(-left)} late` : `${duration(left)} ${suffix}`}
    </span>
  );
}

/** Segmented choice (tabs that filter in place). */
export function Seg<T extends string>({ value, options, onChange, label, className }: { value: T; options: { value: T; label: ReactNode; count?: number }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white/6 p-1 ring-1 ring-white/12 [scrollbar-width:none]", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
            value === o.value ? "bg-signal-orange text-text-primary" : "text-white/75 hover:bg-white/8 hover:text-white",
          )}
        >
          {o.label}
          {o.count !== undefined ? <span className={cn("rounded-full px-1.5 tabular-nums", value === o.value ? "bg-text-primary/15" : "bg-white/10")}>{num(o.count)}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* ───────────── forms ───────────── */

export const inputCls =
  "min-h-11 w-full rounded-xl bg-black px-3.5 text-sm text-white ring-1 ring-white/15 placeholder:text-white/40 transition-shadow focus:ring-2 focus:ring-signal-orange focus:outline-none disabled:opacity-60";
export const textareaCls = cn(inputCls, "min-h-24 py-3 leading-relaxed");
export const selectCls = cn(inputCls, "pr-2 [color-scheme:dark]");

export function FormField({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string | null; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-white/85">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-crimson-bright">{error}</span> : hint ? <span className="text-xs text-white/55">{hint}</span> : null}
    </label>
  );
}

/* ───────────── charts (recharts) ───────────── */

/** Series colours that hold on navy and black: gold first, then the navy tints, cobalt light, and a soft white. Red only for losses. */
export const CHART = {
  gold: "#e4b027",
  blue: "#8fa1e3",
  blue2: "#6379d1",
  cobalt: "#4f9ee3",
  white: "rgba(255,255,255,0.75)",
  red: "#ff6a5c",
  grid: "rgba(255,255,255,0.08)",
  axis: "rgba(255,255,255,0.55)",
  series: ["#e4b027", "#8fa1e3", "#4f9ee3", "#6379d1", "rgba(255,255,255,0.75)"],
};

export const axisProps = { stroke: CHART.axis, tick: { fill: CHART.axis, fontSize: 12 }, tickLine: false, axisLine: false } as const;

/** A recharts tooltip in the HQ dress: `<Tooltip content={<ChartTip format={taka} />} />`. */
export function ChartTip({
  active,
  payload,
  label,
  format = (v: number) => num(v),
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: ReactNode;
  format?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-black px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/20">
      {label !== undefined ? <p className="mb-1 font-bold text-signal-orange">{label}</p> : null}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70">{p.name}</span>
          <span className="ml-auto font-bold tabular-nums">{format(Number(p.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}

/** "View all →"-style link for panel headers. */
export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
      {children}
    </Link>
  );
}
