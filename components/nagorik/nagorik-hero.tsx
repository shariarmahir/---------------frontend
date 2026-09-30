import type { CSSProperties } from "react";
import { StoryPhoto } from "@/components/bangladesh/story-photo";
import { SignalSeam } from "@/components/ui/section-kit";
import { TUS } from "@/data/nagorik";
import { ruralBackdrops } from "@/data/rural-life";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

/** Solid colour for each jump card — the home page's order, green first. */
const JUMPS = [
  { href: "#day", n: "০১", label: "দিনের হিসাব", card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
  { href: "#divisions", n: "০২", label: "বিভাগ", card: "bg-signal-orange text-text-primary", glow: "var(--color-signal-orange)" },
  { href: "#rights", n: "০৩", label: "অধিকার", card: "bg-bdorange-600 text-text-primary", glow: "var(--color-bdorange-600)" },
  { href: "#responsibility", n: "০৪", label: "দায়িত্ব", card: "bg-text-primary text-white ring-1 ring-white/25", glow: "var(--color-bdgreen-500)" },
  { href: "#self-check", n: "০৫", label: "আজ রাতের আয়না", card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
];

const h = (v: number) => toBanglaDigits(v.toFixed(1));

/**
 * Opening: the promise of the page over a working farmer's morning, in the
 * home hero's language — black-shaded photo, gold headline word, five solid
 * jump cards and an ink proof strip with the header's gold pulse on its seam.
 */
export function NagorikHero() {
  const proof = [
    { value: `${h(TUS.day.women.unpaid)} ঘণ্টা`, label: "নারীর অবৈতনিক কাজ, দিনে" },
    { value: `${h(TUS.day.men.unpaid)} ঘণ্টা`, label: "পুরুষের অবৈতনিক কাজ, দিনে" },
    { value: TUS.ratios[0].value, label: "নারীর বাড়তি ভার" },
    { value: `${toBanglaDigits(TUS.womenLabourForce.to.pct)}%`, label: `নারীর শ্রমশক্তি, ${TUS.womenLabourForce.to.year}` },
  ];

  return (
    <section aria-labelledby="nagorik-title" className="relative isolate overflow-hidden bg-black text-white">
      <StoryPhoto photo={ruralBackdrops.farmerCow} sizes="100vw" priority drift className="absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-black via-black/85 to-black/35" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black to-transparent" />

      <div className="mx-auto max-w-7xl px-gutter-x pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="story-reveal">
          <p className="inline-flex items-center gap-2 font-bengali text-sm font-semibold text-signal-orange">
            <span aria-hidden className="size-2 rounded-xs bg-national-crimson" />
            যাঁরা এই অবস্থা বদলাতে চান, তাঁদের জন্য
          </p>
          <h1 id="nagorik-title" className="mt-4 max-w-3xl font-bengali text-5xl leading-[1.08] font-bold text-balance sm:text-6xl lg:text-7xl">
            নাগরিক <span className="text-signal-orange [text-shadow:0_0_28px_rgb(228_176_39/0.5)]">অধিকার</span> ও দায়িত্ব
          </h1>
          <p className="mt-5 max-w-2xl font-bengali text-lg leading-relaxed text-white/85">
            দেশ বদলায় মানুষের দিনে। আমরা দিনের সময় কোথায় দিই, কোন অধিকার জানি, কোন দায়িত্ব পালন করি — এখান থেকেই আগামী প্রজন্মের বাংলাদেশ তৈরি হয়।
          </p>
          <p className="mt-6 max-w-2xl rounded-2xl bg-signal-orange px-5 py-4 font-bengali text-base leading-relaxed text-text-primary shadow-[0_24px_44px_-26px_var(--color-signal-orange)]">
            একজন নারী দিনে গড়ে <strong>৫.৯ ঘণ্টা</strong> অবৈতনিক ঘর ও সেবার কাজ করেন, একজন পুরুষ <strong>০.৮ ঘণ্টা</strong>।{" "}
            <span className="font-semibold">— বিবিএস টাইম-ইউজ সার্ভে ২০২১</span>
          </p>

          <nav aria-label="এই পাতায়" className="mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-[repeat(5,minmax(0,1fr))]">
            {JUMPS.map((j) => (
              <a
                key={j.href}
                href={j.href}
                style={{ "--glow": j.glow } as CSSProperties}
                className={cn(
                  "group rounded-xl px-3 py-3 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none max-sm:last:col-span-2",
                  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-1 hover:shadow-[0_18px_34px_-18px_var(--glow)] active:-translate-y-1 active:scale-[0.97] active:duration-150",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                  j.card,
                )}
              >
                <span className="block font-bengali text-2xl leading-none font-bold">{j.n}</span>
                <span className="mt-1.5 block font-bengali text-sm font-semibold">{j.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Proof strip — the header's ink strip at full width, gold pulse on its seam. */}
      <div className="relative bg-text-primary">
        <SignalSeam className="top-0" />
        <dl className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          {proof.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-0.5 border-white/10 px-2 py-4 text-center not-first:border-l max-sm:nth-[2n+1]:border-l-0 max-sm:nth-[n+3]:border-t">
              <dt className="order-last font-bengali text-xs text-white/70">{f.label}</dt>
              <dd className="font-bengali text-2xl font-bold text-signal-orange sm:text-3xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
