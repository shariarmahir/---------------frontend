"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesOf, getCourse, getDepartment } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { LEVELS } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { useAcademy } from "./use-academy";

/**
 * প্রবেশপত্র — the viewer's admit card. Before the test it invites them in
 * (free); after it, it shows where they were placed and the next step.
 */
export function AdmitCard() {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admission);
  const enrolled = useAcademy((a) => a.enrolled);

  if (!hydrated) return <Skeleton className="h-64 rounded-2xl bg-text-primary/30" />;

  const codes = Object.keys(enrolled);
  const dept = admission ? getDepartment(admission.dept) : undefined;
  const next = codes.length > 0 ? getCourse(codes[0]) : dept ? coursesOf(dept.id)[0] : undefined;

  return (
    <article aria-label="আমার প্রবেশপত্র" className="admit-in relative rounded-2xl bg-text-primary p-5 text-white shadow-[0_24px_48px_-24px_rgb(0_0_0/0.9)]">
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-white/20 pb-4">
        <div>
          <p className="text-xs font-semibold text-signal-orange">প্রবেশপত্র</p>
          <p className="mt-0.5 text-sm font-bold">কাণ্ডারী তৈরি একাডেমি</p>
        </div>
        <PersonAvatar person={currentUser} size="lg" className="ring-2 ring-signal-orange" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 text-sm">
        <div className="col-span-2">
          <dt className="text-xs text-white/65">শিক্ষার্থী</dt>
          <dd className="font-semibold">{currentUser.nameBn}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/65">বিভাগ</dt>
          <dd className="font-semibold">{dept?.name ?? "এখনো বাছাই হয়নি"}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/65">শুরুর স্তর</dt>
          <dd className="font-semibold">{admission ? LEVELS[admission.level] : "ভর্তি পরীক্ষার পর"}</dd>
        </div>
        {admission && (
          <>
            <div>
              <dt className="text-xs text-white/65">পরীক্ষায়</dt>
              <dd className="font-semibold tabular-nums"><Num value={admission.score} />%</dd>
            </div>
            <div>
              <dt className="text-xs text-white/65">ভর্তির তারিখ</dt>
              <dd className="font-semibold"><DateText iso={admission.at} /></dd>
            </div>
          </>
        )}
      </dl>

      {admission?.fastTrack && (
        <p className="mb-4 rounded-xl bg-signal-orange/15 px-3 py-2 text-sm leading-relaxed text-signal-orange">
          অভিজ্ঞতার প্রমাণ আছে — চাইলে সরাসরি ফাইনাল ইন্টারভিউ দিতে পারেন।
        </p>
      )}

      {!admission ? (
        <Link href="/media/academy/admission" className={mediaButton({ variant: "primary", className: "w-full" })}>
          বিনামূল্যে ভর্তি পরীক্ষা দিন <ArrowRight aria-hidden />
        </Link>
      ) : next ? (
        <Link href={`/media/academy/course/${next.id}`} className={mediaButton({ variant: "primary", className: "w-full" })}>
          {codes.length > 0 ? "আমার কোর্সে যান" : "প্রথম কোর্স দেখুন"} <ArrowRight aria-hidden />
        </Link>
      ) : (
        <Link href="/media/academy/departments" className={mediaButton({ variant: "primary", className: "w-full" })}>
          কোর্স বেছে নিন <ArrowRight aria-hidden />
        </Link>
      )}
      {codes.length > 0 && (
        <p className="mt-3 text-center text-xs text-white/70">
          <Num value={codes.length} />টি কোর্সে ভর্তি
          {admission?.fastTrack && <> · <Link href="/media/academy/exam" className="font-semibold text-signal-orange hover:underline">ফাইনাল</Link></>}
        </p>
      )}
    </article>
  );
}
