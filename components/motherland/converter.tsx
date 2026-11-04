"use client";

import { useState } from "react";
import { RATE_CHECKED, TAKA_PER_USD } from "@/data/motherland-live";
import { COLUMN } from "./kit";
import { RiseText } from "./rise-text";

const NOTES = [1000, 500, 100, 50, 20, 10];
const taka = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;

/** How many of each note an amount becomes, largest first, so a visitor knows what to expect in hand. */
export function noteMix(amount: number) {
  let left = Math.round(amount);
  return NOTES.map((note) => {
    const count = Math.floor(left / note);
    left -= count * note;
    return { note, count };
  }).filter((n) => n.count > 0);
}

/** What you can do with the money, from the fares and rough prices further down the page. */
const BUYS = [
  { label: "train seats, Dhaka to Cox's Bazar", cost: 1449 },
  { label: "coach seats, Dhaka to Sylhet", cost: 740 },
  { label: "good local meals", cost: 300 },
  { label: "short rickshaw rides", cost: 60 },
];

const FIELD = "min-h-14 w-full rounded-xl bg-white px-4 text-xl font-bold text-ml-ink ring-1 ring-ml-ink/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ml-navy";

/** Type dollars or taka, and today's rate if you have it; the other side and the notes follow. */
export function TakaConverter() {
  const [usd, setUsd] = useState("100");
  const [rate, setRate] = useState(String(TAKA_PER_USD));
  const r = Number(rate) > 0 ? Number(rate) : TAKA_PER_USD;
  const dollars = Math.max(0, Number(usd) || 0);
  const amount = dollars * r;

  return (
    <section id="converter" aria-labelledby="converter-title" className="scroll-mt-(--ml-header) bg-signal-orange py-12 text-ml-ink sm:py-14 lg:py-16">
      <div className={`${COLUMN} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16`}>
        <div className="flex flex-col gap-5">
          <RiseText id="converter-title" text="How much is that in taka?" className="w-full font-ml-display text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02] tracking-[0.01em] uppercase" />
          <p className="text-lg leading-relaxed sm:text-xl">
            ৳122 to ৳123 a dollar in {RATE_CHECKED}. Type your own rate.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 font-semibold">
              US dollars
              <input name="usd" type="number" inputMode="decimal" min={0} value={usd} onChange={(e) => setUsd(e.target.value)} className={FIELD} />
            </label>
            <label className="flex flex-col gap-2 font-semibold">
              Taka for one dollar
              <input name="rate" type="number" inputMode="decimal" min={1} step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={FIELD} />
            </label>
          </div>
          <a href="https://www.bb.org.bd/en/index.php/econdata/exchangerate" target="_blank" rel="noopener noreferrer" className="w-fit underline underline-offset-4">
            See today&rsquo;s rate at Bangladesh Bank
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <div aria-live="polite" className="flex flex-col gap-6 rounded-3xl bg-ml-navy p-7 text-white sm:p-9">
          <p className="font-ml-display text-[clamp(3.25rem,8vw,6.5rem)] leading-none tracking-[0.01em] text-signal-orange">{taka(amount)}</p>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-white/80">In your hand, that could be</p>
            <ul className="flex flex-wrap gap-2">
              {noteMix(amount).map((n) => (
                <li key={n.note} className="rounded-full bg-white/10 px-4 py-2 font-semibold">
                  {n.count} × ৳{n.note.toLocaleString("en-US")}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-white/80">It would cover about</p>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {BUYS.map((b) => (
                <li key={b.label}>
                  <span className="font-bold">{Math.floor(amount / b.cost).toLocaleString("en-US")}</span> {b.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
