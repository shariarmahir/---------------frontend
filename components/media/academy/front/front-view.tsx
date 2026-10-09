import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2, Landmark, MessageCircleQuestion, Play } from "lucide-react";
import { academies, classVideos, courses, departments, getCourse, getDepartment } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, LEVELS } from "@/lib/media/academy";
import { Num, Taka } from "../../ui/numerals";
import { DeptIcon } from "../departments/dept-icons";
import { AssetCard, AssetGrid, FrameImage, frameClass } from "../catalogue/asset-card";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { factsOf } from "../finder/facts";
import { JOURNEY_QA } from "../finder/journey-faq";
import { AcademyCards } from "./academy-cards";
import { FinderCards } from "./finder-cards";
import { JourneyCards } from "./journey-cards";
import { VideoCards, type VideoEntry } from "./video-cards";


/** This week's free classes, newest first — the "promotional videos" of the academy. */
function freeClasses(): VideoEntry[] {
  return classVideos
    .filter((v) => v.access === "free" && !v.short)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6)
    .map((video) => {
      const course = getCourse(video.course);
      return {
        video,
        image: course?.image,
        teacher: personOrThrow(video.teacher).nameBn,
        academy: (course && getDepartment(course.dept)?.academy.name) ?? "",
      };
    });
}

/**
 * The academy's front page, "একাডেমি খুঁজুন", laid out after
 * getartcraft.com/press-kit: a short opening, then band after band of
 * square cards in a hairline grid — the three questions, every academy,
 * every department with its academy, this week's free classes, every
 * course, the nine steps and the first questions — and a last word.
 */
export function FrontView() {
  const videos = freeClasses();

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="একাডেমি" now note="একাডেমি · বিভাগ · কোর্স · ক্লাস">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            একাডেমি <Turn>খুঁজুন</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            দেশের পেশাদারদের ছোট ছোট বিশ্ববিদ্যালয় — একজনের নামে, বা কয়েকজন বন্ধু মিলে। নিচে <Num value={academies.length} />টি একাডেমি, তাদের <Num value={departments.length} />টি বিভাগ, <Num value={courses.length} />টি কোর্স আর এ সপ্তাহের বিনামূল্যের ক্লাস। তিন প্রশ্নের উত্তর দিলে মিলিয়ে সাজিয়ে দেব।
          </p>
        </div>
      </Band>

      <Band id="finder" n={2} label="তিন প্রশ্ন" note="স্বপ্ন · পছন্দ · প্রতিভা">
        <FinderCards />
      </Band>

      <Band id="academies" n={3} label="সব একাডেমি" note="মিলে যাওয়াটা আগে">
        <AcademyCards />
      </Band>

      <Band id="departments" n={4} label="সব বিভাগ" note="প্রতিটি বিভাগ, আর যে একাডেমি চালায়">
        <AssetGrid count={departments.length}>
          {departments.map((d, i) => {
            const fees = factsOf({ departments: [d] }).fees;
            return (
              <li key={d.id} className="bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: Building2, label: "বিভাগ" }}
                  n={i + 1}
                  style={toneStyle(i)}
                  className="tone"
                  frame={
                    <div className={frameClass}>
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid size-28 place-items-center rounded-[1.75rem] bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover/frame:scale-[1.04]">
                          <DeptIcon dept={d.id} school={d.school} className="size-16" />
                        </span>
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
                      <Link href={`/media/academy/a/${d.academy.id}`} className="inline-flex items-center gap-1.5 font-semibold text-(--c-ink) decoration-(--c-app) decoration-2 underline-offset-4 hover:underline">
                        <Landmark className="size-3.5 text-(--c-app-ink)" aria-hidden />
                        {d.academy.name}
                      </Link>
                      <p className="mt-1.5">{d.blurb}</p>
                    </>
                  }
                  action={{
                    href: `/media/academy/dept/${d.id}`,
                    label: "বিভাগে ঢুকুন",
                    icon: ArrowUpRight,
                    aside: fees.max === 0 ? "বিনা ফি" : fees.min === 0 ? "বিনা ফি থেকে" : <><Taka amount={fees.min} /> থেকে</>,
                  }}
                />
              </li>
            );
          })}
        </AssetGrid>
      </Band>

      <Band id="videos" n={5} label="ক্লাস ভিডিও" note="এ সপ্তাহের বিনামূল্যের ক্লাস">
        <VideoCards entries={videos} />
      </Band>

      <Band id="courses" n={6} label="কোর্স" note={<><Num value={courses.length} />টি কোর্স, প্রতিটি <Num value={COURSE_DAYS} /> দিনের</>}>
        <AssetGrid count={courses.length}>
          {courses.map((c, i) => {
            const dept = getDepartment(c.dept);
            return (
              <li key={c.id} className="bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: BookOpen, label: <span className="font-mono tracking-[0.08em]">{c.id}</span> }}
                  n={i + 1}
                  frame={<div className={frameClass}>{c.image && <FrameImage src={c.image} alt="" />}</div>}
                  title={c.title}
                  text={<p className="line-clamp-2">{c.outcome}</p>}
                  extra={
                    <p className="hud mt-3 text-(--c-faint)">
                      {LEVELS[c.level]} · {dept?.academy.name}
                    </p>
                  }
                  action={{ href: `/media/academy/course/${c.id}`, label: "কোর্স দেখুন", icon: ArrowUpRight, aside: c.fee ? <Taka amount={c.fee} /> : "বিনা ফি" }}
                />
              </li>
            );
          })}
        </AssetGrid>
      </Band>

      <Band id="journey" n={7} label="যাত্রা" note="একাডেমি থেকে সমাবর্তন">
        <JourneyCards />
      </Band>

      <Band id="faq" n={8} label="প্রশ্ন" note="প্রথমবার যাঁরা আসেন">
        <AssetGrid count={JOURNEY_QA.length}>
          {JOURNEY_QA.map((qa, i) => (
            <li key={qa.q} className="bg-(--c-bg)">
              <AssetCard kind={{ icon: MessageCircleQuestion, label: "প্রশ্ন" }} n={i + 1} title={qa.q} text={<p>{qa.a}</p>} />
            </li>
          ))}
        </AssetGrid>
      </Band>

      <Band id="start" rulerLabel="শুরু করুন">
        <div className="flex flex-col items-center px-6 py-16 text-center md:py-24">
          <p className="hud text-(--c-faint)">কোথা থেকে শুরু, বুঝতে পারছেন না?</p>
          <BandTitle className="mt-6 max-w-2xl text-4xl sm:text-5xl md:text-5xl">
            আগে একটা <Turn>ক্লাস</Turn> দেখুন।
          </BandTitle>
          <p className="mt-5 max-w-lg leading-relaxed text-(--c-muted)">প্রতি সপ্তাহে প্রতিটি শিক্ষক একটা ক্লাস সবার জন্য খুলে দেন। কে কীভাবে শেখান দেখে নিন — তারপর ভর্তি।</p>
          <Link href="/media/academy/videos" className={`${primaryBtn} mt-8`}>
            <Play className="size-4" aria-hidden />
            বিনামূল্যের ক্লাস দেখুন
          </Link>
        </div>
      </Band>

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
