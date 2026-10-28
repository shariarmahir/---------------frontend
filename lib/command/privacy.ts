/**
 * Survivor privacy, in one place so no board view can forget it.
 *
 * A women or child case (isWomenCase) is never shown with its own title or
 * summary on the board: the templates name who was hurt ("a schoolgirl", "a
 * housewife"). Its title becomes the category and the area, its summary stays
 * with the women help desk, and maps never put it on its exact point. Search
 * reads only what the board may show, so a query cannot reveal hidden text.
 * Pure functions; relative .ts imports (node:test runs them).
 */
import { CATEGORY_META, WOMEN_CATEGORIES } from "./routing.ts";
import type { Case, LatLng } from "./types.ts";

/** A police case about violence against a woman or child: a women category, or the victim is a woman or a child. */
export function isWomenCase(c: Case): boolean {
  if (c.dept !== "police") return false;
  return (WOMEN_CATEGORIES as readonly string[]).includes(c.category) || c.victim === "woman" || c.victim === "child";
}

/** The title the board may show: the case's own, or for a women or child case only its category and area. */
export function safeTitleBn(c: Case): string {
  return isWomenCase(c) ? `${CATEGORY_META[c.category].labelBn}, ${c.place.areaBn}` : c.titleBn;
}

/** The summary the board may show: empty for a women or child case. */
export function safeSummaryBn(c: Case): string {
  return isWomenCase(c) ? "" : c.summaryBn;
}

/** A women or child case with its title and summary taken out (for tables that print both). */
export function redactCase(c: Case): Case {
  return isWomenCase(c) ? { ...c, titleBn: safeTitleBn(c), summaryBn: "" } : c;
}

/** The fields a board search may match: id, safe title and summary, area, district. */
export function searchFields(c: Case): string[] {
  return [c.id, safeTitleBn(c), safeSummaryBn(c), c.place.areaBn, c.place.district];
}

/* ───────────── map position ───────────── */

/** FNV-1a, 32 bits: a stable hash of a string. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const SHIFT_MIN_M = 120;
export const SHIFT_MAX_M = 300;
const M_PER_DEG_LAT = 111_320;

/**
 * A point 120–300 m from the true one in a direction fixed by the id, so the dot
 * never jumps between ticks and never sits on the spot. (A demo: a real system
 * would salt this on the server.)
 */
export function shiftedPoint(id: string, p: LatLng): LatLng {
  const angle = (hash32(id) / 2 ** 32) * 2 * Math.PI;
  const d = SHIFT_MIN_M + (hash32(`${id}:r`) / 2 ** 32) * (SHIFT_MAX_M - SHIFT_MIN_M);
  return { lat: p.lat + (d * Math.cos(angle)) / M_PER_DEG_LAT, lng: p.lng + (d * Math.sin(angle)) / (M_PER_DEG_LAT * Math.cos((p.lat * Math.PI) / 180)) };
}

/** Where a map may draw a case: shifted when `shiftAll` (privacy mode) or the case is a women or child case, else its point. */
export function boardPoint(c: Case, shiftAll = false): LatLng {
  return shiftAll || isWomenCase(c) ? shiftedPoint(c.id, c.place) : { lat: c.place.lat, lng: c.place.lng };
}
