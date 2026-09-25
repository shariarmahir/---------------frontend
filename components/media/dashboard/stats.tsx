"use client";

import Link from "next/link";
import { BriefcaseBusiness, CalendarHeart, Clock, Lock, StickyNote, Wallet, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { Num, Taka } from "../ui/numerals";
import { useWallet } from "../wallet/use-wallet";
import { useMinutesToday } from "../wellbeing/usage";

function Tile({ href, Icon, label, children }: { href: string; Icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-2xl border border-card-border bg-white p-4 transition-[border-color,box-shadow] hover:border-bd-green/35 hover:shadow-[0_6px_18px_-12px_rgb(15_23_42/0.25)]">
      <span className="flex items-center gap-2 text-xs font-semibold text-text-muted">
        <Icon className="size-4 text-bd-green" aria-hidden />
        {label}
      </span>
      <span className="mt-1.5 block text-xl font-bold text-text-primary">{children}</span>
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
      <Tile href="/media/wallet" Icon={Wallet} label="তোলা যাবে"><Taka amount={w.available} /></Tile>
      <Tile href="/media/wallet" Icon={Lock} label="এসক্রোতে"><Taka amount={w.escrow} /></Tile>
      <Tile href="/media/wallet" Icon={Wallet} label="মোট আয়"><Taka amount={w.lifetime} /></Tile>
      <Tile href="/media/jobs" Icon={BriefcaseBusiness} label="কাজে আবেদন"><Num value={applied} /></Tile>
      <Tile href="/media/events" Icon={CalendarHeart} label="উদ্যোগে অংশ"><Num value={joined} /></Tile>
      <Tile href="/media/settings" Icon={Clock} label="আজ এখানে"><Num value={minutes} /> মিনিট</Tile>
      <Tile href="/media/notes" Icon={StickyNote} label="নোট"><Num value={notes} /></Tile>
    </div>
  );
}
