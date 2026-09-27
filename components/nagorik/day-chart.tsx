"use client";

import { useState } from "react";
import { TUS } from "@/data/nagorik";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

type SegKey = "paid" | "unpaid" | "rest";

const SEGMENTS: { key: SegKey; label: string; swatch: string }[] = [
  { key: "paid", label: "আয়ের কাজ", swatch: "bg-chart-paid" },
  { key: "unpaid", label: "ঘর ও সেবা-যত্ন (অবৈতনিক)", swatch: "bg-chart-care" },
  { key: "rest", label: "বাকি সময় — ঘুম, খাওয়া, শেখা, অবসর", swatch: "bg-slate-200" },
];

const ROWS = [
  { sex: "women" as const, label: "নারী" },
  { sex: "men" as const, label: "পুরুষ" },
];

const h = (v: number) => `${toBanglaDigits(v.toFixed(1))} ঘণ্টা`;

/**
 * A 24-hour day, women beside men — BBS Time-Use Survey 2021. Each bar is
 * the whole day; the two measured blocks grow in on first view and the
 * rest of the day stays one neutral block, since the survey brief does not
 * split it further.
 */
export function DayChart() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<{ sex: string; key: SegKey } | null>(null);

  return (
    <figure ref={ref} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <figcaption>
        <h3 className="font-bengali text-xl font-bold text-text-primary sm:text-2xl">একজন মানুষের গড় ২৪ ঘণ্টা</h3>
        <p className="mt-1 font-bengali text-sm text-text-muted">জাতীয় গড়, ১৫ বছর ও তার বেশি · ঘণ্টা/দিন</p>
      </figcaption>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="রঙের অর্থ">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-2 font-bengali text-sm text-text-secondary">
            <span aria-hidden className={cn("size-3 rounded-xs", s.swatch)} /> {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-6">
        {ROWS.map((row, ri) => {
          const d = TUS.day[row.sex];
          const values: Record<SegKey, number> = { paid: d.paid, unpaid: d.unpaid, rest: 24 - d.paid - d.unpaid };
          return (
            <div key={row.sex}>
              <div className="mb-2 flex items-baseline justify-between font-bengali">
                <span className="text-base font-bold text-text-primary">{row.label}</span>
                <span className="text-sm text-text-secondary">
                  আয়ের কাজ <strong className="text-text-primary">{h(d.paid)}</strong> · ঘরের কাজ <strong className="text-text-primary">{h(d.unpaid)}</strong>
                </span>
              </div>
              <div className="flex h-11 gap-0.5 rounded-md bg-slate-100">
                {SEGMENTS.map((s, si) => {
                  const v = values[s.key];
                  const pct = (v / 24) * 100;
                  const on = hover?.sex === row.sex && hover.key === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      aria-label={`${row.label} · ${s.label}: ${h(v)}, দিনের ${toBanglaDigits(Math.round(pct))}%`}
                      onMouseEnter={() => setHover({ sex: row.sex, key: s.key })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ sex: row.sex, key: s.key })}
                      onBlur={() => setHover(null)}
                      style={{ width: seen ? `${pct}%` : "0%", transitionDelay: `${ri * 180 + si * 120}ms` }}
                      className={cn(
                        "relative h-full min-w-0 transition-[width,filter] duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] first:rounded-l-md last:rounded-r-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary motion-reduce:transition-none",
                        s.swatch,
                        on && "brightness-110",
                      )}
                    >
                      {pct > 12 && s.key !== "rest" && (
                        <span className="absolute inset-0 flex items-center justify-center font-bengali text-sm font-bold text-white">{h(v)}</span>
                      )}
                      {on && (
                        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-text-primary px-3 py-1.5 font-bengali text-xs whitespace-nowrap text-white shadow-lg">
                          {s.label}: {h(v)} · দিনের {toBanglaDigits(Math.round(pct))}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="mt-2 flex justify-between font-bengali text-xs text-text-muted">
        {[0, 6, 12, 18, 24].map((t) => (
          <span key={t}>{toBanglaDigits(t)}</span>
        ))}
      </div>

      <details className="mt-5 font-bengali text-sm">
        <summary className="cursor-pointer font-semibold text-bd-green">টেবিল হিসেবে দেখুন</summary>
        <table className="mt-3 w-full text-left">
          <thead className="text-text-muted">
            <tr>
              <th className="py-1.5 font-semibold">কাজ</th>
              <th className="py-1.5 text-right font-semibold">নারী</th>
              <th className="py-1.5 text-right font-semibold">পুরুষ</th>
            </tr>
          </thead>
          <tbody className="text-text-primary">
            <tr className="border-t border-slate-100">
              <td className="py-1.5">আয়ের কাজ</td>
              <td className="py-1.5 text-right">{h(TUS.day.women.paid)}</td>
              <td className="py-1.5 text-right">{h(TUS.day.men.paid)}</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-1.5">ঘর ও সেবা-যত্ন</td>
              <td className="py-1.5 text-right">{h(TUS.day.women.unpaid)}</td>
              <td className="py-1.5 text-right">{h(TUS.day.men.unpaid)}</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-1.5">ঘর ও সেবা-যত্ন, ২৫–৪৪ বছর</td>
              <td className="py-1.5 text-right">{h(TUS.prime.women)}</td>
              <td className="py-1.5 text-right">{h(TUS.prime.men)}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <p className="mt-4 font-bengali text-xs leading-relaxed text-text-muted">
        সূত্র:{" "}
        <a href={TUS.url} target="_blank" rel="noopener noreferrer" className="text-bd-green underline-offset-2 hover:underline">
          {TUS.source}
        </a>{" "}
        · {TUS.sample}
      </p>
    </figure>
  );
}
