"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight, Lock, PackageCheck, QrCode, ShoppingBag, Smartphone, Undo2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormGroup, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Txn, TxnKind, WalletSeed } from "@/data/media/types";
import { MIN_WITHDRAW, withdrawSchema, type WithdrawInput } from "@/lib/media/schemas";
import { newId, updateMedia, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Ago, Taka } from "../ui/numerals";
import { WalletSkeleton } from "../ui/skeletons";
import { payBn, releaseEscrow } from "./pay";
import { useWallet } from "./use-wallet";

const kindInfo: Record<TxnKind, { bn: string; Icon: LucideIcon }> = {
  sale: { bn: "বিক্রি", Icon: ArrowDownLeft },
  release: { bn: "কাজের টাকা", Icon: ArrowDownLeft },
  purchase: { bn: "কেনা", Icon: ShoppingBag },
  escrow: { bn: "এসক্রো", Icon: Lock },
  withdraw: { bn: "উত্তোলন", Icon: ArrowUpRight },
  refund: { bn: "ফেরত", Icon: Undo2 },
};

const statusBn = { done: "সম্পন্ন", pending: "প্রক্রিয়াধীন", held: "এসক্রোতে" } as const;

const methods = [
  { key: "bkash", bn: "বিকাশ", Icon: Smartphone },
  { key: "nagad", bn: "নগদ", Icon: Smartphone },
  { key: "banglaqr", bn: "বাংলা কিউআর", Icon: QrCode },
] as const;

function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}

function TxnRow({ t, live }: { t: Txn; live?: boolean }) {
  const k = kindInfo[t.kind];
  // Paid from outside the wallet: the balance didn't move, but show the bill.
  const outside = t.paidVia !== undefined && t.paidVia !== "wallet";
  const amount = outside ? -(t.gross + t.fee) : t.net;
  const incoming = amount >= 0;
  return (
    <li className="flex gap-3 py-3.5">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", incoming ? "bg-bd-green-light text-bd-green" : "bg-slate-100 text-text-secondary")}>
        <k.Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-semibold text-text-primary">{t.label}</p>
          <p className={cn("shrink-0 text-sm font-bold", incoming ? "text-bd-green" : "text-text-primary")}>
            {incoming ? "+" : ""}
            <Taka amount={amount} />
          </p>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
          {k.bn} · <Ago iso={t.at} live={live} />
          {outside && t.paidVia && <span>· {payBn[t.paidVia]} থেকে</span>}
          {t.status !== "done" && <span className={cn("rounded-full px-1.5 font-semibold", t.status === "held" ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-700")}>{statusBn[t.status]}</span>}
        </p>
        {t.feeSide !== "none" && (
          <p className="mt-1.5 inline-flex flex-wrap items-center gap-x-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs text-text-secondary">
            দাম <Taka amount={t.gross} />
            <span aria-hidden>·</span>
            {t.feeSide === "seller" ? "প্ল্যাটফর্ম ফি ৫%" : "ক্রেতার সেবা চার্জ ৫%"} <span className="font-semibold text-text-primary"><Taka amount={t.fee} /></span>
          </p>
        )}
        {t.feeSide === "none" && t.kind === "withdraw" && <p className="mt-1 text-xs text-text-muted">উত্তোলনে কোনো ফি নেই</p>}
        {t.kind === "escrow" && t.status === "held" && (
          <button
            type="button"
            onClick={() => {
              releaseEscrow(t);
              toast.success("টাকা ছাড় হয়েছে", { description: "বিক্রেতা এখন টাকা পাবেন।" });
            }}
            className={mediaButton({ variant: "quiet", size: "sm", className: "mt-2" })}
          >
            <PackageCheck aria-hidden /> বুঝে পেয়েছি — টাকা ছাড়ুন
          </button>
        )}
      </div>
    </li>
  );
}

function WithdrawDialog({ available, linked, open, onOpenChange }: { available: number; linked: WalletSeed["linked"]; open: boolean; onOpenChange: (o: boolean) => void }) {
  const schema = useMemo(() => withdrawSchema(available), [available]);
  const form = useForm<WithdrawInput>({ resolver: zodResolver(schema), defaultValues: { method: "bkash", account: "", amount: 0 } });
  const method = useWatch({ control: form.control, name: "method" });

  function onSubmit(v: WithdrawInput) {
    const m = methods.find((x) => x.key === v.method)!;
    updateMedia((s) => ({
      ...s,
      txns: [
        { id: newId("w"), at: new Date().toISOString(), kind: "withdraw", label: `উত্তোলন — ${m.bn}`, gross: v.amount, fee: 0, feeSide: "none", net: -v.amount, status: "pending", method: v.method },
        ...s.txns,
      ],
    }));
    onOpenChange(false);
    form.reset();
    toast.success("উত্তোলনের অনুরোধ হয়েছে", { description: `${m.bn}-এ সাধারণত ২৪ ঘণ্টার মধ্যে পৌঁছায়।` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">টাকা তুলুন</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            তোলা যাবে <Taka amount={available} />। উত্তোলনে ফি নেই।
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>কোথায় পাঠাবেন</FormGroupLabel>
                  <FormGroup className="grid grid-cols-3 gap-2">
                    {methods.map(({ key, bn, Icon }) => (
                      <label
                        key={key}
                        className={cn(
                          "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-bd-green/30",
                          field.value === key ? "border-bd-green bg-bd-green-light text-bd-green-dark" : "border-card-border text-text-secondary hover:border-slate-300",
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={field.name}
                          checked={field.value === key}
                          onChange={() => {
                            field.onChange(key);
                            form.setValue("account", key === "banglaqr" ? linked.banglaqr : "");
                            form.clearErrors("account");
                          }}
                        />
                        <Icon className="size-5" aria-hidden />
                        {bn}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{method === "banglaqr" ? "যুক্ত অ্যাকাউন্ট" : `${method === "bkash" ? "বিকাশ" : "নগদ"} নম্বর`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={method === "banglaqr"}
                      inputMode={method === "banglaqr" ? undefined : "tel"}
                      autoComplete={method === "banglaqr" ? "off" : "tel"}
                      placeholder="০১৭১২৩৪৫৬৭৮"
                      className="tabular-nums"
                    />
                  </FormControl>
                  <FormDescription>
                    {method === "banglaqr" ? "যেকোনো ব্যাংক অ্যাপের বাংলা কিউআর অ্যাকাউন্টে যাবে।" : "যে নম্বরের অ্যাকাউন্ট আপনার নামে।"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পরিমাণ (৳)</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" className="h-12 text-lg font-bold tabular-nums" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} />
                  </FormControl>
                  <div className="flex gap-1.5">
                    {[1000, 5000].map((a) => (
                      <button key={a} type="button" onClick={() => form.setValue("amount", Math.min(a, available), { shouldValidate: true })} className={mediaButton({ variant: "quiet", size: "sm" })}>
                        <Taka amount={a} />
                      </button>
                    ))}
                    <button type="button" onClick={() => form.setValue("amount", available, { shouldValidate: true })} className={mediaButton({ variant: "quiet", size: "sm" })}>
                      সব
                    </button>
                  </div>
                  <FormDescription>
                    সর্বনিম্ন <Taka amount={MIN_WITHDRAW} />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
              <ArrowUpRight aria-hidden /> পাঠান
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function WalletView({ seed }: { seed: WalletSeed }) {
  const hydrated = useHydrated();
  const w = useWallet(seed);
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(params.get("withdraw") === "1");

  if (!hydrated) return <WalletSkeleton />;
  const seedIds = new Set(seed.txns.map((t) => t.id));

  const fees = w.txns.reduce((n, t) => n + t.fee, 0);
  const groups: { key: string; bn: string; kinds?: TxnKind[] }[] = [
    { key: "all", bn: "সব" },
    { key: "in", bn: "আয়", kinds: ["sale", "release", "refund"] },
    { key: "out", bn: "খরচ", kinds: ["purchase", "escrow"] },
    { key: "withdraw", bn: "উত্তোলন", kinds: ["withdraw"] },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-bd-green p-5 text-white sm:p-6">
        <p className="text-sm text-white/85">তোলা যাবে</p>
        <p className="mt-1 text-4xl font-bold">
          <Taka amount={w.available} />
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1 text-white/75"><Lock className="size-3.5" aria-hidden />এসক্রোতে</dt>
            <dd className="font-bold"><Taka amount={w.escrow} /></dd>
          </div>
          <div>
            <dt className="text-white/75">মোট আয়</dt>
            <dd className="font-bold"><Taka amount={w.lifetime} /></dd>
          </div>
          <div>
            <dt className="text-white/75">দেওয়া ফি (সব লেনদেনে)</dt>
            <dd className="font-bold"><Taka amount={fees} /></dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary" })}>
            <ArrowUpRight aria-hidden /> টাকা তুলুন
          </button>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3 text-xs text-white/85">
            বিকাশ {seed.linked.bkash} · নগদ {seed.linked.nagad}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-card-border bg-white p-4 sm:p-6">
        <Tabs defaultValue="all">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-text-primary">লেনদেন</h2>
            <TabsList>
              {groups.map((g) => (
                <TabsTrigger key={g.key} value={g.key}>
                  {g.bn}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {groups.map((g) => {
            const rows = w.txns.filter((t) => !g.kinds || g.kinds.includes(t.kind));
            return (
              <TabsContent key={g.key} value={g.key}>
                {rows.length === 0 ? (
                  <div className="pt-4"><EmptyState icon="wallet" title="এই ধরনের লেনদেন নেই" /></div>
                ) : (
                  <ul className="divide-y divide-card-border">
                    {rows.map((t) => (
                      <TxnRow key={t.id} t={t} live={!seedIds.has(t.id)} />
                    ))}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      <WithdrawDialog
        available={w.available}
        linked={seed.linked}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o && params.get("withdraw")) router.replace("/media/wallet", { scroll: false });
        }}
      />
    </div>
  );
}
