import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { JoinedMark } from "@/components/media/academy/joined-mark";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { coursesOf, departments } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, SCHOOLS, type School } from "@/lib/media/academy";

export const metadata: Metadata = { title: "বিভাগ · একাডেমি" };

export default function DepartmentsPage() {
  const schools = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/media/academy", label: "একাডেমি" }}
        title="বিভাগ — বেছে নিন, যোগ দিন"
        subtitle="একজন শিক্ষক, কয়েক বন্ধুর দল, বা একটা চালু গ্যারেজ-রান্নাঘর — যে কেউ প্রমাণ দিয়ে বিভাগ খুলতে পারেন। আপনার দক্ষতার বিভাগ নেই? খুলে ফেলুন।"
        actions={<Link href="/media/academy/teach?dept=new" className={mediaButton({ variant: "primary" })}><Plus aria-hidden /> নতুন বিভাগ খুলুন</Link>}
      />
      <div className="space-y-10">
        {schools.map((s) => (
          <section key={s} aria-labelledby={`school-${s}`}>
            <h2 id={`school-${s}`} className="mb-3 text-lg font-bold text-signal-orange">{SCHOOLS[s]}</h2>
            <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
              {departments.filter((d) => d.school === s).map((d) => (
                <li key={d.id}>
                  <Link href={`/media/academy/dept/${d.id}`} className="group grid gap-3 p-4 transition-colors hover:bg-white/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[17px] font-bold text-white group-hover:text-signal-orange">{d.name}</span>
                        <span className="text-xs font-semibold text-white/70">{DEPT_KINDS[d.kind]} · <Num value={coursesOf(d.id).length} />টি কোর্স</span>
                        <JoinedMark dept={d.id} />
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-white/80">{d.blurb}</span>
                      {d.place && <span className="mt-1.5 flex items-center gap-1 text-xs text-white/70"><MapPin className="size-3.5 text-signal-orange" aria-hidden />{d.place}</span>}
                    </span>
                    <span className="flex -space-x-2">
                      {d.teachers.map((h) => <PersonAvatar key={h} person={personOrThrow(h)} className="ring-2 ring-text-primary" />)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
