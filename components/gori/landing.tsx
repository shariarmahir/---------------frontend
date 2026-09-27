"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Bot, Box, FlaskConical, GitBranch, Hammer, Lock, Map as MapIcon, PlayCircle, Rocket, SlidersHorizontal, Swords, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { setup } from "@/lib/gori/mission/engine";
import Board2D from "./mission/board-2d";
import { hydrateMission, useMission } from "./mission/store";
import { levelOf, totalXp, UNLOCKS, type Feature } from "@/lib/gori/progression";
import { randomSeed } from "@/lib/gori/rng";
import { scenarioOf } from "@/lib/gori/sim/engine";
import type { Mode } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "./provider";
import { BASE, useFeature } from "./shell";
import { useGori, useHydrated } from "./store";

interface ModeRow {
  id: string;
  bn: string;
  en: string;
  body: string;
  icon: typeof MapIcon;
  tone: string;
  feature?: Feature;
  mode?: Mode;
  href?: string;
  soon?: boolean;
}

const rows: ModeRow[] = [
  { id: "campaign", bn: "অভিযান: এক পিক্সেল থেকে পুরো ব্যবস্থা", en: "Campaign", body: "নির্দেশিত আট ধাপ: সমস্যা চেনা, অংশীজন, কারণ-মানচিত্র, পাইলট, ফল, বিস্তার, পার্শ্বপ্রতিক্রিয়া, জাতীয় সংযোগ।", icon: MapIcon, tone: "bg-bd-green", mode: "campaign" },
  { id: "sandbox", bn: "স্যান্ডবক্স", en: "Sandbox", body: "প্রেক্ষাপট, বাজেট, কর্মী, সময়, ঘটনার তীব্রতা, প্রমাণের প্রাপ্যতা, বীজ — সব নিজে ঠিক করুন।", icon: SlidersHorizontal, tone: "bg-[#2f5f8a]", feature: "sandbox", href: `${BASE}/play?setup=1` },
  { id: "lab", bn: "বিজ্ঞানাগার", en: "Scientific lab", body: "অনুমান লিখুন, একই বীজে ভিত্তি বনাম হস্তক্ষেপ অনেকবার চালান, অনিশ্চয়তার পরিসর দেখুন।", icon: FlaskConical, tone: "bg-[#6d4bd1]", feature: "lab", href: `${BASE}/lab` },
  { id: "crisis", bn: "সংকট মোড", en: "Crisis mode", body: "চর এলাকা, কম বাজেট, দ্বিতীয় প্রান্তিকেই বন্যা — চার টার্নে অগ্রাধিকার ঠিক করুন।", icon: AlertTriangle, tone: "bg-national-crimson", feature: "crisis", mode: "crisis" },
  { id: "future", bn: "ভবিষ্যৎ গবেষণাগার ২০৩৫", en: "Future lab", body: "প্রতি টার্ন এক বছর — ২০৩৫ পর্যন্ত কাল্পনিক দীর্ঘমেয়াদি দৃশ্যকল্প।", icon: Rocket, tone: "bg-[#8a5a00]", feature: "future", mode: "future" },
  { id: "forge", bn: "দৃশ্যকল্প কারখানা", en: "Scenario forge", body: "নিজের দৃশ্যকল্প বানান, মডারেশনে পাঠান, খেলুন।", icon: Hammer, tone: "bg-[#35524a]", feature: "forge", href: `${BASE}/forge` },
  { id: "community", bn: "কমিউনিটি মিশন", en: "Community mission", body: "দলগত প্রস্তাব, ভূমিকা, মন্তব্য — সার্ভার যুক্ত হলে চালু হবে।", icon: Users, tone: "bg-[#45535a]", href: `${BASE}/community`, soon: true },
];

export function ModeMenu() {
  const router = useRouter();
  const startMode = useGori((s) => s.startMode);
  const game = useGori((s) => s.game);
  const hydrated = useHydrated();
  const { n } = useT();

  return (
    <section aria-labelledby="modes-title" className="mx-auto max-w-340 px-4 pb-6 sm:px-6 lg:px-8">
      <h2 id="modes-title" className="sr-only">খেলার ধরন</h2>
      <MissionFeature />
      {hydrated && game && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gori-cream px-5 py-4 text-gori-ink">
          <p className="font-bengali">
            <strong className="block text-lg">চলমান খেলা আছে</strong>
            <span className="text-sm text-gori-ink-soft">
              {scenarioOf(game.config.scenario).bn} · টার্ন {n(game.turn)}/{n(game.config.horizon)} · বীজ {game.config.seed}
            </span>
          </p>
          <Link href={`${BASE}/play`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-5 font-bengali font-bold">
            চালিয়ে যান <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
      <ul className="grid gap-2.5 md:grid-cols-2">
        {rows.map((r) => (
          <ModeItem
            key={r.id}
            row={r}
            onStart={() => {
              if (r.mode) {
                if (game && !window.confirm("চলমান খেলা বন্ধ করে নতুন খেলা শুরু করবেন? চলমান খেলা সংরক্ষিত নয়।")) return;
                startMode(r.mode, randomSeed());
                router.push(`${BASE}/play`);
              } else if (r.href) router.push(r.href);
            }}
          />
        ))}
      </ul>
    </section>
  );
}

function ModeItem({ row, onStart }: { row: ModeRow; onStart: () => void }) {
  const open = useFeature(row.feature ?? "campaign");
  const { n } = useT();
  const Icon = row.icon;
  return (
    <li>
      <button
        type="button"
        onClick={onStart}
        disabled={!open}
        className={cn(
          "group flex w-full items-stretch overflow-hidden rounded-xl text-left transition-[transform,box-shadow] duration-200",
          open ? "bg-gori-panel hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgb(0_0_0/0.8)]" : "cursor-not-allowed bg-white/4",
        )}
      >
        <span className={cn("flex w-14 shrink-0 items-center justify-center", open ? row.tone : "bg-white/6")}>
          {open ? <Icon className="size-6 text-white" aria-hidden /> : <Lock className="size-5 text-white/50" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1 px-4 py-3.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className={cn("font-bengali text-base font-bold", open ? "text-white" : "text-white/55")}>{row.bn}</span>
            <span className="shrink-0 font-bengali text-[11px] font-semibold text-emerald-100/70">
              {row.soon ? "প্রিভিউ" : open ? row.en : `স্তর ${n(UNLOCKS[row.feature!].level)}-এ খুলবে`}
            </span>
          </span>
          <span className={cn("mt-1 block font-bengali text-sm leading-6", open ? "text-emerald-50/80" : "text-white/45")}>{row.body}</span>
        </span>
        {open && (
          <span className="flex items-center pr-4 text-signal-orange opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
            <PlayCircle className="size-6" />
          </span>
        )}
      </button>
    </li>
  );
}

export function PlayerStrip() {
  const progress = useGori((s) => s.progress);
  const name = useGori((s) => s.settings.name);
  const hydrated = useHydrated();
  const { n } = useT();
  const xp = totalXp(progress);
  const lv = levelOf(xp);
  if (!hydrated) return <div className="h-16" aria-hidden />;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-bengali text-sm text-emerald-50/85">
      <span>
        {name ? `${name} · ` : ""}স্তর {n(lv.number)}: <strong className="text-white">{lv.bn}</strong>
      </span>
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)} aria-label="পরের স্তরের দিকে">
          <span className="block h-full rounded-full bg-signal-orange" style={{ width: `${lv.progress * 100}%` }} />
        </span>
        {lv.next ? `${lv.next.bn} হতে ${n(lv.toNext)} XP` : "সর্বোচ্চ স্তর"}
      </span>
    </div>
  );
}

/** The headline mode: the co-operative crisis mission. */
function MissionFeature() {
  useEffect(() => {
    hydrateMission();
  }, []);
  const running = useMission((s) => !!s.config && !s.state?.outcome);
  // A real opening board as the preview — the game, not an illustration of it.
  const demo = useMemo(
    () =>
      setup({
        seed: "preview",
        difficulty: "standard",
        seats: [
          { name: "১", role: "organizer", bot: false },
          { name: "২", role: "engineer", bot: true },
          { name: "৩", role: "guardian", bot: true },
        ],
      }),
    [],
  );
  return (
    <article className="mb-5 grid overflow-hidden rounded-3xl bg-gori-panel lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-signal-orange px-3 py-1 font-bengali text-xs font-extrabold text-gori-ink">
          <Swords className="size-3.5" aria-hidden /> নতুন · প্রধান খেলা
        </p>
        <h3 className="font-bengali text-3xl leading-tight font-extrabold text-white sm:text-4xl">জাতীয় মিশন</h3>
        <p className="max-w-[52ch] font-bengali text-base leading-7 text-emerald-50/85">
          ৩২টি সমস্যা একে অপরকে খাওয়ায়। একটি ভাঙলে ঢেউ ছড়ায় শৃঙ্খলে। ভূমিকা বেছে নিন, দলের সাথে পরিকল্পনা করুন, মূল কারণ সামলান — আর সময় ফুরোনোর আগে চারটি জাতীয় সংস্কার চালু করুন।
        </p>
        <ul className="grid gap-2 font-bengali text-sm text-emerald-50/90 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <Users className="size-4 text-signal-orange" aria-hidden /> ২–৪ জন, এক ডিভাইসে
          </li>
          <li className="flex items-center gap-2">
            <Bot className="size-4 text-signal-orange" aria-hidden /> AI সহযোদ্ধা
          </li>
          <li className="flex items-center gap-2">
            <Box className="size-4 text-signal-orange" aria-hidden /> ৩D বোর্ড
          </li>
          <li className="flex items-center gap-2 sm:col-span-3">
            <GitBranch className="size-4 text-signal-orange" aria-hidden /> প্রতিটি চালের আগে দেখুন: “ভাঙলে কী হবে?”
          </li>
        </ul>
        <Link href={`${BASE}/mission`} className="inline-flex h-13 w-fit items-center gap-2 rounded-2xl bg-signal-orange px-6 font-bengali text-lg font-extrabold text-gori-ink transition-transform hover:-translate-y-0.5">
          {running ? "মিশন চালিয়ে যান" : "মিশন শুরু করুন"} <ArrowRight className="size-5" aria-hidden />
        </Link>
      </div>
      <div className="relative aspect-820/660 lg:aspect-auto" inert aria-hidden>
        <Board2D state={demo} current={0} selected={null} focus={null} highlight={null} pulses={[]} reduce onSelect={() => {}} onHover={() => {}} />
      </div>
    </article>
  );
}
