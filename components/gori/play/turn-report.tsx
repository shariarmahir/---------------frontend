"use client";

import { ArrowDown, ArrowUp, CloudLightning, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { bandsAt, type Band } from "@/lib/gori/sim/engine";
import { turnReport } from "@/lib/gori/sim/report";
import type { RunResult, ScenarioDef } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori } from "../store";
import { periodLabel } from "./use-game";

export function TurnReportView({ sc, run, played }: { sc: ScenarioDef; run: RunResult; played: number }) {
  const [turn, setTurn] = useState(played - 1);
  const detail = useGori((s) => s.settings.detail);
  const { n } = useT();
  const t = Math.min(turn, played - 1);
  const r = useMemo(() => (t >= 0 ? turnReport(run, t) : null), [run, t]);
  const [bands, setBands] = useState<{ turn: number; b: Record<string, Band> } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!r || t < 0) {
    return <p className="rounded-2xl bg-white p-6 font-bengali text-gori-mute">এখনো কোনো টার্ন চালানো হয়নি। পরিকল্পনা করে “টার্ন চালান” চাপুন।</p>;
  }
  const rec = run.turns[t];
  const vName = (id: string) => sc.variables.find((v) => v.id === id)?.bn ?? id;

  return (
    <div className="space-y-4 text-gori-ink">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="report-turn" className="font-bengali text-sm font-semibold text-emerald-50">কোন টার্ন</label>
        <select id="report-turn" value={t} onChange={(e) => setTurn(Number(e.target.value))} className="h-10 rounded-lg border border-white/20 bg-white px-3 font-bengali text-sm">
          {run.turns.slice(0, played).map((x) => (
            <option key={x.turn} value={x.turn}>টার্ন {n(x.turn + 1)} · {periodLabel(run.config, x.turn)}</option>
          ))}
        </select>
        <span className="font-bengali text-xs text-emerald-100/75">সব ফল খেলার মডেলে — বাস্তব ফল নয়।</span>
      </div>

      {r.events.map((e) => (
        <div key={e.id} className="flex gap-3 rounded-2xl bg-[#3a1a14] p-4 text-white">
          <CloudLightning className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden />
          <div className="font-bengali">
            <p className="font-bold">{e.bn} <span className="ml-1 rounded bg-white/10 px-1.5 text-[11px] font-normal">{e.source === "context" ? "প্রেক্ষাপটভিত্তিক — সম্ভাবনা খেলার সহগ" : "খেলার নিয়ম"}</span></p>
            <p className="mt-1 text-sm text-white/85">{e.explanation}</p>
            <p className="mt-1 text-sm">
              ধাক্কা: {Object.entries(e.shocks).map(([v, x]) => `${vName(v)} ${x > 0 ? "+" : ""}${n(x)}`).join(", ")}
              {e.mitigation > 0 ? ` · ${n(Math.round(e.mitigation * 100))}% ঠেকানো গেছে (${e.mitigatedBy.map((i) => sc.interventions.find((x) => x.id === i)?.bn).join(", ")})` : " · কোনো প্রস্তুতি ছিল না"}
            </p>
            <p className="text-[11px] text-white/60">ট্রিগার: {e.trigger}</p>
          </div>
        </div>
      ))}

      <Block title="কী বদলাল, আর কেন">
        {r.changes.length ? (
          <ul className="divide-y divide-slate-100">
            {r.changes.map((c) => (
              <li key={c.v} className="py-2.5">
                <div className="flex items-center justify-between gap-3 font-bengali">
                  <span className="font-semibold">{c.bn}</span>
                  <span className={cn("flex items-center gap-1 font-bold tabular-nums", c.good ? "text-[#00704b]" : "text-[#b3380a]")}>
                    {c.delta > 0 ? <ArrowUp className="size-3.5" aria-hidden /> : <ArrowDown className="size-3.5" aria-hidden />}
                    {n(c.from)} → {n(c.to)}
                    <span className="sr-only">{c.good ? "(ভালো দিকে)" : "(খারাপ দিকে)"}</span>
                  </span>
                </div>
                <p className="mt-0.5 font-bengali text-sm leading-6 text-gori-ink-soft">{c.sentence}</p>
                {detail === "advanced" && (
                  <p className="mt-0.5 font-bengali text-xs text-gori-mute">
                    {c.parts.map((p) => `${p.label} ${p.amount > 0 ? "+" : ""}${n(p.amount)}`).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-bengali text-sm text-gori-mute">কিছু বদলায়নি।</p>
        )}
      </Block>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="খরচ">
          <dl className="grid grid-cols-2 gap-2 font-bengali text-sm">
            <KV k="নতুন চালুর খরচ" v={n(r.costs.upfront)} />
            <KV k="চলমান খরচ" v={`${n(r.costs.upkeepPaid)} / ${n(r.costs.upkeepDue)}`} warn={r.costs.upkeepPaid < r.costs.upkeepDue} />
            <KV k="আয়" v={`+${n(r.costs.income)}`} />
            <KV k="বাকি বাজেট" v={n(r.costs.budgetEnd)} />
            <KV k="কর্মী-সংকুলান" v={`${n(Math.round(rec.workforceCoverage * 100))}%`} warn={rec.workforceCoverage < 1} />
          </dl>
        </Block>
        <Block title="অনিশ্চয়তা">
          <p className="font-bengali text-sm">
            <strong>{r.uncertainty.level === "high" ? "বেশি" : r.uncertainty.level === "medium" ? "মাঝারি" : "কম"}</strong> — {r.uncertainty.reason}
          </p>
          {bands?.turn === t ? (
            <ul className="mt-2 space-y-1 font-bengali text-xs">
              <li className="font-semibold">১০–৯০% পরিসর, একই পরিকল্পনা ২৪টি বীজে:</li>
              <li>সেবা সূচক: {n(bands.b.__index.p10)} – {n(bands.b.__index.p90)} (মাঝামাঝি {n(bands.b.__index.p50)})</li>
              {sc.variables.slice(0, 6).map((v) => (
                <li key={v.id}>{v.bn}: {n(bands.b[v.id].p10)} – {n(bands.b[v.id].p90)}</li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                // Let the spinner paint before the synchronous work.
                setTimeout(() => {
                  setBands({ turn: t, b: bandsAt(run.config, run.plan, t, 24) });
                  setBusy(false);
                }, 20);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gori-ink/20 px-3 py-1.5 font-bengali text-sm font-semibold"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} পরিসর হিসাব করুন (২৪টি বীজ)
            </button>
          )}
        </Block>
        <Block title="সুফল">
          <List items={r.benefits.slice(0, 6).map((b) => `${b.label}: ${b.amount > 0 ? "+" : ""}${n(b.amount)}`)} empty="এই টার্নে হস্তক্ষেপ থেকে সরাসরি সুফল আসেনি।" />
        </Block>
        <Block title="পার্শ্বপ্রতিক্রিয়া">
          <List items={r.sideEffects.slice(0, 6).map((b) => `${b.label}: ${n(b.amount)}${b.note ? ` — ${b.note}` : ""}`)} empty="উল্লেখযোগ্য পার্শ্বপ্রতিক্রিয়া নেই।" />
        </Block>
        <Block title="যে অনুমানে ফল দাঁড়িয়ে">
          <List items={r.assumptions.map((a) => `${a.bn}: ${a.choice} (${a.basis === "dossier" ? "প্রতিবেদন-সমর্থিত প্রসঙ্গ" : "খেলার অনুমান"})`)} empty="এই টার্নের বড় পরিবর্তন কোনো বাছাইযোগ্য অনুমানের ওপর দাঁড়িয়ে নেই।" />
        </Block>
        <Block title="নির্ভরতা">
          <List items={r.dependencies.map((d) => `${d.bn}: ${d.note}`)} empty="কোনো শর্ত বাকি নেই।" />
        </Block>
        <Block title="রক্ষণাবেক্ষণ">
          <List items={r.maintenance.map((m) => `${m.bn}: ${n(Math.round(m.maintenance * 100))}% — ${m.note}`)} empty="সব চলমান হস্তক্ষেপ ভালোভাবে রক্ষণাবেক্ষিত।" />
        </Block>
        <Block title="পরের প্রশ্ন">
          <List items={r.questions} />
        </Block>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4">
      <h3 className="mb-2 font-bengali text-sm font-bold text-gori-ink">{title}</h3>
      {children}
    </section>
  );
}

function List({ items, empty }: { items: string[]; empty?: string }) {
  return items.length ? (
    <ul className="list-disc space-y-1 pl-5 font-bengali text-sm leading-6 text-gori-ink-soft">
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  ) : (
    <p className="font-bengali text-sm text-gori-mute">{empty}</p>
  );
}

function KV({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gori-mute">{k}</dt>
      <dd className={cn("font-semibold tabular-nums", warn && "text-national-crimson")}>{v}</dd>
    </div>
  );
}
