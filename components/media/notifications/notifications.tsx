"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Bell, BriefcaseBusiness, CalendarHeart, Handshake, Megaphone, ShieldCheck, Star, Users, Wallet, type LucideIcon } from "lucide-react";
import { notices } from "@/data/media/notices";
import type { NoticeKind } from "@/data/media/types";
import { updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Ago, Num } from "../ui/numerals";

const kindIcon: Record<NoticeKind, LucideIcon> = {
  rating: Star,
  hire: Handshake,
  job: BriefcaseBusiness,
  event: CalendarHeart,
  civic: Megaphone,
  team: Users,
  sale: Wallet,
  system: ShieldCheck,
};

function useUnseen() {
  const seen = useMediaState((s) => s.seenNotices);
  return notices.filter((n) => !seen[n.id]).length;
}

export function NotificationBell() {
  const n = useUnseen();
  return (
    <Link href="/media/notifications" className={mediaButton({ variant: "ghost", size: "icon", className: "relative" })}>
      <Bell aria-hidden />
      <span className="sr-only">নোটিফিকেশন{n > 0 ? ` (${n})` : ""}</span>
      {n > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 rounded-full bg-signal-orange px-1 text-[11px] leading-4.5 font-bold text-text-primary ring-2 ring-white" aria-hidden>
          <Num value={n} />
        </span>
      )}
    </Link>
  );
}

export function NotificationList() {
  const hydrated = useHydrated();
  const seen = useMediaState((s) => s.seenNotices);

  // Opening the list reads everything; the dots stay for this visit.
  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => updateMedia((s) => ({ ...s, seenNotices: Object.fromEntries(notices.map((n) => [n.id, true as const])) })), 1500);
    return () => window.clearTimeout(t);
  }, [hydrated]);

  return (
    <ul className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-white">
      {notices.map((n) => {
        const Icon = kindIcon[n.kind];
        const fresh = hydrated && !seen[n.id];
        return (
          <li key={n.id}>
            <Link href={n.href} className={cn("flex gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50", fresh && "bg-bd-green-light/40")}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bd-green-light text-bd-green">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-relaxed text-text-primary">{n.text}</span>
                <span className="mt-0.5 block text-xs text-text-muted"><Ago iso={n.at} /></span>
              </span>
              {fresh && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-signal-orange" aria-label="নতুন" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
