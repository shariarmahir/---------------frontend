"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, Check, Clock, Lock, ShieldCheck, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCourse, getDepartment } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { BATCH_STAGES, batchStage, seatsLeft, slotOf, type Batch } from "@/lib/media/batch";
import type { PayMethod } from "@/data/media/types";
import { useAuth } from "@/lib/auth/client";
import { CLASS_MINUTES, COURSE_DAYS, MIN_ATTENDANCE, MIN_HOMEWORK, checkoutEnrol, type Course } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";
import { joinSchema, type JoinInput, type JoinOutput } from "@/lib/media/schemas";
import { newId, updateMedia, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num, Taka } from "../../ui/numerals";
import { defaultMethod, escrowTxn, PayPicker } from "../../wallet/pay";
import { useWallet } from "../../wallet/use-wallet";
import { addToCart, removeFromCart, useCart } from "../cart";
import { defaultBatch, joinable, useBatches } from "../classroom/use-batches";
import { updateAcademy, useAcademy } from "../use-academy";
import { Joined, type Receipt } from "./joined";

/**
 * Checkout, laid out the way a course site lays it out: a plain bar, the
 * steps on the left (confirm who is joining, choose how to pay, agree to the
 * rules) and the order summary on the right. Paying puts each fee in escrow
 * and enrols every course at once; then the congratulations.
 */
export function CheckoutView() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const { account } = useAuth();
  const cart = useCart();
  const admissions = useAcademy((a) => a.admissions);
  const { available } = useWallet();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // Arriving from a course's "ভর্তি হোন" puts that course in the cart.
  const asked = params.get("course");
  useEffect(() => {
    if (hydrated && asked && getCourse(asked)) addToCart(asked);
  }, [hydrated, asked]);

  const items = useMemo(() => cart.map((id) => getCourse(id)).filter((c): c is Course => Boolean(c)), [cart]);
  // Each course joins one batch: the one picked, else the soonest with seats. Its department is joined here too.
  const batches = useBatches();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const batchesOf = (c: Course) => batches.filter((b) => b.course === c.id).sort((a, b) => a.starts.localeCompare(b.starts) || a.n - b.n);
  const batchFor = (c: Course): Batch | undefined => {
    const own = batchesOf(c);
    return own.find((b) => b.id === picked[c.id] && joinable(b)) ?? defaultBatch(own);
  };
  const full = (c: Course) => !batchFor(c);
  const ready = items.filter((c) => !full(c));
  const joinsNew = [...new Set(ready.filter((c) => !admissions[c.dept]).map((c) => c.dept))];
  const fees = ready.map((c) => computeFees(c.fee));
  const subtotal = fees.reduce((n, f) => n + f.price, 0);
  const charge = fees.reduce((n, f) => n + f.buyerCharge, 0);
  const total = fees.reduce((n, f) => n + f.buyerPays, 0);

  const [method, setMethod] = useState<PayMethod | null>(null);
  const chosen = method ?? defaultMethod(available, total);

  const form = useForm<JoinInput, unknown, JoinOutput>({
    resolver: zodResolver(joinSchema),
    values: { name: account?.name ?? "", phone: account?.phone ?? "", district: account?.district ?? "", goal: "", agree: false as unknown as true },
    resetOptions: { keepDirtyValues: true },
  });

  function confirm(v: JoinOutput) {
    if (ready.length === 0) {
      toast.error("ভর্তির মতো কোনো কোর্স নেই", { description: "কার্টের কোর্সগুলোর আসন পূর্ণ — অন্য কোর্স বেছে নিন।" });
      return;
    }
    if (total > 0 && chosen === "wallet" && available < total) {
      toast.error("ব্যালান্স কম", { description: "অন্য পেমেন্ট পদ্ধতি বেছে নিন।" });
      return;
    }
    const at = new Date().toISOString();
    const txns = ready.filter((c) => c.fee > 0).map((c) => escrowTxn({ id: newId("esc"), label: `কোর্স ${c.id}: ${c.title} — এসক্রোতে জমা`, price: c.fee, method: chosen, at }));
    if (txns.length) updateMedia((s) => ({ ...s, txns: [...txns, ...s.txns] }));
    const ids = ready.map((c) => c.id);
    const joining = { name: v.name, phone: v.phone, district: v.district, ...(v.goal ? { goal: v.goal } : {}) };
    const rooms = Object.fromEntries(ready.map((c) => [c.id, batchFor(c)!.id]));
    if (!updateAcademy((a) => checkoutEnrol(a, ready.map((c) => ({ ...c, batch: rooms[c.id] })), joining, at))) {
      toast.error("এই ব্রাউজারে সংরক্ষণ হয়নি", { description: "ভর্তি এই ভিজিটে দেখা যাবে, পরে নাও থাকতে পারে।" });
    }
    setReceipt({ name: v.name, courses: ids, rooms, paid: total, method: total > 0 ? chosen : null, ref: txns[0]?.id ?? newId("join"), at });
    toast.success("ভর্তি সম্পন্ন", { description: `${ids.length}টি কোর্সে আপনার আসন নিশ্চিত।` });
    document.getElementById("academy-main")?.scrollTo({ top: 0 });
  }

  if (receipt) return <Joined receipt={receipt} />;

  return (
    <div ref={top}>
      {/* The checkout's own plain bar. */}
      <div className="-mx-3 -mt-6 border-b border-m-ink/8 bg-white sm:-mx-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/media/academy/departments" className="text-2xl leading-none font-extrabold text-m-blue">
            কাণ্ডারী <span className="text-m-ink">শিখন</span>
          </Link>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-m-ink/75">
            <Lock className="size-4 text-m-green" aria-hidden /> নিরাপদ চেকআউট
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl pt-6 pb-16">
        <Link href="/media/academy/departments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-m-blue hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> আরও কোর্স দেখুন
        </Link>
        <h1 className="mt-3 text-[clamp(1.8rem,3.4vw,2.4rem)] leading-tight font-bold text-m-ink">চেকআউট</h1>

        {!hydrated ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem]">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(confirm)} className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_25rem]">
              <div className="space-y-6">
                <Step n={1} title="ভর্তির তথ্য নিশ্চিত করুন" sub="শিক্ষক এই তথ্য দিয়েই আপনার সাথে যোগাযোগ করবেন।">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পুরো নাম</FormLabel>
                          <FormControl>
                            <Input autoComplete="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>মোবাইল নম্বর</FormLabel>
                          <FormControl>
                            <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="০১৭১২৩৪৫৬৭৮" {...field} />
                          </FormControl>
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
                            <Input autoComplete="address-level2" placeholder="যেমন শেরপুর" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>ইমেইল</FormLabel>
                      <Input value={account?.email ?? "দেওয়া নেই"} readOnly disabled className="text-m-ink/60" />
                    </FormItem>
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>
                            কেন শিখতে চান? <span className="font-normal text-m-ink/55">(ইচ্ছে হলে)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea rows={2} maxLength={200} placeholder="এক লাইনে — শিক্ষক আপনাকে চিনে নেবেন" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Step>

                <Step n={2} title="ব্যাচ ও ক্লাসের সময়" sub="একই কোর্স একাধিক ব্যাচে চলে — যে সময়টা আপনার সুবিধা, সেটা বেছে নিন। এই ব্যাচের ক্লাসরুমেই ঢুকবেন।">
                  <div className="space-y-5">
                    {items.map((c) => (
                      <BatchPicker key={c.id} course={c} batches={batchesOf(c)} chosen={batchFor(c)} onPick={(id) => setPicked((p) => ({ ...p, [c.id]: id }))} showTitle={items.length > 1} />
                    ))}
                  </div>
                </Step>

                <Step n={3} title="পেমেন্ট পদ্ধতি" sub={total > 0 ? "টাকা এসক্রোতে থাকে; ক্লাস হলে শিক্ষক পান, না হলে ফেরত।" : "এই কোর্সগুলো বিনা ফির — কিছু দিতে হবে না।"}>
                  {total > 0 ? (
                    <>
                      <PayPicker value={chosen} onChange={setMethod} available={available} due={total} name="checkout-pay" />
                      <p className="mt-3 rounded-lg bg-m-ground px-3 py-2 text-xs text-m-ink/70">ডেমো: এখানে আসল টাকা কাটা হয় না, লেনদেনটা শুধু মাটির ব্যাংকে ওঠে।</p>
                    </>
                  ) : (
                    <p className="flex items-center gap-2 text-sm font-semibold text-m-green">
                      <ShieldCheck className="size-4.5" aria-hidden /> বিনা ফি
                    </p>
                  )}
                </Step>

                <Step n={4} title="নিয়মে সম্মতি">
                  <ul className="space-y-2 text-[15px] text-m-ink/80">
                    <li>
                      · <Num value={COURSE_DAYS} /> দিনের কোর্স — প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, শেষে প্রজেক্ট আর প্যানেল
                    </li>
                    <li>
                      · ফাইনালে বসতে অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা আর <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ
                    </li>
                    <li>· শিক্ষক নিয়ে অভিযোগ নাম গোপন রেখে করা যায়; প্যানেল খতিয়ে দেখে</li>
                  </ul>
                  <FormField
                    control={form.control}
                    name="agree"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-m-ground p-3.5 text-[15px] font-semibold text-m-ink ring-1 ring-m-ink/8 has-checked:bg-m-blue-soft has-checked:ring-m-blue/40">
                          <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} onBlur={field.onBlur} ref={field.ref} className="mt-0.5 size-5 shrink-0 accent-m-blue" />
                          নিয়মগুলো পড়েছি, মেনে চলব
                        </label>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <div className="rounded-2xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8 sm:p-6">
                  <button type="submit" disabled={ready.length === 0 || form.formState.isSubmitting} className={mediaButton({ size: "lg", className: "h-14 w-full text-base" })}>
                    {total > 0 ? (
                      <>
                        <Taka amount={total} /> দিয়ে ভর্তি নিশ্চিত করুন
                      </>
                    ) : (
                      "ভর্তি নিশ্চিত করুন"
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs leading-relaxed text-m-ink/60">বোতাম চাপলে আপনি কাণ্ডারী তৈরি একাডেমির নিয়মে রাজি হচ্ছেন। ফি থাকে এসক্রোতে।</p>
                </div>
              </div>

              <Summary items={items} batchFor={batchFor} joinsNew={joinsNew} subtotal={subtotal} charge={charge} total={total} />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

/** A numbered step of the checkout, as a white card. */
function Step({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-2xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-m-blue text-sm font-bold text-m-on">
          <Num value={n} />
        </span>
        <div>
          <h2 id={`step-${n}`} className="text-lg leading-snug font-bold text-m-ink">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-sm text-m-ink/65">{sub}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** The order summary: each course with its batch and fee, then the totals and the escrow promise. */
/** One course's batches as choice cards: number, weekly slot, start, seats left. */
function BatchPicker({ course, batches, chosen, onPick, showTitle }: { course: Course; batches: Batch[]; chosen?: Batch; onPick: (id: string) => void; showTitle: boolean }) {
  return (
    <fieldset>
      <legend className={cn("mb-2.5 text-sm font-bold text-m-ink", !showTitle && "sr-only")}>{course.title}</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {batches.map((b) => {
          const open = joinable(b);
          const on = chosen?.id === b.id;
          const stage = batchStage(b, DEMO_NOW);
          return (
            <label
              key={b.id}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-xl p-3.5 ring-1 transition-colors",
                on ? "bg-m-blue-soft ring-2 ring-m-blue" : open ? "bg-white ring-m-ink/12 hover:ring-m-blue/40" : "cursor-not-allowed bg-m-ground/70 opacity-60 ring-m-ink/8",
              )}
            >
              <input type="radio" name={`batch-${course.id}`} className="sr-only" checked={on} disabled={!open} onChange={() => onPick(b.id)} />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-m-ink">
                  ব্যাচ <Num value={b.n} />
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", stage === "running" ? "bg-m-amber-soft text-m-gold" : "bg-m-green-soft text-m-green")}>{BATCH_STAGES[stage]}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-m-blue">
                <Clock className="size-3.5" aria-hidden /> {slotOf(b.day, b.time)}
              </span>
              <span className="text-xs text-m-ink/65">
                শুরু <DateText iso={b.starts} /> · {open ? <><Num value={seatsLeft(b)} />টি আসন বাকি</> : "আসন পূর্ণ"}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Summary({ items, batchFor, joinsNew, subtotal, charge, total }: { items: Course[]; batchFor: (c: Course) => Batch | undefined; joinsNew: string[]; subtotal: number; charge: number; total: number }) {
  return (
    <aside aria-labelledby="summary" className="order-first space-y-4 lg:sticky lg:top-4 lg:order-0">
      <section className="overflow-hidden rounded-2xl bg-white shadow-m-lift ring-1 ring-m-ink/8">
        <h2 id="summary" className="flex items-center justify-between border-b border-m-ink/8 px-5 py-4 text-lg font-bold text-m-ink">
          অর্ডারের সারাংশ
          <span className="text-sm font-semibold text-m-ink/60">
            <Num value={items.length} />টি কোর্স
          </span>
        </h2>
        <ul className="divide-y divide-m-ink/8">
          {items.map((c) => {
            const dept = getDepartment(c.dept);
            const batch = batchFor(c);
            const isFull = !batch;
            return (
              <li key={c.id} className={cn("p-4", isFull && "bg-m-amber-soft/60")}>
                <div className="flex gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-m-ground">
                    <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/media/academy/course/${c.id}`} className="line-clamp-2 text-sm leading-snug font-bold text-m-ink hover:text-m-blue">
                      {c.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-m-ink/60">{dept?.academy.name}</p>
                    {batch && (
                      <p className="mt-0.5 text-xs text-m-ink/60">
                        ব্যাচ <Num value={batch.n} /> · শুরু <DateText iso={batch.starts} />
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-m-ink tabular-nums">{c.fee === 0 ? <span className="text-m-green">বিনা ফি</span> : <Taka amount={c.fee} />}</span>
                    <button type="button" onClick={() => removeFromCart(c.id)} className="grid size-7 place-items-center rounded-full text-m-ink/50 transition-colors hover:bg-m-red-soft hover:text-m-red" aria-label={`${c.title} কার্ট থেকে সরান`}>
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
                {isFull ? (
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed font-semibold text-m-ink/85">
                    <AlertTriangle className="size-4 shrink-0 text-m-red" aria-hidden />
                    কোনো ব্যাচে আসন খালি নেই — এবার বাদ থাকবে। একাডেমি নতুন ব্যাচ খুললে আবার চেষ্টা করুন।
                  </p>
                ) : (
                  joinsNew.includes(c.dept) && (
                    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed font-semibold text-m-blue">
                      <Check className="size-4 shrink-0" aria-hidden />
                      সাথে {dept?.name} বিভাগেও যোগ হবেন — আলাদা কিছু লাগবে না।
                    </p>
                  )
                )}
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t border-m-ink/8 px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-m-ink/70">কোর্স ফি</dt>
            <dd className="text-m-ink tabular-nums">
              <Taka amount={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-m-ink/70">সার্ভিস চার্জ (৫%)</dt>
            <dd className="text-m-ink tabular-nums">
              <Taka amount={charge} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-m-ink/8 pt-3">
            <dt className="font-bold text-m-ink">আজ মোট</dt>
            <dd className="text-2xl font-bold text-m-ink tabular-nums">
              <Taka amount={total} />
            </dd>
          </div>
        </dl>
      </section>
      <div className="space-y-2.5 rounded-2xl bg-m-blue-soft p-4 text-sm text-m-ink/80">
        <p className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-m-blue" aria-hidden />
          টাকা এসক্রোতে থাকে — ক্লাস হলে শিক্ষক পান, না হলে ফেরত।
        </p>
        <p className="flex gap-2">
          <Lock className="mt-0.5 size-4.5 shrink-0 text-m-blue" aria-hidden />
          শিক্ষক পান ফির ৯৫%; প্ল্যাটফর্ম রাখে দুই পক্ষে ৫% করে।
        </p>
      </div>
    </aside>
  );
}

function EmptyCart() {
  return (
    <div className="mt-8 grid place-items-center rounded-3xl bg-white px-6 py-16 text-center shadow-m-tile ring-1 ring-m-ink/8">
      <span className="grid size-16 place-items-center rounded-full bg-m-blue-soft text-m-blue">
        <ShoppingCart className="size-7" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold text-m-ink">কার্ট খালি</h2>
      <p className="mt-1 max-w-sm text-[15px] text-m-ink/70">কোনো কোর্সের পাতায় “কার্টে রাখুন” বা “ভর্তি হোন” চাপলে এখানে আসবে।</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/media/academy/departments" className={mediaButton()}>
          বিভাগ দেখুন
        </Link>
        <Link href="/media/academy/videos" className={mediaButton({ variant: "outline" })}>
          বিনামূল্যের ক্লাস
        </Link>
      </div>
    </div>
  );
}
