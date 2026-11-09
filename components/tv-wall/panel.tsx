import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type Field = "navy" | "ink" | "cobalt";
const FIELD: Record<Field, string> = { navy: "bg-bdnavy-900", ink: "bg-text-primary", cobalt: "bg-cobalt" };

/**
 * A dashboard panel: a navy, ink or cobalt field with a faint ring, a gold
 * title with its icon and an English line, and an optional action on the
 * right. Panels power on one after another (`delay`), like monitors.
 */
export function Panel({
  title,
  sub,
  icon,
  field = "navy",
  action,
  alert,
  delay = 0,
  className,
  bodyClassName,
  children,
  footer,
}: {
  title: string;
  sub?: string;
  icon: string;
  field?: Field;
  action?: ReactNode;
  alert?: boolean;
  delay?: number;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const id = `p-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      style={{ "--d": `${delay}ms` } as CSSProperties}
      className={cn("monitor-on flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl text-white ring-1 ring-white/12", FIELD[field], className)}
    >
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        {alert !== undefined && <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", alert ? "tally-blink bg-national-crimson" : "bg-white/25")} />}
        <Icon name={icon} className="text-xl! text-signal-orange" />
        <div className="min-w-0 flex-1">
          <h2 id={id} className="truncate font-grotesk text-base leading-tight font-bold text-signal-orange">
            {title}
          </h2>
          {sub && <p className="truncate font-sans text-xs text-white/65">{sub}</p>}
        </div>
        {action}
      </header>
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-white/10 px-5 py-2.5 font-sans text-xs leading-relaxed text-white/60">{footer}</footer>}
    </section>
  );
}

/** A small text link in a panel header, to the page that shows the panel in full. */
export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-lg px-2.5 py-1.5 font-sans text-xs font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}

/** One headline figure for the overview strip. */
export function Stat({
  label,
  value,
  sub,
  icon,
  field = "navy",
  href,
  alert,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  field?: Field;
  href?: string;
  alert?: boolean;
  delay?: number;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2">
        <Icon name={icon} className="text-lg! text-signal-orange" />
        <p className="truncate font-sans text-xs font-semibold text-white/75">{label}</p>
        {alert && <span aria-hidden className="tally-blink ml-auto size-2 rounded-full bg-national-crimson" />}
      </div>
      <p className="mt-2 font-grotesk text-3xl leading-none font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-1.5 truncate font-sans text-xs text-white/60">{sub}</p>}
    </>
  );
  const cls = cn(
    "monitor-on block min-w-0 rounded-2xl px-4 py-3.5 ring-1 ring-white/12",
    FIELD[field],
    href && "transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgb(0_0_0/0.9)] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
  );
  const style = { "--d": `${delay}ms` } as CSSProperties;
  return href ? (
    <Link href={href} className={cls} style={style}>
      {body}
    </Link>
  ) : (
    <div className={cls} style={style}>
      {body}
    </div>
  );
}

/** An empty or unavailable panel body: says what is missing and why, never fills in. */
export function Empty({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <Icon name={icon} className="text-3xl! text-white/40" />
      <p className="font-sans text-sm font-semibold text-white">{title}</p>
      <p className="max-w-[40ch] font-sans text-xs leading-relaxed text-white/60">{body}</p>
    </div>
  );
}
