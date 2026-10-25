"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { isOpen } from "@/lib/command/selectors";
import { perWorld, resetDemo, setPaused, useCommand, useCommandClock } from "@/lib/command/store";
import type { Dept } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, DEMO_NOTICE, DemoBadge, Skeleton, dhakaTime, focusRing, num } from "./kit";

/**
 * The command dashboard's frame: a sidebar of the workspaces (from lg), a top
 * bar with the live Dhaka clock, the Demo data badge, pause/resume and reset,
 * and the demo notice on every page. Below lg the sidebar becomes a
 * horizontally scrolling tab strip under the top bar. Runs the simulation
 * clock (useCommandClock) once for every page under /protibad/command.
 */

interface NavItem {
  href: string;
  label: ReactNode;
  /** Plain label for aria and the breadcrumb. */
  text: string;
  icon: string;
  /** Open cases shown beside the link. */
  count?: Dept | "all";
  /** Drawn indented under the item above it. */
  sub?: boolean;
}

const BASE = "/protibad/command";

const NAV: NavItem[][] = [
  [{ href: BASE, label: "Overview", text: "Overview", icon: "dashboard", count: "all" }],
  [
    { href: `${BASE}/police`, label: "Police", text: "Police", icon: "local_police", count: "police" },
    { href: `${BASE}/police/stations`, label: "Stations", text: "Stations", icon: "location_city", sub: true },
    { href: `${BASE}/consumer`, label: <Bn>ভোক্তা অধিদপ্তর</Bn>, text: "ভোক্তা অধিদপ্তর", icon: "storefront", count: "consumer" },
    { href: `${BASE}/consumer/businesses`, label: "Businesses", text: "Businesses", icon: "store", sub: true },
  ],
  [{ href: `${BASE}/other`, label: "Other agencies", text: "Other agencies", icon: "forward_to_inbox", count: "other" }],
];
const ALL = NAV.flat();

/** The nav item for this path: the longest href the path equals or sits under. */
function current(path: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const i of ALL) {
    if ((path === i.href || path.startsWith(`${i.href}/`)) && (!best || i.href.length > best.href.length)) best = i;
  }
  return best;
}

const selectOpenCounts = perWorld((w) => {
  const c: Record<Dept | "all", number> = { all: 0, police: 0, consumer: 0, other: 0 };
  for (const x of w.cases) {
    if (!isOpen(x)) continue;
    c.all++;
    c[x.dept]++;
  }
  return c;
});

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href={BASE} className={cn("flex min-w-0 items-center gap-3 rounded-xl py-1 pr-2", focusRing)} aria-label="প্রতিবাদ Command, overview">
      <Image src="/logo/kandari-logo.png" alt="" width={84} height={51} className={cn("logo-on-navy w-auto shrink-0", compact ? "h-8" : "h-9")} priority />
      <span className="flex min-w-0 flex-col leading-none">
        <Bn className="text-base font-bold text-signal-orange">প্রতিবাদ</Bn>
        <span className="mt-1 font-grotesk text-sm font-bold text-white">Command</span>
      </span>
    </Link>
  );
}

function CountBadge({ n, active }: { n: number | undefined; active: boolean }) {
  if (n === undefined) return null;
  return (
    <span aria-hidden="true" className={cn("ml-auto rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", active ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/75")}>
      {n > 999 ? "999+" : num(n)}
    </span>
  );
}

function SideNav() {
  const path = usePathname();
  const here = current(path);
  const counts = useCommand(selectOpenCounts);
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-3">
      {NAV.map((group, gi) => (
        <ul key={gi} className={cn("flex flex-col gap-0.5", gi > 0 && "border-t border-white/10 pt-3")}>
          {group.map((i) => {
            const active = here?.href === i.href;
            const n = i.count && counts ? counts[i.count] : undefined;
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={n !== undefined ? `${i.text}, ${n} open` : undefined}
                  className={cn(
                    "relative flex min-h-10 items-center gap-3 rounded-xl pr-2.5 text-sm font-semibold transition-colors",
                    focusRing,
                    i.sub ? "pl-10 text-[0.8125rem]" : "pl-3",
                    active ? "bg-bdnavy-900 text-signal-orange ring-1 ring-white/12" : "text-white/75 hover:bg-white/6 hover:text-white",
                  )}
                >
                  {active ? <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-signal-orange" /> : null}
                  {i.sub ? <span aria-hidden="true" className="absolute top-0 bottom-1/2 left-5 w-3 rounded-bl-md border-b border-l border-white/15" /> : null}
                  <Icon name={i.icon} className={cn("shrink-0", i.sub ? "text-[18px]" : "text-[20px]")} />
                  <span className="min-w-0 truncate">{i.label}</span>
                  <CountBadge n={n} active={active} />
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );
}

/** Below lg: the same links as a scrolling strip; the current one carries a gold underline. */
function TabStrip() {
  const path = usePathname();
  const here = current(path);
  return (
    <nav aria-label="Dashboard" className="border-b border-white/10 lg:hidden">
      <ul className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
        {ALL.map((i) => {
          const active = here?.href === i.href;
          return (
            <li key={i.href} className="shrink-0">
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold whitespace-nowrap",
                  focusRing,
                  active ? "text-signal-orange" : "text-white/70 hover:text-white",
                )}
              >
                <Icon name={i.icon} className="text-[18px]" />
                {i.label}
                {active ? <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-signal-orange" /> : null}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <Link href="/protibad" className={cn("flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold whitespace-nowrap text-white/70 hover:text-white", focusRing)}>
            <Icon name="arrow_back" className="text-[18px]" />
            Back to <Bn>প্রতিবাদ</Bn>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

const selectNow = (w: { now: number }) => w.now;
const selectPaused = (w: { paused: boolean }) => w.paused;

/** The simulation's clock in Dhaka time; it stops when the demo is paused. */
function LiveClock() {
  const now = useCommand(selectNow);
  const paused = useCommand(selectPaused);
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-2.5 place-items-center" aria-hidden="true">
        {paused === false ? <span className="absolute inset-0 animate-ping rounded-full bg-signal-orange/60 motion-reduce:hidden" /> : null}
        <span className={cn("size-2.5 rounded-full", paused === false ? "bg-signal-orange" : "bg-white/35")} />
      </span>
      <span className="flex flex-col leading-none">
        {now === null ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <time dateTime={new Date(now).toISOString()} className="font-grotesk text-sm font-bold text-white tabular-nums sm:text-base">
            {dhakaTime(now)}
          </time>
        )}
        <span className="mt-1 hidden text-xs text-white/55 sm:block">{paused ? "Paused · Dhaka" : "Live · Dhaka"}</span>
      </span>
      <span className="sr-only">{paused ? "Simulation paused" : "Simulation running"}</span>
    </div>
  );
}

function Controls() {
  const paused = useCommand(selectPaused);
  const ready = paused !== null;
  const reset = () => {
    if (window.confirm("Start a fresh demo? Every sample case, action and note in this browser is replaced.")) resetDemo();
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!ready}
        aria-pressed={paused === true}
        onClick={() => setPaused(!paused)}
        className={cn(
          "inline-flex size-11 items-center justify-center gap-2 rounded-xl font-grotesk text-sm font-bold ring-1 transition-colors disabled:opacity-50 sm:w-auto sm:px-3.5 lg:h-9 lg:min-h-0 lg:text-xs",
          focusRing,
          paused ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-white/8 text-white ring-white/15 hover:bg-white/14",
        )}
      >
        <Icon name={paused ? "play_arrow" : "pause"} className="text-[20px] lg:text-[18px]" />
        <span className="sr-only sm:not-sr-only">{paused ? "Resume" : "Pause"}</span>
      </button>
      <button
        type="button"
        disabled={!ready}
        onClick={reset}
        className={cn(
          "inline-flex size-11 items-center justify-center gap-2 rounded-xl bg-white/8 font-grotesk text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/14 disabled:opacity-50 sm:w-auto sm:px-3.5 lg:h-9 lg:text-xs",
          focusRing,
        )}
      >
        <Icon name="restart_alt" className="text-[20px] lg:text-[18px]" />
        <span className="sr-only sm:not-sr-only">Reset demo</span>
      </button>
    </div>
  );
}

function Breadcrumb() {
  const here = current(usePathname());
  return (
    <p className="hidden min-w-0 items-center gap-2 text-sm text-white/55 lg:flex">
      <span>Command</span>
      <Icon name="chevron_right" className="text-[16px] text-white/35" />
      <span className="truncate font-semibold text-white">{here?.label ?? "Dashboard"}</span>
    </p>
  );
}

export function CommandShell({ children }: { children: ReactNode }) {
  useCommandClock();
  return (
    <div lang="en" className="flex min-h-dvh bg-black text-white [color-scheme:dark]">
      <a href="#command-main" className="sr-only z-[100] rounded-xl bg-signal-orange px-4 py-2 font-bold text-text-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-7 overflow-y-auto border-r border-white/10 bg-black px-3 py-5 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <SideNav />
        <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
          <Link href="/protibad" className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/75 hover:bg-white/6 hover:text-white", focusRing)}>
            <Icon name="arrow_back" className="text-[20px]" />
            <span>
              Back to <Bn>প্রতিবাদ</Bn>
            </span>
          </Link>
          <p className="px-3 text-xs leading-relaxed text-white/50">Every person, business and case here is fictional. Your actions are kept in this browser only.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
          <div className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:px-8">
            <div className="min-w-0 lg:hidden">
              <Brand compact />
            </div>
            <Breadcrumb />
            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              <LiveClock />
              <DemoBadge className="hidden sm:inline-flex" />
              <span aria-hidden="true" className="hidden h-6 w-px bg-white/12 sm:block" />
              <Controls />
            </div>
          </div>
        </header>
        <TabStrip />
        <main id="command-main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col focus:outline-none">
          <p role="note" className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 text-xs leading-snug text-white/65 sm:px-5 lg:px-8">
            <DemoBadge className="sm:hidden" />
            <span aria-hidden="true" className="hidden sm:inline-flex">
              <Icon name="info" className="text-[16px] text-bdnavy-300" />
            </span>
            {DEMO_NOTICE}
          </p>
          <div className="mx-auto w-full max-w-[110rem] min-w-0 flex-1 px-3 py-5 sm:px-5 lg:px-8 lg:py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** A dashboard page: gold title, optional subtitle and actions, then the content. */
export function CommandPage({ title, subtitle, actions, children }: { title: string; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-signal-orange lg:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-white/70">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

