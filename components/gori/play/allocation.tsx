"use client";

import { RULES, timeScale, type TurnStart } from "@/lib/gori/sim/engine";
import { FUNDING_LEVELS, type Action, type ActiveIntervention, type ScenarioDef, type SimConfig } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori } from "../store";

/**
 * Resource allocation: funding level per running intervention (opportunity
 * cost is explicit — every point of upkeep here is a point not spent
 * elsewhere), workforce against capacity, and next turn's budget.
 */
export function Allocation({
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
  const { n } = useT();
  const ts = timeScale(config);
  const income = sc.budget[config.budget].income * RULES.difficultyBudget[config.difficulty] * ts;
  const capacity = sc.workforce[config.workforce];
  const upkeepOf = (a: ActiveIntervention) => sc.interventions.find((i) => i.id === a.id)!.upkeep * (a.scale === "pilot" ? RULES.pilotCostShare : 1) * a.funding * ts;
  const upkeep = preview.active.reduce((s, a) => s + upkeepOf(a), 0);
  const demand = preview.active.reduce((s, a) => s + sc.interventions.find((i) => i.id === a.id)!.workforce * (a.scale === "pilot" ? RULES.pilotWorkforceShare : 1), 0);
  const nextBudget = preview.budget + income - Math.min(upkeep, Math.max(0, preview.budget + income));

  function setFunding(id: string, level: number) {
    const rest = draft.filter((a) => !(a.type === "fund" && a.id === id));
    const current = state.active.find((a) => a.id === id)?.funding ?? 1;
    setDraft(level === current ? rest : [...rest, { type: "fund", id, level }]);
  }

  return (
    <div className="space-y-5 text-gori-ink">
      <dl className="grid gap-3 sm:grid-cols-4">
        <Stat k="এই টার্নের পর বাজেট" v={n(Math.round(preview.budget))} />
        <Stat k="আয় / প্রান্তিক" v={`+${n(Math.round(income))}`} />
        <Stat k="চলমান খরচ / প্রান্তিক" v={`−${n(Math.round(upkeep))}`} warn={upkeep > income} />
        <Stat k="পরের টার্নের আনুমানিক বাজেট" v={n(Math.round(nextBudget))} warn={nextBudget < 0 || upkeep > preview.budget + income} />
      </dl>

      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-baseline justify-between font-bengali">
          <h3 className="text-sm font-bold">কর্মী</h3>
          <span className={cn("text-sm font-semibold tabular-nums", demand > capacity ? "text-national-crimson" : "text-gori-ink")}>
            চাহিদা {n(demand)} / সক্ষমতা {n(capacity)}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label="কর্মী চাহিদা" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={demand}>
          <div className={cn("h-full rounded-full", demand > capacity ? "bg-national-crimson" : "bg-[#00875a]")} style={{ width: `${Math.min(100, (demand / capacity) * 100)}%` }} />
        </div>
        {demand > capacity && (
          <p className="mt-2 font-bengali text-sm text-national-crimson">
            কর্মী কম — সব হস্তক্ষেপের কার্যকারিতা {n(Math.round((capacity / demand) * 100))}%-এ নামবে। কিছু পাইলটে রাখুন বা থামান।
          </p>
        )}
      </div>

      {preview.active.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 font-bengali text-sm text-gori-mute">কোনো হস্তক্ষেপ চলছে না। “হস্তক্ষেপ” ট্যাবে কিছু চালু করলে এখানে অর্থায়ন ঠিক করা যাবে।</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[40rem] font-bengali text-sm">
            <caption className="sr-only">চলমান হস্তক্ষেপের অর্থায়ন</caption>
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-gori-mute">
                <th scope="col" className="px-4 py-2.5 font-semibold">হস্তক্ষেপ</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">রক্ষণাবেক্ষণ</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">অর্থায়ন</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">চলমান খরচ</th>
              </tr>
            </thead>
            <tbody>
              {preview.active.map((a) => {
                const def = sc.interventions.find((i) => i.id === a.id)!;
                const current = state.active.find((x) => x.id === a.id);
                return (
                  <tr key={a.id} className="border-b border-slate-50">
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      {def.bn}
                      <span className="block text-xs font-normal text-gori-mute">{a.scale === "pilot" ? "পাইলট" : "পূর্ণ"}{current ? "" : " · এই টার্নে চালু হবে"}</span>
                    </th>
                    <td className="px-4 py-3">
                      {current ? (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-16 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                            <span className={cn("block h-full", current.maintenance < 0.7 ? "bg-national-crimson" : "bg-[#00875a]")} style={{ width: `${current.maintenance * 100}%` }} />
                          </span>
                          <span className="tabular-nums">{n(Math.round(current.maintenance * 100))}%</span>
                        </span>
                      ) : (
                        <span className="text-gori-mute">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`fund-${a.id}`}>{def.bn}-এর অর্থায়ন</label>
                      <select
                        id={`fund-${a.id}`}
                        value={a.funding}
                        disabled={disabled || !current}
                        onChange={(e) => setFunding(a.id, Number(e.target.value))}
                        className="h-9 rounded-lg border border-gori-ink/15 bg-white px-2 disabled:opacity-50"
                      >
                        {FUNDING_LEVELS.map((l) => (
                          <option key={l} value={l}>{n(l * 100)}%{l < 1 ? " — ক্ষয় বাড়ে" : l > 1 ? " — প্রভাব বাড়ে" : ""}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{n(Math.round(upkeepOf(a) * 10) / 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="font-bengali text-xs leading-5 text-gori-mute">
        নিয়ম: প্রভাব অর্থায়নের বর্গমূলে বাড়ে (৫০% → প্রায় ৭১%, ১৫০% → প্রায় ১২২%); ১০০%-এর নিচে রক্ষণাবেক্ষণ দ্রুত ক্ষয় হয়। চলমান খরচ মেটাতে না পারলে সব হস্তক্ষেপের রক্ষণাবেক্ষণ কমে। সব সংখ্যা খেলার সহগ।
      </p>
    </div>
  );
}

function Stat({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <dt className="font-bengali text-xs text-gori-mute">{k}</dt>
      <dd className={cn("mt-0.5 font-bengali text-2xl font-bold tabular-nums", warn ? "text-national-crimson" : "text-gori-ink")}>{v}</dd>
    </div>
  );
}
