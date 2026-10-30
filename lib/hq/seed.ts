/**
 * The database on day one. The people and the base chat channels are real;
 * everything from the data/hq/sample-*.ts files is marked `sample: true`
 * (or lives on sample people) and the prime admin can clear it from the
 * command centre once real work starts. Accounts are not seeded here: the
 * prime admin's comes from the server's environment (lib/hq/server/store.ts).
 */
import { PRIME_ID, seedPeople } from "../../data/hq/people.ts";
import { seedBusiness } from "../../data/hq/sample-business.ts";
import { seedChat } from "../../data/hq/sample-chat.ts";
import { seedControl } from "../../data/hq/sample-control.ts";
import { seedTasks } from "../../data/hq/sample-tasks.ts";
import { seedTime } from "../../data/hq/sample-time.ts";
import { seedArticles } from "../../data/hq/shongbidhan.ts";
import type { Channel, HqDb, OfficeSettings, Person } from "./types.ts";

export interface SeedCtx {
  now: number;
  people: Person[];
  prime: string;
}

export const OFFICE_DEFAULT: OfficeSettings = {
  start: "10:00",
  end: "18:00",
  graceMins: 15,
  // Friday and Saturday off; Mahir can change it on the attendance page.
  weekend: [5, 6],
  holidays: [
    { day: "2026-12-16", name: "Victory Day" },
    { day: "2027-02-21", name: "Language Martyrs' Day" },
    { day: "2027-03-26", name: "Independence Day" },
  ],
  leaveDays: { casual: 10, sick: 14, annual: 16 },
};

function baseChannels(at: string): Channel[] {
  const ch = (id: string, name: string, topic: string): Channel => ({ id, kind: "channel", name, topic, memberIds: [], private: false, createdBy: PRIME_ID, at });
  return [
    ch("c-general", "general", "The whole of Kandari Lab"),
    ch("c-announce", "announcements", "Office announcements — leadership posts here"),
    ch("c-urgent", "urgent", "Crisis line: a post here alerts everyone"),
    ch("c-adda", "adda", "Off-work chat and a little laughter"),
  ];
}

export function emptyDb(now: number): HqDb {
  const at = new Date(now).toISOString();
  return {
    version: 1,
    seededAt: at,
    faceLock: false,
    seq: {},
    people: [],
    accounts: [],
    applications: [],
    audit: [],
    tasks: [],
    points: [],
    badges: [],
    reports: [],
    todos: [],
    notes: [],
    teams: [],
    help: [],
    channels: baseChannels(at),
    messages: [],
    reads: {},
    events: [],
    notices: [],
    checkins: [],
    leaves: [],
    office: OFFICE_DEFAULT,
    articles: [],
    cases: [],
    issues: [],
    clients: [],
    projects: [],
    docs: [],
    txns: [],
    content: [],
    orders: [],
    approvals: [],
    stories: [],
    files: [],
  };
}

/** Arrays from each domain's seed are appended; scalars (seq) merged. */
function merge(db: HqDb, part: Partial<HqDb>): HqDb {
  const out = { ...db } as Record<string, unknown>;
  for (const [k, v] of Object.entries(part)) {
    const cur = out[k];
    if (Array.isArray(cur) && Array.isArray(v)) out[k] = [...cur, ...v];
    else if (cur && typeof cur === "object" && v && typeof v === "object" && !Array.isArray(v)) out[k] = { ...(cur as object), ...(v as object) };
    else out[k] = v;
  }
  return out as unknown as HqDb;
}

export function seedDb(now: number, opts: { samples?: boolean } = {}): HqDb {
  let db = emptyDb(now);
  db.people = seedPeople();
  db.articles = seedArticles();
  if (opts.samples !== false) {
    const ctx: SeedCtx = { now, people: db.people, prime: PRIME_ID };
    for (const part of [seedTasks(ctx), seedChat(ctx), seedTime(ctx), seedBusiness(ctx), seedControl(ctx)]) db = merge(db, part);
  }
  return db;
}
