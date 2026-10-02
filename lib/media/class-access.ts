/**
 * Entering the classroom: as the student who owns this account, or as a
 * parent who only watches their child's classes. The child hands the parent
 * a short student ID; the parent sees the classes that ID belongs to and can
 * change nothing. Pure rules, tested in class-access.test.ts.
 *
 * TODO(backend): the link must live on the server and need the child's
 * consent; here the ID is a hash of the member id, enough for the demo.
 */

export type ClassMode = "student" | "parent";

/** No 0/O or 1/I, so an ID read out over the phone survives. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

/** The student ID a member hands a parent: "ST-" and six letters. */
export function studentCode(memberId: string): string {
  let h = 0x811c9dc5;
  for (const ch of memberId) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = "";
  for (let i = 0; i < LENGTH; i++) {
    out += ALPHABET[h % 32];
    h = Math.floor(h / 32);
  }
  return `ST-${out}`;
}

/** "st abc 234", "ST-ABC234" and "abc234" all read as "ST-ABC234"; anything else is null. */
export function normCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[\s\-_.]/g, "").replace(/^ST/, "");
  if (s.length !== LENGTH || [...s].some((c) => !ALPHABET.includes(c))) return null;
  return `ST-${s}`;
}

interface Seat {
  id: string;
  name: string;
  accountId?: string;
}

interface Room {
  id: string;
  name: string;
  members: Seat[];
}

export interface Child {
  code: string;
  name: string;
  /** Classrooms and lab rooms the child sits in. */
  classes: string[];
  labs: string[];
}

const owns = (code: string) => (m: Seat) => studentCode(m.id) === code || (m.accountId !== undefined && studentCode(m.accountId) === code);

/** The child behind an ID, and every room they sit in; null when no room has them. */
export function findChild(raw: string, classes: Room[], labs: Room[]): Child | null {
  const code = normCode(raw);
  if (!code) return null;
  const match = owns(code);
  const inClasses = classes.filter((r) => r.members.some(match));
  const inLabs = labs.filter((r) => r.members.some(match));
  const first = [...inClasses, ...inLabs][0]?.members.find(match);
  if (!first) return null;
  return { code, name: first.name, classes: [...new Set(inClasses.map((r) => r.id))], labs: [...new Set(inLabs.map((r) => r.id))] };
}

/** A parent may open only the rooms their child sits in. */
export const parentMaySee = (child: Child, roomId: string) => child.classes.includes(roomId) || child.labs.includes(roomId);
