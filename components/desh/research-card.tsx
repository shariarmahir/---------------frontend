import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { REPORT_META, sourcePoints, unsupportedClaims } from "@/data/amar-bangladesh";
import { evidenceBn } from "@/data/gori/puzzles";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";
import { PixelMap } from "./pixel-map";

/** Count tiles: green, gold, orange — the evidence ladder in the home palette. */
const COUNT_SURFACES = [
  "bg-bd-green text-white",
  "bg-signal-orange text-text-primary",
  "bg-bdorange-600 text-text-primary",
];

/**
 * The full 32-problem research view. The complete paper is not published
 * yet, so the card is a placeholder for it — the counts, the claims the
 * evidence does not support, and the working tools are live.
 */
export function ResearchCard() {
  const counts = (["verified", "plausible", "unverified"] as const).map((s) => ({ s, n: sourcePoints.filter((p) => p.status === s).length }));
  return (
    <section id="research" aria-labelledby="research-title" className="section-band-tinted scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <article className="story-reveal grid overflow-hidden rounded-[2rem] bg-text-primary ring-1 ring-white/12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="relative flex flex-col justify-between gap-8 bg-bd-green p-8 text-white sm:p-10">
            <div>
              <span className="rounded-full bg-signal-orange px-3 py-1 font-bengali text-xs font-bold text-text-primary">পূর্ণ গবেষণা · শীঘ্রই</span>
              <h2 id="research-title" className="mt-5 font-bengali text-3xl leading-tight font-bold sm:text-4xl">৩২টি সমস্যার পূর্ণ গবেষণা</h2>
              <p className="mt-3 font-bengali text-base leading-relaxed text-white/85">
                প্রতিটি গ্রামীণ এলাকার কষ্ট, মাঠের পর্যবেক্ষণ আর বিশ্বব্যাংক, আইএমএফ, ইউনিসেফ ও বিবিএসের তথ্য মিলিয়ে তৈরি প্রতিবেদনের পূর্ণ সংস্করণ এখানে প্রকাশিত হবে।
              </p>
            </div>
            <PixelMap healed label="সব পিক্সেল সুস্থ — মেরামত হওয়া বাংলাদেশ" className="mx-auto w-40 opacity-90" />
            <p className="font-sans text-xs text-white/70" lang="en">
              Evidence base: {REPORT_META.title} — {REPORT_META.date}
            </p>
          </div>

          <div className="p-8 text-white sm:p-10">
            <dl className="grid grid-cols-3 gap-3">
              {counts.map(({ s, n }, i) => (
                <div key={s} className={cn("flex flex-col rounded-2xl p-4", COUNT_SURFACES[i])}>
                  <dt className="order-last mt-1 font-bengali text-sm leading-snug">{evidenceBn[s]}</dt>
                  <dd className="font-bengali text-3xl font-bold">{toBanglaDigits(n)}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-8 flex items-center gap-2 font-bengali text-lg font-bold text-signal-orange">
              <Icon name="rule" className="text-[22px]" /> যে দাবি প্রমাণ ছাড়া বলা যাবে না
            </h3>
            <ul className="mt-3 space-y-2">
              {unsupportedClaims.map((c) => (
                <li key={c} lang="en" className="rounded-xl border border-dashed border-white/25 px-4 py-2.5 font-sans text-sm text-white/85">
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <span aria-disabled className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-white/10 px-4 font-bengali text-sm font-semibold text-white/65 ring-1 ring-white/15">
                <Icon name="picture_as_pdf" className="text-[18px]" /> পূর্ণ গবেষণাপত্র (প্লেসহোল্ডার)
              </span>
              <Link href="/cholo-bangladesh-gori/evidence" className={cn(btn.gold, "min-h-11 py-2.5 font-bengali text-sm normal-case")}>
                <Icon name="manage_search" className="text-[18px]" /> প্রমাণ অন্বেষণ করুন
              </Link>
              <Link href="/bangladesh/problems" className={cn(btn.ghost, "min-h-11 py-2.5 font-bengali text-sm normal-case")}>
                <Icon name="grid_view" className="text-[18px]" /> ৩২টি পিক্সেলে ফিরুন
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
