import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { CourseCard, Fee, TeacherRow } from "@/components/media/academy/parts";
import { WorkshopBook } from "@/components/media/academy/workshop-book";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { DateText, Num } from "@/components/media/ui/numerals";
import { coursesOf, departments, getDepartment, workshopsOf } from "@/data/media/academy";
import { DEPT_KINDS, SCHOOLS } from "@/lib/media/academy";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return departments.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dept = getDepartment((await params).id);
  return { title: dept ? `${dept.name} · একাডেমি` : "বিভাগ" };
}

export default async function DepartmentPage({ params }: Props) {
  const dept = getDepartment((await params).id);
  if (!dept) notFound();
  const deptCourses = coursesOf(dept.id);
  const deptWorkshops = workshopsOf(dept.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/media/academy/departments", label: "সব বিভাগ" }}
        title={dept.name}
        subtitle={dept.blurb}
        actions={
          <>
            <Link href={`/media/academy/admission?dept=${dept.id}`} className={mediaButton({ variant: "primary" })}>এই বিভাগে ভর্তি</Link>
            <Link href={`/media/academy/teach?dept=${dept.id}`} className={mediaButton({ variant: "quiet" })}>এখানে শেখান</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="dept-courses">
            <h2 id="dept-courses" className="mb-4 text-lg font-bold text-white">কোর্স</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {deptCourses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>

          {deptWorkshops.length > 0 && (
            <section aria-labelledby="dept-workshops">
              <h2 id="dept-workshops" className="mb-4 text-lg font-bold text-white">কর্মশালা</h2>
              <ul className="space-y-3">
                {deptWorkshops.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-text-primary p-4 ring-1 ring-white/12">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white">{w.title}</h3>
                      <p className="mt-1 text-sm text-white/75"><DateText iso={w.at} time weekday /> · {w.place}</p>
                      <p className="mt-1 text-sm"><Fee amount={w.fee} /> <span className="text-xs text-white/65">· <Num value={w.seats - w.taken} />টি আসন বাকি</span></p>
                    </div>
                    <WorkshopBook workshop={w} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-22 lg:self-start">
          <Panel title={dept.kind === "team" ? "শিক্ষক দল" : "শিক্ষক"}>
            <p className="-mt-2 mb-2 text-xs text-white/70">{SCHOOLS[dept.school]} · {DEPT_KINDS[dept.kind]}</p>
            <ul>
              {dept.teachers.map((h) => <li key={h}><TeacherRow handle={h} /></li>)}
            </ul>
          </Panel>
          {dept.place && (
            <Panel title="হাতে-কলমে ক্লাস হয় এখানে">
              <p className="flex gap-2 text-sm text-white/85"><MapPin className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden />{dept.place}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/70">প্রথম ক্লাস সবসময় অনলাইনে। জায়গাটা প্যানেল নিজে গিয়ে নিরাপত্তা দেখে অনুমোদন দিয়েছে।</p>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
