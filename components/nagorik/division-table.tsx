"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_COLUMNS, DIVISION_SAMPLE, type DivisionRow, type Sex } from "@/data/nagorik";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

type ColKey = (typeof DIVISION_COLUMNS)[number]["key"];

const SEX: { id: Sex; label: string }[] = [
  { id: "women", label: "নারী" },
  { id: "men", label: "পুরুষ" },
];

const fmt = (key: ColKey, v: number) => (key === "duty" ? toBanglaDigits(v) : toBanglaDigits(v.toFixed(1)));

/**
 * How a day is spent, division by division — SAMPLE data (see
 * data/nagorik.ts). Each cell carries a bar scaled to its column's maximum
 * across both sexes, so switching sex keeps the scale honest.
 */
export function DivisionTable() {
  const [sex, setSex] = useState<Sex>("women");
  const [sort, setSort] = useState<{ key: ColKey; desc: boolean }>({ key: "duty", desc: true });
  const [ref, seen] = useInView<HTMLDivElement>(0.15);

  const max = Object.fromEntries(
    DIVISION_COLUMNS.map((c) => [c.key, Math.max(...[...DIVISION_SAMPLE.women, ...DIVISION_SAMPLE.men].map((r) => r[c.key]))]),
  ) as Record<ColKey, number>;
  const rows = [...DIVISION_SAMPLE[sex]].sort((a: DivisionRow, b: DivisionRow) => (sort.desc ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]));

  return (
    <div ref={ref} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 sm:p-6">
        <div>
          <h3 className="font-bengali text-xl font-bold text-text-primary">বিভাগভিত্তিক দিনের হিসাব</h3>
          <p className="mt-1 flex items-center gap-1.5 font-bengali text-sm font-semibold text-amber-800">
            <Icon name="info" className="text-[18px]" /> নমুনা তথ্য — বিভাগভিত্তিক প্রকৃত জরিপ হলে বসবে
          </p>
        </div>
        <div role="radiogroup" aria-label="কাদের হিসাব" className="flex rounded-xl bg-slate-100 p-1">
          {SEX.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={sex === s.id}
              onClick={() => setSex(s.id)}
              className={cn(
                "min-h-10 rounded-lg px-5 font-bengali text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none",
                sex === s.id ? "bg-white text-bd-green shadow-sm" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <caption className="sr-only">প্রতি বিভাগে {sex === "women" ? "নারীর" : "পুরুষের"} গড় দিন — নমুনা তথ্য</caption>
          <thead>
            <tr className="bg-mint-subtle/70">
              <th scope="col" className="px-5 py-3 font-bengali text-sm font-bold text-text-primary">বিভাগ</th>
              {DIVISION_COLUMNS.map((c) => {
                const on = sort.key === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={on ? (sort.desc ? "descending" : "ascending") : "none"} className="px-3 py-2 align-bottom">
                    <button
                      type="button"
                      onClick={() => setSort({ key: c.key, desc: on ? !sort.desc : true })}
                      className="group flex flex-col items-start rounded text-left focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none"
                    >
                      <span className="flex items-center gap-1 font-bengali text-sm font-bold text-text-primary">
                        {c.label}
                        <Icon name={on ? (sort.desc ? "arrow_downward" : "arrow_upward") : "unfold_more"} className={cn("text-[16px]", on ? "text-bd-green" : "text-text-muted")} />
                      </span>
                      <span className="font-bengali text-[11px] font-normal text-text-muted">{c.hint}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.division} className="border-t border-slate-100 transition-colors hover:bg-mint-subtle/50">
                <th scope="row" className="px-5 py-3 font-bengali text-base font-semibold text-text-primary">{r.division}</th>
                {DIVISION_COLUMNS.map((c) => (
                  <td key={c.key} className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 shrink-0 text-right font-bengali text-sm font-semibold text-text-primary tabular-nums">
                        {fmt(c.key, r[c.key])}
                      </span>
                      <span className="h-2 flex-1 rounded-full bg-slate-100">
                        <span
                          className={cn("block h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", c.key === "idle" ? "bg-national-crimson/70" : c.key === "unpaid" ? "bg-chart-care" : "bg-chart-paid")}
                          style={{ width: seen ? `${(r[c.key] / max[c.key]) * 100}%` : "0%", transitionDelay: `${ri * 50}ms` }}
                        />
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-5 py-4 font-bengali text-xs leading-relaxed text-text-muted sm:px-6">
        নমুনা সারিগুলো বিবিএস টাইম-ইউজ সার্ভে ২০২১-এর জাতীয় গড়ের আশপাশে বানানো, যাতে টেবিলটি কেমন হবে তা দেখা যায়। দায়িত্ব পালন বা অপচয় বিভাগভিত্তিকভাবে এখনো কোনো জরিপে মাপা হয়নি — এই সংখ্যাগুলো উদ্ধৃত করবেন না।
      </p>
    </div>
  );
}
