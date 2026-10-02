"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookHeart, Flag, Newspaper, Send, Swords } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { teamKindBn } from "@/data/media/teams";
import type { Team } from "@/data/media/types";
import { currentUser, getPerson } from "@/data/media/users";
import {
  challengeProblem, FORMATS, formatsFor, matchProblems, parseScore, recordResult, RULES_MAX, STAKE_MAX, TITLE_MAX, type MatchFormat, type TeamMatch,
} from "@/lib/media/team-match";
import { newId, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { selectClass } from "../ui/field-styles";
import { useFormat } from "../ui/numerals";
import { bdToday } from "../research/use-research";
import { addMatch, editMatch, resultToJourney, shareResult, useAllTeams, useMatches, useMyTeams } from "./use-matches";

const PLACEHOLDER: Record<MatchFormat, string> = {
  match: "যেমন: শুক্রবারের টি-টোয়েন্টি",
  scrim: "যেমন: বেস্ট অফ থ্রি, এরাঙ্গেল",
  build: "যেমন: ৬ ঘণ্টায় কম খরচের পানির ফিল্টার",
  quiz: "যেমন: বিজ্ঞান কুইজ নাইট",
  service: "যেমন: এক দিনে কে বেশি গাছ লাগায়",
};

/**
 * Challenge another team. `from` fixes the viewer's side (inside its room),
 * `to` fixes the opponent (inside theirs); otherwise both are chosen here.
 */
export function ChallengeDialog({ open, onOpenChange, from, to }: { open: boolean; onOpenChange: (o: boolean) => void; from?: string; to?: string }) {
  const hydrated = useHydrated();
  const mine = useMyTeams();
  const all = useAllTeams();
  const matches = useMatches();
  const today = bdToday(new Date());
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [format, setFormat] = useState<MatchFormat>("quiz");
  const [title, setTitle] = useState("");
  const [on, setOn] = useState("");
  const [place, setPlace] = useState("");
  const [stake, setStake] = useState("");
  const [rules, setRules] = useState("");
  const [tried, setTried] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  const homeId = from ?? home;
  const awayId = to ?? away;
  const homeTeam = all.get(homeId);
  const awayTeam = all.get(awayId);
  const formats = homeTeam && awayTeam ? formatsFor(homeTeam.kind, awayTeam.kind) : (Object.keys(FORMATS) as MatchFormat[]);
  const opponents = [...all.values()].filter((t) => t.id !== homeId);

  // A fresh form each time it opens, with the first of the viewer's teams picked.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setHome(mine.find((t) => t.id !== to)?.id ?? "");
      setAway("");
      setFormat("quiz");
      setTitle("");
      setOn("");
      setPlace("");
      setStake("");
      setRules("");
      setTried(false);
    }
  }

  const pairing = challengeProblem(homeId, awayId, matches);
  const problems = matchProblems({ title, on, rules, stake }, today);

  function pickOpponent(id: string) {
    setAway(id);
    const t = all.get(id);
    if (t && homeTeam) setFormat(formatsFor(homeTeam.kind, t.kind)[0]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (pairing || Object.values(problems).some(Boolean)) return;
    const m: TeamMatch = {
      id: newId("mt"),
      format,
      title: title.trim(),
      home: homeId,
      away: awayId,
      on,
      ...(place.trim() ? { place: place.trim() } : {}),
      ...(rules.trim() ? { rules: rules.trim() } : {}),
      ...(stake.trim() ? { stake: stake.trim() } : {}),
      status: "invited",
      by: currentUser.handle,
      at: new Date().toISOString(),
    };
    if (!addMatch(m)) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    onOpenChange(false);
    const lead = awayTeam && getPerson(awayTeam.lead);
    toast.success(`${awayTeam?.name ?? "প্রতিপক্ষ"}-কে চ্যালেঞ্জ পাঠানো হলো`, { description: `${lead?.nameBn ?? "দলের লিডার"} গ্রহণ করলে খেলা পাকা।` });
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  const err = (msg?: string) => tried && msg && <span className="mt-1 block text-xs font-semibold text-crimson-bright">{msg}</span>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><Swords className="size-5 text-signal-orange" aria-hidden /> অন্য দলকে চ্যালেঞ্জ দিন</DialogTitle>
          <DialogDescription>খেলা, কুইজ, বানানোর লড়াই — বা কে বেশি ভালো কাজ করে। ওরা গ্রহণ করলে খেলা পাকা, ফল উঠবে লিগ টেবিলে।</DialogDescription>
        </DialogHeader>

        {mine.length === 0 && hydrated ? (
          <p className="rounded-2xl bg-text-primary p-4 text-sm text-white/80 ring-1 ring-white/12">চ্যালেঞ্জ দিতে আগে একটা টিম বানান, বা গোপন কী দিয়ে কোনো টিমে যোগ দিন।</p>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>আপনার দল</span>
                {from ? (
                  <span className="flex h-11 items-center rounded-xl bg-white/6 px-3 text-sm font-bold text-white ring-1 ring-white/12">{homeTeam?.name}</span>
                ) : (
                  <select value={home} onChange={(e) => setHome(e.target.value)} className={selectClass}>
                    {mine.filter((t) => t.id !== to).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </label>
              <label className="block">
                <span className={label}>প্রতিপক্ষ</span>
                {to ? (
                  <span className="flex h-11 items-center rounded-xl bg-white/6 px-3 text-sm font-bold text-white ring-1 ring-white/12">{awayTeam?.name}</span>
                ) : (
                  <select value={away} onChange={(e) => pickOpponent(e.target.value)} className={selectClass} aria-invalid={tried && Boolean(pairing)}>
                    <option value="">দল বাছুন</option>
                    {opponents.map((t) => <option key={t.id} value={t.id}>{t.name} · {teamKindBn[t.kind]}</option>)}
                  </select>
                )}
              </label>
            </div>
            {err(pairing)}

            <fieldset>
              <legend className={label}>কিসের লড়াই?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {formats.map((f, i) => {
                  const picked = format === f;
                  return (
                    <label key={f} className={cn("flex cursor-pointer flex-col gap-0.5 rounded-xl p-3 ring-2 transition-colors", picked ? "bg-signal-orange/10 ring-signal-orange" : "ring-white/12 hover:ring-white/30")}>
                      <input type="radio" name="match-format" className="sr-only" checked={picked} onChange={() => setFormat(f)} />
                      <span className={cn("flex items-center gap-2 text-sm font-bold", picked ? "text-signal-orange" : "text-white")}>
                        {FORMATS[f].bn}
                        {i === 0 && homeTeam && awayTeam && <span className="rounded-full bg-bd-green px-2 py-0.5 text-[10px] text-white">মানানসই</span>}
                      </span>
                      <span className="text-xs leading-snug text-white/65">{FORMATS[f].hint}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className={label}>লড়াইয়ের নাম *</span>
              <Input value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={PLACEHOLDER[format]} aria-invalid={tried && Boolean(problems.title)} />
              {err(problems.title)}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>কবে *</span>
                <Input type="date" value={on} min={hydrated ? today : undefined} onChange={(e) => setOn(e.target.value)} aria-invalid={tried && Boolean(problems.on)} />
                {err(problems.on)}
              </label>
              <label className="block">
                <span className={label}>কোথায়</span>
                <Input value={place} maxLength={80} onChange={(e) => setPlace(e.target.value)} placeholder="মাঠ, ল্যাব, বা অনলাইন" />
              </label>
            </div>
            <label className="block">
              <span className={label}>নিয়ম</span>
              <Textarea rows={3} value={rules} maxLength={RULES_MAX} onChange={(e) => setRules(e.target.value)} placeholder="সময়, কতজন খেলবে, কে বিচার করবে, কীভাবে গোনা হবে" />
              {err(problems.rules)}
            </label>
            <label className="block">
              <span className={label}>বাজি (বন্ধুত্বপূর্ণ)</span>
              <Input value={stake} maxLength={STAKE_MAX} onChange={(e) => setStake(e.target.value)} placeholder="যেমন: হারলে ১০টা গাছ লাগাবে" />
              <span className="mt-1 block text-xs text-white/55">টাকার বাজি নয় — ভালো কাজ বা মজার কিছু।</span>
              {err(problems.stake)}
            </label>
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}><Send aria-hidden /> চ্যালেঞ্জ পাঠান</button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Record the score of an accepted match; optionally tell the feed and the team's journey. */
export function ResultDialog({ open, onOpenChange, match, all, me }: { open: boolean; onOpenChange: (o: boolean) => void; match: TeamMatch; all: Map<string, Team>; me: { team: Team; side: "home" | "away" } }) {
  const router = useRouter();
  const { num } = useFormat();
  const [h, setH] = useState("");
  const [a, setA] = useState("");
  const [toFeed, setToFeed] = useState(true);
  const [toJourney, setToJourney] = useState(true);
  const [tried, setTried] = useState(false);
  const home = all.get(match.home);
  const away = all.get(match.away);
  const hs = parseScore(h);
  const as = parseScore(a);
  const unit = FORMATS[match.format].unit;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (hs === undefined || as === undefined) return;
    const done = recordResult(match, hs, as, new Date().toISOString());
    if (!editMatch(match.id, () => done)) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    if (toJourney) resultToJourney(done, me.team, all, me.side, num);
    const postId = toFeed ? shareResult(done, me.team, all, num) : undefined;
    onOpenChange(false);
    toast.success("ফল লেখা হলো — লিগ টেবিল বদলেছে", postId ? { action: { label: "ফিডে দেখুন", onClick: () => router.push(`/media/post/${postId}`) } } : undefined);
  }

  const toggle = (on: boolean, flip: () => void, Icon: typeof Flag, title: string, hint: string) => (
    <button type="button" aria-pressed={on} onClick={flip} className={cn("flex min-h-14 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold ring-2 transition-colors", on ? "bg-signal-orange/10 text-signal-orange ring-signal-orange" : "text-white/70 ring-white/12 hover:ring-white/30")}>
      <Icon className="size-5 shrink-0" aria-hidden />
      <span>{title}<span className="block text-xs font-normal opacity-80">{hint}</span></span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><Flag className="size-5 text-signal-orange" aria-hidden /> ফল লিখুন</DialogTitle>
          <DialogDescription>{match.title} — দুই দল যে ফল মেনে নিয়েছে, সেটাই লিখুন।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
            <label className="block text-center">
              <span className="mb-1.5 line-clamp-2 block text-sm font-bold text-white">{home?.name}</span>
              <Input inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="০" className="h-16 text-center text-3xl font-bold" aria-label={`${home?.name ?? "প্রথম দল"} — ${unit}`} aria-invalid={tried && hs === undefined} />
            </label>
            <span className="pb-4 text-2xl font-bold text-white/40">–</span>
            <label className="block text-center">
              <span className="mb-1.5 line-clamp-2 block text-sm font-bold text-white">{away?.name}</span>
              <Input inputMode="numeric" value={a} onChange={(e) => setA(e.target.value)} placeholder="০" className="h-16 text-center text-3xl font-bold" aria-label={`${away?.name ?? "দ্বিতীয় দল"} — ${unit}`} aria-invalid={tried && as === undefined} />
            </label>
          </div>
          <p className="-mt-2 text-center text-xs text-white/55">{unit} · ০ থেকে ৯৯৯</p>
          {tried && (hs === undefined || as === undefined) && <p role="alert" className="text-center text-xs font-semibold text-crimson-bright">দুই দলের {unit} পূর্ণ সংখ্যায় লিখুন।</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {toggle(toFeed, () => setToFeed((x) => !x), Newspaper, "ফিডে শেয়ার", "সবাই ফল দেখবে")}
            {toggle(toJourney, () => setToJourney((x) => !x), BookHeart, "টিমের যাত্রায় লিখুন", `${me.team.name}-এর টাইমলাইনে`)}
          </div>
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}><Flag aria-hidden /> ফল রাখুন</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
