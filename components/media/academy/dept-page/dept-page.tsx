import Link from "next/link";
import { ArrowRight, Award, BookOpen, CalendarRange, Clock3, Hammer, Layers3, MapPin, Quote, UserRound, UsersRound, Wallet, Wifi } from "lucide-react";
import { coursesOf, departments, deptLikes, teacherRecord, workshops, workshopsOf } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_COURSES, DEPT_KINDS, LEVELS, SCHOOLS, type Department, type Level } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { AssetCard, AssetGrid, FrameImage, frameClass } from "../catalogue/asset-card";
import { Band, BandTitle, Lean, Turn, twoDigits } from "../catalogue/band";
import { blockBtn, primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { DeptCard } from "../catalogue/dept-card";
import { EnrolButton } from "../catalogue/enrol-button";
import { courseEntries, deptEntries } from "../catalogue/entries";
import { fillRow, lineupGrid } from "../catalogue/fill-row";
import { CatalogueRuler } from "../catalogue/ruler";
import { ShareRow } from "../catalogue/share-row";
import { toneStyle } from "../catalogue/tones";
import { RememberDept } from "../departments/recent";
import { WorkshopBook } from "../workshop-book";
import { DeptArt } from "./dept-art";
import { DeptCourses } from "./dept-courses";
import { DeptResources } from "./dept-resources";
import { WeekTracks } from "./week-tracks";

const LEVEL_ORDER = Object.keys(LEVELS) as Level[];

const JOIN_STEPS = [
  { title: "নিজের স্তরের কোর্স", body: "শুরু থেকে, মাঝারি না অভিজ্ঞ — নিজের স্তরের কোর্সে “ভর্তি হোন” চাপুন।" },
  { title: "চেকআউটে নিশ্চিত করুন", body: "নাম, মোবাইল, জেলা আর পেমেন্ট — এক ফর্মেই। বিভাগে যোগও এখানেই হয়ে যায়।" },
  { title: "প্রথম ক্লাস অনলাইনে", body: "পরিচয় হয়ে গেলে লাইভ আর হাতে-কলমের ক্লাস; শেষে প্রজেক্ট আর প্যানেল।" },
];

/** The skills the department's teachers had verified by the community, most-rated first. */
function skillsOf(dept: Department): string[] {
  const all = dept.teachers.flatMap((h) => personOrThrow(h).skills).sort((a, b) => b.raters - a.raters);
  return [...new Set(all.map((s) => s.skill))].slice(0, 8);
}

/**
 * বিভাগ — a department's own page, step three of the road, in the
 * catalogue's bands: who it suits and who teaches, the facts and the rules,
 * its courses with "আজ কেন এসেছেন?", the courses week by week, joining in
 * three steps, the workshops, the resources, the stories, departments like
 * it, and the way on to choosing a course.
 */
export function DeptPage({ dept }: { dept: Department }) {
  const tone = departments.findIndex((d) => d.id === dept.id);
  const courses = [...coursesOf(dept.id)].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || a.id.localeCompare(b.id));
  const entries = courseEntries([dept.id]).sort((a, b) => courses.indexOf(a.course) - courses.indexOf(b.course));
  const levels = LEVEL_ORDER.filter((l) => courses.some((c) => c.level === l));
  const fees = courses.map((c) => c.fee);
  const low = fees.length ? Math.min(...fees) : 0;
  const high = fees.length ? Math.max(...fees) : 0;
  const graduates = dept.teachers.reduce((n, h) => n + (teacherRecord(h)?.graduates ?? 0), 0);
  const own = workshopsOf(dept.id);
  const shops = (own.length ? own : workshops.filter((w) => w.at > DEMO_NOW.toISOString())).slice(0, 6);
  const stories = dept.teachers.flatMap((h) => (teacherRecord(h)?.stories ?? []).map((s) => ({ ...s, handle: h })));
  const similar = deptEntries()
    .filter((e) => e.dept.id !== dept.id)
    .sort((a, b) => Number(b.dept.school === dept.school) - Number(a.dept.school === dept.school) || b.courses - a.courses)
    .slice(0, 3);
  const KindIcon = dept.kind === "team" ? UsersRound : UserRound;
  const names = dept.teachers.map((h) => personOrThrow(h).nameBn).join(", ");
  const feeText =
    high === 0 ? (
      "বিনা ফি"
    ) : low === high ? (
      <Taka amount={low} />
    ) : (
      <>
        {low === 0 ? "বিনা ফি" : <Taka amount={low} />} থেকে <Taka amount={high} />
      </>
    );

  const glance = [
    {
      head: "কারা শেখান",
      body: (
        <>
          <span className="mb-3 flex -space-x-2">
            {dept.teachers.map((h) => (
              <Link key={h} href={`/media/academy/teachers/${h}`} aria-label={`${personOrThrow(h).nameBn}-এর চ্যানেল`} className="rounded-full hover:z-10">
                <PersonAvatar person={personOrThrow(h)} className="ring-2 ring-(--c-bg)" />
              </Link>
            ))}
          </span>
          {names}
        </>
      ),
      foot: <>{DEPT_KINDS[dept.kind]}</>,
    },
    {
      head: "ক্লাস কোথায়",
      body: (
        <>
          <span className="flex items-center gap-2">
            <Wifi className="size-4 shrink-0 text-(--c-accent-ink)" aria-hidden /> ভিডিও আর লাইভ — ফোনেই
          </span>
          {dept.place && (
            <span className="mt-2 flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-(--c-signal)" aria-hidden /> হাতে-কলমে: {dept.place}
            </span>
          )}
        </>
      ),
    },
    {
      head: "খরচ",
      body: (
        <>
          <span className="flex items-center gap-2">
            <Wallet className="size-4 shrink-0 text-(--c-accent-ink)" aria-hidden /> যোগ দেওয়া বিনামূল্যে
          </span>
          <span className="mt-2 block">কোর্স {feeText}</span>
        </>
      ),
      foot: "ফি এসক্রোতে, ক্লাস হলে শিক্ষক পান",
    },
    {
      head: "শেষে কী পাবেন",
      body: (
        <span className="flex items-start gap-2">
          <Award className="mt-0.5 size-4 shrink-0 text-(--c-accent-ink)" aria-hidden /> প্যানেল ইন্টারভিউ আর যাচাইযোগ্য KTA সনদ
        </span>
      ),
      foot: (
        <>
          এ পর্যন্ত <Num value={graduates} /> জন উত্তীর্ণ
        </>
      ),
    },
  ];

  const rules = [
    {
      Icon: CalendarRange,
      head: (
        <>
          <Num value={COURSE_DAYS} /> দিনে কোর্স শেষ
        </>
      ),
      body: (
        <>
          <Num value={CLASS_WEEKS} /> সপ্তাহ ক্লাস, তারপর প্রজেক্ট আর প্যানেল
        </>
      ),
    },
    {
      Icon: Clock3,
      head: (
        <>
          <Num value={CLASS_MINUTES} /> মিনিটের অনলাইন ক্লাস
        </>
      ),
      body: "প্রতিটা ক্লাস ঠিক এই সময়ের",
    },
    {
      Icon: KindIcon,
      head: (
        <>
          এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন
        </>
      ),
      body: dept.kind === "team" ? "দলীয় একাডেমি — আলাদা বিষয় আলাদা শিক্ষক" : "একক একাডেমি — প্রত্যেককে আলাদা করে দেখা",
    },
    {
      Icon: Layers3,
      head: (
        <>
          <Num value={DEPT_COURSES} />
          টি দক্ষতার কোর্স
        </>
      ),
      body: "প্রতিটার সিলেবাস, কাজের ক্যালেন্ডার আর প্রোমো আছে",
    },
  ];

  let n = 0;
  const next = () => ++n;

  return (
    <CatalogueRoot className="min-h-full">
      <RememberDept id={dept.id} />
      <CatalogueNav />
      <CatalogueRuler />

      <Band
        id="intro"
        n={next()}
        label="বিভাগ"
        now
        note={
          <>
            {dept.academy.name} · {SCHOOLS[dept.school]}
          </>
        }
      >
        <div style={toneStyle(tone)} className="tone grid gap-14 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <nav aria-label="অবস্থান" data-reveal data-in className="hud flex flex-wrap items-center gap-2 text-(--c-faint)">
              <Link href="/media/academy/departments" className="transition-colors hover:text-(--c-ink-strong)">
                সব বিভাগ
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/media/academy/a/${dept.academy.id}`} className="transition-colors hover:text-(--c-ink-strong)">
                {dept.academy.name}
              </Link>
              <span aria-hidden>/</span>
              <span aria-current="page" className="text-(--c-muted)">
                {dept.name}
              </span>
            </nav>
            <p data-reveal data-in className="hud mt-8 inline-flex items-center gap-1.5 border border-(--c-line) px-2 py-1 text-(--c-app-ink)">
              <KindIcon className="size-3.5" aria-hidden />
              {DEPT_KINDS[dept.kind]} · <Num value={dept.teachers.length} /> জন শিক্ষক
            </p>
            <BandTitle as="h1" now className="mt-5">
              {dept.name} <Turn>বিভাগ</Turn>।
            </BandTitle>
            <p data-reveal data-in className="display mt-6 max-w-xl text-xl leading-snug text-(--c-ink-strong)">
              যদি আপনি {deptLikes[dept.id]} ভালোবাসেন — এই বিভাগ আপনার জন্য।
            </p>
            <p data-reveal data-in className="mt-3 max-w-xl text-lg leading-relaxed text-(--c-muted)">
              {dept.blurb}
            </p>
            {skillsOf(dept).length > 0 && (
              <ul data-reveal data-in aria-label="যে দক্ষতা গড়বেন" className="mt-5 flex max-w-xl flex-wrap gap-1.5">
                {skillsOf(dept).map((s) => (
                  <li key={s} className="border border-(--c-line) bg-(--c-bg-sunken) px-2 py-0.5 text-xs font-medium text-(--c-app-ink)">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
              <a href="#join" className={primaryBtn}>
                ভর্তি হোন
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <a href="#courses" className={secondaryBtn}>
                <BookOpen className="size-4" aria-hidden />
                কোর্সগুলো দেখুন
              </a>
              {dept.kind === "team" && (
                <Link href={`/media/academy/teach?dept=${dept.id}`} className={secondaryBtn}>
                  দলে শেখান
                </Link>
              )}
            </div>
            <ShareRow text={`${dept.name} বিভাগ — ${dept.academy.name}`} className="mt-6" />
          </div>
          <div data-reveal data-in>
            <DeptArt dept={dept} fallback={courses.find((c) => c.image)?.image} />
          </div>
        </div>
      </Band>

      <Band id="glance" n={next()} label="এক নজরে" note="সব একাডেমির একই নিয়ম">
        <dl data-reveal-group className="grid gap-px bg-(--c-line) sm:grid-cols-2 lg:grid-cols-4">
          {glance.map((g) => (
            <div key={g.head} data-reveal className="flex flex-col bg-(--c-bg) p-6 md:p-8">
              <dt className="hud text-(--c-faint)">{g.head}</dt>
              <dd className="mt-4 text-sm leading-relaxed text-(--c-ink)">{g.body}</dd>
              {g.foot && <dd className="hud mt-auto pt-4 text-(--c-faint)">{g.foot}</dd>}
            </div>
          ))}
        </dl>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 lg:grid-cols-4">
          {rules.map(({ Icon, head, body }, i) => (
            <li key={i} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-10 items-center justify-center bg-(--c-signal) text-black">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <h3 className="display mt-6 text-lg leading-snug text-(--c-ink-strong)">{head}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{body}</p>
            </li>
          ))}
        </ul>
      </Band>

      {entries.length > 0 && (
        <Band
          id="courses"
          n={next()}
          label="কোর্স"
          note={
            <>
              <Num value={entries.length} />
              টি কোর্স, স্তর ধরে
            </>
          }
        >
          <DeptCourses dept={dept} entries={entries} levels={levels} />
        </Band>
      )}

      {courses.length > 0 && (
        <Band id="weeks" n={next()} label="সপ্তাহ ধরে" note="কোন সপ্তাহে কী শেখানো হয়">
          <div className="px-6 py-14 md:px-10 md:py-20">
            <BandTitle>
              প্রতিটি কোর্স, <Lean>সপ্তাহে</Lean> সপ্তাহে।
            </BandTitle>
            <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
              যে সপ্তাহের ক্লাস ভিডিও আছে, সেটা খুলে দেখে নিন — শিক্ষক কীভাবে শেখান, ভর্তির আগেই।
            </p>
          </div>
          <WeekTracks dept={dept} courses={courses} tone={tone} />
        </Band>
      )}

      <Band id="join" n={next()} label="ভর্তি" note="এক ফর্মে, বিভাগে যোগও তাতেই">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            <Num value={JOIN_STEPS.length} /> ধাপে <Turn>ভর্তি</Turn>।
          </BandTitle>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3">
          {JOIN_STEPS.map((s, i) => (
            <li key={s.title} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <span className="display grid size-10 place-items-center bg-(--c-invert-bg) text-lg text-(--c-invert-fg)">
                <Num value={i + 1} />
              </span>
              <h3 className="display mt-6 text-xl text-(--c-ink-strong)">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{s.body}</p>
            </li>
          ))}
        </ol>
        <ul className="border-t border-(--c-line)">
          {courses.map((c) => (
            <li key={c.id} data-reveal className="flex flex-col gap-4 border-b border-(--c-line) px-6 py-5 last:border-b-0 sm:flex-row sm:items-center md:px-10">
              <div className="min-w-0 flex-1">
                <p className="hud font-mono tracking-[0.08em] text-(--c-faint)">{c.id}</p>
                <Link href={`/media/academy/course/${c.id}`} className="display mt-1 block text-lg leading-snug text-(--c-ink-strong) underline-offset-4 hover:underline">
                  {c.title}
                </Link>
                <p className="hud mt-1 text-(--c-muted)">
                  {LEVELS[c.level]} · ব্যাচ শুরু <DateText iso={c.starts} />
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <span className={cn("display text-lg tabular-nums", c.fee === 0 ? "text-(--c-good)" : "text-(--c-ink-strong)")}>{c.fee === 0 ? "বিনা ফি" : <Taka amount={c.fee} />}</span>
                <EnrolButton course={c} />
              </div>
            </li>
          ))}
        </ul>
      </Band>

      {shops.length > 0 && (
        <Band id="workshops" n={next()} label="কর্মশালা" note={own.length ? (dept.place ?? "হাতে-কলমে") : "অন্য বিভাগের আসন্ন কর্মশালা"}>
          <AssetGrid count={shops.length}>
            {shops.map((w, i) => {
              const host = personOrThrow(w.host);
              const left = w.seats - w.taken;
              return (
                <li key={w.id} className="bg-(--c-bg)">
                  <AssetCard
                    kind={{ icon: Hammer, label: "কর্মশালা" }}
                    n={i + 1}
                    frame={
                      <div className={frameClass}>
                        <FrameImage src={w.image} alt="" />
                      </div>
                    }
                    title={w.title}
                    text={
                      <p className="flex items-center gap-2">
                        <PersonAvatar person={host} size="xs" /> {host.nameBn}
                      </p>
                    }
                    extra={
                      <p className="hud mt-3 text-(--c-faint)">
                        <DateText iso={w.at} /> · {w.place} ·{" "}
                        {left > 0 ? (
                          <>
                            <Num value={left} />
                            টি আসন বাকি
                          </>
                        ) : (
                          "আসন পূর্ণ"
                        )}{" "}
                        · {w.fee === 0 ? "বিনা ফি" : <Taka amount={w.fee} />}
                      </p>
                    }
                    action={<WorkshopBook workshop={w} />}
                  />
                </li>
              );
            })}
          </AssetGrid>
        </Band>
      )}

      <Band id="resources" n={next()} label="রিসোর্স" note="ভর্তি ছাড়াই যা দেখা যায়">
        <DeptResources dept={dept} />
      </Band>

      {stories.length > 0 && (
        <Band id="stories" n={next()} label="গল্প" note="যাঁরা এখান থেকে পাস করেছেন">
          <AssetGrid count={Math.min(stories.length, 6)}>
            {stories.slice(0, 6).map((s, i) => {
              const course = courses.find((c) => c.teacher === s.handle);
              return (
                <li key={s.name} className="bg-(--c-bg)">
                  <AssetCard
                    kind={{ icon: Quote, label: "শিক্ষার্থীর কথা" }}
                    n={i + 1}
                    title={s.name}
                    text={<p className="text-base text-(--c-ink)">“{s.text}”</p>}
                    extra={<p className="hud mt-4 text-(--c-faint)">{course?.title ?? `${personOrThrow(s.handle).nameBn}-এর কাছে`}</p>}
                  />
                </li>
              );
            })}
          </AssetGrid>
        </Band>
      )}

      <Band id="similar" n={next()} label="আরও বিভাগ" note="মিলিয়ে দেখে নিন">
        <div className="@container">
          <div data-reveal-group className={lineupGrid}>
            {similar.map((entry, i) => (
              <DeptCard key={entry.dept.id} entry={entry} n={i + 1} tone={departments.findIndex((d) => d.id === entry.dept.id)} />
            ))}
            <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(similar.length))}>
              <p className="hud text-(--c-faint)">আরও পথ</p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                সব <Lean>বিভাগ</Lean> পাশাপাশি।
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
                দেশের <Num value={departments.length} />
                টি বিভাগ — মিলিয়ে দেখে নিন।
              </p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/departments" className={blockBtn}>
                  সব বিভাগ
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Band>

      <Band id="start" rulerLabel="এরপর কোর্স">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">বিভাগ → কোর্স → ভর্তি</p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            এবার <Turn>কোর্সে</Turn> চলুন।
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">নিজের স্তরের কোর্সে “ভর্তি হোন” চাপুন — বিভাগে যোগও সেই ফর্মেই।</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="#courses" className={primaryBtn}>
              <BookOpen className="size-4" aria-hidden />
              {dept.name}-এর কোর্স
            </a>
            <Link href="/media/academy/courses" className={secondaryBtn}>
              সব কোর্স
            </Link>
          </div>
          <p className="hud mt-14 max-w-lg text-(--c-faint)">রেটিং শিক্ষকের সব ক্লাসের গড় — কোর্স আলাদা করে নয়। আসন, ভর্তি আর দেখার সংখ্যা ডেমোর নমুনা তথ্য।</p>
        </div>
      </Band>

    </CatalogueRoot>
  );
}
