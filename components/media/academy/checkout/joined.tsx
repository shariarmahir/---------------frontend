"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, ClipboardCheck, DoorOpen, Hammer, Receipt as ReceiptIcon, Video } from "lucide-react";
import { getCourse, getDepartment } from "@/data/media/academy";
import type { PayMethod } from "@/data/media/types";
import { CLASS_MINUTES, MIN_ATTENDANCE, MIN_HOMEWORK, courseTimeline } from "@/lib/media/academy";
import { slotOf } from "@/lib/media/batch";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num, Taka } from "../../ui/numerals";
import { payBn } from "../../wallet/pay";
import { useBatches } from "../classroom/use-batches";

export type Receipt = { name: string; courses: string[]; rooms: Record<string, string>; paid: number; method: PayMethod | null; ref: string; at: string };

const ease = [0.16, 1, 0.3, 1] as const;

/** Twenty-four pieces of paper in the brand's amber and white, falling once. */
const PIECES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 8) * 0.07,
  rotate: ((i * 53) % 180) - 90,
  tone: i % 3 === 0 ? "bg-white" : i % 3 === 1 ? "bg-m-yellow" : "bg-m-blue-soft",
  w: i % 2 ? "w-2.5" : "w-1.5",
}));

/**
 * After joining: a blue band with the paper falling and a big tick, the
 * learner's name, the courses they now belong to with their first week,
 * the receipt, and what happens next.
 */
export function Joined({ receipt }: { receipt: Receipt }) {
  const reduce = useReducedMotion();
  const first = receipt.name.trim().split(/\s+/)[0];
  const courses = receipt.courses.map((id) => getCourse(id)!).filter(Boolean);
  const batches = useBatches();

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <section aria-labelledby="joined-title" className="blue-band relative mt-2 overflow-hidden rounded-3xl px-6 pt-14 pb-12 text-center shadow-m-lift sm:px-10">
        {!reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {PIECES.map((p, i) => (
              <motion.span
                key={i}
                className={`absolute top-0 h-3.5 rounded-[2px] ${p.w} ${p.tone}`}
                style={{ left: `${p.left}%` }}
                initial={{ y: -40, opacity: 0, rotate: 0 }}
                animate={{ y: 420, opacity: [0, 1, 1, 0], rotate: p.rotate * 4 }}
                transition={{ duration: 2.4, delay: 0.2 + p.delay, ease: "easeIn" }}
              />
            ))}
          </div>
        )}
        <motion.span
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className="relative mx-auto grid size-20 place-items-center rounded-full bg-white text-m-green shadow-[0_18px_40px_-14px_rgb(0_0_0/0.5)] ring-8 ring-white/20"
        >
          <Check className="size-10" strokeWidth={3} aria-hidden />
        </motion.span>
        <motion.div initial={reduce ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.15, ease }} className="relative">
          <p className="mt-6 text-sm font-bold text-m-yellow">ভর্তি সম্পন্ন</p>
          <h1 id="joined-title" className="mt-2 text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-bold">
            অভিনন্দন, {first}!
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-white/90">
            আপনি এখন কাণ্ডারী তৈরি একাডেমির শিক্ষার্থী — <Num value={courses.length} />টি কোর্সে আসন নিশ্চিত। প্রথম ক্লাসে দেখা হবে।
          </p>
        </motion.div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="your-courses">
          <h2 id="your-courses" className="text-xl font-bold text-m-ink">
            আপনার কোর্স
          </h2>
          <ul className="mt-4 space-y-3">
            {courses.map((c) => {
              const b = batches.find((x) => x.id === receipt.rooms[c.id]);
              const t = courseTimeline(b?.starts ?? c.starts);
              return (
                <li key={c.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/8 sm:flex-row sm:items-center">
                  <span className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-m-ground sm:w-40">
                    <Image src={c.image} alt="" fill sizes="(min-width: 640px) 10rem, 90vw" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-m-blue">{getDepartment(c.dept)?.academy.name}</p>
                    <p className="mt-0.5 font-bold text-m-ink">{c.title}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-m-ink/70">
                      <CalendarDays className="size-4 text-m-blue" aria-hidden />
                      {b && <span className="font-semibold text-m-ink">ব্যাচ <Num value={b.n} /> · {slotOf(b.day, b.time)} ·</span>}
                      প্রথম সপ্তাহ <DateText iso={t.weeks[0].from} /> – <DateText iso={t.weeks[0].to} />
                    </p>
                  </div>
                  <Link href={`/media/academy/classroom/${encodeURIComponent(receipt.rooms[c.id] ?? c.id)}`} className={mediaButton({ size: "sm", className: "shrink-0" })}>
                    <DoorOpen aria-hidden /> ক্লাসরুমে ঢুকুন
                  </Link>
                </li>
              );
            })}
          </ul>

          <h2 className="mt-10 text-xl font-bold text-m-ink">এরপর কী</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: Video, title: "প্রথম ক্লাসে যোগ দিন", body: <><Num value={CLASS_MINUTES} /> মিনিটের অনলাইন ক্লাস; রেকর্ডিংও থাকে</> },
              { Icon: ClipboardCheck, title: "হাজিরা আর হোমওয়ার্ক", body: <>অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ</> },
              { Icon: Hammer, title: "প্রজেক্ট আর প্যানেল", body: <>শেষ <Num value={5} /> দিনে নিজের কাজ দেখিয়ে সনদ</> },
            ].map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/8">
                <span className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-m-blue-soft text-m-blue">
                    <s.Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="text-xs font-bold text-m-ink/50">
                    ধাপ <Num value={i + 1} />
                  </span>
                </span>
                <p className="mt-3 font-bold text-m-ink">{s.title}</p>
                <p className="mt-1 text-sm leading-snug text-m-ink/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <aside aria-labelledby="receipt" className="self-start rounded-2xl bg-white p-5 shadow-m-lift ring-1 ring-m-ink/8">
          <h2 id="receipt" className="flex items-center gap-2 font-bold text-m-ink">
            <ReceiptIcon className="size-5 text-m-blue" aria-hidden /> রসিদ
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-m-ink/65">পরিশোধ</dt>
              <dd className="font-bold text-m-ink tabular-nums">{receipt.paid > 0 ? <Taka amount={receipt.paid} /> : <span className="text-m-green">বিনা ফি</span>}</dd>
            </div>
            {receipt.method && (
              <div className="flex justify-between gap-3">
                <dt className="text-m-ink/65">পদ্ধতি</dt>
                <dd className="text-m-ink">{payBn[receipt.method]}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-m-ink/65">সময়</dt>
              <dd className="text-m-ink">
                <DateText iso={receipt.at} time />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-m-ink/65">রেফারেন্স</dt>
              <dd className="font-mono text-xs text-m-blue">{receipt.ref.slice(-10).toUpperCase()}</dd>
            </div>
          </dl>
          {receipt.paid > 0 && <p className="mt-4 rounded-lg bg-m-green-soft px-3 py-2 text-xs font-semibold text-m-green">টাকা এসক্রোতে — ক্লাস হলে শিক্ষক পাবেন</p>}
          <div className="mt-5 grid gap-2">
            <Link href="/media/dashboard" className={mediaButton({ variant: "outline", size: "sm" })}>
              মাটির ব্যাংকে লেনদেন
            </Link>
            <Link href="/media/academy/departments" className={mediaButton({ variant: "ghost", size: "sm" })}>
              আরও কোর্স দেখুন
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
