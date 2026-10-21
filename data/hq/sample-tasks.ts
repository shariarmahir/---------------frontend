import { dhakaDay } from "../../lib/hq/rules.ts";
import { taskPoints } from "../../lib/hq/scoring.ts";
import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { Badge, DailyReport, HelpRequest, HqDb, Milestone, NoteBlock, PointEntry, Priority, Story, Task, TaskStatus } from "../../lib/hq/types.ts";

/** Sample TaskBook data, relative to now; every task and story is marked `sample: true`. */
export function seedTasks(ctx: SeedCtx): Partial<HqDb> {
  const H = 3600_000;
  const D = 24 * H;
  const at = (ms: number) => new Date(ctx.now + ms).toISOString();
  let n = 0;
  const ms = (kind: Milestone["kind"], title: string, off: number, done = false): Milestone => ({ id: `ms-s${++n}`, kind, title, at: at(off), done, doneAt: done ? at(off) : undefined });
  const nb = (kind: NoteBlock["kind"], text: string, by: string, off: number, checked?: boolean): NoteBlock => ({ id: `nb-s${++n}`, kind, text, by, at: at(off), checked });

  const t = (
    code: number,
    title: string,
    x: Omit<Partial<Task>, "due"> & { priority: Priority; status: TaskStatus; due: number; createdBy?: string },
  ): Task => ({
    id: `t-s${code}`,
    code: `KT-${String(code).padStart(4, "0")}`,
    title,
    brief: x.brief ?? "",
    kind: x.kind ?? "work",
    risk: x.risk ?? "medium",
    skills: x.skills ?? [],
    mode: x.mode ?? "either",
    createdBy: x.createdBy ?? ctx.prime,
    createdAt: x.createdAt ?? at(-((code % 9) + 1) * D - (code % 5) * H),
    estimateHours: x.estimateHours ?? 6,
    milestones: x.milestones ?? [],
    notebook: x.notebook ?? [],
    fileIds: [],
    sharedWith: x.sharedWith ?? [],
    merits: x.merits ?? [],
    sample: true,
    ...x,
    due: at(x.due),
  });

  const tasks: Task[] = [
    t(1, "Fix SWASTI voice assistant timeout on 3G", { priority: "immediate", status: "open", due: 4 * H, risk: "high", kind: "client", skills: ["ai", "backend"], brief: "Rural users on 3G get a timeout after 8 s. Stream the first tokens and add a retry with a shorter prompt.", estimateHours: 5 }),
    t(2, "Aponjon band: SpO2 drift above 38 °C", { priority: "urgent", status: "open", due: 10 * H, risk: "high", skills: ["iot", "firmware", "sensors"], brief: "Field test at Kazaikat shows a 2–3% SpO2 drift when skin temperature is high. Calibrate and patch the firmware.", mode: "team", estimateHours: 12 }),
    t(3, "Kazaikat pharmacy stock dashboard", { priority: "today", status: "open", due: 9 * H + D * 0.2, skills: ["web", "react"], brief: "A one-page stock view for the village centre's smart pharmacy, readable on a cheap Android phone." }),
    t(4, "Design the One Village centre signage", { priority: "tomorrow", status: "open", due: 1.4 * D, kind: "work", risk: "low", skills: ["design", "branding"], estimateHours: 4 }),
    t(5, "Grant proposal: blind-assistance wearable", { priority: "this-week", status: "open", due: 3 * D, kind: "research", skills: ["research", "communication"], estimateHours: 10 }),
    t(6, "PCB v3 for the Aponjon band", { priority: "next-week", status: "open", due: 8 * D, risk: "high", skills: ["pcb", "hardware"], mode: "team", estimateHours: 30 }),
    t(7, "Write onboarding guide for new interns", { priority: "later", status: "open", due: 20 * D, risk: "low", skills: ["documentation"], estimateHours: 6 }),
    t(8, "SWASTI RAG: add DGHS dengue guideline", {
      priority: "today",
      status: "in-progress",
      due: 7 * H,
      skills: ["ai", "healthcare"],
      takenBy: "p-luban",
      takenAt: at(-20 * H),
      kind: "client",
      brief: "Index the 2026 DGHS dengue treatment guideline and test 20 triage questions.",
      milestones: [ms("discussion", "Scope with the medical advisor", -18 * H, true), ms("build", "Index the guideline", -6 * H, true), ms("testing", "Run 20 triage questions", 2 * H), ms("submit", "Submit", 6 * H)],
      notebook: [nb("heading", "Plan", "p-luban", -19 * H), nb("check", "Get the PDF from the DGHS site", "p-luban", -19 * H, true), nb("check", "Chunk by section, keep tables", "p-luban", -10 * H, true), nb("check", "Evaluate with the 20 questions", "p-luban", -2 * H, false), nb("code", "chunk_size=800, overlap=120, embed=bge-m3", "p-luban", -9 * H)],
      sharedWith: ["p-mehek"],
    }),
    t(9, "Village health camp landing page", {
      priority: "tomorrow",
      status: "in-progress",
      due: 1.2 * D,
      skills: ["web", "design"],
      takenBy: "p-mehek",
      takenAt: at(-8 * H),
      milestones: [ms("meeting", "Brief with marketing", -7 * H, true), ms("build", "First build", 10 * H), ms("review", "Review with Nabeel", 20 * H)],
      notebook: [nb("text", "Hero: date, place, free check-up list. Bangla first, big type.", "p-mehek", -7 * H)],
    }),
    t(10, "SWASTI clinic onboarding — Sherpur", {
      priority: "this-week",
      status: "in-progress",
      due: 2.5 * D,
      mode: "team",
      teamId: "tm-swasti",
      takenBy: "p-ishtiak",
      takenAt: at(-2 * D),
      kind: "client",
      clientId: "cl-s2",
      skills: ["client", "design", "web"],
      milestones: [ms("meeting", "Kick-off with the clinic", -40 * H, true), ms("build", "Configure the clinic profile", -10 * H, true), ms("testing", "Staff test day", 20 * H), ms("submit", "Go live", 2.4 * D)],
    }),
    t(11, "Sensor enclosure 3D print", { priority: "today", status: "submitted", due: 10 * H, skills: ["hardware", "3d"], takenBy: "p-sharul", takenAt: at(-30 * H), submittedAt: at(-1 * H), submission: { summary: "Printed three enclosures in PETG; the strap slot is now 2 mm wider.", fileIds: [] } }),
    // Done, with reviews — the hat-trick behind Sharul's Quick Silver.
    t(12, "Battery runtime test, 48 h", { priority: "this-week", status: "done", due: -2 * D, createdAt: at(-9 * D), skills: ["iot", "testing"], takenBy: "p-sharul", takenAt: at(-8 * D), submittedAt: at(-4 * D), review: { by: "p-mahir", score: 5, accuracy: 5, at: at(-3.5 * D) } }),
    t(13, "Firmware OTA rollback", { priority: "today", status: "done", due: -1.5 * D, createdAt: at(-6 * D), skills: ["firmware"], takenBy: "p-sharul", takenAt: at(-5 * D), submittedAt: at(-2.6 * D), review: { by: "p-mahir", score: 4, accuracy: 4.5, at: at(-2 * D) }, merits: [{ kind: "never-give-up", points: 10, to: "p-sharul", by: "p-mahir", at: at(-2 * D), note: "Debugged it through the night" }] }),
    t(14, "BLE pairing fix for old Androids", { priority: "urgent", status: "done", due: -0.5 * D, createdAt: at(-3 * D), risk: "high", skills: ["iot", "mobile"], takenBy: "p-sharul", takenAt: at(-2.5 * D), submittedAt: at(-1.2 * D), review: { by: "p-sadman", score: 5, accuracy: 4.5, at: at(-1 * D) } }),
    t(15, "SWASTI pilot at Nakla Upazila Health Complex", {
      priority: "this-week",
      status: "done",
      due: -5 * D,
      createdAt: at(-20 * D),
      mode: "team",
      teamId: "tm-swasti",
      takenBy: "p-ishtiak",
      takenAt: at(-19 * D),
      submittedAt: at(-6 * D),
      kind: "client",
      clientId: "cl-s1",
      risk: "high",
      estimateHours: 40,
      review: { by: "p-mahir", score: 5, accuracy: 5, at: at(-5.5 * D) },
      clientReview: { score: 4.8, note: "Triage time fell from 25 to 9 minutes.", at: at(-4 * D) },
      merits: [{ kind: "leadership", points: 15, to: "p-ishtiak", by: "p-mahir", at: at(-5.5 * D) }, { kind: "kindness", points: 8, to: "p-safia", by: "p-mahir", at: at(-5.5 * D), note: "Trained the nurses in Bangla, patiently" }],
    }),
    t(16, "Social media plan for the health camp", { priority: "this-week", status: "done", due: -3 * D, createdAt: at(-10 * D), risk: "low", skills: ["marketing", "content"], takenBy: "p-nabeel", takenAt: at(-9 * D), submittedAt: at(-3.2 * D), review: { by: "p-mahir", score: 4, accuracy: 4, at: at(-3 * D) } }),
    t(17, "Learning project: firmware basics", { priority: "next-week", status: "in-progress", due: 6 * D, kind: "learning", risk: "low", skills: ["firmware"], learningSkill: "firmware", mode: "solo", takenBy: "p-safia", takenAt: at(-1 * D), approval: "approved", createdBy: "p-safia" }),
  ];
  for (const x of tasks) if (x.status === "done") x.awarded = taskPoints(x);

  const points: PointEntry[] = [];
  let pn = 0;
  const pt = (personId: string, value: number, kind: PointEntry["kind"], reason: string, off: number, taskId?: string) => {
    if (value) points.push({ id: `pt-s${++pn}`, personId, points: value, kind, reason, at: at(off), taskId });
  };
  for (const x of tasks.filter((t) => t.status === "done")) {
    const base = (x.awarded ?? 0) - x.merits.reduce((s, m) => s + m.points, 0);
    if (x.teamId) {
      const team = ["p-ishtiak", "p-luban", "p-mehek", "p-safia"];
      const lead = Math.round(base * 0.1);
      const each = Math.floor((base - lead) / team.length);
      for (const p of team) pt(p, each + (p === "p-ishtiak" ? lead : 0), "task", `${x.code} ${x.title}`, Date.parse(x.review!.at) - ctx.now, x.id);
    } else pt(x.takenBy!, base, "task", `${x.code} ${x.title}`, Date.parse(x.review!.at) - ctx.now, x.id);
    for (const m of x.merits) pt(m.to, m.points, "merit", `${m.kind}: ${x.code}`, Date.parse(m.at) - ctx.now, x.id);
  }
  pt("p-sharul", 25, "badge", "Quick Silver hat-trick", -1.2 * D, "t-s14");
  pt("p-ishtiak", 40, "badge", "Iron Man", -4 * D, "t-s15");
  pt("p-jamil", 15, "badge", "Man of the day", -1 * D);
  pt("p-safia", 8, "help", "Helped: sensor calibration", -2 * D);
  for (const p of ["p-luban", "p-mehek", "p-sharul", "p-safia", "p-jamil", "p-nabeel", "p-janassor", "p-shabbin"]) for (let d = 1; d <= 4; d++) pt(p, 2, "daily", "Daily report", -d * D);
  // Earlier this season: a believable spread.
  const earlier: [string, number][] = [["p-ishtiak", 310], ["p-luban", 280], ["p-sharul", 240], ["p-safia", 190], ["p-mehek", 150], ["p-nabeel", 170], ["p-sadman", 130], ["p-jamil", 120], ["p-janassor", 160], ["p-shabbin", 140]];
  for (const [p, v] of earlier) pt(p, v, "task", "Earlier tasks this season", -40 * D);

  const day = (off: number) => dhakaDay(ctx.now + off);
  const badges: Badge[] = [
    { id: "bd-s1", personId: "p-sharul", kind: "quick-silver", day: day(-1.2 * D), note: "Hat-trick: three tasks submitted early in a row", taskId: "t-s14" },
    { id: "bd-s2", personId: "p-ishtiak", kind: "iron-man", day: day(-4 * D), note: "SWASTI Squad delivered the Nakla pilot — client rated 4.8/5", taskId: "t-s15" },
    { id: "bd-s3", personId: "p-jamil", kind: "man-of-the-day", day: day(-1 * D), note: "Closed three clinic contracts and wrote the clearest report" },
    { id: "bd-s4", personId: "p-luban", kind: "man-of-the-day", day: day(-2 * D), note: "Shipped the RAG indexer" },
    { id: "bd-s5", personId: "p-safia", kind: "shield", day: day(-3 * D), note: "A clean, complete week" },
    { id: "bd-s6", personId: "p-luban", kind: "quick-silver", day: day(-25 * D), note: "Hat-trick: three tasks submitted early in a row" },
  ];

  const reports: DailyReport[] = ["p-luban", "p-mehek", "p-sharul", "p-safia", "p-jamil"].map((p, i) => ({
    id: `dr-s${i}`,
    personId: p,
    day: day(0),
    done: ["Indexed 80% of the dengue guideline; 14 of 20 test questions pass.", "Built the health camp page hero and schedule.", "Submitted the enclosure print; started the PCB v3 parts list.", "Practised UART logging for the learning project.", "Signed the Mymensingh clinic NDA; sent two quotations."][i],
    blockers: ["Need a medical advisor for the edge cases.", "", "Waiting on JLCPCB quote.", "", "Invoice template needs the new VAT number."][i],
    tomorrow: ["Finish evaluation and submit.", "Mobile layout and Bangla copy.", "Order parts.", "Read the ESP32 sleep modes chapter.", "Follow up Nakla payment."][i],
    mood: [4, 5, 3, 4, 5][i],
    taskIds: [],
    at: at(-2 * H - i * 600_000),
  }));

  const help: HelpRequest[] = [
    { id: "hp-s1", by: "p-luban", taskId: "t-s8", title: "Medical check on dengue triage answers", detail: "Need someone who knows healthcare to sanity-check 6 triage answers before I submit.", skills: ["healthcare"], capable: ["p-mahir"], seen: [], status: "open", at: at(-3 * H), deadline: at(9 * H) },
    { id: "hp-s2", by: "p-mehek", title: "Bangla typography for the camp page", detail: "Hind Siliguri line height looks cramped on small phones — any design eye welcome.", skills: ["design", "branding"], capable: ["p-ishtiak", "p-safia", "p-nabeel"], seen: ["p-ishtiak"], helperId: "p-ishtiak", status: "helping", at: at(-6 * H), deadline: at(18 * H) },
    { id: "hp-s3", by: "p-janassor", title: "Sensor calibration rig", detail: "Help wiring the temperature chamber for the SpO2 drift test.", skills: ["sensors", "iot"], capable: ["p-safia", "p-sharul", "p-luban", "p-shabbin"], seen: ["p-safia"], helperId: "p-safia", status: "solved", at: at(-3 * D), deadline: at(-2 * D) },
  ];

  const stories: Story[] = [
    {
      id: "st-s1",
      title: "SWASTI cut triage time at Nakla from 25 to 9 minutes",
      taskId: "t-s15",
      teamId: "tm-swasti",
      clientId: "cl-s1",
      challenge: "Patients queued for 25 minutes before a nurse could triage them, and the Golden Two Hours were slipping away for the serious cases.",
      solution: "We set up SWASTI's voice triage in Bangla at the front desk with a nurse override, and trained six nurses in two afternoons.",
      why: "Voice works for patients who can't read; the nurse stays in charge, so trust stays high.",
      moments: [
        { at: at(-18 * D), text: "Kick-off with the upazila health officer" },
        { at: at(-12 * D), text: "First patient triaged by voice" },
        { at: at(-6 * D), text: "Handed over; nurses running it alone" },
        { at: at(-4 * D), text: "Client rating: 4.8 / 5" },
      ],
      fileIds: [],
      by: "p-ishtiak",
      at: at(-4 * D),
      cheers: ["p-mahir", "p-sadman", "p-luban", "p-mehek", "p-jamil"],
      sample: true,
    },
    {
      id: "st-s2",
      title: "Old Androids pair with the Aponjon band again",
      taskId: "t-s14",
      challenge: "Village users on Android 8 phones couldn't pair the band at all.",
      solution: "Sharul rewrote the BLE bonding flow with a legacy fallback and tested on eleven second-hand phones from Nakla bazaar.",
      why: "Most of our users own exactly those phones; a premium band that pairs only with new phones would fail the mission.",
      moments: [
        { at: at(-2.5 * D), text: "Bought 11 test phones for ৳14,000" },
        { at: at(-1.6 * D), text: "Legacy bonding works on 10 of 11" },
        { at: at(-1.2 * D), text: "Submitted a day early — Quick Silver!" },
      ],
      fileIds: [],
      by: "p-sharul",
      at: at(-1 * D),
      cheers: ["p-mahir", "p-janassor"],
      sample: true,
    },
  ];

  return {
    tasks,
    points,
    badges,
    reports,
    help,
    stories,
    todos: [
      { id: "td-s1", personId: ctx.prime, text: "Review the Aponjon SpO2 calibration plan", done: false, urgent: true, at: at(-4 * H) },
      { id: "td-s2", personId: ctx.prime, text: "Call the Nakla UHC officer about phase two", done: false, at: at(-5 * H) },
      { id: "td-s3", personId: ctx.prime, text: "Sign this month's salary sheet", done: true, at: at(-1 * D) },
    ],
    notes: [
      { id: "nt-s1", personId: ctx.prime, title: "Phase two idea", body: "One Village, One Medical Health Care Center: start with three villages around Kazaikat; a nurse + smart pharmacy + SWASTI kiosk each.", pinned: true, color: "navy", at: at(-2 * D) },
      { id: "nt-s2", personId: ctx.prime, title: "Investor questions", body: "Unit economics per village centre; device cost of Aponjon v3; regulatory path.", pinned: false, color: "cobalt", at: at(-1 * D) },
    ],
    seq: { KT: 17 },
  };
}

