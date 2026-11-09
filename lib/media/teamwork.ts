/**
 * Team work for classrooms and lab rooms: how many may join, and who does
 * what on which day. Duties are shuffled every week from a seed, so the rota
 * is the same on every device without a server, and nobody keeps the same
 * job for good. Pure rules here, tested in teamwork.test.ts.
 */

export type TeamKind = "classroom" | "lab";

/** Member caps the leader picks from; a lab group stays small on purpose. */
export const TEAM_LIMITS: Record<TeamKind, { min: number; max: number; preset: number }> = {
  classroom: { min: 2, max: 200, preset: 60 },
  lab: { min: 2, max: 15, preset: 6 },
};

/** A cap within the allowed range, and never below the members already in. */
export function clampLimit(kind: TeamKind, wanted: number, current = 0): number {
  const { min, max, preset } = TEAM_LIMITS[kind];
  const n = Number.isFinite(wanted) ? Math.round(wanted) : preset;
  return Math.max(min, current, Math.min(max, n));
}

export const isFull = (members: number, limit?: number) => limit !== undefined && members >= limit;

export type DutyIcon = "lead" | "build" | "calc" | "data" | "print" | "tools" | "note" | "board" | "question" | "clean";

export interface Duty {
  id: string;
  title: string;
  /** People it takes on each of its days. */
  need: number;
  /** Week days it runs on, Saturday = 0. */
  days: number[];
  icon: DutyIcon;
}

export interface Rota {
  duties: Duty[];
  /** Bumped when the leader reshuffles by hand. */
  salt: number;
  /** `${date}|${dutyId}|${memberId}` for each duty marked done. */
  done: Record<string, true>;
}

export const DUTY_NEED_MAX = 6;

/** Bangladesh is UTC+6 all year. */
const BD_OFFSET = 6 * 3_600_000;
const DAY = 86_400_000;

/** Days since 1970-01-01 (a Thursday) on the Bangladesh calendar. */
const dayNo = (now: Date) => Math.floor((now.getTime() + BD_OFFSET) / DAY);

/** Week day in Bangladesh, Saturday = 0. */
export const bdWeekday = (now: Date) => (dayNo(now) + 5) % 7;

/** Weeks counted from a Saturday; changes every Saturday at midnight in Dhaka. */
export const weekNo = (now: Date) => Math.floor((dayNo(now) + 5) / 7);

/** The seven dates (YYYY-MM-DD) of a week, Saturday first. */
export function weekDates(week: number): string[] {
  return Array.from({ length: 7 }, (_, i) => new Date((week * 7 - 5 + i) * DAY).toISOString().slice(0, 10));
}

/** FNV-1a: a stable number from a string. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded random source, 0 ≤ n < 1. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export interface DayDuty {
  duty: Duty;
  members: string[];
}

/**
 * Who does what, day by day (index 0 = Saturday). Each slot goes to whoever
 * has had the least today, then the least this week, then the least of this
 * duty; ties fall to the week's shuffled order. The same seed and week always
 * give the same rota.
 */
export function weekRota(memberIds: string[], duties: Duty[], week: number, seed: string): DayDuty[][] {
  const rand = seeded(hash(`${seed}:${week}`));
  const order = [...memberIds];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Map(order.map((id, i) => [id, i]));
  const weekLoad = new Map<string, number>();
  const dutyLoad = new Map<string, number>();
  const n = order.length;

  return Array.from({ length: 7 }, (_, day) => {
    const dayLoad = new Map<string, number>();
    return duties
      .filter((d) => d.days.includes(day))
      .map((duty) => {
        const picked: string[] = [];
        for (let k = 0; k < Math.min(duty.need, n); k++) {
          const next = order
            .filter((id) => !picked.includes(id))
            .sort(
              (a, b) =>
                (dayLoad.get(a) ?? 0) - (dayLoad.get(b) ?? 0) ||
                (weekLoad.get(a) ?? 0) - (weekLoad.get(b) ?? 0) ||
                (dutyLoad.get(`${duty.id}:${a}`) ?? 0) - (dutyLoad.get(`${duty.id}:${b}`) ?? 0) ||
                ((rank.get(a)! + day) % n) - ((rank.get(b)! + day) % n),
            )[0];
          picked.push(next);
          dayLoad.set(next, (dayLoad.get(next) ?? 0) + 1);
          weekLoad.set(next, (weekLoad.get(next) ?? 0) + 1);
          dutyLoad.set(`${duty.id}:${next}`, (dutyLoad.get(`${duty.id}:${next}`) ?? 0) + 1);
        }
        return { duty, members: picked };
      });
  });
}

export const doneKey = (date: string, dutyId: string, memberId: string) => `${date}|${dutyId}|${memberId}`;

/** Duty slots per member across a week's rota. */
export function loadOf(rota: DayDuty[][]): Map<string, number> {
  const load = new Map<string, number>();
  for (const day of rota) for (const { members } of day) for (const m of members) load.set(m, (load.get(m) ?? 0) + 1);
  return load;
}

/** How much of the week's work so far is done: slots on days up to `today`. */
export function weekProgress(rota: DayDuty[][], dates: string[], done: Record<string, true>, today: number): { done: number; of: number } {
  let of = 0;
  let n = 0;
  rota.forEach((day, i) => {
    if (i > today) return;
    for (const { duty, members } of day) {
      for (const m of members) {
        of++;
        if (done[doneKey(dates[i], duty.id, m)]) n++;
      }
    }
  });
  return { done: n, of };
}

const wrap = (d: number) => ((d % 7) + 7) % 7;

/** A lab's usual jobs around its lab day: build and supervise on the day, numbers next, report after. */
export function labDuties(labDay: number): Duty[] {
  const d = wrap(labDay);
  return [
    { id: "lead", title: "সুপারভাইজার · দল দেখভাল", need: 1, days: [d], icon: "lead" },
    { id: "build", title: "সার্কিট ও সেটআপ বানানো", need: 2, days: [d], icon: "build" },
    { id: "calc", title: "রিডিং নেওয়া ও হিসাব", need: 1, days: [d, wrap(d + 1)], icon: "calc" },
    { id: "data", title: "ডেটা টেবিল ও গ্রাফ", need: 1, days: [wrap(d + 1)], icon: "data" },
    { id: "print", title: "রিপোর্ট লেখা ও প্রিন্ট", need: 2, days: [wrap(d + 2), wrap(d + 3)], icon: "print" },
    { id: "tools", title: "যন্ত্রপাতি ফেরত ও গোছানো", need: 1, days: [d], icon: "tools" },
  ];
}

/** A class's everyday jobs on its class days. */
export function classDuties(days: number[]): Duty[] {
  const on = days.length > 0 ? [...new Set(days.map(wrap))].sort() : [0, 1, 2, 3, 4, 5];
  return [
    { id: "monitor", title: "ক্লাস মনিটর", need: 1, days: on, icon: "lead" },
    { id: "notes", title: "নোট লেখা ও শেয়ার", need: 2, days: on, icon: "note" },
    { id: "board", title: "বোর্ড, হাজিরা ও ঘোষণা", need: 1, days: on, icon: "board" },
    { id: "ask", title: "আজকের প্রশ্ন সংগ্রহ", need: 1, days: on, icon: "question" },
    { id: "tidy", title: "ক্লাস গোছানো", need: 2, days: on, icon: "clean" },
  ];
}
