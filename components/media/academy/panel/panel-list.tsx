"use client";

import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { board, departments, getCourse, type BoardSeat } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { RUBRIC, VERDICTS, finalResult } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { Band, BandTitle, Turn, twoDigits } from "../catalogue/band";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { useAcademy } from "../use-academy";

/** The finals a member sits on as the teacher-examiner. */
export const seatsFor = (handle: string): BoardSeat[] => board.filter((s) => !s.marks && getCourse(s.course)?.teacher === handle).sort((a, b) => a.at.localeCompare(b.at));

/**
 * প্যানেল মার্কিং, in the catalogue's bands: the finals waiting for the
 * viewer's marks and the ones already marked, beside the rubric that adds
 * to a hundred.
 */
export function PanelList() {
  const hydrated = useHydrated();
  const marks = useAcademy((a) => a.marks);
  const seats = hydrated ? seatsFor(currentUser.handle) : [];

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="প্যানেল মার্কিং" now note="অন্য পরীক্ষকের নম্বর আপনার জমার পরে খোলে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            রুব্রিক ধরে <Turn>নম্বর</Turn> দিন।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            আপনার কোর্সের ফাইনাল ইন্টারভিউ। লাইভ ইন্টারভিউ শেষে নম্বর দিন — কেউ অন্যজনেরটা আগে দেখেন না।
          </p>
        </div>
      </Band>

      <Band
        id="finals"
        n={2}
        label="ফাইনাল"
        note={
          hydrated ? (
            <>
              <Num value={seats.length} />
              টি ইন্টারভিউ
            </>
          ) : undefined
        }
      >
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="bg-(--c-bg)">
            {!hydrated ? (
              <span aria-hidden className="block h-64 animate-pulse bg-(--c-bg-sunken)" />
            ) : seats.length === 0 ? (
              <p className="px-6 py-10 leading-relaxed text-(--c-muted) md:px-10">আপনার কোর্সের কোনো ফাইনাল এখন নেই। শিক্ষার্থী প্রজেক্ট জমা দিয়ে সময় বাছলে এখানে আসবে।</p>
            ) : (
              <ul>
                {seats.map((s) => {
                  const mine = marks[s.id];
                  const verdict = mine && s.sealed !== undefined ? finalResult([mine.total, s.sealed]).verdict : undefined;
                  const course = getCourse(s.course);
                  return (
                    <li key={s.id} style={toneStyle(departments.findIndex((d) => d.id === course?.dept))} className="tone border-b border-(--c-line) last:border-b-0">
                      <Link href={`/media/academy/panel/${s.id}`} className="group flex flex-wrap items-center gap-5 px-6 py-5 transition-colors duration-150 hover:bg-(--c-bg-raised) md:px-10">
                        <span className="display grid w-20 shrink-0 place-items-center bg-(--c-app) py-2.5 text-center text-sm text-black">
                          <DateText iso={s.at} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="display block text-lg text-(--c-ink-strong)">
                            {s.learner} <span className="hud font-normal text-(--c-faint)">· {s.district}</span>
                          </span>
                          <span className="block text-sm text-(--c-app-ink)">{course?.title}</span>
                          <span className="hud mt-1 block text-(--c-faint)">
                            <DateText iso={s.at} time weekday /> · {s.project}
                          </span>
                        </span>
                        <span className={cn("hud inline-flex h-8 shrink-0 items-center gap-1.5 px-3 font-bold", mine ? "border border-(--c-line-strong) text-(--c-ink)" : "bg-(--c-signal) text-black")}>
                          {mine ? (
                            verdict ? (
                              VERDICTS[verdict]
                            ) : (
                              "জমা হয়েছে"
                            )
                          ) : (
                            <>
                              <Lock className="size-3.5" aria-hidden /> নম্বর দিন
                            </>
                          )}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-(--c-muted) transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <aside className="bg-(--c-bg) p-6 md:p-8">
            <h2 className="hud text-(--c-faint)">
              রুব্রিক · <Num value={100} />
            </h2>
            <ol className="mt-4 border-t border-(--c-line)">
              {RUBRIC.map((r, i) => (
                <li key={r.id} className="flex items-baseline justify-between gap-3 border-b border-(--c-line) py-3 text-sm">
                  <span className="flex gap-3 text-(--c-ink)">
                    <span className="hud text-(--c-faint)">{twoDigits(i + 1)}</span>
                    {r.bn}
                  </span>
                  <span className="display text-(--c-ink-strong)">
                    <Num value={r.max} />
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Band>

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
