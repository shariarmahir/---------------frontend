"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { departments, getDepartment } from "@/data/media/academy";
import { getPerson } from "@/data/media/users";
import { DEPT_KINDS, interviewSlots, type DeptKind, type TeachApplication } from "@/lib/media/academy";
import { handleList, teachSchema, type TeachInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { DateText } from "../ui/numerals";
import { updateAcademy, useAcademy } from "./use-academy";

const KIND_HINT: Record<DeptKind, string> = {
  solo: "নিজে একা একটা কোর্স চালাবেন।",
  team: "কয়েক বন্ধু মিলে একটা বিভাগ — যেমন ওয়েব, অ্যাপ আর এআই।",
  workshop: "নিজের গ্যারেজ, রান্নাঘর বা ল্যাবে হাতে-কলমে ক্লাস।",
};

/** Apply to teach, then book the panel interview. */
export function TeachApply({ initialDept }: { initialDept?: string }) {
  const ensure = useRequireAccount();
  const hydrated = useHydrated();
  const application = useAcademy((a) => a.application);
  const preset = initialDept === "new" || (initialDept && getDepartment(initialDept)) ? initialDept : "";
  const form = useForm<TeachInput>({
    resolver: zodResolver(teachSchema),
    defaultValues: { kind: "solo", dept: preset, newDept: "", skill: "", years: 0, sample: "", plan: "", team: "", place: "" },
  });
  const [kind, dept] = useWatch({ control: form.control, name: ["kind", "dept"] });

  if (!hydrated) return null;
  if (application) return <Status application={application} />;

  function onSubmit(v: TeachInput) {
    if (!ensure("শিক্ষক হিসেবে আবেদন করতে")) return;
    const team = handleList(v.team);
    const unknown = team.filter((h) => !getPerson(h));
    if (unknown.length > 0) {
      form.setError("team", { message: `এই সদস্য পাওয়া যায়নি: @${unknown.join(", @")}` });
      return;
    }
    const app: TeachApplication = { ...v, team, at: new Date().toISOString() };
    updateAcademy((a) => ({ ...a, application: app }));
    toast.success("আবেদন জমা হয়েছে", { description: "এবার প্যানেল ইন্টারভিউয়ের সময় বেছে নিন।" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-7">
        <FormField control={form.control} name="kind" render={({ field }) => (
          <FormItem>
            <FormGroupLabel>কীভাবে শেখাবেন</FormGroupLabel>
            <FormGroup className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(DEPT_KINDS) as DeptKind[]).map((k) => (
                <label key={k} className={cn(choiceClass(field.value === k), "flex-col items-start py-3")}>
                  <input type="radio" className="sr-only" name={field.name} checked={field.value === k} onChange={() => field.onChange(k)} />
                  <span>{DEPT_KINDS[k]}</span>
                  <span className="text-xs font-normal text-white/70">{KIND_HINT[k]}</span>
                </label>
              ))}
            </FormGroup>
          </FormItem>
        )} />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="dept" render={({ field }) => (
            <FormItem>
              <FormLabel>বিভাগ</FormLabel>
              <FormControl>
                <select {...field} className={selectClass}>
                  <option value="">বেছে নিন</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  <option value="new">+ নতুন বিভাগ খুলব</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {dept === "new" ? (
            <FormField control={form.control} name="newDept" render={({ field }) => (
              <FormItem>
                <FormLabel>নতুন বিভাগের নাম</FormLabel>
                <FormControl><Input placeholder="যেমন: ট্যাটু ও বডি আর্ট" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ) : (
            <FormField control={form.control} name="skill" render={({ field }) => (
              <FormItem>
                <FormLabel>কী শেখাবেন</FormLabel>
                <FormControl><Input placeholder="যেমন: মোটরসাইকেল মেরামত" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>
        {dept === "new" && (
          <FormField control={form.control} name="skill" render={({ field }) => (
            <FormItem>
              <FormLabel>কী শেখাবেন</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <FormField control={form.control} name="years" render={({ field }) => (
            <FormItem>
              <FormLabel>অভিজ্ঞতা (বছর)</FormLabel>
              <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sample" render={({ field }) => (
            <FormItem>
              <FormLabel>নমুনা ক্লাসের ভিডিও</FormLabel>
              <FormControl><Input type="url" placeholder="https://… ১০ মিনিটে একটা কিছু শেখান" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="plan" render={({ field }) => (
          <FormItem>
            <FormLabel>ক্লাসের পরিকল্পনা</FormLabel>
            <FormControl><Textarea rows={4} placeholder="কয় সপ্তাহ, প্রতি সপ্তাহে কী, হোমওয়ার্ক কী, শেষে শিক্ষার্থী কী বানাবে।" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {kind === "team" && (
          <FormField control={form.control} name="team" render={({ field }) => (
            <FormItem>
              <FormLabel>দলের অন্যরা</FormLabel>
              <FormControl><Input placeholder="@anik, @rupa" {...field} /></FormControl>
              <FormDescription>প্রত্যেককে আলাদা করে ইন্টারভিউ দিতে হবে।</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}
        {kind === "workshop" && (
          <FormField control={form.control} name="place" render={({ field }) => (
            <FormItem>
              <FormLabel>কর্মশালার ঠিকানা</FormLabel>
              <FormControl><Input placeholder="যেমন: রফিকুল মোটরস, স্টেশন রোড, টঙ্গী" {...field} /></FormControl>
              <FormDescription>প্যানেল গিয়ে জায়গার নিরাপত্তা দেখবে। প্রথম ক্লাস সবসময় অনলাইনে।</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <button type="submit" className={mediaButton({ variant: "primary", size: "lg" })}>আবেদন জমা দিন</button>
      </form>
    </Form>
  );
}

function Status({ application }: { application: TeachApplication }) {
  const [slots] = useState(() => interviewSlots(new Date()));
  const [slot, setSlot] = useState<string>();
  const dept = application.dept === "new" ? application.newDept : getDepartment(application.dept)?.name;

  return (
    <section className="live-in space-y-5 rounded-2xl bg-text-primary p-5 ring-1 ring-signal-orange/40 sm:p-7">
      <div>
        <p className="text-sm font-semibold text-signal-orange">আবেদন জমা · <DateText iso={application.at} /></p>
        <h2 className="mt-1 text-xl font-bold text-white">{application.skill}</h2>
        <p className="text-sm text-white/80">{dept} · {DEPT_KINDS[application.kind]}{application.team.length > 0 && ` · দলে @${application.team.join(", @")}`}</p>
      </div>
      <ol className="space-y-2 text-sm">
        {[
          ["আবেদন জমা", true],
          ["ইন্টারভিউয়ের সময়", Boolean(application.interview)],
          ["প্যানেলের সিদ্ধান্ত", false],
          ["প্রথম ব্যাচ", false],
        ].map(([label, done]) => (
          <li key={String(label)} className="flex items-center gap-2">
            <span className={cn("inline-block size-2.5 rounded-full", done ? "bg-bdgreen-500" : "bg-white/25")} />
            <span className={done ? "text-white" : "text-white/70"}>{label}</span>
          </li>
        ))}
      </ol>
      {application.interview ? (
        <p className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
          <CalendarCheck className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden />
          <span>ইন্টারভিউ <strong className="text-white"><DateText iso={application.interview} time weekday /></strong>। প্যানেলে থাকবেন ওই বিভাগের একজন প্রধান শিক্ষক আর একজন বহিরাগত পেশাদার — আপনি ১৫ মিনিটে একটা কিছু শিখিয়ে দেখাবেন।</span>
        </p>
      ) : (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-white">প্যানেল ইন্টারভিউয়ের সময় বেছে নিন</legend>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <label key={s} className={choiceClass(slot === s)}>
                <input type="radio" name="teach-slot" className="sr-only" checked={slot === s} onChange={() => setSlot(s)} />
                <DateText iso={s} time weekday />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={!slot}
            onClick={() => {
              updateAcademy((a) => (a.application ? { ...a, application: { ...a.application, interview: slot } } : a));
              toast.success("ইন্টারভিউ বুক হয়েছে");
            }}
            className={mediaButton({ variant: "primary", className: "mt-4" })}
          >
            সময় নিশ্চিত করুন
          </button>
        </fieldset>
      )}
      <button type="button" onClick={() => updateAcademy((a) => ({ ...a, application: null }))} className={mediaButton({ variant: "ghost", size: "sm" })}>
        আবেদন তুলে নিন
      </button>
    </section>
  );
}
