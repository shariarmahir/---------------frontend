"use client";

import Link from "next/link";
import { useState } from "react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { CalendarClock, CircleCheck, GraduationCap, MapPin, Send, Users, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getCategory } from "@/data/media/categories";
import { jobTypeBn } from "@/data/media/jobs";
import type { Job } from "@/data/media/types";
import { CURRENT_USER_HANDLE, currentUser } from "@/data/media/users";
import { payUnitBn } from "@/lib/media/fair-pay";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { StatusBadge } from "../ui/trust";
import { skillStatus } from "@/lib/media/skill";

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
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">আবেদন — {job.title}</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">সার্টিফিকেট লাগবে না — আপনার প্রোফাইলই পোর্টফোলিও।</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <PersonAvatar person={currentUser} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary">{currentUser.nameBn}</p>
            <p className="truncate text-xs text-text-muted">{currentUser.headline}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">এই খাতে আপনার দক্ষতা</p>
          {relevant.length === 0 ? (
            <p className="text-sm text-text-muted">এই খাতে এখনো যাচাই করা দক্ষতা নেই — নোটে কাজের অভিজ্ঞতা লিখুন।</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {relevant.map((s) => (
                <li key={s.skill} className="flex items-center gap-1.5 rounded-lg border border-card-border px-2.5 py-1.5 text-xs font-semibold">
                  {s.skill} <StatusBadge status={skillStatus(s.self, s.communityAvg, s.raters)} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-primary">ছোট একটি নোট</span>
          <Textarea
            rows={4}
            value={note}
            aria-invalid={Boolean(error)}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError(null);
            }}
            placeholder="কোন কাজ আগে করেছেন, কবে থেকে শুরু করতে পারবেন।"
          />
          {error && <span role="alert" className="mt-1.5 block text-xs font-semibold text-national-crimson">{error}</span>}
        </label>
        <button type="button" onClick={submit} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
          <Send aria-hidden /> আবেদন পাঠান
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function JobCard({ job }: { job: Job }) {
  const [open, setOpen] = useState(false);
  const appliedAt = useMediaState((s) => s.applied[job.id]);
  const own = job.poster === CURRENT_USER_HANDLE;
  const sector = getCategory(job.sector);
  return (
    <article className="rounded-2xl border border-card-border bg-white p-4 transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgb(15_23_42/0.18)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-bd-green">{sector.bn}</p>
          <h3 className="mt-0.5 text-base font-bold text-text-primary">{job.title}</h3>
          <p className="text-sm text-text-secondary">
            <Link href={`/media/u/${job.poster}`} className="hover:text-bd-green hover:underline">{job.org}</Link>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-text-primary">
            <Taka amount={job.pay.min} />
            {job.pay.max > job.pay.min && (
              <>
                –<Taka amount={job.pay.max} />
              </>
            )}
          </p>
          <p className="text-xs text-text-muted">{payUnitBn[job.pay.unit]}</p>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-secondary">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-text-primary">{jobTypeBn[job.type]}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{job.location}</span>
        {job.remote && <span className="inline-flex items-center gap-1"><Wifi className="size-3.5" aria-hidden />রিমোট চলবে</span>}
        {job.studentFriendly && <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5" aria-hidden />শিক্ষার্থীদের জন্য</span>}
        <span className="inline-flex items-center gap-1 font-semibold text-bd-green-dark"><SealCheck size={15} weight="duotone" aria-hidden />ন্যায্য মজুরি</span>
      </p>

      <p className="mt-3 text-sm leading-relaxed text-text-primary">{job.description}</p>
      {job.requirements.length > 0 && (
        <ul className="mt-3 space-y-1">
          {job.requirements.map((r) => (
            <li key={r} className="flex gap-1.5 text-sm text-text-secondary">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-bd-green" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex flex-wrap gap-x-2 text-xs font-medium text-bd-green">
        {job.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={job.applicants + (appliedAt ? 1 : 0)} /> জন আবেদন করেছেন</span>
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden />শেষ তারিখ <DateText iso={job.deadline} /></span>
        </p>
        {own ? (
          <span className="text-xs font-semibold text-text-muted">আপনার পোস্ট</span>
        ) : appliedAt ? (
          <span className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-bd-green-light px-3 text-sm font-semibold text-bd-green-dark")}>
            <CircleCheck className="size-4" aria-hidden /> আবেদন করেছেন
          </span>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary", size: "sm" })}>
            <Send aria-hidden /> আবেদন করুন
          </button>
        )}
      </div>
      {!own && !appliedAt && <ApplyDialog job={job} open={open} onOpenChange={setOpen} />}
    </article>
  );
}
