"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Copy, Crown, Flag, KeyRound, MapPin, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { teamKindBn } from "@/data/media/teams";
import type { Team } from "@/data/media/types";
import { currentUser, getPerson } from "@/data/media/users";
import { goalProgress, type TeamRoom } from "@/lib/media/team-room";
import { isFull } from "@/lib/media/teams";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { JourneyTab, StoryDialog } from "./journey";
import { KIND_ICON } from "./kind-icon";
import { MatchesTab } from "./matches-tab";
import { MissionGoalsTab } from "./mission-goals";
import { useCanEdit, useTeam, useTeamRoom } from "./use-team-room";

const TABS = [
  { key: "journey", label: "যাত্রা ও গল্প" },
  { key: "mission", label: "মিশন ও লক্ষ্য" },
  { key: "matches", label: "টিম বনাম টিম" },
  { key: "members", label: "সদস্য" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/** A team's own room, the way a class has one: journey, mission and goals, members. */
export function TeamRoomView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const team = useTeam(id);
  const room = useTeamRoom(id);
  const canEdit = useCanEdit(team);
  const [tab, setTab] = useState<TabKey>("journey");
  const [writing, setWriting] = useState<"journey" | "story" | null>(null);
  const reduce = useReducedMotion();

  if (!team) {
    return hydrated ? (
      <EmptyState icon="posts" title="টিম পাওয়া যায়নি" body="লিংকটি পুরোনো, অথবা টিমটি অন্য অ্যাকাউন্টে তৈরি।" action={<Link href="/media/together?v=teams" className={mediaButton()}>সব টিম</Link>} />
    ) : (
      <Skeleton className="h-80 rounded-3xl" />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Hero team={team} room={room} canEdit={canEdit} onWrite={() => setWriting("journey")} onTab={setTab} />

      <nav aria-label="টিম রুমের অংশ" className="sticky top-[var(--sticky-top,4rem)] z-30 -mx-3 bg-white/90 px-3 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-2">
        <ul className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "relative isolate min-h-10 rounded-xl px-4 text-sm font-bold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-200 active:scale-95",
                  tab === t.key ? "text-m-ink" : "text-m-ink/75 hover:text-m-ink",
                )}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="team-tab"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-m-yellow shadow-[0_10px_24px_-14px_var(--color-signal-orange)]"
                    aria-hidden
                  />
                )}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div key={tab} className="live-in">
        {tab === "journey" && <JourneyTab team={team} room={room} canEdit={canEdit} onWrite={setWriting} />}
        {tab === "mission" && <MissionGoalsTab team={team} room={room} canEdit={canEdit} />}
        {tab === "matches" && <MatchesTab team={team} canEdit={canEdit} />}
        {tab === "members" && <MembersTab team={team} canEdit={canEdit} />}
      </div>

      {canEdit && <StoryDialog team={team} kind={writing} onOpenChange={(o) => !o && setWriting(null)} />}
    </div>
  );
}

function useCount(team: Team) {
  const status = useMediaState((s) => s.teamStatus[team.id]);
  const founding = team.lead === currentUser.handle || team.members.includes(currentUser.handle);
  return team.memberCount + (status === "member" && !founding ? 1 : 0);
}

function Hero({ team, room, canEdit, onWrite, onTab }: { team: Team; room: TeamRoom; canEdit: boolean; onWrite: () => void; onTab: (t: TabKey) => void }) {
  const count = useCount(team);
  const { done, total, pct } = goalProgress(room.goals);
  const Icon = KIND_ICON[team.kind];
  const lead = getPerson(team.lead);
  const journeys = room.stories.filter((s) => s.kind === "journey").length;

  return (
    <section className="live-in overflow-hidden rounded-3xl bg-m-yellow text-m-ink shadow-[0_30px_70px_-40px_var(--color-signal-orange)]">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 space-y-4 p-5 sm:p-8">
          <Link href="/media/together?v=teams" className="group inline-flex items-center gap-1.5 text-sm font-bold">
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden /> সব টিম
          </Link>
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-m-card px-2.5 py-1 text-m-blue"><Icon className="size-3.5" aria-hidden /> {teamKindBn[team.kind]}</span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-m-ink/30"><MapPin className="size-3.5" aria-hidden /> {team.district}</span>
            {canEdit && <span className="rounded-full bg-m-card/10 px-2.5 py-1 ring-1 ring-m-ink/25">আপনার টিম</span>}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]">{team.name}</h1>
          <p className="max-w-[56ch] text-[15px] leading-relaxed font-medium text-m-ink/80">{team.about}</p>
          {room.mission && (
            <button type="button" onClick={() => onTab("mission")} className="block max-w-[56ch] rounded-2xl bg-m-card px-4 py-3 text-left text-m-ink shadow-m-ink transition-[translate] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
              <span className="block text-xs font-bold text-m-blue">মিশন</span>
              <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed font-semibold">{room.mission}</span>
            </button>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {canEdit ? (
              <button type="button" onClick={onWrite} className={mediaButton({ variant: "tile", size: "lg" })}><Flag aria-hidden /> যাত্রা লিখুন</button>
            ) : (
              <Link href={`/media/together?v=teams#${team.id}`} className={mediaButton({ variant: "tile", size: "lg" })}><UserPlus aria-hidden /> যোগ দিতে চাই</Link>
            )}
            {lead && (
              <Link href={`/media/u/${lead.handle}`} className="inline-flex h-12 items-center gap-2 rounded-xl px-3 text-sm font-bold ring-1 ring-m-ink/30 transition-colors hover:bg-m-card/10">
                <PersonAvatar person={lead} size="xs" /> <Crown className="size-4" aria-hidden /> {lead.nameBn}
              </Link>
            )}
          </div>
        </div>

        <div className="relative min-h-60 bg-m-card">
          {team.cover ? (
            <Image src={team.cover} alt="" fill priority sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center bg-m-blue-soft" aria-hidden><Icon className="size-28 text-m-ink/15" /></span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" aria-hidden />
          <ul className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 sm:inset-x-5 sm:bottom-5">
            <Stat label="লক্ষ্য পূরণ" onClick={() => onTab("mission")}>
              <Ring pct={pct} /> <span className="sr-only"><Num value={done} />/<Num value={total} /></span>
            </Stat>
            <Stat label="মাইলফলক" onClick={() => onTab("journey")}><Num value={journeys} /></Stat>
            <Stat label="সদস্য" onClick={() => onTab("members")}><Num value={count} />{team.limit ? <span className="text-sm text-m-ink/60">/<Num value={team.limit} /></span> : null}</Stat>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl bg-white/85 ring-1 ring-m-ink/13 backdrop-blur-md">
      <button type="button" onClick={onClick} className="flex w-full flex-col items-center gap-0.5 rounded-2xl px-2 py-3 text-center transition-colors hover:bg-m-ink/6">
        <span className="flex items-center gap-1 text-2xl leading-none font-bold text-m-ink">{children}</span>
        <span className="text-[11px] font-semibold text-m-ink/70">{label}</span>
      </button>
    </li>
  );
}

/** Goals met, as a small ring with the percentage inside. */
function Ring({ pct }: { pct: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-11 place-items-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-signal-orange)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="meter-fill" />
      </svg>
      <span className="text-[11px] font-bold"><Num value={pct} />%</span>
    </span>
  );
}

function MembersTab({ team, canEdit }: { team: Team; canEdit: boolean }) {
  const count = useCount(team);
  const status = useMediaState((s) => s.teamStatus[team.id]);
  const known = team.members.map((h) => getPerson(h)).filter((p) => p !== undefined);
  const youJoined = status === "member" && !team.members.includes(currentUser.handle) && team.lead !== currentUser.handle;
  const people = youJoined ? [...known, currentUser] : known;
  const full = isFull(team.limit, count);
  const unseen = Math.max(0, count - people.length);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <section aria-labelledby="members-title" className="rounded-3xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
        <h2 id="members-title" className="text-xl font-bold text-m-ink">সদস্য · <Num value={count} /> জন</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {people.map((p) => (
            <li key={p.handle}>
              <Link href={`/media/u/${p.handle}`} className="flex items-center gap-3 rounded-2xl p-2.5 ring-1 ring-m-ink/9 transition-colors hover:bg-m-ink/3 hover:ring-m-ink/21">
                <PersonAvatar person={p} size="md" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-m-ink">{p.nameBn}{p.handle === currentUser.handle && " (আপনি)"}</span>
                  <span className="flex items-center gap-1 text-xs text-m-ink/65">
                    {p.handle === team.lead ? <><Crown className="size-3.5 text-m-blue" aria-hidden /> টিম লিডার</> : "সদস্য"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {unseen > 0 && <p className="mt-3 text-sm text-m-ink/60">আরও <Num value={unseen} /> জন সদস্য প্ল্যাটফর্মের বাইরে থেকে যুক্ত।</p>}
      </section>

      <aside className="space-y-3">
        {team.limit !== undefined && (
          <div className="rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
            <p className="mb-1.5 flex justify-between text-sm font-semibold">
              <span className="text-m-ink/75">আসন</span>
              <span className={full ? "text-m-red" : "text-m-blue"}>{full ? "পূর্ণ" : <><Num value={team.limit - count} />টি খালি</>}</span>
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-m-ink/6">
              <div className={cn("h-full rounded-full", full ? "bg-m-red" : "bg-m-yellow")} style={{ width: `${Math.min(100, (count / team.limit) * 100)}%` }} />
            </div>
          </div>
        )}
        {canEdit && team.code && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(team.code!).then(() => toast.success("গোপন কী কপি হলো", { description: "শুধু যাকে চান তাকে দিন।" }), () => {})}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-m-yellow p-4 text-left text-m-ink transition-[scale] duration-150 active:scale-[0.98]"
          >
            <span>
              <span className="flex items-center gap-1.5 text-sm font-bold"><KeyRound className="size-4" aria-hidden /> গোপন কী</span>
              <span className="mt-0.5 block font-mono text-xl font-bold tracking-[0.3em]">{team.code}</span>
            </span>
            <Copy className="size-5" aria-hidden />
          </button>
        )}
        {team.tags.length > 0 && <p className="flex flex-wrap gap-x-2 px-1 text-sm font-medium text-m-blue">{team.tags.map((t) => <span key={t}>{t}</span>)}</p>}
      </aside>
    </div>
  );
}
