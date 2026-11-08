import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanAdded, cleanReports } from "./motherland-reports.ts";

const NOW = Date.UTC(2026, 10, 7);

test("cleanReports keeps only well-formed crowd reports", () => {
  const raw = { sajek: { level: "crowded", at: NOW }, bad: { level: "packed", at: NOW }, odd: { level: "quiet", at: "yesterday" }, nope: null };
  assert.deepEqual(cleanReports(raw), { sajek: { level: "crowded", at: NOW } });
  assert.deepEqual(cleanReports([1, 2]), {});
  assert.deepEqual(cleanReports("x"), {});
});

test("cleanAdded drops places that would break the map or the page", () => {
  const good = { id: "added-1", name: "Hidden pond", note: "", level: "quiet", at: NOW, lat: 24.1, lon: 90.4 };
  const raw = [
    good,
    { ...good, id: "added-2", lat: "24.1" },
    { ...good, id: "added-3", lat: 51.5, lon: -0.1 },
    { ...good, id: "added-4", name: "x".repeat(500) },
    { ...good, id: "added-5", level: "busy" },
    "junk",
  ];
  assert.deepEqual(cleanAdded(raw), [good]);
  assert.deepEqual(cleanAdded({ not: "a list" }), []);
});
