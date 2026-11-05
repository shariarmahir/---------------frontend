"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEMO_NOW } from "@/data/media/clock";
import { compactBn, digits, taka, timeAgoBn, type Numerals } from "@/lib/media/format";
import { NUMERALS_COOKIE } from "@/lib/media/numerals-cookie";

/**
 * Bangla or Latin digits, chosen in the shell and kept in a cookie so the
 * server render already uses the right ones. Every number on screen goes
 * through the leaf components below, so switching is instant.
 */

const NumeralsContext = createContext<{ numerals: Numerals; setNumerals: (n: Numerals) => void }>({
  numerals: "bn",
  setNumerals: () => {},
});

export function NumeralsProvider({ initial, children }: { initial: Numerals; children: React.ReactNode }) {
  const [numerals, set] = useState<Numerals>(initial);
  const setNumerals = useCallback((n: Numerals) => {
    set(n);
    document.cookie = `${NUMERALS_COOKIE}=${n}; path=/; max-age=31536000; samesite=lax`;
  }, []);
  const value = useMemo(() => ({ numerals, setNumerals }), [numerals, setNumerals]);
  return <NumeralsContext.Provider value={value}>{children}</NumeralsContext.Provider>;
}

export function useNumerals() {
  return useContext(NumeralsContext);
}

export function Num({ value, decimals }: { value: number | string; decimals?: number }) {
  const { numerals } = useNumerals();
  const v = typeof value === "number" && decimals !== undefined ? value.toFixed(decimals) : value;
  return <>{digits(v, numerals)}</>;
}

export function Taka({ amount }: { amount: number }) {
  const { numerals } = useNumerals();
  return <span className="tabular-nums">{taka(amount, numerals)}</span>;
}

export function Compact({ n }: { n: number }) {
  const { numerals } = useNumerals();
  return <>{compactBn(n, numerals)}</>;
}

/**
 * Relative time. Seeded content is dated against the demo clock; content
 * created in this browser (`live`) against the real one — the machine's
 * clock may be behind the demo date, so the timestamp alone can't tell.
 */
export function Ago({ iso, live }: { iso: string; live?: boolean }) {
  const { numerals } = useNumerals();
  const now = live || iso > DEMO_NOW.toISOString() ? new Date() : DEMO_NOW;
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {timeAgoBn(iso, now, numerals)}
    </time>
  );
}

/** A calendar date (and optionally time) in Bangla, Dhaka time. */
export function DateText({ iso, time, weekday }: { iso: string; time?: boolean; weekday?: boolean }) {
  const { numerals } = useNumerals();
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+06:00` : iso);
  const date = new Intl.DateTimeFormat(numerals === "bn" ? "bn-BD" : "bn-BD-u-nu-latn", {
    day: "numeric",
    month: "long",
    weekday: weekday ? "long" : undefined,
    timeZone: "Asia/Dhaka",
  }).format(d);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {time ? `${date} · ${clockBn(d, numerals)}` : date}
    </time>
  );
}

/** "সকাল ৭টা", "বিকাল ৩:৩০" — Bangla time of day, Dhaka time. */
function clockBn(d: Date, numerals: Numerals): string {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Dhaka" })
    .format(d)
    .split(":")
    .map(Number);
  const part = h < 6 ? "ভোর" : h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকাল" : h < 20 ? "সন্ধ্যা" : "রাত";
  const h12 = h % 12 || 12;
  return `${part} ${digits(m ? `${h12}:${String(m).padStart(2, "0")}` : h12, numerals)}${m ? "" : "টা"}`;
}

/** Formatting for strings that must be built in client code (aria, toasts). */
export function useFormat() {
  const { numerals } = useNumerals();
  return useMemo(
    () => ({
      num: (v: number | string) => digits(v, numerals),
      taka: (a: number) => taka(a, numerals),
    }),
    [numerals],
  );
}
