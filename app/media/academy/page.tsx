import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { CourseCarousel, type ShelfCourse } from "@/components/media/academy/home/course-carousel";
import { FeatureTabs, type Feature } from "@/components/media/academy/home/feature-tabs";
import { HeroArt } from "@/components/media/academy/home/hero-art";
import { CountUp, Reveal } from "@/components/media/academy/home/motion-bits";
import { BoardIcon, BulbIcon, CertIcon, ChatIcon, ChecklistIcon, HammerIcon, LiveIcon, LockIcon, PanelIcon, PlayIcon, PresenterIcon, ShieldIcon, WalletIcon } from "@/components/media/academy/home/motion-icons";
import { StoryCarousel, type Story } from "@/components/media/academy/home/story-carousel";
import { StoryReplay } from "@/components/media/academy/home/story-replay";
import { mediaButton } from "@/components/media/ui/button-styles";
import { DateText, Num, Taka } from "@/components/media/ui/numerals";
import { board, courses, coursesBy, departments, getCourse, getDepartment, teacherRecords, workshops } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { LEVELS, MATERIAL_KINDS, MIN_ATTENDANCE, MIN_HOMEWORK, SCHOOLS, type School } from "@/lib/media/academy";

export const metadata: Metadata = {
  title: "কাণ্ডারী তৈরি একাডেমি",
  description: "সবার আমি ছাত্র — পেশাদারদের কাছে অনলাইনে, লাইভে আর সত্যিকারের কর্মশালায় হাতে-কলমে শিখুন; শেষে প্যানেল ইন্টারভিউয়ে দক্ষতা প্রমাণ করে কাজ পান।",
};

const WRAP = "mx-auto max-w-6xl px-4 sm:px-6";
const H2 = "text-[clamp(1.6rem,3.5vw,2.25rem)] leading-tight font-bold";

/*
 * The academy's front page, laid out like a learning platform's home: the
 * hero with its numbers, what the academy includes, the courses by school,
 * the story, why it can be trusted, learners in their own words, where to
 * get help, and the footer. Every number and story comes from the data.
 */
export default function AcademyPage() {
  const now = DEMO_NOW.getTime();
  const nextClass = courses.filter((c) => c.nextLive && new Date(c.nextLive).getTime() > now).sort((a, b) => a.nextLive!.localeCompare(b.nextLive!))[0];
  const workshop = [...workshops].sort((a, b) => a.at.localeCompare(b.at)).find((w) => new Date(w.at).getTime() > now) ?? workshops[0];
  const reading = courses.find((c) => c.materials.length >= 3) ?? courses[0];
  const seat = board.find((s) => s.record) ?? board[0];
  const passed = board.find((s) => s.certificate && s.marks)!;
  const graduates = teacherRecords.reduce((n, r) => n + r.graduates, 0);
  const schools = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));

  const stats = [
    { label: "বিভাগ", value: departments.length, tone: "text-signal-orange" },
    { label: "কোর্স", value: courses.length, tone: "text-bdgreen-500" },
    { label: "ইন্টারভিউ-উত্তীর্ণ শিক্ষক", value: teacherRecords.length, tone: "text-white" },
    { label: "গ্র্যাজুয়েট", value: graduates, tone: "text-bdgreen-200" },
  ];

  const features: Feature[] = [
    {
      id: "live",
      title: "লাইভ ও রেকর্ড করা ক্লাস",
      icon: <LiveIcon className="size-full" />,
      image: nextClass.image,
      alt: nextClass.title,
      screen: `${nextClass.id} · ${personOrThrow(nextClass.teacher).nameBn}`,
      a: (
        <>
          <Kicker>পরের লাইভ ক্লাস</Kicker>
          <CardTitle>{nextClass.title}</CardTitle>
          <CardMeta>
            <DateText iso={nextClass.nextLive!} time weekday />
          </CardMeta>
          <CardAction href={`/media/academy/course/${nextClass.id}`}>ক্লাসটা দেখুন</CardAction>
        </>
      ),
      b: (
        <>
          <Kicker>রেকর্ডিং থাকে</Kicker>
          <CardMeta>লাইভ মিস হলে পরে দেখুন — প্রতি সপ্তাহের ভিডিও উপকরণে জমা হয়।</CardMeta>
        </>
      ),
    },
    {
      id: "workshop",
      title: "হাতে-কলমের কর্মশালা",
      icon: <HammerIcon className="size-full" />,
      image: workshop.image,
      alt: workshop.title,
      screen: workshop.place,
      a: (
        <>
          <Kicker>
            <DateText iso={workshop.at} weekday />
          </Kicker>
          <CardTitle>{workshop.title}</CardTitle>
          <CardMeta>
            <Taka amount={workshop.fee} /> · <Num value={workshop.seats - workshop.taken} />টি আসন বাকি
          </CardMeta>
          <CardAction href={`/media/academy/dept/${workshop.dept}`}>আসন রাখুন</CardAction>
        </>
      ),
      b: (
        <>
          <Kicker>সত্যিকারের জায়গায়</Kicker>
          <CardMeta>শিক্ষক নিজের গ্যারেজ, রান্নাঘর বা ল্যাবে ডাকেন। এক দিনে, হাতে-কলমে।</CardMeta>
        </>
      ),
    },
    {
      id: "materials",
      title: "ভিডিও, পিডিএফ আর ডেটা",
      icon: <PlayIcon className="size-full" />,
      image: reading.image,
      alt: reading.title,
      screen: `${reading.id} · উপকরণ`,
      a: (
        <>
          <Kicker>{reading.title}</Kicker>
          <ul className="mt-2 space-y-1.5 text-sm">
            {reading.materials.slice(0, 3).map((m) => (
              <li key={m.title} className="flex gap-2">
                <span className="shrink-0 rounded bg-bd-green px-1.5 text-[11px] leading-5 font-bold text-white">{MATERIAL_KINDS[m.kind]}</span>
                <span className="truncate">{m.title}</span>
              </li>
            ))}
          </ul>
        </>
      ),
      b: (
        <>
          <Kicker>ভর্তি হলেই ডাউনলোড</Kicker>
          <CardMeta>শিক্ষক প্রতি সপ্তাহে নোট, স্লাইড আর অনুশীলনের ফাইল দেন।</CardMeta>
        </>
      ),
    },
    {
      id: "attendance",
      title: "হাজিরা ও বাড়ির কাজ",
      icon: <ChecklistIcon className="size-full" />,
      image: getCourse(seat.course)!.image,
      alt: getCourse(seat.course)!.title,
      screen: `${seat.learner} · ${seat.course}`,
      a: (
        <>
          <Kicker>{seat.learner}-এর খাতা</Kicker>
          <Meter label="হাজিরা" value={seat.record?.attendance ?? 0} min={MIN_ATTENDANCE * 100} />
          <Meter label="বাড়ির কাজ" value={seat.record?.homework ?? 0} min={MIN_HOMEWORK * 100} />
        </>
      ),
      b: (
        <>
          <Kicker>ফাইনালের শর্ত</Kicker>
          <CardMeta>
            অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাস আর <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ — না হলে ফাইনালে বসা যায় না।
          </CardMeta>
        </>
      ),
    },
    {
      id: "project",
      title: "ফাইনাল প্রজেক্ট",
      icon: <BulbIcon className="size-full" />,
      image: getCourse(seat.course)!.image,
      alt: seat.project,
      screen: `${seat.course} · প্রজেক্ট`,
      a: (
        <>
          <Kicker>{seat.learner} · {seat.district}</Kicker>
          <CardTitle>{seat.project}</CardTitle>
        </>
      ),
      b: (
        <>
          <Kicker>সত্যিকারের কাজ</Kicker>
          <CardMeta>সার্ভিস করা বাইক, ১০০ জনের রান্না, চালু অ্যাপ — খাতার পরীক্ষা নয়।</CardMeta>
        </>
      ),
    },
    {
      id: "panel",
      title: "প্যানেল ইন্টারভিউ",
      icon: <PanelIcon className="size-full" />,
      image: getCourse(seat.course)!.image,
      alt: getCourse(seat.course)!.title,
      screen: `${seat.learner} · প্যানেলের সামনে`,
      a: (
        <>
          <Kicker>
            <DateText iso={seat.at} time weekday />
          </Kicker>
          <ul className="mt-1.5 space-y-1 text-sm font-semibold">
            {seat.panel.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <CardAction href="/media/academy/exam#board">প্রকাশ্য বোর্ড</CardAction>
        </>
      ),
      b: (
        <>
          <Kicker>দুই পরীক্ষক, আলাদা নম্বর</Kicker>
          <CardMeta>
            <Num value={20} />-এর বেশি ফারাক হলে তৃতীয় পরীক্ষক ডাকা হয়।
          </CardMeta>
        </>
      ),
    },
    {
      id: "certificate",
      title: "যাচাইযোগ্য সনদ",
      icon: <CertIcon className="size-full" />,
      image: getCourse(passed.course)!.image,
      alt: getCourse(passed.course)!.title,
      screen: `${passed.learner} · পাস`,
      a: (
        <>
          <Kicker>সনদ</Kicker>
          <p className="mt-1 font-mono text-[15px] font-bold text-bd-green">{passed.certificate}</p>
          <CardMeta>
            {passed.learner} · {getCourse(passed.course)!.title}
          </CardMeta>
          <CardAction href="/media/academy/exam">সনদ যাচাই করুন</CardAction>
        </>
      ),
      b: (
        <>
          <Kicker>নিয়োগকর্তারা দেখেন</Kicker>
          <CardMeta>পাস করলে নাম প্রকাশ্য বোর্ডে ওঠে; আইডি দিয়ে যে কেউ যাচাই করতে পারেন।</CardMeta>
        </>
      ),
    },
  ];

  const shelf: ShelfCourse[] = courses.map((c) => {
    const dept = getDepartment(c.dept);
    return { id: c.id, title: c.title, image: c.image, level: LEVELS[c.level], dept: dept?.name ?? c.dept, school: dept?.school ?? "" };
  });

  const stories: Story[] = teacherRecords
    .flatMap((r) =>
      r.stories.map((st) => ({
        name: st.name,
        text: st.text,
        from: `শিক্ষক ${personOrThrow(r.handle).nameBn} · ${getDepartment(r.dept)?.name ?? ""}`,
        image: coursesBy(r.handle)[0]?.image ?? courses[0].image,
        certificate: board.find((b) => b.learner === st.name && b.certificate)?.certificate,
      })),
    )
    .sort((a, b) => Number(Boolean(b.certificate)) - Number(Boolean(a.certificate)))
    .slice(0, 8);

  const trust = [
    { title: "যাচাই করা শিক্ষক", body: "প্যানেল ইন্টারভিউ আর নমুনা ক্লাস দিয়ে আসা", icon: <ShieldIcon className="size-full" /> },
    { title: "ফি এসক্রোতে", body: "ক্লাস হলে তবেই শিক্ষক পান", icon: <WalletIcon className="size-full" /> },
    { title: "প্রকাশ্য ফাইনাল", body: "বোর্ডে সবাই দেখতে পান", icon: <BoardIcon className="size-full" /> },
    { title: "নাম গোপন অভিযোগ", body: "শিক্ষক আপনার নাম দেখেন না", icon: <LockIcon className="size-full" /> },
  ];

  return (
    <div className="-mx-3 -mt-6 -mb-24 sm:-mx-6 lg:-mb-12">
      {/* Hero, with the numbers card riding over its lower edge. */}
      <section aria-labelledby="academy-title" className="bg-signal-orange pb-28 text-text-primary sm:pb-32">
        <div className={`${WRAP} grid items-center gap-10 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]`}>
          <Reveal className="text-center lg:text-left">
            <p className="text-sm font-bold">শিক্ষিতদের মিডিয়া · দক্ষতার একাডেমি</p>
            <h1 id="academy-title" className="mt-3 text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.1] font-bold">
              কাণ্ডারী তৈরি একাডেমি
            </h1>
            <p className="mt-4 text-[clamp(1.35rem,3vw,2.1rem)] leading-snug font-bold text-bd-green-dark">“সবার আমি ছাত্র” — দেশের দক্ষ মানুষদের কাছে হাতে-কলমে শিখুন</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/media/academy/departments" className={mediaButton({ variant: "tile", size: "lg", className: "h-14 px-7" })}>
                বিভাগে যোগ দিন — বিনামূল্যে <ArrowRight aria-hidden />
              </Link>
              <a href="#courses" className={mediaButton({ size: "lg", className: "h-14 border-text-primary bg-transparent px-7 text-text-primary shadow-none hover:bg-text-primary/10" })}>
                <Play className="fill-current" aria-hidden /> কোর্স দেখুন
              </a>
            </div>
          </Reveal>
          <HeroArt />
        </div>
      </section>

      <div className={`${WRAP} relative z-10 -mt-16 sm:-mt-20`}>
        <Reveal>
          <dl className="grid grid-cols-2 gap-y-8 rounded-3xl bg-text-primary px-6 py-8 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/12 sm:px-12 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-[15px] font-semibold text-white/75">{s.label}</dt>
                <dd className={`text-[clamp(1.9rem,3.2vw,2.4rem)] leading-none font-bold ${s.tone}`}>
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* What the academy includes. */}
      <section aria-labelledby="features" className="mt-16 bg-text-primary py-16 sm:mt-20 sm:py-20">
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 id="features" className={`${H2} text-white`}>
              কাণ্ডারী তৈরি একাডেমিতে যা যা থাকছে
            </h2>
            <p className="mt-3 text-lg text-white/80">যোগ দেওয়া থেকে সনদ হাতে পাওয়া পর্যন্ত — প্রতিটি ধাপ এক জায়গায়</p>
          </Reveal>
          <div className="mt-10">
            <FeatureTabs items={features} />
          </div>
        </div>
      </section>

      {/* Courses by school. */}
      <section id="courses" aria-labelledby="courses-title" className="scroll-mt-4 py-16 sm:py-20">
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 id="courses-title" className={`${H2} text-white`}>
              পেশাদারদের হাতে তৈরি কোর্সে শেখা আরও সহজ
            </h2>
            <p className="mt-3 text-lg text-white/80">ক্লাস হয় অনলাইনে, লাইভে আর সত্যিকারের গ্যারেজ, রান্নাঘর আর ল্যাবে — নিজের স্তর থেকে শুরু করুন</p>
          </Reveal>
          <div className="mt-10">
            <CourseCarousel courses={shelf} schools={schools.map((s) => ({ id: s, name: SCHOOLS[s] }))} />
          </div>
        </div>
      </section>

      {/* The story, and what the academy is. */}
      <section aria-labelledby="about" className="pb-20 sm:pb-24">
        <div className={`${WRAP} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <Reveal>
            <StoryReplay />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 id="about" className={`${H2} text-white`}>
              যে জানে সে শেখায়,
              <br />
              <span className="text-signal-orange">যে শেখে সে জেতে</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              ইঞ্জিনিয়ার থেকে মেকানিক, শেফ থেকে শিল্পী — যে কাজ জানে সে শেখায়, যে শিখতে চায় সে শেখে। কোনো বয়স বা লিঙ্গের ভাগ নেই। শেষে পেশাদারদের প্যানেলের সামনে প্রমাণ, তারপর কাজ।
            </p>
            <Link href="/media/academy/admission" className={mediaButton({ size: "lg", className: "mt-8 h-13 px-7" })}>
              কীভাবে যোগ দেবেন <ArrowRight aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why trust it, and learners in their own words over the band's lower edge. */}
      <section aria-labelledby="trust" className="px-3 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-bd-green px-6 pt-12 pb-44 sm:px-12 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 id="trust" className={`${H2} text-white`}>
                কেন ভরসা করবেন?
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
                প্রতিটি শিক্ষক পেশাদার প্যানেলের সামনে প্রমাণ দিয়ে এসেছেন, ফি থাকে এসক্রোতে, আর ফাইনাল হয় সবার সামনে — তাই <Num value={graduates} /> জন গ্র্যাজুয়েটের সনদ যে কেউ যাচাই করতে পারেন।
              </p>
            </Reveal>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5">
              {trust.map((t, i) => (
                <li key={t.title}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group flex h-full flex-col gap-3 rounded-2xl bg-white p-4 text-text-primary transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-tile-lift motion-reduce:transition-none sm:flex-row sm:items-center sm:p-5">
                      <span className="size-12 shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none sm:size-14">{t.icon}</span>
                      <span>
                        <span className="block leading-snug font-bold">{t.title}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{t.body}</span>
                      </span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <Reveal className="mt-16 text-center">
            <h2 className={`${H2} text-white`}>যাঁরা শিখে কাজ পেয়েছেন — তাঁদের মুখেই শুনুন</h2>
          </Reveal>
        </div>
        <div className="mx-auto -mt-32 max-w-6xl sm:px-10">
          <StoryCarousel stories={stories} />
        </div>
      </section>

      {/* Where to get help. */}
      <section aria-labelledby="help" className="mt-20 bg-text-primary py-16 sm:py-20">
        <div className={`${WRAP} grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]`}>
          <Reveal className="h-full">
            <div className="relative flex h-full overflow-hidden rounded-3xl bg-signal-orange text-text-primary">
              <div className="relative z-10 p-6 sm:max-w-[60%] sm:p-9">
                <h2 id="help" className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold">
                  যেকোনো প্রশ্নে বা অভিযোগে, সরাসরি জানান
                </h2>
                <p className="mt-3 leading-relaxed">ক্লাস, ফি বা শিক্ষক নিয়ে কিছু বলার থাকলে শিক্ষকের পাতায় অভিযোগ বাক্স আছে। প্রতিটি অভিযোগ প্যানেল খতিয়ে দেখে।</p>
                <p className="mt-5 border-l-4 border-text-primary pl-3 text-lg font-bold">আপনার নাম শিক্ষক দেখেন না</p>
                <Link href="/media/academy/teachers" className={mediaButton({ variant: "tile", size: "lg", className: "mt-7 h-13 px-7" })}>
                  শিক্ষক বেছে জানান <ArrowRight aria-hidden />
                </Link>
              </div>
              <div className="absolute right-6 bottom-0 hidden h-[82%] w-[34%] rounded-t-full bg-text-primary sm:block" aria-hidden>
                <ChatIcon className="absolute top-[22%] left-1/2 size-[58%] -translate-x-1/2" />
                <span className="absolute top-[8%] -left-6 size-16 rounded-2xl bg-white p-2.5 shadow-tile">
                  <LockIcon className="size-full" />
                </span>
                <span className="absolute bottom-[14%] -left-8 size-16 rounded-2xl bg-white p-2.5 shadow-tile">
                  <ShieldIcon className="size-full" />
                </span>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-6">
            <HelpCard tone="light" title="প্রথম ক্লাস বিনামূল্যে, অনলাইনে" body="বিভাগ বেছে চার প্রশ্নের ছোট পরীক্ষা — দশ মিনিটে শুরু।" href="/media/academy/departments" action="বিভাগ বাছুন" icon={<LiveIcon className="size-full" />} delay={0.08} />
            <HelpCard tone="green" title="যে কাজ জানেন, শেখান" body="নমুনা ক্লাস আর প্যানেল ইন্টারভিউয়ের পর নিজের কোর্স আর ডেস্ক।" href="/media/academy/teach" action="শিক্ষক হোন" icon={<PresenterIcon className="size-full" />} delay={0.16} />
          </div>
        </div>
      </section>

      <AcademyFooter />
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-bd-green">{children}</p>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 leading-snug font-bold">{children}</p>;
}

function CardMeta({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{children}</p>;
}

function CardAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mt-3 flex h-10 items-center justify-center rounded-lg bg-text-primary text-sm font-bold text-signal-orange transition-colors hover:bg-bd-green-dark">
      {children}
    </Link>
  );
}

/** A filled bar with the minimum marked on it. */
function Meter({ label, value, min }: { label: string; value: number; min: number }) {
  return (
    <div className="mt-2.5">
      <p className="flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span>
          <Num value={value} />%
        </span>
      </p>
      <div className="relative mt-1 h-2 rounded-full bg-text-primary/10">
        <div className="h-full rounded-full bg-bd-green" style={{ width: `${value}%` }} />
        <span className="absolute -top-0.5 h-3 w-0.5 rounded-full bg-text-primary" style={{ left: `${min}%` }} aria-hidden />
      </div>
    </div>
  );
}

function HelpCard({ tone, title, body, href, action, icon, delay }: { tone: "light" | "green"; title: string; body: string; href: string; action: string; icon: React.ReactNode; delay: number }) {
  const light = tone === "light";
  return (
    <Reveal delay={delay} className="h-full">
      <div className={`group relative flex h-full flex-col justify-between gap-5 overflow-hidden rounded-3xl p-6 ${light ? "bg-white text-text-primary" : "bg-bd-green text-white"}`}>
        <span className="absolute top-5 right-5 size-16 rounded-2xl bg-white p-2.5 shadow-tile transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none">{icon}</span>
        <div className="pr-20">
          <h3 className="text-xl leading-snug font-bold">{title}</h3>
          <p className={`mt-1.5 text-sm leading-relaxed ${light ? "text-text-muted" : "text-white/80"}`}>{body}</p>
        </div>
        <Link href={href} className={mediaButton({ variant: light ? "tile" : "primary", className: "w-fit" })}>
          {action} <ArrowRight aria-hidden />
        </Link>
      </div>
    </Reveal>
  );
}

function AcademyFooter() {
  const learn = [
    { href: "/media/academy/departments", label: "বিভাগ ও কোর্স" },
    { href: "/media/academy/teachers", label: "শিক্ষক" },
    { href: "/media/academy/exam", label: "ফাইনাল ও বোর্ড" },
    { href: "/media/academy/admission", label: "যোগ দেওয়ার নিয়ম" },
  ];
  const teach = [
    { href: "/media/academy/desk", label: "শিক্ষক ডেস্ক" },
    { href: "/media/academy/panel", label: "প্যানেল মার্কিং" },
    { href: "/media/academy/teach", label: "শিক্ষক হোন" },
  ];
  const rules = [
    <>যোগ দেওয়া বিনামূল্যে, ফি শুধু কোর্সের</>,
    <>
      প্ল্যাটফর্ম রাখে <Num value={5} />% — বাকি শিক্ষকের
    </>,
    <>
      অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ
    </>,
    <>
      ফেল করলে ফল গোপন — <Num value={30} /> দিন পর আবার
    </>,
  ];
  return (
    <footer className="bg-black pt-16 pb-28 lg:pb-14">
      <div className={`${WRAP} grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]`}>
        <div>
          <span className="inline-flex flex-col items-center rounded-2xl bg-signal-orange px-4 pt-2.5 pb-2 text-text-primary">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="100px" className="h-12 w-auto" />
            <span className="text-[10px] font-extrabold tracking-[0.3em]">ACADEMY</span>
          </span>
          <p className="mt-4 text-lg font-bold text-white">কাণ্ডারী তৈরি একাডেমি</p>
          <p className="text-sm font-semibold text-signal-orange">সবার আমি ছাত্র</p>
          <Link href="/media/academy/departments" className={mediaButton({ className: "mt-5" })}>
            বিভাগে যোগ দিন <ArrowRight aria-hidden />
          </Link>
        </div>
        <FooterLinks title="শিখুন" links={learn} />
        <FooterLinks title="শেখান" links={teach} />
        <div>
          <h2 className="text-lg font-bold text-white">নিয়ম এক নজরে</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            {rules.map((r, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-orange" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`${WRAP} mt-12`}>
        <p className="flex flex-wrap justify-between gap-3 border-t border-white/12 pt-6 text-sm text-white/65">
          <span>
            © <Num value={2026} /> কাণ্ডারী-ল্যাব · শিক্ষিতদের মিডিয়া
          </span>
          <span>একাডেমির সব ফি এসক্রোতে সুরক্ষিত</span>
        </p>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group inline-flex items-center gap-1.5 text-[15px] text-white/75 transition-colors hover:text-signal-orange">
              {l.label}
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-[translate,opacity] duration-200 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
