"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, FileText, MapPin, PenLine, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categories, getCategory } from "@/data/media/categories";
import { jobTypeBn } from "@/data/media/jobs";
import type { Person } from "@/data/media/types";
import { CURRENT_USER_HANDLE, currentUser, people } from "@/data/media/users";
import { PAY_FLOOR, payUnitBn, type PayUnit } from "@/lib/media/fair-pay";
import { seekingIssues, type Seeking, type WorkType } from "@/lib/media/hiring";
import { skillStatus } from "@/lib/media/skill";
import { updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { toneStyle } from "../academy/catalogue/tones";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { IdSeal } from "../ui/trust";
import { InviteButton } from "./invite";

const hud = "font-mono text-[11px] font-bold tracking-wide uppercase";
const card = "tone story-reveal relative flex h-full flex-col overflow-hidden rounded-2xl border border-m-ink/10 bg-m-card transition-colors duration-300 hover:border-(--c-app)/60";
const select = "h-10 w-full rounded-lg border border-m-ink/15 bg-m-canvas px-3 text-sm text-m-ink";

const verified = (p: Person) => p.skills.filter((s) => skillStatus(s.self, s.communityAvg, s.raters) === "verified");
const toneOf = (p: Person) =>
  toneStyle(
    Math.max(
      0,
      categories.findIndex((c) => c.id === p.categories[0]),
    ),
  );
const today = () => new Date().toISOString().slice(0, 10);

/** The viewer's "আমি কাজ চাই" card: what work, what pay, from when, and whether recruiters see it. */
function SeekingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const saved = useMediaState((s) => s.seeking);
  const [draft, setDraft] = useState<Seeking>(
    () =>
      saved ?? {
        role: currentUser.headline.split("·")[0].trim(),
        type: "full",
        pay: currentUser.rate?.amount ?? PAY_FLOOR.month,
        unit: "month",
        from: today(),
        note: "",
        open: true,
        at: "",
      },
  );
  const [issues, setIssues] = useState<string[]>([]);
  const set = (patch: Partial<Seeking>) => setDraft((d) => ({ ...d, ...patch }));

  function save() {
    const floor = draft.unit === "task" ? 0 : PAY_FLOOR[draft.unit];
    const problems = [...seekingIssues(draft), ...(draft.pay < floor ? [`${payUnitBn[draft.unit]} অন্তত ৳${floor.toLocaleString("bn-BD")} — এর নিচে ন্যায্য নয়`] : [])];
    setIssues(problems);
    if (problems.length > 0) return;
    updateMedia((s) => ({ ...s, seeking: { ...draft, role: draft.role.trim(), note: draft.note.trim(), at: new Date().toISOString() } }));
    onOpenChange(false);
    toast.success(draft.open ? "আপনার কার্ড নিয়োগকর্তারা দেখছেন" : "কার্ড রাখা হলো — এখন শুধু আপনি দেখছেন");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl bg-m-card font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-m-ink">আমি কাজ চাই</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/75">সব নিয়োগকর্তা আর প্রতিষ্ঠান এই কার্ড দেখবেন, সাথে আপনার প্রোফাইল, যাচাইকৃত দক্ষতা আর CV।</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-m-ink">কোন কাজ চান</span>
            <Input value={draft.role} onChange={(e) => set({ role: e.target.value })} name="role" placeholder="যেমন: আইওটি হার্ডওয়্যার ইঞ্জিনিয়ার…" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-m-ink">ধরন</span>
              <select value={draft.type} onChange={(e) => set({ type: e.target.value as WorkType })} className={select}>
                {(Object.keys(jobTypeBn) as WorkType[]).map((t) => (
                  <option key={t} value={t}>
                    {jobTypeBn[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-m-ink">কবে থেকে</span>
              <Input type="date" value={draft.from} min={today()} onChange={(e) => set({ from: e.target.value })} name="from" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-m-ink">প্রত্যাশিত মজুরি (৳)</span>
              <Input type="number" inputMode="numeric" min={0} value={draft.pay || ""} onChange={(e) => set({ pay: Number(e.target.value) })} name="pay" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-m-ink">হিসাব</span>
              <select value={draft.unit} onChange={(e) => set({ unit: e.target.value as PayUnit })} className={select}>
                {(Object.keys(payUnitBn) as PayUnit[]).map((u) => (
                  <option key={u} value={u}>
                    {payUnitBn[u]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-m-ink">নিজের কথা (ঐচ্ছিক)</span>
            <Textarea rows={3} maxLength={280} value={draft.note} onChange={(e) => set({ note: e.target.value })} name="note" placeholder="কী ধরনের দলে কাজ করতে চান, কোথায়…" />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-m-ink/10 p-3">
            <span>
              <span className="block text-sm font-semibold text-m-ink">নিয়োগকর্তারা দেখবেন</span>
              <span className="block text-xs text-m-ink/60">বন্ধ রাখলে কার্ড থাকবে, শুধু আপনি দেখবেন।</span>
            </span>
            <Switch checked={draft.open} onCheckedChange={(open) => set({ open })} />
          </label>
          {issues.length > 0 && (
            <ul role="alert" className="space-y-1 text-xs font-semibold text-m-red">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            কার্ড রাখুন
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** "আমি কাজ চাই" — opens the viewer's card editor; the label follows whether they have one. */
export function SeekingButton({ className }: { className?: string }) {
  const ensure = useRequireAccount();
  const [open, setOpen] = useState(false);
  const has = useMediaState((s) => Boolean(s.seeking));
  return (
    <>
      <button type="button" onClick={() => ensure("কাজ চাইতে") && setOpen(true)} className={className ?? mediaButton({ variant: "quiet", size: "lg" })}>
        {has ? <PenLine aria-hidden /> : <Plus aria-hidden />} {has ? "আমার কার্ড বদলান" : "আমি কাজ চাই"}
      </button>
      {open && <SeekingDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

/** The viewer's own card at the head of the list, or the invitation to make one. */
function OwnCard() {
  const hydrated = useHydrated();
  const seeking = useMediaState((s) => s.seeking);
  if (!hydrated) return <div className="h-full min-h-72 animate-pulse rounded-2xl bg-m-ink/6" />;
  if (!seeking)
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-m-ink/15 p-6 text-center">
        <Sparkles className="size-7 text-m-yellow" aria-hidden />
        <p className="text-base font-bold text-m-ink">কাজ খুঁজছেন?</p>
        <p className="text-sm text-m-ink/65">একটা কার্ড রাখুন — নিয়োগকর্তারা আপনাকে সরাসরি ইন্টারভিউয়ে ডাকবেন।</p>
        <SeekingButton className={mediaButton({ variant: "primary" })} />
      </div>
    );
  return (
    <article style={toneOf(currentUser)} className={cn(card, "ring-1 ring-m-yellow/50")}>
      <span aria-hidden className="tone-bar" />
      <div className="flex items-center justify-between gap-2 border-b border-m-ink/10 px-4 py-2.5">
        <span className={cn(hud, "text-m-yellow")}>আপনার কার্ড</span>
        <span className={cn(hud, seeking.open ? "text-m-green" : "text-m-ink/50")}>{seeking.open ? "সবাই দেখছেন" : "শুধু আপনি"}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg leading-snug font-bold text-m-ink">{seeking.role}</p>
        <p className="mt-1 text-sm text-m-ink/70">
          {jobTypeBn[seeking.type]} · <Taka amount={seeking.pay} /> {payUnitBn[seeking.unit]}
        </p>
        <p className="mt-1 text-sm text-m-ink/70">
          শুরু করতে পারবেন <DateText iso={seeking.from} />
        </p>
        {seeking.note && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-m-ink/85">{seeking.note}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <SeekingButton className={mediaButton({ variant: "quiet", size: "sm" })} />
          <Link href="/media/me/cv" className={mediaButton({ variant: "ghost", size: "sm" })}>
            <FileText aria-hidden /> CV
          </Link>
        </div>
      </div>
    </article>
  );
}

function SeekerCard({ person }: { person: Person }) {
  const top = verified(person);
  const skills = [...top, ...person.skills.filter((s) => !top.includes(s))].slice(0, 3);
  return (
    <article style={toneOf(person)} className={card}>
      <span aria-hidden className="tone-bar" />
      <div className="flex items-center justify-between gap-2 border-b border-m-ink/10 px-4 py-2.5">
        <span className={cn(hud, "inline-flex items-center gap-1.5 text-m-green")}>
          <span aria-hidden className="size-1.5 rounded-full bg-m-green" /> কাজ চাই
        </span>
        <span className={cn(hud, "truncate text-m-ink/50")}>{getCategory(person.categories[0]).bn}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3">
          <PersonAvatar person={person} size="lg" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-base font-bold text-m-ink">
              <Link href={`/media/u/${person.handle}`} className="truncate hover:underline">
                {person.nameBn}
              </Link>
              {person.idVerified && <IdSeal size={16} />}
            </p>
            <p className="flex items-center gap-1 text-xs text-m-ink/60">
              <MapPin className="size-3" aria-hidden /> {person.district}
            </p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-semibold text-m-ink/85">{person.headline}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="দক্ষতা">
          {skills.map((s) => (
            <li key={s.skill} className="inline-flex items-center gap-1 rounded-full border border-m-ink/12 px-2.5 py-0.5 text-xs font-semibold text-m-ink/85">
              {top.includes(s) && <CircleCheck className="size-3 text-(--c-app-ink)" aria-label="যাচাইকৃত" />}
              {s.skill}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-m-ink/60">
          {person.rate ? (
            <>
              প্রত্যাশা <Taka amount={person.rate.amount} /> {person.rate.unit}
            </>
          ) : (
            "মজুরি আলোচনাসাপেক্ষ"
          )}{" "}
          · <Num value={person.jobsDone} />
          টি কাজ সম্পন্ন
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <InviteButton target={{ to: person.handle, toName: person.nameBn, kind: "seeker" }} />
          <Link href={`/media/u/${person.handle}`} className={mediaButton({ variant: "quiet", size: "sm" })}>
            প্রোফাইল
          </Link>
          <Link href={`/media/u/${person.handle}/cv`} className={mediaButton({ variant: "ghost", size: "sm" })}>
            <FileText aria-hidden /> CV
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * "কাজ চাই" — everyone open to work, in the open for every recruiter: the
 * viewer's own card first, then members with the most verified skills.
 */
export function Seekers({ limit = 5 }: { limit?: number }) {
  const shown = people
    .filter((p) => p.openToWork && p.handle !== CURRENT_USER_HANDLE)
    .sort((a, b) => verified(b).length - verified(a).length || b.jobsDone - a.jobsDone)
    .slice(0, limit);
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li>
        <OwnCard />
      </li>
      {shown.map((p) => (
        <li key={p.handle}>
          <SeekerCard person={p} />
        </li>
      ))}
    </ul>
  );
}
