import Link from "next/link";
import { ArrowRight, Award, BookOpen, CalendarDays, Landmark, ShieldCheck, Sparkles, UsersRound, Video, type LucideIcon } from "lucide-react";
import { academies, courses } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_COURSES, FINAL_DAYS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { DeptIcon } from "../departments/dept-icons";
import { Band, BandTitle, Lean, twoDigits } from "./band";
import { blockBtn, primaryBtn, secondaryBtn } from "./buttons";
import { CatalogueFooter } from "./catalogue-footer";
import { CatalogueNav } from "./catalogue-nav";
import { CatalogueRoot } from "./catalogue-root";
import { DeptCard } from "./dept-card";
import type { DeptEntry } from "./entries";
import { fillRow, lineupGrid } from "./fill-row";
import { CatalogueRuler } from "./ruler";
import { ShareRow } from "./share-row";
import { toneStyle } from "./tones";


/** The rules every department keeps, each from the academy's own constants. */
const RULES: { Icon: LucideIcon; title: React.ReactNode; body: React.ReactNode }[] = [
  {
    Icon: BookOpen,
    title: <>ঠিক <Num value={DEPT_COURSES} />টি কোর্স</>,
    body: "প্রতিটি বিভাগে তিনটি কোর্স, স্তর লেখা থাকে — শুরু থেকে, মাঝারি বা অভিজ্ঞ। যেখানে আছেন, সেখান থেকে ধরুন।",
  },
  {
    Icon: CalendarDays,
    title: <><Num value={COURSE_DAYS} /> দিনে শেষ</>,
    body: <><Num value={CLASS_WEEKS} /> সপ্তাহ ক্লাস, তারপর <Num value={FINAL_DAYS} /> দিন নিজের প্রজেক্ট আর প্যানেল। বছরের পর বছর নয়।</>,
  },
  {
    Icon: UsersRound,
    title: "ছোট ব্যাচ",
    body: <>একক একাডেমিতে এক ব্যাচে বড়জোর <Num value={BATCH_MAX.solo} /> জন, দলীয় একাডেমিতে <Num value={BATCH_MAX.team} /> জন — প্রত্যেকে শিক্ষকের চোখের সামনে।</>,
  },
  {
    Icon: Video,
    title: <><Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস</>,
    body: "সপ্তাহে একটা, রুটিনে ঠিক করা দিনে আর সময়ে। না ধরতে পারলে রেকর্ডিং আছে, হোমওয়ার্ক জমা ক্লাসরুমেই।",
  },
  {
    Icon: ShieldCheck,
    title: "টাকা এসক্রোতে",
    body: "প্রতিটি ক্লাস হলে সেই সপ্তাহের ভাগ শিক্ষক পান; ক্লাস না হলে সেই ভাগ আপনার কাছে ফেরত আসে।",
  },
  {
    Icon: Award,
    title: "যাচাইযোগ্য সনদ",
    body: "খাতার পরীক্ষা নয় — নিজের হাতের প্রজেক্ট আর দুই পরীক্ষকের প্যানেল। পাস করলে সনদের আইডি, নাম ওঠে প্রকাশ্য বোর্ডে।",
  },
];

/**
 * বিভাগ বাছুন — step three of the road, laid out as a catalogue: every
 * department of every academy side by side on charcoal or ash, each card naming
 * the academy that runs it. A strip of their icons to jump to one, the
 * line-up, the rules they all keep, and a way back to the finder.
 */
export function DepartmentsView({ entries }: { entries: DeptEntry[] }) {
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      <Band
        id="intro"
        n={1}
        label="বিভাগ বাছুন"
        now
        note={
          <>
            <Num value={entries.length} />টি বিভাগ · <Num value={academies.length} />টি একাডেমি · <Num value={courses.length} />টি কোর্স
          </>
        }
      >
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            <Num value={entries.length} />টি বিভাগ। আপনার একটাই <Lean>পথ</Lean>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            কোড আর যন্ত্র, বাড়ির নকশা, গ্যারেজ আর রান্নাঘর, গান, রং আর তাঁত, ক্যামেরা, হিসাব, সাজ, মাঠ আর অঙ্ক। দেশের <Num value={academies.length} />টি একাডেমির সব বিভাগ এক জায়গায় — মনের মতোটায় ঢুকে কোর্স বাছুন।
          </p>
          <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
            <Link href="/media/academy" className={primaryBtn}>
              <Sparkles className="size-4" aria-hidden />
              তিন প্রশ্নে মিলিয়ে নিন
            </Link>
            <Link href="/media/academy#academies" className={secondaryBtn}>
              <Landmark className="size-4" aria-hidden />
              একাডেমিগুলো দেখুন
            </Link>
          </div>
          <ShareRow text="কাণ্ডারী তৈরি একাডেমির সব বিভাগ — নিজের দক্ষতার পথ বেছে নিন" className="mt-6" />

          <nav aria-label="বিভাগে সরাসরি যান" data-reveal data-in className="mt-12">
            <ul className="flex flex-wrap gap-x-3 gap-y-6 sm:gap-x-5">
              {entries.map(({ dept: d }, i) => (
                <li key={d.id} style={toneStyle(i)} className="tone">
                  <a href={`#d-${d.id}`} className="group flex w-18 flex-col items-center gap-2 sm:w-20">
                    <span className="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none sm:size-20 sm:rounded-[1.3rem]">
                      <DeptIcon dept={d.id} school={d.school} className="size-9 sm:size-12" />
                    </span>
                    <span className="line-clamp-2 text-center text-xs leading-snug font-medium text-(--c-muted) transition-colors group-hover:text-(--c-app-ink)">{d.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Band>

      <Band id="lineup" n={2} label="সব বিভাগ" note="বিভাগে ঢুকে কোর্স বাছুন">
        <div className="@container">
          <div data-reveal-group className={lineupGrid}>
            {entries.map((entry, i) => (
              <DeptCard key={entry.dept.id} entry={entry} n={i + 1} />
            ))}
            <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(entries.length))}>
              <p className="hud text-(--c-faint)">এরপর</p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                আরও বিভাগ <Lean>আসছে</Lean>।
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">কোনো কাজে আপনার হাত পাকা? নিজের নামে বা বন্ধুদের নিয়ে একাডেমি খুলুন — প্রথম বিভাগ চালু হবে আপনার হাতেই।</p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/teach" className={blockBtn}>
                  একাডেমি খুলুন
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Band>

      <Band id="rules" n={3} label="নিয়ম" note="সব বিভাগে একই">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            শেখার নিয়ম <Lean>সবখানে</Lean> এক।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            যে বিভাগই বাছুন, শেখা চলে একই নিয়মে। ভর্তির আগেই জেনে নিন কী পাচ্ছেন।
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3">
          {RULES.map(({ Icon, title, body }, i) => (
            <li key={i} data-reveal className="bg-(--c-bg) p-6 md:p-8">
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

      <Band id="start" rulerLabel="শুরু করুন">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">
            ধাপ <Num value={3} /> থেকে ধাপ <Num value={4} />
          </p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            বিভাগ বাছুন, <Lean>কোর্সে</Lean> চলুন।
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">কোনটা আপনার, ঠিক বুঝতে পারছেন না? তিনটি প্রশ্নের উত্তর দিন — স্বপ্ন, পছন্দ আর প্রতিভা মিলিয়ে একাডেমি দেখিয়ে দেব।</p>
          <div className="mt-10">
            <Link href="/media/academy" className={primaryBtn}>
              <Sparkles className="size-4" aria-hidden />
              তিন প্রশ্নে খুঁজুন
            </Link>
          </div>
        </div>
      </Band>

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
