"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useHq } from "@/components/hq/provider";
import { clockLabel } from "@/lib/hq/format";

const KEY = "hq-alarms-fired";

function fired(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}
function remember(set: Set<string>): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...set].slice(-300)));
  } catch {
    // Private mode: alarms may repeat after a reload, which is acceptable.
  }
}

/** A short two-note chime (WebAudio), only after the page has had a user gesture. */
function chime(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.45);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // No audio: the toast is enough.
  }
}

/**
 * Meeting alarms: at each of an event's alert marks (and at its start) a
 * toast, a chime and — if allowed and the tab is hidden — a browser
 * notification. Each fires once per tab session.
 */
export function MeetingAlarms() {
  const events = useHq((v) => v.events);
  const me = useHq((v) => v.me.person.id);
  const latest = useRef(events);
  useEffect(() => {
    latest.current = events;
  }, [events]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const done = fired();
      let changed = false;
      for (const e of latest.current) {
        if (!e.attendees.includes(me) || e.allDay) continue;
        const start = Date.parse(e.start);
        for (const mins of [...e.alerts, 0]) {
          const at = start - mins * 60_000;
          const key = `${e.id}:${mins}`;
          if (now < at || now > at + 5 * 60_000 || done.has(key)) continue;
          done.add(key);
          changed = true;
          const title = mins ? `${e.title} in ${mins >= 60 ? `${Math.round(mins / 60)} h` : `${mins} min`}` : `${e.title} is starting`;
          const body = `${clockLabel(e.start)}${e.location ? ` · ${e.location}` : ""}`;
          chime();
          toast(title, {
            description: body,
            duration: 12_000,
            action: e.link ? { label: "Join", onClick: () => window.open(e.link, "_blank", "noopener") } : typeof Notification !== "undefined" && Notification.permission === "default" ? { label: "Allow alerts", onClick: () => Notification.requestPermission() } : undefined,
          });
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) new Notification(title, { body, tag: key, icon: "/icon.png" });
        }
      }
      if (changed) remember(done);
    };
    check();
    const timer = setInterval(check, 20_000);
    return () => clearInterval(timer);
  }, [me]);

  return null;
}
