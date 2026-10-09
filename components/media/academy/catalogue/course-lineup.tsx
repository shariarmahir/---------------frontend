"use client";

import { useState } from "react";
import { LEVELS, type Level } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { CourseCard } from "./course-card";
import type { CourseEntry } from "./entries";
import { fillRow, lineupGrid } from "./fill-row";

const ORDER: Level[] = ["foundation", "intermediate", "advanced"];

const choice = "hud flex h-11 items-center gap-2 px-4 font-bold transition-colors duration-150";

/**
 * Courses side by side, with "আপনি কোথায় আছেন?" across the top: pick a
 * level and its courses are marked while the rest step back — nothing moves,
 * so a jump link still lands where it should. The cell after the last card
 * (`last`) fills the rest of its row.
 */
export function CourseLineup({ entries, last }: { entries: CourseEntry[]; last: React.ReactNode }) {
  const [level, setLevel] = useState<Level | null>(null);
  const count = (l: Level) => entries.filter((e) => e.course.level === l).length;
  const matched = level ? count(level) : entries.length;

  return (
    <div className="@container">
      <div role="group" aria-label="আপনার স্তর" className="flex flex-wrap items-stretch gap-px border-b border-(--c-line) bg-(--c-line)">
        <p className="hud flex h-11 items-center bg-(--c-bg) px-6 text-(--c-faint) md:px-10">আপনি কোথায় আছেন?</p>
        {ORDER.filter((l) => count(l) > 0).map((l) => {
          const on = level === l;
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              onClick={() => setLevel(on ? null : l)}
              className={cn(choice, on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)")}
            >
              {LEVELS[l]}
              <span className="font-normal opacity-60">
                <Num value={count(l)} />
              </span>
            </button>
          );
        })}
        <p aria-live="polite" className="hud flex h-11 flex-1 items-center justify-end bg-(--c-bg) px-6 text-(--c-faint) md:px-10">
          {level ? (
            <>
              {LEVELS[level]} স্তরে <Num value={matched} />টি কোর্স
            </>
          ) : (
            <>
              সব মিলিয়ে <Num value={entries.length} />টি কোর্স
            </>
          )}
        </p>
      </div>

      <div data-reveal-group className={lineupGrid}>
        {entries.map((entry, i) => {
          const mine = level !== null && entry.course.level === level;
          return <CourseCard key={entry.course.id} entry={entry} n={i + 1} level={mine} dim={level !== null && !mine} />;
        })}
        <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(entries.length))}>
          {last}
        </div>
      </div>
    </div>
  );
}
