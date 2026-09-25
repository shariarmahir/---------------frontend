"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Clock, Handshake, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PriceBand } from "@/lib/media/fair-price";
import { assessPrice } from "@/lib/media/fair-price";
import { hireSchema, type HireInput } from "@/lib/media/schemas";
import { mediaButton } from "../ui/button-styles";
import { Taka } from "../ui/numerals";
import { startDeal } from "./start-deal";

export interface HireTarget {
  handle: string;
  nameBn: string;
  services: string[];
  rate?: { amount: number; unit: string };
  band: PriceBand;
  responseTime: string;
  threadId?: string;
}

function toNumber(raw: string): number | undefined {
  const n = Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, ""));
  return n || undefined;
}

export function HireDialog({ target, open, onOpenChange }: { target: HireTarget; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const form = useForm<HireInput>({
    resolver: zodResolver(hireSchema),
    defaultValues: { service: target.services[0] ?? "", brief: "", budget: target.rate?.amount ?? 0, deadline: "" },
  });
  const budget = useWatch({ control: form.control, name: "budget" });
  const verdict = budget ? assessPrice(budget, target.band) : null;

  function onSubmit(v: HireInput) {
    const ask = target.rate?.amount ?? v.budget;
    const id = startDeal({
      with: target.handle,
      kind: "hire",
      subject: v.service,
      ask,
      floor: Math.round(ask * 0.85),
      amount: v.budget,
      brief: v.brief,
      deadline: v.deadline,
      firstMessage: `কাজের প্রস্তাব — ${v.service}\n\n${v.brief}`,
    });
    onOpenChange(false);
    toast.success("প্রস্তাব পাঠানো হয়েছে", { description: `${target.nameBn} সাধারণত ${target.responseTime} উত্তর দেন।` });
    router.push(`/media/messages?t=${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">{target.nameBn}-কে হায়ার করুন</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-text-secondary">
            প্রস্তাব পাঠালে দরদামের একটি কথোপকথন খুলবে। দুজনে রাজি হলে চুক্তি নিশ্চিত করবেন, টাকা এসক্রোতে থাকবে — কাজ বুঝে পেলে ছাড়।
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>কোন কাজ</FormGroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {target.services.map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={field.value === s}
                        onClick={() => field.onChange(s)}
                        className={
                          field.value === s
                            ? "min-h-10 rounded-xl border-2 border-bd-green bg-bd-green-light px-3 text-sm font-semibold text-bd-green-dark"
                            : "min-h-10 rounded-xl border-2 border-card-border px-3 text-sm font-semibold text-text-secondary hover:border-slate-300"
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brief"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>কাজের বিবরণ</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="কী চান, কোথায়, কী ডেলিভারি হবে — যত পরিষ্কার, তত ভালো দাম।" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>আপনার বাজেট (৳)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" className="tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value) ?? 0)} />
                    </FormControl>
                    {target.rate && (
                      <FormDescription>
                        {target.nameBn}-এর রেট <Taka amount={target.rate.amount} /> {target.rate.unit}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>কবের মধ্যে</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {verdict === "unfair" && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-national-crimson">
                এই বাজেট এই কাজের ন্যায্য দামের (<Taka amount={target.band.low} />–<Taka amount={target.band.high} />) অনেক নিচে। কম দামে শ্রম কেনা এই প্ল্যাটফর্মের নিয়মের বিরুদ্ধে।
              </p>
            )}
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
              <Handshake aria-hidden /> প্রস্তাব পাঠান
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The profile's hire call to action. Sticky side card on desktop, fixed bar
 * above the tab bar on phones — always one tap away while scrolling.
 */
export function HireBar({ target }: { target: HireTarget }) {
  const [open, setOpen] = useState(false);
  const message = `/media/messages${target.threadId ? `?t=${target.threadId}` : ""}`;
  return (
    <>
      <div id="hire" className="hidden scroll-mt-24 rounded-2xl border border-card-border bg-white p-5 lg:block">
        {target.rate && (
          <p className="text-2xl font-bold text-text-primary">
            <Taka amount={target.rate.amount} />
            <span className="ml-1 text-sm font-medium text-text-muted">/ {target.rate.unit}</span>
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
          <Clock className="size-4" aria-hidden /> সাধারণত {target.responseTime} উত্তর দেন
        </p>
        <div className="mt-4 space-y-2">
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            <BriefcaseBusiness aria-hidden /> হায়ার করুন
          </button>
          <Link href={message} className={mediaButton({ variant: "quiet", className: "w-full" })}>
            <MessageCircle aria-hidden /> বার্তা পাঠান
          </Link>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-text-muted">টাকা এসক্রোতে থাকে; কাজ বুঝে পেলে ছাড়। প্ল্যাটফর্মের বাইরে অগ্রিম দেবেন না।</p>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-card-border bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          {target.rate && (
            <p className="min-w-0 flex-1 leading-tight">
              <span className="block text-base font-bold text-text-primary">
                <Taka amount={target.rate.amount} />
              </span>
              <span className="block truncate text-xs text-text-muted">{target.rate.unit}</span>
            </p>
          )}
          <Link href={message} className={mediaButton({ variant: "quiet", size: "icon", className: "size-11" })}>
            <MessageCircle aria-hidden />
            <span className="sr-only">বার্তা</span>
          </Link>
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary", className: target.rate ? "" : "flex-1" })}>
            <BriefcaseBusiness aria-hidden /> হায়ার করুন
          </button>
        </div>
      </div>

      <HireDialog target={target} open={open} onOpenChange={setOpen} />
    </>
  );
}
