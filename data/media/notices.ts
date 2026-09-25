import type { Notice } from "./types";

/** The viewer's notifications, newest first. */
export const notices: Notice[] = [
  { id: "n1", kind: "rating", text: "জয় চক্রবর্তী আপনার ‘আইওটি হার্ডওয়্যার’ দক্ষতা ৫★ দিয়ে যাচাই করেছেন।", href: "/media/u/mahir", at: "2026-09-25T11:30:00Z" },
  { id: "n2", kind: "hire", text: "তানভীর রহমান আপনার প্রস্তাবে পাল্টা দাম দিয়েছেন: ৳১৯,৫০০।", href: "/media/messages?t=t-tanvir", at: "2026-09-25T10:10:00Z" },
  { id: "n3", kind: "civic", text: "আপনার এলাকা মোহাম্মদপুরে একটি চাঁদাবাজির রিপোর্ট ১২ জন নিশ্চিত করেছেন।", href: "/media/civic?r=cv-mohammadpur-extortion", at: "2026-09-25T09:00:00Z" },
  { id: "n4", kind: "event", text: "‘নকলায় ১০০ গাছ’ উদ্যোগে ৫ জন নতুন যোগ দিয়েছেন — এখন ৩৮ জন।", href: "/media/events", at: "2026-09-25T07:40:00Z" },
  { id: "n5", kind: "job", text: "আপনার দক্ষতার সাথে মেলে: ‘জুনিয়র ফ্রন্টএন্ড ডেভেলপার’ — ৳২৮,০০০–৪০,০০০।", href: "/media/jobs", at: "2026-09-24T09:05:00Z" },
  { id: "n6", kind: "team", text: "অনিক হাসান আপনাকে ‘লোকাল বাস কোথায়’ টিমে আমন্ত্রণ জানিয়েছেন।", href: "/media/teams", at: "2026-09-24T08:00:00Z" },
  { id: "n7", kind: "sale", text: "আইওটি সেন্সর কিট বিক্রি হয়েছে — ওয়ালেটে এসেছে ৳১১,৪০০।", href: "/media/wallet", at: "2026-09-24T16:30:00Z" },
  { id: "n8", kind: "system", text: "আপনার ‘আইওটি হার্ডওয়্যার’ দক্ষতা কমিউনিটি যাচাইকৃত — সার্টিফিকেট তৈরি হয়েছে।", href: "/media/dashboard#certificates", at: "2026-09-22T12:00:00Z" },
];
