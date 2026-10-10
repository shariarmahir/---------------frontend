"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, ClipboardCheck, DoorOpen, Hammer, Receipt as ReceiptIcon, Video } from "lucide-react";
import { getCourse, getDepartment } from "@/data/media/academy";
import type { PayMethod } from "@/data/media/types";
import { CLASS_MINUTES, FINAL_DAYS, MIN_ATTENDANCE, MIN_HOMEWORK, courseTimeline } from "@/lib/media/academy";
import { slotOf } from "@/lib/media/batch";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { payBn } from "../../wallet/pay";
import { Band, BandTitle, Turn, twoDigits } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { useBatches } from "../classroom/use-batches";

export type Receipt = { name: string; courses: string[]; rooms: Record<string, string>; paid: number; method: PayMethod | null; ref: string; at: string };

/** Twenty-four square scraps in the needle's yellow, the brand blue and white, falling once. */
const PIECES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 8) * 0.07,
  rotate: ((i * 53) % 180) - 90,
  tone: i % 3 === 0 ? "bg-(--c-ink-strong)" : i % 3 === 1 ? "bg-(--c-signal)" : "bg-(--c-accent)",
  size: i % 2 ? "size-2.5" : "size-1.5",
}));

/**
 * After joining, in the catalogue's bands: the welcome with scraps falling
 * and a square tick, the courses the learner now belongs to with their
 * first week and the door to each classroom, what happens next, and the
 * receipt.
 */
export function Joined({ receipt }: { receipt: Receipt }) {
  const reduce = useReducedMotion();
  const first = receipt.name.trim().split(/\s+/)[0];
  const courses = receipt.courses.map((id) => getCourse(id)!).filter(Boolean);
  const batches = useBatches();

  return (
    <>
      <Band id="welcome" n={1} label="ভর্তি সম্পন্ন" now note={<DateText iso={receipt.at} time />}>
        <div className="relative overflow-hidden px-6 py-16 text-center md:py-24">
          {!reduce && (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {PIECES.map((p, i) => (
                <motion.span
                  key={i}
                  className={cn("absolute top-0", p.size, p.tone)}
                  style={{ left: `${p.left}%` }}
                  initial={{ y: -40, opacity: 0, rotate: 0 }}
                  animate={{ y: 460, opacity: [0, 1, 1, 0], rotate: p.rotate * 4 }}
                  transition={{ duration: 2.4, delay: 0.2 + p.delay, ease: "easeIn" }}
                />
              ))}
            </div>
          )}
          <motion.span
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto grid size-20 place-items-center bg-(--c-signal) text-black"
          >
            <Check className="size-10" strokeWidth={3} aria-hidden />
          </motion.span>
          <BandTitle as="h1" now className="relative mx-auto mt-8 max-w-3xl">
            অভিনন্দন, <Turn>{first}</Turn>!
          </BandTitle>
          <p data-reveal data-in className="relative mx-auto mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            আপনি এখন কাণ্ডারী তৈরি একাডেমির শিক্ষার্থী — <Num value={courses.length} />
            টি কোর্সে আসন নিশ্চিত। প্রথম ক্লাসে দেখা হবে।
          </p>
        </div>
      </Band>

      <Band id="courses" n={2} label="আপনার কোর্স" note="প্রথম সপ্তাহ আর ক্লাসের সময়">
        <ul className="border-t border-(--c-line)">
          {courses.map((c) => {
            const b = batches.find((x) => x.id === receipt.rooms[c.id]);
            const t = courseTimeline(b?.starts ?? c.starts);
            return (
              <li key={c.id} className="flex flex-col gap-5 border-b border-(--c-line) px-6 py-6 sm:flex-row sm:items-center md:px-10">
                <span className="relative aspect-video w-full shrink-0 overflow-hidden bg-(--c-bg-sunken) sm:w-44">
                  <Image src={c.image} alt="" fill sizes="(min-width: 640px) 11rem, 90vw" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="hud text-(--c-faint)">{getDepartment(c.dept)?.academy.name}</p>
                  <p className="display mt-1 text-xl text-(--c-ink-strong)">{c.title}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm text-(--c-muted)">
                    <CalendarDays className="size-4 text-(--c-accent-ink)" aria-hidden />
                    {b && (
                      <span className="font-semibold text-(--c-ink)">
                        ব্যাচ <Num value={b.n} /> · {slotOf(b.day, b.time)} ·
                      </span>
                    )}
                    প্রথম সপ্তাহ <DateText iso={t.weeks[0].from} /> – <DateText iso={t.weeks[0].to} />
                  </p>
                </div>
                <Link href={`/media/academy/classroom/${encodeURIComponent(receipt.rooms[c.id] ?? c.id)}`} className={cn(primaryBtn, "shrink-0")}>
                  <DoorOpen className="size-4" aria-hidden /> ক্লাসরুমে ঢুকুন
                </Link>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band id="next" n={3} label="এরপর কী" note="রুটিন থেকে সমাবর্তন">
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_22rem]">
          <ol className="grid gap-px bg-(--c-line) sm:grid-cols-3">
            {[
              {
                Icon: Video,
                title: "প্রথম ক্লাসে যোগ দিন",
                body: (
                  <>
                    <Num value={CLASS_MINUTES} /> মিনিটের অনলাইন ক্লাস; রেকর্ডিংও থাকে
                  </>
                ),
              },
              {
                Icon: ClipboardCheck,
                title: "হাজিরা আর হোমওয়ার্ক",
                body: (
                  <>
                    অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ
                  </>
                ),
              },
              {
                Icon: Hammer,
                title: "প্রজেক্ট আর প্যানেল",
                body: (
                  <>
                    শেষ <Num value={FINAL_DAYS} /> দিনে নিজের কাজ দেখিয়ে সনদ
                  </>
                ),
              },
            ].map((s, i) => (
              <li key={s.title} className="bg-(--c-bg) p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex size-10 items-center justify-center border border-(--c-line) text-(--c-accent-ink)">
                    <s.Icon className="size-5" aria-hidden />
                  </span>
                  <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
                </div>
                <h3 className="display mt-6 text-lg text-(--c-ink-strong)">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{s.body}</p>
              </li>
            ))}
          </ol>

          <aside aria-labelledby="receipt" className="bg-(--c-bg) p-6 md:p-8">
            <h2 id="receipt" className="hud flex items-center gap-2 text-(--c-faint)">
              <ReceiptIcon className="size-3.5" aria-hidden /> রসিদ
            </h2>
            <dl className="mt-4 border-t border-(--c-line) text-sm">
              {[
                { k: "পরিশোধ", v: receipt.paid > 0 ? <Taka amount={receipt.paid} /> : <span className="text-(--c-good)">বিনা ফি</span> },
                ...(receipt.method ? [{ k: "পদ্ধতি", v: payBn[receipt.method] }] : []),
                { k: "সময়", v: <DateText iso={receipt.at} time /> },
                { k: "রেফারেন্স", v: <span className="font-mono text-xs text-(--c-accent-ink)">{receipt.ref.slice(-10).toUpperCase()}</span> },
              ].map((row) => (
                <div key={row.k} className="flex justify-between gap-3 border-b border-(--c-line) py-2.5">
                  <dt className="text-(--c-muted)">{row.k}</dt>
                  <dd className="font-semibold text-(--c-ink-strong) tabular-nums">{row.v}</dd>
                </div>
              ))}
            </dl>
            {receipt.paid > 0 && <p className="hud mt-4 text-(--c-good)">টাকা এসক্রোতে — ক্লাস হলে শিক্ষক পাবেন</p>}
            <div className="mt-6 grid gap-2">
              <Link href="/media/academy/routine" className={cn(secondaryBtn, "w-full")}>
                রুটিন দেখুন
              </Link>
              <Link href="/media/dashboard" className="hud py-2 text-center text-(--c-muted) underline-offset-4 hover:text-(--c-ink-strong) hover:underline">
                মাটির ব্যাংকে লেনদেন
              </Link>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}
