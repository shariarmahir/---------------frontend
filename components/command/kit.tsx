import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META } from "@/lib/command/routing";
import type { Category, DivisionId, Severity, Status, UnitKind } from "@/lib/command/types";
import { cn } from "@/lib/utils";

/**
 * The command dashboard's parts, in the site's dress (CLAUDE.md §4): a
 * pitch-black ground; fields only navy, ink or cobalt with a faint white
 * ring; gold for titles, primary actions and the current state; red only for
 * critical or overdue. No gradients, glass, uppercase or eyebrows; nothing
 * under 12px. Every page under /protibad/command builds from these.
 *
 * Nothing here reads the clock: pass `now` (the world's clock, from the
 * store) to the time helpers so ages tick with the simulation and nothing
 * time-based renders on the server.
 */

/* ───────────── time ───────────── */

const TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const TIME_SHORT = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

/** "14:32:07" in Dhaka time. */
export const dhakaTime = (t: number): string => TIME.format(t);
/** "14:32" in Dhaka time. */
export const dhakaHm = (t: number): string => TIME_SHORT.format(t);
/** "25 Oct, 14:32" in Dhaka time. */
export const dhakaDateTime = (t: number): string => DATE_TIME.format(t);

/** "just now", "40 s ago", "4 min ago", "2 h 5 min ago", "3 d ago" — from the world's clock. */
export function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h} h ${m % 60} min ago` : `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

/** A duration in minutes: "—", "0.8 min", "4.2 min", "38 min", "1 h 12 min". */
export function formatMin(min: number | null | undefined): string {
  if (min === null || min === undefined || !Number.isFinite(min)) return "—";
  if (min < 10) return `${(Math.round(min * 10) / 10).toFixed(1)} min`;
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** A countdown "m:ss" (never negative). */
export function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const num = (n: number): string => n.toLocaleString("en-US");

/* ───────────── labels ───────────── */

export const STATUS_META: Record<Status, { label: string; icon: string }> = {
  new: { label: "New", icon: "fiber_new" },
  alerted: { label: "Alerted", icon: "notifications_active" },
  acknowledged: { label: "Acknowledged", icon: "how_to_reg" },
  "en-route": { label: "En route", icon: "directions_car" },
  "on-scene": { label: "On scene", icon: "location_on" },
  resolved: { label: "Resolved", icon: "check_circle" },
  closed: { label: "Closed", icon: "inventory" },
};

export const SEVERITY_LABEL: Record<Severity, string> = { critical: "Critical", high: "High", normal: "Normal" };

export const DIVISIONS: Record<DivisionId, { label: string; labelBn: string }> = {
  dhaka: { label: "Dhaka", labelBn: "ঢাকা" },
  chattogram: { label: "Chattogram", labelBn: "চট্টগ্রাম" },
  khulna: { label: "Khulna", labelBn: "খুলনা" },
  rajshahi: { label: "Rajshahi", labelBn: "রাজশাহী" },
  sylhet: { label: "Sylhet", labelBn: "সিলেট" },
  barishal: { label: "Barishal", labelBn: "বরিশাল" },
  rangpur: { label: "Rangpur", labelBn: "রংপুর" },
  mymensingh: { label: "Mymensingh", labelBn: "ময়মনসিংহ" },
};

export const UNIT_KIND_LABEL: Record<UnitKind, string> = { station: "Police station", patrol: "Patrol", office: "District office", team: "Inspection team" };

/* ───────────── buttons ───────────── */

const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50";
const B = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl font-grotesk font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  LIFT,
);
const MD = "min-h-11 px-4 text-sm";
/** 36px from lg; 44px below it (touch). */
const SM = "min-h-11 px-3.5 text-sm lg:min-h-9 lg:px-3 lg:text-xs";

/** Dashboard buttons: gold primary; gold outline on navy; quiet; red only for the urgent. `cb.x` is 44px, `cb.xSm` 36px from lg. */
export const cb = {
  gold: cn(B, MD, "bg-signal-orange text-text-primary"),
  goldSm: cn(B, SM, "bg-signal-orange text-text-primary"),
  outline: cn(B, MD, "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange hover:text-text-primary"),
  outlineSm: cn(B, SM, "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange hover:text-text-primary"),
  quiet: cn(B, MD, "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14"),
  quietSm: cn(B, SM, "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14"),
  danger: cn(B, MD, "bg-national-crimson text-white"),
  /** A square icon button, 44px; give it an aria-label. */
  icon: cn(B, "size-11 shrink-0 bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/14"),
};

export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange";

/* ───────────── surfaces ───────────── */

export type Field = "navy" | "ink" | "cobalt";
export const FIELD: Record<Field, string> = { navy: "bg-bdnavy-900", ink: "bg-text-primary", cobalt: "bg-cobalt" };

/** A dashboard panel: one solid field with a hairline ring, a gold title with its icon, an action on the right. */
export function Panel({
  title,
  icon,
  sub,
  action,
  field = "navy",
  children,
  className,
  bodyClassName,
  id,
}: {
  title: ReactNode;
  /** Material Symbols name. */
  icon?: string;
  sub?: ReactNode;
  action?: ReactNode;
  field?: Field;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("flex min-w-0 flex-col rounded-2xl text-white ring-1 ring-white/12", FIELD[field], className)}>
      <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-3.5 pb-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="flex min-w-0 items-center gap-2 font-grotesk text-base font-bold text-signal-orange">
            {icon ? <Icon name={icon} className="text-[20px]" /> : null}
            <span className="truncate">{title}</span>
          </h2>
          {sub ? <p className="mt-0.5 text-xs leading-snug text-white/60">{sub}</p> : null}
        </div>
        {action}
      </header>
      <div className={cn("min-h-0 flex-1 px-4 pb-4 sm:px-5 sm:pb-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** One headline figure in the KPI strip; render it as a child of a `<dl>` (it is a dt/dd group). */
export function Kpi({ label, value, sub, icon, className }: { label: string; value: ReactNode; sub?: ReactNode; icon?: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 px-4 py-4 sm:px-5", className)}>
      <dt className="flex min-h-8 items-start gap-1.5 text-xs leading-4 font-semibold text-white/65">
        {icon ? <Icon name={icon} className="text-[16px] text-bdnavy-300" /> : null}
        <span className="text-pretty">{label}</span>
      </dt>
      <dd className="font-grotesk text-[1.75rem] leading-none font-bold tracking-tight text-white tabular-nums lg:text-3xl">{value}</dd>
      <dd className="min-h-4 truncate text-xs text-white/55 tabular-nums">{sub}</dd>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-white/8 motion-reduce:animate-none", className)} />;
}

export function EmptyState({ icon = "inbox", title, children, className }: { icon?: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl px-6 py-10 text-center ring-1 ring-white/10 ring-inset", className)}>
      <Icon name={icon} className="text-3xl text-bdnavy-300" />
      <p className="font-grotesk text-base font-bold text-white">{title}</p>
      {children ? <p className="max-w-sm text-sm leading-relaxed text-white/65">{children}</p> : null}
    </div>
  );
}

/* ───────────── pills ───────────── */

const PILL = "inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

const STATUS_TONE: Record<Status, string> = {
  new: "bg-white text-text-primary",
  alerted: "bg-white/10 text-white ring-1 ring-white/25",
  acknowledged: "bg-bdnavy-700 text-white ring-1 ring-bdnavy-400/50",
  "en-route": "bg-cobalt text-white",
  "on-scene": "bg-signal-orange text-text-primary",
  resolved: "bg-white/6 text-white/75 ring-1 ring-white/12",
  closed: "bg-transparent text-white/55 ring-1 ring-white/12",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span className={cn(PILL, STATUS_TONE[status], className)}>
      <Icon name={m.icon} className="text-[14px]" />
      {m.label}
    </span>
  );
}

export function SeverityPill({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        PILL,
        severity === "critical" ? "bg-national-crimson text-white" : severity === "high" ? "text-white ring-1 ring-white/30" : "text-white/60 ring-1 ring-white/12",
        className,
      )}
    >
      {severity === "critical" ? <Icon name="priority_high" className="text-[14px]" /> : null}
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function OverduePill({ className }: { className?: string }) {
  return (
    <span className={cn(PILL, "bg-national-crimson/20 text-crimson-bright ring-1 ring-national-crimson/70", className)}>
      <Icon name="timer_off" className="text-[14px]" />
      Overdue
    </span>
  );
}

/** The category's icon and its Bangla name (English on hover and for screen readers via `title`). */
export function CategoryChip({ category, english, className }: { category: Category; english?: boolean; className?: string }) {
  const m = CATEGORY_META[category];
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)} title={m.label}>
      <Icon name={m.icon} className="shrink-0 text-[16px] text-bdnavy-300" />
      <span lang="bn" className="truncate font-bengali text-sm font-semibold text-white">
        {m.labelBn}
      </span>
      {english ? <span className="truncate text-xs text-white/55">{m.label}</span> : null}
    </span>
  );
}

/** Always on screen: these are sample cases. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn(PILL, "min-h-7 gap-1.5 bg-white px-2.5 text-text-primary", className)}>
      <Icon name="science" className="text-[15px]" />
      Demo data
    </span>
  );
}

export const DEMO_NOTICE = "Sample cases for demonstration. Real complaints are not shown here.";

/** Bangla text, set in Hind Siliguri with its language tagged. */
export function Bn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span lang="bn" className={cn("font-bengali", className)}>
      {children}
    </span>
  );
}

/* ───────────── form controls ───────────── */

/** Native controls in the dashboard dress: black field, hairline ring, gold focus ring, 44px below lg. */
export const CONTROL =
  "min-h-11 w-full rounded-xl bg-black px-3 text-sm text-white ring-1 ring-white/15 [color-scheme:dark] placeholder:text-white/40 focus:ring-2 focus:ring-signal-orange focus:outline-none lg:min-h-10";

/** A native <select> with a visible label above it. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-white/65">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={CONTROL}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A search box with a visible label above it. */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-white/65">{label}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" className={CONTROL} />
    </label>
  );
}
