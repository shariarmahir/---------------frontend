"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findSubs, SECTIONS } from "@/data/media/market-sections";
import { cn } from "@/lib/utils";
import { Num } from "../ui/numerals";
import { SectionIcon } from "./section-icon";

/**
 * Every section and sub-section of the বাজার in one sheet, searchable.
 * `query` is the page's other filters, kept when a sub-section is chosen.
 * Opened from the fixed "সব বিভাগ" button in SectionRail, so it takes
 * `open`/`onOpenChange` rather than rendering its own trigger.
 */
export function CategoryBrowser({ open, onOpenChange, query, counts, current }: { open: boolean; onOpenChange: (o: boolean) => void; query: string; counts: Record<string, number>; current?: string }) {
  const [q, setQ] = useState("");
  const link = (sec: string, sub?: string) => {
    const p = new URLSearchParams(query);
    p.set("sec", sec);
    if (sub) p.set("sub", sub);
    return `/media/market?${p}`;
  };
  const hits = new Set(findSubs(q).map((h) => h.sub.id));
  const shown = q.trim() ? SECTIONS.map((s) => ({ ...s, subs: s.subs.filter((x) => hits.has(x.id)) })).filter((s) => s.subs.length) : SECTIONS;
  const total = SECTIONS.reduce((n, s) => n + s.subs.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-2xl bg-m-card p-0 font-sans sm:max-w-4xl">
        <DialogHeader className="gap-3 border-b border-m-ink/10 p-5 pr-12">
          <DialogTitle className="text-lg font-bold text-m-ink">বাজারের সব বিভাগ</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/70">
            <Num value={SECTIONS.length} />টি বিভাগ, <Num value={total} />টি উপ-বিভাগ — দেশে যা কেনাবেচা হয়।
          </DialogDescription>
          <label className="relative block">
            <span className="sr-only">বিভাগ খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-m-ink/60" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="জামদানি, মোবাইল, গরু, অটোক্যাড, ইট…"
              className="h-11 w-full rounded-xl border border-m-ink/10 bg-white/55 pr-3 pl-10 text-sm text-m-ink focus:border-m-blue focus:ring-3 focus:ring-m-blue/15 focus:outline-none"
            />
          </label>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          {shown.length === 0 ? (
            <p className="text-sm text-m-ink/70">“{q}” কোনো বিভাগে মেলেনি — “অন্য কিছু”-তে খুঁজে দেখুন বা হ্যাশট্যাগে খুঁজুন।</p>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {shown.map((s) => (
                <section key={s.id} className="mb-5 break-inside-avoid rounded-xl bg-m-ink/3 p-3">
                  <Link href={link(s.id)} onClick={() => onOpenChange(false)} className="flex items-center gap-2 font-bold text-m-blue hover:underline">
                    <SectionIcon icon={s.icon} className="size-4.5 shrink-0" />
                    {s.bn}
                  </Link>
                  <ul className="mt-2 space-y-0.5">
                    {s.subs.map((x) => (
                      <li key={x.id}>
                        <Link
                          href={link(s.id, x.id)}
                          onClick={() => onOpenChange(false)}
                          aria-current={current === x.id ? "page" : undefined}
                          className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors", current === x.id ? "bg-m-yellow text-m-ink" : "text-m-ink/85 hover:bg-m-ink/6 hover:text-m-ink")}
                        >
                          {x.bn}
                          {counts[x.id] ? <span className="shrink-0 text-xs font-bold"><Num value={counts[x.id]} /></span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
