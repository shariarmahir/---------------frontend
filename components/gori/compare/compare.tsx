"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { grant } from "@/lib/gori/progression";
import { scenarioOf, simulate } from "@/lib/gori/sim/engine";
import { configSummary } from "@/lib/gori/sim/report";
import { CATEGORIES, scoreRun } from "@/lib/gori/sim/score";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { BASE, LockedNotice, useFeature } from "../shell";
import { useGori, useHydrated } from "../store";
import { PixelMark } from "@/components/ui/section-kit";

/** Validated series order for the cream surface (dataviz check). */
const SERIES = ["#00875a", "#3651c9", "#c2410c"] as const;
const sc = scenarioOf("health-access");

export function Compare() {
  const hydrated = useHydrated();
  const open = useFeature("compare");
  const runs = useGori((s) => s.runs);
  const removeRun = useGori((s) => s.removeRun);
  const loadRun = useGori((s) => s.loadRun);
  const setProgress = useGori((s) => s.setProgress);
  const router = useRouter();
  const { n } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const chosen = useMemo(() => picked.map((k) => runs.find((r) => r.runKey === k)).filter((r) => r !== undefined).slice(0, 3), [picked, runs]);

  const results = useMemo(() => chosen.map((r) => ({ r, run: simulate(r.config, r.plan) })), [chosen]);

  useEffect(() => {
    if (chosen.length >= 2) setProgress((p) => grant(p, ["comparer"], new Date().toISOString()).progress);
  }, [chosen.length, setProgress]);

  if (!hydrated) return null;
  if (!open) return <div className="px-4 py-12"><LockedNotice feature="compare" /></div>;

  const sameSeed = chosen.length >= 2 && chosen.every((c) => c.config.seed === chosen[0].config.seed && c.config.context === chosen[0].config.context);
  const maxTurns = Math.max(0, ...results.map((x) => x.run.turns.length));
  const data = Array.from({ length: maxTurns + 1 }, (_, t) => {
    const row: Record<string, number | string> = { t };
    results.forEach((x, i) => {
      const v = t === 0 ? x.run.start.outcomeIndex : x.run.turns[t - 1]?.outcomeIndex;
      if (v !== undefined) row[`s${i}`] = v;
    });
    return row;
  });

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <PixelMark tone="dark" className="mb-2" />
      <h1 className="font-bengali text-3xl font-bold text-signal-orange">দৃশ্যকল্প তুলনা</h1>
      <p className="mt-2 max-w-[70ch] font-bengali text-white/85">সংরক্ষিত খেলা থেকে সর্বোচ্চ তিনটি বাছুন। একই বীজ আর একই প্রেক্ষাপট হলে তুলনা ন্যায্য — দুই কৌশল একই ঘটনার মুখোমুখি হয়েছে।</p>

      {runs.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/15 p-6 font-bengali text-white/80">
          এখনো কোনো খেলা সংরক্ষণ করা হয়নি। একটি খেলা শেষ করে চূড়ান্ত ফল পাতায় “সংরক্ষণ” চাপুন।{" "}
          <Link href={`${BASE}/play`} className="font-semibold text-signal-orange underline">খেলুন</Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <ul className="space-y-2" aria-label="সংরক্ষিত খেলা">
            {runs.map((r) => {
              const on = picked.includes(r.runKey);
              return (
                <li key={r.runKey} className={cn("rounded-xl p-3", on ? "bg-text-primary ring-1 ring-white/12 text-white" : "bg-text-primary ring-1 ring-white/12")}>
                  <label className="flex cursor-pointer gap-2.5">
                    <input
                      type="checkbox"
                      className="mt-1 accent-signal-orange"
                      checked={on}
                      disabled={!on && picked.length >= 3}
                      onChange={(e) => setPicked(e.target.checked ? [...picked, r.runKey] : picked.filter((k) => k !== r.runKey))}
                    />
                    <span className="min-w-0 flex-1 font-bengali">
                      <span className="block text-sm font-semibold">{r.name}</span>
                      <span className={cn("block text-xs", on ? "text-white/65" : "text-white/80")}>
                        স্কোর {n(r.total)} · সূচক {n(r.finalIndex)} · {configSummary(sc, r.config)} {r.verified ? "· সার্ভারে যাচাই" : "· স্থানীয়"}
                      </span>
                    </span>
                  </label>
                  <div className="mt-2 flex gap-2 pl-6">
                    <button type="button" onClick={() => { loadRun(r.config, r.plan, r.strategy); router.push(`${BASE}/play`); }} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bengali text-xs font-semibold", on ? "hover:bg-white/10" : "hover:bg-white/10")}>
                      <Play className="size-3.5" aria-hidden /> পুনরায় দেখুন
                    </button>
                    <button type="button" onClick={() => { removeRun(r.runKey); setPicked(picked.filter((k) => k !== r.runKey)); }} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bengali text-xs", on ? "hover:bg-white/10" : "hover:bg-white/10")}>
                      <Trash2 className="size-3.5" aria-hidden /> মুছুন
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="space-y-5">
            {chosen.length < 2 ? (
              <p className="rounded-2xl border border-white/15 p-6 font-bengali text-white/80">তুলনার জন্য অন্তত দুটি খেলা বাছুন।</p>
            ) : (
              <>
                <p className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 font-bengali text-sm", sameSeed ? "bg-emerald-900/50 text-white/80" : "bg-orange-900/40 text-white/85")}>
                  {sameSeed ? <CheckCircle2 className="size-4" aria-hidden /> : <AlertTriangle className="size-4" aria-hidden />}
                  {sameSeed ? "একই বীজ ও প্রেক্ষাপট — ন্যায্য তুলনা।" : "বীজ বা প্রেক্ষাপট আলাদা — পার্থক্যের একটা অংশ ঘটনা বা প্রেক্ষাপটের, কৌশলের নয়।"}
                </p>
                <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white">
                  <h2 className="font-bengali text-base font-bold text-signal-orange">সেবা সূচক, টার্ন অনুযায়ী (খেলার সূচক)</h2>
                  <div className="mt-3 h-72" role="img" aria-label="নির্বাচিত খেলাগুলোর সেবা সূচক টার্ন অনুযায়ী">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                        <CartesianGrid stroke="#e3e8e5" vertical={false} />
                        <XAxis dataKey="t" tickFormatter={(t) => n(t)} tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={{ stroke: "#cfd8d3" }} />
                        <YAxis domain={[(v: number) => Math.floor(v - 2), (v: number) => Math.ceil(v + 2)]} allowDecimals={false} tickFormatter={(v) => n(Math.round(Number(v)))} tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={false} width={44} />
                        <Tooltip formatter={(v, name) => [n(Number(v)), name]} labelFormatter={(t) => `টার্ন ${n(Number(t))}`} contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e5" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {results.map((x, i) => (
                          <Line key={x.r.runKey} dataKey={`s${i}`} name={x.r.name} stroke={SERIES[i]} strokeWidth={2} dot={{ r: 4, fill: SERIES[i], stroke: "#f7f8f3", strokeWidth: 2 }} isAnimationActive={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className="relative overflow-x-auto rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white">
                  <table className="w-full min-w-[34rem] font-bengali text-sm">
                    <caption className="mb-2 text-left font-bold">শেষ অবস্থা ও স্কোর</caption>
                    <thead>
                      <tr className="text-left text-xs text-white/65">
                        <th scope="col" className="py-1.5">মাপ</th>
                        {results.map((x, i) => (
                          <th key={x.r.runKey} scope="col" className="py-1.5">
                            <span className="mr-1 inline-block size-2.5 rounded-full" style={{ background: SERIES[i] }} aria-hidden />
                            {x.r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sc.variables.map((v) => (
                        <tr key={v.id} className="border-t border-white/12">
                          <th scope="row" className="py-1.5 text-left font-medium">{v.bn}{v.good === "down" ? " (কম ভালো)" : ""}</th>
                          {results.map((x) => <td key={x.r.runKey} className="tabular-nums">{n(x.run.turns.at(-1)?.vars[v.id] ?? 0)}</td>)}
                        </tr>
                      ))}
                      {CATEGORIES.map((c) => (
                        <tr key={c.id} className="border-t border-white/12 bg-white/60">
                          <th scope="row" className="py-1.5 text-left font-medium">স্কোর: {c.bn}</th>
                          {results.map((x) => <td key={x.r.runKey} className="tabular-nums">{n(scoreRun(x.run, x.r.strategy).categories[c.id])}</td>)}
                        </tr>
                      ))}
                      <tr className="border-t-2 border-white/20 font-bold">
                        <th scope="row" className="py-1.5 text-left">মোট স্কোর</th>
                        {results.map((x) => <td key={x.r.runKey} className="tabular-nums">{n(x.r.total)}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
