"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { CircleAlert, EyeOff, Lightbulb, MapPin, Megaphone, Phone, Plus, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { civicKindBn, civicStatusBn, CONFIRM_THRESHOLD } from "@/data/media/civic";
import { districts } from "@/data/media/districts";
import type { CivicKind, CivicReport } from "@/data/media/types";
import { CURRENT_USER_HANDLE, currentUser, getPerson } from "@/data/media/users";
import { civicSchema, solutionSchema, type CivicInput, type SolutionInput } from "@/lib/media/schemas";
import { newId, toggleKey, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { MediaFrame } from "../ui/media-frame";
import { Ago, Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

const severityInfo = {
  high: { bn: "গুরুতর", className: "bg-red-50 text-national-crimson ring-1 ring-red-200" },
  medium: { bn: "মাঝারি", className: "bg-amber-50 text-amber-900 ring-1 ring-amber-200" },
  low: { bn: "সাধারণ", className: "bg-slate-100 text-slate-700" },
} as const;

const EMPTY: CivicReport["solutions"] = [];

function SolutionForm({ reportId }: { reportId: string }) {
  const form = useForm<SolutionInput>({ resolver: zodResolver(solutionSchema), defaultValues: { text: "" } });
  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((v) => {
          const s = { id: newId("s"), by: CURRENT_USER_HANDLE, text: v.text, votes: 0 };
          updateMedia((st) => ({ ...st, mySolutions: { ...st.mySolutions, [reportId]: [...(st.mySolutions[reportId] ?? []), s] } }));
          form.reset();
          toast.success("সমাধান যোগ হলো");
        })}
        className="flex items-start gap-2"
      >
        <FormField control={form.control} name="text" render={({ field }) => (
          <FormItem className="flex-1 gap-1">
            <FormControl><Input placeholder="কীভাবে সমাধান হতে পারে? নির্দিষ্ট করে লিখুন" className="h-10" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <button type="submit" className={mediaButton({ variant: "quiet", size: "sm", className: "h-10" })}>
          <Lightbulb aria-hidden /> যোগ করুন
        </button>
      </form>
    </Form>
  );
}

export function CivicCard({ report, live }: { report: CivicReport; live?: boolean }) {
  const confirmed = useMediaState((s) => Boolean(s.confirmedReports[report.id]));
  const mine = useMediaState((s) => s.mySolutions[report.id] ?? EMPTY);
  const votes = useMediaState((s) => s.solutionVotes);
  const [showSolve, setShowSolve] = useState(false);
  const own = report.by === CURRENT_USER_HANDLE || live;
  const count = report.confirmations + (confirmed ? 1 : 0);
  const verified = count >= CONFIRM_THRESHOLD;
  const author = report.by ? getPerson(report.by) : undefined;
  const sev = severityInfo[report.severity];
  const solutions = [...report.solutions, ...mine].map((s) => ({ ...s, votes: s.votes + (votes[`${report.id}:${s.id}`] ? 1 : 0) })).sort((a, b) => b.votes - a.votes);
  const urgent = report.kind === "crime" || report.kind === "extortion" || report.kind === "harassment";

  return (
    <article id={report.id} className="scroll-mt-24 rounded-2xl border border-card-border bg-white p-4 target:ring-2 target:ring-bd-green sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-bd-green-light px-2 py-0.5 font-bold text-bd-green-dark">{civicKindBn[report.kind]}</span>
        <span className={cn("rounded-full px-2 py-0.5 font-bold", sev.className)}>{sev.bn}</span>
        <span className={cn("rounded-full px-2 py-0.5 font-semibold", report.status === "solved" ? "bg-bd-green text-white" : "bg-slate-100 text-slate-700")}>
          {verified && report.status === "reported" ? civicStatusBn.confirmed : civicStatusBn[report.status]}
        </span>
      </div>
      <h3 className="mt-2 text-base font-bold text-text-primary">{report.title}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{report.area}, {report.district}</span>
        <Ago iso={report.at} live={live} />
        {author ? (
          <Link href={`/media/u/${author.handle}`} className="inline-flex items-center gap-1 hover:text-bd-green"><PersonAvatar person={author} size="xs" />{author.nameBn}</Link>
        ) : (
          <span className="inline-flex items-center gap-1"><EyeOff className="size-3.5" aria-hidden />নাম গোপন · পরিচয়-যাচাইকৃত সদস্য</span>
        )}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-primary">{report.description}</p>
      {report.media && <MediaFrame slot={report.media} className="mt-3" sizes="(min-width: 1024px) 600px, 100vw" />}

      {!verified && (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          এখনো যাচাই চলছে — এলাকার আরও <Num value={CONFIRM_THRESHOLD - count} /> জন নিশ্চিত না করা পর্যন্ত শেয়ার করার আগে ভাবুন।
        </p>
      )}
      {urgent && report.status !== "solved" && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-national-crimson">
          <Phone className="size-4 shrink-0" aria-hidden /> বিপদে থাকলে এখনই ৯৯৯-এ কল করুন। এখানকার রিপোর্ট পুলিশের বিকল্প নয়।
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-card-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
          {verified && <SealCheck size={18} weight="duotone" className="text-bd-green" aria-hidden />}
          <Num value={count} /> জন নিশ্চিত করেছেন
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowSolve((v) => !v)} className={mediaButton({ variant: "ghost", size: "sm" })} aria-expanded={showSolve}>
            <Lightbulb aria-hidden /> সমাধান (<Num value={solutions.length} />)
          </button>
          {!own && (
            <button
              type="button"
              aria-pressed={confirmed}
              onClick={() => toggleKey("confirmedReports", report.id)}
              className={mediaButton({ variant: confirmed ? "outline" : "green", size: "sm" })}
            >
              <ThumbsUp aria-hidden /> {confirmed ? "নিশ্চিত করেছেন" : "আমিও দেখেছি"}
            </button>
          )}
        </div>
      </div>

      {showSolve && (
        <div className="fade-in mt-3 space-y-3">
          {solutions.length === 0 && <p className="text-sm text-text-muted">এখনো কেউ সমাধান দেননি — প্রথমটি আপনিই দিন।</p>}
          <ul className="space-y-2">
            {solutions.map((s) => {
              const p = getPerson(s.by);
              const key = `${report.id}:${s.id}`;
              const voted = Boolean(votes[key]);
              return (
                <li key={s.id} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <button
                    type="button"
                    aria-pressed={voted}
                    onClick={() => toggleKey("solutionVotes", key)}
                    className={cn("flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg border text-xs font-bold transition-colors", voted ? "border-bd-green bg-bd-green-light text-bd-green-dark" : "border-card-border bg-white text-text-secondary hover:border-bd-green/40")}
                  >
                    <ThumbsUp className="size-3.5" aria-hidden />
                    <Num value={s.votes} />
                    <span className="sr-only">ভালো সমাধান</span>
                  </button>
                  <div className="min-w-0 text-sm">
                    <p className="text-text-primary">{s.text}</p>
                    {p && <p className="mt-1 text-xs text-text-muted">{p.nameBn}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          <SolutionForm reportId={report.id} />
        </div>
      )}
    </article>
  );
}

export function ReportButton({ defaultKind }: { defaultKind?: CivicKind }) {
  const [open, setOpen] = useState(false);
  const anonymousDefault = useMediaState((s) => s.privacy.anonymousReports);
  const defaults: CivicInput = { kind: defaultKind ?? "sanitation", title: "", area: currentUser.area, district: currentUser.district, description: "", severity: "medium", anonymous: anonymousDefault };
  const form = useForm<CivicInput>({ resolver: zodResolver(civicSchema), defaultValues: defaults });

  function onSubmit(v: CivicInput) {
    const r: CivicReport = { id: newId("cv"), kind: v.kind, title: v.title, area: v.area, district: v.district, at: new Date().toISOString(), by: v.anonymous ? null : CURRENT_USER_HANDLE, description: v.description, confirmations: 0, status: "reported", severity: v.severity, solutions: [] };
    updateMedia((s) => ({ ...s, myReports: [r, ...s.myReports] }));
    setOpen(false);
    form.reset(defaults);
    toast.success("রিপোর্ট জমা হয়েছে", { description: "এলাকার মানুষ নিশ্চিত করলে এটি সতর্কতার তালিকায় উঠবে।" });
  }

  return (
    <>
      <button type="button" onClick={() => { form.reset(defaults); setOpen(true); }} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> রিপোর্ট করুন
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">সমস্যা বা সতর্কতা রিপোর্ট</DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">যা দেখেছেন তা-ই লিখুন — কারো নাম-ছবি দিয়ে দোষারোপ নয়। মিথ্যা রিপোর্টে অ্যাকাউন্ট বন্ধ হতে পারে।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="kind" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(civicKindBn) as CivicKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === k} onChange={() => field.onChange(k)} />
                        {civicKindBn[k]}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>এক লাইনে</FormLabel>
                  <FormControl><Input placeholder="যেমন: বাসস্ট্যান্ডে খোলা জায়গায় প্রস্রাব" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>এলাকা</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>জেলা</FormLabel>
                    <FormControl><select {...field} className={selectClass}>{districts.map((d) => <option key={d}>{d}</option>)}</select></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>কী দেখেছেন</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="কখন, কোথায়, কতবার — যত নির্দিষ্ট, তত দ্রুত সমাধান।" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="severity" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>কতটা গুরুতর</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(["low", "medium", "high"] as const).map((sv) => (
                      <label key={sv} className={choiceClass(field.value === sv)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === sv} onChange={() => field.onChange(sv)} />
                        {severityInfo[sv].bn}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="anonymous" render={({ field }) => (
                <FormItem className="flex flex-row items-start justify-between gap-4 rounded-xl border border-card-border p-3">
                  <div>
                    <FormLabel>নাম গোপন রাখুন</FormLabel>
                    <FormDescription>অন্যরা আপনার নাম দেখবেন না, তবে রিপোর্টের পেছনে একজন যাচাইকৃত মানুষ আছেন — তাই ভয় ছাড়াই চাঁদাবাজি বা হয়রানির কথা বলা যায়।</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <Megaphone aria-hidden /> জমা দিন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MyReports() {
  const mine = useMediaState((s) => s.myReports);
  if (mine.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-text-primary">আপনার রিপোর্ট</h2>
      {mine.map((r) => <CivicCard key={r.id} report={r} live />)}
    </section>
  );
}
