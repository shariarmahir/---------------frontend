import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardCheck,
  DoorOpen,
  GraduationCap,
  Hand,
  Landmark,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Star,
  Ticket,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { academies, board, courses, departments, teacherRecords } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_KINDS, FINAL_DAYS, LEVELS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { AssetGrid } from "../catalogue/asset-card";
import { Band, BandTitle, Lean, Turn, twoDigits } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { EnrolButton } from "../catalogue/enrol-button";
import { academyEntries, courseEntries, deptEntries, splitName, type Seat } from "../catalogue/entries";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { DeptIcon } from "../departments/dept-icons";
import { FinderCards } from "./finder-cards";
import { HomeHero } from "./home-hero";
import { PairCard } from "./pair-card";

const chip = "flex w-fit items-center gap-1 border border-(--c-line) bg-(--c-bg-sunken) px-1.5 py-px text-[11px] leading-snug font-medium";
const frame = "relative aspect-16/10 overflow-hidden border-b border-(--c-line) bg-(--c-bg-sunken)";
const picture = "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none";

/** The next batch a newcomer can take a seat in, as a tag. */
const seatText = (seat?: Seat) => (!seat ? "নতুন ব্যাচ শিগগির" : seat.running ? "ব্যাচ চলছে · আসন খালি" : <>পরের ব্যাচ <DateText iso={seat.starts} /></>);
/** Soonest open seat first; none at all last. */
const bySeat = (a?: Seat, b?: Seat) => (a ? (b ? a.starts.localeCompare(b.starts) : -1) : b ? 1 : 0);

/** How the academy works, in the four stretches of the road. */
const HOW: { Icon: LucideIcon; label: string; title: React.ReactNode; body: React.ReactNode; href: string; go: string }[] = [
  {
    Icon: Landmark,
    label: "বাছাই",
    title: "একাডেমি, বিভাগ, কোর্স",
    body: "আগে একাডেমি, তার বিভাগ, তারপর নিজের স্তরের কোর্স। শিক্ষক, সিলেবাস, ফি আর পরের ব্যাচ — সব ভর্তির আগেই দেখা যায়।",
    href: "/media/academy/academies",
    go: "একাডেমি দেখুন",
  },
  {
    Icon: Ticket,
    label: "ভর্তি",
    title: "এক ফর্মে ভর্তি",
    body: "এক ফর্মে এক বা একাধিক কোর্স। ফি থাকে এসক্রোতে — প্রতিটি ক্লাস হলে তবেই সেই সপ্তাহের ভাগ শিক্ষক পান।",
    href: "/media/academy/courses",
    go: "কোর্স দেখুন",
  },
  {
    Icon: DoorOpen,
    label: "ক্লাস",
    title: (
      <>
        <Num value={CLASS_WEEKS} /> সপ্তাহ লাইভ ক্লাস
      </>
    ),
    body: (
      <>
        সপ্তাহে একটা <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস, রুটিনে ঠিক করা দিনে। রেকর্ডিং, হোমওয়ার্ক আর আলাপ — সব ক্লাসরুমে।
      </>
    ),
    href: "/media/academy/videos",
    go: "একটা ক্লাস দেখুন",
  },
  {
    Icon: Award,
    label: "সনদ",
    title: "প্রজেক্ট, প্যানেল, সনদ",
    body: (
      <>
        শেষ <Num value={FINAL_DAYS} /> দিন নিজের প্রজেক্ট, তারপর দুই পরীক্ষকের প্যানেল। পাস করলে যাচাইযোগ্য সনদ, নাম ওঠে প্রকাশ্য বোর্ডে।
      </>
    ),
    href: "/media/academy/graduation",
    go: "বোর্ড দেখুন",
  },
];

/** Why learn this way — each reason from the academy's own rules, each with a door to where it shows. */
const WHY: { Icon: LucideIcon; title: string; body: React.ReactNode; more: { href: string; label: string } }[] = [
  {
    Icon: Hand,
    title: "হাতে-কলমে দক্ষতা",
    body: "পেশাদারদের কাছে, তাঁদের আসল কাজের জায়গায় — গ্যারেজ, রান্নাঘর, স্টুডিও, মাঠ। যে কাজ দিয়ে মানুষ সংসার চালায়।",
    more: { href: "/media/academy/departments", label: "বিভাগগুলো" },
  },
  {
    Icon: CalendarClock,
    title: "চল্লিশ দিনে শেষ",
    body: (
      <>
        <Num value={CLASS_WEEKS} /> সপ্তাহ ক্লাস, তারপর <Num value={FINAL_DAYS} /> দিন নিজের প্রজেক্ট। বছরের পর বছর নয় — দেড় মাসে হাতে একটা দক্ষতা।
      </>
    ),
    more: { href: "/media/academy/courses", label: "কোর্সগুলো" },
  },
  {
    Icon: UsersRound,
    title: "ছোট ব্যাচ",
    body: (
      <>
        একক একাডেমিতে এক ব্যাচে বড়জোর <Num value={BATCH_MAX.solo} /> জন, দলীয় একাডেমিতে <Num value={BATCH_MAX.team} /> জন — প্রত্যেকে শিক্ষকের চোখের সামনে।
      </>
    ),
    more: { href: "/media/academy/academies", label: "একাডেমিগুলো" },
  },
  {
    Icon: ShieldCheck,
    title: "টাকা নিরাপদ",
    body: "ফি থাকে এসক্রোতে। ক্লাস হলে সেই সপ্তাহের ভাগ শিক্ষক পান; ক্লাস না হলে সেই ভাগ আপনার কাছে ফেরত আসে।",
    more: { href: "/media/academy/departments#rules", label: "শেখার নিয়ম" },
  },
  {
    Icon: BadgeCheck,
    title: "যাচাইযোগ্য সনদ",
    body: "খাতার পরীক্ষা নয় — নিজের হাতের প্রজেক্ট আর দুই পরীক্ষকের প্যানেল। সনদের আইডি দিয়ে যে কেউ মিলিয়ে দেখতে পারে।",
    more: { href: "/media/academy/graduation", label: "প্রকাশ্য বোর্ড" },
  },
  {
    Icon: PlayCircle,
    title: "আগে দেখুন, তারপর ভর্তি",
    body: "প্রতি সপ্তাহে প্রতিটি শিক্ষক একটা ক্লাস সবার জন্য খুলে দেন। কে কীভাবে শেখান দেখে নিন, তারপর মন ঠিক করুন।",
    more: { href: "/media/academy/videos", label: "বিনামূল্যের ক্লাস" },
  },
];

/** A band's last row: the way to the whole catalogue it previewed. */
function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 border-t border-(--c-line) px-6 py-5 text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg) md:px-10">
      <span className="display text-xl sm:text-2xl">{children}</span>
      <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
    </Link>
  );
}

/** A band's opening words: the big heading and a line under it. */
function Opening({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="px-6 py-14 md:px-10 md:py-20">
      <BandTitle>{title}</BandTitle>
      {children && (
        <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
          {children}
        </p>
      )}
    </div>
  );
}

/**
 * The academy's home page, after getartcraft.com's: the name set huge over
 * floating department tiles, then numbered bands — how it works, the three
 * questions, a few academies, departments and courses (each card with "see
 * more" and "join"), what the academy has done so far, why learn this way,
 * and a last call. Every number comes from the academy's own records.
 */
export function HomeView() {
  const topAcademies = academyEntries()
    .sort((x, y) => y.graduates - x.graduates)
    .slice(0, 3);
  const topDepts = deptEntries()
    .map((e, tone) => ({ ...e, tone }))
    .sort((x, y) => bySeat(x.seat, y.seat))
    .slice(0, 6);
  const firstCourses = courseEntries()
    .filter((e) => e.course.level === "foundation")
    .sort((x, y) => bySeat(x.seat, y.seat))
    .slice(0, 6);

  const graduates = teacherRecords.reduce((n, r) => n + r.graduates, 0);
  const rated = teacherRecords.reduce((n, r) => n + r.rating.count, 0);
  const rating = rated ? Math.round((teacherRecords.reduce((n, r) => n + r.rating.avg * r.rating.count, 0) / rated) * 10) / 10 : 0;
  const districts = new Set(board.map((b) => b.district)).size;

  const impact: { Icon: LucideIcon; value: React.ReactNode; label: string; body: React.ReactNode; more: { href: string; label: string }; join: { href: string; label: string } }[] = [
    {
      Icon: GraduationCap,
      value: <Num value={graduates} />,
      label: "গ্র্যাজুয়েট",
      body: "প্রজেক্ট আর প্যানেল পেরিয়ে সনদ পেয়েছেন — প্রত্যেকের সনদ যাচাই করা যায়।",
      more: { href: "/media/academy/graduation", label: "প্রকাশ্য বোর্ড" },
      join: { href: "/media/academy/courses", label: "ভর্তি হোন" },
    },
    {
      Icon: UsersRound,
      value: <Num value={teacherRecords.length} />,
      label: "শিক্ষক",
      body: "প্রত্যেকে বহিরাগত পরীক্ষকের প্যানেল ইন্টারভিউ পেরিয়ে পড়াচ্ছেন।",
      more: { href: "/media/academy/academies", label: "একাডেমিগুলো" },
      join: { href: "/media/academy/teach", label: "শিক্ষক হোন" },
    },
    {
      Icon: MapPin,
      value: <Num value={districts} />,
      label: "জেলা",
      body: "প্রকাশ্য বোর্ডে এই কটি জেলার শিক্ষার্থীর প্যানেল আর পাসের খবর।",
      more: { href: "/media/academy/graduation", label: "বোর্ড দেখুন" },
      join: { href: "/media/academy/courses", label: "ভর্তি হোন" },
    },
    {
      Icon: Star,
      value: <Num value={rating} />,
      label: "গড় রেটিং",
      body: (
        <>
          শিক্ষার্থীদের দেওয়া <Num value={rated} />টি ক্লাস রেটিংয়ের গড়, পাঁচের মধ্যে।
        </>
      ),
      more: { href: "/media/academy/videos", label: "ক্লাস দেখুন" },
      join: { href: "/media/academy/courses", label: "ভর্তি হোন" },
    },
  ];

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <HomeHero
        tiles={departments.map((d, tone) => ({ id: d.id, name: d.name, school: d.school, tone }))}
        facts={[
          <Fragment key="count">
            <Num value={academies.length} />টি একাডেমি · <Num value={departments.length} />টি বিভাগ · <Num value={courses.length} />টি কোর্স
          </Fragment>,
          <Fragment key="days">
            <Num value={COURSE_DAYS} /> দিনের কোর্স
          </Fragment>,
          "ফি এসক্রোতে নিরাপদ",
        ]}
      >
        <p data-reveal data-in className="relative mt-4 max-w-lg text-lg leading-relaxed text-(--c-muted)">
          গ্যারেজের মিস্ত্রি থেকে স্থপতি, রাঁধুনি থেকে গায়িকা — দেশের পেশাদারদের খোলা একাডেমিতে চল্লিশ দিনে হাতে-কলমে শিখুন, প্রজেক্ট দিয়ে সনদ নিন।
        </p>
      </HomeHero>

      <Band id="how" n={1} label="কীভাবে কাজ করে" rulerLabel="পদ্ধতি" note="বাছাই থেকে সনদ">
        <Opening
          title={
            <>
              চল্লিশ দিনে <Turn>হাতে-কলমে</Turn> দক্ষ।
            </>
          }
        >
          বিশ্ববিদ্যালয়ের মতোই পথ — একাডেমি, বিভাগ, কোর্স, ভর্তি, ক্লাস, পরীক্ষা, সমাবর্তন। শুধু ছোট, কাজের, আর দেড় মাসে শেষ।
        </Opening>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-2 xl:grid-cols-4">
          {HOW.map(({ Icon, label, title, body, href, go }, i) => (
            <li key={label} data-reveal style={toneStyle(i * 2)} className="tone group flex flex-col bg-(--c-bg)">
              <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-2.5">
                <p className="hud text-(--c-muted)">{label}</p>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <div className="relative grid aspect-video place-items-center overflow-hidden border-b border-(--c-line) bg-(--c-bg-sunken)">
                <span aria-hidden className="display absolute -right-2 -bottom-8 text-[9rem] leading-none text-(--c-app) opacity-15">
                  {twoDigits(i + 1)}
                </span>
                <span className="relative grid size-20 place-items-center rounded-[1.4rem] bg-(--c-app) text-black drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none">
                  <Icon className="size-9" strokeWidth={1.6} aria-hidden />
                </span>
              </div>
              <div className="flex flex-1 flex-col px-6 py-6">
                <h3 className="display text-2xl text-(--c-ink-strong)">{title}</h3>
                <p className="mt-2 leading-relaxed text-(--c-muted)">{body}</p>
                <Link href={href} className="hud mt-auto flex w-fit items-center gap-1.5 pt-6 text-(--c-app-ink) hover:underline">
                  {go}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="finder" n={2} label="আপনার পথ" rulerLabel="পথ" note="স্বপ্ন · পছন্দ · প্রতিভা">
        <Opening
          title={
            <>
              তিন প্রশ্নে নিজের <Turn>একাডেমি</Turn>।
            </>
          }
        >
          স্বপ্ন, যে কাজ ভালো লাগে আর যেখানে আপনার প্রতিভা — তিনটি উত্তর দিন, মিলে যাওয়া একাডেমি আর বিভাগে দাগ পড়ে যাবে।
        </Opening>
        <div className="border-t border-(--c-line)">
          <FinderCards />
        </div>
      </Band>

      <Band id="academies" n={3} label="একাডেমি" note="সবচেয়ে বেশি গ্র্যাজুয়েট যাঁদের">
        <Opening
          title={
            <>
              পেশাদারদের নিজের <Turn>একাডেমি</Turn>।
            </>
          }
        >
          কেউ একা নিজের নামে, কেউ বন্ধুদের নিয়ে। একাডেমিতে ঢুকে দেখুন কারা শেখান, কীভাবে শেখান, কোন কোন বিভাগ আছে।
        </Opening>
        <AssetGrid count={topAcademies.length} className="border-t border-(--c-line)">
          {topAcademies.map(({ academy: a, tone, cover, courses: count, graduates: grads, seat }, i) => {
            const [head, tail] = splitName(a.name);
            return (
              <li key={a.id} className="bg-(--c-bg)">
                <PairCard
                  kind={{ icon: Landmark, label: DEPT_KINDS[a.kind] }}
                  n={i + 1}
                  style={toneStyle(tone)}
                  className="tone"
                  frame={
                    <div className={frame}>
                      {cover && <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 26rem, (min-width: 768px) 46vw, 94vw" className={picture} />}
                      <span className="absolute bottom-3 left-3 grid size-12 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.3)]">
                        <DeptIcon dept={a.departments[0].id} school={a.departments[0].school} className="size-8" />
                      </span>
                    </div>
                  }
                  title={
                    <>
                      {head}
                      <span className="text-(--c-app-ink)">{tail}</span>
                    </>
                  }
                  text={<p className="line-clamp-3">{a.about}</p>}
                  extra={
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="এক নজরে">
                      <li className={cn(chip, "text-(--c-app-ink)")}>{seatText(seat)}</li>
                      <li className={cn(chip, "text-(--c-muted)")}>
                        <Num value={a.departments.length} />টি বিভাগ · <Num value={count} />টি কোর্স
                      </li>
                      {grads > 0 && (
                        <li className={cn(chip, "text-(--c-muted)")}>
                          <Num value={grads} /> গ্র্যাজুয়েট
                        </li>
                      )}
                    </ul>
                  }
                  more={{ href: `/media/academy/a/${a.id}`, label: "একাডেমি দেখুন" }}
                  join={{ href: `/media/academy/a/${a.id}#courses` }}
                />
              </li>
            );
          })}
        </AssetGrid>
        <SeeAll href="/media/academy/academies">
          সব <Num value={academies.length} />টি একাডেমি দেখুন
        </SeeAll>
      </Band>

      <Band id="departments" n={4} label="বিভাগ" note="পরের ব্যাচ যাদের আগে">
        <Opening
          title={
            <>
              প্রতিটি দক্ষতার নিজের <Turn>বিভাগ</Turn>।
            </>
          }
        >
          কোড আর যন্ত্র, বাড়ির নকশা, গ্যারেজ আর রান্নাঘর, গান, রং আর তাঁত, ক্যামেরা, হিসাব, সাজ, মাঠ আর অঙ্ক — প্রতিটি বিভাগে তিনটি কোর্স, তিন স্তরে।
        </Opening>
        <AssetGrid count={topDepts.length} className="border-t border-(--c-line)">
          {topDepts.map(({ dept: d, cover, fees, seat, tone }, i) => (
            <li key={d.id} className="bg-(--c-bg)">
              <PairCard
                kind={{ icon: Building2, label: "বিভাগ" }}
                n={i + 1}
                style={toneStyle(tone)}
                className="tone"
                frame={
                  <div className={frame}>
                    {cover && <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 26rem, (min-width: 768px) 46vw, 94vw" className={picture} />}
                    <span className="absolute bottom-3 left-3 grid size-12 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.3)]">
                      <DeptIcon dept={d.id} school={d.school} className="size-8" />
                    </span>
                  </div>
                }
                title={
                  <>
                    {d.name} <span className="text-(--c-app-ink)">বিভাগ</span>
                  </>
                }
                text={
                  <>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-(--c-ink)">
                      <Landmark className="size-3.5 text-(--c-app-ink)" aria-hidden />
                      {d.academy.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2">{d.blurb}</p>
                  </>
                }
                extra={
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="এক নজরে">
                    <li className={cn(chip, "text-(--c-app-ink)")}>{seatText(seat)}</li>
                    <li className={cn(chip, "text-(--c-muted)")}>{fees.max === 0 ? "বিনা ফি" : fees.min === 0 ? "বিনা ফি থেকে শুরু" : <><Taka amount={fees.min} /> থেকে</>}</li>
                  </ul>
                }
                more={{ href: `/media/academy/dept/${d.id}`, label: "বিভাগ দেখুন" }}
                join={{ href: `/media/academy/dept/${d.id}#courses` }}
              />
            </li>
          ))}
        </AssetGrid>
        <SeeAll href="/media/academy/departments">
          সব <Num value={departments.length} />টি বিভাগ দেখুন
        </SeeAll>
      </Band>

      <Band id="courses" n={5} label="কোর্স" note="শুরু থেকে — প্রথম কোর্সগুলো">
        <Opening
          title={
            <>
              প্রথম কোর্সটা <Turn>শুরু থেকে</Turn>।
            </>
          }
        >
          আগে কিছু জানা লাগে না — এই কোর্সগুলো একেবারে গোড়া থেকে। পরের ব্যাচ যেগুলোর আগে, সেগুলো আগে দেখানো হলো।
        </Opening>
        <AssetGrid count={firstCourses.length} className="border-t border-(--c-line)">
          {firstCourses.map(({ course: c, dept, tone, seat }, i) => (
            <li key={c.id} className="bg-(--c-bg)">
              <PairCard
                kind={{ icon: BookOpen, label: <span className="font-mono tracking-[0.08em]">{c.id}</span> }}
                n={i + 1}
                style={toneStyle(tone)}
                className="tone"
                frame={<div className={frame}>{c.image && <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 26rem, (min-width: 768px) 46vw, 94vw" className={picture} />}</div>}
                title={c.title}
                text={
                  <>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-(--c-ink)">
                      <Landmark className="size-3.5 text-(--c-app-ink)" aria-hidden />
                      {dept.academy.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2">{c.outcome}</p>
                  </>
                }
                extra={
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="এক নজরে">
                    <li className={cn(chip, "text-(--c-app-ink)")}>{LEVELS[c.level]}</li>
                    <li className={cn(chip, "text-(--c-muted)")}>{seatText(seat)}</li>
                    <li className={cn(chip, "text-(--c-muted)")}>{c.fee ? <Taka amount={c.fee} /> : "বিনা ফি"}</li>
                  </ul>
                }
                more={{ href: `/media/academy/course/${c.id}`, label: "কোর্স দেখুন" }}
                join={<EnrolButton course={c} cell />}
              />
            </li>
          ))}
        </AssetGrid>
        <SeeAll href="/media/academy/courses">
          সব <Num value={courses.length} />টি কোর্স দেখুন
        </SeeAll>
      </Band>

      <Band id="impact" n={6} label="প্রভাব" note="একাডেমির নিজের খাতা থেকে">
        <Opening
          title={
            <>
              খাতায় যা <Turn>লেখা</Turn> আছে।
            </>
          }
        >
          প্রতিটি সংখ্যা একাডেমির রেকর্ড থেকে — শিক্ষকের খাতা, প্যানেলের নম্বর আর প্রকাশ্য বোর্ড।
        </Opening>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-2 xl:grid-cols-4">
          {impact.map(({ Icon, value, label, body, more, join }, i) => (
            <li key={label} className="bg-(--c-bg)">
              <PairCard
                kind={{ icon: Icon, label }}
                n={i + 1}
                style={toneStyle(i * 2 + 1)}
                className="tone"
                frame={
                  <div className="relative flex aspect-video items-end overflow-hidden border-b border-(--c-line) bg-(--c-bg-sunken) px-6 pb-4 md:px-8">
                    <span className="display text-7xl leading-none text-(--c-app-ink) transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transition-none">{value}</span>
                  </div>
                }
                title={label}
                text={body}
                more={more}
                join={join}
              />
            </li>
          ))}
        </ul>
      </Band>

      <Band id="why" n={7} label="কেন এই শেখা" rulerLabel="কেন" note="ডিগ্রি নয়, দক্ষতা">
        <Opening
          title={
            <>
              কাগজ নয়, <Turn>হাতের কাজ</Turn>।
            </>
          }
        >
          চাকরি, নিজের ব্যবসা, ঘরে বসে আয় বা নিছক শখ — যে স্বপ্নই হোক, শুরুটা একটা কাজ ঠিকঠাক পারা দিয়ে।
        </Opening>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ Icon, title, body, more }, i) => (
            <li key={title} className="bg-(--c-bg)">
              <PairCard
                kind={{ icon: Icon, label: "কেন" }}
                n={String.fromCharCode(65 + i)}
                style={toneStyle(i)}
                className="tone"
                title={
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center bg-(--c-app) text-black">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    {title}
                  </span>
                }
                text={body}
                more={more}
                join={{ href: "/media/academy/courses" }}
              />
            </li>
          ))}
        </ul>
      </Band>

      <Band id="start" rulerLabel="ভর্তি">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">একাডেমি → বিভাগ → কোর্স → ভর্তি</p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            আজই <Turn>শুরু</Turn> করুন।
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">নিজের স্তরের কোর্স বেছে ভর্তি হোন — বা আগে একটা বিনামূল্যের ক্লাস দেখে নিন।</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/media/academy/courses" className={primaryBtn}>
              <Ticket className="size-4" aria-hidden />
              ভর্তি হোন
            </Link>
            <Link href="/media/academy/videos" className={secondaryBtn}>
              <PlayCircle className="size-4" aria-hidden />
              বিনামূল্যের ক্লাস দেখুন
            </Link>
          </div>
          <Link href="/media/academy/teach" className="hud mt-10 flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong) hover:underline">
            <ClipboardCheck className="size-3.5" aria-hidden />
            পড়াতে চান? নিজের একাডেমি খুলুন
            <Lean>
              <ArrowRight className="size-3.5" aria-hidden />
            </Lean>
          </Link>
        </div>
      </Band>
    </CatalogueRoot>
  );
}
