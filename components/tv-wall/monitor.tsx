export type MonitorId = "map" | "live" | "harm" | "analysis" | "gains" | "economy" | "losses";

export interface MonitorMeta {
  id: MonitorId;
  title: string;
  sub: string;
  icon: string;
}

/** The TV screen's sources, in the order its program bus shows them. */
export const MONITORS: Record<MonitorId, MonitorMeta> = {
  map: { id: "map", title: "Crime map", sub: "Red zones by district", icon: "map" },
  harm: { id: "harm", title: "Crime & corruption", sub: "The latest reports", icon: "gavel" },
  live: { id: "live", title: "Live TV", sub: "News channels on air", icon: "live_tv" },
  analysis: { id: "analysis", title: "Analysis", sub: "Risk, chance and who answers", icon: "query_stats" },
  gains: { id: "gains", title: "Achievements", sub: "Achievements and development", icon: "emoji_events" },
  economy: { id: "economy", title: "Economy", sub: "Taka, trade and markets", icon: "currency_exchange" },
  losses: { id: "losses", title: "Losses & environment", sub: "Accidents, weather, air, quakes", icon: "flood" },
};

/** A monitor's tally light: gold while on air, red while it carries an alert, dim otherwise. */
export function Tally({ alert, onAir }: { alert?: boolean; onAir?: boolean }) {
  return <span aria-hidden className={`size-2.5 shrink-0 rounded-[3px] ${onAir ? "bg-signal-orange" : alert ? "tally-blink bg-national-crimson" : "bg-white/25"}`} />;
}
