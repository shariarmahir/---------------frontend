import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";
import { personOrThrow } from "@/data/media/users";
import { LEVELS, MODES } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { twoDigits } from "./band";
import type { CourseEntry } from "./entries";
import { toneStyle } from "./tones";

/** The widest row holds four cards; their pictures load straight away. */
const FIRST_ROW = 4;

const chip = "flex w-fit items-center gap-1 border border-(--c-line) bg-(--c-bg-sunken) px-1.5 py-px text-[11px] leading-snug font-medium";

/**
 * A course in the line-up, in its department's colour, built like the
 * department card: number and code across the top, the picture, the
 * department's icon breaking its edge, the title (its second half, after the
 * dash, in colour), the department and academy, what you will be able to do,
 * the facts as tags, and who teaches. The whole card opens the course; the
 * academy's name opens the academy. `level` marks the card for the level the
 * viewer said they are at; `dim` sets it back when it is not. `preview`
 * draws a course still being written, with no link to a page it lacks yet.
 */
export function CourseCard({ entry, n, level, dim, preview }: { entry: CourseEntry; n: number; level?: boolean; dim?: boolean; preview?: boolean }) {
  const { course: c, dept: d, seat } = entry;
  const [head, tail] = c.title.split(" — ");
  const teacher = personOrThrow(c.teacher);
  const title = `c-${c.id}-title`;

  return (
    <article
      id={`c-${c.id}`}
      data-reveal
      aria-labelledby={title}
      style={toneStyle(entry.tone)}
      className={cn("tone group relative flex h-full scroll-mt-32 flex-col bg-(--c-bg) transition-opacity duration-300 motion-reduce:transition-none", dim && "opacity-35 hover:opacity-100")}
    >
      {/* The department's colour draws across the top on hover. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-(--c-app) transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />

      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-3">
        <span className="hud bg-(--c-app) px-2 py-0.5 font-bold text-black">{twoDigits(n)}</span>
        <p className="hud font-mono tracking-[0.08em] text-(--c-faint)">{c.id}</p>
      </div>

      <div className="relative aspect-16/10 overflow-hidden border-b border-(--c-line) bg-(--c-bg-sunken)">
        <Image
          src={c.image}
          alt=""
          fill
          loading={n <= FIRST_ROW ? "eager" : undefined}
          sizes="(min-width: 1280px) 20rem, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {level && (
          <span className="hud absolute top-3 right-3 inline-flex items-center gap-1 bg-(--c-signal) px-2 py-0.5 font-bold text-black">
            <Sparkles className="size-3.5" aria-hidden />
            আপনার স্তর
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 md:px-8 md:pb-8">
        <span className="relative -mt-9 grid size-18 place-items-center rounded-[1.15rem] bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none">
          <DeptIcon dept={d.id} school={d.school} className="size-11" />
        </span>

        <h3 id={title} className="display mt-4 text-[1.55rem] leading-[1.15] text-(--c-ink-strong)">
          {preview ? (
            <>
              {head || "কোর্সের নাম"}
              {tail && <span className="text-(--c-app-ink)"> — {tail}</span>}
            </>
          ) : (
            <Link href={`/media/academy/course/${c.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-(--c-app)">
              {head}
              {tail && <span className="text-(--c-app-ink)"> — {tail}</span>}
            </Link>
          )}
        </h3>
        <p className="mt-2 text-sm font-semibold text-(--c-app-ink)">{d.name} বিভাগ</p>
        <Link
          href={`/media/academy/a/${d.academy.id}`}
          className="relative z-10 mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-(--c-muted) decoration-(--c-app) decoration-2 underline-offset-4 transition-colors hover:text-(--c-ink-strong) hover:underline"
        >
          <Landmark className="size-4 shrink-0 text-(--c-app-ink)" aria-hidden />
          {d.academy.name}
        </Link>
        <p className="mt-3 leading-relaxed text-(--c-muted)">{c.outcome}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="এক নজরে">
          <li className={cn(chip, "text-(--c-app-ink)")}>{LEVELS[c.level]}</li>
          <li className={cn(chip, "text-(--c-app-ink)")}>
            {!seat ? (
              "নতুন ব্যাচ শিগগির"
            ) : seat.running ? (
              <>
                ব্যাচ চলছে · <Num value={seat.left} />
                টি আসন
              </>
            ) : (
              <>
                পরের ব্যাচ <DateText iso={seat.starts} />
              </>
            )}
          </li>
          <li className={cn(chip, "text-(--c-muted)")}>{c.fee === 0 ? "বিনা ফি" : <Taka amount={c.fee} />}</li>
          {entry.modes.map((m) => (
            <li key={m} className={cn(chip, "text-(--c-muted)")}>
              {MODES[m]}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="hud flex items-center gap-1.5 text-(--c-muted) transition-colors group-hover:text-(--c-ink-strong)">
            কোর্স দেখুন
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden />
          </span>
          <span className="flex min-w-0 items-center gap-2 text-xs text-(--c-muted)">
            <span className="truncate">{teacher.nameBn}</span>
            <PersonAvatar person={teacher} size="sm" className="ring-2 ring-(--c-bg)" />
          </span>
        </div>
      </div>
    </article>
  );
}
