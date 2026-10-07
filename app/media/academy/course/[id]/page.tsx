import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, FileText, FileVideo, MapPin } from "lucide-react";
import { ComplaintBox } from "@/components/media/academy/complaint-box";
import { CourseDesk } from "@/components/media/academy/course-desk";
import { CourseMaterials } from "@/components/media/academy/course-materials";
import { RememberCourse } from "@/components/media/academy/departments/recent";
import { ModeTag, TierBadge, modesOf, standingOf } from "@/components/media/academy/parts";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { DateText, Num, Taka } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { courses, deptShort, getCourse, getDepartment, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, LEVELS, courseTimeline } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).id);
  return { title: course ? `${course.title} · একাডেমি` : "কোর্স" };
}

export default async function CoursePage({ params }: Props) {
  const course = getCourse((await params).id);
  if (!course) notFound();
  const dept = getDepartment(course.dept)!;
  const teacher = personOrThrow(course.teacher);
  const record = teacherRecord(course.teacher)!;
  const { points, tier } = standingOf(record);
  const fees = computeFees(course.fee);
  const timeline = courseTimeline(course.starts);
  const short = deptShort(dept.id);

  return (
    <div className="mx-auto max-w-6xl">
      <RememberCourse id={course.id} />
      <PageHeader back={{ href: `/media/academy/dept/${dept.id}`, label: dept.name }} title={course.title} subtitle={course.outcome} />

      <div className="relative mb-8 aspect-21/9 overflow-hidden rounded-3xl bg-black sm:aspect-3/1">
        <Image src={course.image} alt="" fill priority sizes="(min-width: 1152px) 72rem, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-black/75 px-4 py-3 sm:px-6">
          <span className="font-mono text-sm font-bold text-signal-orange">{course.id}</span>
          <span className="rounded-md bg-signal-orange px-2 py-0.5 text-xs font-bold text-text-primary">{LEVELS[course.level]}</span>
          <span className="text-sm text-white"><Num value={COURSE_DAYS} /> দিন · <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস</span>
          {modesOf(course).map((m) => <ModeTag key={m} mode={m} className="text-white" />)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <CourseDesk course={course} />

        <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Panel title="শিক্ষক">
            <Link href={`/media/academy/teachers/${teacher.handle}`} className="group flex items-center gap-3">
              <PersonAvatar person={teacher} size="lg" />
              <span className="min-w-0">
                <span className="block font-semibold text-white group-hover:text-signal-orange">{teacher.nameBn}</span>
                <span className="block text-xs text-white/70">{record.title}</span>
              </span>
            </Link>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
              <span className="text-lg font-bold text-white tabular-nums"><Num value={points.total} /></span> পয়েন্ট <TierBadge tier={tier} />
            </p>
            <div className="mt-4">
              <ComplaintBox teacher={teacher.handle} teacherName={teacher.nameBn} course={course.id} />
            </div>
          </Panel>

          <Panel title={dept.academy.name}>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-white/75">বিভাগ</dt><dd className="text-right text-white">{dept.name} · {DEPT_KINDS[dept.kind]}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/75">ব্যাচ শুরু</dt><dd className="text-white"><DateText iso={course.starts} /></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/75">শেষ (<Num value={COURSE_DAYS} /> দিনে)</dt><dd className="text-white"><DateText iso={timeline.ends} /></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/75">প্রজেক্ট ও প্যানেল</dt><dd className="text-white"><DateText iso={timeline.final.from} /> – <DateText iso={timeline.final.to} /></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-white/75">এক ব্যাচে</dt><dd className="text-white"><Num value={course.seats} /> জন (সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} />)</dd></div>
            </dl>
          </Panel>

          <Panel title="কোর্সের কাগজ">
            <ul className="space-y-2 text-sm">
              {[{ label: "সিলেবাস", paper: course.syllabus, Icon: FileText }, { label: "কাজের ক্যালেন্ডার", paper: course.calendar, Icon: CalendarRange }].map(({ label, paper, Icon }) => (
                <li key={label} className="flex items-center gap-2.5 rounded-xl bg-black/40 px-3 py-2.5">
                  <Icon className="size-4.5 shrink-0 text-signal-orange" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{label}</span>
                    <span className="block truncate text-xs text-white/60">{paper.title} · {paper.size}</span>
                  </span>
                  {paper.href && <a href={paper.href} download={paper.file} className="text-xs font-semibold text-signal-orange hover:underline">নামান</a>}
                </li>
              ))}
              <li className="flex items-center gap-2.5 rounded-xl bg-black/40 px-3 py-2.5">
                <FileVideo className="size-4.5 shrink-0 text-signal-orange" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">প্রোমো ভিডিও</span>
                  <span className="block text-xs text-white/60">পুরো কোর্স আড়াই মিনিটে</span>
                </span>
                {short && <Link href={`/media/academy/videos/${encodeURIComponent(short.id)}`} className="text-xs font-semibold text-signal-orange hover:underline">শর্ট দেখুন</Link>}
              </li>
            </ul>
          </Panel>

          {course.fee > 0 && (
            <Panel title="ফি কোথায় যায়">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-white/75">শিক্ষক পান</dt><dd className="tabular-nums text-white"><Taka amount={fees.sellerReceives} /></dd></div>
                <div className="flex justify-between"><dt className="text-white/75">প্ল্যাটফর্ম (দুই পক্ষে ৫%)</dt><dd className="tabular-nums text-white"><Taka amount={fees.platformTotal} /></dd></div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 font-semibold"><dt className="text-white">আপনি দেন</dt><dd className="tabular-nums text-signal-orange"><Taka amount={fees.buyerPays} /></dd></div>
              </dl>
            </Panel>
          )}

          <Panel title="উপকরণ">
            <CourseMaterials course={course} />
          </Panel>

          {dept.place && (
            <Panel title="হাতে-কলমে ক্লাসের জায়গা">
              <p className="flex gap-2 text-sm text-white/85"><MapPin className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden />{dept.place}</p>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
