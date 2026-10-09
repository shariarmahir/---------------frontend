import Image from "next/image";
import Link from "next/link";
import { academies, departments } from "@/data/media/academy";
import { COURSE_DAYS } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "যাত্রা",
    links: [
      { href: "/media/academy", label: "একাডেমি খুঁজুন" },
      { href: "/media/academy/departments", label: "বিভাগ বাছুন" },
      { href: "/media/academy/courses", label: "কোর্স বাছুন" },
      { href: "/media/academy/checkout", label: "ভর্তি" },
      { href: "/media/academy/routine", label: "রুটিন" },
      { href: "/media/academy/classroom", label: "ক্লাস" },
      { href: "/media/academy/exam", label: "পরীক্ষা" },
      { href: "/media/academy/graduation", label: "সমাবর্তন" },
    ],
  },
  { title: "বিভাগ", links: departments.map((d) => ({ href: `/media/academy/dept/${d.id}`, label: d.name })) },
  { title: "একাডেমি", links: academies.map((a) => ({ href: `/media/academy/a/${a.id}`, label: a.name })) },
  {
    title: "আরও",
    links: [
      { href: "/media/academy/videos", label: "বিনামূল্যের ক্লাস ভিডিও" },
      { href: "/media/academy/exam", label: "প্রকাশ্য বোর্ড" },
      { href: "/media/academy/teach", label: "একাডেমি খুলুন" },
      { href: "/media/academy/panel", label: "প্যানেল মার্কিং" },
    ],
  },
];

/** The catalogue's foot: the academy's mark, then the road, every department, every academy and the rest, ruled like the bands above. */
export function CatalogueFooter() {
  return (
    <footer className="border-t border-(--c-line)">
      <div className="@container mx-auto max-w-7xl border-x border-(--c-line)">
        <div className="grid gap-px bg-(--c-line) @2xl:grid-cols-4 @6xl:grid-cols-[1.5fr_1fr_1fr_1.25fr_1fr]">
          <div className="bg-(--c-bg) p-6 @2xl:col-span-4 md:p-10 @6xl:col-span-1">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="96px" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs leading-relaxed text-(--c-muted)">
              কাণ্ডারী তৈরি একাডেমি — দেশের পেশাদারদের ছোট ছোট বিশ্ববিদ্যালয়। ভর্তি থেকে সমাবর্তন, <Num value={COURSE_DAYS} /> দিনে।
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="bg-(--c-bg) p-6 md:p-8">
              <p className="hud text-(--c-faint)">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-(--c-muted) transition-colors hover:text-(--c-ink-strong)">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-(--c-line) px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="hud text-(--c-faint)">
            © <Num value={2026} /> কাণ্ডারী-ল্যাব
          </p>
          <p className="hud text-(--c-faint)">সবার আমি ছাত্র</p>
        </div>
      </div>
    </footer>
  );
}
