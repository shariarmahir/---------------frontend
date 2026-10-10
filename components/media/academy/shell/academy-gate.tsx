"use client";

import Image from "next/image";
import { useState } from "react";
import { GraduationCap, Presentation, X, type LucideIcon } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getDepartment } from "@/data/media/academy";
import { LEVELS } from "@/lib/media/academy";
import { useAuth } from "@/lib/auth/client";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { PictureCaptcha } from "../../classroom/focus/picture-captcha";
import { Num } from "../../ui/numerals";
import { useTeacher } from "../desk/use-teacher";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";

export type AcademyRole = "learner" | "teacher";

const LAST = "academy-entry";
const FIRST_STEPS = ["একাডেমি, বিভাগ, কোর্স", "দশ মিনিটের চার প্রশ্ন", "প্রথম ক্লাস অনলাইনে"];

function remembered(): AcademyRole {
  try {
    return window.sessionStorage.getItem(LAST) === "teacher" ? "teacher" : "learner";
  } catch {
    return "learner";
  }
}

/**
 * The gold door to the academy, like the classroom's: come in to learn or
 * to teach. A learner sees the departments they belong to (or the three
 * steps to the first one); a teacher sees their standing.
 */
export function AcademyGate({ onEnter, onLeave }: { onEnter: (role: AcademyRole) => void; onLeave: () => void }) {
  const { account } = useAuth();
  const [role, setRole] = useState<AcademyRole>(remembered);

  function enter() {
    if (!account) return;
    try {
      window.sessionStorage.setItem(LAST, role);
    } catch {
      // Private mode: the choice simply is not remembered.
    }
    onEnter(role);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onLeave()}>
      <DialogContent showCloseButton={false} className="max-h-[94dvh] overflow-y-auto !rounded-3xl !border-0 !bg-m-yellow !p-0 font-sans !text-m-ink shadow-[0_40px_90px_-30px_var(--color-signal-orange)] sm:max-w-xl">
        <div className="relative space-y-5 p-5 sm:p-7">
          <DialogTitle className="sr-only">কাণ্ডারী তৈরি একাডেমিতে ঢুকুন</DialogTitle>
          <DialogDescription className="sr-only">শিখতে না শেখাতে এসেছেন বেছে নিন, তারপর ছবি মিলিয়ে ঢুকুন। যোগ দেওয়া বিনামূল্যে।</DialogDescription>
          <button type="button" onClick={onLeave} className="absolute top-4 right-4 grid size-9 place-items-center rounded-xl transition-colors hover:bg-m-card/10">
            <X className="size-5" aria-hidden />
            <span className="sr-only">বন্ধ করুন</span>
          </button>

          <div className="flex flex-col items-center pt-1 text-center">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="160px" className="h-16 w-auto sm:h-20" priority />
            <span className="mt-1 text-xs font-extrabold tracking-[0.32em] sm:text-sm">ACADEMY</span>
            <p className="mt-2 text-sm font-bold text-m-blue-deep">“সবার আমি ছাত্র”</p>
          </div>

          <div role="radiogroup" aria-label="কেন এসেছেন" className="mx-auto flex w-fit gap-1 rounded-full bg-m-card/10 p-1 ring-1 ring-m-ink/20">
            <Choice on={role === "learner"} onPick={() => setRole("learner")} Icon={GraduationCap} title="শিখতে" />
            <Choice on={role === "teacher"} onPick={() => setRole("teacher")} Icon={Presentation} title="শেখাতে" />
          </div>

          <div className="rounded-2xl bg-m-card p-4 text-m-ink">
            {account ? (
              <>
                <div className="flex items-center gap-3">
                  <AccountAvatar name={account.name} photo={account.photo} sizes="44px" className="size-11 text-base ring-2 ring-m-blue" />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{account.name}</p>
                    <p className="text-xs text-m-ink/65">{role === "learner" ? "শিক্ষার্থী হিসেবে ঢুকছেন" : "শিক্ষক হিসেবে ঢুকছেন"}</p>
                  </div>
                </div>
                {role === "learner" ? <LearnerCard /> : <TeacherCard />}
              </>
            ) : (
              <p className="text-sm">আগে কাণ্ডারী প্রোফাইলে ঢুকুন।</p>
            )}
          </div>

          <PictureCaptcha disabled={!account} hint="আগে কাণ্ডারী প্রোফাইলে ঢুকুন।" opening="একাডেমি খুলছে…" onPass={enter} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The departments this learner belongs to, or the way into the first one. */
function LearnerCard() {
  const hydrated = useHydrated();
  const admissions = useAcademy((a) => a.admissions);
  const joined = Object.entries(admissions);
  if (!hydrated) return null;

  if (joined.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm font-semibold">এখনো কোনো বিভাগে নেই — যোগ দেওয়া বিনামূল্যে</p>
        <ol className="mt-2.5 grid gap-2 sm:grid-cols-3">
          {FIRST_STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 rounded-xl bg-m-ink/4 px-3 py-2 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-m-yellow text-xs font-bold text-m-ink"><Num value={i + 1} /></span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold text-m-ink/65">আপনার বিভাগ · <Num value={joined.length} /></p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {joined.slice(0, 4).map(([dept, a]) => (
          <li key={dept} className="rounded-lg bg-m-ink/4 px-2.5 py-1.5 text-sm">
            <span className="font-semibold">{getDepartment(dept)?.name ?? dept}</span>
            <span className="text-m-blue"> · {LEVELS[a.level]}</span>
          </li>
        ))}
        {joined.length > 4 && <li className="rounded-lg bg-m-ink/4 px-2.5 py-1.5 text-sm">+<Num value={joined.length - 4} /></li>}
      </ul>
    </div>
  );
}

/** A teacher's standing, or where the way to teaching starts. */
function TeacherCard() {
  const t = useTeacher();
  if (!t.record) {
    return (
      <p className="mt-4 rounded-xl bg-m-ink/4 px-3 py-2.5 text-sm leading-relaxed">
        আপনি এখনো শিক্ষক নন। ঢুকলে আবেদনের পাতা খুলবে — নমুনা ক্লাস আর প্যানেল ইন্টারভিউয়ের পর ডেস্ক আপনার।
      </p>
    );
  }
  const { points, tier } = standingOf(t.record);
  const students = t.live.reduce((n, c) => n + c.enrolled, 0);
  return (
    <div className="mt-4 space-y-2.5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <TierBadge tier={tier} /> <Num value={points.total} /> পয়েন্ট
      </p>
      <p className="text-sm text-m-ink/80">{t.depts.map((d) => d.name).join(" · ")}</p>
      <dl className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-m-ink/4 py-2">
          <dd className="text-lg font-bold text-m-blue"><Num value={t.live.length} /></dd>
          <dt className="text-[11px] text-m-ink/65">চালু কোর্স</dt>
        </div>
        <div className="rounded-xl bg-m-ink/4 py-2">
          <dd className="text-lg font-bold text-m-blue"><Num value={students} /></dd>
          <dt className="text-[11px] text-m-ink/65">শিক্ষার্থী</dt>
        </div>
      </dl>
    </div>
  );
}

function Choice({ on, onPick, Icon, title }: { on: boolean; onPick: () => void; Icon: LucideIcon; title: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-[background-color,color,box-shadow] duration-200 motion-reduce:transition-none",
        on ? "bg-m-card text-m-blue shadow-[0_8px_18px_-10px_var(--color-text-primary)]" : "text-m-ink/80 hover:bg-m-card/10 hover:text-m-ink",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {title}
    </button>
  );
}
