import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, CalendarDays, CalendarRange, Clock3, FileText, FileVideo, Languages, MapPin, MessageCircleQuestion, Play, Quote, ShieldCheck, Star, Users } from "lucide-react";
import { board, deptShort, departments, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, LEVELS, MIN_ATTENDANCE, MODES, TIERS, courseTimeline, type Course, type Department, type Mode, watchHref } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Compact, DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { AssetCard, AssetGrid } from "../catalogue/asset-card";
import { Band, BandTitle, Lean, Turn, twoDigits } from "../catalogue/band";
import { blockBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CourseCard } from "../catalogue/course-card";
import { courseEntries } from "../catalogue/entries";
import { fillRow, lineupGrid } from "../catalogue/fill-row";
import { CatalogueRuler } from "../catalogue/ruler";
import { ShareRow } from "../catalogue/share-row";
import { toneStyle } from "../catalogue/tones";
import { ComplaintBox } from "../complaint-box";
import { CourseFinal, CourseProgress, CourseWeeks, EnrollCta } from "../course-desk";
import { CourseMaterials } from "../course-materials";
import { RememberCourse } from "../departments/recent";
import { modesOf, standingOf } from "../parts";
import { courseFaq } from "./course-faq";

/** Skills as tags, from the lesson titles: "ভাত, পোলাও, বিরিয়ানি" gives three. */
function skillsOf(course: Course): string[] {
  const parts = course.lessons.flatMap((l) => l.title.split(/\s+—\s+|,\s*|\s+ও\s+|\s+আর\s+|:\s*/));
  return [...new Set(parts.map((p) => p.trim()).filter((p) => p.length > 1))].slice(0, 12);
}

/** What the course teaches, grouped the way it is taught, then the final project. */
function learnOf(course: Course): { head?: string; body: string }[] {
  const byMode = (Object.keys(MODES) as Mode[])
    .map((m) => ({
      head: MODES[m],
      body: course.lessons
        .filter((l) => l.mode === m)
        .map((l) => l.title)
        .join("; "),
    }))
    .filter((x) => x.body);
  return [{ body: course.outcome }, ...byMode, { head: "ফাইনাল প্রজেক্ট", body: course.final }];
}

/**
 * কোর্স — one course, step four of the road, in the catalogue's bands: the
 * course and the big enrol button, its numbers; what you will learn; the
 * weeks (with the learner's own progress, homework and final once enrolled)
 * and its papers; the teacher and the complaint box; the certificate; the
 * department's other courses; ratings and learners' words; questions; and
 * the last call.
 */
export function CourseView({ course, dept }: { course: Course; dept: Department }) {
  const tone = departments.findIndex((d) => d.id === dept.id);
  const teacher = personOrThrow(course.teacher);
  const record = teacherRecord(course.teacher)!;
  const { points, tier } = standingOf(record);
  const timeline = courseTimeline(course.starts);
  const short = deptShort(dept.id);
  const team = [...new Set(course.lessons.map((l) => l.by).filter((h): h is string => Boolean(h) && h !== course.teacher))].map(personOrThrow);
  const siblings = courseEntries([dept.id]).filter((e) => e.course.id !== course.id);
  const left = Math.max(0, course.seats - course.enrolled);
  const [head, tail] = course.title.split(" — ");
  const voices = record.stories.map((st) => ({ ...st, certificate: board.find((b) => b.learner === st.name && b.certificate)?.certificate }));
  const faq = courseFaq(course, dept);

  const stats = [
    {
      big: (
        <>
          <Num value={course.lessons.length} /> সপ্তাহের পাঠ
        </>
      ),
      small: "তারপর প্রজেক্ট ও প্যানেল",
    },
    record.rating.count > 0
      ? {
          big: (
            <span className="inline-flex items-center gap-2">
              <Num value={record.rating.avg} decimals={1} />
              <Star className="size-5 fill-(--c-signal) text-(--c-signal)" aria-hidden />
            </span>
          ),
          small: (
            <>
              <Compact n={record.rating.count} />
              টি রেটিং
            </>
          ),
        }
      : { big: "নতুন শিক্ষক", small: "এখনো রেটিং নেই" },
    { big: <>{LEVELS[course.level]} স্তর</>, small: "যেখানে আছেন, সেখান থেকে" },
    {
      big: (
        <>
          <Num value={COURSE_DAYS} /> দিনে শেষ
        </>
      ),
      small: (
        <>
          <DateText iso={course.starts} /> – <DateText iso={timeline.ends} />
        </>
      ),
    },
    {
      big: (
        <>
          <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস
        </>
      ),
      small: modesOf(course)
        .map((m) => MODES[m])
        .join(" · "),
    },
  ];

  const details = [
    { Icon: Award, title: "যাচাইযোগ্য সনদ", body: "পাস করলে নাম ওঠে প্রকাশ্য বোর্ডে" },
    { Icon: Languages, title: "বাংলায় পড়ানো হয়", body: "ক্লাস আর উপকরণ বাংলায়" },
    {
      Icon: Clock3,
      title: "মূল্যায়ন",
      body: (
        <>
          সাপ্তাহিক হোমওয়ার্ক, অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা, শেষে প্যানেল
        </>
      ),
    },
    dept.place
      ? { Icon: MapPin, title: "হাতে-কলমের জায়গা", body: dept.place }
      : {
          Icon: Users,
          title: "ছোট ব্যাচ",
          body: (
            <>
              এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন
            </>
          ),
        },
  ];

  const papers = [
    { Icon: FileText, title: "সিলেবাস", meta: `${course.syllabus.title} · ${course.syllabus.size}`, file: course.syllabus },
    { Icon: CalendarRange, title: "কাজের ক্যালেন্ডার", meta: `${course.calendar.title} · ${course.calendar.size}`, file: course.calendar },
  ];

  return (
    <CatalogueRoot className="min-h-full">
      <RememberCourse id={course.id} />
      <CatalogueNav />
      <CatalogueRuler />

      <Band
        id="intro"
        n={1}
        label="কোর্স"
        now
        note={
          <>
            {dept.name} বিভাগ · {dept.academy.name}
          </>
        }
      >
        <div style={toneStyle(tone)} className="tone grid gap-14 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <nav aria-label="অবস্থান" data-reveal data-in className="hud flex flex-wrap items-center gap-2 text-(--c-faint)">
              <Link href="/media/academy/courses" className="transition-colors hover:text-(--c-ink-strong)">
                সব কোর্স
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/media/academy/a/${dept.academy.id}`} className="transition-colors hover:text-(--c-ink-strong)">
                {dept.academy.name}
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/media/academy/dept/${dept.id}`} className="transition-colors hover:text-(--c-ink-strong)">
                {dept.name}
              </Link>
              <span aria-hidden>/</span>
              <span aria-current="page" className="font-mono tracking-[0.08em] text-(--c-muted)">
                {course.id}
              </span>
            </nav>
            <p data-reveal data-in className="hud mt-8 flex flex-wrap gap-2">
              <span className="bg-(--c-app) px-2 py-0.5 font-bold text-black">{LEVELS[course.level]}</span>
              <span className="border border-(--c-line) px-2 py-0.5 text-(--c-app-ink)">{DEPT_KINDS[dept.kind]}</span>
            </p>
            <BandTitle as="h1" now className="mt-5 text-4xl sm:text-5xl lg:text-[3.3rem]">
              {tail ? (
                <>
                  {head} — <Turn>{tail}</Turn>
                </>
              ) : (
                <>
                  {head.slice(0, head.lastIndexOf(" ") + 1)}
                  <Turn>{head.slice(head.lastIndexOf(" ") + 1)}</Turn>
                </>
              )}
            </BandTitle>
            <p data-reveal data-in className="display mt-6 max-w-xl text-xl leading-snug text-(--c-ink-strong)">
              {course.outcome}
            </p>
            <p data-reveal data-in className="mt-3 max-w-xl leading-relaxed text-(--c-muted)">
              {dept.blurb}
            </p>
            <p data-reveal data-in className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-(--c-muted)">
              শিক্ষক
              <Link href={`/media/academy/teachers/${teacher.handle}`} className="inline-flex items-center gap-2 font-semibold text-(--c-ink-strong) decoration-(--c-app) decoration-2 underline-offset-4 hover:underline">
                <PersonAvatar person={teacher} size="xs" />
                {teacher.nameBn}
              </Link>
              <span className="hud border border-(--c-line) px-1.5 py-px text-(--c-app-ink)">{TIERS[tier]}</span>
              {team.length > 0 && (
                <span>
                  +<Num value={team.length} /> জন সহশিক্ষক
                </span>
              )}
            </p>
            <div data-reveal data-in className="mt-8">
              <EnrollCta course={course} />
            </div>
            <p data-reveal data-in className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--c-muted)">
              <span>
                কোর্স ফি <strong className={cn("display text-lg", course.fee === 0 ? "text-(--c-good)" : "text-(--c-ink-strong)")}>{course.fee === 0 ? "বিনা ফি" : <Taka amount={course.fee} />}</strong>
              </span>
              <span>
                <Num value={course.enrolled} /> জন ভর্তি · <Num value={left} />
                টি আসন বাকি
              </span>
            </p>
            <p data-reveal data-in className="hud mt-2 flex items-center gap-1.5 text-(--c-faint)">
              <ShieldCheck className="size-3.5 text-(--c-good)" aria-hidden /> ফি থাকে এসক্রোতে — ক্লাস হলে তবেই শিক্ষক পান
            </p>
          </div>

          <div data-reveal data-in className="relative">
            <div className="group/frame relative aspect-4/3 overflow-hidden border border-(--c-line) bg-(--c-bg-sunken)">
              <Image src={course.image} alt={course.title} fill priority sizes="(min-width: 1024px) 34rem, 92vw" className="object-cover transition-transform duration-500 group-hover/frame:scale-[1.02] motion-reduce:transition-none" />
              {short && (
                <Link href={watchHref(short)} className="hud absolute bottom-3 left-3 flex items-center gap-2 bg-(--c-invert-bg) px-3 py-1.5 font-bold text-(--c-invert-fg) transition-opacity duration-150 hover:opacity-80">
                  <Play className="size-3.5 fill-current" aria-hidden />
                  বিভাগের শর্ট দেখুন
                </Link>
              )}
            </div>
            <ShareRow text={`${course.title} — ${dept.academy.name}`} className="mt-4" />
          </div>
        </div>

        <dl data-reveal-group className="grid grid-cols-2 gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <div key={i} data-reveal className="flex flex-col-reverse bg-(--c-bg) px-6 py-6 last:col-span-2 md:last:col-span-1">
              <dt className="hud mt-2 text-(--c-faint)">{s.small}</dt>
              <dd className="display text-xl leading-snug text-(--c-ink-strong)">{s.big}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Band id="about" n={2} label="পরিচিতি" note="যা শিখবেন, যে দক্ষতা পাবেন">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            যা <Lean>শিখবেন</Lean>।
          </BandTitle>
        </div>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-2">
          {learnOf(course).map((item, i) => (
            <li key={i} data-reveal className="flex gap-4 bg-(--c-bg) p-6 md:px-10">
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-(--c-good)" aria-hidden />
              <p className="leading-relaxed text-(--c-ink)">
                {item.head && <span className="hud mb-1 block text-(--c-faint)">{item.head}</span>}
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t border-(--c-line) px-6 py-8 md:px-10">
          <p className="hud text-(--c-faint)">যে দক্ষতা পাবেন</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {skillsOf(course).map((s) => (
              <li key={s} className="border border-(--c-line) bg-(--c-bg-sunken) px-2.5 py-1 text-sm text-(--c-ink)">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 lg:grid-cols-4">
          {details.map(({ Icon, title, body }, i) => (
            <li key={i} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-10 items-center justify-center border border-(--c-line) text-(--c-accent-ink)">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <h3 className="display mt-6 text-lg text-(--c-ink-strong)">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{body}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band
        id="curriculum"
        n={3}
        label="পাঠক্রম"
        note={
          <>
            {course.id} · {DEPT_KINDS[dept.kind]}
          </>
        }
      >
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            <Num value={course.lessons.length} /> সপ্তাহ আর <Turn>প্রজেক্ট</Turn>।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, সঙ্গে হোমওয়ার্ক। শেষ কয়েক দিন নিজের প্রজেক্ট বানিয়ে প্যানেলের সামনে দেখান। প্রতিটি সপ্তাহ খুলে দেখুন কে পড়াবেন, কোথায়, কী করতে হবে।
          </p>
        </div>
        <CourseProgress course={course} />
        <CourseWeeks course={course} />
        <CourseFinal course={course} />
        <div className="grid gap-px border-t border-(--c-line) bg-(--c-line) lg:grid-cols-3">
          {papers.map(({ Icon, title, meta, file }) => (
            <div key={title} className="flex flex-col bg-(--c-bg) p-6 md:p-8">
              <span className="flex size-10 items-center justify-center bg-(--c-signal) text-black">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="display mt-6 text-lg text-(--c-ink-strong)">{title}</h3>
              <p className="hud mt-1.5 line-clamp-2 text-(--c-faint)">{meta}</p>
              <div className="mt-auto pt-6">
                {file.href ? (
                  <a href={file.href} download={file.file} className={blockBtn}>
                    নামান
                  </a>
                ) : (
                  <p className="hud text-(--c-faint)">শিক্ষক শিগগির যোগ করবেন</p>
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-col bg-(--c-bg) p-6 md:p-8">
            <span className="flex size-10 items-center justify-center bg-(--c-signal) text-black">
              <FileVideo className="size-5" aria-hidden />
            </span>
            <h3 className="display mt-6 text-lg text-(--c-ink-strong)">প্রোমো ভিডিও</h3>
            <p className="hud mt-1.5 text-(--c-faint)">পুরো কোর্স আড়াই মিনিটে</p>
            <div className="mt-auto pt-6">
              {short ? (
                <Link href={watchHref(short)} className={blockBtn}>
                  শর্ট দেখুন
                </Link>
              ) : (
                <p className="hud text-(--c-faint)">শিক্ষক শিগগির যোগ করবেন</p>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-(--c-line) px-6 py-8 md:px-10">
          <p className="hud mb-4 text-(--c-faint)">উপকরণ</p>
          <CourseMaterials course={course} />
        </div>
      </Band>

      <Band id="teacher" n={4} label="শিক্ষক" note="প্যানেল ইন্টারভিউ পেরিয়ে আসা">
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="bg-(--c-bg) p-6 md:p-10">
            <Link href={`/media/academy/teachers/${teacher.handle}`} className="group flex items-center gap-5">
              <PersonAvatar person={teacher} size="lg" className="ring-2 ring-(--c-line-strong)" />
              <span className="min-w-0">
                <span className="display block text-2xl text-(--c-ink-strong) decoration-(--c-signal) decoration-2 underline-offset-4 group-hover:underline">{teacher.nameBn}</span>
                <span className="mt-1 block text-sm text-(--c-muted)">{record.title}</span>
              </span>
            </Link>
            <dl className="mt-8 grid grid-cols-2 gap-px border border-(--c-line) bg-(--c-line) sm:grid-cols-4">
              {[
                { k: "পয়েন্ট", v: <Num value={points.total} />, sub: TIERS[tier] },
                { k: "গ্র্যাজুয়েট", v: <Num value={record.graduates} />, sub: "জন পাস" },
                {
                  k: "প্যানেল ইন্টারভিউ",
                  v: (
                    <>
                      <Num value={record.interview.score} />/<Num value={100} />
                    </>
                  ),
                  sub: "শিক্ষক হওয়ার সময়",
                },
                {
                  k: "প্রমাণিত অভিযোগ",
                  v: (
                    <span className={record.complaints.upheld === 0 ? "text-(--c-good)" : "text-(--c-bad)"}>
                      <Num value={record.complaints.upheld} />
                    </span>
                  ),
                  sub: "প্রতিটিতে ১০ পয়েন্ট কাটা",
                },
              ].map((f) => (
                <div key={f.k} className="flex flex-col-reverse bg-(--c-bg) p-4">
                  <dt className="hud mt-2 text-(--c-faint)">
                    {f.k}
                    <span className="block opacity-70">{f.sub}</span>
                  </dt>
                  <dd className="display text-3xl leading-none text-(--c-ink-strong)">{f.v}</dd>
                </div>
              ))}
            </dl>
            {team.length > 0 && (
              <div className="mt-8">
                <p className="hud text-(--c-faint)">দলের অন্য শিক্ষক — প্রত্যেকে আলাদা বিষয় পড়ান</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {team.map((p) => (
                    <li key={p.handle}>
                      <Link
                        href={`/media/academy/teachers/${p.handle}`}
                        className="flex items-center gap-2 border border-(--c-line) py-1 pr-3 pl-1 text-sm font-semibold text-(--c-ink) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                      >
                        <PersonAvatar person={p} size="sm" /> {p.nameBn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="bg-(--c-bg) p-6 md:p-10">
            <p className="hud text-(--c-faint)">কিছু বলার আছে?</p>
            <h3 className="display mt-3 text-xl text-(--c-ink-strong)">নাম গোপন থাকে।</h3>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-(--c-muted)">শিক্ষক আপনার নাম দেখেন না; প্যানেল খতিয়ে দেখে, দুই পক্ষের কথা শোনে।</p>
            <ComplaintBox teacher={teacher.handle} teacherName={teacher.nameBn} course={course.id} />
          </div>
        </div>
      </Band>

      <Band id="certificate" n={5} label="সনদ" note="প্রকাশ্য বোর্ডে মিলিয়ে দেখা যায়">
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-2">
          <div className="bg-(--c-bg) px-6 py-14 md:px-10 md:py-20">
            <BandTitle className="text-4xl sm:text-5xl md:text-5xl">
              যাচাইযোগ্য <Turn>সনদ</Turn>।
            </BandTitle>
            <p data-reveal className="mt-5 max-w-lg leading-relaxed text-(--c-muted)">
              পাস করলে সনদের আইডি নিয়োগকর্তাকে দিন — প্রকাশ্য বোর্ডে নাম, কোর্স আর দুই পরীক্ষকের নম্বর মিলিয়ে দেখা যায়।
            </p>
            <ul data-reveal className="mt-8 border-t border-(--c-line)">
              {["দুই পরীক্ষক আলাদা নম্বর দেন — একজন বাইরের পেশাদার", "২০-এর বেশি ফারাক হলে তৃতীয় পরীক্ষক ডাকা হয়", "ফেল করলে ফল গোপন, ৩০ দিন পর আবার"].map((t) => (
                <li key={t} className="flex gap-3 border-b border-(--c-line) py-3 text-(--c-ink)">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-(--c-accent-ink)" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/media/academy/exam#board" className={cn(blockBtn, "mt-8")}>
              প্রকাশ্য বোর্ড দেখুন
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid place-items-center bg-(--c-bg-sunken) px-6 py-14 md:px-10">
            <div data-reveal className="w-full max-w-md border border-(--c-line-strong) bg-(--c-bg) p-7">
              <span aria-hidden className="block h-1 w-full bg-(--c-signal)" />
              <p className="hud mt-5 flex items-center justify-between">
                <span className="text-(--c-accent-ink)">কাণ্ডারী তৈরি একাডেমি</span>
                <span className="border border-(--c-line) px-1.5 text-(--c-faint)">নমুনা</span>
              </p>
              <p className="mt-6 text-sm text-(--c-muted)">এই মর্মে প্রত্যয়ন করা হচ্ছে যে</p>
              <p className="turn mt-1 text-3xl">আপনার নাম</p>
              <p className="mt-4 text-sm text-(--c-muted)">প্যানেল ইন্টারভিউয়ে উত্তীর্ণ হয়েছেন</p>
              <p className="display mt-1 text-lg text-(--c-ink-strong)">{course.title}</p>
              <div className="mt-6 flex items-end justify-between gap-3 border-t border-(--c-line) pt-4">
                <span className="hud font-mono text-(--c-accent-ink)">KTA-2026-{course.id.replace("-", "")}-····</span>
                <span className="hud flex items-center gap-1 font-bold text-(--c-good)">
                  <BadgeCheck className="size-4" aria-hidden /> যাচাইযোগ্য
                </span>
              </div>
            </div>
          </div>
        </div>
      </Band>

      {siblings.length > 0 && (
        <Band id="more" n={6} label="আরও কোর্স" note={`${dept.name} বিভাগে`}>
          <div className="@container">
            <div data-reveal-group className={lineupGrid}>
              {siblings.map((entry, i) => (
                <CourseCard key={entry.course.id} entry={entry} n={i + 1} />
              ))}
              <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(siblings.length))}>
                <p className="hud text-(--c-faint)">পুরো দক্ষতা</p>
                <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                  একটার পর <Lean>একটা</Lean>।
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">প্রতি বিভাগে তিনটি কোর্স — একটার পর একটা নিয়ে পুরো দক্ষতা গড়ুন।</p>
                <div className="mt-auto pt-8">
                  <Link href={`/media/academy/dept/${dept.id}`} className={blockBtn}>
                    বিভাগ দেখুন
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Band>
      )}

      <Band id="reviews" n={siblings.length > 0 ? 7 : 6} label="রিভিউ" note="শিক্ষকের সব ক্লাসের মিলিত রেটিং">
        <div className="grid gap-px bg-(--c-line) md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="bg-(--c-bg) p-6 md:p-10">
            {record.rating.count > 0 ? (
              <>
                <p className="display text-7xl leading-none text-(--c-ink-strong)">
                  <Num value={record.rating.avg} decimals={1} />
                </p>
                <p className="mt-3 flex gap-0.5" aria-label={`৫-এ ${record.rating.avg}`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("size-5", n <= Math.round(record.rating.avg) ? "fill-(--c-signal) text-(--c-signal)" : "text-(--c-line-strong)")} aria-hidden />
                  ))}
                </p>
                <p className="hud mt-2 text-(--c-faint)">
                  <Compact n={record.rating.count} />
                  টি রেটিং
                </p>
              </>
            ) : (
              <p className="text-(--c-muted)">এখনো রেটিং নেই</p>
            )}
          </div>
          <p className="bg-(--c-bg) p-6 leading-relaxed text-(--c-muted) md:p-10">
            এটা {teacher.nameBn}-এর সব ক্লাসের মিলিত রেটিং। শিক্ষকের পয়েন্ট আসে প্যানেলের নম্বর, রেটিং, গ্র্যাজুয়েট আর সাফল্যের গল্প থেকে; প্রতিটি প্রমাণিত অভিযোগে ১০ পয়েন্ট কাটা যায়।
          </p>
        </div>
        {voices.length > 0 ? (
          <div className="border-t border-(--c-line)">
            <AssetGrid count={voices.length}>
              {voices.map((v, i) => (
                <li key={v.name} className="bg-(--c-bg)">
                  <AssetCard
                    kind={{ icon: Quote, label: "শিক্ষার্থীর কথা" }}
                    n={i + 1}
                    title={v.name}
                    text={<p className="text-base text-(--c-ink)">“{v.text}”</p>}
                    extra={
                      <p className="hud mt-4 flex flex-wrap gap-x-3 text-(--c-faint)">
                        <span>
                          {dept.name} · শিক্ষক {teacher.nameBn}
                        </span>
                        {v.certificate && <span className="font-mono text-(--c-accent-ink)">{v.certificate}</span>}
                      </p>
                    }
                    action={v.certificate ? { href: "/media/academy/exam#board", label: "প্রকাশ্য বোর্ডে দেখুন", icon: ArrowUpRight } : undefined}
                  />
                </li>
              ))}
            </AssetGrid>
          </div>
        ) : (
          <p className="hud border-t border-(--c-line) px-6 py-5 text-(--c-faint) md:px-10">এই শিক্ষকের কোর্স থেকে এখনো লিখিত মতামত আসেনি।</p>
        )}
      </Band>

      <Band id="faq" n={siblings.length > 0 ? 8 : 7} label="প্রশ্ন" note="প্রায়ই যা জানতে চান">
        <AssetGrid count={faq.length}>
          {faq.map((qa, i) => (
            <li key={qa.q} className="bg-(--c-bg)">
              <AssetCard kind={{ icon: MessageCircleQuestion, label: "প্রশ্ন" }} n={i + 1} title={qa.q} text={<p>{qa.a}</p>} />
            </li>
          ))}
        </AssetGrid>
      </Band>

      <Band id="start" rulerLabel="শুরু করুন">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud flex items-center gap-2 text-(--c-faint)">
            <CalendarDays className="size-3.5" aria-hidden />
            ব্যাচ শুরু <DateText iso={course.starts} /> · <Num value={left} />
            টি আসন বাকি
          </p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            <Num value={COURSE_DAYS} /> দিনে শিখুন, প্যানেলের সামনে <Turn>প্রমাণ</Turn> দিন।
          </BandTitle>
          <div className="mt-10 flex justify-center">
            <EnrollCta course={course} />
          </div>
        </div>
      </Band>

    </CatalogueRoot>
  );
}
