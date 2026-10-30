import { test } from "node:test";
import assert from "node:assert/strict";
import { PRICE_ITEMS, TCB_SOURCE, observedPrices, overpricedToday, priceItem } from "./prices.ts";
import { bdDay } from "./selectors.ts";

const T = Date.UTC(2026, 9, 25, 6, 0, 0);
const DAY = bdDay(T);

test("catalogue: only the two verified soybean oil prices are fixed, with the exact figures and sources", () => {
  const fixed = PRICE_ITEMS.filter((p) => p.fixed);
  assert.deepEqual(fixed.map((p) => p.id), ["soybean-bottled", "soybean-loose"]);
  const bottled = priceItem("soybean-bottled");
  const loose = priceItem("soybean-loose");
  assert.equal(bottled?.fixed?.priceTk, 204);
  assert.equal(loose?.fixed?.priceTk, 180);
  for (const p of [bottled, loose]) {
    assert.equal(p?.unit, "litre");
    assert.equal(p?.fixed?.source, "Ministry of Commerce");
    assert.deepEqual(p?.fixed?.reportedBy, ["bdnews24", "The Business Standard"]);
  }
  assert.match(bottled?.fixed?.effective ?? "", /September 2026/);
  assert.match(loose?.fixed?.effective ?? "", /30 April 2026/);
  assert.match(loose?.fixed?.effective ?? "", /unchanged in September 2026/);
});

test("catalogue: about 16+ essentials, each either fixed or a sample range, valid units and groups, unique ids", () => {
  assert.ok(PRICE_ITEMS.length >= 16);
  assert.equal(new Set(PRICE_ITEMS.map((p) => p.id)).size, PRICE_ITEMS.length);
  const units = new Set(["kg", "litre", "dozen", "piece"]);
  const groups = new Set(["rice", "pulses", "oil", "sugar", "vegetables", "protein", "fruit", "dairy", "other"]);
  for (const p of PRICE_ITEMS) {
    assert.ok(units.has(p.unit) && groups.has(p.group), p.id);
    assert.ok(p.nameBn && p.name, p.id);
    assert.notEqual(p.fixed === undefined, p.reference === undefined, `${p.id}: exactly one of fixed/reference`);
    if (p.reference) assert.ok(p.reference.lowTk > 0 && p.reference.lowTk < p.reference.highTk, p.id);
  }
  // The brief's list: rice, lentils, oil, sugar, onion, potato, egg, chicken, beef, fish, fruit, flour, salt, milk.
  for (const id of ["rice-coarse", "dal-masur-coarse", "sugar-loose", "onion-local", "potato", "egg-farm", "chicken-broiler", "beef", "fish-rui", "banana", "atta-loose", "salt-packet", "milk-liquid"]) {
    assert.ok(priceItem(id), id);
  }
  assert.deepEqual(TCB_SOURCE, {
    name: "Trading Corporation of Bangladesh (TCB)",
    url: "https://tcb.gov.bd",
    note: "publishes Dhaka's retail market prices every working day",
  });
});

test("observedPrices: deterministic per seed and day, memoised, 7-day series ending today", () => {
  const a = observedPrices(7, DAY);
  assert.equal(observedPrices(7, DAY), a, "same arguments, same array");
  assert.deepEqual(structuredClone(observedPrices(7, DAY, "khulna")), structuredClone(observedPrices(7, DAY, "khulna")));
  assert.notDeepEqual(observedPrices(7, DAY + 1).map((o) => o.todayTk), a.map((o) => o.todayTk));
  assert.notDeepEqual(observedPrices(8, DAY).map((o) => o.todayTk), a.map((o) => o.todayTk));
  assert.equal(a.length, PRICE_ITEMS.length);
  for (const o of a) {
    assert.equal(o.series.length, 7);
    assert.equal(o.series[6], o.todayTk);
    assert.equal(o.series[5], o.yesterdayTk);
    assert.ok(o.series.every((x) => Number.isInteger(x) && x > 0));
    // Yesterday's "today" is today's "yesterday": the series is one continuous history.
    const prev = observedPrices(7, DAY - 1).find((x) => x.item.id === o.item.id);
    assert.equal(prev?.todayTk, o.yesterdayTk, o.item.id);
  }
  // Dhaka is the base market.
  assert.deepEqual(observedPrices(7, DAY, "dhaka").map((o) => o.todayTk), a.map((o) => o.todayTk));
});

test("observedPrices: fixed items sometimes trade over the ceiling; flags agree with the numbers", () => {
  let overDays = 0;
  let outOfRange = 0;
  const days = 90;
  for (let d = DAY - days; d < DAY; d++) {
    for (const o of observedPrices(3, d)) {
      if (o.item.fixed) {
        assert.equal(o.ceilingTk, o.item.fixed.priceTk);
        assert.equal(o.status === "over-ceiling", o.todayTk > o.item.fixed.priceTk, o.item.id);
        assert.equal((o.overCeilingPct ?? 0) > 0, o.status === "over-ceiling", o.item.id);
        assert.ok(o.todayTk < o.item.fixed.priceTk * 1.12, "never wildly off");
        if (o.status === "over-ceiling") overDays++;
      } else {
        const { lowTk, highTk } = o.item.reference;
        assert.equal(o.outOfRange === "above", o.todayTk > highTk, o.item.id);
        assert.equal(o.outOfRange === "below", o.todayTk < lowTk, o.item.id);
        if (o.outOfRange) outOfRange++;
        assert.ok(o.todayTk > lowTk * 0.75 && o.todayTk < highTk * 1.4, `${o.item.id} ${o.todayTk}`);
      }
    }
  }
  // Two fixed items × 90 days: over the ceiling on some days (about 3 in 10), not on all.
  assert.ok(overDays > 20 && overDays < 120, String(overDays));
  assert.ok(outOfRange > 0);
  const over = overpricedToday(3, DAY);
  const today = observedPrices(3, DAY);
  assert.deepEqual(
    over.map((p) => p.id),
    today.filter((o) => o.status === "over-ceiling" || o.status === "above-range").map((o) => o.item.id),
  );
});

test("observedPrices: other divisions vary a little around Dhaka", () => {
  const dhaka = observedPrices(5, DAY);
  for (const div of ["chattogram", "rangpur", "sylhet"] as const) {
    const there = observedPrices(5, DAY, div);
    let differs = false;
    there.forEach((o, i) => {
      const ratio = o.todayTk / dhaka[i].todayTk;
      assert.ok(ratio > 0.95 && ratio < 1.05, `${div} ${o.item.id} ${ratio}`);
      if (o.todayTk !== dhaka[i].todayTk) differs = true;
    });
    assert.ok(differs, div);
  }
});
