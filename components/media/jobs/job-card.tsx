"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { ArrowUpRight, CalendarClock, CircleCheck, Clock, GraduationCap, MapPin, Send, Sparkles, Users, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getCourse } from "@/data/media/academy";
import { categories, getCategory } from "@/data/media/categories";
import { jobTypeBn } from "@/data/media/jobs";
import type { Job } from "@/data/media/types";
import { CURRENT_USER_HANDLE, currentUser } from "@/data/media/users";
import { payUnitBn } from "@/lib/media/fair-pay";
import { skillStatus } from "@/lib/media/skill";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { toneStyle } from "../academy/catalogue/tones";
import { mediaButton } from "../ui/button-styles";
import { Ago, DateText, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { StatusBadge } from "../ui/trust";

/** A sector's place in the catalogue gives its jobs the same colour as its academy cards. */
const toneOf = (job: Job) =>
  toneStyle(
    Math.max(
      0,
      categories.findIndex((c) => c.id === job.sector),
    ),
  );

const hud = "font-mono text-[11px] font-bold tracking-wide uppercase";

function Pay({ job, className }: { job: Job; className?: string }) {
  return (
    <span className={className}>
      <Taka amount={job.pay.min} />
      {job.pay.max > job.pay.min && (
        <>
          –<Taka amount={job.pay.max} />
        </>
      )}
    </span>
  );
}

/** Apply with a short note; the profile goes with it as the portfolio. */
function ApplyDialog({ job, open, onOpenChange }: { job: Job; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const relevant = currentUser.skills.filter((s) => s.category === job.sector);

  function submit() {
    if (note.trim().length < 20) return setError("কেন এই কাজে আপনি ভালো — অন্তত ২০ অক্ষরে লিখুন।");
    updateMedia((s) => ({ ...s, applied: { ...s.applied, [job.id]: new Date().toISOString() } }));
    onOpenChange(false);
    toast.success("আবেদন পাঠানো হয়েছে", { description: `${job.org} আপনার প্রোফাইল ও যাচাইকৃত দক্ষতা দেখবেন।` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl bg-m-card font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-m-ink">আবেদন — {job.title}</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/80">সার্টিফিকেট লাগবে না — আপনার প্রোফাইলই পোর্টফোলিও।</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-xl bg-m-ink/6 p-3">
          <PersonAvatar person={currentUser} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-m-ink">{currentUser.nameBn}</p>
            <p className="truncate text-xs text-m-ink/65">{currentUser.headline}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-m-ink">এই খাতে আপনার দক্ষতা</p>
          {relevant.length === 0 ? (
            <p className="text-sm text-m-ink/65">এই খাতে এখনো যাচাই করা দক্ষতা নেই — নোটে কাজের অভিজ্ঞতা লিখুন।</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {relevant.map((s) => (
                <li key={s.skill} className="flex items-center gap-1.5 rounded-lg border border-m-ink/10 px-2.5 py-1.5 text-xs font-semibold">
                  {s.skill} <StatusBadge status={skillStatus(s.self, s.communityAvg, s.raters)} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-m-ink">ছোট একটি নোট</span>
          <Textarea
            rows={4}
            value={note}
            aria-invalid={Boolean(error)}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError(null);
            }}
            placeholder="কোন কাজ আগে করেছেন, কবে থেকে শুরু করতে পারবেন…"
          />
          {error && (
            <span role="alert" className="mt-1.5 block text-xs font-semibold text-m-red">
              {error}
            </span>
          )}
        </label>
        <button type="button" onClick={submit} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
          <Send aria-hidden /> আবেদন পাঠান
        </button>
      </DialogContent>
    </Dialog>
  );
}

/** Apply, or what has already happened: your own post, or your application. */
function ApplyAction({ job, onApply, size = "sm" }: { job: Job; onApply: () => void; size?: "sm" | "md" }) {
  const appliedAt = useMediaState((s) => s.applied[job.id]);
  if (job.poster === CURRENT_USER_HANDLE) return <span className="text-xs font-semibold text-m-ink/65">আপনার পোস্ট</span>;
  if (appliedAt)
    return (
      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-m-ink/8 px-3 text-sm font-semibold text-m-ink">
        <CircleCheck className="size-4 text-m-green" aria-hidden /> আবেদন করেছেন
      </span>
    );
  return (
    <button type="button" onClick={onApply} className={mediaButton({ variant: "primary", size })}>
      <Send aria-hidden /> আবেদন করুন
    </button>
  );
}

function Facts({ job }: { job: Job }) {
  const applied = useMediaState((s) => Boolean(s.applied[job.id]));
  const rows: [React.ReactNode, React.ReactNode][] = [
    ["ধরন", jobTypeBn[job.type]],
    ["জায়গা", `${job.location}${job.remote ? " · রিমোট চলবে" : ""}`],
    ...(job.hours ? ([["সময়", job.hours]] as [string, string][]) : []),
    ...(job.openings
      ? ([
          [
            "পদ",
            <>
              <Num key="n" value={job.openings} />
              টি
            </>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ["শেষ তারিখ", <DateText key="d" iso={job.deadline} />],
    [
      "আবেদন",
      <>
        <Num key="a" value={job.applicants + (applied ? 1 : 0)} /> জন
      </>,
    ],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-m-ink/10 bg-m-ink/10 sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={String(k)} className="bg-m-card px-3 py-2.5">
          <dt className={cn(hud, "text-m-ink/50")}>{k}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-m-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Everything about one job: the work, what it asks, what comes with it, how hiring goes, and where to learn it. */
function JobDetails({ job, open, onOpenChange, onApply }: { job: Job; open: boolean; onOpenChange: (o: boolean) => void; onApply: () => void }) {
  const sector = getCategory(job.sector);
  const courses = (job.courses ?? []).flatMap((id) => getCourse(id) ?? []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={toneOf(job)}
        // Open at the top, on the picture and the title, not scrolled down to the sticky apply button.
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="tone block max-h-[92dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-3xl bg-m-card p-0 font-sans sm:max-w-2xl"
      >
        <div className="relative aspect-[16/7] overflow-hidden bg-m-mist">
          {job.image && <Image src={job.image} alt="" fill sizes="(min-width: 672px) 42rem, 100vw" className="object-cover" />}
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-m-card via-m-card/30 to-transparent" />
        </div>
        <div className="space-y-6 px-5 pb-6 sm:px-7">
          <DialogHeader className="relative -mt-10 space-y-1 text-left">
            <p className={cn(hud, "text-(--c-app-ink)")}>{sector.bn}</p>
            <DialogTitle className="text-2xl leading-tight font-bold text-m-ink">{job.title}</DialogTitle>
            <DialogDescription className="text-sm text-m-ink/70">
              <Link href={`/media/u/${job.poster}`} className="font-semibold text-m-ink hover:underline">
                {job.org}
              </Link>{" "}
              · <Ago iso={job.postedAt} /> পোস্ট
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <p>
              <Pay job={job} className="text-2xl font-bold text-m-ink" />
              <span className="ml-1.5 text-sm text-m-ink/60">{payUnitBn[job.pay.unit]}</span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-m-blue">
              <SealCheck size={16} weight="duotone" aria-hidden /> ন্যায্য মজুরি
            </span>
          </div>

          <Facts job={job} />

          <section>
            <h3 className="text-base font-bold text-m-ink">কাজটা কী</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-m-ink/85">{job.description}</p>
          </section>

          {job.requirements.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-m-ink">যা লাগবে</h3>
              <ul className="mt-2 space-y-1.5">
                {job.requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-m-ink/85">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-(--c-app-ink)" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.perks && job.perks.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-m-ink">যা পাবেন</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {job.perks.map((p) => (
                  <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-m-ink/12 px-3 py-1 text-xs font-semibold text-m-ink/85">
                    <Sparkles className="size-3.5 text-(--c-app-ink)" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.steps && job.steps.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-m-ink">নিয়োগ যেভাবে হবে</h3>
              <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {job.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 rounded-xl border border-m-ink/10 p-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-(--c-app) font-mono text-xs font-bold text-black">
                      <Num value={i + 1} />
                    </span>
                    <span className="text-sm text-m-ink/85">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {courses.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-m-ink">একাডেমিতে শিখে নিন</h3>
              <p className="mt-1 text-xs text-m-ink/60">এই কাজের দক্ষতা হাতে-কলমে শেখায় এমন কোর্স — পাস করলে সনদ আপনার প্রোফাইলে উঠবে।</p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {courses.map((c) => (
                  <li key={c.id}>
                    <Link href={`/media/academy/course/${c.id}`} className="group flex items-center gap-3 rounded-xl border border-m-ink/10 p-2.5 transition-colors hover:border-(--c-app)">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-m-mist">
                        {c.image && <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn(hud, "block text-m-ink/50")}>{c.id}</span>
                        <span className="line-clamp-2 text-sm font-semibold text-m-ink">{c.title}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-m-ink/40 transition-colors group-hover:text-m-ink" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-m-ink/10 bg-m-card/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
            <p className="flex flex-wrap gap-x-2 text-xs font-medium text-m-blue">
              {job.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>
            <ApplyAction job={job} onApply={onApply} size="md" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A job in the academy's card: number and sector across the top, the
 * workplace picture with the pay over it, the employer's initial breaking out
 * of the picture's edge, then the work in two lines, its facts as tags, the
 * academy courses that teach it, and the way to apply. "বিস্তারিত" opens all
 * of it.
 */
export function JobCard({ job, n }: { job: Job; n?: number }) {
  const ensure = useRequireAccount();
  const [details, setDetails] = useState(false);
  const [apply, setApply] = useState(false);
  const sector = getCategory(job.sector);
  const startApply = () => {
    if (!ensure("আবেদন করতে")) return;
    setDetails(false);
    setApply(true);
  };

  return (
    <article
      id={job.id}
      style={toneOf(job)}
      className="tone story-reveal relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-m-ink/10 bg-m-card transition-colors duration-300 target:ring-2 target:ring-m-blue hover:border-(--c-app)/60"
    >
      <span aria-hidden className="tone-bar" />
      <div className="flex items-center justify-between gap-3 border-b border-m-ink/10 px-4 py-2.5">
        {n !== undefined && (
          <span className="bg-(--c-app) px-1.5 font-mono text-[11px] font-bold text-black">
            <Num value={String(n).padStart(2, "0")} />
          </span>
        )}
        <span className={cn(hud, "ml-auto truncate text-m-ink/55")}>{sector.bn}</span>
      </div>

      <button type="button" onClick={() => setDetails(true)} className="group/pic relative block aspect-16/9 overflow-hidden bg-m-mist text-left" aria-label={`${job.title} — বিস্তারিত`}>
        {job.image ? (
          <Image
            src={job.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 24rem, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/pic:scale-[1.04] motion-reduce:transition-none"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--c-app),transparent_60%)] opacity-40" />
        )}
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">{jobTypeBn[job.type]}</span>
        <span className="absolute right-3 bottom-3 text-right text-white">
          <Pay job={job} className="block text-lg leading-tight font-bold" />
          <span className="text-[11px] text-white/80">{payUnitBn[job.pay.unit]}</span>
        </span>
      </button>

      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5">
        <span aria-hidden className="relative -mt-6 grid size-12 place-items-center rounded-2xl bg-(--c-app) text-lg font-bold text-black shadow-m-tile">
          {job.org.trim().slice(0, 1)}
        </span>
        <h3 className="mt-3 text-lg leading-snug font-bold text-m-ink">{job.title}</h3>
        <p className="mt-0.5 text-sm text-m-ink/70">
          <Link href={`/media/u/${job.poster}`} className="font-semibold text-m-ink/85 hover:text-m-ink hover:underline">
            {job.org}
          </Link>
        </p>

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-m-ink/70">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {job.location}
          </span>
          {job.remote && (
            <span className="inline-flex items-center gap-1">
              <Wifi className="size-3.5" aria-hidden />
              রিমোট
            </span>
          )}
          {job.hours && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {job.hours}
            </span>
          )}
          {job.studentFriendly && (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="size-3.5" aria-hidden />
              শিক্ষার্থীদের জন্য
            </span>
          )}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-m-ink/85">{job.description}</p>

        {job.courses && job.courses.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-m-ink/55">একাডেমিতে শিখুন:</span>
            {job.courses.map((id) => (
              <Link
                key={id}
                href={`/media/academy/course/${id}`}
                className="rounded-md border border-(--c-app)/40 px-1.5 py-0.5 font-mono font-bold text-(--c-app-ink) transition-colors hover:bg-(--c-app) hover:text-black"
              >
                {id}
              </Link>
            ))}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-m-ink/10 pt-3">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-m-ink/60">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" aria-hidden />
                <Num value={job.applicants} /> জন
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden />
                <DateText iso={job.deadline} />
              </span>
            </p>
            <span className="flex items-center gap-2">
              <button type="button" onClick={() => setDetails(true)} className={mediaButton({ variant: "quiet", size: "sm" })}>
                বিস্তারিত
              </button>
              <ApplyAction job={job} onApply={startApply} />
            </span>
          </div>
        </div>
      </div>

      <JobDetails job={job} open={details} onOpenChange={setDetails} onApply={startApply} />
      <ApplyDialog job={job} open={apply} onOpenChange={setApply} />
    </article>
  );
}
