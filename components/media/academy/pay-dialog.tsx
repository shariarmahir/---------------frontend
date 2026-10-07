"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PayMethod } from "@/data/media/types";
import { computeFees } from "@/lib/media/fees";
import { newId, updateMedia } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { Taka } from "../ui/numerals";
import { defaultMethod, escrowTxn, PayPicker } from "../wallet/pay";
import { useWallet } from "../wallet/use-wallet";

/**
 * Paying a course or workshop fee. The money waits in escrow and reaches the
 * teacher once the classes happen; the learner pays the platform's 5% on top.
 */
export function PayDialog({
  open,
  onOpenChange,
  title,
  label,
  price,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** The wallet row's label. */
  label: string;
  price: number;
  onPaid: (method: PayMethod) => void;
}) {
  const { available } = useWallet();
  const fees = computeFees(price);
  const [method, setMethod] = useState<PayMethod>(() => defaultMethod(available, fees.buyerPays));

  function pay() {
    const txn = escrowTxn({ id: newId("esc"), label: `${label} — এসক্রোতে জমা`, price, method, at: new Date().toISOString() });
    updateMedia((s) => ({ ...s, txns: [txn, ...s.txns] }));
    onPaid(method);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl bg-m-card font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-m-ink">{title}</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/80">টাকা এসক্রোতে থাকবে; ক্লাস হলে শিক্ষক পাবেন, না হলে ফেরত।</DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 rounded-xl bg-white/65 p-4 text-sm">
          <div className="flex justify-between"><dt className="text-m-ink/75">ফি</dt><dd className="tabular-nums text-m-ink"><Taka amount={fees.price} /></dd></div>
          <div className="flex justify-between"><dt className="text-m-ink/75">সার্ভিস চার্জ (৫%)</dt><dd className="tabular-nums text-m-ink"><Taka amount={fees.buyerCharge} /></dd></div>
          <div className="flex justify-between border-t border-m-ink/9 pt-2 font-bold"><dt className="text-m-ink">মোট</dt><dd className="tabular-nums text-m-blue"><Taka amount={fees.buyerPays} /></dd></div>
        </dl>
        <PayPicker value={method} onChange={setMethod} available={available} due={fees.buyerPays} />
        <p className="flex gap-2 text-xs leading-relaxed text-m-ink/70">
          <ShieldCheck className="size-4 shrink-0 text-m-blue" aria-hidden />
          শিক্ষক পান ফির ৯৫%। অভিযোগ প্রমাণিত হলে বাকি টাকা ফেরত আসে।
        </p>
        <button type="button" onClick={pay} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
          <Taka amount={fees.buyerPays} /> দিন
        </button>
      </DialogContent>
    </Dialog>
  );
}
