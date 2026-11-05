import Image from "next/image";
import Link from "next/link";
import { Hand, MonitorPlay, Radio, type LucideIcon } from "lucide-react";
import { getDepartment, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, LEVELS, MODES, TIERS, teacherPoints, teacherTier, type Course, type Mode, type TeacherRecord, type Tier } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

const MODE_ICON: Record<Mode, LucideIcon> = { video: MonitorPlay, live: Radio, "hands-on": Hand };

/** How a lesson is taught: video, live, or hands-on in a real workshop. */
export function ModeTag({ mode, className }: { mode: Mode; className?: string }) {
  const Icon = MODE_ICON[mode];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", mode === "hands-on" ? "text-m-blue" : "text-m-ink/75", className)}>
      <Icon className="size-3.5" aria-hidden />
      {MODES[mode]}
    </span>
  );
}

/** The modes a course mixes, in a fixed order. */
export const modesOf = (c: Pick<Course, "lessons">) => (["live", "hands-on", "video"] as Mode[]).filter((m) => c.lessons.some((l) => l.mode === m));

/** The next session is hands-on when the course has workshop lessons and a real place. */
export const sessionMode = (c: Course): Mode => (c.lessons.some((l) => l.mode === "hands-on") && getDepartment(c.dept)?.place ? "hands-on" : "live");

export function Fee({ amount }: { amount: number }) {
  return amount === 0 ? <span className="font-bold text-m-green">বিনা ফি</span> : <span className="font-bold text-m-ink tabular-nums"><Taka amount={amount} /></span>;
}

/** A course in the catalogue; `preview` draws it unlinked, for a course still being built. */
export function CourseCard({ course, className, preview }: { course: Course; className?: string; preview?: boolean }) {
  const teacher = personOrThrow(course.teacher);
  const left = course.seats - course.enrolled;
  const frame = cn(
    "group flex flex-col overflow-hidden rounded-2xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile",
    !preview && "transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_var(--color-signal-orange)] hover:ring-m-blue/50 focus-visible:ring-2 focus-visible:ring-m-blue focus-visible:outline-none motion-reduce:hover:translate-y-0",
    className,
  );
  const body = (
    <>
      <div className="relative aspect-video overflow-hidden bg-m-canvas">
        <Image src={course.image} alt="" fill sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100" />
        <span className="absolute top-3 left-3 rounded-md bg-m-canvas px-2 py-1 font-mono text-[11px] font-bold text-m-blue">{course.id}</span>
        <span className="absolute top-3 right-3 rounded-md bg-m-yellow px-2 py-1 text-[11px] font-bold text-m-ink">{LEVELS[course.level]}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-m-blue">{getDepartment(course.dept)?.name}</p>
        <h3 className="mt-1 text-[17px] leading-snug font-bold text-balance text-m-ink group-hover:text-m-blue">{course.title || "কোর্সের নাম"}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-m-ink/80">
          <PersonAvatar person={teacher} size="xs" />
          {teacher.nameBn}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-m-ink/75"><Num value={COURSE_DAYS} /> দিন</span>
          {modesOf(course).map((m) => <ModeTag key={m} mode={m} />)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-m-ink/9 pt-3 text-sm">
          <Fee amount={course.fee} />
          <span className={cn("text-xs font-semibold", left === 0 ? "text-m-ink/65" : "text-m-ink/80")}>
            {left === 0 ? "আসন পূর্ণ · অপেক্ষা তালিকা" : <><Num value={left} />টি আসন বাকি</>}
          </span>
        </div>
      </div>
    </>
  );
  return preview ? <article className={frame}>{body}</article> : <Link href={`/media/academy/course/${course.id}`} className={frame}>{body}</Link>;
}

export const TIER_TONE: Record<Tier, string> = {
  lead: "bg-m-yellow text-m-ink",
  skilled: "bg-m-blue-soft text-m-ink",
  new: "bg-m-ink/6 text-m-ink",
  review: "bg-m-red text-m-on",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={cn("inline-flex h-6 items-center rounded-md px-2 text-xs font-bold whitespace-nowrap", TIER_TONE[tier])}>{TIERS[tier]}</span>;
}

/** A teacher's standing, computed from their record. */
export function standingOf(record: TeacherRecord) {
  const points = teacherPoints(record);
  return { points, tier: teacherTier(points.total, record.complaints.upheld) };
}

/** One row in a ranked list of teachers. */
export function TeacherRow({ handle, rank }: { handle: string; rank?: number }) {
  const record = teacherRecord(handle);
  if (!record) return null;
  const person = personOrThrow(handle);
  const { points, tier } = standingOf(record);
  return (
    <Link
      href={`/media/academy/teachers/${handle}`}
      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-m-ink/3 focus-visible:ring-2 focus-visible:ring-m-blue focus-visible:outline-none"
    >
      {rank !== undefined && <span className="w-6 shrink-0 text-center text-sm font-bold text-m-ink/65 tabular-nums"><Num value={rank} /></span>}
      <PersonAvatar person={person} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-m-ink group-hover:text-m-blue">{person.nameBn}</span>
        <span className="block truncate text-xs text-m-ink/70">{record.title}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-lg leading-none font-bold text-m-ink tabular-nums"><Num value={points.total} /></span>
        <TierBadge tier={tier} />
      </span>
    </Link>
  );
}
