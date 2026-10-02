import type { ClassMsg } from "../../lib/media/class-chat.ts";
import { chatPin, type Pin } from "../../lib/media/class-pins.ts";
import type { Role } from "../../lib/media/notices.ts";

/**
 * The sample rooms' class chats, dated round DEMO_NOW (Friday 2026-09-25).
 * Member and teacher ids match data/media/classroom.ts and labs.ts.
 */

const say = (id: string, by: string, byName: string, byRole: Role, at: string, text: string, ask?: true): ClassMsg => ({ id, by, byName, byRole, at, text, ...(ask && { ask }) });

export const sampleChats: Record<string, ClassMsg[]> = {
  "c-ssc27": [
    say("ch-s1", "t-rafiq", "রফিকুল ইসলাম স্যার", "teacher", "2026-09-24T03:10:00Z", "আজ দ্বিঘাত সমীকরণের সূত্র দিয়ে মূল বের করা শেষ করব। অনুশীলনী ৪.২-এর ১ থেকে ৮ বাড়িতে করে আনবে।"),
    say("ch-s2", "s-mim", "মীম খাতুন", "member", "2026-09-24T09:40:00Z", "স্যার, ৫ নম্বরে নিশ্চায়ক ঋণাত্মক আসছে। তাহলে কি বাস্তব মূল নেই?", true),
    say("ch-s3", "t-rafiq", "রফিকুল ইসলাম স্যার", "teacher", "2026-09-24T10:05:00Z", "ঠিক ধরেছ মীম। b² − 4ac শূন্যের কম হলে বাস্তব মূল থাকে না — খাতায় সেটাই লিখে দাও।"),
    say("ch-s4", "s-tania", "তানিয়া আক্তার", "leader", "2026-09-24T12:30:00Z", "কাল ল্যাব খাতা জমা। যারা প্রিন্ট পারবে না, আমাকে আজ রাতের মধ্যে জানাও।"),
    say("ch-s5", "s-sohel", "সোহেল মিয়া", "member", "2026-09-25T02:15:00Z", "ত্রিকোণমিতির শুরুটা একদম বুঝছি না। কেউ কি টিফিনে একটু দেখাবে?", true),
    say("ch-s6", "s-rahat", "রাহাত হাসান", "member", "2026-09-25T02:40:00Z", "সোহেল, আমি দেখাব। টিফিনে লাইব্রেরিতে চলে আসিস।"),
  ],
  "c-cse22": [
    say("ch-c1", "t-mahmuda", "ড. মাহমুদা আক্তার", "teacher", "2026-09-24T04:00:00Z", "AVL ট্রির রোটেশন নিয়ে স্লাইড আপলোড করেছি। রবিবার কুইজ — ইনসার্ট আর ডিলিট দুটোই আসবে।"),
    say("ch-c2", "u-tanvir", "তানভীর আলম", "member", "2026-09-24T14:20:00Z", "ম্যাডাম, LR রোটেশনের পর ব্যালান্স ফ্যাক্টর কীভাবে আপডেট করব, একটু বুঝিয়ে দেবেন?", true),
    say("ch-c3", "u-ritu", "ঋতু সাহা", "member", "2026-09-24T15:05:00Z", "নোট বোর্ডে আমার হাতে আঁকা উদাহরণটা দেখো তানভীর, ধাপে ধাপে আছে।"),
    say("ch-c4", "u-nafis", "নাফিস ইকবাল", "leader", "2026-09-25T03:30:00Z", "কুইজের আগে শনিবার সন্ধ্যায় অনলাইনে একসাথে প্র্যাকটিস — যারা আসবে, হাত তোলো।"),
  ],
  "c-bcs": [
    say("ch-b1", "t-shahana", "শাহানা পারভীন (মেন্টর)", "teacher", "2026-09-24T13:00:00Z", "আজ মুক্তিযুদ্ধের সেক্টর আর সেক্টর কমান্ডার। মডেল টেস্টে প্রতিবার ২–৩টা প্রশ্ন আসে।"),
    say("ch-b2", "j-milon", "মিলন মিয়া", "member", "2026-09-24T16:45:00Z", "আপা, সেক্টরগুলো মনে রাখার কোনো সহজ কৌশল আছে?", true),
    say("ch-b3", "j-nusrat", "নুসরাত জাহান", "member", "2026-09-25T01:20:00Z", "আমি মানচিত্রে দাগ দিয়ে মুখস্থ করেছি — ছবিটা নোট বোর্ডে দিলাম।"),
  ],
  "lab-eee102": [
    say("ch-l1", "t-sabrina", "সাবরিনা ইয়াসমিন ম্যাডাম", "teacher", "2026-09-24T05:30:00Z", "মঙ্গলবারের এক্সপেরিমেন্ট: RC সার্কিটের চার্জিং কার্ভ। অসিলোস্কোপ চালানো আগে ভিডিও দেখে আসবে।"),
    say("ch-l2", "l-imran", "ইমরান খান", "member", "2026-09-24T11:10:00Z", "ম্যাডাম, টাইম কনস্ট্যান্ট মাপার সময় ৬৩% কেন ধরি?", true),
    say("ch-l3", "t-sabrina", "সাবরিনা ইয়াসমিন ম্যাডাম", "teacher", "2026-09-24T12:00:00Z", "কারণ এক τ সময়ে ভোল্টেজ চূড়ান্ত মানের (1 − 1/e) ভাগ, প্রায় ৬৩% পৌঁছায়। রিপোর্টে সূত্রটা দেখিয়ে দিও।"),
    say("ch-l4", "l-nafis", "নাফিস ইকবাল", "leader", "2026-09-25T04:00:00Z", "রিপোর্ট ২ প্রিন্টের দায়িত্ব এ সপ্তাহে ঋতু আর তামিমের — দায়িত্বের পালায় দেখে নাও।"),
  ],
};

/**
 * What the teachers and leaders of the sample rooms have pinned in their
 * Discussion Rooms. A pinned chat is copied from the thread above, so the
 * two cannot drift apart.
 */
const msg = (room: string, id: string): ClassMsg => sampleChats[room].find((m) => m.id === id)!;
const teacher = (id: string, name: string) => ({ id, name, role: "teacher" as const });
const pinned = (id: string, kind: Pin["kind"], by: Pin["by"], byName: string, byRole: Pin["byRole"], at: string, rest: Pick<Pin, "title" | "color"> & Partial<Pin>): Pin => ({ id, kind, by, byName, byRole, at, ...rest });

export const samplePins: Record<string, Pin[]> = {
  "c-ssc27": [
    chatPin(msg("c-ssc27", "ch-s3"), teacher("t-rafiq", "রফিকুল ইসলাম স্যার"), "pn-s1", "2026-09-24T10:10:00Z"),
    pinned("pn-s2", "task", "t-rafiq", "রফিকুল ইসলাম স্যার", "teacher", "2026-09-24T03:12:00Z", { title: "অনুশীলনী ৪.২ — ১ থেকে ৮ নম্বর", due: "2026-09-26", color: "mint" }),
    pinned("pn-s3", "data", "t-rafiq", "রফিকুল ইসলাম স্যার", "teacher", "2026-09-24T03:14:00Z", { title: "দ্বিঘাত সমীকরণের সূত্র", body: "x = (−b ± √(b² − 4ac)) / 2a", color: "white" }),
    pinned("pn-s4", "text", "s-tania", "তানিয়া আক্তার", "leader", "2026-09-24T12:35:00Z", { title: "কাল ল্যাব খাতা জমা — প্রিন্ট করতে না পারলে আমাকে আজ রাতের মধ্যে জানাও।", color: "gold" }),
  ],
  "c-cse22": [
    chatPin(msg("c-cse22", "ch-c1"), teacher("t-mahmuda", "ড. মাহমুদা আক্তার"), "pn-c1", "2026-09-24T04:05:00Z"),
    pinned("pn-c2", "task", "u-nafis", "নাফিস ইকবাল", "leader", "2026-09-25T03:35:00Z", { title: "কুইজের আগে AVL ইনসার্ট আর ডিলিট প্র্যাকটিস", due: "2026-09-26", color: "mint" }),
  ],
  "c-bcs": [chatPin(msg("c-bcs", "ch-b1"), teacher("t-shahana", "শাহানা পারভীন (মেন্টর)"), "pn-b1", "2026-09-24T13:05:00Z")],
  "lab-eee102": [
    pinned("pn-l1", "text", "t-sabrina", "সাবরিনা ইয়াসমিন ম্যাডাম", "teacher", "2026-09-22T05:05:00Z", { title: "ল্যাব কোট ও জুতা ছাড়া ঢোকা যাবে না।", color: "gold" }),
    pinned("pn-l2", "data", "t-sabrina", "সাবরিনা ইয়াসমিন ম্যাডাম", "teacher", "2026-09-24T12:05:00Z", { title: "RC টাইম কনস্ট্যান্ট", body: "τ = R × C = 4.7 kΩ × 1 µF = 4.7 ms", color: "white" }),
    pinned("pn-l3", "task", "l-nafis", "নাফিস ইকবাল", "leader", "2026-09-25T04:10:00Z", { title: "রিপোর্ট ৩ — ডেটা টেবিল আর গ্রাফসহ জমা", due: "2026-09-27", color: "mint" }),
  ],
};
