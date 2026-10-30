import type { LatLng, Unit, UnitKind } from "./types.ts";

const EARTH_KM = 6371;
const rad = (d: number): number => (d * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Average road speed in Bangladesh city traffic, km/h. */
export const SPEED_KMH = { patrol: 22, station: 22, team: 18, office: 18 } as const;

export function etaMin(km: number, kind: UnitKind): number {
  return Math.max(3, Math.round((km / SPEED_KMH[kind]) * 60));
}

const KINDS: Record<"police" | "consumer", { mobile: UnitKind; home: UnitKind }> = {
  police: { mobile: "patrol", home: "station" },
  consumer: { mobile: "team", home: "office" },
};

/** Available units of the department, nearest (by ETA, then distance) first; patrols/teams win ties. */
export function rankUnits(
  place: LatLng,
  units: readonly Unit[],
  dept: "police" | "consumer",
): { unit: Unit; km: number; eta: number }[] {
  const kinds = KINDS[dept];
  return units
    .filter((u) => u.dept === dept && u.status === "available" && (u.kind === kinds.mobile || u.kind === kinds.home))
    .map((unit) => {
      const km = haversineKm(place, unit);
      return { unit, km, eta: etaMin(km, unit.kind) };
    })
    .sort((a, b) => a.eta - b.eta || a.km - b.km || Number(b.unit.kind === kinds.mobile) - Number(a.unit.kind === kinds.mobile));
}

/** The closest station (police) or office (consumer), whatever its status. */
export function nearestHome(place: LatLng, units: readonly Unit[], dept: "police" | "consumer"): Unit | undefined {
  const homeKind = KINDS[dept].home;
  let best: Unit | undefined;
  let bestKm = Infinity;
  for (const u of units) {
    if (u.dept !== dept || u.kind !== homeKind) continue;
    const km = haversineKm(place, u);
    if (km < bestKm) {
      best = u;
      bestKm = km;
    }
  }
  return best;
}

export function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}
