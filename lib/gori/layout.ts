/**
 * Radial mind-map geometry. Bangladesh sits at the centre, the thirteen
 * themes on an inner ring, the 32 problems on an outer ring grouped behind
 * their theme with a small gap between groups. Units are SVG user units in a
 * viewBox centred on 0,0.
 */

import { pointOf, puzzles, themes, type ThemeId } from "../../data/gori/puzzles.ts";

export const VIEW = 520;
export const CENTER_R = 72;
export const THEME_R = 180;
export const LEAF_R = 300;
export const LEAF_DOT = 17;
/** Space between theme groups, as a fraction of one leaf slot. */
const GAP = 0.6;

export interface Pt {
  x: number;
  y: number;
}

export function polar(r: number, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  return { x: +(r * Math.cos(a)).toFixed(2), y: +(r * Math.sin(a)).toFixed(2) };
}

/**
 * Transform for text laid along a radius, reading outward and never upside
 * down: the left half is flipped and anchored at its far end.
 */
export function radialText(r: number, deg: number): { transform: string; anchor: "start" | "end" } {
  const norm = ((deg % 360) + 360) % 360;
  const left = norm > 90 && norm < 270;
  return left
    ? { transform: `rotate(${deg + 180}) translate(${-r} 0)`, anchor: "end" }
    : { transform: `rotate(${deg}) translate(${r} 0)`, anchor: "start" };
}

export interface LeafNode extends Pt {
  n: number;
  theme: ThemeId;
  angle: number;
}

export interface ThemeNode extends Pt {
  id: ThemeId;
  bn: string;
  angle: number;
  leaves: LeafNode[];
}

export function buildLayout(): ThemeNode[] {
  const groups = themes.map((t) => ({ ...t, ns: puzzles.filter((p) => pointOf(p.n).theme === t.id).map((p) => p.n) }));
  const slots = puzzles.length + groups.length * GAP;
  const slot = 360 / slots;
  let cursor = -90 + (slot * GAP) / 2;
  return groups.map((g) => {
    const leaves = g.ns.map((n) => {
      const angle = +(cursor + slot / 2).toFixed(3);
      cursor += slot;
      return { n, theme: g.id, angle, ...polar(LEAF_R, angle) };
    });
    cursor += slot * GAP;
    const angle = +(leaves.reduce((s, l) => s + l.angle, 0) / leaves.length).toFixed(3);
    return { id: g.id, bn: g.bn, angle, ...polar(THEME_R, angle), leaves };
  });
}

/** A curved edge from a theme node out to one of its problems. */
export function branchPath(t: ThemeNode, l: LeafNode): string {
  const a = polar(THEME_R + 8, t.angle);
  const c1 = polar(THEME_R + 70, t.angle);
  const c2 = polar(LEAF_R - 70, l.angle);
  const b = polar(LEAF_R - LEAF_DOT, l.angle);
  return `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
}

export function trunkPath(t: ThemeNode): string {
  const a = polar(CENTER_R + 4, t.angle);
  const b = polar(THEME_R - 8, t.angle);
  return `M${a.x} ${a.y} L${b.x} ${b.y}`;
}
