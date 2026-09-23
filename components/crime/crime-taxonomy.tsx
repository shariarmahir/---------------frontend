import { Icon } from "@/components/ui/icon";
import {
  crimeCategories,
  crimeRecords,
  crimeTiers,
  type CrimeTier,
} from "@/data/crime-index";
import { cn } from "@/lib/utils";

/** Bangla numerals for the tier headings, so the card doesn't mix scripts. */
const BN_ORDINALS = ["১", "২", "৩"];

function countForTier(id: CrimeTier): number {
  const inTier = new Set(
    crimeCategories.filter((c) => c.tier === id).map((c) => c.id),
  );
  return crimeRecords.filter((r) => inTier.has(r.category)).length;
}

/**
 * The standing legal notice, the priority category banner, and the
 * three-tier breakdown.
 *
 * The notice comes first and is not dismissible: it is what stops the
 * index being read as a list of guilty people, so it cannot sit below
 * the records or behind a toggle.
 */
export function CrimeTaxonomy() {
  return (
    <section className="w-full px-gutter py-space-md">
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        {/* ── Standing identity notice ──────────────────────────── */}
        <div className="flex flex-col gap-space-xs rounded-xl border border-amber-300 bg-amber-50 p-space-md">
          <span className="flex items-center gap-1.5 font-sans text-label-md font-bold text-amber-900">
            <Icon name="balance" className="text-[18px]" filled />
            অভিযুক্ত মানেই দোষী নয়
          </span>
          <p className="max-w-[80ch] font-sans text-[0.8125rem] leading-relaxed text-amber-900">
            আদালতে দোষী সাব্যস্ত না হওয়া পর্যন্ত কারও নাম বা ছবি এই পাতায়
            প্রকাশ করা হয় না — পলাতক বা তদন্তাধীন অবস্থাতেও নয়। কেবল রায় হয়ে
            যাওয়া মামলায় আদালত ও মামলা নম্বরসহ পরিচয় দেখানো হয়; বাকি সব
            রেকর্ডে কেবল অভিযুক্তের সংখ্যা ও মামলার অবস্থা থাকে।
          </p>
          <p className="max-w-[80ch] font-sans text-[0.8125rem] leading-relaxed text-amber-900">
            <strong>ছবি সম্পর্কে:</strong> কার্ডের ছবিগুলো সংশ্লিষ্ট এলাকা বা
            বিষয়ের স্টক ছবি — বর্ণিত ঘটনার বা কোনো ব্যক্তির প্রকৃত ছবি নয়।
          </p>
        </div>

        {/* ── Priority category banner ──────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl border border-bdgreen-200 bg-linear-to-r from-bdgreen-50 to-white p-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bd-green text-white">
              <Icon name="priority_high" className="text-[20px]" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-mono text-[0.6875rem] font-bold tracking-wider text-bd-green uppercase">
                সর্বোচ্চ অগ্রাধিকার নজরদারি
              </span>
              <h2 className="font-display text-headline-sm font-bold text-slate-900">
                উন্মুক্ত স্থানে প্রস্রাব
                <span className="ml-1.5 font-sans text-body-sm font-normal text-slate-500">
                  Public Urination
                </span>
              </h2>
            </div>
          </div>
          <span className="rounded-lg border border-border bg-white px-2.5 py-1 font-mono text-label-xs text-slate-600">
            দণ্ডবিধি ২৯০ ধারা · গণউপদ্রব
          </span>
        </div>

        {/* ── Three-tier breakdown ──────────────────────────────── */}
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          {crimeTiers.map((tier, i) => (
            <article
              key={tier.id}
              className="flex flex-col gap-space-sm rounded-xl border border-border bg-white p-space-md"
            >
              <div className="flex items-center justify-between gap-space-sm border-b border-border pb-space-sm">
                <h3
                  className={cn(
                    "flex min-w-0 items-center gap-1.5 font-display text-body-md font-bold",
                    tier.text,
                  )}
                >
                  <span
                    className={cn("size-2.5 shrink-0 rounded-full", tier.dot)}
                  />
                  <span className="truncate">
                    {BN_ORDINALS[i]}. {tier.banglaLabel}
                  </span>
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded border px-2 py-0.5 font-mono text-label-xs font-semibold tabular-nums",
                    tier.chip,
                  )}
                >
                  {countForTier(tier.id)} টি
                </span>
              </div>

              <p className="font-sans text-body-sm leading-relaxed text-slate-600">
                {tier.description}
              </p>

              <ul className="flex flex-wrap gap-1.5">
                {crimeCategories
                  .filter((c) => c.tier === tier.id)
                  .map((c) => (
                    <li
                      key={c.id}
                      className={cn(
                        "rounded border px-2 py-0.5 font-mono text-[0.6875rem]",
                        tier.chip,
                      )}
                    >
                      {c.banglaLabel}
                    </li>
                  ))}
              </ul>

              <span className="mt-auto pt-space-xs font-mono text-[0.625rem] text-slate-500">
                {tier.legalClass}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
