"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useMediaState } from "@/lib/media/store";

/**
 * Time on the platform today, counted only while the tab is visible. Kept
 * apart from the main store: it ticks often and is nobody else's business.
 * After the viewer's break limit, one gentle nudge a day — the platform is
 * meant to be a bridge to real-world action, not a place to stay.
 */

const KEY = "sm-usage";
const TICK = 15;

type Usage = { date: string; seconds: number; nudged: boolean };

function today() {
  return new Date().toLocaleDateString("en-CA");
}

function read(): Usage {
  try {
    const u = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Usage | null;
    if (u && u.date === today()) return u;
  } catch {
    // Unreadable: start the day fresh.
  }
  return { date: today(), seconds: 0, nudged: false };
}

let cache: Usage | null = null;
const listeners = new Set<() => void>();

function write(u: Usage) {
  cache = u;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(u));
  } catch {
    // Storage blocked: count for this visit only.
  }
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Minutes on the platform today (0 during server render). */
export function useMinutesToday(): number {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor((cache ?? (cache = read())).seconds / 60),
    () => 0,
  );
}

export function UsageTracker() {
  const router = useRouter();
  const breakAfter = useMediaState((s) => s.privacy.breakAfter);

  const tick = useEffectEvent(() => {
    if (document.visibilityState !== "visible") return;
    const u = read();
    const next = { ...u, seconds: u.seconds + TICK };
    if (breakAfter > 0 && !u.nudged && next.seconds >= breakAfter * 60) {
      next.nudged = true;
      toast(`আজ ${breakAfter.toLocaleString("bn-BD")} মিনিট হলো`, {
        description: "যা শিখলেন, বাস্তবে একটু প্রয়োগ করে আসুন — বা এলাকার কোনো উদ্যোগে যোগ দিন।",
        duration: 12000,
        action: { label: "উদ্যোগ দেখুন", onClick: () => router.push("/media/events") },
      });
    }
    write(next);
  });

  useEffect(() => {
    const id = window.setInterval(tick, TICK * 1000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
