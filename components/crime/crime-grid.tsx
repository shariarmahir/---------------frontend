"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CrimeCard } from "@/components/crime/crime-card";
import {
  crimeCategories,
  crimeRecords,
  crimeTiers,
  type CrimeCategoryId,
  type CrimeTier,
} from "@/data/crime-index";
import { cn } from "@/lib/utils";

type TierFilter = CrimeTier | "all";

/** The districts present in the data, so the select never offers an empty cut. */
const DISTRICTS = [...new Set(crimeRecords.map((r) => r.location.district))];

export function CrimeGrid() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");
  const [category, setCategory] = useState<CrimeCategoryId | "">("");

  const searchId = useId();
  const districtId = useId();
  const categoryId = useId();

  const records = useMemo(() => {
    const tierIds = new Set(
      crimeCategories.filter((c) => c.tier === tier).map((c) => c.id),
    );
    const q = query.trim().toLowerCase();

    return [...crimeRecords]
      .sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))
      .filter((r) => {
        if (tier !== "all" && !tierIds.has(r.category)) return false;
        if (category && r.category !== category) return false;
        if (district && r.location.district !== district) return false;
        if (!q) return true;

        const categoryLabel =
          crimeCategories.find((c) => c.id === r.category)?.banglaLabel ?? "";
        return [
          r.headline,
          r.summary,
          r.location.area,
          r.location.thana,
          r.location.district,
          categoryLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
  }, [query, district, tier, category]);

  const hasFilters =
    query !== "" || district !== "" || tier !== "all" || category !== "";

  const reset = () => {
    setQuery("");
    setDistrict("");
    setTier("all");
    setCategory("");
  };

  return (
    <section
      id="crime-grid"
      className="w-full px-gutter py-space-md"
      aria-labelledby="crime-grid-title"
    >
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        {/* ── Search + filter ribbon ────────────────────────────── */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-white p-2.5 md:flex-row md:items-stretch">
          <div className="relative flex flex-1 items-center">
            <label htmlFor={searchId} className="sr-only">
              অপরাধ, স্থান বা ধারা অনুসন্ধান
            </label>
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 text-[18px] text-slate-500"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ঘটনা, থানা, জেলা অথবা অপরাধের ধরন..."
              className="w-full rounded-md border border-border bg-slate-50 py-2 pr-3 pl-9 font-sans text-body-sm text-slate-900 transition-colors placeholder:text-slate-500 focus:border-bd-green focus:bg-white focus:ring-3 focus:ring-bd-green/30 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:w-auto">
            <div className="flex flex-col">
              <label htmlFor={districtId} className="sr-only">
                জেলা
              </label>
              <select
                id={districtId}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="cursor-pointer rounded-md border border-border bg-slate-50 px-3 py-2 font-sans text-body-sm text-slate-900 focus:border-bd-green focus:ring-3 focus:ring-bd-green/30 focus:outline-none"
              >
                <option value="">সকল জেলা</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor={categoryId} className="sr-only">
                অপরাধের ধরন
              </label>
              <select
                id={categoryId}
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CrimeCategoryId | "")
                }
                className="cursor-pointer rounded-md border border-border bg-slate-50 px-3 py-2 font-sans text-body-sm text-slate-900 focus:border-bd-green focus:ring-3 focus:ring-bd-green/30 focus:outline-none"
              >
                <option value="">সকল অপরাধ ধরন</option>
                {crimeTiers.map((t) => (
                  <optgroup key={t.id} label={t.banglaLabel}>
                    {crimeCategories
                      .filter((c) => c.tier === t.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.banglaLabel}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={reset}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-signal-orange px-4 py-2 font-display text-label-md font-semibold text-white transition-colors hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Icon name="filter_alt_off" className="text-[16px]" />
              ফিল্টার সরান
            </button>
          </div>
        </div>

        {/* ── Results header + tier tabs ────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <Icon name="grid_view" className="text-[22px] text-bd-green" />
            <div className="flex flex-col">
              <h2
                id="crime-grid-title"
                className="font-display text-headline-sm font-bold text-slate-900"
              >
                আজকের নথিভুক্ত ঘটনা ও প্রমাণাদি
              </h2>
              <p
                aria-live="polite"
                className="font-mono text-[0.6875rem] text-slate-600"
              >
                {records.length} টি রেকর্ড দেখানো হচ্ছে
                {hasFilters ? " (ফিল্টার প্রয়োগ করা হয়েছে)" : ""}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="অপরাধের মাত্রা"
            className="flex flex-wrap items-center gap-1.5"
          >
            <TierTab
              active={tier === "all"}
              onClick={() => setTier("all")}
              count={crimeRecords.length}
            >
              সব
            </TierTab>
            {crimeTiers.map((t) => {
              const inTier = new Set(
                crimeCategories.filter((c) => c.tier === t.id).map((c) => c.id),
              );
              return (
                <TierTab
                  key={t.id}
                  active={tier === t.id}
                  onClick={() => setTier(t.id)}
                  count={crimeRecords.filter((r) => inTier.has(r.category)).length}
                >
                  {t.banglaLabel}
                </TierTab>
              );
            })}
          </div>
        </div>

        {/* ── Results ───────────────────────────────────────────── */}
        {records.length > 0 ? (
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {records.map((record) => (
              <CrimeCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-space-xs rounded-xl border border-dashed border-border bg-white py-space-xl text-center">
            <Icon name="inbox" className="text-[32px] text-slate-400" />
            <p className="font-sans text-body-md font-semibold text-slate-700">
              এই শর্তে কোনো নথিভুক্ত ঘটনা পাওয়া যায়নি।
            </p>
            <p className="max-w-md font-sans text-body-sm text-slate-600">
              ঘটনা না থাকা আর তথ্য না পাওয়া এক নয় — এই তালিকা কেবল যাচাইকৃত
              উৎস থেকে সংগৃহীত রেকর্ড দেখায়।
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className="mt-space-xs rounded-md border border-bd-green px-space-md py-1.5 font-display text-label-md font-semibold text-bd-green transition-colors hover:bg-bdgreen-50"
              >
                সব ফিল্টার সরান
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function TierTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5",
        "font-sans text-body-sm font-semibold whitespace-nowrap transition-colors",
        "focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none",
        active
          ? "border-bd-green bg-bd-green text-white"
          : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
      )}
    >
      {children}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}
