"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  sourcePoints,
  unsupportedClaims,
  type EvidenceStatus,
  type Urgency,
} from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

const STATUS_CHIP: Record<EvidenceStatus, string> = {
  verified: "bg-surface-container text-deep-container",
  plausible: "bg-secondary-fixed text-signal-text",
  unverified: "bg-surface-container text-on-surface-variant",
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  verified: "Verified",
  plausible: "Plausible",
  unverified: "Needs verification",
};

const URGENCY_CHIP: Record<Urgency, string> = {
  "very-high": "bg-tertiary text-white",
  high: "bg-signal text-white",
  "medium-high": "bg-title text-on-surface",
  medium: "bg-outline text-white",
};

const URGENCY_LABEL: Record<Urgency, string> = {
  "very-high": "Very high",
  high: "High",
  "medium-high": "Med-high",
  medium: "Medium",
};

const THEMES = [
  "All",
  ...Array.from(new Set(sourcePoints.map((p) => p.theme))).sort(),
];

/**
 * The complete 32-point register, filterable by theme and evidence status.
 *
 * Source order is preserved so a reader can trace any row back to the
 * original numbered list.
 */
export function AmarRegister() {
  const [theme, setTheme] = useState("All");
  const [status, setStatus] = useState<EvidenceStatus | "All">("All");

  const rows = useMemo(
    () =>
      sourcePoints.filter(
        (p) =>
          (theme === "All" || p.theme === theme) &&
          (status === "All" || p.status === status),
      ),
    [theme, status],
  );

  const counts = useMemo(
    () => ({
      verified: sourcePoints.filter((p) => p.status === "verified").length,
      plausible: sourcePoints.filter((p) => p.status === "plausible").length,
      unverified: sourcePoints.filter((p) => p.status === "unverified").length,
    }),
    [],
  );

  return (
    <section
      id="register"
      className="w-full bg-surface px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
            SECTION 06 · THE FULL REGISTER
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            All 32 points, classified by evidence
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Each point is classified as a verified problem, plausible but
            under-measured, or a claim requiring verification. Honest
            classification is what makes the strong claims credible.
          </p>
        </div>

        {/* Evidence summary. */}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
          {(
            [
              [
                "verified",
                counts.verified,
                "Published measurement or documented finding",
              ],
              [
                "plausible",
                counts.plausible,
                "Reasonable but not yet measured",
              ],
              [
                "unverified",
                counts.unverified,
                "Proposal or claim needing primary data",
              ],
            ] as const
          ).map(([key, count, note]) => (
            <div
              key={key}
              className={cn(
                "flex items-center gap-space-md rounded-lg p-space-md shadow-xs",
                STATUS_CHIP[key],
              )}
            >
              <span className="font-display text-display-mobile font-extrabold leading-none">
                {count}
              </span>
              <span className="flex flex-col">
                <span className="font-label-md text-label-md font-bold">
                  {STATUS_LABEL[key]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {note}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Filters. */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-code-telemetry text-label-sm font-bold uppercase text-outline">
              Theme
            </span>
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={cn(
                  "rounded-full border px-space-sm py-1 font-label-sm text-label-sm transition-colors",
                  theme === t
                    ? "bg-deep-container text-white"
                    : "bg-surface-lowest text-on-surface-variant hover:shadow-sm hover:text-deep-container",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-code-telemetry text-label-sm font-bold uppercase text-outline">
              Evidence
            </span>
            {(["All", "verified", "plausible", "unverified"] as const).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className={cn(
                    "rounded-full border px-space-sm py-1 font-label-sm text-label-sm transition-colors",
                    status === s
                      ? "bg-on-surface text-white"
                      : "bg-surface-lowest text-on-surface-variant hover:shadow-sm",
                  )}
                >
                  {s === "All" ? "All" : STATUS_LABEL[s]}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Register table. */}
        <p className="font-label-sm text-label-sm text-outline lg:hidden">
          Swipe the table sideways to see every column →
        </p>
        <div className="overflow-x-auto rounded-lg bg-surface-lowest shadow-sm">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">
              The 32 source points with research interpretation, evidence status
              and urgency
            </caption>
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container">
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Topic
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Research interpretation
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Evidence
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Urgency
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr
                  key={p.n}
                  className={cn(
                    "border-b border-outline-variant/30 transition-colors hover:bg-surface-container/60",
                    i % 2 === 1 && "bg-surface-low/60",
                  )}
                >
                  <th
                    scope="row"
                    className="px-space-md py-space-md align-top font-code-telemetry text-label-md font-bold text-outline"
                  >
                    {String(p.n).padStart(2, "0")}
                  </th>
                  <td className="px-space-md py-space-md align-top">
                    <span className="block font-display text-label-md font-semibold text-on-surface">
                      {p.topic}
                    </span>
                    <span className="mt-0.5 inline-block rounded-sm bg-surface-container px-1.5 py-0.5 font-code-telemetry text-label-xs text-outline">
                      {p.theme}
                    </span>
                  </td>
                  <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-on-surface-variant">
                    {p.interpretation}
                    <span className="mt-1 block font-body-sm text-[0.75rem] text-outline italic">
                      {p.statusNote}
                    </span>
                  </td>
                  <td className="px-space-md py-space-md align-top">
                    <span
                      className={cn(
                        "inline-block rounded-full border px-space-sm py-0.5 font-code-telemetry text-label-xs font-bold whitespace-nowrap uppercase",
                        STATUS_CHIP[p.status],
                      )}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-space-md py-space-md align-top">
                    <span
                      className={cn(
                        "inline-block rounded-full px-space-sm py-0.5 font-code-telemetry text-label-xs font-bold whitespace-nowrap uppercase",
                        URGENCY_CHIP[p.urgency],
                      )}
                    >
                      {URGENCY_LABEL[p.urgency]}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-space-md py-space-lg text-center font-body-md text-body-md text-outline"
                  >
                    No points match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p className="font-code-telemetry text-label-sm text-outline">
          Showing {rows.length} of {sourcePoints.length} points
        </p>

        {/* Claims the evidence could not support. */}
        <div className="flex flex-col gap-space-sm rounded-lg border bg-secondary-fixed/60 p-space-lg">
          <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-signal-text">
            <Icon name="report" className="text-[18px]" />
            Claims the evidence could not support
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            These statements appear in the source list but are not usable
            national statistics without a defined population, measurement
            method, date and source. Naming them protects the credibility of
            everything above.
          </p>
          <ul className="flex flex-col gap-space-xs">
            {unsupportedClaims.map((claim) => (
              <li
                key={claim}
                className="flex items-start gap-space-xs font-body-sm text-body-sm text-on-surface-variant"
              >
                <Icon
                  name="close"
                  className="mt-0.5 shrink-0 text-[14px] text-signal-text"
                />
                {claim}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
