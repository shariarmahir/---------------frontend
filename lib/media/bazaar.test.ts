import { test } from "node:test";
import assert from "node:assert/strict";
import { bannedWord, brokenAt, busSplit, linkChain, matchScore, MATCH_MIN, parseTags, poolOrder, shipOptions, unitPrice } from "./bazaar.ts";

test("hashtags fold spelling, language and synonyms into one tag", () => {
  assert.deepEqual(parseTags("#নারকেল #Coconut, #ডাব"), ["নারকেল"]);
  assert.deepEqual(parseTags("#খেজুর গুড় #পাটালি #মধু"), ["গুড়", "মধু"]);
  assert.deepEqual(parseTags("organic  vegetables"), ["অর্গানিক", "সবজি"]);
  assert.deepEqual(parseTags("  # , "), []);
});

const coconuts = { sector: "farm", tags: ["নারকেল"], price: 40, stock: 20, district: "বাগেরহাট" };
const fruitShop = { sector: "farm", tags: ["নারকেল"], qty: 20, maxPrice: 45, district: "বাগেরহাট", mode: "retail" as const };

test("a farmer's 20 coconuts fully match a shop that wants 20 under ৳45", () => {
  const m = matchScore(coconuts, fruitShop);
  assert.equal(m.score, 100);
  assert.ok(m.score >= MATCH_MIN);
});

test("partial stock, a dearer price and another district all lower the score", () => {
  const m = matchScore({ ...coconuts, price: 48, stock: 8 }, { ...fruitShop, district: "ঢাকা" });
  assert.equal(m.score, 36 + 24 + 5 + 5);
  assert.ok(m.why.some((w) => w.includes("আংশিক")));
});

test("hard limits: organic, trade mode, minimum order, budget, unrelated goods", () => {
  assert.equal(matchScore({ ...coconuts, price: 60 }, fruitShop).score, 0);
  assert.equal(matchScore(coconuts, { ...fruitShop, organic: true }).score, 0);
  assert.equal(matchScore({ ...coconuts, modes: ["retail"] }, { ...fruitShop, mode: "export" }).score, 0);
  assert.equal(matchScore({ ...coconuts, minOrder: 100 }, fruitShop).score, 0);
  assert.equal(matchScore({ ...coconuts, sector: "crafts", tags: ["নকশিকাঁথা"] }, fruitShop).score, 0);
  // Same sector is not enough: betel nuts are not coconuts.
  assert.equal(matchScore({ ...coconuts, tags: ["সুপারি"] }, fruitShop).score, 0);
});

test("a big order is pooled from several sellers, cheapest first", () => {
  const p = poolOrder([{ id: "a", stock: 120, price: 45 }, { id: "b", stock: 80, price: 40 }, { id: "c", stock: 500, price: 50 }], 300);
  assert.deepEqual(p.lots, [{ id: "b", take: 80 }, { id: "a", take: 120 }, { id: "c", take: 100 }]);
  assert.equal(p.filled, 300);
  assert.equal(p.total, 80 * 40 + 120 * 45 + 100 * 50);
  assert.equal(poolOrder([{ id: "a", stock: 5, price: 10 }], 20).filled, 5);
});

test("illegal goods are refused; place names and anti-drug posts are not", () => {
  assert.equal(bannedWord("ইয়াবার চালান বিক্রি"), "ইয়াবা");
  assert.equal(bannedWord("জাল নোট আছে"), "জালনোট");
  assert.equal(bannedWord("cheap Guns"), "gun");
  assert.equal(bannedWord("গুলিস্তান থেকে ডাব নিয়ে যাই"), null);
  assert.equal(bannedWord("মাদকবিরোধী পোস্টার আঁকি"), null);
});

test("wholesale tiers lower the unit price as quantity grows", () => {
  const tiers = [{ min: 50, price: 36 }, { min: 200, price: 32 }];
  assert.equal(unitPrice(10, 40, tiers), 40);
  assert.equal(unitPrice(50, 40, tiers), 36);
  assert.equal(unitPrice(500, 40, tiers), 32);
});

test("delivery options fit the load, cheapest first", () => {
  assert.deepEqual(shipOptions({ kg: 5, km: 200, perishable: false }).map((s) => s.mode), ["bus", "courier"]);
  assert.deepEqual(shipOptions({ kg: 20, km: 200, perishable: true }).map((s) => s.mode), ["bus", "cold"]);
  const bulk = shipOptions({ kg: 800, km: 250, perishable: false }).map((s) => s.mode);
  assert.deepEqual(bulk, ["train", "truck"]);
  for (const s of shipOptions({ kg: 3, km: 80, perishable: false })) assert.equal(s.fee % 10, 0);
});

test("a bus-box fee splits 70 / 25 / 5 and never loses a taka", () => {
  assert.deepEqual(busSplit(200), { company: 140, crew: 50, platform: 10 });
  const odd = busSplit(173);
  assert.equal(odd.company + odd.crew + odd.platform, 173);
});

test("the product journey is hash-linked; editing any step breaks it", () => {
  const chain = linkChain([
    { at: "২৮ সেপ্টে", step: "গাছ থেকে পাড়া", by: "কৃষক" },
    { at: "২৯ সেপ্টে", step: "বাসের বক্সে তোলা", by: "সুপারভাইজার" },
    { at: "২৯ সেপ্টে", step: "ক্রেতা বুঝে পেলেন", by: "ক্রেতা" },
  ]);
  assert.equal(brokenAt(chain), -1);
  assert.equal(chain[1].prev, chain[0].hash);
  const forged = chain.map((l, i) => (i === 1 ? { ...l, step: "কোল্ড বক্সে তোলা" } : l));
  assert.equal(brokenAt(forged), 1);
});
