import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleChats } from "../../data/media/class-chat.ts";
import { sampleClassrooms } from "../../data/media/classroom.ts";
import { DEMO_NOW } from "../../data/media/clock.ts";
import { sampleLabs } from "../../data/media/labs.ts";
import { sampleProjects } from "../../data/media/research.ts";
import { duration, slotMinutes, tickerItems, WELCOME, type TickerInput } from "./class-ticker.ts";

const num = (v: number | string) => String(v);
const ssc = sampleClassrooms.find((c) => c.id === "c-ssc27")!;
const lab = sampleLabs[0];

const input = (me: TickerInput["me"], extra: Partial<TickerInput> = {}): TickerInput => ({
  me,
  classes: [{ room: ssc, now: DEMO_NOW }],
  labs: [{ room: lab, now: DEMO_NOW }],
  projects: sampleProjects,
  chats: Object.entries(sampleChats).map(([roomId, list]) => ({ roomId, href: `/media/classroom/${roomId}`, list })),
  stay: { visit: 12 * 60_000, total: 125 * 60_000 },
  num,
  ...extra,
});

test("the welcome comes first and time spent comes last", () => {
  const items = tickerItems(input({ id: "s-sohel", name: "সোহেল মিয়া" }));
  assert.equal(items[0].text, WELCOME);
  assert.equal(items.at(-1)!.kind, "stay");
  assert.equal(items.at(-1)!.text, "এবার 12 মিনিট · সব মিলিয়ে 2 ঘণ্টা 5 মিনিট");
});

test("the next class is read from the routine in Dhaka time", () => {
  // DEMO_NOW is Friday 18:00 in Dhaka, so Saturday's first class is next.
  const slot = tickerItems(input({ id: "s-sohel", name: "সোহেল মিয়া" })).find((t) => t.kind === "classtime");
  assert.equal(slot?.text, "গণিত — দ্বিঘাত সমীকরণ · কাল ১০:০০ · দশম শ্রেণি · বিজ্ঞান (এসএসসি-২৭)");
  assert.equal(slotMinutes("১০:৩০"), 630);
  assert.equal(slotMinutes("9:05"), 545);
  assert.ok(Number.isNaN(slotMinutes("সকাল")));
});

test("a mention is someone else writing the viewer's first name", () => {
  const sohel = tickerItems(input({ id: "s-sohel", name: "সোহেল মিয়া" })).find((t) => t.kind === "mention");
  assert.match(sohel?.text ?? "", /^রাহাত হাসান: “সোহেল, আমি দেখাব/);
  const rahat = tickerItems(input({ id: "s-rahat", name: "রাহাত হাসান" })).find((t) => t.kind === "mention");
  assert.equal(rahat, undefined);
});

test("lab reports and exams show for a lab member, research only for its team", () => {
  const imran = tickerItems(input({ id: "l-imran", name: "ইমরান খান" }));
  assert.ok(imran.some((t) => t.kind === "pending" || t.kind === "missing"));
  assert.ok(imran.some((t) => t.kind === "exam"));
  assert.ok(imran.some((t) => t.kind === "lab"));
  const outsider = tickerItems(input({ id: "nobody", name: "অচেনা" }));
  assert.ok(!outsider.some((t) => ["pending", "missing", "research", "mention"].includes(t.kind)));
});

test("no rooms means just the welcome and the time spent", () => {
  const items = tickerItems(input({ id: "x", name: "ক" }, { classes: [], labs: [], projects: [], chats: [] }));
  assert.deepEqual(
    items.map((t) => t.kind),
    ["welcome", "stay"],
  );
  assert.equal(duration(20_000, num), "এক মিনিটের কম");
  assert.equal(duration(60 * 60_000, num), "1 ঘণ্টা");
});
