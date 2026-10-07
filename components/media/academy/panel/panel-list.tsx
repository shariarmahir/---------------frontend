"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { board, getCourse, type BoardSeat } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { VERDICTS, finalResult } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { useAcademy } from "../use-academy";

/** The finals a member sits on as the teacher-examiner. */
export const seatsFor = (handle: string): BoardSeat[] =>
  board.filter((s) => !s.marks && getCourse(s.course)?.teacher === handle).sort((a, b) => a.at.localeCompare(b.at));

/** Finals waiting for the viewer's marks, and the ones already marked. */
export function PanelList() {
  const hydrated = useHydrated();
  const marks = useAcademy((a) => a.marks);
  if (!hydrated) return <Skeleton className="h-64 rounded-2xl bg-m-card/40" />;
  const seats = seatsFor(currentUser.handle);

  if (seats.length === 0) {
    return <p className="rounded-2xl bg-m-card p-6 text-sm text-m-ink/80 ring-1 ring-m-ink/10 shadow-m-tile">আপনার কোর্সের কোনো ফাইনাল এখন নেই। শিক্ষার্থী প্রজেক্ট জমা দিয়ে সময় বাছলে এখানে আসবে।</p>;
  }

  return (
    <ul className="space-y-3">
      {seats.map((s) => {
        const mine = marks[s.id];
        const verdict = mine && s.sealed !== undefined ? finalResult([mine.total, s.sealed]).verdict : undefined;
        return (
          <li key={s.id}>
            <Link href={`/media/academy/panel/${s.id}`} className="group flex flex-wrap items-center gap-4 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 transition-colors hover:ring-m-blue/50 sm:p-5 shadow-m-tile">
              <span className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-m-yellow py-2 text-m-ink">
                <span className="text-xl leading-none font-bold"><Num value={Number(new Date(s.at).toLocaleDateString("en-GB", { day: "numeric", timeZone: "Asia/Dhaka" }))} /></span>
                <span className="mt-1 text-[11px] font-semibold">{new Date(s.at).toLocaleDateString("bn-BD", { month: "short", timeZone: "Asia/Dhaka" })}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-m-ink group-hover:text-m-blue">{s.learner} <span className="font-normal text-m-ink/65">· {s.district}</span></span>
                <span className="block text-sm text-m-ink/80">{getCourse(s.course)?.title}</span>
                <span className="mt-0.5 block text-xs text-m-ink/65"><DateText iso={s.at} time weekday /> · {s.project}</span>
              </span>
              <span className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold", mine ? "bg-m-blue-soft text-m-ink" : "bg-m-yellow text-m-ink")}>
                {mine ? (verdict ? VERDICTS[verdict] : "জমা হয়েছে") : <><Lock className="size-3.5" aria-hidden /> নম্বর দিন</>}
              </span>
              <ArrowRight className="size-4 shrink-0 text-m-ink/60 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
