/**
 * Copy-on-write editing of a World (internal to lib/command).
 * A draft copies a case or unit the first time it is edited and leaves every
 * other object shared with the input, so the input is never mutated and
 * unchanged cases keep their identity (cheap ticks, stable UI references).
 */
import type { Case, Unit, World } from "./types.ts";

export interface Draft {
  world: World;
  cases: Case[];
  units: Unit[];
  caseIdx: Map<string, number>;
  unitIdx: Map<string, number>;
  editedCases: Set<number>;
  editedUnits: Set<number>;
}

export function begin(world: World): Draft {
  return {
    world,
    cases: world.cases.slice(),
    units: world.units.slice(),
    caseIdx: new Map(world.cases.map((c, i) => [c.id, i])),
    unitIdx: new Map(world.units.map((u, i) => [u.id, i])),
    editedCases: new Set(),
    editedUnits: new Set(),
  };
}

export function getCase(d: Draft, id: string): Case | undefined {
  const i = d.caseIdx.get(id);
  return i === undefined ? undefined : d.cases[i];
}

export function getUnit(d: Draft, id: string | undefined): Unit | undefined {
  const i = id === undefined ? undefined : d.unitIdx.get(id);
  return i === undefined ? undefined : d.units[i];
}

/** A case you may mutate (its alerts, timeline and notes arrays are copies too). */
export function editCase(d: Draft, id: string): Case {
  const i = d.caseIdx.get(id);
  if (i === undefined) throw new Error(`Unknown case ${id}`);
  if (!d.editedCases.has(i)) {
    const c = d.cases[i];
    d.cases[i] = { ...c, alerts: c.alerts.map((a) => ({ ...a })), timeline: c.timeline.slice(), notes: c.notes.slice() };
    d.editedCases.add(i);
  }
  return d.cases[i];
}

export function editUnit(d: Draft, id: string): Unit {
  const i = d.unitIdx.get(id);
  if (i === undefined) throw new Error(`Unknown unit ${id}`);
  if (!d.editedUnits.has(i)) {
    d.units[i] = { ...d.units[i] };
    d.editedUnits.add(i);
  }
  return d.units[i];
}

/** Adds a brand-new case (already owned by the draft). */
export function addCase(d: Draft, c: Case): void {
  d.caseIdx.set(c.id, d.cases.length);
  d.editedCases.add(d.cases.length);
  d.cases.push(c);
}

export function finish(d: Draft, patch: Partial<World> = {}): World {
  return { ...d.world, cases: d.cases, units: d.units, ...patch };
}
