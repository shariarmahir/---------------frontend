import type { Order, OrderSource } from "../../lib/media/business.ts";
import { DEMO_NOW } from "./clock.ts";

/**
 * The viewer's shop history for the dashboard: two years of orders for
 * Mahir's IoT kits, templates and services, generated from a fixed seed so
 * every visit (and the server) sees the same numbers. Demand grows over the
 * two years, dips on Fridays and rises before the two Eids.
 */

const CATALOG: { item: string; source: OrderSource; price: number; weight: number; maxQty: number }[] = [
  { item: "ইএসপি৩২ স্টার্টার প্যাক", source: "product", price: 1850, weight: 30, maxQty: 3 },
  { item: "আইওটি সেন্সর কিট", source: "product", price: 12000, weight: 8, maxQty: 2 },
  { item: "স্মার্ট সেচ কন্ট্রোলার", source: "product", price: 6800, weight: 10, maxQty: 2 },
  { item: "সেন্সর মডিউল (তাপ ও আর্দ্রতা)", source: "product", price: 450, weight: 22, maxQty: 6 },
  { item: "স্বাস্থ্য ড্যাশবোর্ড টেমপ্লেট", source: "digital", price: 4500, weight: 9, maxQty: 1 },
  { item: "আইওটি কোর্স নোট", source: "digital", price: 650, weight: 14, maxQty: 1 },
  { item: "আইওটি কর্মশালা (প্রতি আসন)", source: "service", price: 3000, weight: 6, maxQty: 4 },
  { item: "ফার্মওয়্যার কাস্টমাইজেশন", source: "service", price: 15000, weight: 2, maxQty: 1 },
  { item: "পিসিবি ডিজাইন রিভিউ", source: "service", price: 5000, weight: 4, maxQty: 1 },
];

const BUYERS = ["anik", "tanvir", "rafi", "nusrat", "joy", "sumaiya", "arif", "sajid", "kamal", "babul", "sabbir", "jalal", "monir", "selim", "tareq", "farhana", "shapla", "rokeya", "rupa", "nabila"];

/** Days before DEMO_NOW that fall in the run-up to Eid (roughly), 2025–2026. */
const EID_RUSH = [[100, 120], [170, 190], [455, 475], [525, 545]];

function rng(seed: number) {
  let h = seed >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): Order[] {
  const rand = rng(2026);
  const totalWeight = CATALOG.reduce((n, c) => n + c.weight, 0);
  const pick = () => {
    let r = rand() * totalWeight;
    return CATALOG.find((c) => (r -= c.weight) < 0) ?? CATALOG[0];
  };
  const out: Order[] = [];
  for (let back = 729; back >= 0; back--) {
    const day = new Date(DEMO_NOW.getTime() - back * 86_400_000);
    const growth = 0.2 + 0.65 * ((729 - back) / 729);
    const friday = day.getUTCDay() === 5 ? 0.55 : 1;
    const eid = EID_RUSH.some(([a, b]) => back >= a && back <= b) ? 1.7 : 1;
    const expected = growth * friday * eid;
    // Poisson draw by inversion: small means, so a short loop.
    let k = 0;
    for (let p = rand(), l = Math.exp(-expected); p > l; p *= rand()) k += 1;
    for (let j = 0; j < k; j++) {
      const c = pick();
      const qty = 1 + Math.floor(rand() * c.maxQty);
      const at = new Date(day.getTime() - Math.floor(rand() * 11 * 3_600_000)).toISOString();
      const cancelled = rand() < 0.04;
      const status: Order["status"] = cancelled ? "cancelled" : back === 0 && c.source !== "digital" ? "processing" : back <= 2 && c.source === "product" ? "shipping" : "delivered";
      out.push({ id: `KL-${String(out.length + 1).padStart(4, "0")}`, at, item: c.item, source: c.source, buyer: BUYERS[Math.floor(rand() * BUYERS.length)], qty, gross: c.price * qty, status });
    }
  }
  return out;
}

export const orders: Order[] = build();
