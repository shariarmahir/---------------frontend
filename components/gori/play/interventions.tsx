"use client";

import { AlertTriangle, CheckCircle2, CircleDot, Clock3, Info, Lock, Minus, Plus, Square } from "lucide-react";
import { useState } from "react";
import { evidenceById } from "@/data/gori/evidence";
import { assumptionValue, effectRange, launchBlock, RULES, type TurnStart } from "@/lib/gori/sim/engine";
import type { Action, ActiveIntervention, Branch, InterventionDef, ScenarioDef, SimConfig } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori } from "../store";

const BRANCHES: { id: Branch; bn: string; tone: string }[] = [
  { id: "capacity", bn: "সেবা-সক্ষমতা", tone: "text-bdgreen-500" },
  { id: "data", bn: "তথ্য ও জবাবদিহি", tone: "text-sky-300" },
  { id: "finance", bn: "অর্থায়ন ও সমতা", tone: "text-signal-orange" },
  { id: "infra", bn: "অবকাঠামো ও ঝুঁকি", tone: "text-bdorange-600" },
];

type Status = "running-pilot" | "running-full" | "planned" | "available" | "blocked";

export function InterventionBuilder({
  sc,
  config,
  state,
  draft,
  preview,
  disabled,
}: {
  sc: ScenarioDef;
  config: SimConfig;
  state: TurnStart;
  draft: Action[];
  preview: { budget: number; active: ActiveIntervention[] };
  disabled: boolean;
}) {
  const setDraft = useGori((s) => s.setDraft);
  const detail = useGori((s) => s.settings.detail);
  const { n } = useT();
  const [sel, setSel] = useState<string>(sc.interventions[0].id);

  const statusOf = (i: InterventionDef): Status => {
    const running = state.active.find((a) => a.id === i.id);
    if (draft.some((a) => "id" in a && a.id === i.id && (a.type === "launch" || a.type === "scale"))) return "planned";
    if (running) return running.scale === "pilot" ? "running-pilot" : "running-full";
    return launchBlock(sc, { vars: state.vars, budget: preview.budget, active: preview.active }, i.id, "pilot") ? "blocked" : "available";
  };

  const def = sc.interventions.find((i) => i.id === sel)!;
  const st = statusOf(def);
  const running = state.active.find((a) => a.id === def.id);
  const planned = draft.find((a) => "id" in a && a.id === def.id);
  const block = launchBlock(sc, { vars: state.vars, budget: preview.budget, active: preview.active }, def.id, "pilot");
  const blockFull = launchBlock(sc, { vars: state.vars, budget: preview.budget, active: preview.active }, def.id, "full");

  function put(a: Action) {
    setDraft([...draft.filter((x) => !("id" in x && x.id === def.id && x.type !== "fund")), a]);
  }
  function unplan() {
    setDraft(draft.filter((x) => !("id" in x && x.id === def.id)));
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="grid gap-3 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <section key={b.id} aria-labelledby={`br-${b.id}`} className="rounded-2xl bg-black ring-1 ring-white/12 p-3.5">
            <h3 id={`br-${b.id}`} className={cn("mb-2 font-bengali text-sm font-bold", b.tone)}>{b.bn}</h3>
            <ul className="space-y-2">
              {sc.interventions
                .filter((i) => i.branch === b.id)
                .map((i) => {
                  const s = statusOf(i);
                  const req = i.requires?.interventions?.map((r) => sc.interventions.find((x) => x.id === r)?.bn).join(", ");
                  return (
                    <li key={i.id}>
                      {req && <p className="mb-1 ml-3 border-l-2 border-dashed border-white/25 pl-2 font-bengali text-[11px] text-white/65">↳ আগে লাগবে: {req}</p>}
                      <button
                        type="button"
                        onClick={() => {
                          setSel(i.id);
                          // Below 2xl the plan sits under the tree; bring it into view.
                          if (window.matchMedia("(max-width: 1535px)").matches) requestAnimationFrame(() => document.getElementById("intervention-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
                        }}
                        aria-pressed={sel === i.id}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          sel === i.id ? "border-signal-orange bg-bdorange-600" : "border-white/10 hover:border-white/30",
                          s === "blocked" && sel !== i.id && "opacity-60",
                        )}
                      >
                        <StatusIcon s={s} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-bengali text-sm leading-snug font-semibold text-white">{i.bn}</span>
                          <span className="mt-0.5 block font-bengali text-[11px] text-white/65">
                            খরচ {n(i.cost)} · চলমান {n(i.upkeep)}/প্রান্তিক · কর্মী {n(i.workforce)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>

      <section id="intervention-detail" aria-label="হস্তক্ষেপের পরিকল্পনা" className="scroll-mt-header self-start rounded-2xl bg-black ring-1 ring-white/12 p-5 text-white lg:scroll-mt-header-lg 2xl:sticky 2xl:top-header-lg">
        <p className={cn("font-bengali text-xs font-bold", BRANCHES.find((b) => b.id === def.branch)?.tone)}>{BRANCHES.find((b) => b.id === def.branch)?.bn}</p>
        <h3 className="mt-0.5 font-bengali text-xl font-bold">{def.bn}</h3>
        <p className="text-xs text-white/65">{def.en}</p>
        <p className="mt-2 font-bengali text-sm leading-6 text-white/80">{def.summary}</p>

        {def.disclosure && (
          <p className="mt-3 flex gap-2 rounded-lg bg-signal-orange px-3 py-2 font-bengali text-xs leading-5 text-text-primary">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> {def.disclosure}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5 font-bengali text-sm">
          <Row k="লক্ষ্য" v={def.goal} wide />
          <Row k="লক্ষ্যগোষ্ঠী" v={def.target} wide />
          <Row k="দায়িত্বে" v={def.actors.map((a) => sc.stakeholders.find((s) => s.id === a)?.bn).join(", ")} wide />
          <Row k="শুরুর খরচ" v={`পূর্ণ ${n(def.cost)} · পাইলট ${n(def.cost * RULES.pilotCostShare)}`} />
          <Row k="চলমান খরচ" v={`${n(def.upkeep)}/প্রান্তিক (পাইলটে ${n(def.upkeep * RULES.pilotCostShare)})`} />
          <Row k="কর্মী" v={`${n(def.workforce)} (পাইলটে ${n(def.workforce * RULES.pilotWorkforceShare)})`} />
          <Row k="সময়রেখা" v={`${n(def.delay)} প্রান্তিক পর শুরু, ${n(def.ramp)} প্রান্তিকে পূর্ণ`} />
        </dl>

        <h4 className="mt-4 font-bengali text-xs font-bold text-white/65">প্রত্যাশিত প্রভাব (পূর্ণ পরিসরে, খেলার সহগ)</h4>
        <ul className="mt-1 space-y-1 font-bengali text-sm">
          {def.effects.map((e) => {
            const v = sc.variables.find((x) => x.id === e.v)!;
            const [lo, hi] = effectRange(config, e.range);
            const m = assumptionValue(sc, config, def.assumption);
            const good = (v.good === "up") === e.amount > 0;
            return (
              <li key={e.v} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  {e.amount > 0 ? <Plus className="size-3.5" aria-hidden /> : <Minus className="size-3.5" aria-hidden />}
                  {v.bn} {good ? "" : <span className="rounded bg-national-crimson px-1 text-[11px] text-white">পার্শ্বপ্রতিক্রিয়া</span>}
                </span>
                <span className="font-semibold tabular-nums">
                  {detail === "advanced" ? `${n(e.amount * lo * m)} থেকে ${n(e.amount * hi * m)}` : `প্রায় ${n(e.amount * m)}`}
                </span>
              </li>
            );
          })}
          {def.interactions?.map((x) => (
            <li key={x.with} className="font-bengali text-xs text-white/80">
              + {sc.interventions.find((i) => i.id === x.with)?.bn} সাথে থাকলে: {x.note}
            </li>
          ))}
        </ul>
        {detail === "advanced" && (
          <p className="mt-1 font-bengali text-[11px] text-white/65">পরিসর: প্রমাণের প্রাপ্যতা “{config.evidence === "low" ? "কম" : config.evidence === "high" ? "বেশি" : "মাঝারি"}” অনুযায়ী। আসল প্রভাব বীজ থেকে একবার নির্ধারিত হয়, পাইলটে দেখা যায়।</p>
        )}

        <details className="mt-4 font-bengali text-sm">
          <summary className="cursor-pointer font-semibold">ঝুঁকি, সমতা, রক্ষণাবেক্ষণ, মাপা ও বিকল্প পথ</summary>
          <dl className="mt-2 space-y-2 text-white/80">
            <Row k="ঝুঁকি" v={def.risks.join(" ")} wide />
            <Row k="সমতার পরিকল্পনা" v={def.equity} wide />
            <Row k="রক্ষণাবেক্ষণ" v={def.maintenance} wide />
            <Row k="মাপার পরিকল্পনা" v={def.measurementPlan} wide />
            <Row k="বিকল্প পথ" v={def.fallback} wide />
            {def.assumption && <Row k="নির্ভর করে যে অনুমানে" v={sc.assumptions.find((a) => a.id === def.assumption)!.bn} wide />}
            <Row k="প্রমাণ" v={def.evidenceRefs.map((r) => evidenceById.get(r)?.title ?? r).join("; ") + (def.basis === "assumption" ? " — মাত্রা খেলার অনুমান" : "")} wide />
          </dl>
        </details>

        <div className="mt-5 border-t border-white/12 pt-4">
          {disabled ? (
            <p className="font-bengali text-sm text-white/65">খেলা শেষ — ফলাফল দেখুন।</p>
          ) : planned ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bengali text-sm font-semibold text-bdorange-600">
                এই টার্নে পরিকল্পনায়: {planned.type === "launch" ? (planned.scale === "pilot" ? "পাইলট চালু" : "পূর্ণ চালু") : planned.type === "scale" ? "বড় করা" : "থামানো"}
              </span>
              <button type="button" onClick={unplan} className="rounded-lg border border-white/20 px-3 py-1.5 font-bengali text-sm">পরিকল্পনা থেকে সরান</button>
            </div>
          ) : running ? (
            <div className="flex flex-wrap gap-2">
              {running.scale === "pilot" && (
                <button type="button" onClick={() => put({ type: "scale", id: def.id })} className="rounded-xl bg-signal-orange px-4 py-2.5 font-bengali text-sm font-bold text-text-primary">
                  পূর্ণ পরিসরে নিন (খরচ {n(def.cost * RULES.scaleCostShare)})
                </button>
              )}
              <button type="button" onClick={() => put({ type: "stop", id: def.id })} className="rounded-xl border border-white/20 px-4 py-2.5 font-bengali text-sm font-semibold">
                থামান
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!!block} onClick={() => put({ type: "launch", id: def.id, scale: "pilot" })} className="rounded-xl bg-signal-orange px-4 py-2.5 font-bengali text-sm font-bold text-text-primary disabled:opacity-40">
                  পাইলট চালু (খরচ {n(def.cost * RULES.pilotCostShare)})
                </button>
                <button type="button" disabled={!!blockFull} onClick={() => put({ type: "launch", id: def.id, scale: "full" })} className="rounded-xl border border-white/25 px-4 py-2.5 font-bengali text-sm font-semibold text-white disabled:opacity-40">
                  সরাসরি পূর্ণ পরিসর (খরচ {n(def.cost)})
                </button>
              </div>
              {(block || blockFull) && (
                <p className="mt-2 flex items-start gap-1.5 font-bengali text-sm text-crimson-bright">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {block ?? blockFull}
                </p>
              )}
              <p className="mt-2 font-bengali text-xs leading-5 text-white/65">
                পাইলট: খরচ ৪০%, প্রভাব ৩৫%, পরে বড় করলে বাস্তবায়ন-ঝুঁকি নেই। সরাসরি পূর্ণ পরিসরে {n(Math.round(RULES.rolloutRisk[config.evidence] * 100))}% সম্ভাবনায় প্রথম দুই প্রান্তিক দুর্বল বাস্তবায়ন।
              </p>
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{st === "planned" ? "পরিকল্পনায় যোগ হয়েছে" : ""}</p>
      </section>
    </div>
  );
}

function StatusIcon({ s }: { s: Status }) {
  const map = {
    "running-pilot": { icon: CircleDot, cls: "text-bdgreen-500", label: "পাইলট চলছে" },
    "running-full": { icon: CheckCircle2, cls: "text-bdgreen-500", label: "পূর্ণ পরিসরে চলছে" },
    planned: { icon: Clock3, cls: "text-bdorange-600", label: "পরিকল্পনায়" },
    available: { icon: Square, cls: "text-white/65", label: "চালু করা যায়" },
    blocked: { icon: Lock, cls: "text-white/65", label: "শর্ত বাকি" },
  }[s];
  return (
    <span className={cn("mt-0.5 flex shrink-0 flex-col items-center", map.cls)} title={map.label}>
      <map.icon className="size-4" aria-hidden />
      <span className="sr-only">{map.label}</span>
    </span>
  );
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs text-white/65">{k}</dt>
      <dd className="leading-6 font-medium text-white">{v}</dd>
    </div>
  );
}
