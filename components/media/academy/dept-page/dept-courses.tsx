"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Binoculars, Rocket, Shuffle, TrendingUp, type LucideIcon } from "lucide-react";
import { LEVELS, type Department, type Level } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Lean } from "../catalogue/band";
import { blockBtn } from "../catalogue/buttons";
import { CourseLineup } from "../catalogue/course-lineup";
import type { CourseEntry } from "../catalogue/entries";
import { useAcademy } from "../use-academy";

type Purpose = "start" | "change" | "grow" | "hobby";
const PURPOSES: { id: Purpose; label: string; Icon: LucideIcon }[] = [
  { id: "start", label: "পেশা শুরু করতে", Icon: Rocket },
  { id: "change", label: "পেশা বদলাতে", Icon: Shuffle },
  { id: "grow", label: "এখনকার কাজে এগোতে", Icon: TrendingUp },
  { id: "hobby", label: "শখে শিখতে", Icon: Binoculars },
];

const hintLink = "font-semibold text-(--c-accent-ink) underline-offset-4 hover:underline";

/**
 * The department's courses, with "আজ কেন এসেছেন?" over them: four answers,
 * each marking the level that suits it and saying in a line what to do next.
 * A learner the admission placed starts at that level.
 */
export function DeptCourses({ dept, entries, levels }: { dept: Department; entries: CourseEntry[]; levels: Level[] }) {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admissions[dept.id]);
  const placed = hydrated && admission && levels.includes(admission.level) ? admission.level : null;
  const [chosen, setChosen] = useState<Level | null | undefined>(undefined);
  const [picked, setPicked] = useState<Purpose | null>(null);
  const level = chosen === undefined ? placed : chosen;
  const lowest = levels[0];
  const highest = levels[levels.length - 1];

  const hint: Record<Purpose, React.ReactNode> = {
    start: (
      <>
        “{LEVELS[lowest]}” স্তরের কোর্স আলাদা করে দেখালাম। পছন্দ হলে{" "}
        <a href="#join" className={hintLink}>
          এখান থেকে ভর্তি হোন
        </a>{" "}
        — এক ফর্মেই।
      </>
    ),
    change: <>অন্য কাজ থেকে আসছেন? কাজ জানা থাকলে উপরের স্তরের কোর্সেও সরাসরি ভর্তি হতে পারেন। আপাতত “{LEVELS[lowest]}” দেখাচ্ছি।</>,
    grow:
      levels.length > 1 ? (
        <>কাজ জানেন, আরও এগোতে চান — “{LEVELS[highest]}” স্তরের কোর্স আলাদা করে দেখালাম।</>
      ) : (
        <>
          এই বিভাগে এখন শুধু “{LEVELS[highest]}” স্তরের কোর্স আছে —{" "}
          <a href="#join" className={hintLink}>
            এখান থেকে ভর্তি হোন
          </a>
          ।
        </>
      ),
    hobby: (
      <>
        শখের জন্য প্রতি সপ্তাহের{" "}
        <a href="#resources" className={hintLink}>
          বিনামূল্যের ক্লাসই
        </a>{" "}
        যথেষ্ট হতে পারে — ভর্তি ছাড়াই দেখা যায়।
      </>
    ),
  };

  function pick(p: Purpose) {
    setPicked(p);
    if (p === "grow") setChosen(highest);
    else if (p !== "hobby") setChosen(lowest);
  }

  return (
    <>
      <div className="border-b border-(--c-line)">
        <div role="radiogroup" aria-labelledby={`why-${dept.id}`} className="grid gap-px bg-(--c-line) sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,1fr))]">
          <p id={`why-${dept.id}`} className="display flex items-center bg-(--c-bg) px-6 py-5 text-xl text-(--c-ink-strong) sm:col-span-2 md:px-10 lg:col-span-1">
            আজ কেন এসেছেন?
          </p>
          {PURPOSES.map(({ id, label, Icon }) => {
            const on = picked === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(id)}
                className={cn("group flex items-center gap-3 px-6 py-5 text-left text-sm font-semibold transition-colors duration-150", on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)")}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center border transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none",
                    on ? "border-transparent bg-(--c-signal) text-black" : "border-(--c-line) text-(--c-accent-ink)",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {picked && (
          <p aria-live="polite" className="border-t border-(--c-line) px-6 py-4 text-sm leading-relaxed text-(--c-ink) md:px-10">
            {hint[picked]}
          </p>
        )}
      </div>

      <CourseLineup
        entries={entries}
        level={level}
        onLevel={setChosen}
        last={
          <>
            <p className="hud text-(--c-faint)">আরও কোর্স</p>
            <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
              সব একাডেমির <Lean>কোর্স</Lean>।
            </h3>
            <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">এই বিভাগের বাইরেও দেখুন — স্তর ধরে মিলিয়ে।</p>
            <div className="mt-auto pt-8">
              <Link href="/media/academy/courses" className={blockBtn}>
                সব কোর্স
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </>
        }
      />
    </>
  );
}
