"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categories, getCategory } from "@/data/media/categories";
import { jobTypeBn } from "@/data/media/jobs";
import type { Job, JobType } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { fairPayFloor, payUnitBn, type PayUnit } from "@/lib/media/fair-pay";
import { jobSchema, type JobInput } from "@/lib/media/schemas";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { JobCard } from "./job-card";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { Taka } from "../ui/numerals";

const defaults: JobInput = {
  title: "",
  org: "",
  sector: "tech",
  type: "full",
  location: "",
  remote: false,
  payMin: 0,
  payMax: 0,
  payUnit: "month",
  description: "",
  tags: "",
  studentFriendly: false,
  deadline: "",
};

/** Free job posting. Pay is mandatory and must clear the fair-pay floor. */
export function PostJobButton() {
  const [open, setOpen] = useState(false);
  const schema = useMemo(() => jobSchema((s) => getCategory(s).band), []);
  const form = useForm<JobInput>({ resolver: zodResolver(schema), defaultValues: { ...defaults, org: currentUser.nameBn } });
  const [sector, unit] = useWatch({ control: form.control, name: ["sector", "payUnit"] });
  const floor = fairPayFloor(unit, getCategory(sector).band);

  function onSubmit(v: JobInput) {
    const job: Job = {
      id: newId("j"),
      poster: currentUser.handle,
      org: v.org,
      title: v.title,
      sector: v.sector,
      type: v.type,
      location: v.location,
      remote: v.remote,
      pay: { min: v.payMin, max: v.payMax, unit: v.payUnit },
      tags: v.tags.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`)),
      description: v.description,
      requirements: [],
      postedAt: new Date().toISOString(),
      deadline: v.deadline,
      applicants: 0,
      studentFriendly: v.studentFriendly,
    };
    updateMedia((s) => ({ ...s, myJobs: [job, ...s.myJobs] }));
    setOpen(false);
    form.reset({ ...defaults, org: currentUser.nameBn });
    toast.success("কাজের পোস্ট প্রকাশিত", { description: "বিনামূল্যে — এই খাতের দক্ষ মানুষেরা দেখবেন।" });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> কাজের পোস্ট দিন
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">কাজের পোস্ট — বিনামূল্যে</DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">বেতন লেখা বাধ্যতামূলক, আর তা ন্যায্য মজুরির নিচে হতে পারবে না।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>পদের নাম</FormLabel>
                  <FormControl><Input placeholder="যেমন: খণ্ডকালীন গ্রাফিক ডিজাইনার" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="org" render={({ field }) => (
                  <FormItem>
                    <FormLabel>প্রতিষ্ঠান / আপনার নাম</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sector" render={({ field }) => (
                  <FormItem>
                    <FormLabel>খাত</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.bn}</option>)}
                      </select>
                    </FormControl>
                    <FormDescription>এই খাতের মানুষেরাই দেখবেন।</FormDescription>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(jobTypeBn) as JobType[]).map((t) => (
                      <label key={t} className={choiceClass(field.value === t)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === t} onChange={() => field.onChange(t)} />
                        {jobTypeBn[t]}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField control={form.control} name="payMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>সর্বনিম্ন বেতন (৳)</FormLabel>
                    <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="payMax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>সর্বোচ্চ (৳)</FormLabel>
                    <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="payUnit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>হিসাব</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>
                        {(Object.keys(payUnitBn) as PayUnit[]).map((u) => <option key={u} value={u}>{payUnitBn[u]}</option>)}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <p className="-mt-2 rounded-lg bg-bd-green-light/60 px-3 py-2 text-xs text-bd-green-dark">
                ন্যায্য মজুরি: {payUnitBn[unit]} অন্তত <Taka amount={floor} />
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>কোথায়</FormLabel>
                    <FormControl><Input placeholder="যেমন: মিরপুর, ঢাকা" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deadline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>আবেদনের শেষ তারিখ</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>কাজের বিবরণ</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="কী করতে হবে, কখন, কার সাথে — পরিষ্কার করে লিখুন।" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel>হ্যাশট্যাগ</FormLabel>
                  <FormControl><Input placeholder="#ডিজাইন #ঢাকা" {...field} /></FormControl>
                  <FormDescription>খাতের সঠিক মানুষের কাছে পৌঁছাতে সাহায্য করে।</FormDescription>
                </FormItem>
              )} />
              <div className="flex flex-wrap gap-6">
                <FormField control={form.control} name="remote" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>রিমোট চলবে</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="studentFriendly" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>শিক্ষার্থীরা পারবেন</FormLabel>
                  </FormItem>
                )} />
              </div>
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <BriefcaseBusiness aria-hidden /> প্রকাশ করুন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Jobs the viewer posted in this browser, above the board. */
export function MyJobs() {
  const mine = useMediaState((s) => s.myJobs);
  if (mine.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-text-primary">আপনার পোস্ট করা কাজ</h2>
      {mine.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </section>
  );
}
