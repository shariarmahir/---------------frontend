"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { coursesOf } from "@/data/media/academy";
import { DEPT_KINDS, LEVELS, type Department, type Level } from "@/lib/media/academy";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { JoinedMark } from "../joined-mark";
import { RoleArt, type ArtTone } from "./role-art";

/**
 * A department the way a course site shows a role: picture, name, what it
 * is, how many courses at which levels, and "বিভাগ দেখুন" — its courses are
 * listed on the department's own page.
 */
export function RoleCard({ dept, tone }: { dept: Department; tone: ArtTone }) {
  const list = coursesOf(dept.id);
  const levels = (Object.keys(LEVELS) as Level[]).filter((l) => list.some((c) => c.level === l));
  const href = `/media/academy/dept/${dept.id}`;
  return (
    <article className="group flex h-full flex-col rounded-2xl bg-text-primary p-2 ring-1 ring-white/12 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_46px_-26px_var(--color-signal-orange)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <RoleArt dept={dept} tone={tone} />
      </Link>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <h3 className="text-lg leading-snug font-bold text-white">
          <Link href={href} className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange">
            {dept.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-signal-orange">
          {dept.academy.name} · {DEPT_KINDS[dept.kind]}
        </p>
        <div className="mt-1.5 empty:hidden">
          <JoinedMark dept={dept.id} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{dept.blurb}</p>
        <p className="mt-4 text-sm text-white/70">
          {list.length === 0 ? (
            "প্রথম কোর্স প্যানেলে আছে"
          ) : (
            <>
              <span className="font-bold text-white">
                <Num value={list.length} />টি কোর্স
              </span>{" "}
              · {levels.map((l) => LEVELS[l]).join(", ")}
            </>
          )}
        </p>
        <div className="mt-auto pt-5">
          <Link href={href} className={mediaButton({ variant: "outline", size: "sm", className: "group/btn" })}>
            বিভাগ দেখুন <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
