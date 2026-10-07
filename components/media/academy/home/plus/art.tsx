import Image from "next/image";
import { BadgeCheck, Check, Clock3, Hammer, Users, Video } from "lucide-react";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num } from "../../../ui/numerals";

/*
 * The pictures beside the three "how it works" rows. Each is drawn from the
 * academy's own records rather than stock art, on a soft panel the way a
 * course site sets its illustrations.
 */

const panel = "relative overflow-hidden rounded-3xl p-5 sm:p-8";

/** A finished course: five class weeks ticked, the examiners' marks, and the certificate laid over it. */
export function ProofArt({ course, learner, certificate, marks }: { course: string; learner: string; certificate: string; marks: number[] }) {
  return (
    <div className={cn(panel, "bg-m-blue-soft")}>
      <span aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-m-blue/10" />
      <div className="relative w-[82%] rounded-2xl bg-white p-5 shadow-m-lift ring-1 ring-m-ink/6">
        <p className="text-xs font-bold text-m-blue">কোর্স শেষ</p>
        <p className="mt-1 line-clamp-1 font-bold text-m-ink">{course}</p>
        <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label="পাঁচ সপ্তাহের ক্লাস">
          {[1, 2, 3, 4, 5].map((w) => (
            <li key={w} className="flex flex-col items-center gap-1">
              <span className="grid h-7 w-full place-items-center rounded-md bg-m-blue text-m-on">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-[11px] text-m-ink/60">
                সপ্তাহ <Num value={w} />
              </span>
            </li>
          ))}
        </ol>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {marks.slice(0, 2).map((v, i) => ({ k: i, v })).map((m) => (
            <div key={m.k}>
              <dt className="text-xs text-m-ink/60">
                পরীক্ষক <Num value={m.k + 1} />
              </dt>
              <dd className="font-bold text-m-ink">
                <Num value={m.v} />/<Num value={100} />
              </dd>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-m-ink/8">
                <span className="block h-full rounded-full bg-m-green" style={{ width: `${m.v}%` }} />
              </span>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative -mt-10 ml-auto w-[64%] rotate-[-3deg] rounded-2xl bg-white p-4 shadow-[0_24px_44px_-18px_rgb(0_31_107/0.45)] ring-1 ring-m-yellow/70">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-m-yellow" />
        <p className="flex items-center gap-1.5 text-xs font-bold text-m-green">
          <BadgeCheck className="size-4" aria-hidden /> যাচাই করা সনদ
        </p>
        <p className="mt-1.5 font-bold text-m-ink">{learner}</p>
        <p className="mt-1 font-mono text-[13px] font-semibold text-m-blue">{certificate}</p>
      </div>
    </div>
  );
}

/** The forty days laid out: five class weeks, then the project and the panel. */
export function PathArt() {
  const steps = [
    ...[1, 2, 3, 4, 5].map((w) => ({ key: `w${w}`, label: <>সপ্তাহ <Num value={w} /></>, tone: "bg-m-blue text-m-on" })),
    { key: "project", label: <>প্রজেক্ট</>, tone: "bg-m-yellow text-m-ink" },
    { key: "panel", label: <>প্যানেল</>, tone: "bg-m-blue-night text-m-on" },
  ];
  return (
    <div className={cn(panel, "bg-m-amber-soft")}>
      <span aria-hidden className="absolute -bottom-20 -left-12 size-60 rounded-full bg-m-yellow/25" />
      <div className="relative rounded-2xl bg-white p-5 shadow-m-lift ring-1 ring-m-ink/6">
        <p className="flex items-baseline justify-between text-sm">
          <span className="font-bold text-m-ink">আপনার পথ</span>
          <span className="text-xs text-m-ink/60">
            দিন <Num value={1} /> → <Num value={COURSE_DAYS} />
          </span>
        </p>
        <ol className="relative mt-5 grid grid-cols-7 gap-1">
          <span aria-hidden className="absolute top-3.5 right-[7%] left-[7%] h-0.5 bg-m-ink/10" />
          {steps.map((s) => (
            <li key={s.key} className="relative flex flex-col items-center gap-1.5 text-center">
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full ring-4 ring-white", s.tone)} aria-hidden>
                <span className="size-2 rounded-full bg-current opacity-80" />
              </span>
              <span className="text-[11px] leading-tight font-semibold text-m-ink sm:text-xs">{s.label}</span>
            </li>
          ))}
        </ol>
        {/* The forty days to scale: thirty-five of classes, five for the project and the panel. */}
        <div className="mt-5 flex h-9 overflow-hidden rounded-xl text-xs font-bold">
          <span className="flex items-center justify-center bg-m-blue text-m-on" style={{ width: `${(35 / COURSE_DAYS) * 100}%` }}>
            দিন <Num value={1} />–<Num value={35} /> · ক্লাস
          </span>
          <span className="flex flex-1 items-center justify-center bg-m-yellow text-m-ink">
            <Num value={36} />–<Num value={COURSE_DAYS} />
          </span>
        </div>
      </div>
      <ul className="relative mt-4 flex flex-wrap gap-2">
        {[
          { Icon: Clock3, text: <><Num value={CLASS_MINUTES} /> মিনিটের ক্লাস</> },
          { Icon: Video, text: <>অনলাইনে, রেকর্ডিংসহ</> },
          { Icon: Users, text: <>ব্যাচে <Num value={BATCH_MAX.solo} />–<Num value={BATCH_MAX.team} /> জন</> },
        ].map((c, i) => (
          <li key={i} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-m-ink shadow-m-ink">
            <c.Icon className="size-3.5 text-m-blue" aria-hidden />
            {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A real workshop with real final projects pinned over it. */
export function ProjectArt({ image, alt, projects }: { image: string; alt: string; projects: string[] }) {
  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-m-lift">
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 34rem, 92vw" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-m-blue-night/55 via-transparent to-transparent" />
      </div>
      <ul className="absolute inset-x-3 bottom-3 space-y-2 sm:inset-x-auto sm:right-[-1rem] sm:bottom-6 sm:w-[78%]">
        {projects.map((p) => (
          <li key={p} className="flex items-start gap-2.5 rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-semibold text-m-ink shadow-m-lift backdrop-blur">
            <Hammer className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden />
            <span className="line-clamp-1">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
