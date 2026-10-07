"use client";

import Link from "next/link";
import { useState } from "react";
import { coursesOf } from "@/data/media/academy";
import type { Department } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";
import { JoinedMark } from "../joined-mark";
import { RoleArt, type ArtTone } from "./role-art";

/** A department the way a course site shows a role: picture, name, what it is, and its courses as credentials. */
export function RoleCard({ dept, tone }: { dept: Department; tone: ArtTone }) {
  const list = coursesOf(dept.id);
  const [all, setAll] = useState(false);
  const visible = all ? list : list.slice(0, 2);
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
        <div className="mt-1.5 empty:hidden">
          <JoinedMark dept={dept.id} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{dept.blurb}</p>
        <h4 className="mt-4 text-sm font-bold text-white">কোর্স</h4>
        {list.length === 0 ? (
          <p className="mt-2 text-sm text-white/60">প্রথম কোর্স প্যানেলে আছে।</p>
        ) : (
          <ul className="mt-2.5 space-y-3">
            {visible.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white font-mono text-[9px] font-extrabold text-text-primary">{c.id.split("-")[0]}</span>
                <Link href={`/media/academy/course/${c.id}`} className="text-sm leading-snug font-semibold text-signal-orange underline-offset-2 hover:underline">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {list.length > 2 && (
          <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className="mt-2.5 self-start text-sm font-semibold text-signal-orange hover:underline">
            {all ? "কম দেখান" : <>+ আরও <Num value={list.length - 2} />টি</>}
          </button>
        )}
      </div>
    </article>
  );
}
