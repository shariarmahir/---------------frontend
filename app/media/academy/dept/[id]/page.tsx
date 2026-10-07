import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, MapPin, Wallet, Wifi } from "lucide-react";
import { AdmissionTest } from "@/components/media/academy/admission-test";
import { CourseCard, Fee, TeacherRow } from "@/components/media/academy/parts";
import { WorkshopBook } from "@/components/media/academy/workshop-book";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { DateText, Num, Taka } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { coursesOf, departments, getDepartment, teacherRecord, workshopsOf } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, SCHOOLS } from "@/lib/media/academy";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return departments.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dept = getDepartment((await params).id);
  return { title: dept ? `${dept.name} · একাডেমি` : "বিভাগ" };
}

const JOIN_STEPS = [
  { title: "আপনার কথা ও চার প্রশ্ন", body: "কেন শিখতে চান, আগে কত বছর করেছেন — তারপর চারটি সহজ প্রশ্ন। দশ মিনিট, বিনামূল্যে।" },
  { title: "স্তর মিলিয়ে কোর্স", body: "শুরু থেকে, মাঝারি না অভিজ্ঞ — সেই অনুযায়ী কোর্স বাছুন; ফি শুধু কোর্সের।" },
  { title: "প্রথম ক্লাস অনলাইনে", body: "পরিচয় হয়ে গেলে লাইভ আর হাতে-কলমের ক্লাস; শেষে প্রজেক্ট আর প্যানেল।" },
];

export default async function DepartmentPage({ params }: Props) {
  const dept = getDepartment((await params).id);
  if (!dept) notFound();
  const deptCourses = coursesOf(dept.id);
  const deptWorkshops = workshopsOf(dept.id);
  const fees = deptCourses.map((c) => c.fee);
  const low = Math.min(...fees);
  const high = Math.max(...fees);
  const graduates = dept.teachers.reduce((n, h) => n + (teacherRecord(h)?.graduates ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/media/academy/departments", label: "সব বিভাগ" }}
        title={dept.name}
        subtitle={dept.blurb}
        actions={
          <>
            <a href="#join" className={mediaButton({ variant: "primary" })}>যোগ দিন — বিনামূল্যে</a>
            <Link href={`/media/academy/teach?dept=${dept.id}`} className={mediaButton({ variant: "quiet" })}>এখানে শেখান</Link>
          </>
        }
      />

      <section aria-label="এক নজরে" className="mb-10 grid gap-px overflow-hidden rounded-2xl bg-white/12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-text-primary p-5">
          <p className="text-xs font-bold text-signal-orange">কারা শেখান</p>
          <div className="mt-3 flex -space-x-2">
            {dept.teachers.map((h) => <PersonAvatar key={h} person={personOrThrow(h)} className="ring-2 ring-text-primary" />)}
          </div>
          <p className="mt-2 text-sm text-white/85">{dept.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</p>
          <p className="text-xs text-white/65">{DEPT_KINDS[dept.kind]} · {SCHOOLS[dept.school]}</p>
        </div>
        <div className="bg-text-primary p-5">
          <p className="text-xs font-bold text-signal-orange">ক্লাস কোথায়</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/90"><Wifi className="size-4 shrink-0 text-signal-orange" aria-hidden /> ভিডিও আর লাইভ — ফোনেই</p>
          {dept.place && <p className="mt-2 flex items-start gap-2 text-sm text-white/90"><MapPin className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden /> হাতে-কলমে: {dept.place}</p>}
        </div>
        <div className="bg-text-primary p-5">
          <p className="text-xs font-bold text-signal-orange">খরচ</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/90"><Wallet className="size-4 shrink-0 text-signal-orange" aria-hidden /> যোগ দেওয়া বিনামূল্যে</p>
          <p className="mt-2 text-sm text-white/90">
            কোর্স {high === 0 ? <span className="font-semibold text-bdgreen-500">বিনা ফি</span> : low === high ? <Taka amount={low} /> : <>{low === 0 ? "বিনা ফি" : <Taka amount={low} />} থেকে <Taka amount={high} /></>}
          </p>
          <p className="text-xs text-white/65">ফি এসক্রোতে, ক্লাস হলে শিক্ষক পান</p>
        </div>
        <div className="bg-text-primary p-5">
          <p className="text-xs font-bold text-signal-orange">শেষে কী পাবেন</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/90"><Award className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden /> প্যানেল ইন্টারভিউ আর যাচাইযোগ্য KTA সার্টিফিকেট</p>
          <p className="mt-2 text-xs text-white/65">এ পর্যন্ত <Num value={graduates} /> জন উত্তীর্ণ</p>
        </div>
      </section>

      <section id="join" aria-labelledby="join-title" className="mb-12 scroll-mt-6">
        <h2 id="join-title" className="text-xl font-bold text-white">৩ ধাপে যোগ দিন</h2>
        <ol className="mt-4 mb-6 grid gap-3 sm:grid-cols-3">
          {JOIN_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-signal-orange text-sm font-bold text-text-primary"><Num value={i + 1} /></span>
              <span>
                <span className="block font-semibold text-white">{s.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-white/75">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
        <AdmissionTest lockDept={dept.id} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="dept-courses">
            <h2 id="dept-courses" className="mb-4 text-xl font-bold text-white">কোর্স</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {deptCourses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>

          {deptWorkshops.length > 0 && (
            <section aria-labelledby="dept-workshops">
              <h2 id="dept-workshops" className="mb-4 text-xl font-bold text-white">কর্মশালা</h2>
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

        <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Panel title={dept.kind === "team" ? "শিক্ষক দল" : "শিক্ষক"}>
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
