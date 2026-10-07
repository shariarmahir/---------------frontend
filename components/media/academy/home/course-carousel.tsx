"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShelfCourse {
  id: string;
  title: string;
  image: string;
  level: string;
  dept: string;
  school: string;
}

const DOTS = ["bg-m-blue-soft", "bg-m-yellow", "bg-m-card", "bg-m-green-soft"];

/**
 * Courses by school: tabs along the top, and a gold panel with a row of
 * course cards that scrolls sideways, by arrow or by swipe.
 */
export function CourseCarousel({ courses, schools }: { courses: ShelfCourse[]; schools: { id: string; name: string }[] }) {
  const base = useId();
  const reduce = useReducedMotion();
  const row = useRef<HTMLUListElement>(null);
  const [tab, setTab] = useState("all");
  const tabs = [{ id: "all", name: "সব কোর্স" }, ...schools];
  const shown = tab === "all" ? courses : courses.filter((c) => c.school === tab);
  const dotOf = (school: string) => DOTS[Math.max(0, schools.findIndex((s) => s.id === school)) % DOTS.length];

  function pick(id: string) {
    setTab(id);
    row.current?.scrollTo({ left: 0 });
  }

  const slide = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });

  return (
    <div>
      <div role="tablist" aria-label="স্কুল অনুযায়ী কোর্স" className="-mx-4 flex gap-7 overflow-x-auto border-b border-m-ink/13 px-4 scrollbar-none sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`${base}-row`}
            onClick={() => pick(t.id)}
            className={cn("relative shrink-0 pb-3 text-[17px] font-semibold whitespace-nowrap transition-colors", tab === t.id ? "text-m-blue" : "text-m-ink/80 hover:text-m-ink")}
          >
            {t.name}
            {tab === t.id && <motion.span layoutId={`${base}-bar`} className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-m-yellow" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>

      <div className="relative mt-6 rounded-3xl bg-m-yellow px-3 py-8 sm:px-16 sm:py-12">
        <ArrowButton side="left" onClick={() => slide(-1)} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab}
            ref={row}
            id={`${base}-row`}
            role="tabpanel"
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
          >
            {shown.map((c, i) => (
              <motion.li
                key={c.id}
                className="w-[16.5rem] shrink-0 snap-start"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 5) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/media/academy/course/${c.id}`} className="group block h-full overflow-hidden rounded-2xl bg-m-card text-m-ink shadow-m-tile ring-1 ring-m-ink/8 transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-m-lift focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-m-ink motion-reduce:transition-none">
                  <span className="relative block aspect-16/10 overflow-hidden">
                    <Image src={c.image} alt="" fill sizes="264px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                    <span className="absolute top-1/2 left-1/2 grid size-12 -translate-1/2 place-items-center rounded-full bg-m-ink/45 text-m-on backdrop-blur-sm transition-[scale,background-color,color] duration-300 group-hover:scale-110 group-hover:bg-m-yellow group-hover:text-m-ink motion-reduce:transition-none">
                      <ArrowUpRight className="size-5" aria-hidden />
                    </span>
                    <span className="absolute right-2.5 bottom-2.5 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-m-ink">{c.level}</span>
                  </span>
                  <span className="block p-4">
                    <span className="flex items-center gap-2 text-xs font-semibold text-m-ink/65">
                      <span className={cn("size-2.5 shrink-0 rounded-full", dotOf(c.school))} aria-hidden />
                      <span className="truncate">{c.dept}</span>
                    </span>
                    <span className="mt-1.5 block truncate text-base font-bold">
                      <span className="font-mono text-[13px] text-m-blue">{c.id}</span> · {c.title}
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <ArrowButton side="right" onClick={() => slide(1)} />
      </div>
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-m-ink text-m-on shadow-m-tile transition-[scale,background-color] duration-200 hover:scale-110 hover:bg-m-card hover:text-m-blue active:scale-95 sm:grid",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span className="sr-only">{side === "left" ? "আগের কোর্সগুলো" : "পরের কোর্সগুলো"}</span>
    </button>
  );
}
