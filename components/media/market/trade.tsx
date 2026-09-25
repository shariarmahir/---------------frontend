"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Handshake, Lock, ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Listing, PayMethod } from "@/data/media/types";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { assessPrice, type PriceBand } from "@/lib/media/fair-price";
import { computeFees } from "@/lib/media/fees";
import { offerSchema, type OfferInput } from "@/lib/media/schemas";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { startDeal } from "../hire/start-deal";
import { mediaButton } from "../ui/button-styles";
import { Taka } from "../ui/numerals";
import { defaultMethod, escrowTxn, payBn, PayPicker } from "../wallet/pay";
import { useWallet } from "../wallet/use-wallet";

type TradeListing = Pick<Listing, "id" | "title" | "price" | "unit" | "negotiable" | "floor" | "seller">;

/** The buyer's side of the money, always itemised. */
export function BuyerFees({ price, className }: { price: number; className?: string }) {
  const f = computeFees(price);
  return (
    <dl className={cn("space-y-1.5 rounded-xl bg-slate-50 p-3.5 text-sm", className)}>
      <div className="flex justify-between gap-3"><dt className="text-text-secondary">দাম</dt><dd><Taka amount={f.price} /></dd></div>
      <div className="flex justify-between gap-3">
        <dt className="text-text-secondary">সেবা চার্জ ৫% <span className="text-xs">(পেমেন্ট গেটওয়েসহ)</span></dt>
        <dd><Taka amount={f.buyerCharge} /></dd>
      </div>
      <div className="flex justify-between gap-3 border-t border-card-border pt-1.5 font-bold">
        <dt>আপনি দেবেন</dt>
        <dd className="text-bd-green-dark"><Taka amount={f.buyerPays} /></dd>
      </div>
      <p className="pt-1 text-xs text-text-muted">বিক্রেতা পাবেন <Taka amount={f.sellerReceives} /> (তাঁর দিক থেকে ৫% প্ল্যাটফর্ম ফি)।</p>
    </dl>
  );
}

export function BuyDialog({ listing, open, onOpenChange }: { listing: TradeListing; open: boolean; onOpenChange: (o: boolean) => void }) {
  const f = computeFees(listing.price);
  const { available } = useWallet();
  const [picked, setPicked] = useState<PayMethod | null>(null);
  const method = picked === "wallet" && available < f.buyerPays ? "bkash" : (picked ?? defaultMethod(available, f.buyerPays));
  const [done, setDone] = useState<PayMethod | null>(null);

  function confirm() {
    updateMedia((s) => ({
      ...s,
      txns: [escrowTxn({ id: newId("x"), at: new Date().toISOString(), label: `কেনা — ${listing.title}`, price: listing.price, method }), ...s.txns],
    }));
    setDone(method);
    toast.success("অর্ডার হয়েছে", { description: "টাকা এসক্রোতে আছে — পণ্য বুঝে পেলে বিক্রেতা পাবেন।" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setDone(null);
          setPicked(null);
        }
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">{done ? "অর্ডার নিশ্চিত" : "কিনুন"}</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">{listing.title}</DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="space-y-4" role="status">
            <p className="flex gap-2 rounded-xl bg-bd-green-light p-3 text-sm text-bd-green-dark">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <Taka amount={f.buyerPays} /> {payBn[done]} থেকে এসক্রোতে জমা হয়েছে। পণ্য বা কাজ বুঝে পেয়ে নিশ্চিত করলে তবেই বিক্রেতার কাছে যাবে।
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/media/wallet" className={mediaButton({ variant: "quiet" })}>ওয়ালেটে দেখুন</Link>
              <button type="button" onClick={() => onOpenChange(false)} className={mediaButton({ variant: "green" })}>ঠিক আছে</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <BuyerFees price={listing.price} />
            <PayPicker value={method} onChange={setPicked} available={available} due={f.buyerPays} />
            <button type="button" onClick={confirm} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
              <ShoppingBag aria-hidden /> <Taka amount={f.buyerPays} /> পরিশোধ করুন
            </button>
            <p className="text-center text-xs text-text-muted">ডেমো: আসল টাকা কাটা হবে না।</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}

export function OfferDialog({
  listing,
  band,
  open,
  onOpenChange,
}: {
  listing: TradeListing;
  band: PriceBand;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const form = useForm<OfferInput>({ resolver: zodResolver(offerSchema), defaultValues: { amount: 0 } });
  const amount = useWatch({ control: form.control, name: "amount" });
  const verdict = amount ? assessPrice(amount, band) : null;

  function onSubmit(v: OfferInput) {
    if (v.amount >= listing.price) {
      form.setError("amount", { message: "এটা চাওয়া দামের সমান বা বেশি — সরাসরি কিনুন।" });
      return;
    }
    const id = startDeal({
      with: listing.seller,
      kind: "offer",
      subject: listing.title,
      listingId: listing.id,
      ask: listing.price,
      floor: listing.floor,
      amount: v.amount,
      firstMessage: `“${listing.title}”-এর জন্য দাম প্রস্তাব করছি।`,
    });
    onOpenChange(false);
    router.push(`/media/messages?t=${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">দাম প্রস্তাব করুন</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            চাওয়া দাম <Taka amount={listing.price} />। সর্বোচ্চ তিনবার প্রস্তাব দেওয়া যায়; বিক্রেতা রাজি, পাল্টা দাম বা না বলবেন।
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>আপনার প্রস্তাব (৳)</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" autoFocus className="h-12 text-lg font-bold tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    {[0.85, 0.9, 0.95].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => form.setValue("amount", Math.round((listing.price * r) / 10) * 10, { shouldValidate: true })}
                        className="mr-1.5 mt-1 inline-flex min-h-8 items-center rounded-full border border-card-border px-2.5 text-xs font-semibold text-text-secondary hover:border-bd-green/40 hover:text-bd-green"
                      >
                        <Taka amount={Math.round((listing.price * r) / 10) * 10} />
                      </button>
                    ))}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {verdict === "unfair" && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-national-crimson">
                এই দাম এ ধরনের কাজের ন্যায্য দামের অনেক নিচে — সম্ভবত প্রত্যাখ্যাত হবে।
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

/** Buy / Make offer buttons with their dialogs. */
export function TradeButtons({ listing, band, size = "sm", stacked }: { listing: TradeListing; band: PriceBand; size?: "sm" | "md" | "lg"; stacked?: boolean }) {
  const [buy, setBuy] = useState(false);
  const [offer, setOffer] = useState(false);
  if (listing.seller === CURRENT_USER_HANDLE) {
    return (
      <p className="relative z-10 flex min-h-10 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-semibold text-text-secondary">
        <Store className="size-4.5 text-bd-green" aria-hidden /> আপনার তালিকা — ক্রেতারা এখান থেকে কিনবেন
      </p>
    );
  }
  return (
    <>
      <div className={cn("relative z-10 grid gap-2", listing.negotiable ? "grid-cols-2" : "grid-cols-1", stacked && "grid-cols-1")}>
        <button type="button" onClick={() => setBuy(true)} className={mediaButton({ variant: "primary", size })}>
          <ShoppingBag aria-hidden /> কিনুন
        </button>
        {listing.negotiable && (
          <button type="button" onClick={() => setOffer(true)} className={mediaButton({ variant: "outline", size })}>
            <Handshake aria-hidden /> দর প্রস্তাব
          </button>
        )}
      </div>
      <BuyDialog listing={listing} open={buy} onOpenChange={setBuy} />
      {listing.negotiable && <OfferDialog listing={listing} band={band} open={offer} onOpenChange={setOffer} />}
    </>
  );
}
