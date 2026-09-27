"use client";

import Link from "next/link";
import { BookOpen, RotateCcw, ScrollText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { evidenceById } from "@/data/gori/evidence";
import { RULES } from "@/lib/gori/sim/engine";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { BASE } from "../shell";
import { useGori, type Game } from "../store";
import { AiSheet } from "./ai-sheet";
import { Allocation } from "./allocation";
import { CausalMap } from "./causal-map";
import { FinalReport } from "./final-report";
import { InterventionBuilder } from "./interventions";
import { CommandRail, StatusRail } from "./rails";
import { TurnReportView } from "./turn-report";
import { periodLabel, useGame, useStages } from "./use-game";

type Tab = "map" | "build" | "allocate" | "results" | "final";

const MODE_BN = { campaign: "অভিযান", sandbox: "স্যান্ডবক্স", lab: "বিজ্ঞানাগার", crisis: "সংকট মোড", future: "ভবিষ্যৎ গবেষণাগার" } as const;

export function CommandCenter({ game }: { game: Game }) {
  const { run, sc, state, draft, preview, finished } = useGame(game);
  const { n } = useT();
  const flag = useGori((s) => s.flag);
  const learning = useGori((s) => s.settings.learning);
  const endGame = useGori((s) => s.endGame);
  const stages = useStages(game, run);
  const guided = game.config.mode === "campaign" || learning === "guided";
  const [tab, setTab] = useState<Tab>(finished ? "final" : game.turn === 0 ? "build" : "results");
  const [briefOpen, setBriefOpen] = useState(!game.flags.includes("brief"));
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [lastTurn, setLastTurn] = useState(game.turn);

  // After a turn runs, show its results; when the game ends, show the final report.
  if (lastTurn !== game.turn) {
    setLastTurn(game.turn);
    setTab(finished ? "final" : game.turn > lastTurn ? "results" : tab);
  }

  useEffect(() => {
    if (peopleOpen) flag("stakeholders");
  }, [peopleOpen, flag]);

  const ctx = sc.contexts.find((c) => c.id === game.config.context)!;
  const tabs: { id: Tab; bn: string }[] = [
    { id: "map", bn: "কারণ-মানচিত্র" },
    { id: "build", bn: "হস্তক্ষেপ" },
    { id: "allocate", bn: "সম্পদ বণ্টন" },
    { id: "results", bn: "ফলাফল" },
    ...(finished ? [{ id: "final" as const, bn: "চূড়ান্ত ফল" }] : []),
  ];

  return (
    <div className="mx-auto max-w-340 px-3 pt-5 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-bengali text-xs text-emerald-100/80">
            <span className="rounded-full bg-signal-orange px-2 py-0.5 font-bold text-gori-ink">{MODE_BN[game.config.mode]}</span>
            <span>BD-001</span>·<span>{ctx.bn}</span>·<span>বীজ {game.config.seed}</span>·<span className="rounded bg-white/10 px-1.5">সিমুলেশন — বাস্তব ফল নয়</span>
            {game.config.mode === "future" && <span className="rounded bg-[#8a5a00] px-1.5 text-white">কাল্পনিক ভবিষ্যৎ</span>}
          </p>
          <h1 className="mt-1.5 font-bengali text-2xl font-bold text-white sm:text-3xl">{sc.bn}</h1>
          <p className="font-bengali text-sm text-emerald-100/80">
            {finished ? "খেলা শেষ" : `টার্ন ${n(game.turn + 1)}/${n(game.config.horizon)} · ${periodLabel(game.config, game.turn)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setBriefOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3.5 font-bengali text-sm font-semibold hover:bg-white/15">
            <BookOpen className="size-4" aria-hidden /> সমস্যা ও প্রমাণ
          </button>
          <button type="button" onClick={() => setRulesOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3.5 font-bengali text-sm font-semibold hover:bg-white/15">
            <ScrollText className="size-4" aria-hidden /> নিয়ম
          </button>
          <AiSheet sc={sc} game={game} />
          <button
            type="button"
            onClick={() => window.confirm("এই খেলা বন্ধ করবেন? সংরক্ষণ না করলে হারাবে।") && endGame()}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 font-bengali text-sm text-emerald-100/80 hover:bg-white/10"
          >
            <RotateCcw className="size-4" aria-hidden /> বন্ধ করুন
          </button>
        </div>
      </header>

      {guided && stages.current && !finished && (
        <p className="mt-4 rounded-xl bg-signal-orange/15 px-4 py-2.5 font-bengali text-sm text-orange-100" aria-live="polite">
          <strong className="text-signal-orange">এখনকার ধাপ — {stages.current.bn}:</strong> {stages.current.hint}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 lg:order-1" aria-label="ইউনিয়নের অবস্থা">
          <StatusRail sc={sc} run={run} game={game} budgetAfterDraft={preview.budget} onStakeholders={() => setPeopleOpen(true)} />
        </aside>

        <section className="order-1 min-w-0 lg:order-2" aria-label="কর্মক্ষেত্র">
          <div role="tablist" aria-label="কর্মক্ষেত্র" className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-gori-panel p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn("min-h-10 shrink-0 flex-1 rounded-lg px-3 font-bengali text-sm font-semibold whitespace-nowrap", tab === t.id ? "bg-gori-cream text-gori-ink" : "text-emerald-50/80 hover:text-white")}
              >
                {t.bn}
              </button>
            ))}
          </div>
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-4">
            {tab === "map" && <CausalMap sc={sc} run={run} turn={game.turn} puzzle={game.config.mode === "campaign"} />}
            {tab === "build" && <InterventionBuilder sc={sc} config={game.config} state={state} draft={draft} preview={preview} disabled={finished} />}
            {tab === "allocate" && <Allocation sc={sc} config={game.config} state={state} draft={draft} preview={preview} disabled={finished} />}
            {tab === "results" && <TurnReportView key={game.turn} sc={sc} run={run} played={game.turn} />}
            {tab === "final" && finished && <FinalReport sc={sc} run={run} game={game} />}
          </div>
        </section>

        <aside className="order-3 lg:col-span-2 xl:col-span-1" aria-label="কমান্ড">
          <CommandRail sc={sc} game={game} state={state} draft={draft} results={preview.results} stages={stages} finished={finished} guided={guided} />
        </aside>
      </div>

      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-gori-cream text-gori-ink sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">{sc.bn}</DialogTitle>
            <DialogDescription className="font-bengali text-sm text-gori-ink-soft">{sc.place} · প্রেক্ষাপট: {ctx.bn} — {ctx.description}</DialogDescription>
          </DialogHeader>
          <p className="font-bengali text-[15px] leading-7">{sc.brief}</p>
          <h3 className="mt-2 font-bengali text-sm font-bold">বাস্তব প্রমাণ (প্রতিবেদন থেকে)</h3>
          <ul className="space-y-1.5">
            {["EV-POINT-01", "EV-MECH-service-access", "EV-MON-health"].map((id) => {
              const e = evidenceById.get(id)!;
              return (
                <li key={id} className="rounded-lg bg-white px-3 py-2 font-bengali text-sm">
                  <span className="font-semibold">{e.title}</span>
                  <span className="block text-gori-ink-soft">{e.extractedClaims.join(" · ")}</span>
                  <span className="block text-xs text-gori-mute">{e.publisher}</span>
                </li>
              );
            })}
          </ul>
          <p className="rounded-lg bg-amber-50 px-3 py-2 font-bengali text-xs leading-5 text-amber-900">
            চারটি জিনিস আলাদা রাখুন: ওপরের প্রমাণ বাস্তব; ইউনিয়ন আর তার সংখ্যা কাল্পনিক; সম্পর্কের মাত্রা খেলার অনুমান; ফল সিমুলেশন।
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                flag("brief");
                setBriefOpen(false);
              }}
              className="inline-flex h-11 items-center rounded-xl bg-signal-orange px-5 font-bengali font-bold"
            >
              বুঝেছি — শুরু করি
            </button>
            <Link href={`${BASE}/module/BD-001`} className="inline-flex h-11 items-center rounded-xl border border-gori-ink/20 px-4 font-bengali text-sm font-semibold">
              মডিউল BD-001 দেখুন
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={peopleOpen} onOpenChange={setPeopleOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-gori-cream text-gori-ink sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">অংশীজন — কে কী চান</DialogTitle>
            <DialogDescription className="font-bengali text-sm text-gori-ink-soft">সরলীকৃত খেলার নিয়ম — কোনো বাস্তব গোষ্ঠী সম্পর্কে দাবি নয়। সমর্থন কম হলে তাঁদের ওপর নির্ভরশীল হস্তক্ষেপ কম কার্যকর হয়।</DialogDescription>
          </DialogHeader>
          <ul className="space-y-3">
            {sc.stakeholders.map((s) => (
              <li key={s.id} className="rounded-xl bg-white p-3 font-bengali">
                <p className="font-semibold">{s.bn} <span className="text-xs font-normal text-gori-mute">{s.en}</span></p>
                <p className="text-sm text-gori-ink-soft">{s.description}</p>
                <p className="mt-1 text-xs text-gori-mute">
                  খুশি হন যখন: {Object.entries(s.cares).map(([v, w]) => `${sc.variables.find((x) => x.id === v)?.bn} ${w > 0 ? "বাড়ে" : "কমে"}`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-gori-cream text-gori-ink sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">খেলার নিয়ম (নিয়ম-সংস্করণ {run.ruleset}, ইঞ্জিন {run.engine})</DialogTitle>
            <DialogDescription className="font-bengali text-sm text-gori-ink-soft">সব নিয়ম প্রকাশ্য; কোনো লুকোনো শাস্তি নেই।</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1.5 pl-5 font-bengali text-sm leading-6">
            <li>প্রতিটি সূচক নিজের লক্ষ্যের দিকে প্রতি প্রান্তিকে কিছুটা এগোয়। লক্ষ্য = শুরুর মান + চলমান হস্তক্ষেপের প্রভাব + কারণ-সম্পর্কের প্রভাব।</li>
            <li>প্রতিটি পরিবর্তন নামসহ ভাগ করা যায়: হস্তক্ষেপ, কারণ-সম্পর্ক, পুরোনো অবস্থার দিকে টান, ঘটনা, সাড়া। ফলাফল ট্যাবে দেখুন।</li>
            <li>পাইলট: খরচ {n(RULES.pilotCostShare * 100)}%, প্রভাব {n(RULES.pilotEffectShare * 100)}%, কর্মী {n(RULES.pilotWorkforceShare * 100)}%। পরে বড় করতে পূর্ণ খরচের {n(RULES.scaleCostShare * 100)}%।</li>
            <li>সরাসরি পূর্ণ পরিসরে চালু করলে প্রমাণের প্রাপ্যতা অনুযায়ী {n(RULES.rolloutRisk.high * 100)}–{n(RULES.rolloutRisk.low * 100)}% সম্ভাবনায় দুই প্রান্তিক কার্যকারিতা {n(RULES.rolloutEfficiency * 100)}%।</li>
            <li>চলমান খরচ মেটাতে না পারলে রক্ষণাবেক্ষণ কমে, আর রক্ষণাবেক্ষণ অনুযায়ী প্রভাবও কমে। কর্মী কম হলে সবার কার্যকারিতা আনুপাতিক হারে কমে।</li>
            <li>প্রতিটি হস্তক্ষেপের আসল প্রভাব বীজ থেকে একবার নির্ধারিত হয়; ঘটনার সম্ভাবনা প্রতিটি টার্নে আলাদা ধারায়। তাই একই বীজে দুটি কৌশল একই আবহাওয়া আর একই আসল প্রভাবের মুখোমুখি হয় — তুলনা ন্যায্য।</li>
            <li>সীমা-ঘটনা (যেমন ওষুধ সংকট) নির্দিষ্ট সূচক টানা দুই প্রান্তিক সীমার বাইরে থাকলে ঘটে। কিছু ঘটনায় পরের টার্নে একবার সাড়া দেওয়া যায়।</li>
            <li>স্কোর আর শাস্তির সূত্র চূড়ান্ত ফল পাতায় দেখানো হয়।</li>
          </ul>
          <button type="button" onClick={() => setRulesOpen(false)} className="inline-flex h-10 items-center gap-1 self-start rounded-xl border border-gori-ink/20 px-3 font-bengali text-sm">
            <X className="size-4" aria-hidden /> বন্ধ
          </button>
        </DialogContent>
      </Dialog>

      {/* Phones: the run button stays in reach. */}
      {!finished && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-gori-deep/95 px-4 py-3 backdrop-blur lg:hidden">
          <PhoneRun turn={game.turn} />
        </div>
      )}
    </div>
  );
}

function PhoneRun({ turn }: { turn: number }) {
  const playTurn = useGori((s) => s.playTurn);
  const { n } = useT();
  return (
    <button type="button" onClick={playTurn} className="flex h-12 w-full items-center justify-center rounded-xl bg-signal-orange font-bengali text-base font-extrabold text-gori-ink">
      টার্ন {n(turn + 1)} চালান
    </button>
  );
}
