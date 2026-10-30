import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { Approval, Case, ContentItem, HqDb, Order } from "../../lib/hq/types.ts";

/** Sample Shongbidhan cases, site content, orders and requests, relative to now. */
export function seedControl(ctx: SeedCtx): Partial<HqDb> {
  const H = 3600_000;
  const D = 24 * H;
  const at = (ms: number) => new Date(ctx.now + ms).toISOString();

  const cases: Case[] = [
    { id: "cs-s1", articleId: "art-ka-3-104", accusedId: "p-nabeel", byId: "p-mehek", at: at(-3 * D), evidence: "Missed Tuesday's team lunch without telling anyone; four of us waited 25 minutes at the restaurant.", fileIds: [], showCause: { text: "Guilty — a client call ran over and my phone died. Lunch is on me.", at: at(-2.8 * D) }, verdict: { guilty: true, by: ctx.prime, at: at(-2.5 * D), note: "Honest answer. Treat the team to lunch this week." }, status: "decided" },
    { id: "cs-s2", articleId: "art-gha-1-401", accusedId: "p-nabeel", byId: "p-jamil", at: at(-2 * D), evidence: "Posted @urgent in #urgent asking who has the office printer key.", fileIds: [], showCause: { text: "The printer was blocking a client contract print! It felt urgent.", at: at(-1.9 * D) }, verdict: { guilty: true, by: ctx.prime, at: at(-1.5 * D), note: "A friendly warning: use #general for printers." }, status: "decided" },
    { id: "cs-s3", articleId: "art-kha-3-203", accusedId: "p-shabbin", byId: "p-jamil", at: at(-6 * D), evidence: "No daily report on three working days in a row last week.", fileIds: [], showCause: { text: "I was on approved leave for two of those days — the leave was in the calendar.", at: at(-5.8 * D) }, verdict: { guilty: true, by: "p-jamil", at: at(-5 * D), note: "Write the weekly summary." }, appeal: { text: "Two of the three days were approved leave.", at: at(-4.5 * D), outcome: "overturned", by: ctx.prime }, status: "closed" },
    { id: "cs-s4", articleId: "art-uma-2-502", accusedId: "p-luban", byId: "p-sharul", at: at(-10 * H), evidence: "Left the soldering station on overnight with the fume extractor running.", fileIds: [], status: "filed" },
  ];

  const item = (id: string, kind: ContentItem["kind"], title: string, status: ContentItem["status"], x: Partial<ContentItem> = {}, order = 0): ContentItem => ({ id, kind, title, body: "", status, order, by: "p-nabeel", at: at(-order * D - 2 * D), sample: true, ...x });
  const content: ContentItem[] = [
    item("ct-s1", "ad", "SWASTI — care in two hours, in Bangla", "live", { body: "Voice triage for every upazila.", slot: "home/hero" }),
    item("ct-s2", "ad", "Aponjon band — pre-order", "pending", { body: "Your family's vitals, every minute.", slot: "products" }, 1),
    item("ct-s3", "banner", "Village health camp — Kazaikat", "draft", { body: "Free check-ups with SWASTI and Aponjon.", slot: "home/announcement" }),
    item("ct-s4", "image", "Nakla pilot — nurses with the kiosk", "live", { slot: "about/story" }),
    item("ct-s5", "card", "Golden Two Hours", "live", { body: "The window where primary care changes survival odds.", slot: "home/hook" }),
    item("ct-s6", "section", "One Village, One Medical Health Care Center", "live", { body: "Smart pharmacy + digital care per village.", slot: "impact" }),
    item("ct-s7", "video", "SWASTI demo (2 min)", "live", { body: "Add the demo video link when it is published.", slot: "products/swasti" }),
    item("ct-s8", "product", "SWASTI clinic licence (12 months)", "live", { price: 900_000, slot: "products/swasti", body: "Voice triage, RAG medical agent and reports." }),
    item("ct-s9", "product", "Aponjon band", "live", { price: 9_500, slot: "products/aponjon", body: "ECG, SpO2, temperature and stress scoring." }, 1),
    item("ct-s10", "product", "Smart Pharmacy kit", "draft", { price: 1_100_000, slot: "products" }, 2),
    item("ct-s11", "service", "On-site clinic set-up", "live", { price: 150_000, body: "Installation, training and go-live support." }),
    item("ct-s12", "service", "Village centre operations", "pending", { price: 60_000, body: "Monthly operations for a One Village centre." }, 1),
    item("ct-s13", "category", "Healthcare", "live"),
    item("ct-s14", "category", "IoT devices", "live", {}, 1),
    item("ct-s15", "email", "Welcome to Kandari Profile", "live", { body: "Thank you for joining Kandari Lab. You'll hear first about new research and releases." }),
  ];

  const orders: Order[] = [
    { id: "or-s1", itemId: "ct-s9", customer: "Shamima Begum", phone: "01711000001", qty: 2, amount: 19_000, status: "new", at: at(-5 * H), sample: true },
    { id: "or-s2", itemId: "ct-s9", customer: "Abdul Malek", phone: "01811000002", qty: 1, amount: 9_500, status: "accepted", at: at(-1 * D), sample: true },
    { id: "or-s3", itemId: "ct-s11", customer: "Sherpur Community Clinic", phone: "01911000003", qty: 1, amount: 150_000, status: "delivered", at: at(-20 * D), sample: true },
    { id: "or-s4", itemId: "ct-s9", customer: "Test order", phone: "01511000004", qty: 1, amount: 9_500, status: "rejected", at: at(-3 * D), sample: true },
  ];

  const approvals: Approval[] = [
    { id: "ap-s-rs1", kind: "research", title: "Research: blind-assistance wearable (2 m sensing)", detail: "A head-worn ultrasonic + camera module with AI scene description in Bangla. Ask: ৳3 lakh for a 10-week prototype.", refId: "rs-s1", by: "p-safia", at: at(-2 * D), perm: "content.manage", status: "pending" },
    { id: "ap-s-rs2", kind: "research", title: "Research: organic-waste-to-soil classifier", detail: "Camera-based sorting of kitchen waste for the village compost unit.", refId: "rs-s2", by: "p-janassor", at: at(-5 * D), perm: "content.manage", status: "accepted", decidedBy: ctx.prime, decidedAt: at(-4 * D) },
    { id: "ap-s-sv1", kind: "service", title: "Service request: Bogura Diagnostic Centre", detail: "Wants SWASTI for 3 branches; asked for a demo next week.", refId: "sv-s1", by: "p-jamil", at: at(-8 * H), perm: "content.manage", status: "pending" },
    { id: "ap-s-ct1", kind: "content", title: "Publish ad: Aponjon band — pre-order", refId: "ct-s2", by: "p-nabeel", at: at(-1 * D), perm: "content.manage", status: "pending" },
  ];

  return { cases, content, orders, approvals };
}
