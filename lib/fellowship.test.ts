import { test } from "node:test";
import assert from "node:assert/strict";
import { FAQ, LOOK_FOR, PHASES, TRACKS, trackTeam } from "../data/fellowship.ts";
import { applicationProblems, buildApplication, isWorkLink, makeRef, parseApplication, type ApplicationDraft } from "./fellowship.ts";

const IDS = TRACKS.map((t) => t.id);

const draft = (x: Partial<ApplicationDraft> = {}): ApplicationDraft => ({
  name: "Rina Das",
  contact: "rina@example.com",
  institution: "BUET, Department of EEE",
  level: "undergrad",
  track: "sight",
  why: "I grew up beside a blind neighbour who walks to the market alone every day. I have built an ultrasonic cane prototype and want to make it smarter.",
  link: "https://github.com/rina/cane",
  commit: true,
  consent: true,
  ...x,
});

test("a complete application has no problems; each gap is named", () => {
  assert.deepEqual(applicationProblems(draft(), IDS), {});
  assert.deepEqual(applicationProblems(draft({ contact: "01712345678", link: "" }), IDS), {});
  const p = applicationProblems(draft({ name: "R", contact: "nope", institution: "", level: "", track: "x", why: "short", link: "javascript:alert(1)", commit: false, consent: false }), IDS);
  assert.deepEqual(Object.keys(p).sort(), ["commit", "consent", "contact", "institution", "level", "link", "name", "track", "why"]);
});

test("only https links with a real host are accepted", () => {
  assert.ok(isWorkLink("https://github.com/rina"));
  for (const bad of ["http://example.com", "javascript:alert(1)", "https://localhost", "https://exa mple.com", "ftp://x.org", `https://x.org/${"a".repeat(300)}`]) assert.ok(!isWorkLink(bad), bad);
});

test("references read FEL-year-code, and a saved application survives only whole", () => {
  assert.equal(makeRef(2026, 0), "FEL-2026-0000");
  assert.match(makeRef(2026, 0.999999), /^FEL-2026-[0-9A-Z]{4}$/);
  const a = buildApplication(draft({ name: "  Rina Das " }), { now: new Date("2026-10-19T10:00:00Z"), rand: 0.5 });
  assert.equal(a.name, "Rina Das");
  assert.deepEqual(parseApplication(JSON.parse(JSON.stringify(a)), IDS), a);
  assert.equal(parseApplication({ ...a, track: "mars" }, IDS), null);
  assert.equal(parseApplication({ ...a, ref: "<b>" }, IDS), null);
  assert.equal(parseApplication("x", IDS), null);
  assert.equal(parseApplication({ ...a, link: "javascript:alert(1)" }, IDS)!.link, "");
});

test("the fellowship content is complete: four tracks, four phases, team drawn from real profiles", () => {
  assert.equal(new Set(IDS).size, TRACKS.length);
  assert.equal(PHASES.length, 4);
  assert.equal(LOOK_FOR.length, 4);
  assert.ok(FAQ.length >= 5);
  for (const t of TRACKS) assert.ok(t.work.length >= 3 && t.skills.length >= 3 && t.depts.length >= 1, t.id);
  assert.ok(trackTeam(TRACKS.find((t) => t.id === "swasti")!).some((m) => m.slug === "luban-ahmed"));
  assert.deepEqual(trackTeam(TRACKS.find((t) => t.id === "soil")!), []);
});
