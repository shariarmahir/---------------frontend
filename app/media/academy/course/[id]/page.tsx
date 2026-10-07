import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { ComplaintBox } from "@/components/media/academy/complaint-box";
import { CourseDesk } from "@/components/media/academy/course-desk";
import { CourseMaterials } from "@/components/media/academy/course-materials";
import { RememberCourse } from "@/components/media/academy/departments/recent";
import { ModeTag, TierBadge, modesOf, standingOf } from "@/components/media/academy/parts";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num, Taka } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { courses, getCourse, getDepartment, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { LEVELS } from "@/lib/media/academy";
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

  return (
    <div className="mx-auto max-w-6xl">
      <RememberCourse id={course.id} />
      <PageHeader back={{ href: `/media/academy/dept/${dept.id}`, label: dept.name }} title={course.title} subtitle={course.outcome} />

      <div className="relative mb-8 aspect-21/9 overflow-hidden rounded-3xl bg-black sm:aspect-3/1">
        <Image src={course.image} alt="" fill priority sizes="(min-width: 1152px) 72rem, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-black/75 px-4 py-3 sm:px-6">
          <span className="font-mono text-sm font-bold text-signal-orange">{course.id}</span>
          <span className="rounded-md bg-signal-orange px-2 py-0.5 text-xs font-bold text-text-primary">{LEVELS[course.level]}</span>
          <span className="text-sm text-white"><Num value={course.weeks} /> সপ্তাহ</span>
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
