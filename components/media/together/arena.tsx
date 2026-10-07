"use client";

import Link from "next/link";
import { useState } from "react";
import { Crown, Swords, Trophy } from "lucide-react";
import type { Team } from "@/data/media/types";
import { isOpen, sortMatches, standings, type Standing, type TeamMatch } from "@/lib/media/team-match";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";
import { ChallengeDialog } from "./match-dialogs";
import { useAllTeams, useMatches, useMyTeams, mySide } from "./use-matches";
import { TeamBadge, VersusCard } from "./versus";

/** টিম বনাম টিম on the hub: invites for the viewer, matches coming up, results, and the league table. */
export function Arena() {
  const matches = useMatches();
  const all = useAllTeams();
  const mine = useMyTeams();
  const [open, setOpen] = useState(false);
  const order = [...all.keys()];
  const table = standings(matches, order);
  const sorted = sortMatches(matches.filter((m) => m.status !== "declined"));
  const forMe = sorted.filter((m) => m.status === "invited" && mySide(m, mine)?.side === "away");
  const upcoming = sorted.filter((m) => isOpen(m) && !forMe.includes(m));
  const results = sorted.filter((m) => m.status === "done").slice(0, 4);

  return (
    <section aria-labelledby="arena-title" className="space-y-5">
      <div className="relative isolate overflow-hidden rounded-3xl bg-m-yellow p-5 text-m-ink sm:p-7">
        <Swords className="pointer-events-none absolute -right-4 -bottom-6 -z-10 size-40 text-m-ink/10 motion-safe:animate-[spin_40s_linear_infinite] sm:size-52" aria-hidden />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm font-bold">টিম ও গ্রুপ · মুখোমুখি</p>
            <h2 id="arena-title" className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">টিম বনাম টিম</h2>
            <p className="mt-1.5 text-sm font-medium text-m-ink/80">যেকোনো দল যেকোনো দলকে চ্যালেঞ্জ দিতে পারে — খেলা, কুইজ, বানানোর লড়াই, বা কে বেশি গাছ লাগায়। জিতলে ৩, ড্র হলে ১ পয়েন্ট।</p>
          </div>
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "tile", size: "lg" })}><Swords aria-hidden /> অন্য দলকে চ্যালেঞ্জ দিন</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          {forMe.length > 0 && (
            <MatchList title="আপনার দলের জন্য চ্যালেঞ্জ" hint="গ্রহণ করলে খেলা পাকা" list={forMe} all={all} mine={mine} accent />
          )}
          <MatchList title="সামনের লড়াই" hint="আমন্ত্রণ আর পাকা খেলা, তারিখ ধরে" list={upcoming} all={all} mine={mine} empty="এখন কোনো লড়াই ঠিক হয়নি — প্রথম চ্যালেঞ্জটা আপনার দলই দিক।" />
          <MatchList title="সাম্প্রতিক ফল" list={results} all={all} mine={mine} empty="এখনো কোনো খেলা শেষ হয়নি।" />
        </div>
        <LeagueTable rows={table} all={all} mine={mine} />
      </div>

      <ChallengeDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}

function MatchList({ title, hint, list, all, mine, empty, accent }: { title: string; hint?: string; list: TeamMatch[]; all: Map<string, Team>; mine: Team[]; empty?: string; accent?: boolean }) {
  if (list.length === 0 && !empty) return null;
  return (
    <div className="space-y-3">
      <h3 className={cn("flex flex-wrap items-baseline gap-x-2 text-xl font-bold", accent ? "text-m-blue" : "text-m-ink")}>
        {title}
        {hint && <span className="text-sm font-medium text-m-ink/55">{hint}</span>}
      </h3>
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-m-ink/10 p-5 text-center text-sm text-m-ink/65">{empty}</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">{list.map((m) => <VersusCard key={m.id} match={m} all={all} mine={mine} />)}</div>
      )}
    </div>
  );
}

/** Win 3, draw 1; the viewer's teams are marked. */
export function LeagueTable({ rows, all, mine, highlight }: { rows: Standing[]; all: Map<string, Team>; mine: Team[]; highlight?: string }) {
  const myIds = new Set(mine.map((t) => t.id));
  return (
    <section aria-labelledby="league-title" className="overflow-hidden rounded-3xl bg-m-card ring-1 ring-m-ink/10 lg:sticky lg:top-[calc(var(--sticky-top,4rem)+4.5rem)] shadow-m-tile">
      <h3 id="league-title" className="flex items-center gap-2 px-5 pt-5 text-lg font-bold text-m-ink"><Trophy className="size-5 text-m-blue" aria-hidden /> লিগ টেবিল</h3>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-m-ink/65">খেলা শেষ হলে এখানে দলগুলোর অবস্থান উঠবে।</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">টিম বনাম টিম লিগ: খেলা, জয়, ড্র, হার আর পয়েন্ট</caption>
          <thead>
            <tr className="text-[11px] font-semibold text-m-ink/55">
              <th scope="col" className="w-8 py-2 pl-5 text-left font-semibold">#</th>
              <th scope="col" className="py-2 text-left font-semibold">দল</th>
              <th scope="col" className="w-7 py-2 text-center font-semibold" title="খেলা"><abbr title="খেলা" className="no-underline">খে</abbr></th>
              <th scope="col" className="w-7 py-2 text-center font-semibold" title="জয়"><abbr title="জয়" className="no-underline">জ</abbr></th>
              <th scope="col" className="w-7 py-2 text-center font-semibold" title="ড্র"><abbr title="ড্র" className="no-underline">ড্র</abbr></th>
              <th scope="col" className="w-7 py-2 text-center font-semibold" title="হার"><abbr title="হার" className="no-underline">হা</abbr></th>
              <th scope="col" className="w-14 py-2 pr-5 text-right font-semibold">পয়েন্ট</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const team = all.get(r.team);
              const mineRow = myIds.has(r.team);
              return (
                <tr key={r.team} className={cn("border-t border-m-ink/7", (highlight ? highlight === r.team : mineRow) && "bg-m-yellow/10")}>
                  <td className="py-2.5 pl-5 font-bold text-m-ink/70 tabular-nums">{i === 0 ? <Crown className="size-4 fill-m-yellow text-m-gold" aria-label="১ নম্বর" /> : <Num value={i + 1} />}</td>
                  <td className="max-w-0 py-2.5">
                    <Link href={`/media/together/team/${r.team}`} className="flex min-w-0 items-center gap-2 font-semibold text-m-ink hover:text-m-blue">
                      <TeamBadge team={team} size="sm" ring={mineRow ? "ring-m-blue/70" : "ring-m-ink/9"} />
                      <span className="truncate">{team?.name ?? r.team}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 text-center text-m-ink/75 tabular-nums"><Num value={r.played} /></td>
                  <td className="py-2.5 text-center text-m-ink/75 tabular-nums"><Num value={r.w} /></td>
                  <td className="py-2.5 text-center text-m-ink/75 tabular-nums"><Num value={r.d} /></td>
                  <td className="py-2.5 text-center text-m-ink/75 tabular-nums"><Num value={r.l} /></td>
                  <td className="py-2.5 pr-5 text-right text-base font-bold text-m-blue tabular-nums"><Num value={r.points} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="px-5 py-4 text-xs text-m-ink/50">জয় ৩ · ড্র ১ · সমান হলে স্কোরের ব্যবধান, তারপর জয়ের সংখ্যা।</p>
    </section>
  );
}
