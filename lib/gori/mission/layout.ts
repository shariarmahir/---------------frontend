/**
 * Board geometry shared by the 3D and 2D boards. The 32 modules stand in a
 * ring around the map, grouped by pillar — deliberately not on districts:
 * every problem is national, and its pixels are scattered across the whole
 * country (lib/gori/pixel-map.ts).
 */

import { PILLARS, modulesIn, type PillarId } from "../../../data/gori/mission.ts";

/** Validated categorical order on the dark board (dataviz validator, dark mode, surface #062d25). */
export const PILLAR_COLOR: Record<PillarId, string> = {
  people: "#c98420",
  economy: "#cf5f9a",
  state: "#3f86d6",
  nature: "#2d9d6c",
};

/** Secondary encoding, so pillar identity never rests on colour alone. */
export const PILLAR_SHAPE: Record<PillarId, "sphere" | "box" | "octa" | "cone"> = {
  people: "sphere",
  economy: "box",
  state: "octa",
  nature: "cone",
};

export const PLAYER_COLOR = ["#f4f1e8", "#ffb454", "#8fd3ff", "#f2a7e8"];
export const PRESSURE_COLOR = "#da291c";

export interface Spot {
  n: number;
  /** Degrees, 0 = top, clockwise. */
  angle: number;
  /** Ring position in board units: x right, y down (2D) / z toward the viewer (3D). */
  x: number;
  y: number;
  /** Height above the map in the 3D board. */
  h: number;
}

const RX = 7.4;
const RY = 6.2;
const GAP = 1; // empty slots between pillars

const slots = 32 + PILLARS.length * GAP;

export const SPOTS: Spot[] = (() => {
  const out: Spot[] = [];
  let slot = 0;
  for (const p of PILLARS) {
    for (const n of modulesIn(p.id)) {
      // Pillars sit in arcs; the gaps fall between them, one centred at the top.
      const angle = ((slot + 0.5 + GAP / 2) / slots) * 360;
      const r = (angle * Math.PI) / 180;
      out[n] = { n, angle, x: Math.sin(r) * RX, y: -Math.cos(r) * RY, h: 0.9 + (slot % 2) * 0.45 };
      slot++;
    }
    slot += GAP;
  }
  return out;
})();

/** Where a pillar's arc is centred, for its label. */
export function pillarLabelAngle(id: PillarId): number {
  const ns = modulesIn(id);
  return (SPOTS[ns[0]].angle + SPOTS[ns[ns.length - 1]].angle) / 2;
}

/** Map pixel (0–63 grid) to board units, centred. */
export const PIXEL_SIZE = 0.155;
export const pixelToBoard = (x: number, y: number) => ({ x: (x - 31.5) * PIXEL_SIZE, y: (y - 31.5) * PIXEL_SIZE });

/** Offsets for several pawns on one module. */
export function pawnOffset(k: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: 0, y: 0.55 };
  const a = (k / total) * Math.PI * 2 + Math.PI / 2;
  return { x: Math.cos(a) * 0.5, y: Math.sin(a) * 0.5 };
}
