"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Swords } from "lucide-react";
import type { Team } from "@/data/media/types";
import { sideOf, sortMatches, standings } from "@/lib/media/team-match";
import { useHydrated } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";
import { LeagueTable } from "./arena";
import { ChallengeDialog } from "./match-dialogs";
import { useAllTeams, useMatches, useMyTeams } from "./use-matches";
import { VersusCard } from "./versus";

/** One team's টিম বনাম টিম: its record, its matches, and a way to challenge or be challenged. */
export function MatchesTab({ team, canEdit }: { team: Team; canEdit: boolean }) {
  const hydrated = useHydrated();
  const matches = useMatches();
  const all = useAllTeams();
  const mine = useMyTeams();
  const [open, setOpen] = useState(false);
  const table = standings(matches, [...all.keys()]);
  const at = table.findIndex((r) => r.team === team.id);
  const row = table[at];
  const list = sortMatches(matches.filter((m) => sideOf(m, team.id) && m.status !== "declined"));
  const canChallenge = canEdit || mine.some((t) => t.id !== team.id);

  const stats = [
    { label: "অবস্থান", value: row ? <>#<Num value={at + 1} /></> : "—" },
    { label: "খেলা", value: <Num value={row?.played ?? 0} /> },
    { label: "জয়", value: <Num value={row?.w ?? 0} /> },
    { label: "ড্র", value: <Num value={row?.d ?? 0} /> },
    { label: "হার", value: <Num value={row?.l ?? 0} /> },
    { label: "পয়েন্ট", value: <Num value={row?.points ?? 0} />, gold: true },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="min-w-0 space-y-5">
        <div className="flex flex-col gap-4 rounded-3xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-m-ink"><Swords className="size-5 text-m-blue" aria-hidden /> {team.name}-এর লড়াই</p>
              <p className="mt-0.5 text-sm text-m-ink/65">{canEdit ? "অন্য দলকে ডাকুন — খেলা, কুইজ, বানানোর লড়াই বা ভালো কাজের প্রতিযোগিতা।" : "এই দলের সাথে লড়তে চান? আপনার দল থেকে চ্যালেঞ্জ পাঠান।"}</p>
            </div>
            {hydrated && canChallenge ? (
              <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary" })}><Swords aria-hidden /> {canEdit ? "অন্য দলকে চ্যালেঞ্জ দিন" : "এই দলকে চ্যালেঞ্জ দিন"}</button>
            ) : hydrated ? (
              <Link href="/media/together?v=teams" className={mediaButton({ variant: "outline" })}><Plus aria-hidden /> আগে টিম বানান</Link>
            ) : null}
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-m-ink/3 py-3 text-center ring-1 ring-m-ink/7">
                <dt className="text-[11px] font-semibold text-m-ink/60">{s.label}</dt>
                <dd className={s.gold ? "text-2xl font-bold text-m-blue" : "text-2xl font-bold text-m-ink"}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-m-ink/10 p-6 text-center text-sm text-m-ink/65">এখনো কোনো লড়াই হয়নি। প্রথম চ্যালেঞ্জটা দিয়ে দেখুন, কে জেতে!</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">{list.map((m) => <VersusCard key={m.id} match={m} all={all} mine={mine} />)}</div>
        )}
      </div>
      <LeagueTable rows={table} all={all} mine={mine} highlight={team.id} />

      <ChallengeDialog open={open} onOpenChange={setOpen} from={canEdit ? team.id : undefined} to={canEdit ? undefined : team.id} />
    </div>
  );
}
