"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { DivisionId } from "@/data/bangladesh-map";
import { DIVISIONS } from "@/data/tv-wall/sources";
import { ago } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { DISTRICT_NAME, fmt } from "./labels";
import { ShareMenu } from "./share-menu";
import type { WallStatus } from "./use-wall";
import { WINDOWS, useWallData, type WallState } from "./wall-context";

interface NavItem {
  href: string;
  label: string;
  sub: string;
  icon: string;
  badge?: (w: WallState) => string | null;
  alert?: (w: WallState) => boolean;
}

export const NAV: NavItem[] = [
  { href: "/tv-wall", label: "Overview", sub: "The whole country at a glance", icon: "dashboard" },
  {
    href: "/tv-wall/map",
    label: "Crime map",
    sub: "Red zones on the map of Bangladesh",
    icon: "map",
    badge: (w) => String(w.readings.filter((r) => r.level === 3).length),
    alert: (w) => w.pings.length > 0,
  },
  { href: "/tv-wall/crime", label: "Crime & corruption", sub: "Every report, newest first", icon: "gavel", badge: (w) => fmt(w.harm.length) },
  { href: "/tv-wall/live", label: "Live TV", sub: "Bangladeshi news channels on air", icon: "live_tv", badge: (w) => String(w.data.channels.filter((c) => c.videoId).length) },
  { href: "/tv-wall/analysis", label: "Analysis", sub: "Risk, chance and who answers", icon: "query_stats" },
  { href: "/tv-wall/gains", label: "Achievements", sub: "Achievements and development", icon: "emoji_events", badge: (w) => fmt(w.gains.length) },
  { href: "/tv-wall/economy", label: "Economy", sub: "Taka, trade and markets", icon: "currency_exchange", badge: (w) => fmt(w.economy.length) },
  {
    href: "/tv-wall/environment",
    label: "Environment",
    sub: "Accidents, weather, air and earthquakes",
    icon: "flood",
    badge: (w) => fmt(w.losses.length),
    alert: (w) => (w.data.cities ?? []).some((c) => (c.aqi ?? 0) > 150 || c.maxToday >= 36 || c.rainToday >= 50),
  },
  { href: "/tv-wall/open", label: "Sources & sharing", sub: "Where the data comes from; embed and stream", icon: "hub" },
];

const dhakaTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const dhakaDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "long", day: "numeric", month: "long" });

const STATUS: Record<WallStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "tally-blink bg-signal-orange" },
  refreshing: { label: "Updating", dot: "bg-signal-orange" },
  offline: { label: "Offline", dot: "bg-white/40" },
  stale: { label: "Stale", dot: "bg-white/40" },
};

/**
 * The TV wall as a dashboard: a sidebar of segments (one page each), a
 * control bar shared by every page (live state, Dhaka clock, window,
 * division, alerts, sharing, TV mode) and the page itself.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const w = useWallData();
  const pathname = usePathname();
  const current = NAV.find((n) => n.href === pathname) ?? NAV[0];
  const feedsUp = w.data.feeds.filter((f) => f.ok).length;

  return (
    <div className="mx-auto flex w-full max-w-[120rem] gap-5 px-gutter-x pt-5 pb-10 lg:px-6">
      {/* Sidebar (lg and up) */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-[calc(var(--spacing-header-lg)+1.25rem)] flex flex-col gap-4">
          <div className="rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12">
            <p className="font-grotesk text-lg leading-tight font-bold text-signal-orange">National TV Wall</p>
            <p className="mt-0.5 font-sans text-xs text-white/65">Bangladesh, live · free for everyone</p>
          </div>
          <nav aria-label="TV wall sections" className="rounded-2xl bg-bdnavy-900 p-2 ring-1 ring-white/12">
            <ul className="flex flex-col gap-0.5">
              {NAV.map((n) => {
                const active = n === current;
                const badge = n.badge?.(w);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 font-sans text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                        active ? "bg-signal-orange text-text-primary" : "text-white/85 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      <Icon name={n.icon} className={cn("text-xl!", active ? "text-text-primary" : "text-signal-orange")} />
                      <span className="min-w-0 flex-1 truncate">{n.label}</span>
                      {n.alert?.(w) && <span aria-label="alert" className={cn("size-2 rounded-full", active ? "bg-text-primary" : "tally-blink bg-national-crimson")} />}
                      {badge && (
                        <span className={cn("rounded-md px-1.5 py-0.5 font-sans text-xs tabular-nums", active ? "bg-text-primary/15" : "bg-black/35 text-white/80")}>{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link href="/tv-wall/tv" className={cn(btn.gold, "w-full")}>
            <Icon name="connected_tv" className="text-xl!" />
            TV mode
          </Link>
          <div className="rounded-2xl bg-text-primary p-4 font-sans text-xs leading-relaxed text-white/70 ring-1 ring-white/12">
            <p className="flex items-center gap-2 font-semibold text-white">
              <span aria-hidden className={cn("size-2 rounded-full", feedsUp ? "bg-signal-orange" : "bg-national-crimson")} />
              {feedsUp} of {w.data.feeds.length} collectors answering
            </p>
            <p className="mt-1" suppressHydrationWarning>
              {w.data.newsAt ? `Latest news ${ago(w.data.newsAt, w.now)}.` : "No news collected yet."} Built from published headlines, not police records.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <ControlBar current={current} />
        {/* Sections as a scrolling row below lg */}
        <nav aria-label="TV wall sections" className="no-scrollbar -mx-gutter-x overflow-x-auto px-gutter-x lg:hidden">
          <ul className="flex w-max gap-1.5">
            {NAV.map((n) => {
              const active = n === current;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-2 rounded-xl px-3 font-sans text-sm font-semibold whitespace-nowrap ring-1 transition-colors",
                      active ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-bdnavy-900 text-white/85 ring-white/12",
                    )}
                  >
                    <Icon name={n.icon} className="text-lg!" />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main id="wall-main" className="min-w-0">{children}</main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-national-crimson/60 !bg-bdnavy-900 !font-sans !text-white",
            description: "!text-white/85",
            actionButton: "!bg-signal-orange !font-semibold !text-text-primary",
            success: "[&_[data-icon]]:!text-signal-orange",
            error: "[&_[data-icon]]:!text-national-crimson",
          },
        }}
      />
    </div>
  );
}

/** The bar over every page: the page's name, live state, Dhaka clock and the shared filters. */
function ControlBar({ current }: { current: NavItem }) {
  const w = useWallData();
  const s = STATUS[w.status];
  const secs = w.clock ? Math.max(0, Math.ceil((w.nextAt - w.clock) / 1000)) : null;
  const scope = w.district ? DISTRICT_NAME.get(w.district) : w.division ? `${DIVISIONS.find((d) => d.id === w.division)?.en} division` : "All Bangladesh";

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-grotesk text-2xl leading-tight font-bold text-signal-orange sm:text-3xl">
          {current.label}
          <span role="status" className="inline-flex items-center gap-2 rounded-md bg-white/8 px-2.5 py-1 font-sans text-sm font-bold text-white ring-1 ring-white/20">
            <span aria-hidden className={cn("size-2 rounded-full", s.dot)} />
            {s.label}
          </span>
        </h1>
        <p className="mt-1 font-sans text-sm text-white/70">
          {current.sub} · <span className="font-semibold text-white/85">{scope}</span>
          {w.district && (
            <button type="button" onClick={() => w.setDistrict(null)} className="ml-2 inline-flex items-center gap-0.5 font-semibold text-signal-orange hover:underline">
              <Icon name="close" className="text-sm!" /> clear district
            </button>
          )}
        </p>
      </div>

      <div className="flex items-baseline gap-2.5" aria-label="Dhaka time">
        <span className="font-mono text-2xl font-semibold text-white tabular-nums" suppressHydrationWarning>
          {w.clock ? dhakaTime.format(w.clock) : "--:--:--"}
        </span>
        <span className="font-sans text-sm text-white/65" suppressHydrationWarning>
          {w.clock ? dhakaDate.format(w.clock) : ""} · Dhaka
        </span>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 xl:ml-auto xl:w-auto xl:justify-end">
        <div role="radiogroup" aria-label="Time window" className="flex rounded-lg bg-white/8 p-1 ring-1 ring-white/10">
          {WINDOWS.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={w.hours === h}
              onClick={() => w.setHours(h)}
              className={cn(
                "min-h-8 rounded-md px-3 font-sans text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                w.hours === h ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white",
              )}
            >
              {h} h
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="wall-division">Division</label>
        <select
          id="wall-division"
          value={w.division ?? ""}
          onChange={(e) => w.setDivision((e.target.value || null) as DivisionId | null)}
          className="min-h-10 rounded-lg bg-white/8 px-3 font-sans text-sm font-semibold text-white ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
        >
          <option value="">All Bangladesh</option>
          {DIVISIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.en} division
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={w.refresh}
          disabled={w.status === "refreshing"}
          title="Refresh now"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white/8 px-3 font-sans text-sm text-white/85 ring-1 ring-white/10 transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:opacity-60"
        >
          <Icon name="refresh" className={cn("text-lg!", w.status === "refreshing" && "motion-safe:animate-spin")} />
          <span className="tabular-nums" suppressHydrationWarning>
            {w.status === "offline" ? "Retry" : secs != null ? `${secs}s` : "Refresh"}
          </span>
        </button>
        <button
          type="button"
          onClick={w.toggleAlerts}
          aria-pressed={w.alertsOn}
          title={w.alertsOn ? "Turn off browser alerts" : "Get a browser alert for new violent-crime reports"}
          className={cn(
            "grid size-10 place-items-center rounded-lg ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
            w.alertsOn ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-white/8 text-white ring-white/10 hover:bg-white/15",
          )}
        >
          <Icon name={w.alertsOn ? "notifications_active" : "notifications"} className="text-xl!" />
          <span className="sr-only">Browser alerts</span>
        </button>
        <ShareMenu />
        <Link href="/tv-wall/tv" className={cn(btn.gold, "min-h-10 px-4 py-2 text-sm lg:hidden")}>
          <Icon name="connected_tv" className="text-lg!" />
          TV mode
        </Link>
      </div>
    </div>
  );
}
