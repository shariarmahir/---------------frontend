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
    return <p className="bg-(--c-bg) p-6 leading-relaxed text-(--c-ink) md:p-10">বিনা ফির কোর্স — টাকা নেই, কিন্তু প্রতিটি গ্র্যাজুয়েট আর সফলতার গল্প আপনার পয়েন্ট বাড়ায়। দেশের দরকারে শেখানোর জন্য ধন্যবাদ।</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="bg-(--c-bg) p-6 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="hud text-(--c-faint)">
              ছাড় হয়েছে · ব্যাচ <Num value={batch.n} />
            </p>
            <p className="display mt-2 text-5xl leading-none text-(--c-ink-strong) tabular-nums">
              <Taka amount={p.released} />
            </p>
          </div>
          <div className="text-right">
            <p className="hud text-(--c-faint)">এসক্রোতে অপেক্ষায়</p>
            <p className="display mt-2 text-3xl leading-none text-(--c-signal) tabular-nums">
              <Taka amount={p.waiting} />
            </p>
          </div>
        </div>
        <div className="mt-8 flex gap-px" aria-label={`${course.lessons.length}টির মধ্যে ${weeks}টি ক্লাস হয়েছে`}>
          {course.lessons.map((l) => (
            <span key={l.week} className={cn("h-2 flex-1", held[l.week] ? "bg-(--c-signal)" : "bg-(--c-line)")} />
          ))}
        </div>
        <p className="hud mt-3 text-(--c-muted)">
          <Num value={weeks} />
          টি ক্লাস হয়েছে, বাকি <Num value={course.lessons.length - weeks} />
          টি — প্রতিটির হাজিরা জমা দিলে সেই ভাগ ছাড়ে।
        </p>
      </div>
      <dl className="bg-(--c-bg) p-6 text-sm md:p-8">
        {[
          ["কোর্স ফি", <Taka key="f" amount={fee.price} />],
          ["প্ল্যাটফর্ম রাখে (৫%)", <Taka key="c" amount={fee.sellerFee} />],
          ["প্রতি শিক্ষার্থীতে আপনি পান", <Taka key="r" amount={fee.sellerReceives} />],
          ["এই ব্যাচে শিক্ষার্থী", <Num key="n" value={batch.enrolled} />],
          ["পুরো ব্যাচে আপনার আয়", <Taka key="e" amount={p.earn} />],
        ].map(([k, v]) => (
          <div key={String(k)} className="flex justify-between gap-3 border-b border-(--c-line) py-3 last:border-b-0">
            <dt className="text-(--c-muted)">{k}</dt>
            <dd className="font-semibold text-(--c-ink-strong) tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
