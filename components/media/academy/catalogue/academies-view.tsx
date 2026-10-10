import Link from "next/link";
import { ArrowRight, Building2, BookOpen, User, UsersRound } from "lucide-react";
import { courses, departments } from "@/data/media/academy";
import { BATCH_MAX, DEPT_COURSES, DEPT_KINDS } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";
import { DeptIcon } from "../departments/dept-icons";
import { AcademyLineup } from "./academy-lineup";
import { Band, BandTitle, Lean, twoDigits } from "./band";
import { primaryBtn, secondaryBtn } from "./buttons";
import { CatalogueNav } from "./catalogue-nav";
import { CatalogueRoot } from "./catalogue-root";
import type { AcademyEntry } from "./entries";
import { CatalogueRuler } from "./ruler";
import { ShareRow } from "./share-row";
import { toneStyle } from "./tones";

/** The two kinds of academy, each from the academy's own rules. */
const KINDS = [
  {
    Icon: User,
    title: DEPT_KINDS.solo,
    body: (
      <>
        একজন পেশাদারের নামে — তিনিই সব ক্লাস নেন। এক ব্যাচে বড়জোর <Num value={BATCH_MAX.solo} /> জন, তাই প্রত্যেকে শিক্ষকের চোখের সামনে।
      </>
    ),
  },
  {
    Icon: UsersRound,
    title: DEPT_KINDS.team,
    body: (
      <>
        কয়েকজন বন্ধু বা সহকর্মী মিলে — প্রত্যেকে নিজের ভাগটা পড়ান। এক ব্যাচে বড়জোর <Num value={BATCH_MAX.team} /> জন।
      </>
    ),
  },
  {
    Icon: Building2,
    title: "এক বা একাধিক বিভাগ",
    body: (
      <>
        বিশ্ববিদ্যালয়ের মতো একাডেমিও কয়েকটা বিভাগ খুলতে পারে। প্রতিটি বিভাগে ঠিক <Num value={DEPT_COURSES} />টি কোর্স।
      </>
    ),
  },
];

/**
 * একাডেমি — every academy side by side, laid out like the department
 * catalogue: a short opening with a strip of the academies to jump to, the
 * line-up, the two kinds of academy, and the way on to the departments.
 */
export function AcademiesView({ entries }: { entries: AcademyEntry[] }) {
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      <Band
        id="intro"
        n={1}
        label="একাডেমি"
        now
        note={
          <>
            <Num value={entries.length} />টি একাডেমি · <Num value={departments.length} />টি বিভাগ · <Num value={courses.length} />টি কোর্স
          </>
        }
      >
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            <Num value={entries.length} />টি একাডেমি। দক্ষ হাতের <Lean>বিশ্ববিদ্যালয়</Lean>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            গ্যারেজের মিস্ত্রি, রাঁধুনি, স্থপতি, তাঁতি, গায়িকা, কোচ — দেশের পেশাদাররা নিজের নামে বা বন্ধুদের নিয়ে একাডেমি খুলেছেন। একাডেমিতে ঢুকে দেখুন কারা শেখান, কীভাবে শেখান, কোন কোন বিভাগ আছে।
          </p>
          <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
            <Link href="/media/academy/departments" className={primaryBtn}>
              <Building2 className="size-4" aria-hidden />
              সব বিভাগ দেখুন
            </Link>
            <Link href="/media/academy/courses" className={secondaryBtn}>
              <BookOpen className="size-4" aria-hidden />
              সব কোর্স দেখুন
            </Link>
          </div>
          <ShareRow text="কাণ্ডারী তৈরি একাডেমি — দেশের পেশাদারদের সব একাডেমি এক জায়গায়" className="mt-6" />

          <nav aria-label="একাডেমিতে সরাসরি যান" data-reveal data-in className="mt-12">
            <ul className="flex flex-wrap gap-x-3 gap-y-6 sm:gap-x-5">
              {entries.map(({ academy: a, tone }) => (
                <li key={a.id} style={toneStyle(tone)} className="tone">
                  <a href={`#a-${a.id}`} className="group flex w-18 flex-col items-center gap-2 sm:w-20">
                    <span className="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none sm:size-20 sm:rounded-[1.3rem]">
                      <DeptIcon dept={a.departments[0].id} school={a.departments[0].school} className="size-9 sm:size-12" />
                    </span>
                    <span className="line-clamp-2 text-center text-xs leading-snug font-medium text-(--c-muted) transition-colors group-hover:text-(--c-app-ink)">{a.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Band>

      <Band id="lineup" n={2} label="সব একাডেমি" note="একাডেমিতে ঢুকে বিভাগ আর কোর্স দেখুন">
        <AcademyLineup entries={entries} />
      </Band>

      <Band id="kinds" n={3} label="একাডেমির ধরন" note="একক বা দলীয়">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            একজনের নামে, বা <Lean>বন্ধুরা</Lean> মিলে।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            ধরন যেটাই হোক, শেখা চলে একই নিয়মে — শুধু ব্যাচের মাপ আলাদা।
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3">
          {KINDS.map(({ Icon, title, body }, i) => (
            <li key={title} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-10 items-center justify-center border border-(--c-line) text-(--c-accent-ink)">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <h3 className="display mt-6 text-2xl text-(--c-ink-strong)">{title}</h3>
              <p className="mt-2 leading-relaxed text-(--c-muted)">{body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="start" rulerLabel="এরপর বিভাগ">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">একাডেমি → বিভাগ → কোর্স</p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            একাডেমি দেখলেন, এবার <Lean>বিভাগ</Lean>।
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">প্রতিটি বিভাগ একটা দক্ষতার ঘর — সব একাডেমির বিভাগ পাশাপাশি দেখে নিজের পথটা ধরুন।</p>
          <div className="mt-10">
            <Link href="/media/academy/departments" className={primaryBtn}>
              বিভাগে চলুন
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Band>
    </CatalogueRoot>
  );
}
