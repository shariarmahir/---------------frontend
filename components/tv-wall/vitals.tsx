import { Icon } from "@/components/ui/icon";
import { ago, aqiBand, weatherOf, type WireItem } from "@/lib/tv-wall/core";
import type { CityReading, Quake, WallPayload } from "@/lib/tv-wall/server";
import { cn } from "@/lib/utils";
import { fmt } from "./labels";
import { Empty } from "./panel";
import { WireList } from "./wire-list";

export const AQI_FIELD = ["bg-black/35 text-white", "bg-zone-1 text-white", "bg-zone-2 text-white", "bg-national-crimson text-white"];
const CITY_EN: Record<string, string> = { dhaka: "Dhaka", chattogram: "Chattogram", rajshahi: "Rajshahi", khulna: "Khulna", rangpur: "Rangpur", mymensingh: "Mymensingh", sylhet: "Sylhet", barishal: "Barishal" };
export const cityName = (id: string) => CITY_EN[id] ?? id;

/** The taka against the currencies Bangladeshis earn and send home in. */
export function FxBoard({ fx, now, large }: { fx: WallPayload["fx"]; now: number; large?: boolean }) {
  const usd = fx?.rates.find((r) => r.code === "USD");
  if (!fx || !usd) return <p className="px-5 pb-4 font-sans text-sm text-white/70">Exchange rates are unavailable right now.</p>;
  return (
    <div className="px-5 pb-4">
      <p className="font-sans text-xs text-white/70">1 US dollar</p>
      <p className={cn("font-grotesk leading-none font-bold text-signal-orange tabular-nums", large ? "text-6xl" : "text-4xl")}>৳{fmt(usd.bdt, 2)}</p>
      <ul className={cn("mt-4 grid gap-2", large ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3")}>
        {fx.rates
          .filter((r) => r.code !== "USD")
          .map((r) => (
            <li key={r.code} className="rounded-lg bg-black/30 px-2.5 py-2">
              <p className="font-sans text-xs text-white/65">{r.code}</p>
              <p className={cn("font-sans font-semibold text-white tabular-nums", large ? "text-xl" : "text-sm")}>৳{fmt(r.bdt, 2)}</p>
            </li>
          ))}
      </ul>
      <p className="mt-3 font-sans text-xs leading-relaxed text-white/55" suppressHydrationWarning>
        International mid-market rate, updated {ago(fx.updatedAt, now)}. Bank buying and selling rates differ.
      </p>
    </div>
  );
}

export interface EnvAlert {
  key: string;
  icon: string;
  text: string;
}

/** Readings worth a warning: heat, heavy rain, unhealthy air, a strong quake nearby. */
export function envAlerts(cities: CityReading[] | null, quakes: Quake[] | null): EnvAlert[] {
  const out: EnvAlert[] = [];
  for (const c of cities ?? []) {
    const name = cityName(c.id);
    if (c.maxToday >= 36) out.push({ key: `heat-${c.id}`, icon: "thermostat", text: `${name}: up to ${c.maxToday}°C today` });
    if (c.rainToday >= 50) out.push({ key: `rain-${c.id}`, icon: "rainy_heavy", text: `${name}: heavy rain likely today (${c.rainToday} mm)` });
    if (c.aqi != null && c.aqi > 150) out.push({ key: `air-${c.id}`, icon: "masks", text: `${name}: air is ${aqiBand(c.aqi).en.toLowerCase()} (AQI ${c.aqi})` });
  }
  for (const q of quakes ?? []) {
    if (q.mag >= 4.5 && q.km <= 500) out.push({ key: `quake-${q.id}`, icon: "earthquake", text: `Magnitude ${q.mag} earthquake, ${q.km} km from Dhaka` });
  }
  return out;
}

export function EnvAlerts({ alerts, max = 3 }: { alerts: EnvAlert[]; max?: number }) {
  if (!alerts.length) return <p className="font-sans text-sm text-white/70">No weather, air or earthquake warnings right now.</p>;
  return (
    <ul className="space-y-1.5" aria-label="Warnings">
      {alerts.slice(0, max).map((a) => (
        <li key={a.key} className="flex items-start gap-2 rounded-lg bg-national-crimson/20 px-3 py-2 font-sans text-sm leading-snug text-white ring-1 ring-national-crimson/50">
          <Icon name={a.icon} className="mt-px text-base! text-crimson-bright" />
          {a.text}
        </li>
      ))}
    </ul>
  );
}

/** Weather and air in the eight divisional cities. */
export function CityGrid({ cities, large }: { cities: CityReading[] | null; large?: boolean }) {
  if (!cities) return <p className="font-sans text-sm text-white/70">Weather readings are unavailable right now.</p>;
  return (
    <ul className={cn("grid gap-2", large ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-4")}>
      {cities.map((c) => {
        const w = weatherOf(c.code);
        const band = c.aqi != null ? aqiBand(c.aqi) : null;
        return (
          <li key={c.id} className={cn("rounded-xl bg-black/30 text-center", large ? "px-3 py-4" : "px-1.5 py-2")} title={`${cityName(c.id)}: ${w.en}, humidity ${c.humidity}%, wind ${c.wind} km/h`}>
            <p className={cn("truncate font-sans font-semibold text-white/85", large ? "text-sm" : "text-xs")}>{cityName(c.id)}</p>
            <p className={cn("mt-1 flex items-center justify-center gap-1 font-sans font-bold text-white tabular-nums", large ? "text-3xl" : "text-base")}>
              <Icon name={w.icon} className={cn("text-signal-orange", large ? "text-3xl!" : "text-lg!")} />
              {c.temp}°
            </p>
            {large && (
              <p className="mt-1 font-sans text-xs text-white/65">
                {w.en} · high {c.maxToday}° · rain {c.rainToday} mm
              </p>
            )}
            {band && (
              <p className={cn("mt-1.5 rounded px-1 font-sans text-xs leading-5 font-semibold tabular-nums", AQI_FIELD[band.level])} title={`Air quality: ${band.en}`}>
                AQI {c.aqi}
                {large && ` · ${band.en}`}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function QuakeNote({ quakes, now }: { quakes: Quake[] | null; now: number }) {
  return (
    <p className="font-sans text-xs leading-relaxed text-white/60" suppressHydrationWarning>
      {quakes == null
        ? "Earthquake data is unavailable right now."
        : quakes.length === 0
          ? "No earthquake of magnitude 2.5 or more in the region in the last seven days (USGS)."
          : `Latest earthquake: magnitude ${quakes[0].mag}, ${quakes[0].km} km from Dhaka, ${ago(quakes[0].time, now)} (USGS).`}
    </p>
  );
}

/** Economy for the TV screen: the rates beside the economy wire. */
export function EconomyPanel({ fx, items, now, fresh, large }: { fx: WallPayload["fx"]; items: WireItem[]; now: number; fresh: Set<string>; large?: boolean }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", large && "lg:flex-row")}>
      <div className={cn("border-b border-white/10 pt-4", large && "lg:w-96 lg:shrink-0 lg:border-r lg:border-b-0")}>
        <FxBoard fx={fx} now={now} />
      </div>
      <WireList items={items} now={now} fresh={fresh} limit={large ? 30 : 12} large={large} empty={<Empty icon="query_stats" title="No new economy reports" body="The collectors found no economy headlines in this window." />} />
    </div>
  );
}

/** Losses for the TV screen: warnings, city readings and quakes beside the losses wire. */
export function LossesPanel({ cities, quakes, items, now, fresh, large }: { cities: CityReading[] | null; quakes: Quake[] | null; items: WireItem[]; now: number; fresh: Set<string>; large?: boolean }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", large && "lg:flex-row")}>
      <div className={cn("space-y-3 border-b border-white/10 px-5 py-4", large && "lg:w-120 lg:shrink-0 lg:border-r lg:border-b-0")}>
        <EnvAlerts alerts={envAlerts(cities, quakes)} max={large ? 6 : 2} />
        <CityGrid cities={cities} />
        <QuakeNote quakes={quakes} now={now} />
      </div>
      <WireList items={items} now={now} fresh={fresh} limit={large ? 30 : 12} large={large} empty={<Empty icon="check_circle" title="No new accidents or disasters" body="The collectors found no such headlines in this window." />} />
    </div>
  );
}
