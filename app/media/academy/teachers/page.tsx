import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { TeacherRow, standingOf } from "@/components/media/academy/parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { departments, getDepartment, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { REVIEW_AT } from "@/lib/media/academy";

export const metadata: Metadata = { title: "শিক্ষক · একাডেমি" };

type Params = { d?: string; q?: string };

export default async function TeachersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const dept = sp.d && getDepartment(sp.d) ? sp.d : undefined;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const needle = q.toLowerCase();

  const shown = teacherRecords
    .filter((t) => !dept || getDepartment(dept)!.teachers.includes(t.handle))
    .filter((t) => {
      if (!needle) return true;
      const p = personOrThrow(t.handle);
      return [p.nameBn, p.name, t.title, getDepartment(t.dept)?.name ?? ""].some((f) => f.toLowerCase().includes(needle));
    })
    .sort((a, b) => standingOf(b).points.total - standingOf(a).points.total);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/media/academy", label: "একাডেমি" }}
        title="শিক্ষক"
        subtitle="প্রত্যেকে পেশাদার প্যানেলের ইন্টারভিউ আর নমুনা ক্লাস দিয়ে এসেছেন। র‍্যাংক ঠিক হয় পয়েন্টে — কেউ টাকা দিয়ে উপরে উঠতে পারেন না।"
        actions={<Link href="/media/academy/teach" className={mediaButton({ variant: "primary" })}>শিক্ষক হিসেবে আবেদন</Link>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <form action="/media/academy/teachers" role="search">
            {dept && <input type="hidden" name="d" value={dept} />}
            <label className="relative block">
              <span className="sr-only">শিক্ষক খুঁজুন</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/65" aria-hidden />
              <input type="search" name="q" defaultValue={q} placeholder="নাম, দক্ষতা বা বিভাগ" className="h-12 w-full rounded-2xl border border-white/12 bg-text-primary pr-4 pl-12 text-[15px] focus:border-signal-orange focus:ring-3 focus:ring-signal-orange/15 focus:outline-none" />
            </label>
          </form>
          <nav aria-label="বিভাগ অনুযায়ী" className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              <li><Link href={q ? `/media/academy/teachers?q=${encodeURIComponent(q)}` : "/media/academy/teachers"} aria-current={!dept ? "page" : undefined} className={chipClass(!dept)}>সব বিভাগ</Link></li>
              {departments.map((d) => (
                <li key={d.id}>
                  <Link href={`/media/academy/teachers?d=${d.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={dept === d.id ? "page" : undefined} className={chipClass(dept === d.id)}>{d.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          {shown.length === 0 ? (
            <EmptyState icon="search" title="এই খোঁজে শিক্ষক নেই" body="অন্য নাম বা বিভাগ দিয়ে খুঁজুন।" action={<Link href="/media/academy/teachers" className="text-sm font-semibold text-signal-orange hover:underline">সব শিক্ষক</Link>} />
          ) : (
            <ol className="rounded-2xl bg-text-primary p-2 ring-1 ring-white/12 sm:p-3">
              {shown.map((t, i) => <li key={t.handle}><TeacherRow handle={t.handle} rank={i + 1} /></li>)}
            </ol>
          )}
        </div>
        <Panel as="aside" title="পয়েন্ট যেভাবে" className="lg:sticky lg:top-22 lg:self-start">
          <dl className="space-y-2 text-sm">
            {[["প্যানেল ইন্টারভিউ", "৪০"], ["শিক্ষার্থীদের রেটিং", "৩০"], ["গ্র্যাজুয়েট (প্রতি ৫ জনে ১)", "২০"], ["সফলতার গল্প (প্রতিটি ২)", "১০"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-white/80">{k}</dt><dd className="font-semibold text-white">{v}</dd></div>
            ))}
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2"><dt className="text-white/80">প্রমাণিত অভিযোগ</dt><dd className="font-semibold text-white">−১০ করে</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-white/70">৭৫+ প্রধান শিক্ষক, ৫০+ দক্ষ শিক্ষক। <Num value={REVIEW_AT} />টি প্রমাণিত অভিযোগে শিক্ষকতা থামে, প্যানেল আবার যাচাই করে।</p>
        </Panel>
      </div>
    </div>
  );
}
