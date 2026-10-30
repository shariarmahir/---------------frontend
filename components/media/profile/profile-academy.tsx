"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, BadgeCheck, GraduationCap, Sparkles } from "lucide-react";
import { coursesBy } from "@/data/media/academy";
import { certificatesFor } from "@/data/media/certificates";
import { getCategory } from "@/data/media/categories";
import type { Person } from "@/data/media/types";
import { cn } from "@/lib/utils";
import { toneStyle } from "../academy/catalogue/tones";
import { Num } from "../ui/numerals";
import { glass } from "./glass";
import { useAcademySteps } from "./use-academy-steps";

interface Skill {
  name: string;
  tag: string;
  badge?: string;
  href?: string;
  academy?: boolean;
}

function SkillCard({ skill, i }: { skill: Skill; i: number }) {
  const Icon = skill.academy ? GraduationCap : skill.badge ? BadgeCheck : Sparkles;
  const body = (
    <>
      <span style={toneStyle(i) as CSSProperties} className="tone grid size-11 place-items-center rounded-2xl bg-(--c-app)/18 text-(--c-app-ink)">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="mt-4 block text-[15px] font-bold text-m-ink">{skill.name}</span>
      <span className="mt-0.5 block text-xs text-m-ink/60">{skill.tag}</span>
      {skill.badge && <span className="mt-3 inline-block rounded-full bg-m-ink/8 px-2.5 py-1 text-[11px] font-semibold text-m-ink/85">{skill.badge}</span>}
      {skill.href && <ArrowUpRight className="absolute top-4 right-4 size-4 text-m-ink/40 transition-colors group-hover:text-m-ink" aria-hidden />}
    </>
  );
  const box = cn(
    glass,
    "group relative block rounded-2xl p-4 shadow-none transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-m-ink/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  );
  return skill.href ? (
    <Link href={skill.href} className={box}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

/**
 * What the person can do: the skills they claimed (marked once the community
 * verified them), the courses they teach, and — on the viewer's own page —
 * every academy course they have finished, added by itself.
 */
export function ProfileSkills({ person, self }: { person: Person; self: boolean }) {
  const steps = useAcademySteps();
  const certs = certificatesFor(person);
  const claimed: Skill[] = person.skills.map((s, n) => {
    const cert = certs.find((c) => c.n === n);
    return { name: s.skill, tag: getCategory(s.category).bn, badge: cert ? "কমিউনিটি-যাচাইকৃত" : undefined, href: cert ? `/media/certificate/${person.handle}/${cert.n}` : undefined };
  });
  const academy: Skill[] = self
    ? steps.filter((c) => c.done).map((c) => ({ name: c.title, tag: c.dept, badge: "একাডেমি · কোর্স সম্পন্ন", href: `/media/academy/course/${c.id}`, academy: true }))
    : coursesBy(person.handle).map((c) => ({ name: c.title, tag: c.id, badge: "একাডেমিতে পড়ান", href: `/media/academy/course/${c.id}`, academy: true }));
  const all = [...claimed, ...academy.filter((a) => !claimed.some((c) => c.name === a.name))];

  if (all.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-m-ink/70">
        এখনো কোনো দক্ষতা নেই।{" "}
        {self && (
          <>
            একাডেমির কোনো কোর্স শেষ করলে সেটি এখানে নিজে থেকেই যোগ হবে —{" "}
            <Link href="/media/academy/courses" className="font-semibold text-m-blue hover:underline">
              কোর্স দেখুন
            </Link>
            ।
          </>
        )}
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {all.map((s, i) => (
        <li key={s.name}>
          <SkillCard skill={s} i={i} />
        </li>
      ))}
    </ul>
  );
}

/** The academy road, course by course, like the reference's design-process steps. */
export function ProfileJourney({ person, self }: { person: Person; self: boolean }) {
  const steps = useAcademySteps();
  const items = self
    ? steps.map((c) => ({ id: c.id, title: c.title, note: c.dept, state: c.done ? "সম্পন্ন" : `ক্লাস ${c.pct}%`, done: c.done }))
    : coursesBy(person.handle).map((c) => ({ id: c.id, title: c.title, note: c.id, state: "পড়ান", done: true }));

  if (items.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-m-ink/70">
        {self ? (
          <>
            একাডেমিতে ভর্তি হলে প্রতিটি কোর্সের অগ্রগতি এখানে দেখাবে।{" "}
            <Link href="/media/academy" className="font-semibold text-m-blue hover:underline">
              একাডেমি দেখুন
            </Link>
          </>
        ) : (
          "একাডেমির কোনো কোর্স এখনো নেই।"
        )}
      </p>
    );
  }
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.slice(0, 5).map((s, i) => (
        <li key={s.id}>
          <Link href={`/media/academy/course/${s.id}`} className={cn(glass, "block h-full rounded-2xl p-4 shadow-none transition-colors hover:border-m-ink/25")}>
            <span className={cn("font-mono text-sm font-bold", s.done ? "text-m-blue" : "text-m-ink/45")}>
              <Num value={String(i + 1).padStart(2, "0")} />
            </span>
            <span className="mt-2 line-clamp-2 block text-sm font-bold text-m-ink">{s.title}</span>
            <span className="mt-1 block truncate text-xs text-m-ink/60">{s.note}</span>
            <span className={cn("mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold", s.done ? "bg-m-blue/15 text-m-ink" : "bg-m-ink/8 text-m-ink/70")}>{s.state}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** How many academy courses the viewer has finished, for the stats row. */
export function DoneCount() {
  const n = useAcademySteps().filter((c) => c.done).length;
  return <Num value={n} />;
}
