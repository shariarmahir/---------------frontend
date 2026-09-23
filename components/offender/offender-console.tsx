"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ConvictedCard } from "@/components/offender/convicted-card";
import { OffenderCard } from "@/components/offender/offender-card";
import {
  caseStages,
  categoryShares,
  convictedOffenders,
  offenderPatterns,
  offenderStats,
  riskBands,
  type CaseStage,
  type RiskBand,
} from "@/data/offender-index";
import { cn } from "@/lib/utils";

type View = "patterns" | "convictions";
type SortKey = "count" | "recent" | "risk";

const RISK_ORDER: Record<RiskBand, number> = {
  critical: 0,
  elevated: 1,
  watch: 2,
};

/** Districts present in the pattern feed, so no filter yields nothing. */
const DISTRICTS = [...new Set(offenderPatterns.map((p) => p.district))];

export function OffenderConsole() {
  const [view, setView] = useState<View>("patterns");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [risk, setRisk] = useState<RiskBand | "">("");
  const [stage, setStage] = useState<CaseStage | "">("");
  const [sort, setSort] = useState<SortKey>("count");

  const searchId = useId();
  const districtId = useId();
  const riskId = useId();
  const stageId = useId();

  const patterns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offenderPatterns
      .filter((p) => {
        if (district && p.district !== district) return false;
        if (risk && p.risk !== risk) return false;
        if (stage && p.stage !== stage) return false;
        if (!q) return true;
        return [
          p.ref,
          p.thana,
          p.district,
          ...p.areas,
          ...p.statutes,
          ...p.breakdown.map((b) => b.label),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        if (sort === "count") return b.totalOffences - a.totalOffences;
        if (sort === "recent") return a.activeMonths - b.activeMonths;
        return RISK_ORDER[a.risk] - RISK_ORDER[b.risk];
      });
  }, [query, district, risk, stage, sort]);

  const convictions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return convictedOffenders
      .filter((c) => {
        if (district && c.district !== district) return false;
        if (!q) return true;
        return [c.ref, c.court, c.caseNo, c.district, ...c.statutes]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => +new Date(b.judgmentDate) - +new Date(a.judgmentDate));
  }, [query, district]);

  const showingPatterns = view === "patterns";
  const resultCount = showingPatterns ? patterns.length : convictions.length;

  const hasFilters =
    query !== "" || district !== "" || risk !== "" || stage !== "";

  const reset = () => {
    setQuery("");
    setDistrict("");
    setRisk("");
    setStage("");
  };

  return (
    <>
      {/* ── View switch + filter engine ─────────────────────────── */}
      <section className="w-full border-b border-border bg-slate-50 px-gutter py-space-md">
        <div className="mx-auto flex max-w-360 flex-col gap-space-sm">
          {/* Two tabs: the anonymised feed and the conviction registry. */}
          <div
            role="tablist"
            aria-label="ডেটা ভিউ"
            className="flex w-full flex-col gap-space-xs sm:w-fit sm:flex-row"
          >
            <ViewTab
              active={showingPatterns}
              onClick={() => setView("patterns")}
              icon="hub"
              count={offenderPatterns.length}
            >
              অপরাধ প্যাটার্ন (পরিচয়হীন)
            </ViewTab>
            <ViewTab
              active={!showingPatterns}
              onClick={() => setView("convictions")}
              icon="gavel"
              count={convictedOffenders.length}
            >
              দণ্ডপ্রাপ্ত রেজিস্ট্রি
            </ViewTab>
          </div>

          <div className="rounded-xl border border-border bg-white p-space-sm">
            <div className="grid grid-cols-1 gap-space-sm md:grid-cols-12">
              <div className="flex flex-col gap-1 md:col-span-5">
                <label
                  htmlFor={searchId}
                  className="font-mono text-[0.6875rem] font-semibold text-slate-600"
                >
                  অনুসন্ধান (ক্লাস্টার আইডি, থানা, এলাকা, ধারা)
                </label>
                <div className="relative flex items-center">
                  <Icon
                    name="search"
                    className="pointer-events-none absolute left-3 text-[18px] text-slate-500"
                  />
                  <input
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="যেমন: মিরপুর, চাঁদাবাজি, দণ্ডবিধি ৩৮৫..."
                    className="w-full rounded-md border border-border bg-slate-50 py-2 pr-3 pl-9 font-sans text-body-sm text-slate-900 transition-colors placeholder:text-slate-500 focus:border-bd-green focus:bg-white focus:ring-3 focus:ring-bd-green/30 focus:outline-none"
                  />
                </div>
              </div>

              <Select
                id={districtId}
                label="বিভাগ ও জেলা"
                value={district}
                onChange={setDistrict}
                className="md:col-span-2"
              >
                <option value="">সকল জেলা</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>

              <Select
                id={riskId}
                label="অগ্রাধিকার স্তর"
                value={risk}
                onChange={(v) => setRisk(v as RiskBand | "")}
                disabled={!showingPatterns}
                className="md:col-span-2"
              >
                <option value="">সকল স্তর</option>
                {riskBands.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.banglaLabel}
                  </option>
                ))}
              </Select>

              <Select
                id={stageId}
                label="মামলার অবস্থা"
                value={stage}
                onChange={(v) => setStage(v as CaseStage | "")}
                disabled={!showingPatterns}
                className="md:col-span-2"
              >
                <option value="">সকল অবস্থা</option>
                {Object.entries(caseStages).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {meta.bangla}
                  </option>
                ))}
              </Select>

              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={reset}
                  disabled={!hasFilters}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-signal-orange px-2 py-2 font-display text-[0.6875rem] font-semibold text-white transition-colors hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <Icon name="filter_alt_off" className="text-[15px]" />
                  সরান
                </button>
              </div>
            </div>

            {/* Sort row — patterns only. */}
            {showingPatterns ? (
              <div className="mt-space-sm flex flex-wrap items-center justify-between gap-space-sm border-t border-border pt-space-sm">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-mono text-[0.6875rem] font-bold tracking-wider text-slate-600 uppercase">
                    সাজানোর ক্রম:
                  </span>
                  <SortChip
                    active={sort === "count"}
                    onClick={() => setSort("count")}
                  >
                    সর্বোচ্চ অপরাধ সংখ্যা
                  </SortChip>
                  <SortChip
                    active={sort === "recent"}
                    onClick={() => setSort("recent")}
                  >
                    সাম্প্রতিক নথি
                  </SortChip>
                  <SortChip
                    active={sort === "risk"}
                    onClick={() => setSort("risk")}
                  >
                    অগ্রাধিকার স্তর
                  </SortChip>
                </div>
                <p
                  aria-live="polite"
                  className="font-mono text-[0.6875rem] text-slate-600"
                >
                  প্রদর্শিত:{" "}
                  <span className="font-bold text-slate-900">
                    {resultCount} টি ক্লাস্টার
                  </span>{" "}
                  / মোট খোলা:{" "}
                  <span className="font-bold text-bd-green">
                    {offenderStats.openClusters} টি
                  </span>
                </p>
              </div>
            ) : (
              <p
                aria-live="polite"
                className="mt-space-sm border-t border-border pt-space-sm font-mono text-[0.6875rem] text-slate-600"
              >
                প্রদর্শিত:{" "}
                <span className="font-bold text-slate-900">
                  {resultCount} টি রায়
                </span>{" "}
                / মোট দণ্ডপ্রাপ্ত:{" "}
                <span className="font-bold text-bd-green">
                  {offenderStats.convictions} জন
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────── */}
      <section
        id="offender-grid"
        className="w-full px-gutter py-space-lg"
        aria-labelledby="offender-grid-title"
      >
        <div className="mx-auto flex max-w-360 flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 font-mono text-label-xs font-bold tracking-wider uppercase">
              <span
                className={cn(
                  "size-2 rounded-full",
                  showingPatterns ? "bg-national-crimson" : "bg-bd-green",
                )}
              />
              <span
                className={
                  showingPatterns ? "text-national-crimson" : "text-bd-green"
                }
              >
                {showingPatterns
                  ? "পুনরাবৃত্তি বিশ্লেষণ // পরিচয়হীন ক্লাস্টার"
                  : "প্রকাশ্য রায় // আদালত নথিভুক্ত"}
              </span>
            </span>
            <h2
              id="offender-grid-title"
              className="font-display text-headline-sm font-bold tracking-tight text-slate-900"
            >
              {showingPatterns
                ? "অপরাধের ধরন ও পুনরাবৃত্তি গণনা তালিকা"
                : "আদালতে দণ্ডপ্রাপ্তদের প্রকাশ্য রেজিস্টার"}
            </h2>
          </div>

          {resultCount > 0 ? (
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-3">
              {showingPatterns
                ? patterns.map((p) => (
                    <OffenderCard key={p.ref} pattern={p} />
                  ))
                : convictions.map((c) => (
                    <ConvictedCard key={c.ref} record={c} />
                  ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-space-xs rounded-xl border border-dashed border-border bg-white py-space-xl text-center">
              <Icon name="inbox" className="text-[32px] text-slate-400" />
              <p className="font-sans text-body-md font-semibold text-slate-700">
                এই শর্তে কোনো নথি পাওয়া যায়নি।
              </p>
              <p className="max-w-md font-sans text-body-sm text-slate-600">
                নথি না থাকা আর তথ্য না পাওয়া এক নয় — এই তালিকা কেবল যাচাইকৃত
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

          {/* ── Category matrix ───────────────────────────────────── */}
          {showingPatterns ? <CategoryMatrix /> : null}
        </div>
      </section>
    </>
  );
}

/** The stacked share bar from the reference. */
function CategoryMatrix() {
  return (
    <div className="flex flex-col gap-space-sm rounded-xl border border-border bg-white p-space-md">
      <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <span className="font-mono text-label-xs font-bold tracking-wider text-bd-green uppercase">
            পরিসংখ্যান পর্যবেক্ষণ
          </span>
          <h3 className="font-display text-body-lg font-bold text-slate-900">
            অপরাধের ক্যাটাগরি ম্যাট্রিক্স
          </h3>
        </div>
        <ul className="flex flex-wrap items-center gap-space-sm font-mono text-[0.6875rem] text-slate-600">
          {categoryShares.map((c) => (
            <li key={c.label} className="flex items-center gap-1">
              <span className={cn("size-2.5 rounded-xs", c.swatch)} />
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        role="img"
        aria-label={categoryShares
          .map((c) => `${c.label} ${c.percent}%`)
          .join(", ")}
        className="flex h-4 w-full overflow-hidden rounded-lg border border-border bg-slate-100"
      >
        {categoryShares.map((c) => (
          <div
            key={c.label}
            className={cn("h-full", c.bar)}
            style={{ width: `${c.percent}%` }}
            title={`${c.label} (${c.percent}%)`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm font-sans text-body-sm text-slate-600">
        <span>
          সর্বোচ্চ সক্রিয় এলাকা: ঢাকা মহানগর উত্তর ও দক্ষিণ (
          {offenderStats.topDistrictShare})
        </span>
        <span className="font-mono text-[0.6875rem] text-slate-500">
          ভিত্তি: থানা এজাহার ও অভিযোগপত্রের সমষ্টি
        </span>
      </div>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
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
        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-space-md py-2",
        "font-display text-body-sm font-semibold transition-colors",
        "focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none",
        active
          ? "border-bd-green bg-bd-green text-white"
          : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
      )}
    >
      <Icon name={icon} className="text-[16px]" />
      {children}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 font-sans text-[0.6875rem] font-semibold transition-colors",
        "focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none",
        active
          ? "border-bd-green bg-bdgreen-50 text-bd-green"
          : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  children,
  className,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className={cn(
          "font-mono text-[0.6875rem] font-semibold",
          disabled ? "text-slate-400" : "text-slate-600",
        )}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-md border border-border bg-slate-50 px-3 py-2 font-sans text-body-sm text-slate-900 focus:border-bd-green focus:ring-3 focus:ring-bd-green/30 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      >
        {children}
      </select>
    </div>
  );
}
