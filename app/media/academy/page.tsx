import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { AdmitCard } from "@/components/media/academy/admit-card";
import { CourseCard, Fee, ModeTag, TeacherRow, sessionMode, standingOf } from "@/components/media/academy/parts";
import { WorkshopBook } from "@/components/media/academy/workshop-book";
import { mediaButton } from "@/components/media/ui/button-styles";
import { chipClass } from "@/components/media/ui/field-styles";
import { Panel } from "@/components/media/ui/layout";
import { DateText, Num } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { board, courses, departments, getCourse, teacherRecords, workshops } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, SCHOOLS, type School } from "@/lib/media/academy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "কাণ্ডারী তৈরি একাডেমি",
  description: "সবার আমি ছাত্র — পেশাদারদের কাছে অনলাইনে, লাইভে আর সত্যিকারের কর্মশালায় হাতে-কলমে শিখুন; শেষে প্যানেল ইন্টারভিউয়ে দক্ষতা প্রমাণ করে কাজ পান।",
};

const dhakaDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
const today = dhakaDay(DEMO_NOW.toISOString());

const STEPS = [
  { title: "ভর্তি পরীক্ষা", body: "বিনামূল্যে। কাউকে বাদ দেয় না — আগের অভিজ্ঞতা আর চার প্রশ্নে ঠিক হয় কোথা থেকে শুরু করবেন।" },
  { title: "ক্লাস", body: "ভিডিও, লাইভ আর সত্যিকারের গ্যারেজ-রান্নাঘর-ল্যাবে হাতে-কলমে। ফি এসক্রোতে থাকে, ক্লাস হলে শিক্ষক পান।" },
  { title: "উপস্থিতি ও হোমওয়ার্ক", body: "অন্তত ৭৫% ক্লাস আর ৮০% হোমওয়ার্ক — না হলে ফাইনালে বসা যায় না।" },
  { title: "ফাইনাল প্রজেক্ট", body: "সত্যিকারের একটা কাজ — সার্ভিস করা বাইক, ১০০ জনের রান্না, চালু অ্যাপ।" },
  { title: "প্যানেল ইন্টারভিউ", body: "শিক্ষক আর একজন বহিরাগত পেশাদার আলাদা নম্বর দেন; ২০-এর বেশি ফারাক হলে তৃতীয় পরীক্ষক।" },
  { title: "সার্টিফিকেট ও কাজ", body: "যাচাইযোগ্য KTA আইডি। পাস করলে নাম প্রকাশ্য বোর্ডে ওঠে, নিয়োগকর্তারা দেখে ডাকেন।" },
];

type Params = { s?: string };

export default async function AcademyPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const school = sp.s && sp.s in SCHOOLS ? (sp.s as School) : undefined;
  const deptSchool = new Map(departments.map((d) => [d.id, d.school]));

  const upcoming = courses
    .filter((c) => c.nextLive && new Date(c.nextLive).getTime() > DEMO_NOW.getTime() - 3 * 3_600_000)
    .sort((a, b) => a.nextLive!.localeCompare(b.nextLive!))
    .slice(0, 6);
  const shelf = courses.filter((c) => !school || deptSchool.get(c.dept) === school);
  const schools = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
  const ranked = [...teacherRecords].sort((a, b) => standingOf(b).points.total - standingOf(a).points.total);
  const seats = board.filter((s) => !s.marks).sort((a, b) => a.at.localeCompare(b.at)).slice(0, 3);
  const places = departments.filter((d) => d.place).length;

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* The gold banner, with the viewer's admit card laid on it. */}
      <section aria-labelledby="academy-title" className="live-in grid gap-8 rounded-3xl bg-signal-orange p-6 text-text-primary sm:p-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold">শিক্ষিতদের মিডিয়া · দক্ষতার একাডেমি</p>
          <h1 id="academy-title" className="mt-3 text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.12] font-bold text-balance">কাণ্ডারী তৈরি একাডেমি</h1>
          <p className="mt-3 text-[clamp(1.25rem,2.6vw,1.75rem)] font-bold text-bd-green-dark">“সবার আমি ছাত্র”</p>
          <p className="mt-5 max-w-xl text-base leading-relaxed">
            ইঞ্জিনিয়ার থেকে মেকানিক, শেফ থেকে শিল্পী — যে কাজ জানে সে শেখায়, যে শিখতে চায় সে শেখে। কোনো বয়স বা লিঙ্গের ভাগ নেই। ক্লাস হয় অনলাইনে, লাইভে আর সত্যিকারের গ্যারেজ, রান্নাঘর আর ল্যাবে; শেষে পেশাদারদের প্যানেলের সামনে প্রমাণ।
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/media/academy/admission" className={mediaButton({ variant: "tile", size: "lg" })}>
              ভর্তি পরীক্ষা — বিনামূল্যে <ArrowRight aria-hidden />
            </Link>
            <Link href="/media/academy/teach" className={mediaButton({ size: "lg", className: "border-text-primary bg-transparent text-text-primary shadow-none hover:bg-text-primary/10" })}>
              শিক্ষক হিসেবে যোগ দিন
            </Link>
          </div>
          <p className="mt-6 text-sm font-semibold">
            <Num value={departments.length} />টি বিভাগ · <Num value={courses.length} />টি কোর্স · <Num value={teacherRecords.length} /> জন ইন্টারভিউ-উত্তীর্ণ শিক্ষক · <Num value={places} />টি সত্যিকারের কর্মশালা
          </p>
        </div>
        <AdmitCard />
      </section>

      <section aria-labelledby="timetable">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 id="timetable" className="text-xl font-bold text-white">আজ ও সামনের ক্লাস</h2>
          <Link href="/media/academy/departments" className="text-sm font-semibold text-signal-orange hover:underline">সব বিভাগ</Link>
        </div>
        <ol className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
          {upcoming.map((c) => {
            const teacher = personOrThrow(c.teacher);
            const live = dhakaDay(c.nextLive!) === today;
            return (
              <li key={c.id}>
                <Link href={`/media/academy/course/${c.id}`} className="group grid gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-white/5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
                    {live && <span className="rounded bg-signal-orange px-1.5 py-0.5 text-[11px] font-bold text-text-primary">আজ</span>}
                    <DateText iso={c.nextLive!} time />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white group-hover:text-signal-orange">{c.title}</span>
                    <span className="flex items-center gap-1.5 text-xs text-white/70">
                      <PersonAvatar person={teacher} size="xs" /> {teacher.nameBn}
                    </span>
                  </span>
                  <ModeTag mode={sessionMode(c)} />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="courses">
        <h2 id="courses" className="mb-4 text-xl font-bold text-white">কোর্স</h2>
        <nav aria-label="স্কুল অনুযায়ী" className="-mx-3 mb-5 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2">
            <li><Link href="/media/academy#courses" scroll={false} aria-current={!school ? "page" : undefined} className={chipClass(!school)}>সব</Link></li>
            {schools.map((s) => (
              <li key={s}>
                <Link href={`/media/academy?s=${s}#courses`} scroll={false} aria-current={school === s ? "page" : undefined} className={chipClass(school === s)}>{SCHOOLS[s]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shelf.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      <section aria-labelledby="workshops">
        <h2 id="workshops" className="text-xl font-bold text-white">কর্মশালা — এক দিনে, হাতে-কলমে</h2>
        <p className="mt-1 mb-4 text-sm text-white/75">শিক্ষক নিজের গ্যারেজ, রান্নাঘর বা ল্যাবে ডাকেন। আসন কম, তাই আগে রাখুন।</p>
        <ul className="grid gap-3 lg:grid-cols-2">
          {workshops.map((w) => {
            const host = personOrThrow(w.host);
            return (
              <li key={w.id} className="flex gap-4 rounded-2xl bg-text-primary p-4 ring-1 ring-white/12">
                <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-signal-orange py-2 text-text-primary">
                  <span className="text-xl leading-none font-bold"><DateDay iso={w.at} /></span>
                  <span className="mt-1 text-[11px] font-semibold"><DateMonth iso={w.at} /></span>
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-white">{w.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                    <span>{host.nameBn}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{w.place}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span><Fee amount={w.fee} /> <span className="text-xs text-white/65">· <Num value={w.seats - w.taken} />টি আসন বাকি</span></span>
                    <WorkshopBook workshop={w} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="departments">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="departments" className="text-xl font-bold text-white">বিভাগ</h2>
            <Link href="/media/academy/departments" className="text-sm font-semibold text-signal-orange hover:underline">বিস্তারিত</Link>
          </div>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {schools.map((s) => (
              <div key={s}>
                <h3 className="mb-1 text-sm font-semibold text-signal-orange">{SCHOOLS[s]}</h3>
                <ul>
                  {departments.filter((d) => d.school === s).map((d) => (
                    <li key={d.id}>
                      <Link href={`/media/academy/dept/${d.id}`} className="group flex items-center gap-3 border-b border-white/10 py-2.5">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-white group-hover:text-signal-orange">{d.name}</span>
                          <span className="text-xs text-white/65">{DEPT_KINDS[d.kind]}</span>
                        </span>
                        <span className="flex -space-x-2">
                          {d.teachers.map((h) => <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-black" />)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <Panel title="শিক্ষক — পয়েন্টে র‍্যাংক" action={<Link href="/media/academy/teachers" className="text-sm font-semibold text-signal-orange hover:underline">সবাই</Link>}>
          <p className="-mt-2 mb-3 text-xs leading-relaxed text-white/70">ইন্টারভিউ ৪০ · শিক্ষার্থীদের রেটিং ৩০ · গ্র্যাজুয়েট ২০ · সফলতার গল্প ১০ — প্রমাণিত অভিযোগে কাটা যায়।</p>
          <ol>
            {ranked.slice(0, 6).map((t, i) => <li key={t.handle}><TeacherRow handle={t.handle} rank={i + 1} /></li>)}
          </ol>
        </Panel>
      </div>

      <section aria-labelledby="journey">
        <h2 id="journey" className="mb-5 text-xl font-bold text-white">ভর্তি থেকে কাজ পর্যন্ত</h2>
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-white/12 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-black p-5">
              <span className={cn("inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold", i === STEPS.length - 1 ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")}>
                <Num value={i + 1} />
              </span>
              <h3 className="mt-3 font-bold text-white">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="প্রকাশ্য ইন্টারভিউ বোর্ড" action={<Link href="/media/academy/exam#board" className="text-sm font-semibold text-signal-orange hover:underline">পুরো বোর্ড</Link>}>
          <p className="-mt-2 mb-3 text-sm text-white/75">যে কেউ দেখতে পারেন — নিয়োগকর্তারা এখান থেকেই দক্ষ মানুষ খোঁজেন।</p>
          <ul className="divide-y divide-white/10">
            {seats.map((s) => (
              <li key={s.id} className="py-3">
                <p className="font-semibold text-white">{s.learner} <span className="text-sm font-normal text-white/65">· {s.district}</span></p>
                <p className="text-sm text-white/80">{getCourse(s.course)?.title}</p>
                <p className="mt-0.5 text-xs text-white/65"><DateText iso={s.at} time weekday /></p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="যেভাবে আপনার টাকা আর সময় নিরাপদ">
          <ul className="space-y-4 text-sm leading-relaxed text-white/85">
            <li className="flex gap-3"><Wallet className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden /><span>ফি এসক্রোতে থাকে। শিক্ষক ক্লাস না নিলে টাকা ফেরত; প্ল্যাটফর্ম রাখে শুধু ৫%।</span></li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden /><span>প্রতিটি শিক্ষক পেশাদার প্যানেলের ইন্টারভিউ আর নমুনা ক্লাস দিয়ে এসেছেন। তিনটি প্রমাণিত অভিযোগে শিক্ষকতা থেমে যায়।</span></li>
            <li className="flex gap-3"><Lock className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden /><span>অভিযোগে আপনার নাম শিক্ষক দেখেন না। ফেল করলে ফল প্রকাশ্য হয় না — ৩০ দিন পর আবার চেষ্টা।</span></li>
          </ul>
          <Link href="/media/academy/teachers" className={mediaButton({ variant: "quiet", size: "sm", className: "mt-5" })}>শিক্ষক বেছে অভিযোগ বা রিভিউ দিন</Link>
        </Panel>
      </div>
    </div>
  );
}

function DateDay({ iso }: { iso: string }) {
  return <Num value={Number(new Date(iso).toLocaleDateString("en-GB", { day: "numeric", timeZone: "Asia/Dhaka" }))} />;
}

function DateMonth({ iso }: { iso: string }) {
  return <>{new Date(iso).toLocaleDateString("bn-BD", { month: "short", timeZone: "Asia/Dhaka" })}</>;
}
