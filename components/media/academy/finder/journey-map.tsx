"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CLASS_MINUTES, FINAL_DAYS } from "@/lib/media/academy";
import { PHASES, STEPS, type Phase, type StepId } from "@/lib/media/journey";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { STEP_ICON } from "../journey/journey";

/** What each step means, in a line a first-timer understands. */
const SAYS: Record<StepId, React.ReactNode> = {
  find: "তিন প্রশ্নে স্বপ্ন মিলিয়ে দেখুন কোন একাডেমি আপনার।",
  academy: "শিক্ষক কারা, কী শেখান, যাঁরা পাস করেছেন তাঁরা কী করছেন।",
  dept: "একাডেমির কোন বিভাগে, কোন দক্ষতার পথে যাবেন।",
  course: "নিজের স্তরের কোর্স — শুরু থেকে, মাঝারি বা অভিজ্ঞ।",
  admit: "নাম, মোবাইল, ব্যাচের সময় আর পেমেন্ট — এক ফর্মেই ভর্তি।",
  routine: (
    <>
      প্রতি সপ্তাহে একটা <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস — দিন-তারিখসহ রুটিন।
    </>
  ),
  class: "লাইভ ক্লাস, রেকর্ডিং, হোমওয়ার্ক আর ব্যাচের আড্ডা — এক ক্লাসরুমে।",
  exam: (
    <>
      শেষ <Num value={FINAL_DAYS} /> দিনে নিজের প্রজেক্ট, দুই পরীক্ষকের প্যানেল।
    </>
  ),
  graduate: "পাস করলে যাচাইযোগ্য সনদ, নাম ওঠে প্রকাশ্য বোর্ডে।",
};

const TONE: Record<Phase, { chip: string; dot: string; card: string }> = {
  choose: { chip: "bg-m-blue-soft text-m-blue", dot: "bg-m-blue text-m-on", card: "bg-white" },
  admit: { chip: "bg-m-amber-soft text-m-gold", dot: "bg-m-yellow text-m-ink", card: "bg-m-amber-soft/60" },
  study: { chip: "bg-m-green-soft text-m-green", dot: "bg-m-green text-m-on", card: "bg-white" },
};

/**
 * The nine steps drawn as one road, the way every student here already
 * knows university life — choosing, admission, study — so the first visit
 * explains the whole academy without a manual.
 */
export function JourneyMap({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <section id="journey" aria-labelledby="journey-title" className={cn("scroll-mt-24", className)}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold text-m-blue">যেভাবে চলে</p>
        <h2 id="journey-title" className="mt-2 text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight font-bold text-balance text-m-ink">
          বিশ্ববিদ্যালয়ের মতোই — <Num value={STEPS.length} /> ধাপে আপনার একাডেমি জীবন
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-m-ink/70">ভর্তি, রুটিন, ক্লাস, পরীক্ষা, সমাবর্তন — চেনা পথ, শুধু চল্লিশ দিনে আর হাতে-কলমে।</p>
      </div>

      <ol className="relative mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-9 lg:gap-2">
        {/* The road under the stations, on wide screens. */}
        <motion.span
          aria-hidden
          className="absolute top-7 right-[5%] left-[5%] hidden h-1 origin-left rounded-full bg-linear-to-r from-m-blue via-m-yellow to-m-green lg:block"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {STEPS.map((s, i) => {
          const Icon = STEP_ICON[s.id];
          const t = TONE[s.phase];
          const firstOfPhase = i === 0 || STEPS[i - 1].phase !== s.phase;
          return (
            <motion.li
              key={s.id}
              className="relative flex gap-3 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.12 + i * 0.07 }}
            >
              <span className={cn("relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl shadow-m-tile ring-4 ring-m-canvas", t.dot)}>
                <Icon className="size-6" aria-hidden />
                <span className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-white text-[11px] font-bold text-m-ink shadow-m-tile">
                  <Num value={s.n} />
                </span>
              </span>
              <div className={cn("min-w-0 flex-1 rounded-2xl p-3 ring-1 ring-m-ink/6 lg:mt-3 lg:w-full lg:flex-none lg:p-2.5", t.card)}>
                {firstOfPhase ? <span className={cn("mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", t.chip)}>{PHASES[s.phase]}</span> : <span className="mb-1 hidden h-[18px] lg:block" aria-hidden />}
                <p className="text-[15px] leading-tight font-bold text-m-ink lg:text-sm">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-m-ink/65">{SAYS[s.id]}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
