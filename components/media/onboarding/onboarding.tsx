"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdentificationCard, SealCheck, ShieldCheck } from "@phosphor-icons/react/ssr";
import { ArrowLeft, ArrowRight, Camera, CircleCheck, Lock, ScanFace, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormGroup, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { districts } from "@/data/media/districts";
import type { CategoryId } from "@/data/media/types";
import {
  categoriesSchema,
  identitySchema,
  profileSchema,
  type CategoriesInput,
  type IdentityInput,
  type ProfileInput,
} from "@/lib/media/schemas";
import { resetMedia, updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";

const steps = ["পরিচয় যাচাই", "দক্ষতার বিভাগ", "প্রোফাইল"];


function Capture({ label, done, onDone, Icon, invalid }: { label: string; done: boolean; onDone: () => void; Icon: typeof Camera; invalid?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => {
        if (done || busy) return;
        setBusy(true);
        window.setTimeout(() => {
          setBusy(false);
          onDone();
        }, 900);
      }}
      className={cn(
        "flex aspect-[1.6] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-semibold transition-colors",
        done ? "border-bd-green bg-bd-green-light text-bd-green-dark" : invalid ? "border-red-300 bg-red-50/50 text-national-crimson" : "media-slot-pattern border-card-border bg-white text-text-secondary hover:border-bd-green/50",
      )}
    >
      {busy ? <Skeleton className="size-9 rounded-full" /> : done ? <CircleCheck className="size-9" aria-hidden /> : <Icon className="size-9" strokeWidth={1.5} aria-hidden />}
      {busy ? "ছবি নেওয়া হচ্ছে…" : done ? `${label} — নেওয়া হয়েছে` : `${label} তুলুন`}
    </button>
  );
}

function IdentityStep({ onNext }: { onNext: (v: IdentityInput) => void }) {
  const form = useForm<IdentityInput>({
    resolver: zodResolver(identitySchema),
    defaultValues: { docType: "nid", number: "", fullName: "", dob: "", front: false as true, back: false, selfie: false as true, consent: false as true },
  });
  const doc = useWatch({ control: form.control, name: "docType" });
  const [front, back, selfie] = useWatch({ control: form.control, name: ["front", "back", "selfie"] });
  const errors = form.formState.errors;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} noValidate className="space-y-6">
        <div className="flex gap-4 rounded-2xl bg-bd-green p-5 text-white">
          <ShieldCheck size={44} weight="duotone" className="shrink-0" aria-hidden />
          <div>
            <p className="text-lg font-bold">এক মানুষ, এক অ্যাকাউন্ট</p>
            <p className="mt-1 text-sm leading-relaxed text-white/85">
              এখানে প্রতিটি রেটিং আর রিভিউ একজন সত্যিকারের মানুষের। তাই শুরুতেই পরিচয় যাচাই — প্রায় তিন মিনিট। কাগজের নম্বর বা ছবি প্রোফাইলে দেখাবে না, শুধু একটি সিল।
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="docType"
          render={({ field }) => (
            <FormItem>
              <FormGroupLabel>কোন কাগজ দিয়ে</FormGroupLabel>
              <FormGroup className="grid gap-2 sm:grid-cols-2">
                {([
                  ["nid", "জাতীয় পরিচয়পত্র", "স্মার্ট বা পুরনো কার্ড"],
                  ["passport", "পাসপোর্ট", "প্রবাসী বা এনআইডি না থাকলে"],
                ] as const).map(([value, label, hint]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-bd-green/30",
                      field.value === value ? "border-bd-green bg-bd-green-light" : "border-card-border hover:border-slate-300",
                    )}
                  >
                    <input type="radio" className="sr-only" name={field.name} checked={field.value === value} onChange={() => field.onChange(value)} />
                    <IdentificationCard size={28} weight="duotone" className="shrink-0 text-bd-green" aria-hidden />
                    <span>
                      <span className="block font-bold text-text-primary">{label}</span>
                      <span className="block text-xs text-text-muted">{hint}</span>
                    </span>
                  </label>
                ))}
              </FormGroup>
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{doc === "nid" ? "এনআইডি নম্বর" : "পাসপোর্ট নম্বর"}</FormLabel>
                <FormControl>
                  <Input {...field} inputMode={doc === "nid" ? "numeric" : "text"} autoComplete="off" placeholder={doc === "nid" ? "১০, ১৩ বা ১৭ অঙ্ক" : "যেমন BN0123456"} className="font-mono tracking-wider" />
                </FormControl>
                <FormDescription>বাংলা বা ইংরেজি অঙ্ক — দুটোই চলবে।</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>পূর্ণ নাম (কাগজ অনুযায়ী)</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>জন্মতারিখ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} autoComplete="bday" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">কাগজ ও মুখের ছবি</p>
          <div className={cn("grid gap-3", doc === "nid" ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            <Capture label={doc === "nid" ? "সামনের পাশ" : "তথ্য-পাতা"} Icon={Camera} done={front} invalid={!!errors.front} onDone={() => form.setValue("front", true, { shouldValidate: form.formState.isSubmitted })} />
            {doc === "nid" && <Capture label="পেছনের পাশ" Icon={Camera} done={back} invalid={!!errors.back} onDone={() => form.setValue("back", true, { shouldValidate: form.formState.isSubmitted })} />}
            <Capture label="সেলফি" Icon={ScanFace} done={selfie === true} invalid={!!errors.selfie} onDone={() => form.setValue("selfie", true, { shouldValidate: form.formState.isSubmitted })} />
          </div>
          {(errors.front || errors.back || errors.selfie) && (
            <p role="alert" className="mt-2 text-xs font-semibold text-national-crimson">
              {errors.front?.message ?? errors.back?.message ?? errors.selfie?.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
                <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-bd-green" />
                <span>এই কাগজ আমার নিজের। এক কাগজে একটিই অ্যাকাউন্ট — আমি জানি। ছবি শুধু যাচাইয়ে ব্যবহার হবে।</span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <ul className="grid gap-2 text-xs text-text-muted sm:grid-cols-3">
          <li className="flex items-center gap-1.5"><UserRoundX className="size-4 text-bd-green" aria-hidden />ভুয়া ও দ্বিতীয় অ্যাকাউন্ট বন্ধ</li>
          <li className="flex items-center gap-1.5"><Lock className="size-4 text-bd-green" aria-hidden />নম্বর ও ছবি গোপন থাকে</li>
          <li className="flex items-center gap-1.5"><SealCheck size={16} weight="duotone" className="text-bd-green" aria-hidden />প্রোফাইলে শুধু সিল দেখায়</li>
        </ul>

        <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
          যাচাই করুন <ArrowRight aria-hidden />
        </button>
      </form>
    </Form>
  );
}

function CategoryStep({ categories, onBack, onNext }: { categories: { id: CategoryId; bn: string; blurb: string }[]; onBack: () => void; onNext: (v: CategoriesInput) => void }) {
  const form = useForm<CategoriesInput>({ resolver: zodResolver(categoriesSchema), defaultValues: { categories: [] } });
  const chosen = useWatch({ control: form.control, name: "categories" });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} noValidate className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-bd-green-light p-4 text-bd-green-dark">
          <SealCheck size={32} weight="duotone" className="seal-shine shrink-0 rounded-full" aria-hidden />
          <p className="text-sm font-semibold">পরিচয় যাচাই হয়েছে। এবার বলুন আপনি কোন কাজে দক্ষ — সর্বোচ্চ ৫টি।</p>
        </div>
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormGroupLabel className="flex justify-between">
                দক্ষতার বিভাগ
                <span className="text-xs font-normal text-text-muted">
                  <Num value={chosen.length} />/<Num value={5} /> বাছাই
                </span>
              </FormGroupLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((c) => {
                  const on = field.value.includes(c.id);
                  const full = !on && field.value.length >= 5;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      disabled={full}
                      onClick={() => field.onChange(on ? field.value.filter((x) => x !== c.id) : [...field.value, c.id])}
                      className={cn(
                        "flex min-h-16 items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors disabled:opacity-40",
                        on ? "border-bd-green bg-bd-green-light" : "border-card-border hover:border-slate-300",
                      )}
                    >
                      <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2", on ? "border-bd-green bg-bd-green text-white" : "border-slate-300")}>
                        {on && <CircleCheck className="size-3.5" aria-hidden />}
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-text-primary">{c.bn}</span>
                        <span className="block text-xs leading-relaxed text-text-muted">{c.blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-2">
          <button type="button" onClick={onBack} className={mediaButton({ variant: "ghost" })}>
            <ArrowLeft aria-hidden /> আগের ধাপ
          </button>
          <button type="submit" className={mediaButton({ variant: "primary" })}>
            পরের ধাপ <ArrowRight aria-hidden />
          </button>
        </div>
      </form>
    </Form>
  );
}

function ProfileStep({ takenHandles, defaultName, onBack, onDone }: { takenHandles: string[]; defaultName: string; onBack: () => void; onDone: (v: ProfileInput) => void }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: defaultName, handle: "", district: "", headline: "", bio: "" },
  });
  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((v) => {
          if (takenHandles.includes(v.handle)) {
            form.setError("handle", { message: "এই হ্যান্ডেল আগেই নেওয়া — অন্যটি বেছে নিন।" });
            return;
          }
          onDone(v);
        })}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>যে নামে দেখাবে</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>হ্যান্ডেল</FormLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">@</span>
                  <FormControl>
                    <Input {...field} autoComplete="username" className="pl-7" onChange={(e) => field.onChange(e.target.value.toLowerCase())} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>জেলা</FormLabel>
                <FormControl>
                  <select {...field} className="h-11 w-full rounded-lg border border-card-border bg-white px-3 text-[15px] focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none">
                    <option value="">বেছে নিন</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>এক লাইনে পরিচয়</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="যেমন: হাতে সেলাইয়ের নকশিকাঁথা শিল্পী" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>আপনার কথা (ঐচ্ছিক)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="কী করেন, কতদিন ধরে, কাদের জন্য।" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-2">
          <button type="button" onClick={onBack} className={mediaButton({ variant: "ghost" })}>
            <ArrowLeft aria-hidden /> আগের ধাপ
          </button>
          <button type="submit" className={mediaButton({ variant: "green" })}>
            <SealCheck size={20} weight="duotone" aria-hidden /> অ্যাকাউন্ট তৈরি করুন
          </button>
        </div>
      </form>
    </Form>
  );
}

export function Onboarding({ categories, takenHandles }: { categories: { id: CategoryId; bn: string; blurb: string }[]; takenHandles: string[] }) {
  const hydrated = useHydrated();
  const profile = useMediaState((s) => s.profile);
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState<IdentityInput | null>(null);
  const [cats, setCats] = useState<CategoryId[]>([]);

  if (!hydrated) return <Skeleton className="h-[36rem] rounded-2xl" />;

  if (profile) {
    return (
      <div className="rounded-2xl border border-card-border bg-white p-6 text-center sm:p-10" role="status">
        <SealCheck size={72} weight="duotone" className="seal-shine mx-auto rounded-full text-bd-green" aria-hidden />
        <h2 className="mt-4 text-2xl font-bold text-text-primary">স্বাগতম, {profile.displayName}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          @{profile.handle} · {profile.district} — পরিচয় যাচাইকৃত। এবার প্রথম দক্ষতার প্রমাণ পোস্ট করুন; কমিউনিটি যাচাই করলেই কাজ আসতে শুরু করবে।
        </p>
        <p className="mx-auto mt-3 max-w-md rounded-xl bg-slate-50 px-3 py-2 text-xs text-text-muted">
          ডেমো: ব্যাকএন্ড যুক্ত না হওয়া পর্যন্ত অ্যাপের বাকি অংশ নমুনা অ্যাকাউন্ট (মাহির) দিয়ে দেখানো হয়।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>প্রথম দক্ষতা পোস্ট করুন</Link>
          <Link href="/media" className={mediaButton({ variant: "quiet" })}>ফিড দেখুন</Link>
        </div>
        <button type="button" onClick={() => { resetMedia(); setStep(0); }} className="mt-6 text-xs font-semibold text-text-muted underline-offset-2 hover:underline">
          ডেমো আবার শুরু করুন (সব স্থানীয় তথ্য মুছবে)
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-card-border bg-white p-4 sm:p-6">
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="ধাপ">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-1.5 rounded-full transition-colors", i < step ? "bg-bd-green" : i === step ? "bg-signal-orange" : "bg-slate-200")} />
            <span className={cn("mt-2 block text-xs", i === step ? "font-bold text-text-primary" : "text-text-muted")}>
              <Num value={i + 1} />. {s}
            </span>
          </li>
        ))}
      </ol>
      {step === 0 && (
        <IdentityStep
          onNext={(v) => {
            setIdentity(v);
            setStep(1);
            toast.success("পরিচয় যাচাই হয়েছে");
          }}
        />
      )}
      {step === 1 && (
        <CategoryStep
          categories={categories}
          onBack={() => setStep(0)}
          onNext={(v) => {
            setCats(v.categories);
            setStep(2);
          }}
        />
      )}
      {step === 2 && identity && (
        <ProfileStep
          takenHandles={takenHandles}
          defaultName={identity.fullName}
          onBack={() => setStep(1)}
          onDone={(v) => {
            updateMedia((s) => ({ ...s, profile: { ...v, categories: cats, docType: identity.docType, verifiedAt: new Date().toISOString() } }));
          }}
        />
      )}
    </div>
  );
}
