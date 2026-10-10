"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FinderAnswers } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { academyFit } from "../finder/facts";
import { useAcademy } from "../use-academy";
import { Lean } from "./band";
import { blockBtn } from "./buttons";
import { AcademyCard } from "./academy-card";
import type { AcademyEntry } from "./entries";
import { fillRow, lineupGrid } from "./fill-row";

const EMPTY: FinderAnswers = {};

/**
 * Every academy side by side. Once the three questions on the home page have
 * answers, the best-suited come first (ties keep the catalogue's order); the
 * last cell asks a skilled hand to open one of their own.
 */
export function AcademyLineup({ entries }: { entries: AcademyEntry[] }) {
  const hydrated = useHydrated();
  const finder = useAcademy((s) => s.finder ?? EMPTY);
  const answers = hydrated ? finder : EMPTY;
  const ranked = entries
    .map((e, i) => ({ e, i, fit: academyFit(e.academy, answers) }))
    .sort((x, y) => y.fit - x.fit || x.i - y.i)
    .map((r) => r.e);

  return (
    <div className="@container">
      <div data-reveal-group className={lineupGrid}>
        {ranked.map((entry, i) => (
          <AcademyCard key={entry.academy.id} entry={entry} n={i + 1} />
        ))}
        <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(entries.length))}>
          <p className="hud text-(--c-faint)">এরপর</p>
          <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
            আপনার একাডেমি <Lean>কবে</Lean>?
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">কোনো কাজে হাত পাকা? নিজের নামে, বা বন্ধুদের নিয়ে একাডেমি খুলুন — প্রথম বিভাগ চালু হবে আপনার হাতেই।</p>
          <div className="mt-auto pt-8">
            <Link href="/media/academy/teach" className={blockBtn}>
              একাডেমি খুলুন
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
