"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, Check, Crown, Flag, MapPin, Share2, Swords, X } from "lucide-react";
import { toast } from "sonner";
import type { Team } from "@/data/media/types";
import { getPerson } from "@/data/media/users";
import { FORMATS, outcome, respond, type TeamMatch } from "@/lib/media/team-match";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, useFormat } from "../ui/numerals";
import { ResultDialog } from "./match-dialogs";
import { KIND_ICON } from "./kind-icon";
import { editMatch, mySide, shareResult } from "./use-matches";

/** A team's badge: its cover in a ring, or its kind's icon. */
export function TeamBadge({ team, size = "md", ring }: { team?: Team; size?: "sm" | "md" | "lg"; ring?: string }) {
  const box = size === "lg" ? "size-20 sm:size-24" : size === "md" ? "size-14" : "size-9";
  const Icon = team ? KIND_ICON[team.kind] : Swords;
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-m-blue-soft text-m-ink ring-4", box, ring ?? "ring-m-ink/13")}>
      {team?.cover ? <Image src={team.cover} alt="" fill sizes="96px" className="object-cover" /> : <Icon className={size === "sm" ? "size-4" : "size-1/2"} aria-hidden />}
    </span>
  );
}

const STATUS: Record<TeamMatch["status"], string> = { invited: "আমন্ত্রণ", accepted: "সামনে", declined: "ফিরিয়ে দিয়েছে", done: "ফল" };

/** Two teams face to face: the score once played, the buttons that move it on until then. */
export function VersusCard({ match, all, mine, big }: { match: TeamMatch; all: Map<string, Team>; mine: Team[]; big?: boolean }) {
  const router = useRouter();
  const { num } = useFormat();
  const [scoring, setScoring] = useState(false);
  const home = all.get(match.home);
  const away = all.get(match.away);
  const me = mySide(match, mine);
  const o = outcome(match);
  const format = FORMATS[match.format];
  const sender = getPerson(match.by);

  function answer(accept: boolean) {
    editMatch(match.id, (m) => respond(m, accept));
    if (accept) toast.success("চ্যালেঞ্জ গ্রহণ করলেন", { description: "খেলার দিন শেষে এখানেই ফল লিখবেন।" });
    else toast("চ্যালেঞ্জ ফিরিয়ে দিলেন", { description: "পরে চাইলে আপনারাই নতুন করে চ্যালেঞ্জ দিতে পারবেন।" });
  }

  function share() {
    if (!me) return;
    const postId = shareResult(match, me.team, all, num);
    if (!postId) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    toast.success("ফল ফিডে গেল", { action: { label: "দেখুন", onClick: () => router.push(`/media/post/${postId}`) } });
  }

  const side = (team: Team | undefined, which: "home" | "away") => {
    const won = o === which;
    const lost = o !== undefined && o !== "draw" && !won;
    return (
      <div className={cn("flex min-w-0 flex-col items-center gap-2 text-center transition-opacity", lost && "opacity-55")}>
        <span className="relative">
          <TeamBadge team={team} size={big ? "lg" : "md"} ring={won ? "ring-m-blue" : which === "home" ? "ring-m-blue/35" : "ring-m-blue"} />
          {won && <Crown className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 fill-m-yellow text-m-gold drop-shadow" aria-label="জয়ী" />}
        </span>
        {team ? (
          <Link href={`/media/together/team/${team.id}`} className="line-clamp-2 text-sm leading-snug font-bold text-m-ink hover:text-m-blue sm:text-base">{team.name}</Link>
        ) : (
          <span className="text-sm font-bold text-m-ink/60">অজানা দল</span>
        )}
        {me?.team.id === team?.id && <span className="rounded-full bg-m-ink/6 px-2 py-0.5 text-[11px] font-bold text-m-blue">আপনার দল</span>}
      </div>
    );
  };

  return (
    <article id={match.id} className={cn("story-reveal scroll-mt-28 overflow-hidden rounded-3xl bg-m-card ring-1 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-28px_var(--color-signal-orange)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 shadow-m-tile", match.status === "invited" && me?.side === "away" ? "ring-2 ring-m-blue" : "ring-m-ink/10")}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 text-xs font-bold sm:px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-m-yellow px-2.5 py-1 text-m-ink"><Swords className="size-3.5" aria-hidden /> {format.bn}</span>
        <span className={cn("rounded-full px-2.5 py-1", match.status === "done" ? "bg-m-blue-soft text-m-ink" : match.status === "declined" ? "bg-m-ink/6 text-m-ink/60" : "bg-m-ink/6 text-m-ink/85")}>
          {STATUS[match.status]}{match.status !== "done" && <> · <DateText iso={match.on} /></>}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 pt-5 pb-4 sm:gap-4 sm:px-5">
        {side(home, "home")}
        <div className="flex flex-col items-center gap-1">
          {match.score ? (
            <span className="flex items-baseline gap-2 font-bold text-m-ink tabular-nums">
              <span className={cn(big ? "text-4xl sm:text-5xl" : "text-3xl", o === "home" && "text-m-blue")}><Num value={match.score.home} /></span>
              <span className="text-m-ink/40">–</span>
              <span className={cn(big ? "text-4xl sm:text-5xl" : "text-3xl", o === "away" && "text-m-blue")}><Num value={match.score.away} /></span>
            </span>
          ) : (
            <span className="relative grid size-12 place-items-center rounded-full bg-m-yellow text-sm font-black tracking-wider text-m-ink ring-6 ring-m-blue/15 sm:size-14">
              <span className="absolute inset-0 rounded-full bg-m-yellow/40 motion-safe:animate-ping" aria-hidden />
              <span className="relative">VS</span>
            </span>
          )}
          <span className="text-[11px] font-semibold text-m-ink/55">{o === "draw" ? "ড্র" : match.score ? format.unit : ""}</span>
        </div>
        {side(away, "away")}
      </div>

      <div className="space-y-2 border-t border-m-ink/9 px-4 py-4 sm:px-5">
        <h3 className="text-base leading-snug font-bold text-m-ink">{match.title}</h3>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-m-ink/65">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden /><DateText iso={match.on} weekday /></span>
          {match.place && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{match.place}</span>}
        </p>
        {match.rules && <p className="text-sm leading-relaxed text-m-ink/80">{match.rules}</p>}
        {match.stake && (
          <p className="inline-flex items-start gap-1.5 rounded-xl bg-m-yellow/10 px-3 py-1.5 text-xs font-semibold text-m-blue ring-1 ring-m-blue/30">
            <Flag className="mt-0.5 size-3.5 shrink-0" aria-hidden /> বাজি: {match.stake}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs text-m-ink/55">{sender ? `চ্যালেঞ্জ দিয়েছেন ${sender.nameBn}` : ""}</span>
          <div className="flex flex-wrap gap-2">
            {match.status === "invited" && me?.side === "away" && (
              <>
                <button type="button" onClick={() => answer(false)} className={mediaButton({ variant: "ghost", size: "sm" })}><X aria-hidden /> না</button>
                <button type="button" onClick={() => answer(true)} className={mediaButton({ variant: "primary", size: "sm" })}><Check aria-hidden /> গ্রহণ করুন</button>
              </>
            )}
            {match.status === "invited" && me?.side === "home" && <span className="text-xs font-semibold text-m-ink/65">{away?.name ?? "প্রতিপক্ষ"}-এর উত্তরের অপেক্ষায়</span>}
            {match.status === "accepted" && me && <button type="button" onClick={() => setScoring(true)} className={mediaButton({ variant: "green", size: "sm" })}><Flag aria-hidden /> ফল লিখুন</button>}
            {match.status === "done" && match.postId && <Link href={`/media/post/${match.postId}`} className="inline-flex h-9 items-center gap-1 text-sm font-bold text-m-blue hover:underline">ফিডে দেখুন <ArrowUpRight className="size-4" aria-hidden /></Link>}
            {match.status === "done" && !match.postId && me && <button type="button" onClick={share} className={mediaButton({ variant: "outline", size: "sm" })}><Share2 aria-hidden /> ফিডে শেয়ার</button>}
          </div>
        </div>
      </div>
      {me && match.status === "accepted" && <ResultDialog open={scoring} onOpenChange={setScoring} match={match} all={all} me={me} />}
    </article>
  );
}
