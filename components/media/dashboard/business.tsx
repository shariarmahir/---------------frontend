"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, Clock3, Package, PackageCheck, ShoppingCart, TrendingDown, TrendingUp, Truck, Wallet, XCircle, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW } from "@/data/media/clock";
import { orders } from "@/data/media/orders";
import { getPerson } from "@/data/media/users";
import { breakdown, bucketize, change, total, type Bucket, type Metric, type OrderSource, type OrderStatus, type Range } from "@/lib/media/business";
import { compactBn, digits, taka } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Ago, Num, Taka, useNumerals } from "../ui/numerals";

const RANGES: { key: Range; label: string; was: string }[] = [
  { key: "7d", label: "৭ দিন", was: "আগের ৭ দিন" },
  { key: "30d", label: "৩০ দিন", was: "আগের ৩০ দিন" },
  { key: "12m", label: "১২ মাস", was: "আগের ১২ মাস" },
];

const METRICS: { key: Metric; label: string; hint: string; money: boolean; Icon: LucideIcon }[] = [
  { key: "revenue", label: "রাজস্ব", hint: "ক্রেতারা পণ্য ও সেবার দাম বাবদ যা দিয়েছেন", money: true, Icon: Banknote },
  { key: "earnings", label: "আয়", hint: "রাজস্ব থেকে ৫% প্ল্যাটফর্ম ফি বাদে, যা আপনার", money: true, Icon: Wallet },
  { key: "sales", label: "বিক্রি", hint: "বিক্রি হওয়া পণ্য ও সেবার একক", money: false, Icon: Package },
  { key: "orders", label: "অর্ডার", hint: "বাতিলসহ সব অর্ডার", money: false, Icon: ShoppingCart },
];

const STATUS: { key: OrderStatus; label: string; Icon: LucideIcon }[] = [
  { key: "processing", label: "প্রক্রিয়াধীন", Icon: Clock3 },
  { key: "shipping", label: "পথে", Icon: Truck },
  { key: "delivered", label: "সম্পন্ন", Icon: PackageCheck },
  { key: "cancelled", label: "বাতিল", Icon: XCircle },
];

const SOURCE: Record<OrderSource, string> = { product: "পণ্য বিক্রি", service: "সেবা ও কাজ", digital: "ডিজিটাল পণ্য" };
const MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** Counts up to a new figure; reduced motion shows it straight away. */
function CountUp({ value, money }: { value: number; money: boolean }) {
  const { numerals } = useNumerals();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  useEffect(() => {
    const el = ref.current;
    const show = (n: number) => el && (el.textContent = money ? taka(n, numerals) : digits(Math.round(n), numerals));
    if (reduce) {
      show(value);
      from.current = value;
      return;
    }
    const run = animate(from.current, value, { duration: 0.9, ease: EASE, onUpdate: show });
    from.current = value;
    return () => run.stop();
  }, [value, money, numerals, reduce]);
  return <span ref={ref} className="tabular-nums" />;
}

function Spark({ values, on }: { values: number[]; on: boolean }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  const d = values.map((v, i) => `${i ? "L" : "M"}${(i / Math.max(values.length - 1, 1)) * 100},${28 - (v / max) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-3 h-8 w-full" aria-hidden>
      <motion.path
        key={d}
        d={d}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={on ? "stroke-m-ink" : "stroke-m-yellow"}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
    </svg>
  );
}

function Delta({ pct, on }: { pct: number | null; on: boolean }) {
  if (pct === null) return <span className="text-xs opacity-70">নতুন</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold", on ? "bg-m-card/15" : up ? "bg-m-yellow/15 text-m-blue" : "bg-m-ink/6 text-m-ink/80")}>
      <Icon className="size-3.5" aria-hidden />
      {up ? "+" : "−"}
      <Num value={Math.abs(pct)} />%
    </span>
  );
}

/** A thin bar that grows in from the left when it scrolls into view. */
function Meter({ share, muted }: { share: number; muted?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-m-ink/6">
      <motion.span
        className={cn("block h-full origin-left rounded-full", muted ? "bg-m-ink/19" : "bg-m-yellow")}
        style={{ width: `${Math.max(share * 100, share > 0 ? 2 : 0)}%` }}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </span>
  );
}

function tickLabel(at: string, range: Range, numerals: "bn" | "latn") {
  const d = new Date(`${at}T00:00:00Z`);
  if (range === "12m") return MONTHS[d.getUTCMonth()];
  if (range === "7d") return `${WEEKDAYS[d.getUTCDay()]} ${digits(d.getUTCDate(), numerals)}`;
  return `${digits(d.getUTCDate(), numerals)} ${MONTHS[d.getUTCMonth()]}`;
}

function TrendChart({ current, previous, metric, range }: { current: Bucket[]; previous: Bucket[]; metric: (typeof METRICS)[number]; range: (typeof RANGES)[number] }) {
  const { numerals } = useNumerals();
  const reduce = useReducedMotion();
  const tableId = useId();
  const fmt = (n: number) => (metric.money ? taka(n, numerals) : digits(n, numerals));
  const data = current.map((b, i) => ({ at: b.at, label: tickLabel(b.at, range.key, numerals), now: b[metric.key], was: previous[i][metric.key] }));
  return (
    <figure aria-describedby={tableId}>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={`${metric.key}-${range.key}`} data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={range.key === "30d" ? "18%" : "28%"}>
            <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.08)" />
            <XAxis xAxisId="now" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "rgb(255 255 255 / 0.6)", fontSize: 11 }} interval="preserveStartEnd" minTickGap={14} />
            <XAxis xAxisId="was" dataKey="label" hide />
            <YAxis tickLine={false} axisLine={false} width={metric.money ? 52 : 28} allowDecimals={false} tick={{ fill: "rgb(255 255 255 / 0.6)", fontSize: 11 }} tickFormatter={(v: number) => (metric.money ? `৳${compactBn(v, numerals)}` : digits(v, numerals))} />
            <Tooltip
              cursor={{ fill: "rgb(255 255 255 / 0.06)" }}
              content={({ active, payload }) => {
                const row = active && payload?.[0]?.payload;
                if (!row) return null;
                return (
                  <div className="rounded-xl bg-m-canvas px-3 py-2 text-xs text-m-ink shadow-xl ring-1 ring-m-ink/13">
                    <p className="font-bold">{row.label}</p>
                    <p className="mt-1 flex items-center gap-2"><span className="size-2.5 rounded-sm bg-m-yellow" />{metric.label}: <span className="font-bold tabular-nums">{fmt(row.now)}</span></p>
                    <p className="flex items-center gap-2 text-m-ink/70"><span className="size-2.5 rounded-sm bg-m-ink/17" />{range.was}: <span className="tabular-nums">{fmt(row.was)}</span></p>
                  </div>
                );
              }}
            />
            <Bar xAxisId="was" dataKey="was" name={range.was} fill="rgb(255 255 255 / 0.14)" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} animationDuration={700} />
            <Bar xAxisId="now" dataKey="now" name={metric.label} fill="var(--color-signal-orange)" radius={[4, 4, 0, 0]} barSize={range.key === "30d" ? 8 : range.key === "7d" ? 26 : 18} isAnimationActive={!reduce} animationBegin={150} animationDuration={900} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table id={tableId} className="sr-only">
        <caption>{metric.label}, {range.label}</caption>
        <thead><tr><th>সময়</th><th>{metric.label}</th><th>{range.was}</th></tr></thead>
        <tbody>{data.map((r) => <tr key={r.at}><td>{r.label}</td><td>{fmt(r.now)}</td><td>{fmt(r.was)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

const card = "story-reveal rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile";

/**
 * Shop numbers on the dashboard: revenue, earnings, sales and orders for a
 * chosen range against the range before, then where orders stand, where
 * the money comes from, the best sellers and the latest orders.
 */
export function BusinessOverview() {
  const hydrated = useHydrated();
  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<Metric>("revenue");
  if (!hydrated) return <Skeleton className="h-[34rem] rounded-2xl" />;

  const r = RANGES.find((x) => x.key === range)!;
  const m = METRICS.find((x) => x.key === metric)!;
  const { current, previous } = bucketize(orders, range, DEMO_NOW);
  const now = total(current);
  const was = total(previous);
  const b = breakdown(orders, range, DEMO_NOW);
  const sourceTotal = Object.values(b.source).reduce((n, v) => n + v, 0);
  const topMax = b.top[0]?.revenue ?? 1;
  const recent = [...orders].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 6);

  return (
    <section aria-labelledby="biz-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="biz-heading" className="text-lg font-bold text-m-ink">ব্যবসার হিসাব</h2>
          <p className="text-sm text-m-ink/70">{r.was}-এর সঙ্গে তুলনা</p>
        </div>
        <div role="group" aria-label="সময়কাল" className="flex rounded-xl bg-m-ink/6 p-1">
          {RANGES.map((x) => (
            <button key={x.key} type="button" aria-pressed={range === x.key} onClick={() => setRange(x.key)} className={cn("min-h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors", range === x.key ? "bg-m-yellow text-m-ink" : "text-m-ink/80 hover:text-m-ink")}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map((x, i) => {
          const on = metric === x.key;
          return (
            <button
              key={x.key}
              type="button"
              aria-pressed={on}
              onClick={() => setMetric(x.key)}
              title={x.hint}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "story-reveal group rounded-2xl p-4 text-left ring-1 transition-[translate,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                on ? "bg-m-yellow text-m-ink ring-m-blue shadow-[0_22px_40px_-24px_var(--color-signal-orange)]" : "bg-m-card text-m-ink ring-m-ink/10 hover:shadow-[0_22px_40px_-24px_var(--color-signal-orange)]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold opacity-85">
                  <x.Icon className="size-4" aria-hidden />
                  {x.label}
                </span>
                <Delta pct={change(now[x.key], was[x.key])} on={on} />
              </span>
              <span className="mt-2 block text-xl font-bold tracking-tight sm:text-2xl"><CountUp value={now[x.key]} money={x.money} /></span>
              <Spark values={current.map((c) => c[x.key])} on={on} />
            </button>
          );
        })}
      </div>

      <div className={card}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-m-blue">{m.label} — {r.label}</h3>
            <p className="mt-0.5 text-xs text-m-ink/65">{m.hint}</p>
          </div>
          <ul className="flex items-center gap-4 text-xs text-m-ink/75">
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-m-yellow" aria-hidden />এই সময়</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-m-ink/14" aria-hidden />{r.was}</li>
          </ul>
        </div>
        <TrendChart current={current} previous={previous} metric={m} range={r} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h3 className="mb-4 flex items-baseline justify-between text-base font-bold text-m-blue">
            অর্ডারের অবস্থা <span className="text-xs font-semibold text-m-ink/65">মোট <Num value={b.count} /></span>
          </h3>
          <ul className="space-y-3.5">
            {STATUS.map(({ key, label, Icon }) => (
              <li key={key} className="space-y-1.5">
                <span className="flex items-center justify-between text-sm text-m-ink">
                  <span className="flex items-center gap-2"><Icon className={cn("size-4", key === "cancelled" ? "text-m-ink/60" : "text-m-blue")} aria-hidden />{label}</span>
                  <span className="font-bold tabular-nums"><Num value={b.status[key]} /></span>
                </span>
                <Meter share={b.count ? b.status[key] / b.count : 0} muted={key === "cancelled"} />
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h3 className="mb-4 text-base font-bold text-m-blue">রাজস্ব কোথা থেকে</h3>
          <ul className="space-y-3.5">
            {(Object.keys(SOURCE) as OrderSource[]).map((k) => {
              const share = sourceTotal ? b.source[k] / sourceTotal : 0;
              return (
                <li key={k} className="space-y-1.5">
                  <span className="flex items-center justify-between gap-3 text-sm text-m-ink">
                    {SOURCE[k]}
                    <span className="text-right"><span className="font-bold"><Taka amount={b.source[k]} /></span> <span className="text-xs text-m-ink/60">(<Num value={Math.round(share * 100)} />%)</span></span>
                  </span>
                  <Meter share={share} />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-m-ink/60">রাজস্ব থেকে ৫% প্ল্যাটফর্ম ফি কাটে — এই সময়ে <Taka amount={now.revenue - now.earnings} />।</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className={card}>
          <h3 className="mb-4 text-base font-bold text-m-blue">সেরা বিক্রি</h3>
          {b.top.length === 0 ? (
            <p className="text-sm text-m-ink/65">এই সময়ে কোনো বিক্রি নেই।</p>
          ) : (
            <ol className="space-y-3.5">
              {b.top.slice(0, 5).map((t, i) => (
                <li key={t.item} className="flex items-center gap-3">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold", i === 0 ? "bg-m-yellow text-m-ink" : "bg-m-ink/6 text-m-ink")}><Num value={i + 1} /></span>
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-m-ink">{t.item}</span>
                      <span className="shrink-0 font-bold text-m-ink"><Taka amount={t.revenue} /></span>
                    </span>
                    <Meter share={t.revenue / topMax} />
                    <span className="block text-xs text-m-ink/60"><Num value={t.units} /> একক · {SOURCE[t.source]}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className={card}>
          <h3 className="mb-2 text-base font-bold text-m-blue">সাম্প্রতিক অর্ডার</h3>
          <ul className="divide-y divide-m-ink/9">
            {recent.map((o) => {
              const s = STATUS.find((x) => x.key === o.status)!;
              return (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-m-ink/6 text-m-blue"><s.Icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-m-ink">{o.item}{o.qty > 1 && <> × <Num value={o.qty} /></>}</span>
                    <span className="block truncate text-xs text-m-ink/60">{o.id} · {getPerson(o.buyer)?.nameBn ?? o.buyer} · <Ago iso={o.at} /></span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-m-ink"><Taka amount={o.gross} /></span>
                    <span className={cn("mt-0.5 inline-block rounded-full px-2 text-[11px] font-semibold", o.status === "delivered" ? "bg-m-ink/6 text-m-ink/80" : o.status === "cancelled" ? "bg-m-ink/6 text-m-ink/55 " : "bg-m-yellow text-m-ink")}>{s.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
