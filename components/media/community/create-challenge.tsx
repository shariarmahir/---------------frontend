"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/data/media/categories";
import { challengeKindBn } from "@/data/media/challenges";
import type { Challenge, ChallengeKind } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { challengeSchema, type ChallengeInput } from "@/lib/media/schemas";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { ChallengeCard } from "./challenges";

const defaults: ChallengeInput = {
  kind: "code",
  title: "",
  host: "নিজে",
  category: currentUser.categories[0] ?? "tech",
  prize: 0,
  deadline: "",
  teams: true,
  description: "",
  judging: "",
  tags: "",
};

/** Hints per kind, so the brief asks for what that kind of challenge needs. */
const KIND_HINT: Record<ChallengeKind, { description: string; judging: string }> = {
  code: { description: "কোন সমস্যা, কী ইনপুট-আউটপুট, কোন ভাষা বা ফ্রেমওয়ার্ক চলবে, কী জমা দিতে হবে (গিটহাব লিংক)।", judging: "নির্ভুলতা ৫০%, গতি ২০%, কোডের মান ৩০%" },
  design: { description: "কার জন্য ডিজাইন, কী কী স্ক্রিন বা ফাইল, ব্র্যান্ডের রং-নিয়ম, কোন ফরম্যাটে জমা।", judging: "সমস্যার সমাধান ৪০%, সৌন্দর্য ৩০%, ব্যবহারযোগ্যতা ৩০%" },
  research: { description: "গবেষণার প্রশ্ন, কোন ডেটা ব্যবহার করা যাবে, রিপোর্টের দৈর্ঘ্য, উৎস উল্লেখের নিয়ম।", judging: "পদ্ধতি ৪০%, তথ্যের মান ৩০%, উপস্থাপন ৩০%" },
  assignment: { description: "ঠিক কোন কাজ, কতটুকু, কোন ফরম্যাটে, কবের মধ্যে। পেইড কাজ — বিজয়ীর কাজ আপনার হবে।", judging: "নির্দেশনা মানা ও মান — যে কাজ আগে ঠিকঠাক জমা পড়বে" },
  lab: { description: "কোন হার্ডওয়্যার সমস্যা, বাজেটের সীমা, কী প্রোটোটাইপ বা ভিডিও জমা দিতে হবে, নিরাপত্তার নিয়ম।", judging: "কাজ করে কি না ৫০%, খরচ ২৫%, টেকসই নকশা ২৫%" },
};

/** Opens the form to post a challenge; the prize is held in escrow until judging. */
export function CreateChallengeButton() {
  const ensure = useRequireAccount();
  const [open, setOpen] = useState(false);
  const form = useForm<ChallengeInput>({ resolver: zodResolver(challengeSchema), defaultValues: defaults });
  const kind = useWatch({ control: form.control, name: "kind" });

  function onSubmit(v: ChallengeInput) {
    const challenge: Challenge = {
      id: newId("ch"),
      kind: v.kind,
      title: v.title,
      host: v.host,
      by: currentUser.handle,
      category: v.category,
      prize: v.prize,
      deadline: v.deadline,
      teams: v.teams,
      entries: 0,
      description: v.description,
      judging: v.judging,
      tags: v.tags.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`)),
    };
    if (!updateMedia((s) => ({ ...s, myChallenges: [challenge, ...s.myChallenges] }))) {
      toast.error("এই ব্রাউজারে সেভ করা গেল না");
      return;
    }
    setOpen(false);
    form.reset(defaults);
    toast.success("চ্যালেঞ্জ প্রকাশিত", { description: v.prize > 0 ? "পুরস্কারের টাকা বিচার পর্যন্ত এসক্রোতে থাকবে (ডেমো: টাকা কাটা হয়নি)।" : "শুধু সনদের চ্যালেঞ্জ — বিজয়ী প্রোফাইলে সনদ পাবেন।" });
  }

  return (
    <>
      <button type="button" onClick={() => ensure("চ্যালেঞ্জ দিতে") && setOpen(true)} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> চ্যালেঞ্জ তৈরি করুন
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">চ্যালেঞ্জ তৈরি করুন</DialogTitle>
            <DialogDescription>একটা বাস্তব সমস্যা দিন, কীভাবে বিচার হবে বলুন — সমাধান আসবে একা বা টিমে।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="kind" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(challengeKindBn) as ChallengeKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input type="radio" className="sr-only" checked={field.value === k} onChange={() => field.onChange(k)} />
                        {challengeKindBn[k]}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>চ্যালেঞ্জের নাম</FormLabel>
                  <FormControl><Input maxLength={80} placeholder="৳১,০০০-এর নিচে বন্যার আগাম সতর্কসংকেত" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="host" render={({ field }) => (
                  <FormItem>
                    <FormLabel>আয়োজক</FormLabel>
                    <FormControl><Input maxLength={60} {...field} /></FormControl>
                    <FormDescription>প্রতিষ্ঠান, ল্যাব বা ক্লাব — নিজে হলে “নিজে”।</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিভাগ</FormLabel>
                    <FormControl>
                      <select className={selectClass} {...field}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.bn}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>সমস্যা ও কী জমা দিতে হবে</FormLabel>
                  <FormControl><Textarea rows={4} maxLength={800} {...field} /></FormControl>
                  <FormDescription>{KIND_HINT[kind].description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="judging" render={({ field }) => (
                <FormItem>
                  <FormLabel>কীভাবে বিচার হবে</FormLabel>
                  <FormControl><Input maxLength={200} placeholder={KIND_HINT[kind].judging} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="prize" render={({ field }) => (
                  <FormItem>
                    <FormLabel>পুরস্কার (৳)</FormLabel>
                    <FormControl><Input type="number" inputMode="numeric" min={0} value={Number.isNaN(field.value) ? "" : field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
                    <FormDescription>শুধু সনদ হলে ০। টাকা বিচার পর্যন্ত এসক্রোতে থাকে।</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deadline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>জমার শেষ তারিখ</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="teams" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <FormLabel className="m-0">টিমে অংশ নেওয়া যাবে</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel>ট্যাগ</FormLabel>
                  <FormControl><Input placeholder="#আইওটি #বন্যা" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <Trophy aria-hidden /> চ্যালেঞ্জ প্রকাশ করুন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The viewer's own challenges, shown first (filtered by the page's kind). */
export function MyChallenges({ kind }: { kind?: ChallengeKind }) {
  const mine = useMediaState((s) => s.myChallenges).filter((c) => !kind || c.kind === kind);
  if (mine.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-white">আপনার চ্যালেঞ্জ</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((c) => <ChallengeCard key={c.id} challenge={c} mine />)}
      </div>
    </section>
  );
}
