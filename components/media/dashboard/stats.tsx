"use client";

import Link from "next/link";
import { BriefcaseBusiness, CalendarHeart, Clock, Lock, StickyNote, Wallet, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { Num, Taka } from "../ui/numerals";
import { useWallet } from "../wallet/use-wallet";
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

/** The viewer's numbers — money, activity, time. */
export function DashboardStats() {
  const hydrated = useHydrated();
  const w = useWallet();
  const applied = useMediaState((s) => Object.keys(s.applied).length);
  const joined = useMediaState((s) => Object.keys(s.joinedEvents).length + s.myEvents.length);
  const notes = useMediaState((s) => s.notes.length);
  const minutes = useMinutesToday();
  if (!hydrated) return <div className="grid grid-cols-2 gap-3 md:grid-cols-3"><Skeleton className="h-22 rounded-2xl" /><Skeleton className="h-22 rounded-2xl" /><Skeleton className="h-22 rounded-2xl" /></div>;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Tile i={0} href="/media/wallet" Icon={Wallet} label="তোলা যাবে"><Taka amount={w.available} /></Tile>
      <Tile i={1} href="/media/wallet" Icon={Lock} label="এসক্রোতে"><Taka amount={w.escrow} /></Tile>
      <Tile i={2} href="/media/wallet" Icon={Wallet} label="মোট আয়"><Taka amount={w.lifetime} /></Tile>
      <Tile i={3} href="/media/jobs" Icon={BriefcaseBusiness} label="কাজে আবেদন"><Num value={applied} /></Tile>
      <Tile i={4} href="/media/events" Icon={CalendarHeart} label="উদ্যোগে অংশ"><Num value={joined} /></Tile>
      <Tile i={5} href="/media/settings" Icon={Clock} label="আজ এখানে"><Num value={minutes} /> মিনিট</Tile>
      <Tile i={6} href="/media/notes" Icon={StickyNote} label="নোট"><Num value={notes} /></Tile>
    </div>
  );
}
