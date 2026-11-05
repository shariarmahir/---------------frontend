"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DivisionId } from "@/data/bangladesh-map";
import { districtShapes } from "@/data/tv-wall/districts-map";
import { districtScores, inWindow, riskLevel, type WireItem } from "@/lib/tv-wall/core";
import type { DistrictReading } from "@/lib/tv-wall/geo";
import type { WallPayload } from "@/lib/tv-wall/server";
import { DISTRICT_NAME } from "./labels";
import { STALE_MS, alertsWanted, disableAlerts, enableAlerts, useNow, useWall, type WallStatus } from "./use-wall";

export const WINDOWS = [6, 24, 48] as const;
export type WindowHours = (typeof WINDOWS)[number];

const isHarm = (i: WireItem) => i.category === "crime" || i.category === "corruption";

function useWallState(initial: WallPayload) {
  const { data, status, fresh, nextAt, refresh } = useWall(initial);
  const clock = useNow();
  const now = clock ?? data.generatedAt;
  const [hours, setHours] = useState<WindowHours>(24);
  const [division, setDivisionRaw] = useState<DivisionId | null>(null);
  const [district, setDistrictRaw] = useState<string | null>(null);
  const [alertsOn, setAlertsOn] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setAlertsOn(alertsWanted()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const setDivision = (d: DivisionId | null) => {
    setDivisionRaw(d);
    setDistrictRaw(null);
  };
  /** Choosing a district outside the chosen division widens the view to the district's own division. */
  const setDistrict = (id: string | null) => {
    setDistrictRaw(id);
    const d = id ? districtShapes.find((s) => s.id === id) : null;
    if (d && division && d.division !== division) setDivisionRaw(d.division);
  };
  const toggleAlerts = async () => {
    if (alertsOn) {
      disableAlerts();
      setAlertsOn(false);
    } else setAlertsOn(await enableAlerts());
  };

  // The window only needs to follow the minute, not the second hand.
  const minute = Math.floor(now / 60_000);
  const national = useMemo(() => inWindow(data.items, minute * 60_000, hours), [data.items, hours, minute]);
  const scoped = useMemo(() => (division ? national.filter((i) => i.division === division) : national), [national, division]);
  const local = useMemo(() => (district ? scoped.filter((i) => i.district === district) : scoped), [scoped, district]);

  const readings = useMemo<DistrictReading[]>(() => {
    const scores = districtScores(scoped);
    return [...scores].map(([id, s]) => {
      const top = scoped.find((i) => i.district === id && isHarm(i));
      return {
        id,
        name: DISTRICT_NAME.get(id) ?? id,
        score: s.score,
        count: s.count,
        level: riskLevel(s.score, hours),
        top: top && { title: top.title, url: top.url, source: top.source },
      };
    });
  }, [scoped, hours]);

  const pings = useMemo(() => {
    const ids = new Set<string>();
    scoped.forEach((i) => i.district && i.category === "crime" && i.severity === 3 && minute * 60_000 - i.publishedAt < 6 * 3_600_000 && ids.add(i.district));
    return [...ids];
  }, [scoped, minute]);

  const shownStatus: WallStatus = status === "live" && (data.newsAt === 0 || now - data.newsAt > STALE_MS) ? "stale" : status;

  return {
    data,
    status: shownStatus,
    fresh,
    nextAt,
    refresh,
    clock,
    now,
    hours,
    setHours,
    division,
    setDivision,
    district,
    setDistrict,
    alertsOn,
    toggleAlerts,
    national,
    scoped,
    local,
    harm: local.filter(isHarm),
    gains: local.filter((i) => i.category === "achievement" || i.category === "development"),
    economy: local.filter((i) => i.category === "economy"),
    losses: local.filter((i) => i.category === "loss"),
    readings,
    pings,
  };
}

export type WallState = ReturnType<typeof useWallState>;

const WallContext = createContext<WallState | null>(null);

/**
 * One live wall for every dashboard page: the payload, its polling, the
 * shared filters (window, division, district) and everything derived from
 * them. It sits in the dashboard layout, so moving between pages keeps the
 * filters and does not refetch.
 */
export function WallProvider({ initial, children }: { initial: WallPayload; children: ReactNode }) {
  const state = useWallState(initial);
  return <WallContext.Provider value={state}>{children}</WallContext.Provider>;
}

export function useWallData(): WallState {
  const ctx = useContext(WallContext);
  if (!ctx) throw new Error("useWallData must be used inside <WallProvider>");
  return ctx;
}
