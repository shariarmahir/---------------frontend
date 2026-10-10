"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, BookOpen, Check, Clock, Lock, PlayCircle, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCourse, getDepartment } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import type { PayMethod } from "@/data/media/types";
import { useAuth } from "@/lib/auth/client";
import { CLASS_MINUTES, COURSE_DAYS, MIN_ATTENDANCE, MIN_HOMEWORK, checkoutEnrol, type Course } from "@/lib/media/academy";
import { BATCH_STAGES, batchStage, seatsLeft, slotOf, type Batch } from "@/lib/media/batch";
import { computeFees } from "@/lib/media/fees";
import { joinSchema, type JoinInput, type JoinOutput } from "@/lib/media/schemas";
import { newId, updateMedia, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { defaultMethod, escrowTxn } from "../../wallet/pay";
import { useWallet } from "../../wallet/use-wallet";
import { addToCart, removeFromCart, useCart } from "../cart";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { fieldClass, labelClass, messageClass } from "../catalogue/fields";
import { PayMethods } from "../catalogue/pay-methods";
import { CatalogueRuler } from "../catalogue/ruler";
import { defaultBatch, joinable, useBatches } from "../classroom/use-batches";
import { updateAcademy, useAcademy } from "../use-academy";
import { Joined, type Receipt } from "./joined";

/**
 * ভর্তি — step five of the road. The steps run down the left (who is
 * joining, the batch and its class time, how to pay, the rules) and the
 * order sits on the right, held in view. Paying puts each fee in escrow and
 * enrols every course at once — joining its department too — and the page
 * turns into the welcome.
 */
export function CheckoutView() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      {receipt ? <Joined receipt={receipt} /> : <Checkout onJoined={setReceipt} />}
      <CatalogueFooter />
    </CatalogueRoot>
  );
}

function Checkout({ onJoined }: { onJoined: (r: Receipt) => void }) {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const { account } = useAuth();
  const cart = useCart();
  const admissions = useAcademy((a) => a.admissions);
  const { available } = useWallet();

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
  const ready = items.filter((c) => batchFor(c));
  const joinsNew = [...new Set(ready.filter((c) => !admissions[c.dept]).map((c) => c.dept))];
  const fees = ready.map((c) => computeFees(c.fee));
  const subtotal = fees.reduce((n, f) => n + f.price, 0);
  const charge = fees.reduce((n, f) => n + f.buyerCharge, 0);
  const total = fees.reduce((n, f) => n + f.buyerPays, 0);

  const [method, setMethod] = useState<PayMethod | null>(null);
  const chosen = method ?? defaultMethod(available, total);

  const form = useForm<JoinInput, unknown, JoinOutput>({
    resolver: zodResolver(joinSchema),
    values: {
      name: account?.name ?? "",
      phone: account?.phone ?? "",
      district: account?.district ?? "",
      goal: "",
      agree: false as unknown as true,
    },
    resetOptions: { keepDirtyValues: true },
  });

  function confirm(v: JoinOutput) {
    if (ready.length === 0) {
      toast.error("ভর্তির মতো কোনো কোর্স নেই", {
        description: "কার্টের কোর্সগুলোর আসন পূর্ণ — অন্য কোর্স বেছে নিন।",
      });
      return;
    }
    if (total > 0 && chosen === "wallet" && available < total) {
      toast.error("ব্যালান্স কম", {
        description: "অন্য পেমেন্ট পদ্ধতি বেছে নিন।",
      });
      return;
    }
    const at = new Date().toISOString();
    const txns = ready
      .filter((c) => c.fee > 0)
      .map((c) =>
        escrowTxn({
          id: newId("esc"),
          label: `কোর্স ${c.id}: ${c.title} — এসক্রোতে জমা`,
          price: c.fee,
          method: chosen,
          at,
        }),
      );
    if (txns.length) updateMedia((s) => ({ ...s, txns: [...txns, ...s.txns] }));
    const ids = ready.map((c) => c.id);
    const joining = {
      name: v.name,
      phone: v.phone,
      district: v.district,
      ...(v.goal ? { goal: v.goal } : {}),
    };
    const rooms = Object.fromEntries(ready.map((c) => [c.id, batchFor(c)!.id]));
    if (
      !updateAcademy((a) =>
        checkoutEnrol(
          a,
          ready.map((c) => ({ ...c, batch: rooms[c.id] })),
          joining,
          at,
        ),
      )
    ) {
      toast.error("এই ব্রাউজারে সংরক্ষণ হয়নি", {
        description: "ভর্তি এই ভিজিটে দেখা যাবে, পরে নাও থাকতে পারে।",
      });
    }
    onJoined({
      name: v.name,
      courses: ids,
      rooms,
      paid: total,
      method: total > 0 ? chosen : null,
      ref: txns[0]?.id ?? newId("join"),
      at,
    });
    toast.success("ভর্তি সম্পন্ন", {
      description: `${ids.length}টি কোর্সে আপনার আসন নিশ্চিত।`,
    });
    document.getElementById("academy-main")?.scrollTo({ top: 0 });
  }

  return (
    <>
      <Band id="intro" n={1} label="ভর্তি" now note="নিরাপদ চেকআউট · ফি এসক্রোতে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <Link href="/media/academy/courses" data-reveal data-in className="hud inline-flex items-center gap-1.5 text-(--c-muted) transition-colors hover:text-(--c-ink-strong)">
            <ArrowLeft className="size-3.5" aria-hidden /> আরও কোর্স দেখুন
          </Link>
          <BandTitle as="h1" now className="mt-6">
            ভর্তি <Turn>নিশ্চিত</Turn> করুন।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            এক ফর্মে নাম, মোবাইল, ব্যাচ আর পেমেন্ট। বিভাগে যোগও এখানেই হয়ে যায়।
          </p>
        </div>
      </Band>

      {!hydrated ? (
        <Band id="form" n={2} label="ভর্তির ফর্ম">
          <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_26rem]">
            <span aria-hidden className="h-96 animate-pulse bg-(--c-bg)" />
            <span aria-hidden className="h-72 animate-pulse bg-(--c-bg)" />
          </div>
        </Band>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <Band
          id="form"
          n={2}
          label="ভর্তির ফর্ম"
          note={
            <>
              <Num value={items.length} />
              টি কোর্স
            </>
          }
        >
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(confirm)} className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_26rem]">
              <div className="flex flex-col gap-px">
                <Step n={1} title="ভর্তির তথ্য" sub="শিক্ষক এই তথ্য দিয়েই আপনার সাথে যোগাযোগ করবেন।">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>পুরো নাম</FormLabel>
                          <FormControl>
                            <Input autoComplete="name" className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage className={messageClass} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>মোবাইল নম্বর</FormLabel>
                          <FormControl>
                            <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="০১৭১২৩৪৫৬৭৮" className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage className={messageClass} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>জেলা</FormLabel>
                          <FormControl>
                            <Input autoComplete="address-level2" placeholder="যেমন শেরপুর" className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage className={messageClass} />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel className={labelClass}>ইমেইল</FormLabel>
                      <Input value={account?.email ?? "দেওয়া নেই"} readOnly disabled className={fieldClass} />
                    </FormItem>
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className={labelClass}>
                            কেন শিখতে চান? <span className="font-normal text-(--c-faint)">(ইচ্ছে হলে)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea rows={2} maxLength={200} placeholder="এক লাইনে — শিক্ষক আপনাকে চিনে নেবেন" className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage className={messageClass} />
                        </FormItem>
                      )}
                    />
                  </div>
                </Step>

                <Step n={2} title="ব্যাচ ও ক্লাসের সময়" sub="একই কোর্স একাধিক ব্যাচে চলে — যে সময়টা আপনার সুবিধা, সেটা বেছে নিন। এই ব্যাচের ক্লাসরুমেই ঢুকবেন।">
                  <div className="space-y-6">
                    {items.map((c) => (
                      <BatchPicker key={c.id} course={c} batches={batchesOf(c)} chosen={batchFor(c)} onPick={(id) => setPicked((p) => ({ ...p, [c.id]: id }))} showTitle={items.length > 1} />
                    ))}
                  </div>
                </Step>

                <Step n={3} title="পেমেন্ট" sub={total > 0 ? "টাকা এসক্রোতে থাকে; ক্লাস হলে শিক্ষক পান, না হলে ফেরত।" : "এই কোর্সগুলো বিনা ফির — কিছু দিতে হবে না।"}>
                  {total > 0 ? (
                    <>
                      <PayMethods value={chosen} onChange={setMethod} available={available} due={total} name="checkout-pay" />
                      <p className="hud mt-3 text-(--c-faint)">ডেমো: এখানে আসল টাকা কাটা হয় না, লেনদেনটা শুধু মাটির ব্যাংকে ওঠে।</p>
                    </>
                  ) : (
                    <p className="flex items-center gap-2 text-sm font-semibold text-(--c-good)">
                      <ShieldCheck className="size-4.5" aria-hidden /> বিনা ফি
                    </p>
                  )}
                </Step>

                <Step n={4} title="নিয়মে সম্মতি">
                  <ul className="border-t border-(--c-line) text-(--c-ink)">
                    <li className="border-b border-(--c-line) py-2.5">
                      <Num value={COURSE_DAYS} /> দিনের কোর্স — প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, শেষে প্রজেক্ট আর প্যানেল
                    </li>
                    <li className="border-b border-(--c-line) py-2.5">
                      ফাইনালে বসতে অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরা আর <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ
                    </li>
                    <li className="border-b border-(--c-line) py-2.5">শিক্ষক নিয়ে অভিযোগ নাম গোপন রেখে করা যায়; প্যানেল খতিয়ে দেখে</li>
                  </ul>
                  <FormField
                    control={form.control}
                    name="agree"
                    render={({ field }) => (
                      <FormItem className="mt-5">
                        <label className="flex cursor-pointer items-start gap-3 border border-(--c-line-strong) p-4 font-semibold text-(--c-ink-strong) transition-colors duration-150 has-checked:border-(--c-signal) has-checked:bg-(--c-bg-sunken)">
                          <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} onBlur={field.onBlur} ref={field.ref} className="mt-0.5 size-5 shrink-0 accent-(--c-signal)" />
                          নিয়মগুলো পড়েছি, মেনে চলব
                        </label>
                        <FormMessage className={messageClass} />
                      </FormItem>
                    )}
                  />
                </Step>

                <div className="bg-(--c-bg) p-6 md:p-10">
                  <button type="submit" disabled={ready.length === 0 || form.formState.isSubmitting} className={cn(primaryBtn, "h-14 w-full text-base")}>
                    {total > 0 ? (
                      <>
                        <Taka amount={total} /> দিয়ে ভর্তি নিশ্চিত করুন
                      </>
                    ) : (
                      "ভর্তি নিশ্চিত করুন"
                    )}
                  </button>
                  <p className="hud mt-3 text-center text-(--c-faint)">বোতাম চাপলে আপনি কাণ্ডারী তৈরি একাডেমির নিয়মে রাজি হচ্ছেন। ফি থাকে এসক্রোতে।</p>
                </div>
              </div>

              <Summary items={items} batchFor={batchFor} joinsNew={joinsNew} subtotal={subtotal} charge={charge} total={total} />
            </form>
          </Form>
        </Band>
      )}
    </>
  );
}

/** A numbered step of the checkout, as a ruled cell. */
function Step({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="bg-(--c-bg) p-6 md:p-10">
      <header className="mb-6 flex items-start gap-4">
        <span className="display grid size-10 shrink-0 place-items-center bg-(--c-invert-bg) text-lg text-(--c-invert-fg)">
          <Num value={n} />
        </span>
        <div>
          <h2 id={`step-${n}`} className="display text-xl leading-snug text-(--c-ink-strong)">
            {title}
          </h2>
          {sub && <p className="mt-1 text-sm leading-relaxed text-(--c-muted)">{sub}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** One course's batches as square choices: number and stage, the weekly slot, the start and the seats left. */
function BatchPicker({ course, batches, chosen, onPick, showTitle }: { course: Course; batches: Batch[]; chosen?: Batch; onPick: (id: string) => void; showTitle: boolean }) {
  return (
    <fieldset>
      <legend className={cn("hud mb-3 text-(--c-faint)", !showTitle && "sr-only")}>{course.title}</legend>
      <div className="grid gap-px border border-(--c-line) bg-(--c-line) sm:grid-cols-2">
        {batches.map((b) => {
          const open = joinable(b);
          const on = chosen?.id === b.id;
          const stage = batchStage(b, DEMO_NOW);
          return (
            <label
              key={b.id}
              className={cn(
                "relative flex flex-col gap-1.5 p-4 transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-(--c-signal)",
                on ? "cursor-pointer bg-(--c-invert-bg) text-(--c-invert-fg)" : open ? "cursor-pointer bg-(--c-bg) text-(--c-ink) hover:bg-(--c-bg-raised)" : "cursor-not-allowed bg-(--c-bg) text-(--c-faint)",
              )}
            >
              <input type="radio" name={`batch-${course.id}`} className="sr-only" checked={on} disabled={!open} onChange={() => onPick(b.id)} />
              <span className="flex items-center justify-between gap-2">
                <span className="display text-base">
                  ব্যাচ <Num value={b.n} />
                </span>
                <span className={cn("hud px-1.5 py-px font-bold", stage === "running" ? "bg-(--c-signal) text-black" : "border border-current")}>{BATCH_STAGES[stage]}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Clock className="size-3.5" aria-hidden /> {slotOf(b.day, b.time)}
              </span>
              <span className="hud opacity-75">
                শুরু <DateText iso={b.starts} /> ·{" "}
                {open ? (
                  <>
                    <Num value={seatsLeft(b)} />
                    টি আসন বাকি
                  </>
                ) : (
                  "আসন পূর্ণ"
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The order: each course with its batch and fee, then the totals and the escrow promise; held in view on a laptop. */
function Summary({ items, batchFor, joinsNew, subtotal, charge, total }: { items: Course[]; batchFor: (c: Course) => Batch | undefined; joinsNew: string[]; subtotal: number; charge: number; total: number }) {
  return (
    <div className="order-first bg-(--c-bg) lg:order-0">
      <aside aria-labelledby="summary" className="lg:sticky lg:top-24">
        <h2 id="summary" className="flex items-center justify-between border-b border-(--c-line) px-6 py-4">
          <span className="display text-lg text-(--c-ink-strong)">অর্ডার</span>
          <span className="hud text-(--c-faint)">
            <Num value={items.length} />
            টি কোর্স
          </span>
        </h2>
        <ul>
          {items.map((c) => {
            const dept = getDepartment(c.dept);
            const batch = batchFor(c);
            return (
              <li key={c.id} className="border-b border-(--c-line) px-6 py-4">
                <div className="flex gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden bg-(--c-bg-sunken)">
                    <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/media/academy/course/${c.id}`} className="line-clamp-2 text-sm leading-snug font-bold text-(--c-ink-strong) underline-offset-4 hover:underline">
                      {c.title}
                    </Link>
                    <p className="hud mt-1 truncate text-(--c-faint)">{dept?.academy.name}</p>
                    {batch && (
                      <p className="hud mt-0.5 text-(--c-faint)">
                        ব্যাচ <Num value={batch.n} /> · শুরু <DateText iso={batch.starts} />
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={cn("text-sm font-bold tabular-nums", c.fee === 0 ? "text-(--c-good)" : "text-(--c-ink-strong)")}>{c.fee === 0 ? "বিনা ফি" : <Taka amount={c.fee} />}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(c.id)}
                      className="grid size-7 place-items-center text-(--c-faint) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                      aria-label={`${c.title} কার্ট থেকে সরান`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
                {!batch ? (
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed font-semibold text-(--c-bad)">
                    <AlertTriangle className="size-4 shrink-0" aria-hidden />
                    কোনো ব্যাচে আসন খালি নেই — এবার বাদ থাকবে। একাডেমি নতুন ব্যাচ খুললে আবার চেষ্টা করুন।
                  </p>
                ) : (
                  joinsNew.includes(c.dept) && (
                    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed font-semibold text-(--c-accent-ink)">
                      <Check className="size-4 shrink-0" aria-hidden />
                      সাথে {dept?.name} বিভাগেও যোগ হবেন — আলাদা কিছু লাগবে না।
                    </p>
                  )
                )}
              </li>
            );
          })}
        </ul>
        <dl className="px-6 py-4 text-sm">
          <div className="flex justify-between py-1">
            <dt className="text-(--c-muted)">কোর্স ফি</dt>
            <dd className="tabular-nums">
              <Taka amount={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-(--c-muted)">সার্ভিস চার্জ (৫%)</dt>
            <dd className="tabular-nums">
              <Taka amount={charge} />
            </dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-(--c-line) pt-4">
            <dt className="font-bold text-(--c-ink-strong)">আজ মোট</dt>
            <dd className="display text-3xl text-(--c-signal) tabular-nums">
              <Taka amount={total} />
            </dd>
          </div>
        </dl>
        <div className="space-y-2.5 border-t border-(--c-line) px-6 py-5 text-sm text-(--c-muted)">
          <p className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-(--c-good)" aria-hidden />
            টাকা এসক্রোতে থাকে — ক্লাস হলে শিক্ষক পান, না হলে ফেরত।
          </p>
          <p className="flex gap-2">
            <Lock className="mt-0.5 size-4.5 shrink-0 text-(--c-accent-ink)" aria-hidden />
            শিক্ষক পান ফির ৯৫%; প্ল্যাটফর্ম রাখে দুই পক্ষে ৫% করে।
          </p>
        </div>
      </aside>
    </div>
  );
}

function EmptyCart() {
  return (
    <Band id="cart" n={2} label="কার্ট" note="এখনো কিছু রাখা হয়নি">
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
        <span className="grid size-16 place-items-center border border-(--c-line) text-(--c-accent-ink)">
          <ShoppingBag className="size-7" aria-hidden />
        </span>
        <h2 className="display mt-6 text-3xl text-(--c-ink-strong)">
          কার্ট <Turn>খালি</Turn>।
        </h2>
        <p className="mt-3 max-w-sm leading-relaxed text-(--c-muted)">কোনো কোর্সের পাতায় “কার্টে রাখুন” বা “ভর্তি হোন” চাপলে এখানে আসবে।</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/media/academy/courses" className={primaryBtn}>
            <BookOpen className="size-4" aria-hidden />
            কোর্স বাছুন
          </Link>
          <Link href="/media/academy/videos" className={secondaryBtn}>
            <PlayCircle className="size-4" aria-hidden />
            বিনামূল্যের ক্লাস
          </Link>
        </div>
      </div>
    </Band>
  );
}
