import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, Flag, GraduationCap, Hammer, Landmark, MapPin, MessageCircleQuestion, Quote, ShieldCheck, Star, UserRound, UsersRound, Video } from "lucide-react";
import { board, departments, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, TIERS, type Academy } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { RememberAcademy } from "../departments/recent";
import { AssetCard, AssetGrid, frameClass } from "../catalogue/asset-card";
import { Band, BandTitle, Lean, Turn, twoDigits } from "../catalogue/band";
import { blockBtn, primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CourseLineup } from "../catalogue/course-lineup";
import { DeptCard } from "../catalogue/dept-card";
import { courseEntries, deptEntries } from "../catalogue/entries";
import { fillRow, lineupGrid } from "../catalogue/fill-row";
import { CatalogueRuler } from "../catalogue/ruler";
import { ShareRow } from "../catalogue/share-row";
import { toneStyle } from "../catalogue/tones";
import type { AcademyFacts } from "../finder/facts";
import { JOURNEY_QA } from "../finder/journey-faq";
import { standingOf } from "../parts";
import { FutureCells } from "./future-cells";
import { FinderMatch, ProfileCover } from "./profile-art";

/** A department keeps its catalogue colour everywhere. */
const toneOf = (id: string) => departments.findIndex((d) => d.id === id);

/**
 * একাডেমির বিস্তারিত — an academy's own page, step two of the road, in the
 * catalogue's bands: who they are and their record; why their skill matters
 * and how they teach; the teachers; the departments and every course, with
 * "আপনি কোথায় আছেন?"; the learner's forty days drawn in real dates; the
 * stories of those who passed; the usual questions; and the next step.
 */
export function AcademyProfile({ academy: a, facts: f }: { academy: Academy; facts: AcademyFacts }) {
  const first = a.departments[0];
  const ids = a.departments.map((d) => d.id);
  const tone = toneOf(first.id);
  const depts = deptEntries().filter((e) => ids.includes(e.dept.id));
  const courses = courseEntries(ids);
  const passes = board.filter((s) => s.certificate && f.courses.some((c) => c.id === s.course));
  const places = [...new Set(a.departments.map((d) => d.place).filter((p): p is string => Boolean(p)))];
  // The heading turns on the name's last word: "একাডেমি", "স্টুডিও", "পাঠশালা".
  const cut = a.name.lastIndexOf(" ");
  const [base, last] = cut > 0 ? [a.name.slice(0, cut), a.name.slice(cut + 1)] : ["", a.name];
  // Learners' own words, each with their certificate when they passed; then passes no one wrote about.
  const voices = a.teachers.flatMap((h) => (teacherRecord(h)?.stories ?? []).map((st) => ({ ...st, teacher: personOrThrow(h).nameBn, pass: passes.find((p) => p.learner === st.name) })));
  const unsung = passes.filter((p) => !voices.some((v) => v.pass === p));
  const stories = voices.length + unsung.length;
  const KindIcon = a.kind === "team" ? UsersRound : UserRound;

  const stats = [
    { k: "বিভাগ", v: <Num value={a.departments.length} /> },
    { k: "কোর্স", v: <Num value={f.courses.length} /> },
    { k: "গ্র্যাজুয়েট", v: <Num value={f.graduates} /> },
    {
      k: f.rating.count ? (
        <>
          রেটিং · <Num value={f.rating.count} />
          টি
        </>
      ) : (
        "রেটিং"
      ),
      v: f.rating.count ? (
        <span className="inline-flex items-center gap-2">
          <Num value={f.rating.avg} />
          <Star className="size-6 fill-(--c-signal) text-(--c-signal)" aria-hidden />
        </span>
      ) : (
        "নতুন"
      ),
    },
  ];

  const ways = [
    {
      Icon: Video,
      title: (
        <>
          প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস
        </>
      ),
      body: "না ধরতে পারলে রেকর্ডিং থাকে।",
    },
    { Icon: Hammer, title: places.length ? "হাতে-কলমের কর্মশালা" : "নিজের হাতে প্রজেক্ট", body: places[0] ?? "শেষে প্যানেলের সামনে দেখান।" },
    { Icon: Award, title: "দুই পরীক্ষকের প্যানেল", body: "পাস করলে যাচাইযোগ্য সনদ।" },
    { Icon: ShieldCheck, title: "ফি এসক্রোতে", body: "ক্লাস হলে তবেই শিক্ষক পান।" },
  ];

  return (
    <CatalogueRoot className="min-h-full">
      <RememberAcademy id={a.id} />
      <CatalogueNav />
      <CatalogueRuler />

      <Band
        id="intro"
        n={1}
        label="একাডেমি"
        now
        note={
          <>
            {DEPT_KINDS[a.kind]} · প্রতিষ্ঠা <DateText iso={a.founded} />
          </>
        }
      >
        <div style={toneStyle(tone)} className="tone grid gap-14 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <nav aria-label="অবস্থান" data-reveal data-in className="hud flex flex-wrap items-center gap-2 text-(--c-faint)">
              <Link href="/media/academy/academies" className="transition-colors hover:text-(--c-ink-strong)">
                সব একাডেমি
              </Link>
              <span aria-hidden>/</span>
              <span className="text-(--c-muted)">{a.name}</span>
            </nav>
            <p data-reveal data-in className="hud mt-8 inline-flex items-center gap-1.5 border border-(--c-line) px-2 py-1 text-(--c-app-ink)">
              <KindIcon className="size-3.5" aria-hidden />
              {DEPT_KINDS[a.kind]}
            </p>
            <BandTitle as="h1" now className="mt-5 text-4xl sm:text-5xl lg:text-[3.3rem] xl:text-6xl">
              {base} <Turn>{last}</Turn>।
            </BandTitle>
            <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
              {a.about}
            </p>
            <FinderMatch academy={a} />
            <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
              <a href="#courses" className={primaryBtn}>
                বিভাগ ও কোর্স
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <a href="#future" className={secondaryBtn}>
                <Flag className="size-4" aria-hidden />
                নিজের ভবিষ্যৎ আঁকুন
              </a>
            </div>
            <div data-reveal data-in className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="#teachers" className="group flex items-center gap-3">
                <span className="flex -space-x-2" aria-hidden>
                  {a.teachers.slice(0, 5).map((h) => (
                    <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-(--c-bg)" />
                  ))}
                </span>
                <span className="hud text-(--c-muted) transition-colors group-hover:text-(--c-ink-strong)">
                  <Num value={a.teachers.length} /> জন শিক্ষক
                </span>
              </a>
              <ShareRow text={`${a.name} — কাণ্ডারী তৈরি একাডেমি`} />
            </div>
          </div>
          <div data-reveal data-in>
            <ProfileCover dept={first} fallback={f.courses.find((c) => c.image)?.image} />
          </div>
        </div>

        <dl data-reveal-group className="grid grid-cols-2 gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-4">
          {stats.map(({ k, v }, i) => (
            <div key={i} data-reveal className="flex flex-col-reverse bg-(--c-bg) px-6 py-6 md:px-10">
              <dt className="hud mt-2 text-(--c-faint)">{k}</dt>
              <dd className="display text-4xl leading-none text-(--c-ink-strong) md:text-5xl">{v}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Band id="about" n={2} label="পরিচিতি" note="কেন এই দক্ষতা, কীভাবে শেখান">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            কেন এই একাডেমি, কেন এই <Lean>দক্ষতা</Lean>।
          </BandTitle>
        </div>
        <div className="grid gap-px border-t border-(--c-line) bg-(--c-line) lg:grid-cols-3">
          <div className="flex flex-col gap-px lg:col-span-2">
            {a.departments.map((d) => (
              <article key={d.id} data-reveal style={toneStyle(toneOf(d.id))} className="tone bg-(--c-bg) p-6 md:p-10">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)]">
                    <DeptIcon dept={d.id} school={d.school} className="size-9" />
                  </span>
                  <h3 className="display text-2xl text-(--c-ink-strong)">
                    {d.name} <span className="text-(--c-app-ink)">বিভাগ</span>
                  </h3>
                </div>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">{d.blurb}</p>
                <p className="hud mt-8 text-(--c-faint)">কোর্স শেষে আপনি পারবেন</p>
                <ul className="mt-3 border-t border-(--c-line)">
                  {courses
                    .filter((e) => e.dept.id === d.id)
                    .map(({ course: c }) => (
                      <li key={c.id} className="flex gap-3 border-b border-(--c-line) py-3 leading-relaxed text-(--c-ink)">
                        <BadgeCheck className="mt-1 size-4.5 shrink-0 text-(--c-app-ink)" aria-hidden />
                        <span>
                          {c.outcome} <span className="hud font-mono tracking-[0.06em] text-(--c-faint)">{c.id}</span>
                        </span>
                      </li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
          <div data-reveal className="flex flex-col bg-(--c-bg) p-6 md:p-10">
            <p className="hud text-(--c-faint)">যা করে দেখিয়েছে</p>
            <dl className="mt-6 border-t border-(--c-line)">
              {[
                [f.graduates, "পাস করেছেন"],
                [passes.length, "সনদ প্রকাশ্য বোর্ডে"],
                [f.stories, "সাফল্যের গল্প"],
              ].map(([n, k]) => (
                <div key={k as string} className="flex items-baseline justify-between gap-4 border-b border-(--c-line) py-4">
                  <dt className="text-sm text-(--c-muted)">{k}</dt>
                  <dd className="display text-4xl leading-none text-(--c-ink-strong)">
                    <Num value={n as number} />
                  </dd>
                </div>
              ))}
            </dl>
            {places.length > 0 && (
              <div className="mt-8">
                <p className="hud text-(--c-faint)">হাতে-কলমের জায়গা</p>
                <ul className="mt-3 space-y-2">
                  {places.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-relaxed text-(--c-ink)">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-(--c-signal)" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <ul data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 lg:grid-cols-4">
          {ways.map(({ Icon, title, body }, i) => (
            <li key={i} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-10 items-center justify-center border border-(--c-line) text-(--c-accent-ink)">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <h3 className="display mt-6 text-lg leading-snug text-(--c-ink-strong)">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{body}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band id="teachers" n={3} label="শিক্ষক" note="প্যানেল ইন্টারভিউ পেরিয়ে আসা">
        <AssetGrid count={a.teachers.length}>
          {a.teachers.map((h, i) => {
            const p = personOrThrow(h);
            const r = teacherRecord(h);
            const standing = r && standingOf(r);
            return (
              <li key={h} className="bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: GraduationCap, label: standing ? TIERS[standing.tier] : "শিক্ষক" }}
                  n={i + 1}
                  style={toneStyle(tone + i)}
                  className="tone"
                  frame={
                    <Link href={`/media/academy/teachers/${h}`} aria-label={p.nameBn} className={frameClass}>
                      <span className="absolute inset-0 grid place-items-center">
                        <PersonAvatar person={p} size="xl" className="size-28 text-4xl ring-4 ring-(--c-app) transition-transform duration-500 group-hover/frame:scale-[1.04] motion-reduce:transition-none" />
                      </span>
                    </Link>
                  }
                  title={p.nameBn}
                  text={<p className="line-clamp-2">{r?.title ?? p.headline}</p>}
                  extra={
                    r && (
                      <p className="hud mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-(--c-faint)">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="size-3.5" aria-hidden />
                          <Num value={r.graduates} /> জন পাস
                        </span>
                        {r.rating.count > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5" aria-hidden />
                            <Num value={r.rating.avg} /> রেটিং
                          </span>
                        )}
                      </p>
                    )
                  }
                  action={{
                    href: `/media/academy/teachers/${h}`,
                    label: "শিক্ষককে চিনুন",
                    icon: ArrowUpRight,
                    aside: standing && (
                      <>
                        <Num value={standing.points.total} /> পয়েন্ট
                      </>
                    ),
                  }}
                />
              </li>
            );
          })}
        </AssetGrid>
      </Band>

      <Band id="departments" n={4} label="বিভাগ" note={<>প্রতিটি বিভাগে তিনটি কোর্স</>}>
        <div className="@container">
          <div data-reveal-group className={lineupGrid}>
            {depts.map((entry, i) => (
              <DeptCard key={entry.dept.id} entry={entry} n={i + 1} tone={toneOf(entry.dept.id)} />
            ))}
            <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(depts.length))}>
              <p className="hud text-(--c-faint)">আরও পথ</p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                অন্য একাডেমির <Lean>বিভাগও</Lean> দেখুন।
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
                দেশের <Num value={departments.length} />
                টি বিভাগ পাশাপাশি — মিলিয়ে দেখে নিন।
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

      <Band id="courses" n={5} label="কোর্স" note="নিজের স্তর মিলিয়ে দেখুন">
        <CourseLineup
          entries={courses}
          last={
            <>
              <p className="hud text-(--c-faint)">আরও কোর্স</p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                সব একাডেমির <Lean>কোর্স</Lean>।
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">স্তর ধরে মিলিয়ে দেখুন, কোথায় কোন কোর্স আছে।</p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/courses" className={blockBtn}>
                  সব কোর্স
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </>
          }
        />
      </Band>

      <Band id="future" n={6} label="ভবিষ্যৎ" note="আসল তারিখে আপনার পথ">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            আজ থেকে <Num value={COURSE_DAYS} /> দিন — নিজের <Turn>ভবিষ্যৎ</Turn> আঁকুন।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            একটা কোর্স ধরুন, এক লাইনে লিখুন শেষে আপনি কী পারবেন। পাশে সবচেয়ে কাছের খোলা ব্যাচের তারিখে আপনার পথ।
          </p>
        </div>
        <FutureCells academy={a} courses={f.courses} />
      </Band>

      {stories > 0 && (
        <Band id="stories" n={7} label="গল্প" note="যাঁরা এখান থেকে পাস করেছেন">
          <AssetGrid count={stories}>
            {voices.map((v, i) => (
              <li key={`v-${v.name}`} className="bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: Quote, label: "শিক্ষার্থীর কথা" }}
                  n={i + 1}
                  title={v.name}
                  text={<p className="text-base text-(--c-ink)">“{v.text}”</p>}
                  extra={
                    <p className="hud mt-4 flex flex-wrap gap-x-3 text-(--c-faint)">
                      <span>শিক্ষক {v.teacher}</span>
                      {v.pass && <span className="font-mono tracking-[0.06em] text-(--c-accent-ink)">{v.pass.certificate}</span>}
                    </p>
                  }
                  action={v.pass && { href: "/media/academy/exam#board", label: "প্রকাশ্য বোর্ডে দেখুন", icon: ArrowUpRight }}
                />
              </li>
            ))}
            {unsung.map((p, i) => (
              <li key={p.id} className="bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: Award, label: "সনদ" }}
                  n={voices.length + i + 1}
                  title={p.learner}
                  text={<p>{p.project}</p>}
                  extra={
                    <p className="hud mt-4 flex flex-wrap gap-x-3 text-(--c-faint)">
                      <span className="font-mono tracking-[0.06em] text-(--c-accent-ink)">{p.certificate}</span>
                      <span>
                        {p.course} · {p.district}
                      </span>
                    </p>
                  }
                  action={{ href: "/media/academy/exam#board", label: "প্রকাশ্য বোর্ডে দেখুন", icon: ArrowUpRight }}
                />
              </li>
            ))}
          </AssetGrid>
        </Band>
      )}

      <Band id="faq" n={stories > 0 ? 8 : 7} label="প্রশ্ন" note="প্রথমবার যাঁরা আসেন">
        <AssetGrid count={JOURNEY_QA.length}>
          {JOURNEY_QA.map((qa, i) => (
            <li key={qa.q} className="bg-(--c-bg)">
              <AssetCard kind={{ icon: MessageCircleQuestion, label: "প্রশ্ন" }} n={i + 1} title={qa.q} text={<p>{qa.a}</p>} />
            </li>
          ))}
        </AssetGrid>
      </Band>

      <Band id="start" rulerLabel="এরপর বিভাগ">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">একাডেমি → বিভাগ → কোর্স</p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            {a.departments.length > 1 ? (
              <>
                এবার <Turn>বিভাগে</Turn> চলুন।
              </>
            ) : (
              <>
                {first.name} <Turn>বিভাগে</Turn> ঢুকুন।
              </>
            )}
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            তারপর নিজের স্তরের কোর্স, এক ফর্মে ভর্তি — <Num value={COURSE_DAYS} /> দিনের যাত্রা শুরু।
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {a.departments.map((d, i) => (
              <Link key={d.id} href={`/media/academy/dept/${d.id}`} className={i === 0 ? primaryBtn : secondaryBtn}>
                {i === 0 && <Landmark className="size-4" aria-hidden />}
                {d.name} বিভাগ
              </Link>
            ))}
            <Link href="/media/academy/academies" className={secondaryBtn}>
              অন্য একাডেমি
            </Link>
          </div>
        </div>
      </Band>

    </CatalogueRoot>
  );
}
