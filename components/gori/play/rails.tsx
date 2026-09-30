"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Circle, Loader2, Minus, Pause, Play, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TurnStart } from "@/lib/gori/sim/engine";
import type { Action, ActionResult, RunResult, ScenarioDef } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori, type Game } from "../store";
import { CAMPAIGN_STAGES } from "./use-game";

/** Left rail — the state of the union (resources, indicators, stakeholders). */
export function StatusRail({ sc, run, game, budgetAfterDraft, onStakeholders }: { sc: ScenarioDef; run: RunResult; game: Game; budgetAfterDraft: number; onStakeholders: () => void }) {
  const { n } = useT();
  const last = game.turn > 0 ? run.turns[game.turn - 1] : null;
  const vars = last?.vars ?? run.start.vars;
  const index = last?.outcomeIndex ?? run.start.outcomeIndex;
  const gain = index - run.start.outcomeIndex;
  const support = last?.stakeholders ?? run.start.stakeholders;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-4" aria-label="সেবা সূচক">
        <p className="font-bengali text-xs text-white/80">সেবা সূচক · খেলার সূচক, বাস্তব পরিসংখ্যান নয়</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-bengali text-4xl font-extrabold tabular-nums">{n(index)}</span>
          {gain !== 0 && (
            <span className={cn("font-bengali text-sm font-bold", gain > 0 ? "text-white/70" : "text-signal-orange")}>
              {gain > 0 ? "▲" : "▼"} {n(Math.abs(Math.round(gain * 10) / 10))} শুরু থেকে
            </span>
          )}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 font-bengali text-sm">
          <div className="rounded-lg bg-white/6 px-2.5 py-2">
            <dt className="text-[11px] text-white/80">বাজেট (পরিকল্পনার পর)</dt>
            <dd className={cn("text-lg font-bold tabular-nums", budgetAfterDraft < 0 && "text-signal-orange")}>{n(Math.round(budgetAfterDraft))}</dd>
          </div>
          <div className="rounded-lg bg-white/6 px-2.5 py-2">
            <dt className="text-[11px] text-white/80">কর্মী-সংকুলান</dt>
            <dd className="text-lg font-bold tabular-nums">{n(Math.round((last?.workforceCoverage ?? 1) * 100))}%</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-4" aria-labelledby="vars-title">
        <h3 id="vars-title" className="font-bengali text-sm font-bold">ইউনিয়নের অবস্থা</h3>
        <ul className="mt-2 space-y-1.5">
          {sc.variables.map((v) => {
            const d = last?.delta[v.id] ?? 0;
            const better = d === 0 ? null : (v.good === "up") === d > 0;
            return (
              <li key={v.id} className="grid grid-cols-[minmax(0,1fr)_2.5rem_3.2rem] items-center gap-2 font-bengali text-sm">
                <span className="truncate text-white/85" title={v.description}>{v.bn}{v.good === "down" ? " ↓ভালো" : ""}</span>
                <span className="text-right font-bold tabular-nums">{n(Math.round(vars[v.id]))}</span>
                <span className={cn("flex items-center justify-end gap-0.5 text-xs font-semibold tabular-nums", better === null ? "text-white/80" : better ? "text-white/70" : "text-signal-orange")}>
                  {d > 0 ? <ArrowUp className="size-3" aria-hidden /> : d < 0 ? <ArrowDown className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}
                  {d !== 0 && n(Math.abs(d))}
                  <span className="sr-only">{better === null ? "অপরিবর্তিত" : better ? "ভালো দিকে" : "খারাপ দিকে"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-4" aria-labelledby="st-title">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="st-title" className="font-bengali text-sm font-bold">অংশীজনের সমর্থন</h3>
          <button type="button" onClick={onStakeholders} className="-my-2 inline-flex min-h-8 items-center px-1 font-bengali text-xs font-semibold text-signal-orange hover:underline">কে কী চান?</button>
        </div>
        <ul className="mt-2 space-y-2">
          {sc.stakeholders.map((s) => (
            <li key={s.id} className="font-bengali text-xs">
              <span className="flex justify-between text-white/85">
                <span>{s.bn}</span>
                <span className="tabular-nums">{n(Math.round(support[s.id]))}</span>
              </span>
              <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
                <span className={cn("block h-full rounded-full", support[s.id] < 45 ? "bg-orange-400" : "bg-emerald-400")} style={{ width: `${support[s.id]}%` }} />
              </span>
            </li>
          ))}
        </ul>
        {run.config.stakeholders === "simple" && <p className="mt-2 font-bengali text-[11px] text-white/80">সরল মোড: সমর্থন স্থির।</p>}
      </section>
    </div>
  );
}

function actionLabel(sc: ScenarioDef, a: Action): string {
  if (a.type === "respond") return `সাড়া: ${sc.events.find((e) => e.id === a.event)?.response?.bn}`;
  const name = sc.interventions.find((i) => i.id === a.id)?.bn ?? a.id;
  if (a.type === "launch") return `${a.scale === "pilot" ? "পাইলট চালু" : "পূর্ণ চালু"}: ${name}`;
  if (a.type === "scale") return `বড় করা: ${name}`;
  if (a.type === "stop") return `থামানো: ${name}`;
  return `অর্থায়ন ${Math.round(a.level * 100)}%: ${name}`;
}

/** Right rail — XCOM-style command list: stages, this turn's plan, responses, run. */
export function CommandRail({
  sc,
  game,
  state,
  draft,
  results,
  stages,
  finished,
  guided,
}: {
  sc: ScenarioDef;
  game: Game;
  state: TurnStart;
  draft: Action[];
  results: ActionResult[];
  stages: { done: Record<string, boolean>; current?: (typeof CAMPAIGN_STAGES)[number] };
  finished: boolean;
  guided: boolean;
}) {
  const { n } = useT();
  const setDraft = useGori((s) => s.setDraft);
  const playTurn = useGori((s) => s.playTurn);
  const rewind = useGori((s) => s.rewind);
  const speed = useGori((s) => s.settings.speed);
  const [auto, setAuto] = useState(false);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRun = auto && !finished;

  function run() {
    setRunning(true);
    // A beat so the change reads as a step, not a flicker.
    timer.current = setTimeout(() => {
      playTurn();
      setRunning(false);
    }, 250);
  }

  useEffect(() => {
    if (!autoRun) return;
    const ms = speed === "slow" ? 1600 : speed === "fast" ? 350 : 800;
    const id = setTimeout(() => playTurn(), ms);
    return () => clearTimeout(id);
  }, [autoRun, game.turn, speed, playTurn]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="space-y-4">
      {guided && (
        <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-4" aria-labelledby="stages-title">
          <h3 id="stages-title" className="font-bengali text-sm font-bold">অভিযানের ধাপ</h3>
          <ol className="mt-2 space-y-1.5">
            {CAMPAIGN_STAGES.map((s, i) => {
              const done = stages.done[s.id];
              const cur = stages.current?.id === s.id;
              return (
                <li key={s.id} className={cn("flex gap-2 font-bengali text-sm", done ? "text-white/75" : cur ? "text-white" : "text-white/80")}>
                  {done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Circle className={cn("mt-0.5 size-4 shrink-0", cur && "text-signal-orange")} aria-hidden />}
                  <span>
                    {n(i + 1)}. {s.bn}
                    <span className="sr-only">{done ? " — সম্পন্ন" : cur ? " — এখনকার ধাপ" : ""}</span>
                    {cur && <span className="mt-0.5 block text-xs text-white/80">{s.hint}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {!finished && (
        <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-4" aria-labelledby="draft-title">
          <h3 id="draft-title" className="font-bengali text-sm font-bold">এই টার্নের পরিকল্পনা</h3>
          {draft.length ? (
            <ul className="mt-2 space-y-1.5">
              {draft.map((a, i) => {
                const r = results[i];
                return (
                  <li key={i} className={cn("flex items-start gap-2 rounded-lg px-2.5 py-2 font-bengali text-sm", r?.ok === false ? "bg-orange-900/40" : "bg-white/6")}>
                    <span className="min-w-0 flex-1">
                      {actionLabel(sc, a)}
                      {r && (r.ok ? r.cost > 0 && <span className="block text-xs text-white/80">খরচ {n(r.cost)}</span> : <span className="block text-xs text-white/80">চলবে না: {r.reason}</span>)}
                    </span>
                    <button type="button" onClick={() => setDraft(draft.filter((_, j) => j !== i))} className="rounded p-0.5 hover:bg-white/10" aria-label={`সরান: ${actionLabel(sc, a)}`}>
                      <X className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 font-bengali text-sm text-white/80">কিছু বাছাই করা হয়নি — এই টার্নে শুধু চলমানগুলো চলবে।</p>
          )}

          {state.responses.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="font-bengali text-xs font-semibold text-signal-orange">গত টার্নের ঘটনায় সাড়া দেওয়া যায়</p>
              {state.responses.map((r) => {
                const on = draft.some((a) => a.type === "respond" && a.event === r.event);
                return (
                  <button
                    key={r.event}
                    type="button"
                    disabled={on}
                    onClick={() => setDraft([...draft, { type: "respond", event: r.event }])}
                    className="mt-1.5 block w-full rounded-lg bg-white/8 px-2.5 py-2 text-left font-bengali text-sm hover:bg-white/10 disabled:opacity-50"
                  >
                    {r.bn} — খরচ {n(r.cost)}
                    <span className="block text-xs text-white/80">{on ? "পরিকল্পনায় আছে" : r.note}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="space-y-2">
        <button
          type="button"
          onClick={run}
          disabled={finished || running || autoRun}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-signal-orange font-bengali text-lg font-extrabold text-text-primary shadow-[0_10px_24px_-12px_rgb(255_145_0/0.9)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
        >
          {running ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Play className="size-5" aria-hidden />}
          {finished ? "খেলা শেষ" : `টার্ন ${n(game.turn + 1)} চালান`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setAuto((x) => !x)} disabled={finished} aria-pressed={auto} className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white/8 font-bengali text-sm font-semibold hover:bg-white/10 disabled:opacity-40">
            {auto ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {auto ? "থামান" : "বাকিগুলো চালান"}
          </button>
          <button type="button" onClick={() => { setAuto(false); rewind(); }} disabled={game.turn === 0} className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white/8 font-bengali text-sm font-semibold hover:bg-white/10 disabled:opacity-40">
            <Undo2 className="size-4" aria-hidden /> এক টার্ন পিছনে
          </button>
        </div>
        <p className="font-bengali text-[11px] leading-5 text-white/80">
          “বাকিগুলো চালান” নতুন কিছু যোগ না করে চলমান পরিকল্পনায় টার্ন চালায় (গতি সেটিংসে)। পিছনে গেলে সেটি নতুন খেলা হিসেবে গণ্য হয়।
        </p>
      </section>
    </div>
  );
}
