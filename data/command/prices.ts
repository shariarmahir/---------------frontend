/**
 * Price watch: the daily essentials the ভোক্তা অধিদপ্তর checks in markets.
 *
 * Only two rows are government-fixed prices, both verified (as of 2026-10-28):
 * soybean oil, bottled and loose, set by the Ministry of Commerce. Every other
 * row is a REFERENCE range, a sample of plausible Dhaka retail prices for late
 * 2026 made up for this demonstration — not an official figure and not a
 * ceiling. The official daily source for Dhaka retail prices is TCB (below).
 */
import type { PriceItem } from "../../lib/command/types.ts";

export const TCB_SOURCE = {
  name: "Trading Corporation of Bangladesh (TCB)",
  url: "https://tcb.gov.bd",
  note: "publishes Dhaka's retail market prices every working day",
} as const;

const COMMERCE = "Ministry of Commerce";

export const PRICE_ITEMS: readonly PriceItem[] = [
  { id: "rice-coarse", nameBn: "মোটা চাল", name: "Rice, coarse", unit: "kg", group: "rice", reference: { lowTk: 52, highTk: 58 } },
  { id: "rice-medium", nameBn: "মাঝারি চাল", name: "Rice, medium", unit: "kg", group: "rice", reference: { lowTk: 60, highTk: 66 } },
  { id: "rice-fine", nameBn: "সরু চাল (মিনিকেট)", name: "Rice, fine (miniket)", unit: "kg", group: "rice", reference: { lowTk: 72, highTk: 84 } },
  { id: "dal-masur-coarse", nameBn: "মসুর ডাল (মোটা দানা)", name: "Red lentils, coarse", unit: "kg", group: "pulses", reference: { lowTk: 105, highTk: 112 } },
  { id: "dal-masur-fine", nameBn: "মসুর ডাল (সরু দানা)", name: "Red lentils, fine", unit: "kg", group: "pulses", reference: { lowTk: 135, highTk: 150 } },
  {
    id: "soybean-bottled",
    nameBn: "বোতলজাত সয়াবিন তেল (১ লিটার)",
    name: "Soybean oil, bottled (1 litre)",
    unit: "litre",
    group: "oil",
    fixed: { priceTk: 204, source: COMMERCE, effective: "September 2026", reportedBy: ["bdnews24", "The Business Standard"] },
  },
  {
    id: "soybean-loose",
    nameBn: "খোলা সয়াবিন তেল (১ লিটার)",
    name: "Soybean oil, loose (1 litre)",
    unit: "litre",
    group: "oil",
    fixed: { priceTk: 180, source: COMMERCE, effective: "30 April 2026, unchanged in September 2026", reportedBy: ["bdnews24", "The Business Standard"] },
  },
  { id: "sugar-loose", nameBn: "চিনি (খোলা)", name: "Sugar, loose", unit: "kg", group: "sugar", reference: { lowTk: 105, highTk: 115 } },
  { id: "onion-local", nameBn: "দেশি পেঁয়াজ", name: "Onion, local", unit: "kg", group: "vegetables", reference: { lowTk: 70, highTk: 85 } },
  { id: "potato", nameBn: "আলু", name: "Potato", unit: "kg", group: "vegetables", reference: { lowTk: 25, highTk: 35 } },
  { id: "egg-farm", nameBn: "ফার্মের ডিম", name: "Farm eggs", unit: "dozen", group: "protein", reference: { lowTk: 130, highTk: 145 } },
  { id: "chicken-broiler", nameBn: "ব্রয়লার মুরগি", name: "Broiler chicken", unit: "kg", group: "protein", reference: { lowTk: 170, highTk: 190 } },
  { id: "beef", nameBn: "গরুর মাংস", name: "Beef", unit: "kg", group: "protein", reference: { lowTk: 750, highTk: 800 } },
  { id: "fish-rui", nameBn: "রুই মাছ", name: "Rui fish", unit: "kg", group: "protein", reference: { lowTk: 350, highTk: 450 } },
  { id: "banana", nameBn: "সাগর কলা", name: "Banana (sagor)", unit: "dozen", group: "fruit", reference: { lowTk: 100, highTk: 140 } },
  { id: "apple-imported", nameBn: "আপেল (আমদানি)", name: "Apple, imported", unit: "kg", group: "fruit", reference: { lowTk: 280, highTk: 320 } },
  { id: "milk-liquid", nameBn: "তরল দুধ", name: "Milk, liquid", unit: "litre", group: "dairy", reference: { lowTk: 85, highTk: 100 } },
  { id: "atta-loose", nameBn: "আটা (খোলা)", name: "Wheat flour (atta), loose", unit: "kg", group: "other", reference: { lowTk: 45, highTk: 50 } },
  { id: "salt-packet", nameBn: "লবণ (প্যাকেট, ১ কেজি)", name: "Salt, 1 kg packet", unit: "piece", group: "other", reference: { lowTk: 40, highTk: 45 } },
];
