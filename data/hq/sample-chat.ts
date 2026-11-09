import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { Approval, Channel, HqDb, Issue, Message, Team } from "../../lib/hq/types.ts";

const DECLINE_REASON =
  "Thank you for inviting me to the health camp team, and I really do want to help the village camp succeed. I have to decline for now because I am already committed to the Aponjon PCB version three, which is due next week and carries a high risk; if I split my time I will deliver both late and the camp would suffer. The firmware for the band also has an open temperature drift problem that only I have the test rig for at the moment, and Janassor is depending on me to finish the calibration before the field test in Kazaikat. I also promised Mahir that I would document the OTA rollback process so the new interns can learn it. I have shared my availability calendar with you; from the twenty-eighth onward I will have two free afternoons a week, and I would be glad to join then, or to help with the sensor demo stand on the camp day itself if that is useful. Please count on me for a smaller, well defined piece of work instead of full membership.";

/** Sample teams, chat and issues, relative to now; marked as sample through their ids and channels. */
export function seedChat(ctx: SeedCtx): Partial<HqDb> {
  const H = 3600_000;
  const D = 24 * H;
  const at = (ms: number) => new Date(ctx.now + ms).toISOString();

  const teams: Team[] = [
    {
      id: "tm-swasti",
      name: "SWASTI Squad",
      purpose: "Roll SWASTI out to upazila health complexes and clinics, starting with Nakla and Sherpur.",
      leaderId: "p-ishtiak",
      memberIds: ["p-luban", "p-mehek", "p-safia"],
      invites: ["p-luban", "p-mehek", "p-safia"].map((personId, i) => ({ personId, at: at(-30 * D), status: "accepted" as const, decidedAt: at(-30 * D + (i + 1) * H) })),
      taskIds: ["t-s10", "t-s15"],
      clientId: "cl-s1",
      status: "active",
      createdAt: at(-31 * D),
      approvedBy: ctx.prime,
      channelId: "ch-s-swasti",
      stickies: [
        { id: "sn-s1", text: "Sherpur clinic go-live moved to Thursday — tell the staff by tonight.", level: "urgent", by: "p-ishtiak", at: at(-5 * H) },
        { id: "sn-s2", text: "Server at the Nakla complex rebooted twice today. Check the UPS!", level: "crisis", by: "p-luban", at: at(-2 * H) },
        { id: "sn-s3", text: "Bring Bangla printed guides for the nurses.", level: "info", by: "p-safia", at: at(-1 * D), resolved: true },
      ],
      clientUpdates: [
        { id: "cu-s1", text: "Shared the pilot results: triage time down from 25 to 9 minutes.", by: "p-ishtiak", at: at(-4 * D) },
        { id: "cu-s2", text: "Confirmed staff training dates for Sherpur.", by: "p-ishtiak", at: at(-1 * D) },
      ],
    },
    {
      id: "tm-aponjon",
      name: "Aponjon Hardware",
      purpose: "The wearable: sensors, firmware, PCB and field tests.",
      leaderId: "p-sharul",
      memberIds: ["p-janassor", "p-shabbin"],
      invites: [
        { personId: "p-janassor", at: at(-20 * D), status: "accepted", decidedAt: at(-20 * D) },
        { personId: "p-shabbin", at: at(-20 * D), status: "accepted", decidedAt: at(-19 * D) },
        { personId: "p-safia", at: at(-2 * D), status: "pending" },
      ],
      taskIds: [],
      status: "active",
      createdAt: at(-21 * D),
      approvedBy: ctx.prime,
      channelId: "ch-s-aponjon",
      stickies: [{ id: "sn-s4", text: "Order the MAX30102 spares before Eid closures.", level: "urgent", by: "p-sharul", at: at(-1 * D) }],
      clientUpdates: [],
    },
    {
      id: "tm-camp",
      name: "Village Health Camp",
      purpose: "Run the free health camp at Kazaikat with SWASTI kiosks and Aponjon demos.",
      leaderId: "p-nabeel",
      memberIds: [],
      invites: [
        { personId: "p-mehek", at: at(-1 * D), status: "pending" },
        { personId: "p-janassor", at: at(-1 * D), status: "declined", reason: DECLINE_REASON, decidedAt: at(-10 * H) },
        { personId: ctx.prime, at: at(-1 * D), status: "pending" },
      ],
      taskIds: [],
      status: "pending",
      createdAt: at(-1 * D),
      stickies: [],
      clientUpdates: [],
    },
  ];

  const ch = (id: string, kind: Channel["kind"], name: string, topic: string, memberIds: string[], refId?: string): Channel => ({ id, kind, name, topic, memberIds, private: true, createdBy: ctx.prime, at: at(-30 * D), refId });
  const channels: Channel[] = [
    ch("ch-s-swasti", "team", "SWASTI Squad", teams[0].purpose, ["p-ishtiak", "p-luban", "p-mehek", "p-safia"], "tm-swasti"),
    ch("ch-s-aponjon", "team", "Aponjon Hardware", teams[1].purpose, ["p-sharul", "p-janassor", "p-shabbin"], "tm-aponjon"),
    ch("ch-s-dm1", "dm", "Jamil Hossan", "", [ctx.prime, "p-jamil"]),
    { ...ch("ch-s-dev", "channel", "dev", "Code, builds and reviews", []), private: false },
    ch("ch-s-issue1", "issue", "Cloud bill doubled in September", "Issue discussion", [ctx.prime, "p-luban", "p-sadman"], "is-s1"),
    ch("ch-s-issue2", "issue", "Late check-ins on rainy days", "Issue discussion", [ctx.prime, "p-jamil", "p-sadman"], "is-s2"),
  ];

  let n = 0;
  const m = (channelId: string, by: string, text: string, off: number, x: Partial<Message> = {}): Message => ({ id: `m-s${++n}`, channelId, by, text, at: at(off), fileIds: [], reactions: {}, mentions: [], urgent: false, ...x });
  const messages: Message[] = [
    m("c-announce", ctx.prime, "Welcome to Kandari HQ! From today every task, report and meeting lives here. We turn problems into economy.", -3 * D, { reactions: { "🔥": ["p-luban", "p-mehek", "p-sharul"], "👏": ["p-jamil", "p-sadman"] }, pinned: true }),
    m("c-announce", "p-jamil", "Reminder: office hours are 10:00–18:00, with 15 minutes' grace. Check in from the top bar.", -2 * D),
    m("c-general", "p-sadman", "Good morning, team. Field test at Kazaikat is on Saturday — who's coming?", -26 * H),
    m("c-general", "p-janassor", "Me, with the calibration rig.", -25.5 * H),
    m("c-general", "p-safia", "I'll bring the nurses' guides. @sadman do we have the van?", -25 * H, { mentions: ["p-sadman"] }),
    m("c-general", "p-sadman", "Van booked, leaving 7:00 sharp.", -24.8 * H, { reactions: { "👍": ["p-safia", "p-janassor"] } }),
    m("c-general", "p-mehek", "Health camp page preview is up for review this evening.", -3 * H),
    m("c-urgent", "p-luban", "@urgent Nakla server rebooted twice — triage kiosk was down 6 minutes. Investigating the UPS.", -2 * H, { urgent: true }),
    m("c-urgent", "p-ishtiak", "On it with the complex's IT person. Kiosk back on battery.", -1.8 * H, { urgent: false }),
    m("c-adda", "p-nabeel", "Who stole the last singara? 😄", -5 * H, { reactions: { "😂": ["p-mehek", "p-luban", "p-jamil", "p-safia"] } }),
    m("c-adda", "p-mehek", "Not me. But I know who did 👀", -4.9 * H),
    m("ch-s-dev", "p-luban", "RAG indexer PR is ready: chunking keeps tables intact now.", -9 * H),
    m("ch-s-dev", "p-shabbin", "Reviewed — two small comments, otherwise good to merge.", -8 * H),
    m("ch-s-swasti", "p-ishtiak", "Sherpur go-live moves to Thursday. @luban can the RAG update land before then?", -5 * H, { mentions: ["p-luban"] }),
    m("ch-s-swasti", "p-luban", "Yes, submitting tonight.", -4.5 * H),
    m("ch-s-swasti", "p-safia", "I'll run the staff test day on Wednesday.", -4 * H, { reactions: { "🙌": ["p-ishtiak"] } }),
    m("ch-s-aponjon", "p-sharul", "PCB v3 parts list is in the task notebook. Please check the sensor footprints.", -6 * H),
    m("ch-s-aponjon", "p-janassor", "Footprints look right. The temperature chamber is ready for the drift test.", -5 * H),
    m("ch-s-dm1", "p-jamil", "Bhai, the Mymensingh clinic wants the quotation by Sunday.", -7 * H),
    m("ch-s-dm1", ctx.prime, "Send it with the 15% VAT and our standard support terms.", -6.5 * H),
    m("ch-s-issue1", "p-sadman", "Our cloud bill went from ৳38k to ৳79k in September.", -6 * D),
    m("ch-s-issue1", "p-luban", "Found it: a test GPU instance left running for three weeks.", -5.5 * D),
    m("ch-s-issue2", "p-jamil", "Six late check-ins this week, all on rainy mornings.", -1 * D),
  ];
  // A thread under the field-test question.
  messages.push(m("c-general", "p-luban", "Can I join for the afternoon only?", -24.5 * H, { threadOf: "m-s3" }));
  messages.push(m("c-general", "p-sadman", "Sure, take the 13:00 bus.", -24.4 * H, { threadOf: "m-s3" }));

  const issues: Issue[] = [
    { id: "is-s1", title: "Cloud bill doubled in September", detail: "Our cloud bill went from ৳38k to ৳79k in September.", by: "p-sadman", at: at(-6 * D), memberIds: [ctx.prime, "p-luban", "p-sadman"], channelId: "ch-s-issue1", status: "solved", solution: "Shut down the forgotten GPU instance and added a budget alert at ৳45k.", lesson: "Every test instance gets an owner tag and an auto-stop time.", solvedAt: at(-5 * D) },
    { id: "is-s2", title: "Late check-ins on rainy days", detail: "Six late check-ins this week, all on rainy mornings.", by: "p-jamil", at: at(-1 * D), memberIds: [ctx.prime, "p-jamil", "p-sadman"], channelId: "ch-s-issue2", status: "discussing" },
  ];

  const approvals: Approval[] = [{ id: "ap-s-camp", kind: "team", title: 'New team "Village Health Camp" led by Nabeel Shadad', detail: teams[2].purpose, refId: "tm-camp", by: "p-nabeel", at: at(-1 * D), perm: "teams.approve", status: "pending" }];

  return { teams, channels, messages, issues, approvals, reads: { [`${ctx.prime}:c-announce`]: at(-2.5 * D) } };
}
