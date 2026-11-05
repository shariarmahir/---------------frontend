"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { PayMethod } from "@/data/media/types";
import { computeFees } from "@/lib/media/fees";
import { newId, updateMedia } from "@/lib/media/store";
import { Taka } from "../ui/numerals";
import { defaultMethod, escrowTxn } from "../wallet/pay";
import { useWallet } from "../wallet/use-wallet";
import { primaryBtn } from "./catalogue/buttons";
import { Modal } from "./catalogue/modal";
import { PayMethods } from "./catalogue/pay-methods";

/**
 * Paying a workshop fee, in the catalogue's dialog. The money waits in
 * escrow and reaches the teacher once the class happens; the learner pays
 * the platform's 5% on top.
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
    <Modal open={open} onClose={() => onOpenChange(false)} label={title}>
      <div className="border-b border-(--c-line) px-6 py-5 pr-14">
        <p className="hud text-(--c-faint)">এসক্রোতে জমা</p>
        <h2 className="display mt-2 text-xl leading-snug text-(--c-ink-strong)">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">টাকা এসক্রোতে থাকবে; ক্লাস হলে শিক্ষক পাবেন, না হলে ফেরত।</p>
      </div>
      <div className="space-y-6 px-6 py-6">
        <dl className="border-t border-(--c-line) text-sm">
          <div className="flex justify-between border-b border-(--c-line) py-2.5">
            <dt className="text-(--c-muted)">ফি</dt>
            <dd className="tabular-nums">
              <Taka amount={fees.price} />
            </dd>
          </div>
          <div className="flex justify-between border-b border-(--c-line) py-2.5">
            <dt className="text-(--c-muted)">সার্ভিস চার্জ (৫%)</dt>
            <dd className="tabular-nums">
              <Taka amount={fees.buyerCharge} />
            </dd>
          </div>
          <div className="flex justify-between border-b border-(--c-line) py-2.5 font-bold">
            <dt className="text-(--c-ink-strong)">মোট</dt>
            <dd className="text-(--c-signal) tabular-nums">
              <Taka amount={fees.buyerPays} />
            </dd>
          </div>
        </dl>
        <PayMethods value={method} onChange={setMethod} available={available} due={fees.buyerPays} />
        <p className="flex gap-2 text-xs leading-relaxed text-(--c-muted)">
          <ShieldCheck className="size-4 shrink-0 text-(--c-accent-ink)" aria-hidden />
          শিক্ষক পান ফির ৯৫%। অভিযোগ প্রমাণিত হলে বাকি টাকা ফেরত আসে।
        </p>
        <button type="button" onClick={pay} className={`${primaryBtn} w-full`}>
          <Taka amount={fees.buyerPays} /> দিন
        </button>
      </div>
    </Modal>
  );
}
