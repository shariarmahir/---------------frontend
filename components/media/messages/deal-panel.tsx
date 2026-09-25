"use client";

import { useState } from "react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { CalendarDays, CircleCheck, Handshake, Lock, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PayMethod } from "@/data/media/types";
import { computeFees } from "@/lib/media/fees";
import { MAX_BARGAIN_ROUNDS } from "@/lib/media/market";
import { buyerOfferCount, negotiationStatus, type Negotiation } from "@/lib/media/negotiation";
import { offerSchema } from "@/lib/media/schemas";
import { useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { BuyerFees } from "../market/trade";
import { mediaButton } from "../ui/button-styles";
import { Num, Taka } from "../ui/numerals";
import { defaultMethod, payBn, PayPicker } from "../wallet/pay";
import { useWallet } from "../wallet/use-wallet";
import { accept, acceptAsk, book, errorBn, offer, release, type DealThread } from "./deal";

function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}

function OfferInput({ onSubmit, label, remaining }: { onSubmit: (n: number) => string | null; label: string; remaining: number }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = offerSchema.safeParse({ amount: toNumber(draft) });
        if (!parsed.success) return setError(parsed.error.issues[0].message);
        const err = onSubmit(parsed.data.amount);
        if (err) return setError(err);
        setDraft("");
        setError(null);
      }}
      className="space-y-1.5"
    >
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{label}</span>
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-bold text-text-muted">৳</span>
          <Input
            name="offer"
            inputMode="numeric"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            placeholder={label}
            className="h-11 pl-8 font-bold tabular-nums"
          />
        </label>
        <button type="submit" className={mediaButton({ variant: "primary" })}>
          <Handshake aria-hidden /> প্রস্তাব
        </button>
      </div>
      <p className={cn("text-xs", error ? "font-semibold text-national-crimson" : "text-text-muted")} role={error ? "alert" : undefined}>
        {error ?? (
          <>
            আর <Num value={remaining} />টি প্রস্তাব দেওয়া যাবে
          </>
        )}
      </p>
    </form>
  );
}

function AgreementDialog({ thread, n, sellerName, open, onOpenChange }: { thread: DealThread; n: Negotiation; sellerName: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [agree, setAgree] = useState(false);
  const price = n.agreed ?? 0;
  const due = computeFees(price).buyerPays;
  const { available } = useWallet();
  const [picked, setPicked] = useState<PayMethod | null>(null);
  const method = picked === "wallet" && available < due ? "bkash" : (picked ?? defaultMethod(available, due));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">চুক্তি নিশ্চিত করুন</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">নিশ্চিত করলে টাকা এসক্রোতে জমা হবে। কাজ বুঝে পেয়ে আপনি ছাড়লে তবেই {sellerName} পাবেন।</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3 rounded-xl border border-card-border p-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-text-muted">কাজ</dt><dd className="text-right font-semibold">{thread.subject}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-text-muted">কার সাথে</dt><dd className="font-semibold">{sellerName}</dd></div>
          {thread.deadline && (
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">শেষ তারিখ</dt>
              <dd className="inline-flex items-center gap-1 font-semibold"><CalendarDays className="size-4" aria-hidden /><Num value={thread.deadline} /></dd>
            </div>
          )}
          <div className="flex justify-between gap-3"><dt className="text-text-muted">সম্মত দাম</dt><dd className="font-bold"><Taka amount={price} /></dd></div>
        </dl>
        <BuyerFees price={price} />
        <PayPicker name={`pay-${thread.id}`} value={method} onChange={setPicked} available={available} due={due} />
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-bd-green" />
          কাজের বিবরণ, দাম ও সময়ে আমি একমত। সমস্যা হলে প্ল্যাটফর্মের মধ্যস্থতা মেনে নেব।
        </label>
        <button
          type="button"
          disabled={!agree}
          onClick={() => {
            const err = book(thread, n, sellerName, method);
            if (err) return toast.error(errorBn[err]);
            onOpenChange(false);
            toast.success("চুক্তি হয়েছে", { description: `${payBn[method]} থেকে টাকা এসক্রোতে জমা হয়েছে।` });
          }}
          className={mediaButton({ variant: "green", size: "lg", className: "w-full" })}
        >
          <Lock aria-hidden /> নিশ্চিত করে এসক্রোতে জমা দিন
        </button>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The bargaining controls under a conversation — changes with the state of
 * the negotiation: make an offer, answer a counter, confirm the agreement,
 * release payment.
 */
export function DealPanel({ thread, n, sellerName }: { thread: DealThread; n: Negotiation; sellerName: string }) {
  const released = useMediaState((s) => Boolean(s.released[thread.id]));
  const [confirming, setConfirming] = useState(false);
  const status = negotiationStatus(n);
  const used = buyerOfferCount(n);
  const remaining = MAX_BARGAIN_ROUNDS - used;
  const last = n.rounds[n.rounds.length - 1];

  const shell = "border-t border-card-border bg-white px-3 py-3 sm:px-4";

  if (status === "booked") {
    return (
      <div className={shell}>
        {released ? (
          <p className="flex items-center gap-2 rounded-xl bg-bd-green-light px-3 py-2.5 text-sm font-semibold text-bd-green-dark">
            <CircleCheck className="size-5" aria-hidden /> কাজ বুঝে পেয়েছেন — <Taka amount={n.agreed ?? 0} /> {sellerName}-এর কাছে গেছে।
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bd-green/30 bg-bd-green-light/60 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-bd-green-dark">
              <SealCheck size={22} weight="duotone" aria-hidden /> চুক্তি হয়েছে · <Taka amount={n.agreed ?? 0} /> এসক্রোতে
            </p>
            <button
              type="button"
              onClick={() => {
                release(thread);
                toast.success("টাকা ছাড় হয়েছে", { description: `${sellerName}-কে রিভিউ দিতে ভুলবেন না।` });
              }}
              className={mediaButton({ variant: "green", size: "sm" })}
            >
              <PackageCheck aria-hidden /> কাজ বুঝে পেয়েছি
            </button>
          </div>
        )}
      </div>
    );
  }

  if (status === "agreed") {
    return (
      <div className={shell}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-secondary">
            দুজনেই রাজি: <span className="text-base font-bold text-text-primary"><Taka amount={n.agreed ?? 0} /></span>
          </p>
          <button type="button" onClick={() => setConfirming(true)} className={mediaButton({ variant: "primary" })}>
            <Lock aria-hidden /> চুক্তি নিশ্চিত করুন
          </button>
        </div>
        <AgreementDialog thread={thread} n={n} sellerName={sellerName} open={confirming} onOpenChange={setConfirming} />
      </div>
    );
  }

  if (status === "awaiting-seller") {
    return (
      <div className={cn(shell, "flex items-center gap-2 text-sm text-text-muted")} role="status">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="typing-dot size-2 rounded-full bg-bd-green" style={{ ["--i" as string]: i }} />
          ))}
        </span>
        {sellerName} আপনার <Taka amount={last?.amount ?? 0} />-এর প্রস্তাব দেখছেন…
      </div>
    );
  }

  if (status === "countered") {
    return (
      <div className={cn(shell, "space-y-3")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-secondary">
            {sellerName}-এর পাল্টা দাম: <span className="text-base font-bold text-text-primary"><Taka amount={last.amount} /></span>
          </p>
          <button
            type="button"
            onClick={() => {
              const err = accept(thread.id, n);
              if (err) toast.error(errorBn[err]);
            }}
            className={mediaButton({ variant: "green", size: "sm" })}
          >
            <Handshake aria-hidden /> <Taka amount={last.amount} />-এ রাজি
          </button>
        </div>
        {remaining > 0 && <OfferInput label="অথবা নতুন প্রস্তাব" remaining={remaining} onSubmit={(a) => { const e = offer(thread.id, n, a); return e ? errorBn[e] : null; }} />}
      </div>
    );
  }

  if (status === "exhausted") {
    return (
      <div className={cn(shell, "flex flex-wrap items-center justify-between gap-2")}>
        <p className="text-sm text-text-secondary">তিনটি প্রস্তাবই ফিরেছে। চাওয়া দাম <span className="font-bold text-text-primary"><Taka amount={n.ask} /></span></p>
        <button type="button" onClick={() => acceptAsk(thread.id, n)} className={mediaButton({ variant: "primary", size: "sm" })}>
          চাওয়া দামে রাজি
        </button>
      </div>
    );
  }

  // open or declined
  return (
    <div className={cn(shell, "space-y-2")}>
      <p className="text-sm text-text-secondary">
        চাওয়া দাম <span className="font-bold text-text-primary"><Taka amount={n.ask} /></span>
        {status === "declined" && " · আগের প্রস্তাব ফিরেছে"}
      </p>
      <OfferInput label="আপনার প্রস্তাব" remaining={remaining} onSubmit={(a) => { const e = offer(thread.id, n, a); return e ? errorBn[e] : null; }} />
    </div>
  );
}
