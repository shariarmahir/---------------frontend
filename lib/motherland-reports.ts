/**
 * What travellers add to the Geography & Travel map: a new place, or how
 * crowded a place is right now. Kept on the visitor's device until Kandari
 * Profile accounts arrive; this shape is what the server will store then.
 * Pure, so the page and the tests share it.
 */
import type { CrowdLevel } from "./motherland-crowd.ts";

export type ReportLevel = "quiet" | "moderate" | "crowded";

export const REPORT_LABEL: Record<ReportLevel, string> = { quiet: "Not crowded", moderate: "Moderate", crowded: "Crowded" };
export const REPORT_TO_CROWD: Record<ReportLevel, CrowdLevel> = { quiet: "quiet", moderate: "steady", crowded: "packed" };

/** A crowd report says nothing useful after this long. */
export const REPORT_FRESH_MS = 6 * 3_600_000;

export interface CrowdReport {
  level: ReportLevel;
  at: number;
}

export interface AddedPlace extends CrowdReport {
  id: string;
  name: string;
  note: string;
  lat: number;
  lon: number;
}

export const isFresh = (at: number, nowMs: number) => nowMs - at < REPORT_FRESH_MS;

export const inBangladesh = (lat: number, lon: number) => lat >= 20.55 && lat <= 26.7 && lon >= 88 && lon <= 92.75;

export const NAME_MAX = 60;
export const NOTE_MAX = 140;

type Draft = { name: string; note: string; level: ReportLevel | null; lat: number | null; lon: number | null };

/** Checks a new place, and says exactly what to fix if it can't be added. */
export function newPlace(draft: Draft, nowMs: number): { ok: true; place: AddedPlace } | { ok: false; error: string } {
  const name = draft.name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Give the place a name." };
  if (name.length > NAME_MAX) return { ok: false, error: `Keep the name under ${NAME_MAX} letters.` };
  if (!draft.level) return { ok: false, error: "Choose how crowded it is." };
  if (draft.lat === null || draft.lon === null) return { ok: false, error: "Move the map so the pin sits on the place." };
  if (!inBangladesh(draft.lat, draft.lon)) return { ok: false, error: "That point is outside Bangladesh. Move the pin back inside the country." };
  const lat = Number(draft.lat.toFixed(5));
  const lon = Number(draft.lon.toFixed(5));
  return { ok: true, place: { id: `added-${nowMs.toString(36)}`, name, note: draft.note.trim().slice(0, NOTE_MAX), level: draft.level, at: nowMs, lat, lon } };
}

export function timeAgo(at: number, nowMs: number) {
  const minutes = Math.floor((nowMs - at) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
