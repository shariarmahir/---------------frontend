"use client";

import { useMemo, useState } from "react";
import { REGIONS, SEASON_LABELS, TRIP_SOURCE, type Season } from "@/data/motherland-trip";
import { planTrip } from "@/lib/motherland-trip";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";

/*
 * Plan your trip: pick where you want to go, the season and how many days, and
 * the planner works out an approximate cost, the cheapest way in, a day-by-day
 * route and nearby places to add. It reads plain tables — no live data, no
 * account — and says, in the open, that every figure is an estimate.
 */

const SEASONS: Season[] = ["winter", "spring", "summer", "monsoon", "autumn"];

const regionName = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? id;

export function TripPlanner() {
  const [picked, setPicked] = useState<string[]>(["sylhet"]);
  const [season, setSeason] = useState<Season>("winter");
  const [days, setDays] = useState(4);

  const plan = useMemo(() => planTrip(picked, season, days), [picked, season, days]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <section aria-labelledby="plan-title" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28" id="plan-your-trip">
      <div className={cn(COLUMN, "flex flex-col gap-10")}>
        <div className="flex flex-col gap-4">
          <h2 id="plan-title" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
            Plan your trip
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Choose where you want to go, when, and for how long. We will sketch a route, the cheapest way in and a rough cost. Every figure is an estimate to plan around, not a price.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* The choices */}
          <form className="flex flex-col gap-7" aria-label="Trip choices">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-semibold tracking-wide text-white/60 uppercase">Where to</legend>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={picked.includes(r.id)}
                    onClick={() => toggle(r.id)}
                    className={cn(
                      "min-h-11 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                      picked.includes(r.id) ? "bg-signal-orange text-ml-ink" : "bg-white/10 text-white hover:bg-white/20",
                    )}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold tracking-wide text-white/60 uppercase">Season</span>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as Season)}
                  className="min-h-12 rounded-xl border border-white/20 bg-white/5 px-4 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s} className="text-ml-ink">
                      {SEASON_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold tracking-wide text-white/60 uppercase">Days: {days}</span>
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-4 w-full accent-signal-orange"
                  aria-label={`Number of days: ${days}`}
                />
              </label>
            </div>
          </form>

          {/* The plan */}
          <div className="flex flex-col gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/12 sm:p-8" aria-live="polite">
            {plan.route.length === 0 ? (
              <p className="text-white/70">Pick at least one place to see a plan.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-white/60 uppercase">Approximate cost</p>
                    <p className="font-ml-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-[0.01em] text-signal-orange">
                      ${plan.totalUsd}
                    </p>
                    <p className="text-sm text-white/60">per person · {plan.days} days</p>
                  </div>
                  <p className="max-w-[12rem] text-sm text-white/60">
                    ${plan.lodgingFoodUsd} stay &amp; food, plus travel from Dhaka.
                  </p>
                </div>

                {plan.transport.length ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold tracking-wide text-white/60 uppercase">Getting there (cheapest)</p>
                    <ul className="flex flex-col gap-1.5">
                      {plan.transport.map((t, i) => (
                        <li key={`${t.mode}-${i}`} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="font-semibold">{t.mode}</span>
                          <span className="text-white/70">
                            ৳{t.fare.toLocaleString("en-US")} · ~{t.hours}h{t.note ? ` · ${t.note}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold tracking-wide text-white/60 uppercase">Your route</p>
                  <ol className="flex flex-col gap-1.5">
                    {plan.route.map((d) => (
                      <li key={d.day} className="flex gap-3 text-sm">
                        <span className="w-14 shrink-0 font-semibold text-signal-orange">Day {d.day}</span>
                        <span className="text-white/85">
                          {d.regionName} — {d.focus}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {plan.seasonWarnings.length ? (
                  <ul className="flex flex-col gap-1 rounded-xl bg-ml-red/15 p-4 text-sm text-white/90 ring-1 ring-ml-red/40">
                    {plan.seasonWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                ) : null}

                {plan.nearby.length ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold tracking-wide text-white/60 uppercase">You might also add</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.nearby.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggle(id)}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          + {regionName(id)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-white/55">{TRIP_SOURCE}</p>
      </div>
    </section>
  );
}
