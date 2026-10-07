import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HandHeart, KeyRound, Scale, Shirt, Sprout, Trophy, UsersRound } from "lucide-react";
import { ChallengeCard } from "@/components/media/community/challenges";
import { CreateChallengeButton, MyChallenges } from "@/components/media/community/create-challenge";
import { CreateEventButton, EventCard, MyEvents } from "@/components/media/community/events";
import { CreateTeamButton, JoinTeamByKey, MyTeams, TeamGrid } from "@/components/media/community/teams";
import { Arena } from "@/components/media/together/arena";
import { StoryRail } from "@/components/media/together/story-rail";
import { Switcher, type View } from "@/components/media/together/switcher";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { Num, Taka } from "@/components/media/ui/numerals";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle } from "@/components/ui/surfaces";
import { challengeKindBn, challenges } from "@/data/media/challenges";
import { eventKindBn, events } from "@/data/media/events";
import { teamKindBn, teamKindHint, teams } from "@/data/media/teams";
import type { ChallengeKind, EventKind, TeamKind } from "@/data/media/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "একসাথে — টিম, উদ্যোগ, চ্যালেঞ্জ" };

const isView = (v?: string): v is View => v === "teams" || v === "events" || v === "challenges";

/**
 * টিম ও গ্রুপ, উদ্যোগ and চ্যালেঞ্জ on one page: a team forms, takes on an
 * উদ্যোগ or a চ্যালেঞ্জ, and tells its journey in its own room and on the feed.
 * `?v=` picks the part, `?k=` the kind inside it.
 */
export default async function TogetherPage({ searchParams }: { searchParams: Promise<{ v?: string; k?: string }> }) {
  const { v, k } = await searchParams;
  const view: View = isView(v) ? v : "teams";

  const members = teams.reduce((n, t) => n + t.memberCount, 0);
  const volunteers = events.reduce((n, e) => n + e.joined, 0);
  const prizes = challenges.reduce((n, c) => n + c.prize, 0);

  const pillars = [
    { key: "teams" as const, Icon: UsersRound, title: "টিম ও গ্রুপ", line: "পরিবার, ল্যাব, প্রজেক্ট, খেলা — নিজের রুম, নিজের যাত্রা", stat: <><Num value={teams.length} />টি টিম</>, tone: "bg-m-yellow text-m-ink", tile: "bg-m-card text-m-blue", glow: "var(--color-signal-orange)" },
    { key: "events" as const, Icon: HandHeart, title: "উদ্যোগ", line: "গাছ লাগানো, পরিষ্কার, রক্তদান — স্পনসরসহ", stat: <><Num value={volunteers} /> স্বেচ্ছাসেবক</>, tone: "bg-m-blue-soft text-m-ink", tile: "bg-m-yellow text-m-ink", glow: "var(--color-bd-green)" },
    { key: "challenges" as const, Icon: Trophy, title: "চ্যালেঞ্জ", line: "টিম বনাম টিম লিগ, আর কোড-ডিজাইন-গবেষণার পুরস্কার", stat: <><Taka amount={prizes} /> পুরস্কার</>, tone: "bg-m-red-soft text-m-ink", tile: "bg-m-card text-m-blue", glow: "var(--color-bdorange-600)" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero: the claim on ink, the three parts as colour fields that open them. */}
      <section className="live-in relative isolate overflow-hidden rounded-3xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
        <svg className="pointer-events-none absolute -top-24 -right-24 -z-10 size-[28rem] text-m-blue/10 motion-safe:animate-[spin_90s_linear_infinite]" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="44" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 4" />
        </svg>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <h1 className="text-4xl font-bold tracking-tight text-balance text-m-ink sm:text-6xl sm:leading-[1.05]">
              একা নয়, <span className="text-m-blue">একসাথে।</span>
            </h1>
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-m-ink/80 sm:text-base">
              দল গড়ুন, উদ্যোগে নামুন, চ্যালেঞ্জ জিতুন — আর পুরো যাত্রাটা টিম রুমে লিখে রাখুন, সবাইকে ফিডে দেখান।
            </p>
            <div className="flex flex-wrap gap-3">
              <CreateTeamButton />
              <Link href="/media/together?v=teams#join" scroll={false} className={mediaButton({ variant: "outline" })}><KeyRound aria-hidden /> গোপন কী দিয়ে যোগ</Link>
            </div>
          </div>
          <ul className="grid gap-3">
            {pillars.map((p, i) => (
              <li key={p.key} className="live-in" style={{ animationDelay: `${80 + i * 70}ms` }}>
                <Link
                  href={`/media/together?v=${p.key}#parts`}
                  scroll={false}
                  aria-current={view === p.key ? "true" : undefined}
                  style={glowStyle(p.glow)}
                  className={cn("group flex items-center gap-4 rounded-2xl p-4 ring-offset-2 ring-offset-text-primary sm:p-5", p.tone, LIFT, view === p.key && "ring-2 ring-m-ink/60")}
                >
                  <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:-rotate-6 motion-reduce:transition-none", p.tile)}>
                    <p.Icon className="size-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold">{p.title}</span>
                    <span className="block text-xs leading-relaxed opacity-80">{p.line}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-bold">{p.stat}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-2 divide-m-ink/9 sm:grid-cols-4 sm:divide-x">
            {[
              { label: "টিম", value: <Num value={teams.length} /> },
              { label: "টিমের সদস্য", value: <Num value={members} /> },
              { label: "উদ্যোগে স্বেচ্ছাসেবক", value: <Num value={volunteers} /> },
              { label: "চ্যালেঞ্জের পুরস্কার", value: <Taka amount={prizes} /> },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-4 text-center">
                <dt className="text-xs text-m-ink/65">{s.label}</dt>
                <dd className="text-2xl font-bold text-m-blue">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <StoryRail />

      <div className="space-y-6">
        <Switcher view={view} />
        <div key={view} className="live-in">
          {view === "teams" ? <TeamsPart k={k} /> : view === "events" ? <EventsPart k={k} /> : <ChallengesPart k={k} />}
        </div>
      </div>
    </div>
  );
}

function Kinds<K extends string>({ view, names, active, label }: { view: View; names: Record<K, string>; active?: K; label: string }) {
  return (
    <nav aria-label={label} className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2">
        <li><Link href={`/media/together?v=${view}`} scroll={false} aria-current={!active ? "page" : undefined} className={chipClass(!active)}>সব</Link></li>
        {(Object.keys(names) as K[]).map((key) => (
          <li key={key}>
            <Link href={`/media/together?v=${view}&k=${key}`} scroll={false} aria-current={active === key ? "page" : undefined} className={chipClass(active === key)}>{names[key]}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PartHead({ title, line, action }: { title: string; line: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-m-ink">{title}</h2>
        <p className="mt-0.5 max-w-[60ch] text-sm text-m-ink/70">{line}</p>
      </div>
      {action}
    </div>
  );
}

function TeamsPart({ k }: { k?: string }) {
  const kind = k && k in teamKindBn ? (k as TeamKind) : undefined;
  const shown = teams.filter((t) => !kind || t.kind === kind);
  return (
    <section className="space-y-5">
      <PartHead title={kind ? teamKindBn[kind] : "টিম ও গ্রুপ"} line={kind ? teamKindHint[kind] : "প্রতিটি টিমের নিজের রুম — যাত্রা, মিশন, লক্ষ্য আর সদস্য। গোপন কী দিয়ে শুধু যাকে চান সে-ই ঢোকে।"} action={<CreateTeamButton />} />
      <JoinTeamByKey />
      {!kind && <MyTeams />}
      <div className="space-y-4">
        {!kind && <h3 className="text-xl font-bold text-m-ink">সব টিম</h3>}
        <Kinds view="teams" names={teamKindBn} active={kind} label="টিমের ধরন" />
        <TeamGrid list={shown} hideMine={!kind} />
      </div>
    </section>
  );
}

function EventsPart({ k }: { k?: string }) {
  const kind = k && k in eventKindBn ? (k as EventKind) : undefined;
  const shown = events.filter((e) => !kind || e.kind === kind).sort((a, b) => a.date.localeCompare(b.date));
  const steps = [
    { Icon: Sprout, text: "একজন উদ্যোগ খোলেন — কী, কোথায়, কবে, কী লাগবে।" },
    { Icon: Shirt, text: "এলাকার মানুষ যোগ দেন; সবাই পরিচয়-যাচাইকৃত।" },
    { Icon: Building2, text: "প্রতিষ্ঠান স্পনসর করে; খরচের হিসাব সবার সামনে।" },
  ];
  return (
    <section className="space-y-5">
      <PartHead title="উদ্যোগ" line="চলো ১০০টা গাছ লাগাই, এলাকাটা পরিষ্কার করি — যে কেউ নেতৃত্ব দিতে পারেন, যে কেউ যোগ দিতে পারেন। টিম নিয়েও নামা যায়।" action={<CreateEventButton />} />
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map(({ Icon, text }, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-m-blue-soft p-3.5 text-sm text-m-ink">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-m-yellow text-m-ink"><Icon className="size-4.5" aria-hidden /></span>
            <span className="leading-relaxed">{text}</span>
          </li>
        ))}
      </ol>
      <Kinds view="events" names={eventKindBn} active={kind} label="উদ্যোগের ধরন" />
      {!kind && <MyEvents />}
      {shown.length === 0 ? (
        <EmptyState icon="posts" title="এই ধরনের কোনো উদ্যোগ নেই" body="প্রথমটি আপনিই শুরু করুন।" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{shown.map((e) => <EventCard key={e.id} event={e} />)}</div>
      )}
    </section>
  );
}

function ChallengesPart({ k }: { k?: string }) {
  const kind = k && k in challengeKindBn ? (k as ChallengeKind) : undefined;
  const shown = challenges.filter((c) => !kind || c.kind === kind).sort((a, b) => a.deadline.localeCompare(b.deadline));
  return (
    <div className="space-y-12">
      <Arena />
      <section className="space-y-5">
        <PartHead title="পুরস্কারের চ্যালেঞ্জ" line="কোড, ডিজাইন, গবেষণা আর ল্যাবের চ্যালেঞ্জ — একা বা টিমে। বাস্তব সমস্যার সমাধান করে পুরস্কার জিতুন, ছোট পেইড অ্যাসাইনমেন্টে আয় করুন।" action={<CreateChallengeButton />} />
        <p className="flex items-start gap-2 rounded-2xl bg-m-card p-3.5 text-sm text-m-ink/80 ring-1 ring-m-ink/10 shadow-m-tile">
          <Scale className="mt-0.5 size-4.5 shrink-0 text-m-blue" aria-hidden />
          টিমে খেললে জমার সময় টিমের নাম দিন — জেতার পর টিম রুমের যাত্রায় লিখে ফিডে শেয়ার করুন।
        </p>
        <Kinds view="challenges" names={challengeKindBn} active={kind} label="চ্যালেঞ্জের ধরন" />
        <MyChallenges kind={kind} />
        <div className="grid gap-4 md:grid-cols-2">{shown.map((c) => <ChallengeCard key={c.id} challenge={c} />)}</div>
      </section>
    </div>
  );
}
