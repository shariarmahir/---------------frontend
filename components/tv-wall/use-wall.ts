"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { WallPayload } from "@/lib/tv-wall/server";
import type { WireItem } from "@/lib/tv-wall/core";

export const POLL_MS = 90_000;
const FOLLOW_UP_MS = 15_000;
const incomplete = (w: WallPayload) => w.newsAt === 0 || !w.cities || !w.fx || w.quakes === null;
const HIDDEN_EXTRA_MS = 90_000;
/** After this long without an answer from the news collectors, the wall says its wire is old. */
export const STALE_MS = 6 * 60_000;

export type WallStatus = "live" | "refreshing" | "offline" | "stale";

/**
 * The wall's live state: the server's first payload, then a fresh one every
 * 90 seconds while the tab is visible (and at once when it comes back).
 * Reports that arrive after the first load are marked new; a new red-zone
 * report raises a toast, and a browser notification if the viewer allowed it.
 */
export function useWall(initial: WallPayload) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<WallStatus>("live");
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  // A payload that came back with a source still loading is fetched again soon, not in 90 seconds.
  const [nextAt, setNextAt] = useState(() => initial.generatedAt + (incomplete(initial) ? FOLLOW_UP_MS : POLL_MS));
  const seen = useRef(new Set(initial.items.map((i) => i.id)));
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setStatus("refreshing");
    let wait = POLL_MS;
    try {
      const res = await fetch("/api/tv-wall", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as WallPayload;
      const arrived = next.items.filter((i) => !seen.current.has(i.id));
      arrived.forEach((i) => seen.current.add(i.id));
      setData(next);
      if (incomplete(next)) wait = FOLLOW_UP_MS;
      setFresh(new Set(arrived.map((i) => i.id)));
      setStatus("live");
      announce(arrived);
    } catch {
      setStatus("offline");
    } finally {
      busy.current = false;
      setNextAt(Date.now() + wait);
    }
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const visible = document.visibilityState === "visible";
      // A hidden tab keeps listening only for a viewer who asked for browser alerts, at a slower pace.
      if (visible ? Date.now() >= nextAt : alertsWanted() && Date.now() >= nextAt + HIDDEN_EXTRA_MS) void refresh();
    }, 5_000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() >= nextAt) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [nextAt, refresh]);

  return { data, status, fresh, nextAt, refresh };
}

/** A clock that ticks once a second, for the wall's time and "x minutes ago". Null until mounted. */
export function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

const ALERTS_KEY = "kandari-tv-wall-alerts";

export function alertsWanted(): boolean {
  try {
    return localStorage.getItem(ALERTS_KEY) === "1" && typeof Notification !== "undefined" && Notification.permission === "granted";
  } catch {
    return false;
  }
}

/** Ask for browser notifications; returns whether they are now on. */
export async function enableAlerts(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  const on = permission === "granted";
  try {
    localStorage.setItem(ALERTS_KEY, on ? "1" : "0");
  } catch {
    /* the setting simply won't persist */
  }
  return on;
}

export function disableAlerts() {
  try {
    localStorage.setItem(ALERTS_KEY, "0");
  } catch {
    /* nothing to undo */
  }
}

function announce(arrived: WireItem[]) {
  const urgent = arrived.filter((i) => i.severity === 3 && (i.category === "crime" || i.category === "loss")).slice(0, 3);
  for (const i of urgent) {
    toast(i.category === "crime" ? "New alert: violent crime reported" : "New alert: accident or disaster", {
      description: i.title,
      action: { label: "Read", onClick: () => window.open(i.url, "_blank", "noopener,noreferrer") },
      duration: 9000,
    });
  }
  if (urgent.length && alertsWanted() && document.visibilityState !== "visible") {
    try {
      new Notification("National TV Wall", { body: urgent[0].title, tag: "kandari-tv-wall", icon: "/icon.png" });
    } catch {
      /* some browsers only allow notifications from a service worker */
    }
  }
}
