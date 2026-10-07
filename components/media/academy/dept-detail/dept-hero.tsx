"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, CalendarRange, ChevronRight, Clock3, House, Layers3, MapPin, Play, UserRound, UsersRound, Wallet, Wifi } from "lucide-react";
import { coursesOf, deptLikes, deptShort, teacherRecord } from "@/data/media/academy";
import { currentUser, personOrThrow } from "@/data/media/users";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_COURSES, DEPT_KINDS, SCHOOLS, durationText, type ClassVideo, type Department } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num, Taka, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { useAcademy } from "../use-academy";
import { watchHref } from "../videos/video-card";
import { AcademyMediaEditor } from "./academy-media";

const ease = [0.22, 1, 0.36, 1] as const;

/** The skills the department's teachers had verified by the community, most-rated first. */
export function skillsOf(dept: Department): string[] {
  const all = dept.teachers.flatMap((h) => personOrThrow(h).skills).sort((a, b) => b.raters - a.raters);
  return [...new Set(all.map((s) => s.skill))].slice(0, 8);
}

/**
 * The top of a department is its academy: the team photo behind (or the
 * members gathered, until the academy puts one up), the logo, the academy's
 * name as the title and its line about itself under it, and a play button
 * that opens the department's short. Members can change the photo and logo.
 * Under it, who the department suits, then the facts and the rules.
 */
export function DeptHero({ dept }: { dept: Department }) {
  const hydrated = useHydrated();
  const media = useAcademy((a) => a.academyMedia[dept.id]);
  const photo = hydrated ? media?.photo : undefined;
  const logo = hydrated ? media?.logo : undefined;
  const member = hydrated && dept.teachers.includes(currentUser.handle);
  const short = deptShort(dept.id);
  const reduce = useReducedMotion();
  const rise = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } });

  return (
    <>
      <section aria-labelledby="dept-title" className="relative -mx-3 overflow-hidden border-b border-m-ink/10 bg-m-blue-soft sm:-mx-6">
        {photo ? (
          <>
            <Image src={photo} alt="" fill unoptimized priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-white/90" aria-hidden />
          </>
        ) : (
          <Fans />
        )}

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-3 py-8 sm:px-6 lg:min-h-[30rem] lg:grid-cols-[minmax(0,1fr)_16rem] lg:py-12">
          <div className="min-w-0">
            <nav aria-label="পথ" className="flex flex-wrap items-center gap-2 text-sm text-m-ink/80">
              <Link href="/media/academy" className="hover:text-m-ink">
                <House className="size-4.5" aria-hidden />
                <span className="sr-only">একাডেমি</span>
              </Link>
              <ChevronRight className="size-4 text-m-ink/50" aria-hidden />
              <Link href="/media/academy/departments" className="hover:text-m-ink">
                বিভাগ
              </Link>
              <ChevronRight className="size-4 text-m-ink/50" aria-hidden />
              <span aria-current="page" className="text-m-ink">
                {dept.name}
              </span>
            </nav>

            <motion.div {...rise(0)} className="mt-6 flex items-center gap-4">
              <span className="relative grid size-18 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-m-tile ring-4 ring-white/40 sm:size-20">
                {logo ? <Image src={logo} alt={`${dept.academy.name}-এর লোগো`} fill unoptimized sizes="80px" className="object-contain p-1.5" /> : <DeptIcon dept={dept.id} school={dept.school} className="size-[72%]" />}
              </span>
              <span className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-m-yellow px-2.5 py-0.5 text-xs font-bold text-m-ink">
                  {dept.kind === "team" ? <UsersRound className="size-3.5" aria-hidden /> : <UserRound className="size-3.5" aria-hidden />}
                  {DEPT_KINDS[dept.kind]} · <Num value={dept.teachers.length} /> জন
                </span>
                <span className="mt-1.5 block text-sm font-semibold text-m-ink/85">
                  বিভাগ: <span className="text-m-ink">{dept.name}</span> · {SCHOOLS[dept.school]}
                </span>
              </span>
            </motion.div>

            <motion.h1 {...rise(0.08)} id="dept-title" className="mt-5 text-3xl leading-tight font-bold text-balance text-m-ink sm:text-5xl">
              {dept.academy.name}
            </motion.h1>
            <motion.p {...rise(0.16)} className="mt-4 max-w-2xl text-lg leading-relaxed text-m-ink/90">
              {dept.academy.about}
            </motion.p>

            <motion.div {...rise(0.22)} className="mt-5 flex flex-wrap items-center gap-3">
              <span className="flex -space-x-2">
                {dept.teachers.map((h) => (
                  <Link key={h} href={`/media/academy/teachers/${h}`} aria-label={`${personOrThrow(h).nameBn}-এর চ্যানেল`} className="rounded-full hover:z-10">
                    <PersonAvatar person={personOrThrow(h)} className="ring-2 ring-white" />
                  </Link>
                ))}
              </span>
              <span className="text-sm text-m-ink/85">{dept.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</span>
            </motion.div>

            <motion.div {...rise(0.28)} className="mt-7 flex flex-wrap gap-3">
              <a href="#join" className={mediaButton()}>
                ভর্তি হোন
              </a>
              <a href="#all-courses" className={mediaButton({ variant: "outline", className: "bg-white/65" })}>
                কোর্স দেখুন
              </a>
              {dept.kind === "team" && (
                <Link href={`/media/academy/teach?dept=${dept.id}`} className={mediaButton({ variant: "quiet" })}>
                  দলে শেখান
                </Link>
              )}
            </motion.div>
          </div>

          <div className="flex flex-col items-start gap-5 lg:items-center">
            {!photo && <MemberGroup dept={dept} />}
            {short && <PlayShort video={short} />}
            {member && <AcademyMediaEditor dept={dept} hasPhoto={Boolean(photo)} hasLogo={Boolean(logo)} />}
          </div>
        </div>
      </section>
      <DeptIntro dept={dept} />
      <Glance dept={dept} />
    </>
  );
}

/** The ground behind the hero until the academy puts up its photo: two fans opening from the lower right. */
function Fans() {
  return (
    <svg viewBox="0 0 520 440" preserveAspectRatio="xMaxYMax slice" className="absolute inset-y-0 right-0 hidden h-full w-3/5 lg:block" aria-hidden>
      <path d="M520 440 L520 40 A400 400 0 0 0 150 440 Z" className="fill-m-blue" />
      <path d="M520 440 L520 210 A230 230 0 0 0 300 440 Z" className="fill-m-yellow" />
    </svg>
  );
}

/** Until the academy puts up its photo: the members standing together, as a group photo would show them. */
function MemberGroup({ dept }: { dept: Department }) {
  const reduce = useReducedMotion();
  const team = dept.teachers.slice(0, 4);
  // Biggest in the middle, the rest to the sides and a step back.
  const spots = team.length === 1 ? [{ x: 0, y: 0, s: "size-32 text-4xl" }] : [
    { x: 0, y: 0, s: "size-28 text-4xl" },
    { x: -78, y: 22, s: "size-22 text-2xl" },
    { x: 78, y: 22, s: "size-22 text-2xl" },
    { x: 0, y: 92, s: "size-18 text-xl" },
  ].slice(0, team.length);
  return (
    <div className="relative hidden h-44 w-64 lg:block" aria-hidden>
      {team.map((h, i) => (
        <motion.span
          key={h}
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{ zIndex: i === 3 ? 20 : 10 - i, marginLeft: spots[i].x }}
          initial={reduce ? false : { opacity: 0, y: spots[i].y + 16 }}
          animate={{ opacity: 1, y: spots[i].y }}
          transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease }}
        >
          <PersonAvatar person={personOrThrow(h)} className={cn(spots[i].s, "ring-6 ring-m-blue-soft")} />
        </motion.span>
      ))}
    </div>
  );
}

/** The video icon: a big play button that opens the department's short in the class videos. */
function PlayShort({ video }: { video: ClassVideo }) {
  const reduce = useReducedMotion();
  const { num } = useFormat();
  return (
    <Link href={watchHref(video)} className="group flex items-center gap-4 rounded-full focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-m-blue lg:flex-col lg:gap-3 lg:text-center">
      <span className="relative grid size-20 place-items-center rounded-full bg-m-yellow text-m-ink shadow-m-tile transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:size-24">
        {!reduce && <motion.span className="absolute inset-0 rounded-full ring-4 ring-m-blue" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} aria-hidden />}
        <Play className="ml-1 size-9 fill-m-ink sm:size-10" aria-hidden />
      </span>
      <span className="min-w-0 rounded-2xl bg-white/90 px-3.5 py-1.5 ring-1 ring-m-ink/13">
        <span className="block font-bold text-m-ink">পরিচিতি ভিডিও</span>
        <span className="block text-sm text-m-ink/80">শর্ট · {num(durationText(video.seconds))}</span>
      </span>
    </Link>
  );
}

/** Who the department suits, what it is and the skills it builds — right under the academy. */
function DeptIntro({ dept }: { dept: Department }) {
  return (
    <section aria-label="বিভাগ পরিচিতি" className="mx-auto mt-8 grid max-w-7xl gap-4 lg:grid-cols-2">
      <p className="text-lg leading-snug font-bold text-m-ink">যদি আপনি {deptLikes[dept.id]} ভালোবাসেন — এই বিভাগ আপনার জন্য।</p>
      <div>
        <p className="leading-relaxed text-m-ink/80">{dept.blurb}</p>
        <p className="mt-2 text-sm leading-relaxed text-m-ink/80">
          <span className="font-bold text-m-ink">যে দক্ষতা গড়বেন:</span> {skillsOf(dept).join(", ")}
        </p>
      </div>
    </section>
  );
}

/** Who teaches, where classes happen, what it costs, what you leave with. */
function Glance({ dept }: { dept: Department }) {
  const fees = coursesOf(dept.id).map((c) => c.fee);
  const low = fees.length ? Math.min(...fees) : 0;
  const high = fees.length ? Math.max(...fees) : 0;
  const graduates = dept.teachers.reduce((n, h) => n + (teacherRecord(h)?.graduates ?? 0), 0);
  const cell = "bg-m-canvas p-5";
  const head = "text-xs font-bold text-m-blue";
  return (
    <>
    <section aria-label="এক নজরে" className="mx-auto mt-6 grid max-w-7xl gap-px overflow-hidden rounded-2xl bg-m-ink/7 ring-1 ring-m-ink/10 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cell}>
        <p className={head}>কারা শেখান</p>
        <div className="mt-3 flex -space-x-2">
          {dept.teachers.map((h) => (
            <Link key={h} href={`/media/academy/teachers/${h}`} aria-label={`${personOrThrow(h).nameBn}-এর চ্যানেল`} className="rounded-full hover:z-10">
              <PersonAvatar person={personOrThrow(h)} className="ring-2 ring-white" />
            </Link>
          ))}
        </div>
        <p className="mt-2 text-sm text-m-ink/85">{dept.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</p>
        <p className="text-xs text-m-ink/65">
          {DEPT_KINDS[dept.kind]} · {SCHOOLS[dept.school]}
        </p>
      </div>
      <div className={cell}>
        <p className={head}>ক্লাস কোথায়</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-m-ink/90">
          <Wifi className="size-4 shrink-0 text-m-blue" aria-hidden /> ভিডিও আর লাইভ — ফোনেই
        </p>
        {dept.place && (
          <p className="mt-2 flex items-start gap-2 text-sm text-m-ink/90">
            <MapPin className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden /> হাতে-কলমে: {dept.place}
          </p>
        )}
      </div>
      <div className={cell}>
        <p className={head}>খরচ</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-m-ink/90">
          <Wallet className="size-4 shrink-0 text-m-blue" aria-hidden /> যোগ দেওয়া বিনামূল্যে
        </p>
        <p className="mt-2 text-sm text-m-ink/90">
          কোর্স{" "}
          {high === 0 ? (
            <span className="font-semibold text-m-green">বিনা ফি</span>
          ) : low === high ? (
            <Taka amount={low} />
          ) : (
            <>
              {low === 0 ? "বিনা ফি" : <Taka amount={low} />} থেকে <Taka amount={high} />
            </>
          )}
        </p>
        <p className="text-xs text-m-ink/65">ফি এসক্রোতে, ক্লাস হলে শিক্ষক পান</p>
      </div>
      <div className={cell}>
        <p className={head}>শেষে কী পাবেন</p>
        <p className="mt-3 flex items-start gap-2 text-sm text-m-ink/90">
          <Award className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden /> প্যানেল ইন্টারভিউ আর যাচাইযোগ্য KTA সার্টিফিকেট
        </p>
        <p className="mt-2 text-xs text-m-ink/65">
          এ পর্যন্ত <Num value={graduates} /> জন উত্তীর্ণ
        </p>
      </div>
    </section>
    <AcademyRules dept={dept} />
    </>
  );
}

/** The rules every academy runs on, said once where a learner decides. */
function AcademyRules({ dept }: { dept: Department }) {
  const rules = [
    { Icon: CalendarRange, head: <><Num value={COURSE_DAYS} /> দিনে কোর্স শেষ</>, body: <><Num value={CLASS_WEEKS} /> সপ্তাহ ক্লাস, তারপর প্রজেক্ট আর প্যানেল</> },
    { Icon: Clock3, head: <><Num value={CLASS_MINUTES} /> মিনিটের অনলাইন ক্লাস</>, body: "প্রতিটা ক্লাস ঠিক এই সময়ের" },
    { Icon: dept.kind === "team" ? UsersRound : UserRound, head: <>এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন</>, body: dept.kind === "team" ? "দলীয় একাডেমি — আলাদা বিষয় আলাদা শিক্ষক" : "একক একাডেমি — প্রত্যেককে আলাদা করে দেখা" },
    { Icon: Layers3, head: <><Num value={DEPT_COURSES} />টি দক্ষতার কোর্স</>, body: "প্রতিটার সিলেবাস, কাজের ক্যালেন্ডার আর প্রোমো আছে" },
  ];
  return (
    <ul aria-label="একাডেমির নিয়ম" className="mx-auto mt-3 grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rules.map(({ Icon, head, body }, i) => (
        <li key={i} className="flex items-start gap-3 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-yellow text-m-ink">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-m-ink">{head}</span>
            <span className="mt-0.5 block text-xs leading-snug text-m-ink/70">{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
