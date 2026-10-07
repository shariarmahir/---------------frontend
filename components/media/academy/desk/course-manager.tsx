"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Banknote, ClipboardList, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { payoutOf, type Course } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num, Taka } from "../../ui/numerals";
import { useAcademy } from "../use-academy";
import { AttendanceSheet } from "./attendance-sheet";
import { MaterialsDesk } from "./materials-desk";
import { useTeacher } from "./use-teacher";

type Tab = "attendance" | "materials" | "money";
const TABS: { id: Tab; label: string; Icon: typeof ClipboardList }[] = [
  { id: "attendance", label: "হাজিরা", Icon: ClipboardList },
  { id: "materials", label: "উপকরণ", Icon: FolderOpen },
  { id: "money", label: "আয়", Icon: Banknote },
];

/** One course on the teacher's desk: roll call, materials, and the money as classes are held. */
export function CourseManager({ code }: { code: string }) {
  const hydrated = useHydrated();
  const t = useTeacher();
  const [tab, setTab] = useState<Tab>("attendance");
  const found = t.find(code);

  if (!hydrated) return <Skeleton className="h-96 rounded-2xl bg-text-primary/40" />;
  if (!found) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-text-primary p-6 text-center ring-1 ring-white/12">
        <h1 className="text-xl font-bold text-white">এই কোর্সটা আপনার ডেস্কে নেই</h1>
        <p className="mt-2 text-sm text-white/75">শুধু নিজের কোর্সের হাজিরা আর উপকরণ দেখা যায়।</p>
        <Link href="/media/academy/desk" className={mediaButton({ variant: "primary", className: "mt-5" })}>ডেস্কে ফিরুন</Link>
      </div>
    );
  }

  const { course, draft } = found;
  const shown: Tab = draft ? "materials" : tab;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/media/academy/desk" className="group mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-signal-orange">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> শিক্ষক ডেস্ক
      </Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-signal-orange">{course.id}{draft && <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 font-sans text-xs text-white">প্যানেলের অনুমোদনের অপেক্ষায়</span>}</p>
          <h1 className="text-2xl font-bold text-balance text-white sm:text-[2rem] sm:leading-tight">{course.title}</h1>
          <p className="mt-1 text-sm text-white/75"><Num value={course.enrolled} /> জন শিক্ষার্থী · <Num value={course.lessons.length} />টি ক্লাস · <Num value={course.weeks} /> সপ্তাহ</p>
        </div>
        {!draft && <Link href={`/media/academy/course/${course.id}`} className={mediaButton({ variant: "quiet", size: "sm" })}>শিক্ষার্থীরা যা দেখে</Link>}
      </header>

      {draft ? (
        <p className="mb-5 rounded-2xl bg-text-primary p-4 text-sm leading-relaxed text-white/85 ring-1 ring-signal-orange/40">
          প্যানেল ৭২ ঘণ্টার মধ্যে পাঠক্রম দেখে অনুমোদন দেবে, তারপর ভর্তি খোলে আর হাজিরা নেওয়া যায়। এর মধ্যে উপকরণ তৈরি রাখুন।
        </p>
      ) : (
        <div role="tablist" aria-label="কোর্স ম্যানেজ" className="mb-6 inline-flex rounded-2xl bg-text-primary p-1 ring-1 ring-white/12">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={shown === id}
              onClick={() => setTab(id)}
              className={cn("inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors", shown === id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white")}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      )}

      <div role="tabpanel">
        {shown === "attendance" && <AttendanceSheet course={course} />}
        {shown === "materials" && <MaterialsDesk course={course} />}
        {shown === "money" && <Earnings course={course} />}
      </div>
    </div>
  );
}

const NO_WEEKS: Record<number, string[]> = {};

function Earnings({ course }: { course: Course }) {
  const held = useAcademy((a) => a.attendance[course.id] ?? NO_WEEKS);
  const weeks = Object.keys(held).length;
  const p = payoutOf(course, weeks);
  const fee = computeFees(course.fee);

  if (course.fee === 0) {
    return (
      <p className="rounded-2xl bg-text-primary p-5 text-sm leading-relaxed text-white/85 ring-1 ring-white/12">
        বিনা ফির কোর্স — টাকা নেই, কিন্তু প্রতিটি গ্র্যাজুয়েট আর সফলতার গল্প আপনার পয়েন্ট বাড়ায়। দেশের দরকারে শেখানোর জন্য ধন্যবাদ।
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/75">ছাড় হয়েছে</p>
            <p className="text-4xl font-bold text-white tabular-nums"><Taka amount={p.released} /></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/75">এসক্রোতে অপেক্ষায়</p>
            <p className="text-2xl font-bold text-signal-orange tabular-nums"><Taka amount={p.waiting} /></p>
          </div>
        </div>
        <div className="mt-5 flex gap-1" aria-label={`${course.lessons.length}টির মধ্যে ${weeks}টি ক্লাস হয়েছে`}>
          {course.lessons.map((l) => <span key={l.week} className={cn("h-3 flex-1 rounded-sm", held[l.week] ? "bg-signal-orange" : "bg-white/12")} />)}
        </div>
        <p className="mt-2 text-xs text-white/65"><Num value={weeks} />টি ক্লাস হয়েছে, বাকি <Num value={course.lessons.length - weeks} />টি — প্রতিটির হাজিরা জমা দিলে সেই ভাগ ছাড়ে।</p>
      </div>
      <dl className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-text-primary text-sm ring-1 ring-white/12">
        {[
          ["কোর্স ফি", <Taka key="f" amount={fee.price} />],
          ["প্ল্যাটফর্ম রাখে (৫%)", <Taka key="c" amount={fee.sellerFee} />],
          ["প্রতি শিক্ষার্থীতে আপনি পান", <Taka key="r" amount={fee.sellerReceives} />],
          ["শিক্ষার্থী", <Num key="n" value={course.enrolled} />],
          ["পুরো কোর্সে আপনার আয়", <Taka key="e" amount={p.earn} />],
        ].map(([k, v]) => (
          <div key={String(k)} className="flex justify-between gap-3 px-5 py-3">
            <dt className="text-white/80">{k}</dt>
            <dd className="font-semibold text-white tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-relaxed text-white/65">শিক্ষার্থী প্রমাণসহ অভিযোগ করলে আর প্যানেল তা মেনে নিলে, না-হওয়া ক্লাসের ভাগ শিক্ষার্থীর কাছে ফেরত যায়।</p>
    </div>
  );
}
