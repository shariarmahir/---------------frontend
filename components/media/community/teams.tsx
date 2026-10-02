"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarClock, Clock, Copy, DoorOpen, Eye, EyeOff, FlaskConical, Gamepad2, KeyRound, Lock, MapPin, Medal, Plus, Trophy, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { districts } from "@/data/media/districts";
import { teamKindBn, teamKindHint, teams } from "@/data/media/teams";
import type { EsportsProfile, LabProfile, SportsProfile, Team, TeamKind } from "@/data/media/types";
import { currentUser, getPerson } from "@/data/media/users";
import { newJoinCode, validJoinCode } from "@/lib/media/classroom";
import { teamSchema, type TeamInput } from "@/lib/media/schemas";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { ESPORTS_GAMES, isFull, rosterSize, winRate, type GameId } from "@/lib/media/teams";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { useRequireAccount } from "@/components/auth/use-require-account";

/** Did the viewer join (not lead or seed member)? Then they hold one more seat. */
function useSeat(team: Team) {
  const status = useMediaState((s) => s.teamStatus[team.id]);
  const founding = team.lead === currentUser.handle || team.members.includes(currentUser.handle);
  const joined = status === "member" && !founding;
  const count = team.memberCount + (joined ? 1 : 0);
  return { status, mine: founding || status === "member", joined, count, full: isFull(team.limit, count) };
}

export function TeamCard({ team }: { team: Team }) {
  const ensure = useRequireAccount();
  const { status, mine, joined, count, full } = useSeat(team);
  const lead = getPerson(team.lead) ?? currentUser;
  const known = team.members.map((h) => getPerson(h)).filter((p) => p !== undefined);
  const esports = team.profile?.type === "esports" ? team.profile : undefined;

  function request() {
    if (!ensure("টিমে যোগ দিতে") || full) return;
    updateMedia((s) => ({ ...s, teamStatus: { ...s.teamStatus, [team.id]: "requested" } }));
    toast.success("যোগদানের অনুরোধ গেছে", { description: `${lead.nameBn} আপনার প্রোফাইল দেখে জানাবেন।` });
  }

  return (
    <article id={team.id} className="story-reveal flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-white/12 bg-text-primary transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-16/7 bg-white/10">
        {team.cover ? (
          <Image src={team.cover} alt="" fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />
        ) : esports ? (
          <span className="absolute inset-0 flex items-center justify-between gap-3 bg-black px-5" aria-hidden>
            <span className="text-2xl font-black tracking-tight text-signal-orange">{ESPORTS_GAMES[esports.game].name}</span>
            <Gamepad2 className="size-12 text-white/15" />
          </span>
        ) : (
          <span className="absolute inset-0 bg-bd-green" aria-hidden />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-signal-orange">{teamKindBn[team.kind]}</span>
        {esports && <span className="absolute top-3 right-3 rounded-full bg-signal-orange px-2.5 py-1 text-xs font-bold text-text-primary">{ESPORTS_GAMES[esports.game].platform}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-bold text-white"><Link href={`/media/together/team/${team.id}`} className="transition-colors hover:text-signal-orange">{team.name}</Link></h3>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-white/65">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={count} />{team.limit ? <>/<Num value={team.limit} /></> : null} জন</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{team.district}</span>
          </p>
        </div>
        <p className="text-sm leading-relaxed text-white/80">{team.about}</p>
        {team.limit !== undefined && <Seats limit={team.limit} count={count} />}
        {team.profile?.type === "lab" && <LabDetails lab={team.profile} />}
        {team.profile?.type === "sports" && <SportsDetails sports={team.profile} />}
        {esports && <Roster esports={esports} you={joined} />}
        <p className="flex flex-wrap gap-x-2 text-xs font-medium text-signal-orange">{team.tags.map((t) => <span key={t}>{t}</span>)}</p>
        <Link href={`/media/together/team/${team.id}`} className="group inline-flex min-h-9 items-center gap-1.5 self-start rounded-xl text-sm font-bold text-signal-orange">
          <DoorOpen className="size-4" aria-hidden /> {mine ? "টিম রুমে ঢুকুন" : "যাত্রা ও মিশন দেখুন"}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/12 pt-3">
          <span className="flex -space-x-2">
            {known.map((p) => (
              <Link key={p.handle} href={`/media/u/${p.handle}`} className="rounded-full ring-2 ring-text-primary" title={p.nameBn}>
                <PersonAvatar person={p} size="sm" />
              </Link>
            ))}
          </span>
          {mine ? (
            team.code ? <SecretKey code={team.code} /> : <span className="inline-flex min-h-9 items-center rounded-xl bg-white/10 px-3 text-sm font-semibold text-signal-orange">আপনার টিম</span>
          ) : full ? (
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-national-crimson px-3 text-sm font-bold text-white">দল পূর্ণ</span>
          ) : status === "requested" ? (
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white/80"><Clock className="size-4" aria-hidden />অনুরোধ গেছে</span>
          ) : team.open ? (
            <button type="button" onClick={request} className={mediaButton({ variant: "green", size: "sm" })}>
              <UserPlus aria-hidden /> যোগ দিতে চাই
            </button>
          ) : (
            <span className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-white/65"><Lock className="size-3.5" aria-hidden />শুধু গোপন কী দিয়ে</span>
          )}
        </div>
      </div>
    </article>
  );
}

/** Seats taken out of the limit; gold until the last seat, red when full. */
function Seats({ limit, count }: { limit: number; count: number }) {
  const left = Math.max(0, limit - count);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span className="text-white/70">আসন</span>
        <span className={left === 0 ? "text-crimson-bright" : "text-signal-orange"}>{left === 0 ? "পূর্ণ" : <><Num value={left} />টি খালি</>}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-[width] duration-700", left === 0 ? "bg-national-crimson" : "bg-signal-orange")} style={{ width: `${Math.min(100, (count / limit) * 100)}%` }} />
      </div>
    </div>
  );
}

const chip = "rounded-full px-2.5 py-0.5 text-xs font-semibold";

function LabDetails({ lab }: { lab: LabProfile }) {
  return (
    <div className="space-y-2.5 rounded-xl bg-black/40 p-3 text-xs ring-1 ring-white/10">
      <p className="flex items-center gap-1.5 font-bold text-white"><FlaskConical className="size-4 text-signal-orange" aria-hidden /> {lab.university}</p>
      {lab.supervisor && <p className="text-white/70">তত্ত্বাবধায়ক: {lab.supervisor}</p>}
      {lab.focus.length > 0 && <p className="flex flex-wrap gap-1.5">{lab.focus.map((f) => <span key={f} className={cn(chip, "bg-white/10 text-white/85")}>{f}</span>)}</p>}
      {lab.roles.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-white/70">যে পদে লোক নিচ্ছে</p>
          <p className="flex flex-wrap gap-1.5">{lab.roles.map((r) => <span key={r} className={cn(chip, "bg-signal-orange text-text-primary")}>{r}</span>)}</p>
        </div>
      )}
      {lab.equipment.length > 0 && <p className="text-white/60">যন্ত্রপাতি: {lab.equipment.join(" · ")}</p>}
      {lab.meets && <p className="flex items-center gap-1.5 text-white/70"><CalendarClock className="size-3.5" aria-hidden /> {lab.meets}</p>}
    </div>
  );
}

function SportsDetails({ sports }: { sports: SportsProfile }) {
  const { w, d, l } = sports.record;
  return (
    <div className="space-y-2.5 rounded-xl bg-black/40 p-3 text-xs ring-1 ring-white/10">
      <p className="flex items-center gap-1.5 font-bold text-white"><Medal className="size-4 text-signal-orange" aria-hidden /> {sports.sport} · {sports.ageGroup}</p>
      {w + d + l > 0 && (
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { label: "জয়", n: w, tone: "bg-bd-green text-white" },
            { label: "ড্র", n: d, tone: "bg-white/10 text-white" },
            { label: "হার", n: l, tone: "bg-national-crimson text-white" },
          ].map((x) => (
            <span key={x.label} className={cn("rounded-lg py-1.5", x.tone)}>
              <span className="block text-base font-bold"><Num value={x.n} /></span>
              {x.label}
            </span>
          ))}
          <span className="rounded-lg bg-signal-orange py-1.5 text-text-primary">
            <span className="block text-base font-bold"><Num value={winRate(sports.record)} />%</span>জয়ের হার
          </span>
        </div>
      )}
      {sports.practice && <p className="flex items-center gap-1.5 text-white/70"><CalendarClock className="size-3.5" aria-hidden /> অনুশীলন: {sports.practice}</p>}
      {sports.positions.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-white/70">লোক দরকার:</span>{sports.positions.map((p) => <span key={p} className={cn(chip, "bg-signal-orange text-text-primary")}>{p}</span>)}</p>
      )}
    </div>
  );
}

/** Starters, then substitutes; empty seats name the role they need. */
function Roster({ esports, you }: { esports: EsportsProfile; you: boolean }) {
  const game = ESPORTS_GAMES[esports.game];
  const filled = you ? [...esports.roster, { name: "আপনি", role: "নতুন সদস্য", sub: esports.roster.length >= game.starters }] : esports.roster;
  const seats = Array.from({ length: rosterSize(esports.game) }, (_, i) => {
    const sub = i >= game.starters;
    return filled[i] ?? { name: "", role: sub ? "সাব" : (game.roles[i] ?? "ফ্লেক্স"), sub };
  });
  return (
    <div className="space-y-2.5 rounded-xl bg-black/40 p-3 text-xs ring-1 ring-white/10">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/75">
        <span className="inline-flex items-center gap-1 font-bold text-white"><Gamepad2 className="size-4 text-signal-orange" aria-hidden /> র‍্যাংক: {esports.rank}</span>
        <span className="inline-flex items-center gap-1"><Trophy className="size-3.5 text-signal-orange" aria-hidden /><Num value={esports.wins} />টি টুর্নামেন্ট জয়</span>
      </p>
      <ul className="grid grid-cols-2 gap-1.5">
        {seats.map((s, i) => (
          <li key={i} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", s.name ? "bg-white/10" : "border border-dashed border-signal-orange/60")}>
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold", s.name ? (s.sub ? "bg-white/20 text-white" : "bg-signal-orange text-text-primary") : "text-signal-orange")}>
              {s.name ? s.name.charAt(0) : "+"}
            </span>
            <span className="min-w-0 leading-tight">
              <span className={cn("block truncate font-semibold", s.name ? "text-white" : "text-signal-orange")}>{s.name || "খালি"}</span>
              <span className="block truncate text-[11px] text-white/60">{s.role}{s.sub && s.name ? " · সাব" : ""}</span>
            </span>
          </li>
        ))}
      </ul>
      {esports.scrims && <p className="flex items-center gap-1.5 text-white/70"><CalendarClock className="size-3.5" aria-hidden /> স্ক্রিম: {esports.scrims}</p>}
    </div>
  );
}

const DEFAULT_LIMIT: Record<Exclude<TeamKind, "esports">, number> = { family: 10, lab: 25, project: 8, travel: 15, sports: 22 };
const splitList = (raw: string) => raw.split(/[,،]/).map((x) => x.trim()).filter(Boolean);

const defaults: TeamInput = {
  kind: "project",
  name: "",
  district: currentUser.district,
  about: "",
  tags: "",
  limit: DEFAULT_LIMIT.project,
  game: "pubgm",
  rank: "",
  scrims: "",
  university: "",
  supervisor: "",
  focus: "",
  roles: "",
  sport: "",
  ageGroup: "",
  practice: "",
};

function profileOf(v: TeamInput): Team["profile"] {
  if (v.kind === "lab") return { type: "lab", university: v.university || "বিশ্ববিদ্যালয়", supervisor: v.supervisor, focus: splitList(v.focus), roles: splitList(v.roles), equipment: [], meets: v.practice };
  if (v.kind === "sports") return { type: "sports", sport: v.sport || "খেলা", ageGroup: v.ageGroup || "সবার জন্য", record: { w: 0, d: 0, l: 0 }, practice: v.practice, positions: splitList(v.roles) };
  if (v.kind === "esports") return { type: "esports", game: v.game, rank: v.rank || "নতুন দল", scrims: v.scrims, wins: 0, roster: [{ name: currentUser.nameBn, role: ESPORTS_GAMES[v.game].roles[0] }] };
  return undefined;
}

export function CreateTeamButton() {
  const ensure = useRequireAccount();
  const [open, setOpen] = useState(false);
  const form = useForm<TeamInput>({ resolver: zodResolver(teamSchema), defaultValues: defaults });
  const kind = useWatch({ control: form.control, name: "kind" });
  const game = useWatch({ control: form.control, name: "game" });

  function onSubmit(v: TeamInput) {
    const team: Team = {
      id: newId("tm"),
      code: newJoinCode(),
      kind: v.kind,
      name: v.name,
      lead: currentUser.handle,
      members: [currentUser.handle],
      memberCount: 1,
      limit: v.kind === "esports" ? rosterSize(v.game) : v.limit,
      district: v.district,
      about: v.about,
      tags: v.tags.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`)),
      open: true,
      profile: profileOf(v),
    };
    updateMedia((s) => ({ ...s, myTeams: [team, ...s.myTeams], teamStatus: { ...s.teamStatus, [team.id]: "member" } }));
    setOpen(false);
    form.reset(defaults);
    toast.success("টিম তৈরি হলো", { description: `গোপন কী ${team.code} — যাদের দেবেন, শুধু তারাই সরাসরি যোগ দিতে পারবে। টিম রুমে মিশন আর প্রথম লক্ষ্য লিখুন।` });
  }

  const text = (name: "rank" | "scrims" | "university" | "supervisor" | "focus" | "roles" | "sport" | "ageGroup" | "practice", label: string, placeholder: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><Input placeholder={placeholder} {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <>
      <button type="button" onClick={() => ensure("টিম খুলতে") && setOpen(true)} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> টিম বানান
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">টিম বানান</DialogTitle>
            <DialogDescription>পরিবার, ল্যাব, প্রজেক্ট, ভ্রমণ, খেলা বা ই-স্পোর্টস — আসন ঠিক করুন, গোপন কী দিন।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="kind" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(teamKindBn) as TeamKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input
                          type="radio"
                          className="sr-only"
                          name={field.name}
                          checked={field.value === k}
                          onChange={() => {
                            field.onChange(k);
                            form.setValue("limit", k === "esports" ? rosterSize(game) : DEFAULT_LIMIT[k]);
                          }}
                        />
                        {teamKindBn[k]}
                      </label>
                    ))}
                  </FormGroup>
                  <FormDescription>{teamKindHint[field.value]}</FormDescription>
                </FormItem>
              )} />

              {kind === "esports" && (
                <div className="live-in space-y-4 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
                  <FormField control={form.control} name="game" render={({ field }) => (
                    <FormItem>
                      <FormGroupLabel>গেম</FormGroupLabel>
                      <FormGroup className="flex flex-wrap gap-2">
                        {(Object.keys(ESPORTS_GAMES) as GameId[]).map((g) => (
                          <label key={g} className={choiceClass(field.value === g)}>
                            <input type="radio" className="sr-only" name={field.name} checked={field.value === g} onChange={() => { field.onChange(g); form.setValue("limit", rosterSize(g)); }} />
                            {ESPORTS_GAMES[g].name}
                          </label>
                        ))}
                      </FormGroup>
                      <FormDescription>
                        রোস্টার: <Num value={ESPORTS_GAMES[game].starters} /> জন খেলোয়াড় + <Num value={ESPORTS_GAMES[game].subs} /> জন সাব = <Num value={rosterSize(game)} />টি আসন ({ESPORTS_GAMES[game].platform})
                      </FormDescription>
                    </FormItem>
                  )} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {text("rank", "দলের র‍্যাংক", "যেমন: এস টিয়ার, ইমর্টাল")}
                    {text("scrims", "স্ক্রিমের সময়", "যেমন: রাত ৯–১১টা, সপ্তাহে ৪ দিন")}
                  </div>
                </div>
              )}
              {kind === "lab" && (
                <div className="live-in grid gap-4 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 sm:grid-cols-2">
                  {text("university", "বিশ্ববিদ্যালয় ও বিভাগ", "যেমন: রুয়েট · সিএসই")}
                  {text("supervisor", "তত্ত্বাবধায়ক", "শিক্ষকের নাম বা পদ")}
                  {text("focus", "গবেষণার বিষয় (কমা দিয়ে)", "এআই, কৃষি, রোবোটিক্স")}
                  {text("roles", "যে পদে লোক নিচ্ছেন (কমা দিয়ে)", "ফার্মওয়্যার, ডেটা")}
                  {text("practice", "সভার সময়", "প্রতি বৃহস্পতিবার বিকেল ৪টা")}
                </div>
              )}
              {kind === "sports" && (
                <div className="live-in grid gap-4 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 sm:grid-cols-2">
                  {text("sport", "খেলা", "ক্রিকেট, ফুটবল, ব্যাডমিন্টন")}
                  {text("ageGroup", "বয়স-গ্রুপ", "অনূর্ধ্ব-১৫, সবার জন্য")}
                  {text("practice", "অনুশীলনের সময়", "শুক্রবার সকাল ৭টা")}
                  {text("roles", "যে পজিশনে লোক দরকার (কমা দিয়ে)", "গোলকিপার, স্পিনার")}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>টিমের নাম</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>জেলা</FormLabel>
                    <FormControl><select {...field} className={selectClass}>{districts.map((d) => <option key={d}>{d}</option>)}</select></FormControl>
                  </FormItem>
                )} />
              </div>
              {kind !== "esports" && (
                <FormField control={form.control} name="limit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>সর্বোচ্চ সদস্য</FormLabel>
                    <FormControl><Input type="number" inputMode="numeric" min={2} max={100} value={Number.isNaN(field.value) ? "" : field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
                    <FormDescription>এতজন হলে টিম পূর্ণ — অনুরোধ বা গোপন কী দিয়েও আর কেউ ঢুকতে পারবে না।</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="about" render={({ field }) => (
                <FormItem>
                  <FormLabel>টিম কী করে</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel>হ্যাশট্যাগ</FormLabel>
                  <FormControl><Input placeholder="#আইওটি #গবেষণা" {...field} /></FormControl>
                </FormItem>
              )} />
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <Users aria-hidden /> তৈরি করুন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The key on your own team card: hidden until tapped, then copied. */
function SecretKey({ code }: { code: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (shown) navigator.clipboard?.writeText(code).then(() => toast.success("গোপন কী কপি হলো", { description: "শুধু যাকে চান তাকে দিন।" }), () => {});
        setShown(true);
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-signal-orange px-3 font-mono text-sm font-bold tracking-widest text-text-primary shadow-tile transition-[scale] duration-150 active:scale-95"
      title={shown ? "কপি করুন" : "গোপন কী দেখুন"}
    >
      {shown ? <Copy className="size-4" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
      {shown ? code : "••••••"}
    </button>
  );
}

/** Teams you made or joined. */
export function MyTeams() {
  const made = useMediaState((s) => s.myTeams);
  const status = useMediaState((s) => s.teamStatus);
  const mine = [...made, ...teams.filter((t) => status[t.id] === "member")];
  if (mine.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-white">আমার টিম</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mine.map((t) => <TeamCard key={t.id} team={t} />)}</div>
    </section>
  );
}

/** Every other team; the ones you belong to sit under আমার টিম. */
export function TeamGrid({ list, hideMine }: { list: Team[]; hideMine: boolean }) {
  const status = useMediaState((s) => s.teamStatus);
  const rest = hideMine ? list.filter((t) => status[t.id] !== "member") : list;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{rest.map((t) => <TeamCard key={t.id} team={t} />)}</div>;
}

/** Join any team, open or closed, with the six-character key its lead shares — while seats last. */
export function JoinTeamByKey() {
  const ensure = useRequireAccount();
  const made = useMediaState((s) => s.myTeams);
  const status = useMediaState((s) => s.teamStatus);
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!ensure("টিমে যোগ দিতে")) return;
    const code = validJoinCode(key);
    if (!code) return setError("গোপন কী ৬ অক্ষরের — অক্ষর বা সংখ্যা।");
    const team = [...made, ...teams].find((t) => t.code === code);
    if (!team) return setError("এই কী-এর কোনো টিম নেই। টিম লিডারের কাছ থেকে কী-টা আবার নিন।");
    if (status[team.id] !== "member" && isFull(team.limit, team.memberCount)) return setError(`${team.name} পূর্ণ — লিডার আসন বাড়ালে আবার চেষ্টা করুন।`);
    updateMedia((s) => ({ ...s, teamStatus: { ...s.teamStatus, [team.id]: "member" } }));
    setKey("");
    toast.success(`${team.name}-এ যোগ দিলেন`, { description: "এখন টিম রুমে যাত্রা আর লক্ষ্য লিখতে পারবেন।" });
    setTimeout(() => document.getElementById(team.id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }

  return (
    <form id="join" onSubmit={join} className="scroll-mt-24 rounded-2xl bg-bd-green p-5 text-white sm:flex sm:items-center sm:gap-6 sm:p-6">
      <div className="mb-4 sm:mb-0">
        <p className="flex items-center gap-2 text-lg font-bold"><KeyRound className="size-5 text-signal-orange" aria-hidden /> গোপন কী দিয়ে যোগ দিন</p>
        <p className="mt-1 text-sm text-white/80">টিম লিডার কী দেবেন — বন্ধ টিমেও সরাসরি যোগ দেওয়া যায়, আসন খালি থাকলে। ডেমোতে চেষ্টা করুন: NKNTPG</p>
      </div>
      <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
        <label className="relative min-w-0 flex-1 sm:max-w-60">
          <span className="sr-only">গোপন কী</span>
          <Input
            type={visible ? "text" : "password"}
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            maxLength={8}
            autoComplete="off"
            placeholder="৬ অক্ষরের কী"
            className="pr-11 font-mono tracking-[0.3em] uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
            aria-invalid={Boolean(error)}
          />
          <button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/70 hover:text-white" aria-label={visible ? "কী লুকান" : "কী দেখুন"}>
            {visible ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
          </button>
        </label>
        <button type="submit" className={mediaButton({ variant: "primary" })}>যোগ দিন</button>
        {error && <p role="alert" className="live-in w-full text-sm font-semibold text-signal-orange sm:text-right">{error}</p>}
      </div>
    </form>
  );
}
