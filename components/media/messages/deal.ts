"use client";

import type { Message, PayMethod, Thread } from "@/data/media/types";
import {
  acceptCounter,
  buyerOffer,
  confirmAgreement,
  negotiationStatus,
  sellerReply,
  startNegotiation,
  type Negotiation,
  type NegotiationError,
} from "@/lib/media/negotiation";
import { newId, updateMedia, type MyThread } from "@/lib/media/store";
import { escrowTxn, releaseEscrow } from "../wallet/pay";

/** A conversation as the messages view needs it, seeded or created here. */
export interface DealThread {
  id: string;
  with: string;
  kind: "hire" | "offer";
  subject: string;
  listingId?: string;
  ask: number;
  floor: number;
  brief?: string;
  deadline?: string;
  unread: number;
  messages: Message[];
  seedNegotiation: Negotiation;
}

export function fromSeed(t: Thread): DealThread {
  const n = startNegotiation(t.ask, t.floor);
  const agreed = t.rounds.findLast((r) => r.kind === "accept")?.amount;
  const booked = t.rounds.at(-1)?.kind === "confirm";
  return {
    ...t,
    seedNegotiation: { ...n, rounds: t.rounds, agreed, booked: booked || undefined },
  };
}

export function fromMine(t: MyThread): DealThread {
  return { ...t, unread: 0, messages: [], seedNegotiation: startNegotiation(t.ask, t.floor) };
}

export const errorBn: Record<NegotiationError, string> = {
  invalid: "টাকার অঙ্ক লিখুন।",
  "at-or-above-ask": "এটা চাওয়া দামের সমান বা বেশি — সরাসরি রাজি হতে পারেন।",
  "awaiting-seller": "আগের প্রস্তাবের উত্তরের অপেক্ষা করুন।",
  limit: "তিনটি প্রস্তাব শেষ।",
  closed: "দরদাম শেষ — চুক্তি হয়ে গেছে।",
  "no-counter": "গ্রহণ করার মতো পাল্টা প্রস্তাব নেই।",
  "not-agreed": "আগে দামে একমত হতে হবে।",
};

function save(id: string, n: Negotiation, note?: { from: string; text: string }) {
  const at = new Date().toISOString();
  updateMedia((s) => ({
    ...s,
    negotiations: { ...s.negotiations, [id]: n },
    messages: note ? { ...s.messages, [id]: [...(s.messages[id] ?? []), { id: newId("m"), from: note.from, at, text: note.text }] } : s.messages,
  }));
}

export function offer(id: string, n: Negotiation, amount: number): NegotiationError | null {
  const r = buyerOffer(n, amount, new Date().toISOString());
  if (!r.ok) return r.error;
  save(id, r.value);
  return null;
}

/** The seller's automatic answer, with a line of chat to go with it. */
export function reply(id: string, n: Negotiation, seller: string) {
  const next = sellerReply(n, new Date().toISOString());
  const status = negotiationStatus(next);
  const text =
    status === "agreed"
      ? "ঠিক আছে, এই দামে রাজি। চুক্তি নিশ্চিত করলেই কাজ শুরু করব।"
      : status === "countered"
        ? "এর চেয়ে কমে করলে মান ঠিক রাখা কঠিন। এই দামে করতে পারি।"
        : "দুঃখিত, এই দামে সম্ভব নয়। আরেকটু বাড়িয়ে দেখুন।";
  save(id, next, { from: seller, text });
}

export function accept(id: string, n: Negotiation): NegotiationError | null {
  const r = acceptCounter(n, new Date().toISOString());
  if (!r.ok) return r.error;
  save(id, r.value);
  return null;
}

/** After three declined offers the buyer can still take the asking price. */
export function acceptAsk(id: string, n: Negotiation) {
  save(id, { ...n, agreed: n.ask, rounds: [...n.rounds, { by: "buyer", kind: "accept", amount: n.ask, at: new Date().toISOString() }] });
}

/** Book the agreement: the buyer's payment (with the 5% charge) goes into escrow. */
export function book(t: DealThread, n: Negotiation, sellerName: string, method: PayMethod): NegotiationError | null {
  const at = new Date().toISOString();
  const r = confirmAgreement(n, at);
  if (!r.ok) return r.error;
  const txn = escrowTxn({ id: `esc-${t.id}`, at, label: `এসক্রোতে জমা — ${t.subject}, ${sellerName}`, price: r.value.agreed ?? 0, method });
  updateMedia((s) => ({
    ...s,
    negotiations: { ...s.negotiations, [t.id]: r.value },
    txns: [txn, ...s.txns.filter((x) => x.id !== txn.id)],
  }));
  return null;
}

/** Work received: release escrow to the seller. */
export function release(t: DealThread) {
  releaseEscrow({ id: `esc-${t.id}`, deal: t.id });
}
