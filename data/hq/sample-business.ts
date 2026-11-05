import { addDays, dhakaDay } from "../../lib/hq/rules.ts";
import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { Channel, Client, Doc, HqDb, Message, Project, Txn } from "../../lib/hq/types.ts";

/** Sample clients, projects, documents and six months of money, relative to now; all `sample: true`. */
export function seedBusiness(ctx: SeedCtx): Partial<HqDb> {
  const D = 86400_000;
  const at = (ms: number) => new Date(ctx.now + ms).toISOString();
  const today = dhakaDay(ctx.now);
  const hr = ["p-jamil", ctx.prime];

  const cl = (id: string, name: string, org: string, stage: Client["stage"], value: number, daysAgo: number, x: Partial<Client> = {}): Client => ({
    id,
    name,
    org,
    contact: { name, phone: "01700000000", email: `${id}@example.com` },
    sector: "Healthcare",
    stage,
    value,
    source: "Referral",
    notes: "",
    createdAt: at(-daysAgo * D),
    stageAt: at(-(daysAgo / 2) * D),
    onboarding: [],
    sample: true,
    ...x,
  });
  const clients: Client[] = [
    cl("cl-s1", "Dr. Rezaul Karim", "Nakla Upazila Health Complex", "reviewed", 1_850_000, 60, { managerId: "p-jamil", leadId: "p-ishtiak", teamId: "tm-swasti", review: { score: 4.8, text: "Triage time fell from 25 to 9 minutes. The nurses love the Bangla voice.", at: at(-4 * D) }, onboarding: [{ id: "ob1", item: "Sign the MoU", done: true }, { id: "ob2", item: "Staff training", done: true }, { id: "ob3", item: "Kiosk installation", done: true }] }),
    cl("cl-s2", "Farhana Akter", "Sherpur Community Clinic", "in-progress", 950_000, 30, { managerId: "p-jamil", leadId: "p-ishtiak", teamId: "tm-swasti", onboarding: [{ id: "ob4", item: "Sign the MoU", done: true }, { id: "ob5", item: "Clinic profile set-up", done: true }, { id: "ob6", item: "Staff test day", done: false }, { id: "ob7", item: "Go live", done: false }] }),
    cl("cl-s3", "Md. Habibur Rahman", "Mymensingh Care Clinic", "proposal", 1_200_000, 12, { source: "Health fair" }),
    cl("cl-s4", "Nasrin Sultana", "BRAC Health Programme (pilot)", "first-meeting", 4_500_000, 6, { sector: "NGO", source: "Conference", notes: "Interested in Aponjon for 500 community health workers." }),
    cl("cl-s5", "Kazaikat Village Committee", "One Village, One Medical Health Care Center — Kazaikat", "confirmed", 2_400_000, 4, { sector: "Community", source: "Founder's village", notes: "Smart pharmacy + SWASTI kiosk + nurse. Phase one of One Village, One Medical Health Care Center." }),
    cl("cl-s6", "Tanvir Hasan", "Dhaka Smart Pharmacy Ltd.", "lead", 600_000, 2, { sector: "Pharmacy", source: "Website" }),
    cl("cl-s7", "Dr. Ayesha Siddiqua", "Jamalpur Diabetic Centre", "delivered", 780_000, 45, { managerId: "p-jamil" }),
    cl("cl-s8", "Rafiq Chowdhury", "Chattogram Port Medical Unit", "lost", 1_100_000, 50, { notes: "Went with a foreign vendor on price." }),
  ];

  const channels: Channel[] = [
    { id: "ch-s-pj1", kind: "project", name: "Kazaikat village centre", topic: "Project room: resources, budget, quotation, invoice, challan, Mushok", memberIds: [...hr, "p-sadman"], private: true, createdBy: ctx.prime, at: at(-4 * D), refId: "pj-s1" },
    { id: "ch-s-pj2", kind: "project", name: "Sherpur Community Clinic", topic: "Project room", memberIds: [...hr, "p-ishtiak"], private: true, createdBy: ctx.prime, at: at(-28 * D), refId: "pj-s2" },
  ];
  const messages: Message[] = [
    { id: "m-s-pj1", channelId: "ch-s-pj1", by: ctx.prime, text: "Kazaikat confirmed the village centre. HR: please set up resources, budget, quotation, invoice, challan and Mushok until a client manager takes over.", at: at(-4 * D), fileIds: [], reactions: {}, mentions: [], urgent: false },
    { id: "m-s-pj2", channelId: "ch-s-pj1", by: "p-jamil", text: "On it. Quotation draft QT-2026-0004 is ready for review.", at: at(-3 * D), fileIds: [], reactions: { "👍": [ctx.prime] }, mentions: [], urgent: false },
  ];
  const projects: Project[] = [
    { id: "pj-s1", clientId: "cl-s5", title: "Kazaikat village centre — phase one", budget: 2_400_000, start: addDays(today, -4), due: addDays(today, 56), status: "setup", channelId: "ch-s-pj1", sample: true },
    { id: "pj-s2", clientId: "cl-s2", title: "SWASTI at Sherpur Community Clinic", budget: 950_000, start: addDays(today, -28), due: addDays(today, 10), managerId: "p-jamil", teamId: "tm-swasti", status: "running", channelId: "ch-s-pj2", handedOver: { at: at(-25 * D), by: "p-jamil", to: ["p-jamil", "p-ishtiak"] }, sample: true },
    { id: "pj-s3", clientId: "cl-s1", title: "SWASTI pilot at Nakla", budget: 1_850_000, start: addDays(today, -60), due: addDays(today, -5), managerId: "p-jamil", teamId: "tm-swasti", status: "delivered", sample: true },
  ];

  const doc = (id: string, kind: Doc["kind"], number: string, clientId: string, daysAgo: number, lines: Doc["lines"], status: Doc["status"], projectId?: string): Doc => ({ id, kind, number, clientId, projectId, date: addDays(today, -daysAgo), lines, vatPct: kind === "challan" ? 0 : 15, status, by: "p-jamil", at: at(-daysAgo * D), sample: true });
  const docs: Doc[] = [
    doc("dc-s1", "invoice", "INV-2026-0001", "cl-s1", 40, [{ item: "SWASTI licence — 12 months", qty: 1, rate: 900_000 }, { item: "Triage kiosk hardware", qty: 2, rate: 225_000 }], "paid", "pj-s3"),
    doc("dc-s2", "invoice", "INV-2026-0002", "cl-s1", 8, [{ item: "Staff training (6 nurses)", qty: 6, rate: 12_000 }, { item: "Final milestone", qty: 1, rate: 400_000 }], "sent", "pj-s3"),
    doc("dc-s3", "quotation", "QT-2026-0003", "cl-s3", 6, [{ item: "SWASTI licence — 12 months", qty: 1, rate: 850_000 }, { item: "On-site set-up", qty: 1, rate: 150_000 }], "sent"),
    doc("dc-s4", "quotation", "QT-2026-0004", "cl-s5", 3, [{ item: "Smart pharmacy set-up", qty: 1, rate: 1_100_000 }, { item: "SWASTI kiosk", qty: 1, rate: 350_000 }, { item: "Aponjon bands", qty: 40, rate: 9_500 }], "draft", "pj-s1"),
    doc("dc-s5", "challan", "CH-2026-0001", "cl-s2", 20, [{ item: "Triage kiosk", qty: 1, rate: 225_000 }], "sent", "pj-s2"),
    doc("dc-s6", "mushok-6.3", "MU-2026-0001", "cl-s1", 40, [{ item: "SWASTI licence — 12 months", qty: 1, rate: 900_000 }], "sent", "pj-s3"),
  ];

  // Six months of money: salaries, parts, cloud, rent, travel, marketing; income from milestones.
  const txns: Txn[] = [];
  let n = 0;
  const tx = (daysAgo: number, kind: Txn["kind"], category: string, amount: number, note: string, x: Partial<Txn> = {}) => txns.push({ id: `tx-s${++n}`, day: addDays(today, -daysAgo), kind, category, amount, note, method: "bank", by: "p-jamil", at: at(-daysAgo * D), sample: true, ...x });
  for (let mo = 0; mo < 6; mo++) {
    const base = mo * 30;
    tx(base + 2, "expense", "Salaries", 640_000 + mo * -12_000, "Monthly salaries");
    tx(base + 3, "expense", "Rent & utilities", 85_000, "HQ rent, power, internet");
    tx(base + 6, "expense", "Cloud & software", mo === 1 ? 79_000 : 38_000 + mo * 1_500, mo === 1 ? "Cloud bill (GPU left running)" : "Cloud and tools");
    tx(base + 9, "expense", "Components & PCB", 60_000 + ((mo * 37_000) % 90_000), "Sensors, PCBs, enclosures");
    tx(base + 14, "expense", "Travel & field", 18_000 + mo * 2_000, "Field trips to Sherpur", { method: "cash" });
    tx(base + 18, "expense", "Marketing", 22_000 + ((mo * 9_000) % 30_000), "Health camp and social media", { method: "bkash" });
  }
  tx(5, "income", "Client milestone", 450_000, "Nakla final milestone (part)", { clientId: "cl-s1" });
  tx(38, "income", "Client milestone", 1_035_000, "Nakla licence and kiosks", { clientId: "cl-s1" });
  tx(22, "income", "Client milestone", 300_000, "Sherpur advance", { clientId: "cl-s2" });
  tx(70, "income", "Client milestone", 500_000, "Jamalpur delivery", { clientId: "cl-s7" });
  tx(95, "income", "Client milestone", 280_000, "Jamalpur advance", { clientId: "cl-s7" });
  tx(120, "income", "Grant", 1_500_000, "ICT Division innovation grant");
  tx(150, "income", "Investment", 3_000_000, "Angel round — first tranche");
  tx(12, "income", "Device sales", 142_500, "Aponjon bands — 15 units", { method: "bkash" });

  return { clients, projects, docs, txns, channels, messages, seq: { INV: 2, QT: 4, CH: 1, MU: 1 } };
}
