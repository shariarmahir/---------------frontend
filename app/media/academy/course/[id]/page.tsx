import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, CalendarDays, CalendarRange, ChevronRight, Clock3, FileText, FileVideo, Languages, MapPin, Play, ShieldCheck, Star, Users } from "lucide-react";
import { ComplaintBox } from "@/components/media/academy/complaint-box";
import { CourseFinal, CourseProgress, CourseWeeks, EnrollCta } from "@/components/media/academy/course-desk";
import { CourseMaterials } from "@/components/media/academy/course-materials";
import { CourseTabs } from "@/components/media/academy/course/course-tabs";
import { DeptFooter } from "@/components/media/academy/departments/dept-footer";
import { DeptIcon } from "@/components/media/academy/departments/dept-icons";
import { ExploreNav } from "@/components/media/academy/departments/explore-nav";
import { RememberCourse } from "@/components/media/academy/departments/recent";
import { Faq, type QA } from "@/components/media/academy/home/plus/faq";
import { PlusCourseCard } from "@/components/media/academy/home/plus/skills-panel";
import { Voices, type Voice } from "@/components/media/academy/home/plus/voices";
import { Fee, ModeTag, TierBadge, modesOf, standingOf } from "@/components/media/academy/parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { Compact, DateText, Num, Taka } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { board, courses, coursesOf, deptShort, getCourse, getDepartment, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, LEVELS, MIN_ATTENDANCE, MIN_HOMEWORK, MODES, courseTimeline, type Course, type Mode } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).id);
  return { title: course ? `${course.title} · একাডেমি` : "কোর্স" };
}

const WRAP = "mx-auto max-w-6xl px-4 sm:px-6";
const H2 = "text-[clamp(1.4rem,2.6vw,1.85rem)] leading-tight font-bold text-balance text-m-ink";

/** Skills as chips, from the lesson titles: "ভাত, পোলাও, বিরিয়ানি" gives three. */
function skillsOf(course: Course): string[] {
  const parts = course.lessons.flatMap((l) => l.title.split(/\s+—\s+|,\s*|\s+ও\s+|\s+আর\s+|:\s*/));
  return [...new Set(parts.map((p) => p.trim()).filter((p) => p.length > 1))].slice(0, 12);
}

/** What the course teaches, grouped the way it is taught. */
function learnOf(course: Course): React.ReactNode[] {
  const byMode = (Object.keys(MODES) as Mode[])
    .map((m) => ({ m, titles: course.lessons.filter((l) => l.mode === m).map((l) => l.title) }))
    .filter((x) => x.titles.length > 0)
    .map(({ m, titles }) => (
      <>
        <span className="font-semibold text-m-ink">{MODES[m]}:</span> {titles.join("; ")}
      </>
    ));
  return [course.outcome, ...byMode, <><span className="font-semibold text-m-ink">ফাইনাল প্রজেক্ট:</span> {course.final}</>];
}

/*
 * A course's page, laid out the way a big course site lays out a programme:
 * the course bar, a breadcrumb and a light hero with the academy's mark,
 * title, teacher and the big enrol button; a card of numbers riding over its
 * edge; sticky section tabs; what you will learn and the skills; the weeks
 * as an opening list; the teacher; the certificate; the department's other
 * courses; ratings and learners' words; questions; the footer. Everything a
 * learner does here — join, pay, attend, hand in, book the panel — works as
 * before.
 */
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
  const team = [...new Set(course.lessons.map((l) => l.by).filter((h): h is string => Boolean(h) && h !== course.teacher))].map(personOrThrow);
  const siblings = coursesOf(dept.id).filter((c) => c.id !== course.id);
  const left = Math.max(0, course.seats - course.enrolled);

  const voices: Voice[] = record.stories.map((st) => ({
    name: st.name,
    text: st.text,
    from: `${dept.name} · শিক্ষক ${teacher.nameBn}`,
    certificate: board.find((b) => b.learner === st.name && b.certificate)?.certificate,
  }));

  const faq: QA[] = [
    {
      q: "ফি কত, আর টাকা কোথায় যায়?",
      a:
        course.fee === 0 ? (
          <>এই কোর্স বিনা ফির। শুধু বিভাগে যোগ দিয়ে ভর্তি হন।</>
        ) : (
          <>
            আপনি দেন <Taka amount={fees.buyerPays} />, শিক্ষক পান <Taka amount={fees.sellerReceives} />; প্ল্যাটফর্ম দুই পক্ষে ৫% করে রাখে (<Taka amount={fees.platformTotal} />)। ক্লাস না হওয়া পর্যন্ত টাকা থাকে এসক্রোতে।
          </>
        ),
    },
    {
      q: "কবে শুরু, কবে শেষ?",
      a: (
        <>
          ব্যাচ শুরু <DateText iso={course.starts} />, শেষ <DateText iso={timeline.ends} /> — মোট <Num value={COURSE_DAYS} /> দিন। <DateText iso={timeline.final.from} /> থেকে <DateText iso={timeline.final.to} /> প্রজেক্ট আর প্যানেল।
        </>
      ),
    },
    {
      q: "আগে বিভাগে যোগ দিতে হয় কেন?",
      a: <>কোর্সে ভর্তির আগে {dept.name} বিভাগে যোগ দিতে হয় — বিনামূল্যে। চার প্রশ্নের ভর্তি পরীক্ষা ঠিক করে দেয় কোন স্তরে বসবেন।</>,
    },
    {
      q: "এক ব্যাচে কতজন?",
      a: (
        <>
          এই ব্যাচে <Num value={course.seats} />টি আসন, এখন বাকি <Num value={left} />টি। {DEPT_KINDS[dept.kind]}তে এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন।
        </>
      ),
    },
    ...(dept.place ? [{ q: "হাতে-কলমের ক্লাস কোথায় হয়?", a: <>{dept.place}</> }] : []),
    {
      q: "ফাইনালে বসতে কী লাগে?",
      a: (
        <>
          অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাসে হাজিরা, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ আর ফাইনাল প্রজেক্ট জমা। তারপর প্যানেল ইন্টারভিউয়ের সময় বেছে নেন।
        </>
      ),
    },
    { q: "সনদ কীভাবে যাচাই হয়?", a: <>পাস করলে নাম ওঠে প্রকাশ্য বোর্ডে। সনদের আইডি দিয়ে যে কেউ — নিয়োগকর্তাও — মিলিয়ে দেখতে পারেন।</> },
    { q: "শিক্ষক নিয়ে অভিযোগ করব কীভাবে?", a: <>শিক্ষকের অংশে অভিযোগ বাক্স আছে। আপনার নাম শিক্ষক দেখেন না, আর প্রতিটি অভিযোগ প্যানেল খতিয়ে দেখে।</> },
  ];

  const tabs = [
    { id: "about", label: "পরিচিতি" },
    { id: "curriculum", label: "পাঠক্রম" },
    { id: "teacher", label: "শিক্ষক" },
    { id: "certificate", label: "সনদ" },
    { id: "reviews", label: "রিভিউ" },
    { id: "faq", label: "প্রশ্ন" },
  ];

  return (
    <>
      <RememberCourse id={course.id} />
      <ExploreNav className="-mt-6" />

      <div className="-mx-3 bg-m-canvas pb-24 sm:-mx-6">
        {/* Hero: light, the academy's mark, the title and the big button. */}
        <section aria-labelledby="course-title" className="relative overflow-hidden bg-linear-to-b from-m-blue-soft via-m-blue-soft/55 to-white">
          <span aria-hidden className="absolute -top-24 -right-24 size-[28rem] rounded-full bg-white/60" />
          <div className={`${WRAP} relative pt-5 pb-24 lg:pb-28`}>
            <nav aria-label="অবস্থান" className="flex flex-wrap items-center gap-1 text-sm text-m-ink/70">
              <Link href="/media/academy" className="hover:text-m-blue hover:underline">
                একাডেমি
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href="/media/academy/departments" className="hover:text-m-blue hover:underline">
                বিভাগ
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/media/academy/dept/${dept.id}`} className="hover:text-m-blue hover:underline">
                {dept.name}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="font-mono text-m-ink">{course.id}</span>
            </nav>

            <div className="mt-7 grid items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <Link href={`/media/academy/dept/${dept.id}`} className="inline-flex items-center gap-2.5 rounded-xl bg-white py-1.5 pr-3.5 pl-1.5 text-sm font-bold text-m-ink shadow-m-ink ring-1 ring-m-ink/8 hover:text-m-blue">
                  <span className="grid size-8 place-items-center rounded-lg bg-m-ground">
                    <DeptIcon dept={dept.id} school={dept.school} className="size-6" />
                  </span>
                  {dept.academy.name}
                </Link>
                <h1 id="course-title" className="mt-5 text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.18] font-bold text-m-ink">
                  {course.title}
                </h1>
                <p className="mt-3 max-w-2xl text-lg leading-snug font-semibold text-m-ink/85">{course.outcome}</p>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-m-ink/75">{dept.blurb}</p>

                <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-m-ink/80">
                  শিক্ষক:
                  <Link href={`/media/academy/teachers/${teacher.handle}`} className="inline-flex items-center gap-2 font-semibold text-m-ink underline-offset-2 hover:text-m-blue hover:underline">
                    <PersonAvatar person={teacher} size="xs" />
                    {teacher.nameBn}
                  </Link>
                  <TierBadge tier={tier} />
                  {team.length > 0 && (
                    <span className="text-m-ink/65">
                      +<Num value={team.length} /> জন সহশিক্ষক
                    </span>
                  )}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <EnrollCta course={course} />
                  <div className="text-sm">
                    <p className="text-m-ink/70">কোর্স ফি</p>
                    <p className="text-xl">
                      <Fee amount={course.fee} />
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-m-ink/80">
                  <strong className="text-m-ink">
                    <Num value={course.enrolled} />
                  </strong>{" "}
                  জন এই ব্যাচে ভর্তি · <Num value={left} />টি আসন বাকি
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-m-ink/75">
                  <ShieldCheck className="size-4 text-m-green" aria-hidden /> ফি থাকে এসক্রোতে — ক্লাস হলে তবেই শিক্ষক পান
                </p>
              </div>

              <div className="relative hidden lg:block">
                <span aria-hidden className="absolute -inset-3 rotate-3 rounded-[2.25rem] bg-m-yellow/70" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-m-lift ring-4 ring-white">
                  <Image src={course.image} alt={course.title} fill priority sizes="28rem" className="object-cover" />
                </div>
                {short && (
                  <Link
                    href={`/media/academy/videos/${encodeURIComponent(short.id)}`}
                    className="absolute -bottom-5 left-6 inline-flex items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-2 text-sm font-bold text-m-ink shadow-m-lift ring-1 ring-m-ink/8 hover:text-m-blue"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-m-blue text-m-on">
                      <Play className="size-4 fill-current" aria-hidden />
                    </span>
                    বিভাগের শর্ট দেখুন
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The numbers card, riding over the hero's edge. */}
        <div className={`${WRAP} relative z-10 -mt-16 mb-8`}>
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-m-lift ring-1 ring-m-ink/8 sm:grid-cols-3 lg:grid-cols-5 [&>div]:border-m-ink/8 [&>div]:p-5 max-lg:[&>div]:border-b lg:[&>div+div]:border-l">
            <Stat
              big={
                <a href="#curriculum" className="underline decoration-m-blue/40 underline-offset-4 hover:text-m-blue">
                  <Num value={course.lessons.length} /> সপ্তাহের পাঠ
                </a>
              }
              small="তারপর প্রজেক্ট ও প্যানেল"
            />
            {record.rating.count > 0 ? (
              <Stat
                big={
                  <span className="inline-flex items-center gap-1.5">
                    <Num value={record.rating.avg} decimals={1} /> <Star className="size-5 fill-m-yellow text-m-gold" aria-hidden />
                  </span>
                }
                small={
                  <>
                    (<Compact n={record.rating.count} />টি রেটিং)
                  </>
                }
              />
            ) : (
              <Stat big="নতুন শিক্ষক" small="এখনো রেটিং নেই" />
            )}
            <Stat big={<>{LEVELS[course.level]} স্তর</>} small="ভর্তি পরীক্ষা স্তর ঠিক করে" />
            <Stat
              big={
                <>
                  <Num value={COURSE_DAYS} /> দিনে শেষ
                </>
              }
              small={
                <>
                  <DateText iso={course.starts} /> – <DateText iso={timeline.ends} />
                </>
              }
            />
            <Stat
              big={
                <>
                  <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস
                </>
              }
              small={
                <span className="flex flex-wrap gap-x-2">
                  {modesOf(course).map((m) => (
                    <ModeTag key={m} mode={m} className="text-m-ink/70" />
                  ))}
                </span>
              }
            />
          </dl>
        </div>

        <CourseTabs tabs={tabs} />

        {/* About: what you will learn, the skills, the details to know. */}
        <section id="about" aria-labelledby="learn" className={`${WRAP} scroll-mt-32 pt-12`}>
          <h2 id="learn" className={H2}>
            যা শিখবেন
          </h2>
          <ul className="mt-5 grid gap-x-10 gap-y-4 rounded-2xl p-6 ring-1 ring-m-ink/12 md:grid-cols-2">
            {learnOf(course).map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-m-ink/80">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-m-green" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-lg font-bold text-m-ink">যে দক্ষতা পাবেন</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {skillsOf(course).map((s) => (
              <li key={s} className="rounded-full bg-m-ground px-3.5 py-1.5 text-sm font-semibold text-m-ink ring-1 ring-m-ink/8">
                {s}
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-lg font-bold text-m-ink">জানার মতো তথ্য</h3>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Detail Icon={Award} title="যাচাইযোগ্য সনদ" body="পাস করলে নাম ওঠে প্রকাশ্য বোর্ডে" />
            <Detail Icon={Languages} title="বাংলায় পড়ানো হয়" body="ক্লাস আর উপকরণ বাংলায়" />
            <Detail
              Icon={Clock3}
              title="মূল্যায়ন"
              body={
                <>
                  সাপ্তাহিক হোমওয়ার্ক, অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা, শেষে প্যানেল
                </>
              }
            />
            <Detail Icon={dept.place ? MapPin : Users} title={dept.place ? "হাতে-কলমের জায়গা" : "ছোট ব্যাচ"} body={dept.place ?? <>এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন</>} />
          </ul>
        </section>

        {/* The weeks, like the courses of a series. */}
        <section id="curriculum" aria-labelledby="weeks" className={`${WRAP} scroll-mt-32 pt-16`}>
          <div className="rounded-3xl bg-m-ground p-5 ring-1 ring-m-ink/6 sm:p-8">
            <p className="text-sm font-bold text-m-blue">
              {course.id} · {DEPT_KINDS[dept.kind]}
            </p>
            <h2 id="weeks" className={cn(H2, "mt-1")}>
              কোর্সের পাঠক্রম — <Num value={course.lessons.length} /> সপ্তাহ আর প্রজেক্ট
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-m-ink/75">
              প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, সঙ্গে হোমওয়ার্ক। শেষ <Num value={5} /> দিন নিজের প্রজেক্ট বানিয়ে প্যানেলের সামনে দেখান। প্রতিটি সপ্তাহ খুলে দেখুন কে পড়াবেন, কোথায়, কী করতে হবে।
            </p>
            <div className="mt-6 space-y-6">
              <CourseProgress course={course} />
              <CourseWeeks course={course} />
              <CourseFinal course={course} />
            </div>
          </div>

          {/* The course's papers and files, like a course site's three cards. */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Paper Icon={FileText} title="সিলেবাস" meta={`${course.syllabus.title} · ${course.syllabus.size}`} href={course.syllabus.href} file={course.syllabus.file} />
            <Paper Icon={CalendarRange} title="কাজের ক্যালেন্ডার" meta={`${course.calendar.title} · ${course.calendar.size}`} href={course.calendar.href} file={course.calendar.file} />
            <Paper Icon={FileVideo} title="প্রোমো ভিডিও" meta="পুরো কোর্স আড়াই মিনিটে" link={short ? { href: `/media/academy/videos/${encodeURIComponent(short.id)}`, label: "শর্ট দেখুন" } : undefined} />
          </div>
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8 sm:p-6">
            <h3 className="mb-4 font-bold text-m-ink">উপকরণ</h3>
            <CourseMaterials course={course} />
          </div>
        </section>

        {/* The teacher. */}
        <section id="teacher" aria-labelledby="teacher-title" className={`${WRAP} scroll-mt-32 pt-16`}>
          <h2 id="teacher-title" className={H2}>
            শিক্ষক
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="rounded-2xl bg-white p-6 shadow-m-tile ring-1 ring-m-ink/8">
              <Link href={`/media/academy/teachers/${teacher.handle}`} className="group flex items-center gap-4">
                <PersonAvatar person={teacher} size="lg" />
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-m-blue group-hover:underline">{teacher.nameBn}</span>
                  <span className="block text-sm text-m-ink/70">{record.title}</span>
                </span>
              </Link>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-m-ink/8 pt-5 text-sm sm:grid-cols-4">
                <Fact k="পয়েন্ট" v={<><Num value={points.total} /> <TierBadge tier={tier} /></>} />
                <Fact k="গ্র্যাজুয়েট" v={<><Num value={record.graduates} /> জন</>} />
                <Fact k="প্যানেল ইন্টারভিউ" v={<><Num value={record.interview.score} />/<Num value={100} /></>} />
                <Fact k="প্রমাণিত অভিযোগ" v={<span className={record.complaints.upheld === 0 ? "text-m-green" : "text-m-red"}><Num value={record.complaints.upheld} />টি</span>} />
              </dl>
              {team.length > 0 && (
                <div className="mt-5 border-t border-m-ink/8 pt-5">
                  <p className="text-sm font-semibold text-m-ink">দলের অন্য শিক্ষক — প্রত্যেকে আলাদা বিষয় পড়ান</p>
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {team.map((p) => (
                      <li key={p.handle}>
                        <Link href={`/media/academy/teachers/${p.handle}`} className="flex items-center gap-2 rounded-full bg-m-ground py-1 pr-3.5 pl-1 text-sm font-semibold text-m-ink hover:text-m-blue">
                          <PersonAvatar person={p} size="sm" /> {p.nameBn}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="self-start rounded-2xl bg-white p-6 shadow-m-tile ring-1 ring-m-ink/8">
              <h3 className="font-bold text-m-ink">কিছু বলার আছে?</h3>
              <p className="mt-1 mb-4 text-sm text-m-ink/70">নাম গোপন থাকে; প্যানেল খতিয়ে দেখে।</p>
              <ComplaintBox teacher={teacher.handle} teacherName={teacher.nameBn} course={course.id} />
            </div>
          </div>
        </section>

        {/* Earn a certificate. */}
        <section id="certificate" aria-labelledby="cert-title" className={`${WRAP} scroll-mt-32 pt-16`}>
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-m-blue-soft p-6 sm:p-10 lg:grid-cols-2">
            <div>
              <h2 id="cert-title" className={H2}>
                যাচাইযোগ্য সনদ অর্জন করুন
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-m-ink/80">পাস করলে সনদের আইডি নিয়োগকর্তাকে দিন — প্রকাশ্য বোর্ডে নাম, কোর্স আর দুই পরীক্ষকের নম্বর মিলিয়ে দেখা যায়।</p>
              <ul className="mt-5 space-y-2.5 text-[15px] text-m-ink/85">
                {["দুই পরীক্ষক আলাদা নম্বর দেন — একজন বাইরের পেশাদার", "২০-এর বেশি ফারাক হলে তৃতীয় পরীক্ষক ডাকা হয়", "ফেল করলে ফল গোপন, ৩০ দিন পর আবার"].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-m-blue" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/media/academy/exam#board" className="group mt-6 inline-flex items-center gap-1.5 font-bold text-m-blue hover:underline">
                প্রকাশ্য বোর্ড দেখুন <ChevronRight className="size-4.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <span aria-hidden className="absolute -inset-4 -rotate-3 rounded-3xl bg-white/50" />
              <div className="relative rounded-2xl bg-white p-6 shadow-m-lift ring-1 ring-m-yellow/70">
                <span aria-hidden className="absolute inset-x-0 top-0 h-2 rounded-t-2xl bg-m-yellow" />
                <p className="flex items-center justify-between text-xs font-bold">
                  <span className="text-m-blue">কাণ্ডারী তৈরি একাডেমি</span>
                  <span className="rounded bg-m-ground px-1.5 py-0.5 text-m-ink/70">নমুনা</span>
                </p>
                <p className="mt-5 text-sm text-m-ink/65">এই মর্মে প্রত্যয়ন করা হচ্ছে যে</p>
                <p className="mt-1 text-xl font-bold text-m-ink">আপনার নাম</p>
                <p className="mt-3 text-sm text-m-ink/65">প্যানেল ইন্টারভিউয়ে উত্তীর্ণ হয়েছেন</p>
                <p className="mt-1 font-bold text-m-ink">{course.title}</p>
                <div className="mt-5 flex items-end justify-between gap-3 border-t border-m-ink/8 pt-4">
                  <span className="font-mono text-xs font-semibold text-m-blue">KTA-2026-{course.id.replace("-", "")}-····</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-m-green">
                    <BadgeCheck className="size-4" aria-hidden /> যাচাইযোগ্য
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Build toward the department: its other courses. */}
        {siblings.length > 0 && (
          <section aria-labelledby="more-courses" className={`${WRAP} pt-16`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="more-courses" className={H2}>
                  {dept.name} বিভাগে আরও কোর্স
                </h2>
                <p className="mt-1 text-[15px] text-m-ink/70">প্রতি বিভাগে তিনটি কোর্স — একটার পর একটা নিয়ে পুরো দক্ষতা গড়ুন।</p>
              </div>
              <Link href={`/media/academy/dept/${dept.id}`} className={mediaButton({ variant: "outline", size: "sm" })}>
                বিভাগ দেখুন
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((c) => (
                <li key={c.id}>
                  <PlusCourseCard course={c} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ratings, then learners' own words. */}
        <section id="reviews" aria-labelledby="reviews-title" className={`${WRAP} scroll-mt-32 pt-16`}>
          <h2 id="reviews-title" className={H2}>
            শিক্ষার্থীদের রিভিউ
          </h2>
          <div className="mt-6 grid gap-6 rounded-2xl bg-white p-6 shadow-m-tile ring-1 ring-m-ink/8 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10">
            {record.rating.count > 0 ? (
              <div className="text-center sm:text-left">
                <p className="text-5xl leading-none font-bold text-m-ink">
                  <Num value={record.rating.avg} decimals={1} />
                </p>
                <p className="mt-2 flex justify-center gap-0.5 sm:justify-start" aria-label={`৫-এ ${record.rating.avg}`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("size-5", n <= Math.round(record.rating.avg) ? "fill-m-yellow text-m-gold" : "text-m-ink/25")} aria-hidden />
                  ))}
                </p>
                <p className="mt-1 text-sm text-m-ink/65">
                  <Compact n={record.rating.count} />টি রেটিং
                </p>
              </div>
            ) : (
              <p className="text-sm text-m-ink/70">এখনো রেটিং নেই</p>
            )}
            <p className="text-[15px] leading-relaxed text-m-ink/80">
              এটা {teacher.nameBn}-এর সব ক্লাসের মিলিত রেটিং। শিক্ষকের পয়েন্ট আসে প্যানেলের নম্বর, রেটিং, গ্র্যাজুয়েট আর সাফল্যের গল্প থেকে; প্রতিটি প্রমাণিত অভিযোগে ১০ পয়েন্ট কাটা যায়।
            </p>
          </div>
        </section>
        {voices.length > 0 ? (
          <Voices voices={voices} title="শিক্ষার্থীরা যা বলেন" className={`${WRAP} pt-10`} />
        ) : (
          <p className={`${WRAP} pt-6 text-sm text-m-ink/65`}>এই শিক্ষকের কোর্স থেকে এখনো লিখিত মতামত আসেনি।</p>
        )}

        <Faq items={faq} title="প্রায়ই যা জানতে চান" align="start" className={`${WRAP} scroll-mt-32 pt-16`} />

        {/* The last call. */}
        <section aria-labelledby="last-call" className={`${WRAP} pt-16`}>
          <div className="blue-band flex flex-col items-start justify-between gap-6 rounded-3xl p-7 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 id="last-call" className="text-[clamp(1.4rem,2.6vw,1.85rem)] leading-tight font-bold text-balance">
                <Num value={COURSE_DAYS} /> দিনে শিখুন, প্যানেলের সামনে প্রমাণ দিন
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-white/85">
                <CalendarDays className="size-4.5" aria-hidden /> ব্যাচ শুরু <DateText iso={course.starts} /> · <Num value={left} />টি আসন বাকি
              </p>
            </div>
            <div className="shrink-0 rounded-2xl bg-white p-2">
              <EnrollCta course={course} />
            </div>
          </div>
        </section>
      </div>

      <DeptFooter />
    </>
  );
}

/** One cell of the numbers card: a big line and a small one. */
function Stat({ big, small }: { big: React.ReactNode; small: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="order-2 mt-1 text-sm text-m-ink/65">{small}</dt>
      <dd className="order-1 text-lg leading-snug font-bold text-m-ink">{big}</dd>
    </div>
  );
}

function Detail({ Icon, title, body }: { Icon: typeof Award; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-m-blue-soft text-m-blue">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <span>
        <span className="block font-bold text-m-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-m-ink/70">{body}</span>
      </span>
    </li>
  );
}

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-m-ink/60">{k}</dt>
      <dd className="mt-1 flex items-center gap-1.5 font-bold text-m-ink">{v}</dd>
    </div>
  );
}

/** A course paper as a card: what it is, its file, and a download or a link. */
function Paper({ Icon, title, meta, href, file, link }: { Icon: typeof Award; title: string; meta: string; href?: string; file?: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8">
      <span className="grid size-11 place-items-center rounded-xl bg-m-amber-soft text-m-gold">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <p className="mt-4 font-bold text-m-ink">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-m-ink/65">{meta}</p>
      <div className="mt-auto pt-4">
        {href ? (
          <a href={href} download={file} className={mediaButton({ variant: "outline", size: "sm" })}>
            নামান
          </a>
        ) : link ? (
          <Link href={link.href} className={mediaButton({ variant: "outline", size: "sm" })}>
            {link.label}
          </Link>
        ) : (
          <span className="text-xs text-m-ink/55">শিক্ষক শিগগির যোগ করবেন</span>
        )}
      </div>
    </div>
  );
}
