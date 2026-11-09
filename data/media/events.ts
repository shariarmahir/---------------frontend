import type { CommunityEvent, EventKind } from "./types";

export const eventKindBn: Record<EventKind, string> = {
  tree: "গাছ লাগানো",
  cleanup: "পরিচ্ছন্নতা",
  blood: "রক্তদান",
  relief: "ত্রাণ",
  awareness: "সচেতনতা",
  repair: "মেরামত",
};

/**
 * Social-work events. Anyone leads, anyone joins; companies sponsor with
 * money or goods (logo t-shirts, gloves, saplings) in return for thanks.
 */
export const events: CommunityEvent[] = [
  {
    id: "e-trees-nakla",
    kind: "tree",
    title: "নকলায় ১০০ গাছ — স্কুলমাঠ আর রাস্তার ধারে",
    organizer: "mahir",
    area: "নকলা",
    district: "শেরপুর",
    date: "2026-10-04T08:00:00+06:00",
    description: "কাজাইকাটা স্কুলের মাঠ আর বাজারের রাস্তার দুই পাশে ফলজ ও বনজ মিলিয়ে ১০০টি চারা। প্রতিটি চারার দায়িত্ব নেবে একজন স্কুলছাত্র — এক বছর পানি দেবে, ছবি পোস্ট করবে।",
    goal: 60,
    joined: 38,
    needs: ["১০০টি চারা", "কোদাল ২০টি", "খুঁটি ও দড়ি"],
    sponsors: [{ name: "সবুজ নার্সারি", offer: "৫০টি চারা", initials: "সন" }],
    cover: "/media/event-tree.webp",
  },
  {
    id: "e-clean-lake",
    kind: "cleanup",
    title: "ধানমন্ডি লেক পরিষ্কার — শুক্রবার সকাল",
    organizer: "babul",
    area: "ধানমন্ডি",
    district: "ঢাকা",
    date: "2026-10-02T07:00:00+06:00",
    description: "লেকের পাড়ের প্লাস্টিক আর চিপসের প্যাকেট তুলব, দোকানিদের জন্য ময়লার ঝুড়ি বসাব। দুই ঘণ্টা, তারপর সবাই মিলে ফুচকা।",
    goal: 80,
    joined: 64,
    needs: ["গ্লাভস ১০০ জোড়া", "বড় ব্যাগ ২০০টি", "১০টি ঝুড়ি"],
    sponsors: [
      { name: "নির্মল হ্যান্ডওয়াশ", offer: "লোগোসহ ১০০টি টি-শার্ট", initials: "নি" },
      { name: "গ্রিন প্যাক", offer: "২০০টি বায়োডিগ্রেডেবল ব্যাগ", initials: "গ্রি" },
    ],
    cover: "/media/event-cleanup.webp",
  },
  {
    id: "e-blood-rajshahi",
    kind: "blood",
    title: "রাজশাহী কলেজে রক্তদান ক্যাম্প",
    organizer: "sabbir",
    area: "শাহ মখদুম",
    district: "রাজশাহী",
    date: "2026-10-09T10:00:00+06:00",
    description: "সরকারি হাসপাতালের ব্লাড ব্যাংকের সাথে। রক্তের গ্রুপ পরীক্ষা বিনামূল্যে, দাতাদের জন্য নাশতা। ১৮–৬০ বছর, ওজন ৫০ কেজির বেশি।",
    goal: 150,
    joined: 92,
    needs: ["স্বেচ্ছাসেবক ১০ জন", "নাশতা ১৫০ প্যাকেট"],
    sponsors: [],
    cover: "/media/event-blood.webp",
  },
  {
    id: "e-relief-sunamganj",
    kind: "relief",
    title: "সুনামগঞ্জে বন্যার পর শুকনো খাবার",
    organizer: "mitu",
    area: "তাহিরপুর",
    district: "সুনামগঞ্জ",
    date: "2026-10-06T09:00:00+06:00",
    description: "৩০০ পরিবারের জন্য চাল, ডাল, চিড়া, স্যালাইন আর পানি বিশুদ্ধকরণ ট্যাবলেট। প্রতিটি প্যাকেটের হিসাব এখানেই পোস্ট করা হবে।",
    goal: 40,
    joined: 21,
    needs: ["৩০০ প্যাকেট শুকনো খাবার", "নৌকা ভাড়া"],
    sponsors: [{ name: "দেশি ফুডস", offer: "৳৩০,০০০", initials: "দে" }],
    cover: "/media/event-relief.webp",
  },
];

export function getEvent(id: string): CommunityEvent | undefined {
  return events.find((e) => e.id === id);
}
