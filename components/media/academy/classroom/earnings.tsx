"use client";

import { payoutOf, type Course } from "@/lib/media/academy";
import type { Batch } from "@/lib/media/batch";
import { computeFees } from "@/lib/media/fees";
import { cn } from "@/lib/utils";
import { Num, Taka } from "../../ui/numerals";
import { useAcademy } from "../use-academy";

const NO_WEEKS: Record<number, string[]> = {};

/** One batch's money: released as each class is held, the rest waiting in escrow. */
export function Earnings({ course, batch }: { course: Course; batch: Batch }) {
  const held = useAcademy((a) => a.attendance[batch.id] ?? NO_WEEKS);
  const weeks = Object.keys(held).length;
  const p = payoutOf({ ...course, enrolled: batch.enrolled }, weeks);
  const fee = computeFees(course.fee);

  if (course.fee === 0) {
    return (
      <p className="rounded-[1.6rem] bg-white p-5 text-sm leading-relaxed text-m-ink/80 shadow-m-tile ring-1 ring-m-ink/8">
        বিনা ফির কোর্স — টাকা নেই, কিন্তু প্রতিটি গ্র্যাজুয়েট আর সফলতার গল্প আপনার পয়েন্ট বাড়ায়। দেশের দরকারে শেখানোর জন্য ধন্যবাদ।
      </p>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="blue-band rounded-[1.6rem] p-5 shadow-m-lift sm:p-7">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">ছাড় হয়েছে · ব্যাচ <Num value={batch.n} /></p>
            <p className="text-[2.6rem] leading-tight font-bold tabular-nums">
              <Taka amount={p.released} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/75">এসক্রোতে অপেক্ষায়</p>
            <p className="text-2xl font-bold text-m-yellow tabular-nums">
              <Taka amount={p.waiting} />
            </p>
          </div>
        </div>
        <div className="relative mt-6 flex gap-1.5" aria-label={`${course.lessons.length}টির মধ্যে ${weeks}টি ক্লাস হয়েছে`}>
          {course.lessons.map((l) => (
            <span key={l.week} className={cn("h-3 flex-1 rounded-full", held[l.week] ? "bg-m-yellow" : "bg-white/20")} />
          ))}
        </div>
        <p className="relative mt-2 text-xs text-white/75">
          <Num value={weeks} />টি ক্লাস হয়েছে, বাকি <Num value={course.lessons.length - weeks} />টি — প্রতিটির হাজিরা জমা দিলে সেই ভাগ ছাড়ে।
        </p>
      </div>
      <dl className="divide-y divide-m-ink/8 overflow-hidden rounded-[1.6rem] bg-white text-sm shadow-m-tile ring-1 ring-m-ink/8">
        {[
          ["কোর্স ফি", <Taka key="f" amount={fee.price} />],
          ["প্ল্যাটফর্ম রাখে (৫%)", <Taka key="c" amount={fee.sellerFee} />],
          ["প্রতি শিক্ষার্থীতে আপনি পান", <Taka key="r" amount={fee.sellerReceives} />],
          ["এই ব্যাচে শিক্ষার্থী", <Num key="n" value={batch.enrolled} />],
          ["পুরো ব্যাচে আপনার আয়", <Taka key="e" amount={p.earn} />],
        ].map(([k, v]) => (
          <div key={String(k)} className="flex justify-between gap-3 px-5 py-3">
            <dt className="text-m-ink/75">{k}</dt>
            <dd className="font-semibold text-m-ink tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
