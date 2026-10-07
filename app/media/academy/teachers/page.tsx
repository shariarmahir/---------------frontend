import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, MapPin, Search, Star, Users } from "lucide-react";
import { ChannelCard } from "@/components/media/academy/channel/channel-card";
import { DeptFooter } from "@/components/media/academy/departments/dept-footer";
import { DeptIcon } from "@/components/media/academy/departments/dept-icons";
import { ExploreNav } from "@/components/media/academy/departments/explore-nav";
import { TeacherRow, standingOf } from "@/components/media/academy/parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { Compact, DateText, Num } from "@/components/media/ui/numerals";
import { coursesOf, departments, getDepartment, teacherRecord, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { BATCH_MAX, COURSE_DAYS, DEPT_KINDS, REVIEW_AT, SCHOOLS, type Department, type DeptKind } from "@/lib/media/academy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "একাডেমি" };

type Params = { d?: string; q?: string; view?: string; kind?: string };

const WRAP = "mx-auto max-w-7xl px-4 sm:px-6";

const points = (h: string) => standingOf(teacherRecord(h)!).points.total;
const byPoints = (a: string, b: string) => points(b) - points(a);

/** An academy as the page shows it: its name and about, its departments, and everyone who teaches there. */
type Academy = { name: string; about: string; kind: DeptKind; depts: Department[]; teachers: string[] };

const ACADEMIES: Academy[] = [...new Set(departments.map((d) => d.academy.name))].map((name) => {
  const depts = departments.filter((d) => d.academy.name === name);
  return {
    name,
    about: depts[0].academy.about,
    kind: depts[0].kind,
    depts,
    teachers: [...new Set(depts.flatMap((d) => d.teachers))].filter((h) => teacherRecord(h)).sort(byPoints),
  };
});

/** The academy's rating: its teachers' class ratings pooled, weighted by how many rated. */
function ratingOf(a: Academy) {
  const rs = a.teachers.map((h) => teacherRecord(h)!.rating).filter((r) => r.count > 0);
  const count = rs.reduce((n, r) => n + r.count, 0);
  return count ? { avg: rs.reduce((n, r) => n + r.avg * r.count, 0) / count, count } : undefined;
}

/** The picture of a department's most-joined course. */
const imageOf = (d: Department) => [...coursesOf(d.id)].sort((a, b) => b.enrolled - a.enrolled)[0]?.image;

/**
 * Every academy on one page, laid out like the departments page: the course
 * bar, a blue welcome band with search and the numbers, then one card per
 * academy — its banner and name, what it is, its department and its teachers
 * as channel cards. "পয়েন্টে র‍্যাংক" lists the teachers alone, ordered by
 * points, which money cannot buy.
 */
export default async function AcademiesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const dept = sp.d && getDepartment(sp.d) ? sp.d : undefined;
  const kind = sp.kind === "solo" || sp.kind === "team" ? (sp.kind as DeptKind) : undefined;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const rank = sp.view === "rank";
  const needle = q.toLowerCase();

  const teacherMatches = (h: string) => {
    const p = personOrThrow(h);
    return [p.nameBn, p.name, h, teacherRecord(h)?.title ?? ""].some((f) => f.toLowerCase().includes(needle));
  };
  const shown = ACADEMIES.filter((a) => !dept || a.depts.some((d) => d.id === dept))
    .filter((a) => !kind || a.kind === kind)
    .filter((a) => !needle || [a.name, a.about, ...a.depts.flatMap((d) => [d.name, d.blurb])].some((f) => f.toLowerCase().includes(needle)) || a.teachers.some(teacherMatches));

  const ranked = teacherRecords
    .filter((t) => !dept || getDepartment(dept)!.teachers.includes(t.handle))
    .filter((t) => !kind || getDepartment(t.dept)?.kind === kind)
    .filter((t) => !needle || teacherMatches(t.handle) || (getDepartment(t.dept)?.name ?? "").toLowerCase().includes(needle))
    .sort((a, b) => byPoints(a.handle, b.handle));

  const link = (next: Params) => {
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/media/academy/teachers${qs ? `?${qs}` : ""}`;
  };
  const chip = (on: boolean) =>
    cn("inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors", on ? "bg-m-ink text-m-on" : "bg-white text-m-ink ring-1 ring-m-ink/15 hover:ring-m-ink/40");

  const graduates = teacherRecords.reduce((n, r) => n + r.graduates, 0);
  const solo = ACADEMIES.filter((a) => a.kind === "solo").length;

  return (
    <>
      <ExploreNav className="-mt-6" />

      {/* Welcome band: the name, search and the numbers. */}
      <section aria-labelledby="academies-title" className="blue-band relative -mx-3 overflow-hidden sm:-mx-6">
        <span aria-hidden className="absolute -right-24 -bottom-40 size-[26rem] rounded-full border-[3rem] border-white/8" />
        <div className={`${WRAP} relative grid gap-8 py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:py-12`}>
          <div>
            <p className="text-sm font-bold text-m-yellow">কাণ্ডারী তৈরি একাডেমি</p>
            <h1 id="academies-title" className="mt-2 text-[clamp(2rem,4vw,2.9rem)] leading-tight font-bold">
              একাডেমি
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">
              প্রতিটি একাডেমি একজন বা কয়েকজন পেশাদারের — নিজের নাম, নিজের বিভাগ, নিজের শিক্ষক দল। প্রত্যেক শিক্ষক পেশাদার প্যানেলের ইন্টারভিউ আর নমুনা ক্লাস দিয়ে এসেছেন; র‍্যাংক ঠিক হয় পয়েন্টে, কেউ টাকা দিয়ে উপরে উঠতে পারেন না।
            </p>
            <form action="/media/academy/teachers" role="search" className="mt-6 max-w-xl">
              {kind && <input type="hidden" name="kind" value={kind} />}
              {rank && <input type="hidden" name="view" value="rank" />}
              <label className="relative block">
                <span className="sr-only">একাডেমি বা শিক্ষক খুঁজুন</span>
                <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-m-ink/55" aria-hidden />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  maxLength={60}
                  placeholder="একাডেমি, শিক্ষক বা বিভাগ"
                  className="h-13 w-full rounded-full bg-white pr-32 pl-13 text-[15px] text-m-ink shadow-[0_14px_30px_-16px_rgb(0_0_0/0.5)] placeholder:text-m-ink/50 focus:ring-4 focus:ring-m-yellow/60 focus:outline-none"
                />
                <button type="submit" className="absolute top-1.5 right-1.5 h-10 rounded-full bg-m-yellow px-5 text-sm font-bold text-m-ink transition-colors hover:bg-m-amber-soft">
                  খুঁজুন
                </button>
              </label>
            </form>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { k: "একাডেমি", v: <Num value={ACADEMIES.length} />, s: <>একক <Num value={solo} /> · দলীয় <Num value={ACADEMIES.length - solo} /></> },
              { k: "শিক্ষক", v: <Num value={teacherRecords.length} />, s: "ইন্টারভিউ-উত্তীর্ণ" },
              { k: "গ্র্যাজুয়েট", v: <Compact n={graduates} />, s: "প্রকাশ্য বোর্ডে" },
            ].map((x) => (
              <div key={x.k} className="flex flex-col rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <dt className="order-2 text-sm font-semibold text-white/85">{x.k}</dt>
                <dd className="order-1 text-3xl leading-none font-bold">{x.v}</dd>
                <dd className="order-3 mt-1 text-xs text-white/65">{x.s}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 pt-8 pb-16 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <nav aria-label="একাডেমি বাছাই" className="-mx-1 overflow-x-auto px-1 py-1 scrollbar-none">
            <ul className="flex w-max items-center gap-2">
              <li>
                <Link href={link({ q })} aria-current={!kind && !rank && !dept ? "page" : undefined} className={chip(!kind && !rank && !dept)}>
                  সব একাডেমি
                </Link>
              </li>
              {(Object.keys(DEPT_KINDS) as DeptKind[]).map((k) => (
                <li key={k}>
                  <Link href={link({ q, kind: k, view: rank ? "rank" : undefined })} aria-current={kind === k ? "page" : undefined} className={chip(kind === k)}>
                    {DEPT_KINDS[k]}
                  </Link>
                </li>
              ))}
              <li aria-hidden className="mx-1 h-6 w-px bg-m-ink/15" />
              <li>
                <Link href={link({ q, kind, view: rank ? undefined : "rank" })} aria-current={rank ? "page" : undefined} className={chip(rank)}>
                  শিক্ষকদের পয়েন্ট র‍্যাংক
                </Link>
              </li>
            </ul>
          </nav>
          {(q || dept) && (
            <p className="mt-3 text-sm text-m-ink/70">
              {q && <>“{q}” — </>}
              {dept && <>{getDepartment(dept)!.name} — </>}
              {rank ? <><Num value={ranked.length} /> জন শিক্ষক</> : <><Num value={shown.length} />টি একাডেমি</>} ·{" "}
              <Link href="/media/academy/teachers" className="font-semibold text-m-blue hover:underline">
                সব দেখুন
              </Link>
            </p>
          )}

          {rank ? (
            ranked.length === 0 ? (
              <EmptyState icon="search" title="এই খোঁজে শিক্ষক নেই" body="অন্য নাম বা বিভাগ দিয়ে খুঁজুন।" action={<Link href="/media/academy/teachers?view=rank" className="text-sm font-semibold text-m-blue hover:underline">সব শিক্ষক</Link>} />
            ) : (
              <ol className="mt-6 rounded-3xl bg-white p-2 shadow-m-tile ring-1 ring-m-ink/8 sm:p-3">
                {ranked.map((t, i) => (
                  <li key={t.handle}>
                    <TeacherRow handle={t.handle} rank={i + 1} />
                  </li>
                ))}
              </ol>
            )
          ) : shown.length === 0 ? (
            <div className="mt-6">
              <EmptyState icon="search" title="এই খোঁজে একাডেমি নেই" body="অন্য নাম, শিক্ষক বা বিভাগ দিয়ে খুঁজুন।" action={<Link href="/media/academy/teachers" className="text-sm font-semibold text-m-blue hover:underline">সব একাডেমি</Link>} />
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {shown.map((a) => (
                <AcademyCard key={a.name} academy={a} open={Boolean(dept) || shown.length === 1} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-12 lg:self-start">
          <section aria-labelledby="points" className="rounded-3xl bg-white p-6 shadow-m-tile ring-1 ring-m-ink/8">
            <h2 id="points" className="font-bold text-m-blue">
              পয়েন্ট যেভাবে
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["প্যানেল ইন্টারভিউ", 40],
                ["শিক্ষার্থীদের রেটিং", 30],
                ["গ্র্যাজুয়েট (প্রতি ৫ জনে ১)", 20],
                ["সফলতার গল্প (প্রতিটি ২)", 10],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-m-ink/80">{k}</dt>
                  <dd className="font-bold text-m-ink">
                    <Num value={v as number} />
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-m-ink/8 pt-2.5">
                <dt className="text-m-ink/80">প্রমাণিত অভিযোগ</dt>
                <dd className="font-bold text-m-red">
                  −<Num value={10} /> করে
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-m-ink/65">
              <Num value={75} />+ প্রধান শিক্ষক, <Num value={50} />+ দক্ষ শিক্ষক। <Num value={REVIEW_AT} />টি প্রমাণিত অভিযোগে শিক্ষকতা থামে, প্যানেল আবার যাচাই করে।
            </p>
          </section>
          <section aria-labelledby="open-academy" className="blue-band rounded-3xl p-6 shadow-m-tile">
            <h2 id="open-academy" className="text-lg font-bold">
              নিজের একাডেমি খুলুন
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>একা বা দল মিলে — প্রতি বিভাগে ঠিক ৩টি কোর্স</li>
              <li>
                প্রতিটি কোর্স <Num value={COURSE_DAYS} /> দিনের
              </li>
              <li>
                ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX.solo} /> (একক) বা <Num value={BATCH_MAX.team} /> (দলীয়) জন
              </li>
            </ul>
            <Link href="/media/academy/teach" className={mediaButton({ className: "mt-5 w-full" })}>
              শিক্ষক হিসেবে আবেদন
            </Link>
          </section>
        </aside>
      </div>

      <DeptFooter />
    </>
  );
}

/**
 * One academy as a card: a banner from its department's work with the
 * academy's mark and name, what it is and its numbers, the department it
 * runs, and its teachers as channel cards.
 */
function AcademyCard({ academy: a, open }: { academy: Academy; open: boolean }) {
  const lead = a.depts[0];
  const image = imageOf(lead);
  const rating = ratingOf(a);
  const courseCount = a.depts.reduce((n, d) => n + coursesOf(d.id).length, 0);
  return (
    <section id={`a-${lead.id}`} aria-labelledby={`a-${lead.id}-name`} className="scroll-mt-24 overflow-hidden rounded-3xl bg-white shadow-m-tile ring-1 ring-m-ink/8">
      <div className="relative h-36 sm:h-44">
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 56rem, 100vw" className="object-cover" />
        ) : (
          <span className="blue-band absolute inset-0" aria-hidden />
        )}
        <span aria-hidden className="absolute inset-0 bg-linear-to-r from-m-blue-night/90 via-m-blue-night/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:p-6">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white shadow-m-lift sm:size-20">
            <DeptIcon dept={lead.id} school={lead.school} className="size-11 sm:size-14" />
          </span>
          <div className="min-w-0 pb-0.5 text-m-on">
            <p className="flex flex-wrap gap-1.5 text-xs font-bold">
              <span className="rounded-md bg-m-yellow px-2 py-0.5 text-m-ink">{DEPT_KINDS[a.kind]}</span>
              <span className="rounded-md bg-white/15 px-2 py-0.5 ring-1 ring-white/25">{SCHOOLS[lead.school]}</span>
            </p>
            <h2 id={`a-${lead.id}-name`} className="mt-2 truncate text-2xl leading-tight font-bold sm:text-[1.7rem]">
              {a.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <p className="max-w-3xl text-[15px] leading-relaxed text-m-ink/80">{a.about}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-m-ink/75">
          {rating && (
            <li className="flex items-center gap-1.5">
              <Star className="size-4 fill-m-yellow text-m-gold" aria-hidden />
              <strong className="text-m-ink">
                <Num value={rating.avg} decimals={1} />
              </strong>{" "}
              (<Compact n={rating.count} />টি রেটিং)
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <Users className="size-4 text-m-blue" aria-hidden />
            <Num value={a.teachers.length} /> জন শিক্ষক
          </li>
          <li className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-m-blue" aria-hidden />
            <Num value={courseCount} />টি কোর্স
          </li>
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-m-blue" aria-hidden />
            শুরু <DateText iso={lead.founded} />
          </li>
          {lead.place && (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 text-m-blue" aria-hidden />
              {lead.place}
            </li>
          )}
        </ul>

        <h3 className="mt-7 text-sm font-bold text-m-ink/60">{a.depts.length > 1 ? "বিভাগগুলো" : "বিভাগ"}</h3>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {a.depts.map((d) => {
            const pic = imageOf(d);
            return (
              <li key={d.id}>
                <Link href={`/media/academy/dept/${d.id}`} className="group flex items-center gap-4 rounded-2xl bg-m-ground p-3 ring-1 ring-m-ink/6 transition-[box-shadow,background-color] duration-200 hover:bg-white hover:shadow-m-lift">
                  <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                    {pic ? (
                      <Image src={pic} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none" />
                    ) : (
                      <DeptIcon dept={d.id} school={d.school} className="size-10" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-m-ink group-hover:text-m-blue">{d.name}</span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-m-ink/65">{d.blurb}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-m-blue">
                      <Num value={coursesOf(d.id).length} />টি কোর্স · <Num value={COURSE_DAYS} /> দিন করে
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-m-blue transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-bold text-m-ink/60">
            শিক্ষকেরা {a.kind === "team" && <span className="font-semibold">— প্রত্যেকে আলাদা বিষয় পড়ান</span>}
          </h3>
          {!open && a.teachers.length > 4 && (
            <Link href={`/media/academy/teachers?d=${lead.id}`} className="text-sm font-semibold text-m-blue hover:underline">
              সবাইকে দেখুন
            </Link>
          )}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-m-ground/60 p-2 ring-1 ring-m-ink/5 sm:grid-cols-3 xl:grid-cols-4">
          {(open ? a.teachers : a.teachers.slice(0, 4)).map((h) => (
            <li key={h} className="rounded-2xl bg-white shadow-[0_1px_2px_rgb(0_31_107/0.06)]">
              <ChannelCard handle={h} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
