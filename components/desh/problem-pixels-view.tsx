"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import type { EvidenceStatus, Urgency } from "@/data/amar-bangladesh";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

export interface PixelProblem {
  n: number;
  code: string;
  title: string;
  topicEn: string;
  interpretation: string;
  theme: string;
  urgency: Urgency;
  urgencyBn: string;
  status: EvidenceStatus;
  statusBn: string;
  statusNote: string;
  brief: string;
  fact?: { text: string; source: string };
  doThis: { text: string; why: string }[];
  avoid: { text: string; why: string }[];
  photo?: { src: string; alt: string };
}

/** Pixel fill by urgency — red for the most urgent, fading toward gold. */
const TILE: Record<Urgency, string> = {
  "very-high": "bg-national-crimson text-white",
  high: "bg-[color-mix(in_oklab,var(--color-national-crimson)_62%,var(--color-signal-orange))] text-white",
  "medium-high": "bg-signal-orange text-text-primary",
  medium: "bg-white text-text-primary",
};

const STATUS_CHIP: Record<EvidenceStatus, string> = {
  verified: "bg-white/10 text-signal-orange",
  plausible: "bg-signal-orange/20 text-signal-orange",
  unverified: "bg-text-primary text-white/80",
};

const URGENCIES: Urgency[] = ["very-high", "high", "medium-high", "medium"];

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** "#p-12" → 12 */
function hashProblem(hash: string): number | null {
  const m = /^#p-(\d{1,2})$/.exec(hash);
  return m ? Number(m[1]) : null;
}

export function ProblemPixelsView({ items }: { items: PixelProblem[] }) {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  // A click wins until the hash changes again (another "#p-n" link on the page).
  const [picked, setPicked] = useState<{ n: number; hash: string } | null>(null);
  const [urgency, setUrgency] = useState<Urgency | "all">("all");
  const selectedN = (picked && picked.hash === hash ? picked.n : hashProblem(hash)) ?? 1;
  const p = items.find((x) => x.n === selectedN) ?? items[0];
  const shown = (x: PixelProblem) => urgency === "all" || x.urgency === urgency;

  return (
    <section id="register" aria-labelledby="pixels-title" className="section-band scroll-mt-40 bg-text-primary ring-1 ring-white/12">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="pixels-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-white sm:text-4xl">
            ৩২টি নষ্ট <span className="text-national-crimson">পিক্সেল</span> — প্রতিটির প্রমাণ আর সমাধানের পথ
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-white/80">
            নিজের খুঁজে পাওয়া সমস্যা আর গভীর গবেষণা মিলিয়ে ৩২টি বিষয়। একটি পিক্সেল বেছে নিন — কতটা প্রমাণিত, কতটা জরুরি, আর কোন পথে এগোলে কাজ হবে, কোন পথে নয়।
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="জরুরিতা অনুযায়ী দেখুন">
          {(["all", ...URGENCIES] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={urgency === u}
              onClick={() => setUrgency(u)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 font-bengali text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none",
                urgency === u ? "border-bd-green bg-bd-green text-white" : "border-white/12 text-white/80 hover:border-bd-green/40",
              )}
            >
              {u !== "all" && <span aria-hidden className={cn("size-3 rounded-xs", TILE[u])} />}
              {u === "all" ? "সব" : items.find((x) => x.urgency === u)?.urgencyBn}
              <span className="text-xs opacity-70">{toBanglaDigits(u === "all" ? items.length : items.filter((x) => x.urgency === u).length)}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ol className="grid h-fit grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-6" aria-label="৩২টি সমস্যা">
            {items.map((x) => {
              const on = x.n === p.n;
              return (
                <li key={x.n} id={`p-${x.n}`} className="scroll-mt-60">
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${toBanglaDigits(x.n)}. ${x.title} — ${x.urgencyBn}`}
                    onClick={() => setPicked({ n: x.n, hash })}
                    className={cn(
                      "flex aspect-square w-full flex-col justify-between rounded-lg p-1.5 text-left transition-[transform,opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-bd-green focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none",
                      TILE[x.urgency],
                      shown(x) ? "opacity-100" : "opacity-20",
                      on ? "scale-105 shadow-[0_8px_24px_-6px_rgb(228_176_39/0.9)] ring-2 ring-signal-orange ring-offset-2" : "hover:-translate-y-0.5",
                    )}
                  >
                    <span className="font-bengali text-lg leading-none font-bold sm:text-xl">{toBanglaDigits(x.n)}</span>
                    <span className="line-clamp-2 font-bengali text-[10px] leading-tight opacity-90 sm:text-[11px]">{x.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <article aria-live="polite" className="rounded-3xl border border-white/12 bg-black p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 font-bengali text-xs font-semibold">
              <span className={cn("rounded-full px-2.5 py-1", TILE[p.urgency])}>{p.urgencyBn}</span>
              <span className={cn("rounded-full px-2.5 py-1", STATUS_CHIP[p.status])}>{p.statusBn}</span>
              <span className="rounded-full bg-text-primary ring-1 ring-white/12 px-2.5 py-1 text-white/80">{p.theme}</span>
              <span className="ml-auto font-mono text-white/65">{p.code}</span>
            </div>
            <h3 className="mt-4 font-bengali text-2xl leading-snug font-bold text-white sm:text-3xl">
              {toBanglaDigits(p.n)}. {p.title}
            </h3>
            <p lang="en" className="mt-1 font-sans text-sm text-white/65">
              {p.topicEn} — {p.interpretation}
            </p>
            <p className="mt-4 font-bengali text-lg leading-relaxed text-white">{p.brief}</p>
            {p.fact && (
              <p className="mt-4 rounded-xl bg-text-primary ring-1 ring-white/12 p-4 font-bengali text-[15px] leading-relaxed text-white/80">
                <Icon name="fact_check" className="mr-1 align-[-4px] text-[18px] text-signal-orange" />
                {p.fact.text} <span className="text-white/65">— {p.fact.source}</span>
              </p>
            )}
            <p className="mt-3 font-bengali text-sm text-white/65">
              প্রমাণের অবস্থা: <span lang="en" className="font-sans">{p.statusNote}</span>
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 font-bengali text-base font-bold text-signal-orange">
                  <Icon name="task_alt" className="text-[20px]" /> যা করতে হবে
                </h4>
                <ul className="mt-3 space-y-3">
                  {p.doThis.map((d) => (
                    <li key={d.text} className="font-bengali text-[15px] leading-relaxed">
                      <p className="font-semibold text-white">{d.text}</p>
                      <p className="mt-0.5 text-sm text-white/80">{d.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-bengali text-base font-bold text-national-crimson">
                  <Icon name="block" className="text-[20px]" /> যে ভুল করা যাবে না
                </h4>
                <ul className="mt-3 space-y-3">
                  {p.avoid.map((d) => (
                    <li key={d.text} className="font-bengali text-[15px] leading-relaxed">
                      <p className="font-semibold text-white">{d.text}</p>
                      <p className="mt-0.5 text-sm text-white/80">{d.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/12 pt-5">
              {p.photo && (
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <Image src={p.photo.src} alt={p.photo.alt} fill sizes="56px" className="object-cover" />
                </span>
              )}
              <Link
                href={`/cholo-bangladesh-gori/module/${p.code}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-signal-orange px-4 font-bengali text-sm font-bold text-text-primary shadow-sm transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-bd-green focus-visible:outline-none"
              >
                <Icon name="extension" className="text-[18px]" /> খেলায় এই সমস্যা সমাধান করুন
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
