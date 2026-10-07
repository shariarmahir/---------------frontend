"use client";

import { useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { findSubs, resolveSub, SECTIONS } from "@/data/media/market-sections";
import { cn } from "@/lib/utils";
import { choiceClass } from "../ui/field-styles";
import { SectionIcon } from "./section-icon";

/**
 * Choose where an item belongs: type a word ("জামদানি", "mobile", "গরু")
 * to jump straight to it, or open a section and pick its sub-section.
 */
export function SubPicker({ value, onChange, error }: { value: string; onChange: (id: string) => void; error?: string }) {
  const current = resolveSub(value);
  const [open, setOpen] = useState(current.section.id);
  const [q, setQ] = useState("");
  const hits = findSubs(q).slice(0, 12);
  const section = SECTIONS.find((s) => s.id === open) ?? current.section;

  return (
    <fieldset className="space-y-3" aria-describedby={error ? "sub-error" : undefined}>
      <legend className="mb-1 text-sm font-semibold text-m-ink">বিভাগ</legend>
      <p className="text-sm text-m-ink/80">
        বেছে নেওয়া: <span className="font-bold text-m-blue">{current.section.bn} › {current.sub.bn}</span>
      </p>
      <label className="relative block">
        <span className="sr-only">বিভাগ খুঁজুন</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-m-ink/60" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="লিখে খুঁজুন — জামদানি, মোবাইল, গরু, অটোক্যাড…"
          className="h-11 w-full rounded-xl border border-m-ink/10 bg-white/55 pr-3 pl-10 text-sm text-m-ink focus:border-m-blue focus:ring-3 focus:ring-m-blue/15 focus:outline-none"
        />
      </label>

      {q.trim() ? (
        hits.length === 0 ? (
          <p className="text-sm text-m-ink/65">মেলেনি। নিচের তালিকা থেকে বেছে নিন, নয়তো “অন্য কিছু”-তে নিজের বিভাগ লিখুন।</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hits.map(({ sub, section: s }) => (
              <button key={sub.id} type="button" aria-pressed={value === sub.id} onClick={() => { onChange(sub.id); setOpen(s.id); setQ(""); }} className={choiceClass(value === sub.id)}>
                <SectionIcon icon={s.icon} className="size-4 shrink-0" />
                {sub.bn}
                <span className="text-xs opacity-60">· {s.bn}</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={open === s.id}
                onClick={() => setOpen(s.id)}
                className={cn("flex w-22 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center text-[11px] leading-tight font-semibold transition-colors", open === s.id ? "bg-m-yellow text-m-ink" : "bg-m-ink/6 text-m-ink/80 hover:bg-m-ink/8")}
              >
                <SectionIcon icon={s.icon} className="size-5" />
                {s.bn}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {section.subs.map((sub) => (
              <label key={sub.id} className={choiceClass(value === sub.id)}>
                <input type="radio" name="sub" className="sr-only" checked={value === sub.id} onChange={() => onChange(sub.id)} />
                {sub.bn}
              </label>
            ))}
          </div>
          <p className="text-xs text-m-ink/60">{section.hint}</p>
        </>
      )}

      {current.section.note && (
        <p className="flex gap-2 rounded-xl bg-m-ink/6 p-3 text-xs leading-relaxed text-m-ink/85">
          <ShieldAlert className="size-4 shrink-0 text-m-blue" aria-hidden />
          {current.section.note}
        </p>
      )}
      {error && <p id="sub-error" className="text-xs font-medium text-m-red">{error}</p>}
    </fieldset>
  );
}
