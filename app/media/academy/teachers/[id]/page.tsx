import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Quote } from "lucide-react";
import { ComplaintBox } from "@/components/media/academy/complaint-box";
import { CourseCard, TierBadge, standingOf } from "@/components/media/academy/parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { DateText, Num } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { IdSeal, StatusBadge } from "@/components/media/ui/trust";
import { coursesBy, getDepartment, teacherRecord, teacherRecords } from "@/data/media/academy";
import { getPerson } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return teacherRecords.map((t) => ({ id: t.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const person = getPerson((await params).id);
  return { title: person ? `${person.nameBn} · শিক্ষক` : "শিক্ষক" };
}

export default async function TeacherPage({ params }: Props) {
  const { id } = await params;
  const record = teacherRecord(id);
  const person = getPerson(id);
  if (!record || !person) notFound();
  const dept = getDepartment(record.dept)!;
  const { points, tier } = standingOf(record);
  const parts = [
    { label: "প্যানেল ইন্টারভিউ", value: points.interview, max: 40 },
    { label: "শিক্ষার্থীদের রেটিং", value: points.rating, max: 30 },
    { label: "গ্র্যাজুয়েট", value: points.graduates, max: 20 },
    { label: "সফলতার গল্প", value: points.stories, max: 10 },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader back={{ href: "/media/academy/teachers", label: "সব শিক্ষক" }} title={person.nameBn} subtitle={record.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
            <PersonAvatar person={person} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm text-white/80">
                {person.idVerified && <IdSeal size={18} />} পরিচয় যাচাইকৃত · {person.district}
              </p>
              <Link href={`/media/academy/dept/${dept.id}`} className="mt-1 block font-semibold text-signal-orange hover:underline">{dept.name}</Link>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <TierBadge tier={tier} />
                <span className="text-sm text-white/80"><Num value={record.graduates} /> জন গ্র্যাজুয়েট · <Num value={record.rating.count} />টি রেটিং · গড় <Num value={record.rating.avg} decimals={1} /></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl leading-none font-bold text-white tabular-nums"><Num value={points.total} /></p>
              <p className="mt-1 text-xs text-white/70">১০০-র মধ্যে</p>
            </div>
          </section>

          <section aria-labelledby="points">
            <h2 id="points" className="mb-3 text-lg font-bold text-white">পয়েন্টের হিসাব</h2>
            <ul className="space-y-3 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
              {parts.map((p) => (
                <li key={p.label}>
                  <div className="flex justify-between text-sm"><span className="text-white/85">{p.label}</span><span className="font-semibold text-white tabular-nums"><Num value={p.value} /> / <Num value={p.max} /></span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-signal-orange" style={{ width: `${(p.value / p.max) * 100}%` }} /></div>
                </li>
              ))}
              {points.penalty > 0 && (
                <li className="flex justify-between border-t border-white/10 pt-3 text-sm">
                  <span className="text-white/85">প্রমাণিত অভিযোগ (<Num value={record.complaints.upheld} />টি)</span>
                  <span className="font-semibold text-white tabular-nums">−<Num value={points.penalty} /></span>
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="courses">
            <h2 id="courses" className="mb-3 text-lg font-bold text-white">কোর্স</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {coursesBy(person.handle).map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>

          {record.stories.length > 0 && (
            <section aria-labelledby="stories">
              <h2 id="stories" className="mb-3 text-lg font-bold text-white">শিক্ষার্থীদের সফলতা</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {record.stories.map((s) => (
                  <li key={s.name}>
                    <figure className="h-full rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
                      <Quote className="size-5 text-signal-orange" aria-hidden />
                      <blockquote className="mt-2 text-[15px] leading-relaxed text-white">{s.text}</blockquote>
                      <figcaption className="mt-3 text-sm font-semibold text-white/75">— {s.name}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Panel title="ইন্টারভিউর রেকর্ড">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-white/75">তারিখ</dt><dd className="text-white"><DateText iso={record.interview.at} /></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/75">নম্বর</dt><dd className="font-semibold text-white"><Num value={record.interview.score} /> / ১০০</dd></div>
            </dl>
            <p className="mt-3 text-xs font-semibold text-white/75">প্যানেল</p>
            <ul className="mt-1 space-y-1 text-sm text-white/85">
              {record.interview.panel.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </Panel>

          <Panel title="কমিউনিটি যাচাই করা দক্ষতা">
            <ul className="space-y-2.5">
              {person.skills.map((s) => (
                <li key={s.skill} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white/90">{s.skill}</span>
                  <StatusBadge status={skillStatus(s.self, s.communityAvg, s.raters)} size="sm" />
                </li>
              ))}
            </ul>
            <Link href={`/media/u/${person.handle}`} className={mediaButton({ variant: "quiet", size: "sm", className: "mt-4 w-full" })}>
              পুরো প্রোফাইল ও কাজ <ArrowUpRight aria-hidden />
            </Link>
          </Panel>

          <Panel title="মান নিয়ে অভিযোগ">
            <p className="mb-3 text-sm leading-relaxed text-white/80">ক্লাস না নেওয়া, খারাপ শেখানো, টাকা বা আচরণ — যা-ই হোক, জানান। নাম গোপন থাকে।</p>
            <ComplaintBox teacher={person.handle} teacherName={person.nameBn} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
