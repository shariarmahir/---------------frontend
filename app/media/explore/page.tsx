import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ExploreIcon } from "@/components/media/shell/explore-icon";
import { PageHeader } from "@/components/media/ui/layout";
import { DailyPlan } from "@/components/media/wellbeing/daily-plan";
import { mediaNavGroups } from "@/data/media/nav";

export const metadata: Metadata = { title: "আবিষ্কার" };

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="আবিষ্কার" subtitle="শিখুন, যুক্ত হোন, বানান, প্রয়োগ করুন — সব এক জায়গায়।" />
      <form action="/media/search" role="search">
        <label className="relative block">
          <span className="sr-only">খুঁজুন</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-m-ink/65" aria-hidden />
          <input
            type="search"
            name="q"
            enterKeyHint="search"
            placeholder="দক্ষতা, মানুষ, কাজ বা পণ্য খুঁজুন…"
            className="h-12 w-full rounded-2xl border border-m-ink/10 bg-m-card pr-4 pl-12 text-[15px] focus:border-m-blue focus:ring-3 focus:ring-m-blue/15 focus:outline-none shadow-m-tile"
          />
        </label>
      </form>
      {mediaNavGroups.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`}>
          <h2 id={`g-${g.title}`} className="mb-3 text-sm font-bold text-m-ink/65">{g.title}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {g.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-m-ink/10 bg-m-card p-4 transition-[border-color,box-shadow] hover:border-m-blue/35 hover:shadow-[0_6px_18px_-12px_rgb(15_23_42/0.25)] shadow-m-tile"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-m-ink/6 text-m-blue">
                    <ExploreIcon icon={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-m-ink">{item.label}</span>
                    <span className="block text-xs text-m-ink/65">{item.hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="lg:hidden">
        <DailyPlan />
      </div>
    </div>
  );
}
