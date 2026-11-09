/**
 * The TV wall's words, English first. Bangla equivalents sit beside them
 * where they exist (data/tv-wall/*, `bn` fields) so a Bangla edition can be
 * switched on later without touching the components.
 */
import { districtShapes } from "@/data/tv-wall/districts-map";
import { DIVISIONS } from "@/data/tv-wall/sources";
import type { CrimeKind, WireCategory, WireItem } from "@/lib/tv-wall/core";

export const DISTRICT_NAME = new Map(districtShapes.map((d) => [d.id, d.en]));
export const DIVISION_NAME = new Map(DIVISIONS.map((d) => [d.id as string, d.en]));

export const CATEGORY: Record<WireCategory, string> = {
  crime: "Crime",
  corruption: "Corruption",
  loss: "Loss",
  achievement: "Achievement",
  development: "Development",
  economy: "Economy",
};

export const KIND: Record<CrimeKind, string> = {
  murder: "Murder",
  rape: "Rape and sexual violence",
  abduction: "Abduction and trafficking",
  robbery: "Robbery, mugging, extortion",
  assault: "Assault and violence",
  drugs: "Drugs",
  fraud: "Fraud",
  arrest: "Arrests",
  other: "Other",
};

/** What a citizen can do about the kinds of crime being reported most. */
export const ADVICE: Record<CrimeKind, string> = {
  murder: "If a dispute is turning violent, file a general diary (GD) at the police station first; if a life is at risk, call 999.",
  rape: "Call 109 (free, 24 hours) for violence against women and children; go to a One-Stop Crisis Centre quickly without destroying evidence.",
  abduction: "If someone is missing, do not wait: call 999 and the nearest police station; note where and when they were last seen.",
  robbery: "Avoid walking alone on empty roads at night; after a mugging call 999, then file a case at the station.",
  assault: "Keep photos, video and medical papers; if the police will not take a case, record it on Protibad.",
  drugs: "Report drug dealing to 999; if someone in the family is addicted, contact a government rehabilitation centre.",
  fraud: "Never give an OTP, PIN or bKash/Nagad code to anyone; if you were cheated, file a GD.",
  arrest: "Anyone arrested must be produced before a court within 24 hours (Constitution, Article 33); free legal aid: 16430.",
  other: "In any danger, call 999 (free, 24 hours).",
};

export const LEVEL_NAME = { 0: "Quiet", 1: "Reported", 2: "Watch", 3: "Red zone" } as const;

export const placeOf = (i: Pick<WireItem, "district" | "division">) =>
  i.district ? DISTRICT_NAME.get(i.district) : i.division ? `${DIVISION_NAME.get(i.division)} division` : undefined;

export const typeOf = (i: WireItem) => (i.crimeKind && i.crimeKind !== "other" ? KIND[i.crimeKind] : CATEGORY[i.category]);

export const fmt = (n: number, digits = 0) => n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
