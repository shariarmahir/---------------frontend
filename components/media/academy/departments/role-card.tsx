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
 * listed on the department's own page. A `note` (why it is shown here) and a
 * `progress` bar (for departments the learner is already in) are optional.
 */
export function RoleCard({ dept, tone, note, progress }: { dept: Department; tone: ArtTone; note?: string; progress?: { done: number; total: number; ready: boolean } }) {
  const list = coursesOf(dept.id);
  const levels = (Object.keys(LEVELS) as Level[]).filter((l) => list.some((c) => c.level === l));
  const href = `/media/academy/dept/${dept.id}`;
  return (
    <article className="group flex h-full flex-col rounded-2xl bg-m-card p-2 ring-1 ring-m-ink/10 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_46px_-26px_var(--color-signal-orange)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 shadow-m-tile">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <RoleArt dept={dept} tone={tone} />
      </Link>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        {note && <p className="mb-1.5 self-start rounded-md bg-m-ink/6 px-2 py-0.5 text-xs font-semibold text-m-ink/85">{note}</p>}
        <h3 className="text-lg leading-snug font-bold text-m-ink">
          <Link href={href} className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-m-blue">
            {dept.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-m-blue">
          {dept.academy.name} · {DEPT_KINDS[dept.kind]}
        </p>
        <div className="mt-1.5 empty:hidden">
          <JoinedMark dept={dept.id} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-m-ink/75">{dept.blurb}</p>
        <p className="mt-4 text-sm text-m-ink/70">
          {list.length === 0 ? (
            "প্রথম কোর্স প্যানেলে আছে"
          ) : (
            <>
              <span className="font-bold text-m-ink">
                <Num value={list.length} />টি কোর্স
              </span>{" "}
              · {levels.map((l) => LEVELS[l]).join(", ")}
            </>
          )}
        </p>
        {progress && (
          <div className="mt-3">
            <span className="block h-1.5 overflow-hidden rounded-full bg-m-ink/6">
              <span className="block h-full rounded-full bg-m-yellow" style={{ width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%` }} />
            </span>
            <span className="mt-1 block text-xs text-m-ink/65">
              <Num value={progress.done} />/<Num value={progress.total} /> ক্লাস · {progress.ready ? "ফাইনালের জন্য তৈরি" : "চলছে"}
            </span>
          </div>
        )}
        <div className="mt-auto pt-5">
          <Link href={href} className={mediaButton({ variant: "outline", size: "sm", className: "group/btn" })}>
            বিভাগ দেখুন <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
