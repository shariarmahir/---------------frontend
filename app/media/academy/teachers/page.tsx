import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ChannelCard } from "@/components/media/academy/channel/channel-card";
import { TeacherRow, standingOf } from "@/components/media/academy/parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { departments, getDepartment, teacherRecord, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, REVIEW_AT, SCHOOLS } from "@/lib/media/academy";

export const metadata: Metadata = { title: "শিক্ষক · একাডেমি" };

type Params = { d?: string; q?: string; view?: string };

const byPoints = (a: string, b: string) => standingOf(teacherRecord(b)!).points.total - standingOf(teacherRecord(a)!).points.total;

/**
 * Every teacher as a channel, grouped by the departments they teach in —
 * someone in two departments shows in both. Searching, or "পয়েন্টে র‍্যাংক",
 * gives the one ranked list, where points alone decide the order.
 */
export default async function TeachersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const dept = sp.d && getDepartment(sp.d) ? sp.d : undefined;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const rank = sp.view === "rank" || !!q;
  const needle = q.toLowerCase();

  const ranked = teacherRecords
    .filter((t) => !dept || getDepartment(dept)!.teachers.includes(t.handle))
    .filter((t) => {
      if (!needle) return true;
      const p = personOrThrow(t.handle);
      return [p.nameBn, p.name, t.handle, t.title, getDepartment(t.dept)?.name ?? ""].some((f) => f.toLowerCase().includes(needle));
    })
    .sort((a, b) => byPoints(a.handle, b.handle));

  const sections = departments.filter((d) => !dept || d.id === dept).map((d) => ({ dept: d, teachers: d.teachers.filter((h) => teacherRecord(h)).sort(byPoints) }));
  const link = (next: Params) => {
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/media/academy/teachers${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: "/media/academy", label: "একাডেমি" }}
        title="শিক্ষক"
        subtitle="প্রত্যেকে পেশাদার প্যানেলের ইন্টারভিউ আর নমুনা ক্লাস দিয়ে এসেছেন। প্রত্যেকের নিজের চ্যানেল — বিভাগ ধরে সাজানো। র‍্যাংক ঠিক হয় পয়েন্টে, কেউ টাকা দিয়ে উপরে উঠতে পারেন না।"
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
            <ul className="flex w-max items-center gap-2">
              <li><Link href={link({ q, view: "rank" })} aria-current={rank && !dept ? "page" : undefined} className={chipClass(rank && !dept)}>পয়েন্টে র‍্যাংক</Link></li>
              <li aria-hidden className="mx-1 h-6 w-px bg-white/20" />
              <li><Link href={link({ q })} aria-current={!dept && !rank ? "page" : undefined} className={chipClass(!dept && !rank)}>সব বিভাগ</Link></li>
              {departments.map((d) => (
                <li key={d.id}>
                  <Link href={link({ d: d.id, q })} aria-current={dept === d.id ? "page" : undefined} className={chipClass(dept === d.id)}>{d.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {rank ? (
            ranked.length === 0 ? (
              <EmptyState icon="search" title="এই খোঁজে শিক্ষক নেই" body="অন্য নাম বা বিভাগ দিয়ে খুঁজুন।" action={<Link href="/media/academy/teachers" className="text-sm font-semibold text-signal-orange hover:underline">সব শিক্ষক</Link>} />
            ) : (
              <ol className="rounded-2xl bg-text-primary p-2 ring-1 ring-white/12 sm:p-3">
                {ranked.map((t, i) => <li key={t.handle}><TeacherRow handle={t.handle} rank={i + 1} /></li>)}
              </ol>
            )
          ) : (
            <div className="space-y-10 pt-2">
              {sections.map(({ dept: d, teachers }) => (
                <section key={d.id} aria-labelledby={`t-${d.id}`} className="border-b border-white/10 pb-8 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="size-2.5 rounded-[2px] bg-signal-orange" aria-hidden />
                    <h2 id={`t-${d.id}`} className="text-xl font-bold text-white">{d.name}</h2>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">{SCHOOLS[d.school]} · {DEPT_KINDS[d.kind]} · <Num value={teachers.length} /> জন</span>
                    <Link href={`/media/academy/dept/${d.id}`} className="group ml-auto inline-flex items-center gap-1 text-sm font-semibold text-white/75 hover:text-signal-orange">
                      বিভাগের পাতা <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                    </Link>
                  </div>
                  <p className={dept ? "mt-1.5 max-w-3xl text-sm leading-relaxed text-white/70" : "mt-1.5 line-clamp-1 max-w-3xl text-sm text-white/65"}>{d.blurb}{dept && d.place && ` · ${d.place}`}</p>
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                    {teachers.map((h) => <li key={h}><ChannelCard handle={h} /></li>)}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
        <Panel as="aside" title="পয়েন্ট যেভাবে" className="lg:sticky lg:top-0 lg:self-start">
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
