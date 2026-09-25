"use client";

import { Landmark, QrCode, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import type { PayMethod, Txn } from "@/data/media/types";
import { computeFees } from "@/lib/media/fees";
import { updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Taka } from "../ui/numerals";

export const payMethods: { key: PayMethod; bn: string; Icon: LucideIcon }[] = [
  { key: "wallet", bn: "ওয়ালেট", Icon: Wallet },
  { key: "bkash", bn: "বিকাশ", Icon: Smartphone },
  { key: "nagad", bn: "নগদ", Icon: Smartphone },
  { key: "banglaqr", bn: "বাংলা কিউআর", Icon: QrCode },
  { key: "card", bn: "কার্ড / ব্যাংক", Icon: Landmark },
];

export const payBn = Object.fromEntries(payMethods.map((m) => [m.key, m.bn])) as Record<PayMethod, string>;

/** The wallet when it covers the bill, otherwise bKash. */
export function defaultMethod(available: number, due: number): PayMethod {
  return available >= due ? "wallet" : "bkash";
}

/**
 * The escrow row a payment creates. Paying from the wallet takes the whole
 * bill out of the balance; an outside method leaves the balance untouched.
 */
export function escrowTxn({ id, label, price, method, at }: { id: string; label: string; price: number; method: PayMethod; at: string }): Txn {
  const f = computeFees(price);
  return {
    id,
    at,
    kind: "escrow",
    label,
    gross: f.price,
    fee: f.buyerCharge,
    feeSide: "buyer",
    net: method === "wallet" ? -f.buyerPays : 0,
    status: "held",
    paidVia: method,
  };
}

/** The conversation an escrow row pays for, if any. */
export function dealOf(t: Txn): string | undefined {
  return t.deal ?? (t.id.startsWith("esc-") ? t.id.slice(4) : undefined);
}

/**
 * Buyer confirms delivery: the escrow row is paid out to the seller. Rows
 * tied to a conversation mark that deal released too, so the chat and the
 * wallet agree whichever side the buyer confirms from.
 */
export function releaseEscrow(t: Pick<Txn, "id" | "deal">) {
  const deal = dealOf(t as Txn);
  updateMedia((s) => ({
    ...s,
    released: deal ? { ...s.released, [deal]: true } : s.released,
    txns: s.txns.map((x) => (x.id === t.id ? { ...x, status: "done", label: x.label.replace("এসক্রোতে জমা", "পরিশোধিত") } : x)),
  }));
}

/** Choose how to pay; the wallet is offered only when it covers the bill. */
export function PayPicker({
  value,
  onChange,
  available,
  due,
  name = "pay",
}: {
  value: PayMethod;
  onChange: (m: PayMethod) => void;
  available: number;
  due: number;
  name?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-text-primary">কীভাবে দেবেন</legend>
      <div className="grid grid-cols-2 gap-2">
        {payMethods.map(({ key, bn, Icon }) => {
          const short = key === "wallet" && available < due;
          return (
            <label
              key={key}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-xl border-2 px-3 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-bd-green/30",
                key === "wallet" && "col-span-2",
                short ? "cursor-not-allowed border-card-border text-text-muted" : "cursor-pointer",
                !short && (value === key ? "border-bd-green bg-bd-green-light text-bd-green-dark" : "border-card-border text-text-secondary hover:border-slate-300"),
              )}
            >
              <input type="radio" name={name} className="sr-only" checked={value === key} disabled={short} onChange={() => onChange(key)} />
              <Icon className="size-4.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">{bn}</span>
              {key === "wallet" && (
                <span className={cn("text-xs font-medium", short ? "text-national-crimson" : "text-text-muted")}>
                  {short ? "ব্যালান্স কম · " : "ব্যালান্স "}
                  <Taka amount={available} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
