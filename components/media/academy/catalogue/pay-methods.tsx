"use client";

import type { PayMethod } from "@/data/media/types";
import { cn } from "@/lib/utils";
import { Taka } from "../../ui/numerals";
import { payMethods } from "../../wallet/pay";

/**
 * How to pay, as a ruled grid of square choices: the wallet across the top
 * with its balance (out of reach when it cannot cover the bill), then bKash,
 * Nagad, Bangla QR and card. The chosen one inverts.
 */
export function PayMethods({ value, onChange, available, due, name = "pay" }: { value: PayMethod; onChange: (m: PayMethod) => void; available: number; due: number; name?: string }) {
  return (
    <fieldset>
      <legend className="hud text-(--c-faint)">কীভাবে দেবেন</legend>
      <div className="mt-3 grid grid-cols-2 gap-px border border-(--c-line) bg-(--c-line)">
        {payMethods.map(({ key, bn, Icon }) => {
          const short = key === "wallet" && available < due;
          const on = value === key;
          return (
            <label
              key={key}
              className={cn(
                "flex min-h-12 items-center gap-2.5 px-4 text-sm font-semibold transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-(--c-signal)",
                key === "wallet" && "col-span-2",
                short ? "cursor-not-allowed bg-(--c-bg) text-(--c-faint)" : on ? "cursor-pointer bg-(--c-invert-bg) text-(--c-invert-fg)" : "cursor-pointer bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)",
              )}
            >
              <input type="radio" name={name} className="sr-only" checked={on} disabled={short} onChange={() => onChange(key)} />
              <Icon className="size-4.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">{bn}</span>
              {key === "wallet" && (
                <span className={cn("hud", short && "text-(--c-bad)")}>
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
