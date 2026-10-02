"use client";

import Link from "next/link";
import { BriefcaseBusiness, CalendarHeart, Clock, StickyNote, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { Num } from "../ui/numerals";
import { useMinutesToday } from "../wellbeing/usage";

function Tile({ i, href, Icon, label, children }: { i: number; href: string; Icon: LucideIcon; label: string; children: React.ReactNode }) {
  const surface = surfaceAt(i);
  return (
    <Link href={href} style={glowStyle(surface.glow)} className={cn("story-reveal rounded-2xl p-4", surface.card, LIFT)}>
      <span className="flex items-center gap-2 text-xs font-semibold opacity-80">
        <span className={cn("flex size-7 items-center justify-center rounded-lg", surface.tile)}>
          <Icon className="size-4" aria-hidden />
        </span>
        {label}
      </span>
      <span className="mt-2 block text-2xl font-bold tracking-tight">{children}</span>
    </Link>
  );
}

/** The viewer's activity and time; money lives in the wallet and shop charts above. */
export function DashboardStats() {
  const hydrated = useHydrated();
  const applied = useMediaState((s) => Object.keys(s.applied).length);
  const joined = useMediaState((s) => Object.keys(s.joinedEvents).length + s.myEvents.length);
  const notes = useMediaState((s) => s.notes.length);
  const minutes = useMinutesToday();
  if (!hydrated) return <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Skeleton className="h-22 rounded-2xl" /><Skeleton className="h-22 rounded-2xl" /><Skeleton className="h-22 rounded-2xl" /><Skeleton className="h-22 rounded-2xl" /></div>;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile i={0} href="/media/jobs" Icon={BriefcaseBusiness} label="কাজে আবেদন"><Num value={applied} /></Tile>
      <Tile i={1} href="/media/events" Icon={CalendarHeart} label="উদ্যোগে অংশ"><Num value={joined} /></Tile>
      <Tile i={2} href="/media/settings" Icon={Clock} label="আজ এখানে"><Num value={minutes} /> মিনিট</Tile>
      <Tile i={3} href="/media/notes" Icon={StickyNote} label="নোট"><Num value={notes} /></Tile>
    </div>
  );
}
