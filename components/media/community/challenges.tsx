"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CircleCheck, Trophy, Upload, Users } from "lucide-react";
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

function EntryDialog({ challenge, open, onOpenChange }: { challenge: Challenge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const form = useForm<EntryInput>({ resolver: zodResolver(entrySchema), defaultValues: { summary: "", link: "", team: "" } });
  function onSubmit(v: EntryInput) {
    updateMedia((s) => ({ ...s, entries: { ...s.entries, [challenge.id]: { ...v, at: new Date().toISOString() } } }));
    onOpenChange(false);
    toast.success("জমা হয়েছে", { description: "বিচারকেরা শেষ তারিখের পর ফল জানাবেন; পুরস্কার সরাসরি ওয়ালেটে।" });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">জমা দিন — {challenge.title}</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">সমাধানের সংক্ষেপ আর কাজের লিংক (গিটহাব, ড্রাইভ, ভিডিও)।</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            {challenge.teams && (
              <FormField control={form.control} name="team" render={({ field }) => (
                <FormItem>
                  <FormLabel>টিমের নাম (ঐচ্ছিক)</FormLabel>
                  <FormControl><Input placeholder="একা হলে ফাঁকা রাখুন" {...field} /></FormControl>
                  <FormDescription>
                    টিম নেই? <Link href="/media/teams" className="font-semibold text-bd-green hover:underline">টিম খুঁজুন বা বানান</Link>
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

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [open, setOpen] = useState(false);
  const entry = useMediaState((s) => s.entries[challenge.id]);
  const by = getPerson(challenge.by);
  return (
    <article className="flex flex-col rounded-2xl border border-card-border bg-white p-4 transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgb(15_23_42/0.18)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-bd-green">{challengeKindBn[challenge.kind]} · {getCategory(challenge.category).bn}</p>
          <h3 className="mt-0.5 text-base font-bold text-text-primary">{challenge.title}</h3>
          <p className="text-sm text-text-secondary">
            {challenge.host}
            {by && (
              <>
                {" · "}
                <Link href={`/media/u/${by.handle}`} className="hover:text-bd-green hover:underline">{by.nameBn}</Link>
              </>
            )}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-orange-50 px-3 py-2 text-center ring-1 ring-orange-200">
          <Trophy className="mx-auto size-4.5 text-orange-800" aria-hidden />
          <p className="text-sm font-bold text-text-primary"><Taka amount={challenge.prize} /></p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-text-primary">{challenge.description}</p>
      <p className="mt-3 flex flex-wrap gap-x-2 text-xs font-medium text-bd-green">{challenge.tags.map((t) => <span key={t}>{t}</span>)}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden /><DateText iso={challenge.deadline} /> পর্যন্ত</span>
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={challenge.entries + (entry ? 1 : 0)} /> জমা{challenge.teams ? " · টিমে চলবে" : ""}</span>
        </p>
        {entry ? (
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-bd-green-light px-3 text-sm font-semibold text-bd-green-dark">
            <CircleCheck className="size-4" aria-hidden /> জমা দিয়েছেন
          </span>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary", size: "sm" })}>
            <Upload aria-hidden /> অংশ নিন
          </button>
        )}
      </div>
      {!entry && <EntryDialog challenge={challenge} open={open} onOpenChange={setOpen} />}
    </article>
  );
}
