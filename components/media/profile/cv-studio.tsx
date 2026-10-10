"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowLeft, Plus, Printer, X } from "lucide-react";
import { getPerson } from "@/data/media/users";
import type { Person } from "@/data/media/types";
import { useAuth } from "@/lib/auth/client";
import { buildCv, type CvDetails, type CvEntry, type CvFormat } from "@/lib/media/cv";
import { personFromProfile } from "@/lib/media/my-person";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { CvFormatCards } from "./cv-panel";
import { CvSheet } from "./cv-sheets";
import { glass } from "./glass";
import { ResumeUpload } from "./resume-upload";
import { useAcademySteps } from "./use-academy-steps";

const field = "w-full rounded-xl border border-m-ink/12 bg-m-canvas px-3 py-2 text-sm text-m-ink placeholder:text-m-ink/45 focus-visible:border-m-blue focus-visible:outline-none";
const origin = () => location.origin;

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-m-ink/70">{text}</span>
      {children}
    </label>
  );
}

/** A list of lines the person adds to — education, experience — each with a title, place, period and a note. */
function Entries({ title, items, onChange }: { title: string; items: CvEntry[]; onChange: (next: CvEntry[]) => void }) {
  const edit = (id: string, patch: Partial<CvEntry>) => onChange(items.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-bold text-m-ink">{title}</legend>
      {items.map((e) => (
        <div key={e.id} className="space-y-2 rounded-2xl border border-m-ink/10 bg-m-ink/4 p-3">
          <div className="flex gap-2">
            <input value={e.title} onChange={(ev) => edit(e.id, { title: ev.target.value })} placeholder="পদ বা ডিগ্রি" aria-label="পদ বা ডিগ্রি" className={field} />
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x.id !== e.id))}
              aria-label="সরান"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-m-ink/50 hover:bg-m-ink/8 hover:text-m-red"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={e.place} onChange={(ev) => edit(e.id, { place: ev.target.value })} placeholder="প্রতিষ্ঠান" aria-label="প্রতিষ্ঠান" className={field} />
            <input value={e.period} onChange={(ev) => edit(e.id, { period: ev.target.value })} placeholder="সময় (২০২২–২০২৫)" aria-label="সময়" className={field} />
          </div>
          <textarea
            value={e.note}
            onChange={(ev) => edit(e.id, { note: ev.target.value })}
            rows={2}
            placeholder="এক-দুই লাইনে কী করেছেন"
            aria-label="বিবরণ"
            className={`${field} resize-none`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { id: newId("cv"), title: "", place: "", period: "", note: "" }])}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-m-ink/25 px-3 text-sm font-semibold text-m-ink/80 hover:border-m-blue hover:text-m-ink"
      >
        <Plus className="size-4" aria-hidden /> যোগ করুন
      </button>
    </fieldset>
  );
}

/**
 * The CV page. The viewer's own: a form on the left and the CV, live, on the
 * right; the academy's finished courses are already in it. Anyone else's:
 * their CV as their profile shows it. Print or save as PDF, in any of the
 * three layouts.
 */
export function CvStudio({ person: given, self, format, base }: { person?: Person; self: boolean; format: CvFormat; base: string }) {
  const { account } = useAuth();
  const details = useMediaState((s) => s.cv);
  const profile = useMediaState((s) => s.profile);
  const steps = useAcademySteps();
  const site = useSyncExternalStore(
    () => () => {},
    origin,
    () => "",
  );

  const person = given ?? (account?.mediaHandle ? getPerson(account.mediaHandle) : undefined) ?? (profile ? personFromProfile(profile) : undefined);
  const set = (patch: Partial<CvDetails>) => updateMedia((s) => ({ ...s, cv: { ...s.cv, ...patch } }));

  // Their own contact fills in until they write something else.
  const shown: CvDetails = self
    ? { ...details, phone: details.phone || account?.phone || "", email: details.email || account?.email || "" }
    : { ...details, phone: "", email: "", summary: "", education: [], experience: [], languages: "" };
  const cv = useMemo(
    () => (person ? buildCv(person, shown, self ? steps.filter((c) => c.done) : [], `${site}/media/u/${person.handle}`) : null),
    // `shown` is rebuilt each render from these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [person, details, account?.phone, account?.email, steps, self, site],
  );

  if (!person || !cv) {
    return (
      <EmptyState
        icon="profile"
        title="CV বানাতে আগে প্রোফাইল দরকার"
        body="প্রোফাইল খুললে আপনার নাম, দক্ষতা আর একাডেমির কোর্স থেকে CV নিজে থেকেই তৈরি হবে।"
        action={
          <Link href="/media/onboarding" className={mediaButton({ variant: "primary" })}>
            প্রোফাইল খুলুন
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={self ? "/media/me" : `/media/u/${person.handle}`} className={mediaButton({ variant: "ghost" })}>
          <ArrowLeft aria-hidden /> প্রোফাইল
        </Link>
        <button type="button" onClick={() => window.print()} className={mediaButton({ variant: "primary" })}>
          <Printer aria-hidden /> প্রিন্ট / PDF নামান
        </button>
      </div>

      <div className={self ? "grid items-start gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]" : ""}>
        {self && (
          <aside className={`${glass} space-y-6 p-5 print:hidden lg:sticky lg:top-22`}>
            <div>
              <h1 className="text-lg font-bold text-m-ink">আপনার CV</h1>
              <p className="mt-1 text-xs leading-relaxed text-m-ink/65">
                নাম, দক্ষতা, কাজের ইতিহাস আর একাডেমির শেষ করা কোর্স প্রোফাইল থেকেই এসেছে। বাকিটুকু এখানে লিখুন — ডানে CV সাথে সাথে বদলাবে।
              </p>
            </div>
            <CvFormatCards base={base} current={format} />
            <Label text="ফোন">
              <input value={shown.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" className={field} />
            </Label>
            <Label text="ইমেইল">
              <input value={shown.email} onChange={(e) => set({ email: e.target.value })} inputMode="email" className={field} />
            </Label>
            <Label text="নিজের কথা (খালি রাখলে প্রোফাইলের বিবরণ যাবে)">
              <textarea value={details.summary} onChange={(e) => set({ summary: e.target.value })} rows={4} maxLength={600} className={`${field} resize-none leading-relaxed`} />
            </Label>
            <Entries title="কাজের অভিজ্ঞতা" items={details.experience} onChange={(experience) => set({ experience })} />
            <Entries title="শিক্ষা" items={details.education} onChange={(education) => set({ education })} />
            <Label text="ভাষা (কমা দিয়ে)">
              <input value={details.languages} onChange={(e) => set({ languages: e.target.value })} placeholder="বাংলা, English" className={field} />
            </Label>
            <div className="space-y-2">
              <p className="text-sm font-bold text-m-ink">সাম্প্রতিক রেজুমে</p>
              <ResumeUpload />
            </div>
          </aside>
        )}

        <div className="min-w-0 space-y-4">
          {!self && (
            <div className="print:hidden">
              <CvFormatCards base={base} current={format} />
            </div>
          )}
          <CvSheet format={format} cv={cv} />
        </div>
      </div>
    </div>
  );
}
