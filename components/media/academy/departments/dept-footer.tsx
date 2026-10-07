import Link from "next/link";
import { Smartphone } from "lucide-react";
import { courses, departments } from "@/data/media/academy";
import { cn } from "@/lib/utils";

/** The thin strip over the bar: who the page is for. Learners are here; the rest lead to their own doors. */
export function AudienceStrip() {
  const items = [
    { href: "/media/academy/departments", label: "শিক্ষার্থীদের জন্য", on: true },
    { href: "/media/academy/teach", label: "শিক্ষকদের জন্য" },
    { href: "/media/academy/teach?dept=new", label: "দলের জন্য" },
    { href: "/media/academy/panel", label: "প্যানেলের জন্য" },
  ];
  return (
    <nav aria-label="কার জন্য" className="-mx-3 -mt-6 bg-text-primary px-3 sm:-mx-6 sm:px-6">
      <ul className="mx-auto flex h-10 max-w-7xl gap-1 overflow-x-auto scrollbar-none">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <Link
              href={it.href}
              aria-current={it.on ? "page" : undefined}
              className={cn("relative flex h-10 items-center px-3 text-sm transition-colors", it.on ? "font-bold text-white" : "text-white/75 hover:text-white")}
            >
              {it.label}
              {it.on && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-white" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const BY_ENROLMENT = [...courses].sort((a, b) => b.enrolled - a.enrolled);

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  { title: "দক্ষতা", links: BY_ENROLMENT.slice(0, 10).map((c) => ({ href: `/media/academy/course/${c.id}`, label: c.title.split(" — ")[0] })) },
  { title: "বিভাগ", links: departments.slice(0, 10).map((d) => ({ href: `/media/academy/dept/${d.id}`, label: d.name })) },
  { title: "কোর্স", links: BY_ENROLMENT.slice(10, 20).map((c) => ({ href: `/media/academy/course/${c.id}`, label: c.title.split(" — ")[0] })) },
  {
    title: "শেখার সহায়িকা",
    links: [
      { href: "/media/academy/videos", label: "বিনামূল্যের ক্লাস ভিডিও" },
      { href: "/media/academy/teachers", label: "শিক্ষকদের চ্যানেল" },
      { href: "/media/academy/admission", label: "ভর্তি পরীক্ষা" },
      { href: "/media/academy/exam", label: "ফাইনাল ও প্রকাশ্য বোর্ড" },
      { href: "/media/academy/teach", label: "শিক্ষক হিসেবে আবেদন" },
      { href: "/media/academy/panel", label: "প্যানেল মার্কিং" },
    ],
  },
  {
    title: "কাণ্ডারী-ল্যাব",
    links: [
      { href: "/", label: "হোম" },
      { href: "/products", label: "পণ্য" },
      { href: "/team", label: "আমাদের দল" },
      { href: "/research", label: "গবেষণা" },
      { href: "/bangladesh", label: "বাংলাদেশ সমস্যা ও সমাধান" },
      { href: "/nagorik", label: "নাগরিক অধিকার ও দায়িত্ব" },
    ],
  },
  {
    title: "কমিউনিটি",
    links: [
      { href: "/media", label: "শিক্ষিতদের মিডিয়া" },
      { href: "/media/people", label: "মানুষ" },
      { href: "/media/together", label: "একসাথে" },
      { href: "/media/news", label: "খবর" },
    ],
  },
  {
    title: "আরও",
    links: [
      { href: "/media/settings", label: "সেটিংস" },
      { href: "/media/notifications", label: "নোটিফিকেশন" },
      { href: "/media/credits", label: "ছবির কৃতজ্ঞতা" },
    ],
  },
];

/** The big footer: link columns over two rows, the apps to come, and the line at the bottom. */
export function DeptFooter() {
  return (
    <footer className="-mx-3 -mb-24 bg-text-primary px-3 sm:-mx-6 sm:px-6 lg:-mb-12">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-lg font-bold text-white">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-sm text-white/75 transition-colors hover:text-signal-orange hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">অ্যাপ</h2>
          {["অ্যান্ড্রয়েড অ্যাপ", "আইফোন অ্যাপ"].map((a) => (
            <p key={a} className="flex w-48 items-center gap-3 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20">
              <Smartphone className="size-6 text-signal-orange" aria-hidden />
              <span className="leading-tight">
                <span className="block text-[11px] text-white/60">শিগগিরই আসছে</span>
                <span className="block text-sm font-bold text-white">{a}</span>
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/12 py-6 text-sm text-white/65">
        <p>© ২০২৬ কাণ্ডারী-ল্যাব · কাণ্ডারী তৈরি একাডেমি</p>
        <p className="font-semibold text-signal-orange">সবার আমি ছাত্র</p>
      </div>
    </footer>
  );
}
