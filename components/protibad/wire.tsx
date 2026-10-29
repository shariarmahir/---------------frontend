"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { WireItem } from "@/lib/tv-wall/core";
import type { LiveChannel, WallPayload } from "@/lib/tv-wall/server";

/** How often the page asks for the wire again while it is on screen. */
const POLL_MS = 120_000;
/** A first answer that came back before the news collectors did is asked again this soon. */
const RETRY_MS = 15_000;
const DAY_MS = 86_400_000;

export type WireStatus = "loading" | "live" | "offline";

interface Wire {
  status: WireStatus;
  /** Crime and corruption reports from the last 24 hours, newest first. */
  harm: WireItem[];
  /** Every report in the last 48 hours (the window the wall keeps), for the hourly chart. */
  all: WireItem[];
  channels: LiveChannel[];
  /** The newest answer's time; 0 before the first. */
  at: number;
  /** Ids that arrived after the first load, so the list can mark them new. */
  fresh: Set<string>;
}

const WireContext = createContext<Wire | null>(null);

export const isHarm = (i: WireItem) => i.category === "crime" || i.category === "corruption";

/**
 * The প্রতিবাদ page's live wire: the National TV Wall's own payload
 * (/api/tv-wall, real headlines from Google News and Prothom Alo, sorted
 * into crime, corruption and the rest by lib/tv-wall/core.ts), fetched in
 * the browser so the page itself stays static and paints at once. It polls
 * every two minutes while the tab is visible and says "offline" rather than
 * inventing anything when the sources do not answer.
 */
export function WireProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<WallPayload | null>(null);
  const [status, setStatus] = useState<WireStatus>("loading");
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let timer = 0;
    let stopped = false;
    let seen: Set<string> | null = null;

    const load = async () => {
      window.clearTimeout(timer);
      let wait = POLL_MS;
      try {
        const res = await fetch("/api/tv-wall", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as WallPayload;
        if (stopped) return;
        if (seen) {
          const added = next.items.filter((i) => !seen!.has(i.id)).map((i) => i.id);
          if (added.length) setFresh((old) => new Set([...old, ...added]));
        }
        seen = new Set(next.items.map((i) => i.id));
        setPayload(next);
        setStatus(next.newsAt ? "live" : "loading");
        if (!next.newsAt) wait = RETRY_MS;
      } catch {
        if (!stopped) setStatus("offline");
        wait = RETRY_MS * 2;
      }
      if (!stopped && document.visibilityState === "visible") timer = window.setTimeout(load, wait);
    };
    const onVisible = () => document.visibilityState === "visible" && load();

    load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const value = useMemo<Wire>(() => {
    const at = payload?.generatedAt ?? 0;
    const all = payload ? [...payload.items].sort((a, b) => b.publishedAt - a.publishedAt) : [];
    return {
      status,
      all,
      harm: all.filter((i) => isHarm(i) && at - i.publishedAt <= DAY_MS),
      channels: payload?.channels ?? [],
      at,
      fresh,
    };
  }, [payload, status, fresh]);

  return <WireContext.Provider value={value}>{children}</WireContext.Provider>;
}

export function useWire(): Wire {
  const wire = useContext(WireContext);
  if (!wire) throw new Error("useWire needs a WireProvider");
  return wire;
}
