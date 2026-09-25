import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acceptCounter,
  buyerOffer,
  buyerOfferCount,
  confirmAgreement,
  negotiationStatus,
  sellerReply,
  startNegotiation,
  type Negotiation,
} from "./negotiation.ts";

const T = "2026-09-25T10:00:00Z";

function ok(r: ReturnType<typeof buyerOffer>): Negotiation {
  assert.equal(r.ok, true, r.ok ? "" : r.error);
  return (r as { ok: true; value: Negotiation }).value;
}

test("a fresh negotiation is open", () => {
  const n = startNegotiation(1000, 800);
  assert.equal(negotiationStatus(n), "open");
  assert.equal(buyerOfferCount(n), 0);
});

test("offer → seller counters midway → buyer accepts → agreed → booked", () => {
  let n = startNegotiation(1000, 800);
  n = ok(buyerOffer(n, 900, T));
  assert.equal(negotiationStatus(n), "awaiting-seller");
  n = sellerReply(n, T);
  assert.equal(negotiationStatus(n), "countered");
  assert.equal(n.rounds.at(-1)?.amount, 950);
  n = ok(acceptCounter(n, T));
  assert.equal(negotiationStatus(n), "agreed");
  assert.equal(n.agreed, 950);
  n = ok(confirmAgreement(n, T));
  assert.equal(negotiationStatus(n), "booked");
});

test("seller accepts an offer near the ask", () => {
  let n = ok(buyerOffer(startNegotiation(1000, 800), 950, T));
  n = sellerReply(n, T);
  assert.equal(negotiationStatus(n), "agreed");
  assert.equal(n.agreed, 950);
});

test("a lowball is declined, and the buyer may try again", () => {
  let n = ok(buyerOffer(startNegotiation(1000, 800), 500, T));
  n = sellerReply(n, T);
  assert.equal(negotiationStatus(n), "declined");
  assert.equal(buyerOffer(n, 850, T).ok, true);
});

test("guards", () => {
  const n = startNegotiation(1000, 800);
  const r1 = buyerOffer(n, 1000, T);
  assert.equal(r1.ok ? "" : r1.error, "at-or-above-ask");
  const r2 = buyerOffer(n, 0, T);
  assert.equal(r2.ok ? "" : r2.error, "invalid");
  const waiting = ok(buyerOffer(n, 900, T));
  const r3 = buyerOffer(waiting, 910, T);
  assert.equal(r3.ok ? "" : r3.error, "awaiting-seller");
  const r4 = acceptCounter(n, T);
  assert.equal(r4.ok ? "" : r4.error, "no-counter");
  const r5 = confirmAgreement(n, T);
  assert.equal(r5.ok ? "" : r5.error, "not-agreed");
});

test("three offers is the limit", () => {
  let n = startNegotiation(1000, 900);
  for (let i = 0; i < 3; i++) {
    n = ok(buyerOffer(n, 600 + i * 10, T)); // all below 75% of floor → declined
    n = sellerReply(n, T);
  }
  assert.equal(buyerOfferCount(n), 3);
  assert.equal(negotiationStatus(n), "exhausted");
  const r = buyerOffer(n, 880, T);
  assert.equal(r.ok ? "" : r.error, "limit");
});

test("a counter after the third offer can still be accepted", () => {
  let n = startNegotiation(1000, 800);
  n = sellerReply(ok(buyerOffer(n, 500, T)), T);
  n = sellerReply(ok(buyerOffer(n, 550, T)), T);
  n = sellerReply(ok(buyerOffer(n, 850, T)), T);
  assert.equal(negotiationStatus(n), "countered");
  assert.equal(acceptCounter(n, T).ok, true);
});
