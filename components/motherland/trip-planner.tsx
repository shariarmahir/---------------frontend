"use client";

import { useMemo, useState } from "react";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes, project } from "@/data/bangladesh-map";
import { MONTHS, REGIONS, TOUR_PLANS, TRIP_SOURCES } from "@/data/motherland-trip";
import { TAKA_PER_USD, parseAsk, pickLeg, planTrip, type Style, type TripPlan } from "@/lib/motherland-trip";
import type { LegKind } from "@/data/motherland-trip";
import { cn } from "@/lib/utils";
import { COLUMN, pill } from "./kit";

const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;
const dollars = (n: number) => `$${Math.round(n / TAKA_PER_USD).toLocaleString("en-US")}`;
const nameOf = (id: string) => (id === "dhaka" ? "Dhaka" : (REGIONS.find((r) => r.id === id)?.name ?? "Dhaka"));
const DHAKA = project(23.75, 90.4);
const PREFERS: { id: LegKind; label: string }[] = [
  { id: "easiest", label: "Easiest road" },
  { id: "fun", label: "Most enjoyable" },
  { id: "cheapest", label: "Cheapest" },
];
const EXAMPLES = ["5 days in Sylhet in July, easiest road", "A week seeing tigers in winter for $600", "Beach and coral in December under 40000 taka", "3 days, most scenic, in Bandarban"];

/** The country with every road from Dhaka faint and your own route drawn over it in gold. */
function RouteMap({ plan }: { plan: TripPlan }) {
  const chosen = new Set(plan.stops.map((s) => s.region.id));
  const points = [DHAKA, ...plan.stops.filter((s) => s.region.id !== "dhaka").map((s) => project(s.region.lat, s.region.lon))];
  return (
    <div className="relative mx-auto aspect-600/842 w-full max-w-md">
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={`Your route: Dhaka, ${plan.stops.map((s) => s.region.name).join(", ")}`} className="absolute inset-0 size-full">
        {divisionShapes.map((d) => (
          <path key={d.id} d={d.d} className="fill-ml-ground stroke-ml-navy/25" strokeWidth={1.5} strokeLinejoin="round" />
        ))}
        {REGIONS.filter((r) => r.id !== "dhaka").map((r) => {
          const at = project(r.lat, r.lon);
          return <line key={r.id} x1={DHAKA.x} y1={DHAKA.y} x2={at.x} y2={at.y} className="stroke-ml-navy/12" strokeWidth={1.5} strokeDasharray="3 6" />;
        })}
        {points.length > 1 ? <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" className="stroke-signal-orange" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {REGIONS.map((r) => {
          const at = project(r.lat, r.lon);
          const on = chosen.has(r.id);
          return (
            <g key={r.id}>
              <circle cx={at.x} cy={at.y} r={on ? 11 : 6} className={on ? "fill-ml-navy stroke-signal-orange" : "fill-ml-navy/55 stroke-white"} strokeWidth={on ? 4 : 2} />
              {on ? (
                <text x={at.x + 16} y={at.y + 6} className="fill-ml-navy text-[20px] font-bold">
                  {r.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Plan your trip: the page's last word. Ask in your own words, or pick places,
 * a month and how you like to travel, and it draws the route and works out the
 * cost from the fare tables. Prices are estimates, and it says which are which.
 */
export function TripPlanner() {
  const [picked, setPicked] = useState<string[]>(["sylhet", "srimangal"]);
  const [month, setMonth] = useState(12);
  const [days, setDays] = useState(5);
  const [prefer, setPrefer] = useState<LegKind>("easiest");
  const [style, setStyle] = useState<Style>("comfort");
  const [budget, setBudget] = useState<number | null>(null);
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const plan = useMemo(() => planTrip({ regions: picked, month, days, prefer, style, budgetBdt: budget }), [picked, month, days, prefer, style, budget]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const apply = (p: { regions: string[]; days: number | null; month: number | null; budgetBdt: number | null; prefer: LegKind | null; style?: Style | null }) => {
    if (p.regions.length) setPicked(p.regions);
    if (p.days) setDays(Math.min(30, p.days));
    if (p.month) setMonth(p.month);
    setBudget(p.budgetBdt);
    if (p.prefer) setPrefer(p.prefer);
    if (p.style) setStyle(p.style);
  };

  const submit = async (text: string) => {
    if (!text.trim()) return;
    const local = parseAsk(text);
    apply(local);
    setAnswer(local.regions.length ? null : "Tell us a place, or a thing you want to see, such as tigers, tea, coral or hills. Your plan below is still ready to change.");
    setBusy(true);
    try {
      const res = await fetch("/api/motherland/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ask: text }) });
      if (res.ok) {
        const data = (await res.json()) as { mode: string; plan?: Parameters<typeof apply>[0]; note?: string };
        if (data.mode === "model" && data.plan) {
          apply(data.plan);
          setAnswer(data.note ?? null);
        }
      }
    } catch {
      /* The tables have already answered. */
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="plan" aria-labelledby="plan-title" className="scroll-mt-(--ml-header) bg-white py-12 text-ml-ink sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-col gap-12")}>
        <div className="flex flex-col gap-4">
          <h2 id="plan-title" className="font-ml-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[1.02] tracking-[0.01em] uppercase">
            Plan your trip
          </h2>
          <p className="max-w-3xl text-lg leading-relaxed sm:text-xl">Ask in your own words, or choose below. We draw the best route for the season, with the road, the price and what to watch for.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(ask);
          }}
          className="flex flex-col gap-3 rounded-3xl bg-ml-navy p-4 sm:p-6"
        >
          <label htmlFor="trip-ask" className="sr-only">
            Ask about your trip
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id="trip-ask" value={ask} onChange={(e) => setAsk(e.target.value)} maxLength={300} placeholder="Where do you want to go, when, for how long, and for how much…" className="min-h-14 min-w-0 flex-1 rounded-full bg-white px-6 text-lg text-ml-ink placeholder:text-ml-ink/55 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange" />
            <button type="submit" disabled={busy} className={cn(pill.onDark, "min-h-14 disabled:opacity-70")}>
              {busy ? "Planning" : "Plan it"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setAsk(ex);
                  void submit(ex);
                }}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                {ex}
              </button>
            ))}
          </div>
          {answer ? (
            <p aria-live="polite" className="rounded-2xl bg-white/10 p-4 leading-relaxed text-white">
              {answer}
            </p>
          ) : null}
        </form>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
          <div className="flex flex-col gap-8">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-lg font-bold">Where</legend>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button key={r.id} type="button" aria-pressed={picked.includes(r.id)} onClick={() => toggle(r.id)} className={cn("min-h-11 rounded-full px-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy", picked.includes(r.id) ? "bg-ml-navy text-white" : "bg-ml-ground hover:bg-signal-orange/50")}>
                    {r.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-lg font-bold">
                Month
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="min-h-12 rounded-xl bg-ml-ground px-4 font-semibold ring-1 ring-ml-ink/15 focus-visible:outline-2 focus-visible:outline-ml-navy">
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-lg font-bold">
                {days} {days === 1 ? "day" : "days"}
                <input type="range" min={1} max={21} value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-3 w-full accent-ml-navy" />
              </label>
            </div>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-lg font-bold">How do you like to travel?</legend>
              <div className="flex flex-wrap gap-2">
                {PREFERS.map((p) => (
                  <button key={p.id} type="button" aria-pressed={prefer === p.id} onClick={() => setPrefer(p.id)} className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy", prefer === p.id ? "bg-signal-orange" : "bg-ml-ground hover:bg-signal-orange/50")}>
                    {p.label}
                  </button>
                ))}
                {(["comfort", "budget"] as const).map((s) => (
                  <button key={s} type="button" aria-pressed={style === s} onClick={() => setStyle(s)} className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy", style === s ? "bg-ml-navy text-white" : "bg-ml-ground hover:bg-signal-orange/50")}>
                    {s === "comfort" ? "Comfortable stays" : "Budget stays"}
                  </button>
                ))}
              </div>
            </fieldset>
            <RouteMap plan={plan} />
          </div>

          <div aria-live="polite" className="flex flex-col gap-7">
            {!plan.stops.length ? (
              <p className="rounded-3xl bg-ml-ground p-8 text-lg">Choose at least one place to see your plan.</p>
            ) : (
              <>
                <div className="rounded-3xl bg-signal-orange p-7 sm:p-9">
                  <p className="font-semibold">About, for one person</p>
                  <p className="font-ml-display text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-[0.01em]">{taka(plan.totalBdt)}</p>
                  <p className="mt-1 text-xl font-bold">{dollars(plan.totalBdt)}</p>
                  <p className="mt-3">
                    {taka(plan.stayBdt)} for {plan.days} {plan.days === 1 ? "day" : "days"} of bed, food and local transport, and {taka(plan.travelBdt)} of long-distance travel.
                  </p>
                  {plan.overBudgetBy ? <p className="mt-3 rounded-xl bg-white p-3 font-semibold">{taka(plan.overBudgetBy)} over your budget. Try budget stays, fewer days, or the cheapest road.</p> : null}
                </div>

                {plan.warnings.length ? (
                  <ul className="flex flex-col gap-2">
                    {plan.warnings.map((w) => (
                      <li key={w.text} className={cn("rounded-2xl p-4 leading-relaxed", w.level === "closed" ? "bg-ml-red font-semibold text-white" : "bg-ml-ground")}>
                        {w.text}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-col gap-3">
                  <h3 className="font-ml-display text-3xl tracking-[0.01em] uppercase">Your days</h3>
                  <ol className="flex flex-col gap-3">
                    {plan.stops.map((s) => (
                      <li key={s.region.id} className="rounded-2xl bg-ml-ground p-5">
                        <p className="text-lg font-bold">
                          {s.region.name}, {s.days} {s.days === 1 ? "day" : "days"}
                        </p>
                        <p className="mt-1 leading-relaxed">{s.doing.join(". ")}.</p>
                        {s.note?.level === "best" ? <p className="mt-2 font-semibold text-ml-green">{s.note.text}</p> : null}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-ml-display text-3xl tracking-[0.01em] uppercase">Getting there</h3>
                  <ol className="flex flex-col divide-y divide-ml-ink/10 rounded-2xl bg-ml-ground">
                    {plan.legs.map((l, i) => (
                      <li key={`${l.from}-${l.to}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 p-4">
                        <span className="min-w-0 flex-1 basis-60">
                          <span className="font-bold">
                            {nameOf(l.from)} to {nameOf(l.to)}
                          </span>
                          <span className="block text-ml-ink/75">{l.how}</span>
                        </span>
                        <span className="font-semibold whitespace-nowrap">
                          {l.fare ? taka(l.fare) : "Included"}, about {l.hours}h
                          <span className="block text-right text-sm font-normal text-ml-ink/65">{l.checked ? "Published fare" : "Rough estimate"}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {plan.nearby.length ? (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-ml-display text-3xl tracking-[0.01em] uppercase">Close by</h3>
                    <ul className="flex flex-col gap-2">
                      {plan.nearby.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ml-ground p-4">
                          <span className="min-w-0 flex-1 basis-60">
                            <span className="font-bold">{r.name}.</span> {r.blurb}
                          </span>
                          <button type="button" onClick={() => toggle(r.id)} className="rounded-full bg-ml-navy px-4 py-2 font-semibold text-white transition-colors hover:bg-ml-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                            Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-ml-display text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-[0.01em] uppercase">Ready-made tours</h3>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {TOUR_PLANS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(t.regions);
                    setDays(t.days);
                    setMonth(t.month);
                    setBudget(null);
                    setAnswer(null);
                    document.getElementById("plan-title")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex h-full w-full flex-col gap-2 rounded-2xl bg-ml-ground p-5 text-left transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy"
                >
                  <span className="text-lg font-bold">{t.title}</span>
                  <span>{t.text}</span>
                  <span className="mt-auto font-semibold text-ml-green">
                    {t.days} days, {MONTHS[t.month - 1]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-ml-display text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-[0.01em] uppercase">The whole road map from Dhaka</h3>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-ml-ink/10" tabIndex={0} role="region" aria-label="Road map from Dhaka">
            <table className="w-full min-w-200 border-collapse text-left">
              <thead>
                <tr className="bg-ml-navy text-white">
                  {["To", "Easiest", "Most enjoyable", "Cheapest"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONS.filter((r) => r.id !== "dhaka").map((r) => (
                  <tr key={r.id} className="border-t border-ml-ink/10 align-top">
                    <th scope="row" className="px-5 py-4 font-bold">
                      {r.name}
                    </th>
                    {(["easiest", "fun", "cheapest"] as const).map((k) => {
                      const l = pickLeg(r, k);
                      return (
                        <td key={k} className="px-5 py-4">
                          <span className="font-semibold">
                            {l.mode}, {taka(l.fare)}, {l.hours}h
                          </span>
                          <span className="block text-sm text-ml-ink/70">
                            {l.how}
                            {l.checked ? "" : " (rough)"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="max-w-3xl text-ml-ink/70">
            Fares are one way for one person, checked November 2026. Those marked rough are our own estimates. Stay costs are rough too. Fares rose twice in 2026 with fuel prices, so confirm before you pay. Train tickets:{" "}
            <a href="https://eticket.railway.gov.bd/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Bangladesh Railway
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
