"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { STORY_KINDS } from "@/lib/media/team-room";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Ago } from "../ui/numerals";
import { STORY_ICON } from "./journey";
import { KIND_ICON } from "./team-room";
import { useLatestStories } from "./use-team-room";

/** The newest journeys and stories from every team, one swipe wide. */
export function StoryRail() {
  const hydrated = useHydrated();
  const list = useLatestStories(10);
  if (list.length === 0) return null;

  return (
    <section aria-labelledby="rail-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="rail-title" className="text-xl font-bold text-white">টিমের যাত্রা</h2>
          <p className="text-sm text-white/65">দলগুলো কী পার হলো, কী শিখল — প্রতিটি গল্প টিম রুমে, চাইলে ফিডেও।</p>
        </div>
        <Link href="/media?t=team" className="inline-flex items-center gap-1.5 text-sm font-bold text-signal-orange hover:underline">
          <Newspaper className="size-4" aria-hidden /> ফিডে টিমের পোস্ট
        </Link>
      </div>
      <ul className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scrollbar-gold sm:mx-0 sm:px-0">
        {list.map(({ story, team }, i) => {
          const Kind = STORY_ICON[story.kind];
          const TeamIcon = KIND_ICON[team.kind];
          const journey = story.kind === "journey";
          return (
            <li key={story.id} className="w-[78%] shrink-0 snap-start sm:w-80">
              <Link
                href={`/media/together/team/${team.id}#${story.id}`}
                className={cn(
                  "group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl p-4 ring-1 ring-white/12 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_44px_-24px_var(--color-signal-orange)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  story.photo ? "bg-black" : journey ? "bg-signal-orange" : "bg-bd-green",
                )}
              >
                {story.photo && (
                  <>
                    <Image src={story.photo} alt="" fill sizes="320px" priority={i < 2} unoptimized={story.photo.startsWith("data:")} className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" aria-hidden />
                  </>
                )}
                <span className="relative flex items-center gap-2 text-xs font-bold">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5", story.photo ? (journey ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white") : "bg-text-primary text-signal-orange")}>
                    <Kind className="size-3.5" aria-hidden /> {STORY_KINDS[story.kind].bn}
                  </span>
                  {hydrated && <span className={cn("font-medium", !story.photo && journey ? "text-text-primary/70" : "text-white/70")}><Ago iso={story.at} /></span>}
                </span>
                <span className={cn("relative mt-2 line-clamp-2 text-lg leading-snug font-bold", !story.photo && journey ? "text-text-primary" : "text-white")}>{story.title}</span>
                <span className={cn("relative mt-1 line-clamp-2 text-sm", !story.photo && journey ? "text-text-primary/80" : "text-white/80")}>{story.body}</span>
                <span className={cn("relative mt-3 flex items-center gap-1.5 border-t pt-2.5 text-xs font-bold", !story.photo && journey ? "border-text-primary/20 text-text-primary" : "border-white/15 text-white")}>
                  <TeamIcon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{team.name}</span>
                  <ArrowRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
