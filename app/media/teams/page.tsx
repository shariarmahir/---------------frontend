import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell, FlaskConical, Gamepad2, KeyRound, Plane, Rocket, UsersRound, type LucideIcon } from "lucide-react";
import { CreateTeamButton, JoinTeamByKey, MyTeams, TeamGrid } from "@/components/media/community/teams";
import { mediaButton } from "@/components/media/ui/button-styles";
import { chipClass } from "@/components/media/ui/field-styles";
import { Num } from "@/components/media/ui/numerals";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { teamKindBn, teamKindHint, teams } from "@/data/media/teams";
import type { TeamKind } from "@/data/media/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "টিম ও গ্রুপ" };

const KIND_ICON: Record<TeamKind, LucideIcon> = { family: UsersRound, lab: FlaskConical, project: Rocket, travel: Plane, sports: Dumbbell, esports: Gamepad2 };

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const kind = k && k in teamKindBn ? (k as TeamKind) : undefined;
  const shown = teams.filter((t) => !kind || t.kind === kind);
  const kinds = Object.keys(teamKindBn) as TeamKind[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero — the home page's ink band: claim left, team kinds as colour fields right. */}
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <p className="inline-flex items-center gap-2 rounded-full bg-signal-orange px-3 py-1 text-xs font-bold text-text-primary">
              <KeyRound className="size-4" aria-hidden /> টিম ও গ্রুপ · গোপন কী দিয়ে যোগ
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
              একা নয়, <span className="text-signal-orange">একসাথে।</span>
            </h1>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-white/80">
              পরিবারের কারখানা, ইউনিভার্সিটি ল্যাব, প্রজেক্ট, ভ্রমণ বা খেলার দল — টিম বানান, গোপন কী দিন, যাকে চান শুধু সে-ই যোগ দেবে।
            </p>
            <div className="flex flex-wrap gap-3">
              <CreateTeamButton />
              <a href="#join" className={mediaButton({ variant: "outline" })}><KeyRound aria-hidden /> গোপন কী দিয়ে যোগ দিন</a>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
            {kinds.map((key, i) => {
              const s = surfaceAt(i);
              const Icon = KIND_ICON[key];
              return (
                <li key={key}>
                  <Link href={`/media/teams?k=${key}`} scroll={false} style={glowStyle(s.glow)} className={cn("flex h-full flex-col gap-3 rounded-2xl p-4", s.card, LIFT)}>
                    <span className={cn("flex size-10 items-center justify-center rounded-xl", s.tile)}><Icon className="size-5" aria-hidden /></span>
                    <span>
                      <span className="block font-bold">{teamKindBn[key]}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed opacity-80">{teamKindHint[key]}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-3 divide-x divide-white/10">
            {[
              { label: "টিম", value: teams.length },
              { label: "সদস্য", value: teams.reduce((n, t) => n + t.memberCount, 0) },
              { label: "নতুন সদস্য নিচ্ছে", value: teams.filter((t) => t.open).length },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-4 text-center">
                <dt className="text-xs text-white/65">{s.label}</dt>
                <dd className="text-2xl font-bold text-signal-orange"><Num value={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <JoinTeamByKey />
      {!kind && <MyTeams />}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-white">{kind ? teamKindBn[kind] : "সব টিম"}</h2>
          {kind && <p className="text-sm text-white/70">{teamKindHint[kind]}</p>}
        </div>
        <nav aria-label="টিমের ধরন" className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2">
            <li><Link href="/media/teams" scroll={false} aria-current={!kind ? "page" : undefined} className={chipClass(!kind)}>সব</Link></li>
            {kinds.map((key) => (
              <li key={key}>
                <Link href={`/media/teams?k=${key}`} scroll={false} aria-current={kind === key ? "page" : undefined} className={chipClass(kind === key)}>
                  {teamKindBn[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <TeamGrid list={shown} hideMine={!kind} />
      </section>
    </div>
  );
}
