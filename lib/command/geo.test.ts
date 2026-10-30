import { test } from "node:test";
import assert from "node:assert/strict";
import { etaMin, haversineKm, lerp, nearestHome, rankUnits } from "./geo.ts";
import type { Unit } from "./types.ts";

const u = (id: string, kind: Unit["kind"], lat: number, lng: number, status: Unit["status"] = "available", dept: Unit["dept"] = "police"): Unit =>
  ({ id, kind, dept, name: id, nameBn: id, homeId: "st-a", status, lat, lng });

test("haversine: Dhaka (Shahbag) to Chattogram is about 213 km", () => {
  const km = haversineKm({ lat: 23.7381, lng: 90.3958 }, { lat: 22.3569, lng: 91.7832 });
  assert.ok(km > 200 && km < 225, String(km));
  assert.equal(haversineKm({ lat: 23, lng: 90 }, { lat: 23, lng: 90 }), 0);
});

test("eta has a 3-minute floor and scales with speed", () => {
  assert.equal(etaMin(0.1, "patrol"), 3);
  assert.equal(etaMin(11, "patrol"), 30);
  assert.ok(etaMin(9, "team") > etaMin(9, "patrol"));
});

test("rankUnits: nearest available unit of the department first, busy and other-dept units skipped", () => {
  const scene = { lat: 23.75, lng: 90.39 };
  const units = [
    u("far", "patrol", 23.85, 90.40),
    u("near-busy", "patrol", 23.751, 90.391, "busy"),
    u("near", "patrol", 23.752, 90.392),
    u("team", "team", 23.7505, 90.3905, "available", "consumer"),
    u("st", "station", 23.76, 90.39),
  ];
  const ranked = rankUnits(scene, units, "police");
  assert.deepEqual(ranked.map((r) => r.unit.id), ["near", "st", "far"]);
  assert.ok(ranked[0].km < ranked[1].km);
});

test("rankUnits: on an equal ETA the patrol comes before the station", () => {
  const scene = { lat: 23.75, lng: 90.39 };
  const ranked = rankUnits(scene, [u("st", "station", 23.7501, 90.39), u("pt", "patrol", 23.7501, 90.39)], "police");
  assert.deepEqual(ranked.map((r) => r.unit.id), ["pt", "st"]);
});

test("nearestHome ignores status and picks the closest station", () => {
  const units = [u("s1", "station", 23.8, 90.4, "busy"), u("s2", "station", 24.5, 90.4), u("p", "patrol", 23.75, 90.39)];
  assert.equal(nearestHome({ lat: 23.75, lng: 90.39 }, units, "police")?.id, "s1");
});

test("lerp", () => {
  assert.deepEqual(lerp({ lat: 0, lng: 0 }, { lat: 10, lng: 20 }, 0.5), { lat: 5, lng: 10 });
});
