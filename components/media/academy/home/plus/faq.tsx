"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS, MIN_ATTENDANCE, MIN_HOMEWORK } from "@/lib/media/academy";
import { mediaButton } from "../../../ui/button-styles";
import { Num } from "../../../ui/numerals";

const FIRST = 4;

/** Every answer is one of the academy's own rules. */
export type QA = { q: string; a: React.ReactNode };

const ACADEMY_QA: QA[] = [
  { q: "যোগ দিতে কি টাকা লাগে?", a: <>না। যোগ দেওয়া আর ভর্তি পরীক্ষা বিনামূল্যে। ফি শুধু কোর্সের — শিক্ষক ঠিক করেন, আর ক্লাস না হওয়া পর্যন্ত টাকা থাকে এসক্রোতে।</> },
  {
    q: "একটা কোর্স কত দিনের?",
    a: (
      <>
        <Num value={COURSE_DAYS} /> দিনের। <Num value={5} /> সপ্তাহ অনলাইনে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, শেষ <Num value={5} /> দিন ফাইনাল প্রজেক্ট আর প্যানেল ইন্টারভিউ।
      </>
    ),
  },
  {
    q: "এক ব্যাচে কতজন থাকে?",
    a: (
      <>
        একক একাডেমিতে সর্বোচ্চ <Num value={BATCH_MAX.solo} /> জন, দলীয় একাডেমিতে সর্বোচ্চ <Num value={BATCH_MAX.team} /> জন — যাতে শিক্ষক প্রত্যেককে দেখতে পারেন।
      </>
    ),
  },
  {
    q: "ফাইনালে বসতে কী লাগে?",
    a: (
      <>
        অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাসে হাজিরা আর <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ জমা। না হলে ফাইনালে বসা যায় না।
      </>
    ),
  },
  { q: "সনদ কীভাবে যাচাই হয়?", a: <>পাস করলে নাম ওঠে প্রকাশ্য বোর্ডে। সনদের আইডি দিয়ে যে কেউ — নিয়োগকর্তাও — মিলিয়ে দেখতে পারেন।</> },
  {
    q: "ফেল করলে কী হয়?",
    a: (
      <>
        ফল গোপন থাকে, বোর্ডে ওঠে না। <Num value={30} /> দিন পর আবার ফাইনালে বসা যায়।
      </>
    ),
  },
  { q: "শিক্ষক কারা?", a: <>যাঁরা কাজটা পেশা হিসেবে করেন — প্রকৌশলী, মেকানিক, শেফ, শিল্পী। প্রত্যেকে পেশাদারদের প্যানেল ইন্টারভিউ আর নমুনা ক্লাস পার হয়ে এসেছেন।</> },
  { q: "অভিযোগ করলে শিক্ষক কি আমার নাম দেখবেন?", a: <>না। শিক্ষকের পাতার অভিযোগ বাক্সে নাম গোপন থাকে, আর প্রতিটি অভিযোগ প্যানেল খতিয়ে দেখে।</> },
];

/** Questions as an accordion; the first four show, the rest open on request. The academy's own by default; a course passes its own. */
export function Faq({ items = ACADEMY_QA, title = "সচরাচর জিজ্ঞাসা", className = "mx-auto max-w-3xl px-4 pt-20 sm:px-6", align = "center" }: { items?: QA[]; title?: string; className?: string; align?: "center" | "start" }) {
  const QA = items;
  const [all, setAll] = useState(false);
  return (
    <section id="faq" aria-labelledby="faq-title" className={className}>
      <h2 id="faq-title" className={`${align === "center" ? "text-center" : ""} text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold text-m-ink`}>
        {title}
      </h2>
      <ul className="mt-8 divide-y divide-m-ink/10 border-y border-m-ink/10">
        {(all ? QA : QA.slice(0, FIRST)).map((x) => (
          <li key={x.q}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-m-ink transition-colors hover:text-m-blue [&::-webkit-details-marker]:hidden">
                {x.q}
                <Plus className="size-5 shrink-0 text-m-blue transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
              </summary>
              <p className="max-w-[65ch] pb-5 text-[15px] leading-relaxed text-m-ink/80">{x.a}</p>
            </details>
          </li>
        ))}
      </ul>
      {!all && QA.length > FIRST && (
        <div className={`mt-6 ${align === "center" ? "text-center" : ""}`}>
          <button type="button" onClick={() => setAll(true)} className={mediaButton({ variant: "outline" })}>
            সব <Num value={QA.length} />টি প্রশ্ন দেখুন
          </button>
        </div>
      )}
    </section>
  );
}
