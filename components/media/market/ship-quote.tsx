"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Listing } from "@/data/media/types";
import { shipOptions, unitPrice } from "@/lib/media/bazaar";
import { cn } from "@/lib/utils";
import { choiceClass, toNumber } from "../ui/field-styles";
import { Num, Taka } from "../ui/numerals";
import { SHIP_BN, SHIP_ICON } from "./logistics";

const DISTANCES = [
  { label: "একই জেলা", km: 30 },
  { label: "পাশের জেলা", km: 120 },
  { label: "দেশের অন্য প্রান্তে", km: 350 },
];

/** Price for a quantity (with wholesale tiers) and what each way of sending it costs. */
export function ShipQuote({ listing }: { listing: Listing & { kg: number } }) {
  const [qtyRaw, setQty] = useState(String(listing.minOrder ?? 1));
  const [km, setKm] = useState(DISTANCES[2].km);
  const max = listing.stock ?? 9999;
  const qty = Math.min(Math.max(toNumber(qtyRaw), listing.minOrder ?? 1), max);
  const each = unitPrice(qty, listing.price, listing.tiers);
  const options = shipOptions({ kg: qty * listing.kg, km, perishable: Boolean(listing.perishable) }).filter((o) => listing.delivery.includes(o.mode));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-white">কত {listing.unit}</span>
          <Input inputMode="numeric" value={qtyRaw} onChange={(e) => setQty(e.target.value)} aria-describedby="qty-note" />
        </label>
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-semibold text-white">কত দূরে</legend>
          <div className="flex flex-wrap gap-2">
            {DISTANCES.map((d) => (
              <label key={d.km} className={choiceClass(km === d.km)}>
                <input type="radio" name="km" className="sr-only" checked={km === d.km} onChange={() => setKm(d.km)} />
                {d.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p id="qty-note" className="text-sm text-white/80">
        <Num value={qty} /> {listing.unit} × <Taka amount={each} /> = <span className="font-bold text-white"><Taka amount={qty * each} /></span>
        {each < listing.price && <span className="ml-2 rounded-md bg-bd-green px-1.5 py-0.5 text-xs font-semibold text-white">পাইকারি দর</span>}
        <span className="block text-xs text-white/65">ওজন প্রায় <Num value={Math.round(qty * listing.kg)} /> কেজি{listing.stock !== undefined && <> · মজুত <Num value={listing.stock} /> {listing.unit}</>}</span>
      </p>
      {options.length === 0 ? (
        <p className="rounded-xl bg-white/10 p-3 text-sm text-white/80">এই ওজনে বিক্রেতার দেওয়া ডেলিভারি চলে না — মেসেজে অন্য উপায় জিজ্ঞেস করুন।</p>
      ) : (
        <ul className="space-y-2">
          {options.map((o, i) => {
            const Icon = SHIP_ICON[o.mode];
            return (
              <li key={o.mode} className={cn("rounded-xl p-3 ring-1", i === 0 ? "bg-black/40 ring-2 ring-signal-orange" : "bg-black/30 ring-white/12")}>
                <p className="flex items-center gap-2 text-sm">
                  <Icon className="size-4.5 text-signal-orange" aria-hidden />
                  <span className="flex-1 font-semibold text-white">{SHIP_BN[o.mode]}{i === 0 && <span className="ml-2 rounded-md bg-signal-orange px-1.5 py-0.5 text-[11px] font-bold text-text-primary">সবচেয়ে কম খরচ</span>}</span>
                  <span className="font-bold text-white"><Taka amount={o.fee} /></span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-white/55">ডেলিভারি খরচ আনুমানিক, ডেমো রেটে।</p>
    </div>
  );
}
