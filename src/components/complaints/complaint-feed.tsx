"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  COMPLAINT_ANCHOR_MS,
  complaintCategories,
  complaints,
  STATUS_META,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/data/complaints";
import { cn } from "@/lib/utils";

/** Relative time against a fixed anchor, so SSR and client agree. */
function ago(iso: string): string {
  const mins = Math.max(
    1,
    Math.round((COMPLAINT_ANCHOR_MS - +new Date(iso)) / 60_000),
  );
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * The community feed.
 *
 * Complaints are public by default, because a record that only the
 * complainant can see offers no protection. Supporting a complaint is the
 * community signal — several people reporting the same extortion in the same
 * market is materially different from one person reporting it.
 *
 * The resolve checkbox is local to this browser: marking someone else's
 * complaint resolved must never change what other people see, and only the
 * authority or the complainant can really say a matter is settled.
 *
 * TODO(backend): GET /api/v1/complaints, POST supports, POST comments, and
 * resolution confirmed by the complainant rather than any passing reader.
 */
export function ComplaintFeed() {
  const [active, setActive] = useState<ComplaintCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">(
    "all",
  );
  /** Locally marked resolved, keyed by complaint id. */
  const [locallyResolved, setLocallyResolved] = useState<
    Record<string, boolean>
  >({});
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  const items = useMemo(
    () =>
      complaints
        .filter((c) => active === "all" || c.category === active)
        .filter((c) => statusFilter === "all" || c.status === statusFilter)
        .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    [active, statusFilter],
  );

  const countFor = (id: ComplaintCategory) =>
    complaints.filter((c) => c.category === id).length;

  return (
    <section
      id="community"
      className="w-full border-b border-border bg-slate-50 px-gutter py-space-lg"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-display text-headline-md font-extrabold tracking-tight text-slate-900">
            কাণ্ডারী অভিযোগ কমিউনিটি
          </h2>
          <p className="max-w-2xl font-sans text-body-sm leading-relaxed text-slate-600">
            Complaints on public record. Support one if it has happened to you
            too — a pattern is harder for an authority to set aside than a
            single report.
          </p>
        </div>

        {/* Filters. */}
        <div className="flex flex-col gap-space-sm">
          <div className="no-scrollbar flex items-center gap-space-xs overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActive("all")}
              aria-pressed={active === "all"}
              className={cn(
                "shrink-0 rounded-lg border px-space-md py-1.5 font-sans text-[0.8125rem] font-semibold transition-colors",
                active === "all"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-border bg-white text-slate-600 hover:border-slate-400",
              )}
            >
              All
              <span className="ml-1.5 text-[0.75rem] opacity-70">
                {complaints.length}
              </span>
            </button>
            {complaintCategories.map((c) => {
              const n = countFor(c.id);
              if (n === 0) return null;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(c.id)}
                  aria-pressed={active === c.id}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg border px-space-md py-1.5 font-sans text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                    active === c.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-border bg-white text-slate-600 hover:border-slate-400",
                  )}
                >
                  <Icon name={c.icon} className="text-[14px]" />
                  {c.label}
                  <span className="text-[0.75rem] opacity-70">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
              Status
            </span>
            {(["all", "filed", "acknowledged", "resolved"] as const).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                  className={cn(
                    "rounded-lg border px-space-sm py-1 font-sans text-[0.8125rem] font-medium transition-colors",
                    statusFilter === s
                      ? "border-primary bg-emerald-50 text-primary"
                      : "border-border bg-white text-slate-600 hover:border-slate-400",
                  )}
                >
                  {s === "all" ? "All" : STATUS_META[s].label}
                </button>
              ),
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="py-space-xl text-center font-sans text-body-md text-slate-500">
            No complaints match this filter.
          </p>
        ) : null}

        {/* Cards. */}
        <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
          {items.map((c) => {
            const meta =
              complaintCategories.find((x) => x.id === c.category) ??
              complaintCategories[0];
            const isResolved =
              c.status === "resolved" || locallyResolved[c.id] === true;
            const status = isResolved
              ? STATUS_META.resolved
              : STATUS_META[c.status];
            const didSupport = supported[c.id] === true;

            return (
              <article
                key={c.id}
                className={cn(
                  "flex flex-col gap-space-sm rounded-xl border bg-white p-space-md transition-colors",
                  isResolved ? "border-primary/40" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold",
                      meta.chip,
                    )}
                  >
                    <Icon name={meta.icon} className="text-[12px]" />
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold",
                      status.chip,
                    )}
                  >
                    <Icon name={status.icon} className="text-[12px]" />
                    {status.label}
                  </span>
                </div>

                <h3
                  className={cn(
                    "font-display text-[1.0625rem] leading-snug font-bold",
                    isResolved
                      ? "text-slate-500 line-through decoration-primary/50"
                      : "text-slate-900",
                  )}
                >
                  {c.title}
                </h3>

                <p className="font-sans text-[0.875rem] leading-relaxed text-slate-600">
                  {c.body}
                </p>

                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-[0.75rem] text-slate-500">
                  <Icon name="person" className="text-[13px]" />
                  <span className="font-medium text-slate-600">
                    {c.author ?? "Anonymous"}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={c.at}>{ago(c.at)}</time>
                  <span aria-hidden>·</span>
                  <span>{c.district}</span>
                </span>

                <span className="rounded-md bg-slate-50 px-space-xs py-1 font-sans text-[0.75rem] text-slate-600">
                  <Icon
                    name="alt_route"
                    className="mr-1 text-[12px] text-slate-400"
                  />
                  Routes to{" "}
                  <span className="font-semibold text-slate-900">
                    {meta.routesTo.authority}
                  </span>
                </span>

                {/* Actions. */}
                <div className="flex flex-wrap items-center gap-space-sm border-t border-border pt-space-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setSupported((s) => ({ ...s, [c.id]: !s[c.id] }))
                    }
                    aria-pressed={didSupport}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-space-sm py-1 font-sans text-[0.8125rem] font-semibold transition-colors",
                      didSupport
                        ? "border-crimson bg-red-50 text-crimson"
                        : "border-border bg-white text-slate-600 hover:border-slate-400",
                    )}
                  >
                    <Icon
                      name="front_hand"
                      className="text-[15px]"
                      filled={didSupport}
                    />
                    {c.supports + (didSupport ? 1 : 0)}
                    <span className="sr-only"> people support this</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-space-sm py-1 font-sans text-[0.8125rem] font-semibold text-slate-600 transition-colors hover:border-slate-400"
                  >
                    <Icon name="comment" className="text-[15px]" />
                    {c.comments}
                    <span className="sr-only"> comments</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-space-sm py-1 font-sans text-[0.8125rem] font-semibold text-slate-600 transition-colors hover:border-slate-400"
                  >
                    <Icon name="share" className="text-[15px]" />
                    Share
                  </button>

                  {/* Resolve checkbox. */}
                  <label
                    className={cn(
                      "ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg border px-space-sm py-1 transition-colors",
                      isResolved
                        ? "border-primary bg-emerald-50"
                        : "border-border bg-white hover:border-slate-400",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isResolved}
                      disabled={c.status === "resolved"}
                      onChange={(e) =>
                        setLocallyResolved((r) => ({
                          ...r,
                          [c.id]: e.target.checked,
                        }))
                      }
                      className="size-4 accent-[var(--primary)]"
                    />
                    <span
                      className={cn(
                        "font-sans text-[0.8125rem] font-semibold",
                        isResolved ? "text-primary" : "text-slate-600",
                      )}
                    >
                      সমাধান হয়েছে
                    </span>
                  </label>
                </div>
              </article>
            );
          })}
        </div>

        <p className="flex items-start gap-1.5 font-sans text-[0.75rem] leading-relaxed text-slate-500">
          <Icon
            name="info"
            className="mt-px shrink-0 text-[14px] text-slate-400"
          />
          <span>
            Support, comments and the resolved mark are recorded in this browser
            only and are not yet shared with other readers. Complaints shown
            here are illustrative examples, not real citizen reports.
          </span>
        </p>
      </div>
    </section>
  );
}
