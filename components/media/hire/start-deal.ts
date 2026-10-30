"use client";

import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { buyerOffer, startNegotiation } from "@/lib/media/negotiation";
import { newId, updateMedia, type MyThread } from "@/lib/media/store";

/**
 * Open a negotiation thread from Hire (a brief + budget) or Make offer (a
 * listing + an amount). The first buyer offer is recorded; the seller's
 * reply arrives when the thread is open (see messages view).
 *
 * An amount at or above the ask needs no bargaining: it is agreed at once.
 */
export function startDeal(input: {
  with: string;
  kind: MyThread["kind"];
  subject: string;
  ask: number;
  floor: number;
  amount: number;
  listingId?: string;
  brief?: string;
  deadline?: string;
  firstMessage: string;
}): string {
  const id = newId("t");
  const at = new Date().toISOString();
  let n = startNegotiation(input.ask, input.floor);
  if (input.amount >= input.ask) {
    n = { ...n, agreed: input.ask, rounds: [{ by: "buyer", kind: "accept", amount: input.ask, at }] };
  } else {
    const r = buyerOffer(n, input.amount, at);
    if (r.ok) n = r.value;
  }
  const thread: MyThread = {
    id,
    with: input.with,
    kind: input.kind,
    subject: input.subject,
    listingId: input.listingId,
    ask: input.ask,
    floor: input.floor,
    brief: input.brief,
    deadline: input.deadline,
    at,
  };
  updateMedia((s) => ({
    ...s,
    threads: [thread, ...s.threads],
    negotiations: { ...s.negotiations, [id]: n },
    messages: { ...s.messages, [id]: [{ id: newId("m"), from: CURRENT_USER_HANDLE, at, text: input.firstMessage }] },
  }));
  return id;
}
