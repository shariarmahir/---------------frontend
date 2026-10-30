import type { Thread } from "./types";

/**
 * Negotiation threads the viewer (Mahir, the buyer here) is part of.
 * `rounds` seed the negotiation engine in lib/media/negotiation.
 */
export const threads: Thread[] = [
  {
    id: "t-tanvir",
    with: "tanvir",
    kind: "offer",
    subject: "বন্যা-সহনশীল বাড়ির নকশা",
    listingId: "l-house",
    ask: 22000,
    floor: 18000,
    unread: 2,
    messages: [
      { id: "m1", from: "mahir", at: "2026-09-24T10:02:00Z", text: "আসসালামু আলাইকুম। নকলায় বাবার জমিতে বানাতে চাই। নকশাটা ১০০০ বর্গফুটে বাড়ানো যাবে?" },
      { id: "m2", from: "tanvir", at: "2026-09-24T10:20:00Z", text: "যাবে। প্লিন্থের উচ্চতা শেরপুরের বন্যার রেকর্ড দেখে ঠিক করব, খরচ বাড়বে না।" },
    ],
    rounds: [
      { by: "buyer", kind: "offer", amount: 17000, at: "2026-09-24T10:25:00Z" },
      { by: "seller", kind: "counter", amount: 19500, at: "2026-09-24T11:00:00Z" },
    ],
  },
  {
    id: "t-rahima",
    with: "rahima",
    kind: "hire",
    subject: "অফিসের ২০ জনের দুপুরের খাবার (৫ দিন)",
    ask: 28000,
    floor: 24000,
    unread: 0,
    messages: [
      { id: "m1", from: "mahir", at: "2026-09-23T06:40:00Z", text: "খালা, আগামী সপ্তাহে ল্যাবের ২০ জনের ৫ দিনের দুপুরের খাবার লাগবে। পারবেন?" },
      { id: "m2", from: "rahima", at: "2026-09-23T07:05:00Z", text: "পারব বাবা। প্রতিজন প্রতিবেলা ২৮০ টাকা ধরলে ৫ দিনে ২৮,০০০ হয়। মেনু পাঠাচ্ছি।" },
    ],
    rounds: [],
  },
  {
    id: "t-shapla",
    with: "shapla",
    kind: "offer",
    subject: "নকশিকাঁথা — ‘নদীর গল্প’",
    listingId: "l-kantha",
    ask: 9500,
    floor: 8500,
    unread: 1,
    messages: [
      { id: "m1", from: "mahir", at: "2026-09-22T12:00:00Z", text: "কাঁথাটা অসাধারণ। ঢাকায় কুরিয়ারে কতদিন লাগবে?" },
      { id: "m2", from: "shapla", at: "2026-09-22T12:45:00Z", text: "দুই দিন। ভালো করে মুড়ে পাঠাই, ভিজবে না।" },
    ],
    rounds: [],
  },
  {
    id: "t-anik",
    with: "anik",
    kind: "hire",
    subject: "সেন্সর ড্যাশবোর্ডের ওয়েব অ্যাপ",
    ask: 30000,
    floor: 26000,
    unread: 0,
    messages: [
      { id: "m1", from: "anik", at: "2026-09-25T05:10:00Z", text: "ভাই, ব্রিফটা পড়েছি। নেক্সট.জেএস দিয়ে ১২ দিনে করা যাবে, চার্টসহ।" },
    ],
    rounds: [
      { by: "buyer", kind: "offer", amount: 27000, at: "2026-09-25T05:30:00Z" },
      { by: "seller", kind: "accept", amount: 27000, at: "2026-09-25T05:40:00Z" },
      { by: "buyer", kind: "confirm", amount: 27000, at: "2026-09-25T05:45:00Z" },
    ],
  },
];

export function getThread(id: string): Thread | undefined {
  return threads.find((t) => t.id === id);
}
