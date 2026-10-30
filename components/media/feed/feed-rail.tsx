import Link from "next/link";
import { Hash } from "lucide-react";
import { courses } from "@/data/media/academy";
import { events } from "@/data/media/events";
import { posts } from "@/data/media/posts";
import { Num } from "../ui/numerals";
import { Panel } from "../ui/layout";
import { DailyPlan } from "../wellbeing/daily-plan";
import { RailCalendar, ShareNote, TodoList, type DayItem } from "./rail-tools";

/**
 * The feed's working side: the month with the academy's classes and the
 * community's events, today's plan, a to-do list, a quick note to keep or
 * share, and what people are talking about.
 */
export function FeedRail() {
  const days: DayItem[] = [
    ...courses.filter((c) => c.nextLive).map((c) => ({ iso: c.nextLive!, title: c.title, href: `/media/academy/course/${c.id}`, kind: "class" as const })),
    ...events.map((e) => ({ iso: e.date, title: e.title, href: `/media/together?v=events#${e.id}`, kind: "event" as const })),
  ];
  const tags = Object.entries(posts.flatMap((p) => p.tags).reduce<Record<string, number>>((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-4 pb-6">
      <RailCalendar items={days} />
      <DailyPlan compact />
      <TodoList />
      <ShareNote />

      <Panel title="চলছে">
        <ul className="flex flex-wrap gap-1.5">
          {tags.map(([tag, n]) => (
            <li key={tag}>
              <Link
                href={`/media/search?q=${encodeURIComponent(tag.replace(/^#/, ""))}`}
                className="inline-flex min-h-8 items-center gap-1 rounded-full border border-m-ink/12 px-2.5 text-xs font-semibold text-m-ink/85 transition-colors hover:border-m-blue/50 hover:text-m-ink"
              >
                <Hash className="size-3 text-m-blue" aria-hidden />
                {tag.replace(/^#/, "").replaceAll("_", " ")}
                {n > 1 && (
                  <span className="text-m-ink/45">
                    <Num value={n} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
