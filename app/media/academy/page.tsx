import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeptFooter } from "@/components/media/academy/departments/dept-footer";
import { FinderView } from "@/components/media/academy/finder/finder-view";
import { JOURNEY_QA } from "@/components/media/academy/finder/journey-faq";
import { JourneyMap } from "@/components/media/academy/finder/journey-map";
import { Faq } from "@/components/media/academy/home/plus/faq";
import { Voices, type Voice } from "@/components/media/academy/home/plus/voices";
import { mediaButton } from "@/components/media/ui/button-styles";
import { Num } from "@/components/media/ui/numerals";
import { board, getDepartment, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS } from "@/lib/media/academy";

export const metadata: Metadata = {
  title: "একাডেমি খুঁজুন · কাণ্ডারী তৈরি একাডেমি",
  description: "বিশ্ববিদ্যালয়ের মতোই — একাডেমি খুঁজুন, বিভাগ আর কোর্স বেছে ভর্তি হোন, রুটিনে ক্লাস, পরীক্ষা দিয়ে সমাবর্তন। চল্লিশ দিনে, দেশের পেশাদারদের হাতে-কলমে।",
};

/**
 * The academy's first view — "একাডেমি খুঁজুন": the finder in a blue hero,
 * the academies best match first, the nine-step road that explains the
 * whole academy, learners' words, questions, a last call and the footer.
 */
export default function AcademyPage() {
  const voices: Voice[] = teacherRecords
    .flatMap((r) =>
      r.stories.map((st) => ({
        name: st.name,
        text: st.text,
        from: `${getDepartment(r.dept)?.academy.name ?? ""} · শিক্ষক ${personOrThrow(r.handle).nameBn}`,
        certificate: board.find((b) => b.learner === st.name && b.certificate)?.certificate,
      })),
    )
    .sort((a, b) => Number(Boolean(b.certificate)) - Number(Boolean(a.certificate)))
    .slice(0, 9);

  return (
    <>
      <div className="-mx-3 bg-m-canvas px-3 pb-24 sm:-mx-6 sm:px-6">
        <FinderView />
        <JourneyMap className="mx-auto max-w-7xl pt-24" />
        <Voices voices={voices} title="যাঁরা পথটা পেরিয়েছেন, তাঁদের কথা" className="mx-auto max-w-7xl pt-24" />
        <Faq items={JOURNEY_QA} title="প্রথমবার? এই প্রশ্নগুলো সবার আগে আসে" className="mx-auto max-w-3xl pt-24" />

        <section aria-labelledby="last-call" className="mx-auto mt-24 max-w-5xl">
          <div className="blue-band relative overflow-hidden rounded-[2rem] px-6 py-12 text-center shadow-m-lift sm:px-12">
            <p className="relative text-sm font-bold text-m-yellow">এখনই সময়</p>
            <h2 id="last-call" className="relative mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] leading-tight font-bold text-balance">
              আজ একাডেমি বাছুন — <Num value={COURSE_DAYS} /> দিন পর নিজের হাতে প্রমাণ
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-[15px] text-white/85">ভর্তি পরীক্ষা নেই · ফি থাকে এসক্রোতে · পরীক্ষা প্রকাশ্য প্যানেলে</p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <a href="#academies" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-m-yellow px-6 text-[15px] font-bold text-m-ink shadow-m-tile">
                একাডেমি খুঁজুন <ArrowRight className="size-4.5" aria-hidden />
              </a>
              <Link href="/media/academy/videos" className={mediaButton({ variant: "outline", size: "lg", className: "h-12 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white" })}>
                আগে একটা বিনামূল্যের ক্লাস দেখুন
              </Link>
            </div>
          </div>
        </section>
      </div>
      <DeptFooter />
    </>
  );
}
