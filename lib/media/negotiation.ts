/**
 * Price negotiation between a buyer and a seller — the engine behind
 * "Hire" and "Make offer". Pure and immutable: every step returns a new
 * Negotiation, so the UI can store it as-is.
 *
 *   open ──offer──▶ awaiting-seller ──reply──▶ countered | declined | agreed
 *   countered ──accept──▶ agreed ──confirm──▶ booked
 *   countered | declined ──offer──▶ awaiting-seller   (at most 3 buyer offers)
 */
import { MAX_BARGAIN_ROUNDS, sellerResponse } from "./market.ts";

export type Party = "buyer" | "seller";

export interface Round {
  by: Party;
  kind: "offer" | "counter" | "accept" | "decline" | "confirm";
  amount: number;
  at: string;
}

export interface Negotiation {
  ask: number;
  /** Seller's private minimum; counters never go below it. */
  floor: number;
  rounds: Round[];
  agreed?: number;
  booked?: boolean;
}

export type NegotiationStatus = "open" | "awaiting-seller" | "countered" | "declined" | "agreed" | "booked" | "exhausted";

export type NegotiationError = "invalid" | "at-or-above-ask" | "awaiting-seller" | "limit" | "closed" | "no-counter" | "not-agreed";

export type Result = { ok: true; value: Negotiation } | { ok: false; error: NegotiationError };

export function startNegotiation(ask: number, floor: number): Negotiation {
  return { ask, floor: Math.min(floor, ask), rounds: [] };
}

export function buyerOfferCount(n: Negotiation): number {
  return n.rounds.filter((r) => r.by === "buyer" && r.kind === "offer").length;
}

export function negotiationStatus(n: Negotiation): NegotiationStatus {
  if (n.booked) return "booked";
  if (n.agreed !== undefined) return "agreed";
  const last = n.rounds.at(-1);
  if (!last) return "open";
  if (last.by === "buyer" && last.kind === "offer") return "awaiting-seller";
  if (last.kind === "counter") return "countered";
  // Declined: the buyer may try again until the offer limit.
  return buyerOfferCount(n) >= MAX_BARGAIN_ROUNDS ? "exhausted" : "declined";
}

export function buyerOffer(n: Negotiation, amount: number, at: string): Result {
  const status = negotiationStatus(n);
  if (status === "agreed" || status === "booked") return { ok: false, error: "closed" };
  if (status === "awaiting-seller") return { ok: false, error: "awaiting-seller" };
  if (buyerOfferCount(n) >= MAX_BARGAIN_ROUNDS) return { ok: false, error: "limit" };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "invalid" };
  if (amount >= n.ask) return { ok: false, error: "at-or-above-ask" };
  return { ok: true, value: { ...n, rounds: [...n.rounds, { by: "buyer", kind: "offer", amount: Math.round(amount), at }] } };
}

/** The seller's automatic answer to the pending buyer offer. */
export function sellerReply(n: Negotiation, at: string): Negotiation {
  if (negotiationStatus(n) !== "awaiting-seller") return n;
  const offer = n.rounds[n.rounds.length - 1].amount;
  const r = sellerResponse(offer, n.ask, n.floor);
  if (r.kind === "accept") {
    return { ...n, agreed: r.amount, rounds: [...n.rounds, { by: "seller", kind: "accept", amount: r.amount, at }] };
  }
  if (r.kind === "decline") {
    return { ...n, rounds: [...n.rounds, { by: "seller", kind: "decline", amount: 0, at }] };
  }
  return { ...n, rounds: [...n.rounds, { by: "seller", kind: "counter", amount: r.amount, at }] };
}

export function acceptCounter(n: Negotiation, at: string): Result {
  if (negotiationStatus(n) !== "countered") return { ok: false, error: "no-counter" };
  const amount = n.rounds[n.rounds.length - 1].amount;
  return { ok: true, value: { ...n, agreed: amount, rounds: [...n.rounds, { by: "buyer", kind: "accept", amount, at }] } };
}

/** Book the agreed price: the buyer's payment moves into escrow. */
export function confirmAgreement(n: Negotiation, at: string): Result {
  if (negotiationStatus(n) !== "agreed" || n.agreed === undefined) return { ok: false, error: "not-agreed" };
  return { ok: true, value: { ...n, booked: true, rounds: [...n.rounds, { by: "buyer", kind: "confirm", amount: n.agreed, at }] } };
}
