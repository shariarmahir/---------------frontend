"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CircleCheck, Scale, Trophy, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCategory } from "@/data/media/categories";
import { challengeKindBn } from "@/data/media/challenges";
import type { Challenge } from "@/data/media/types";
import { getPerson } from "@/data/media/users";
import { entrySchema, type EntryInput } from "@/lib/media/schemas";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, Taka } from "../ui/numerals";
import { useRequireAccount } from "@/components/auth/use-require-account";

function EntryDialog({ challenge, open, onOpenChange }: { challenge: Challenge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const form = useForm<EntryInput>({ resolver: zodResolver(entrySchema), defaultValues: { summary: "", link: "", team: "" } });
  function onSubmit(v: EntryInput) {
    updateMedia((s) => ({ ...s, entries: { ...s.entries, [challenge.id]: { ...v, at: new Date().toISOString() } } }));
    onOpenChange(false);
    toast.success("জমা হয়েছে", { description: "বিচারকেরা শেষ তারিখের পর ফল জানাবেন; পুরস্কার সরাসরি ওয়ালেটে।" });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-m-card font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-m-ink">জমা দিন — {challenge.title}</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/80">সমাধানের সংক্ষেপ আর কাজের লিংক (গিটহাব, ড্রাইভ, ভিডিও)।</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            {challenge.teams && (
              <FormField control={form.control} name="team" render={({ field }) => (
                <FormItem>
                  <FormLabel>টিমের নাম (ঐচ্ছিক)</FormLabel>
                  <FormControl><Input placeholder="একা হলে ফাঁকা রাখুন" {...field} /></FormControl>
                  <FormDescription>
                    টিম নেই? <Link href="/media/together?v=teams" className="font-semibold text-m-blue hover:underline">টিম খুঁজুন বা বানান</Link>
                  </FormDescription>
                </FormItem>
              )} />
            )}
            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem>
                <FormLabel>সমাধানের সংক্ষেপ</FormLabel>
                <FormControl><Textarea rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem>
                <FormLabel>লিংক</FormLabel>
                <FormControl><Input type="url" inputMode="url" placeholder="https://" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
              <Upload aria-hidden /> জমা দিন
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ChallengeCard({ challenge, mine }: { challenge: Challenge; mine?: boolean }) {
  const ensure = useRequireAccount();
  const [open, setOpen] = useState(false);
  const entry = useMediaState((s) => s.entries[challenge.id]);
  const by = getPerson(challenge.by);
  return (
    <article id={challenge.id} className="flex scroll-mt-24 flex-col rounded-2xl border border-m-ink/10 bg-m-card p-4 story-reveal target:ring-2 target:ring-m-blue transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-m-ink/21 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5 shadow-m-tile">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-m-blue">{challengeKindBn[challenge.kind]} · {getCategory(challenge.category).bn}</p>
          <h3 className="mt-0.5 text-base font-bold text-m-ink">{challenge.title}</h3>
          <p className="text-sm text-m-ink/80">
            {challenge.host}
            {by && (
              <>
                {" · "}
                <Link href={`/media/u/${by.handle}`} className="hover:text-m-blue hover:underline">{by.nameBn}</Link>
              </>
            )}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-m-red-soft px-3 py-2 text-center ring-1 ring-m-red/60">
          <Trophy className="mx-auto size-4.5 text-m-ink" aria-hidden />
          <p className="text-sm font-bold text-m-ink"><Taka amount={challenge.prize} /></p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-m-ink">{challenge.description}</p>
      {challenge.judging && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-m-ink/75"><Scale className="mt-0.5 size-3.5 shrink-0 text-m-blue" aria-hidden /><span><span className="font-semibold text-m-ink">বিচার:</span> {challenge.judging}</span></p>
      )}
      <p className="mt-3 flex flex-wrap gap-x-2 text-xs font-medium text-m-blue">{challenge.tags.map((t) => <span key={t}>{t}</span>)}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-m-ink/10 pt-3">
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-m-ink/65">
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden /><DateText iso={challenge.deadline} /> পর্যন্ত</span>
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={challenge.entries + (entry ? 1 : 0)} /> জমা{challenge.teams ? " · টিমে চলবে" : ""}</span>
        </p>
        {mine ? (
          <span className="inline-flex min-h-9 items-center rounded-xl bg-m-blue-soft px-3 text-sm font-semibold text-m-ink">আপনার চ্যালেঞ্জ</span>
        ) : entry ? (
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-m-ink/6 px-3 text-sm font-semibold text-m-blue">
            <CircleCheck className="size-4" aria-hidden /> জমা দিয়েছেন
          </span>
        ) : (
          <button type="button" onClick={() => ensure("চ্যালেঞ্জে অংশ নিতে") && setOpen(true)} className={mediaButton({ variant: "primary", size: "sm" })}>
            <Upload aria-hidden /> অংশ নিন
          </button>
        )}
      </div>
      {!entry && !mine && <EntryDialog challenge={challenge} open={open} onOpenChange={setOpen} />}
    </article>
  );
}
