// Development: rebuilds Kandari HQ's data from the seed (lib/hq/seed.ts and
// data/hq/sample-*.ts) while keeping every sign-in account, face enrolment
// and the face-lock switch. The running server notices the new file on its
// next request.
//   node scripts/hq-reseed.mjs            → with sample data
//   node scripts/hq-reseed.mjs --empty    → people and channels only
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { seedDb } from "../lib/hq/seed.ts";

const dir = process.env.HQ_DATA_DIR || path.join(process.cwd(), ".hq-data");
const file = path.join(dir, "db.json");
const old = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
const db = seedDb(Date.now(), { samples: !process.argv.includes("--empty") });
if (old) {
  db.accounts = old.accounts ?? [];
  db.faceLock = old.faceLock ?? false;
  // The demo people come back on the server's next read (lib/hq/server/demo.ts).
  db.version = (old.version ?? 1) + 1;
  for (const p of db.people) p.hasAccount = db.accounts.some((a) => a.personId === p.id);
  for (const a of db.accounts) {
    const p = db.people.find((x) => x.id === a.personId);
    if (p) p.email = a.email;
  }
}
mkdirSync(dir, { recursive: true });
const tmp = `${file}.${process.pid}.tmp`;
writeFileSync(tmp, JSON.stringify(db), "utf8");
renameSync(tmp, file);
console.log(`Reseeded ${file}: ${db.people.length} people, ${db.tasks.length} tasks, ${db.accounts.length} accounts kept.`);
