"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { glowStyle } from "@/components/ui/surfaces";
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
  const mins = Math.max(1, Math.round((COMPLAINT_ANCHOR_MS - +new Date(iso)) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const pill = (on: boolean) =>
  cn(
    "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-sans text-[0.8125rem] font-semibold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
    on ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
  );

const action =
  "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 font-sans text-[0.8125rem] font-bold [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-150 active:scale-90";

/**
 * The community feed — ink cards on the black ground, each with a solid
 * category chip, lifting and glowing in its category colour on hover and
 * press; supporting a complaint pops the hand and turns the button red.
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
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  /** Locally marked resolved, keyed by complaint id. */
  const [locallyResolved, setLocallyResolved] = useState<Record<string, boolean>>({});
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  const items = useMemo(
    () =>
      complaints
        .filter((c) => active === "all" || c.category === active)
        .filter((c) => statusFilter === "all" || c.status === statusFilter)
        .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    [active, statusFilter],
  );

  const countFor = (id: ComplaintCategory) => complaints.filter((c) => c.category === id).length;

  return (
    <section id="community" aria-labelledby="community-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          kicker="কাণ্ডারী অভিযোগ কমিউনিটি"
          title={<span id="community-title">On public record</span>}
          lead="Support a complaint if it has happened to you too — a pattern is harder for an authority to set aside than a single report."
        />

        {/* Filters. */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="no-scrollbar relative flex items-center gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setActive("all")} aria-pressed={active === "all"} className={pill(active === "all")}>
              All
              <span className="font-mono text-[0.75rem] opacity-75">{complaints.length}</span>
            </button>
            {complaintCategories.map((c) => {
              const n = countFor(c.id);
              if (n === 0) return null;
              return (
                <button key={c.id} type="button" onClick={() => setActive(c.id)} aria-pressed={active === c.id} className={pill(active === c.id)}>
                  <Icon name={c.icon} className="text-[16px]" />
                  {c.label}
                  <span className="font-mono text-[0.75rem] opacity-75">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-white/70 uppercase">Status</span>
            {(["all", "filed", "acknowledged", "resolved"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)} aria-pressed={statusFilter === s} className={pill(statusFilter === s)}>
                {s === "all" ? "All" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? <p className="py-16 text-center font-sans text-body-md text-white/65">No complaints match this filter.</p> : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((c, i) => {
            const meta = complaintCategories.find((x) => x.id === c.category) ?? complaintCategories[0];
            const isResolved = c.status === "resolved" || locallyResolved[c.id] === true;
            const status = isResolved ? STATUS_META.resolved : STATUS_META[c.status];
            const didSupport = supported[c.id] === true;

            return (
              <article
                key={`${active}-${statusFilter}-${c.id}`}
                style={{ ...glowStyle(meta.urgent ? "var(--color-national-crimson)" : "var(--color-signal-orange)"), animationDelay: `${i * 50}ms` }}
                className={cn(
                  "animate-nav-card-in flex flex-col gap-3 rounded-3xl bg-text-primary p-5 text-white shadow-sm ring-1 sm:p-6",
                  "[-webkit-tap-highlight-color:transparent] transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-20px_var(--glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  isResolved ? "ring-bdgreen-500/60" : "ring-white/12",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[0.6875rem] font-bold", meta.chip)}>
                    <Icon name={meta.icon} className="text-[13px]" />
                    {meta.label}
                  </span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[0.6875rem] font-bold", status.chip)}>
                    <Icon name={status.icon} className="text-[13px]" />
                    {status.label}
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-white/60">
                    <time dateTime={c.at}>{ago(c.at)}</time>
                  </span>
                </div>

                <h3
                  className={cn(
                    "font-grotesk text-lg leading-snug font-bold",
                    isResolved ? "text-white/55 line-through decoration-bdgreen-500 decoration-2" : "text-white",
                  )}
                >
                  {c.title}
                </h3>

                <p className="font-sans text-[0.875rem] leading-relaxed text-white/80">{c.body}</p>

                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-[0.75rem] text-white/65">
                  <Icon name="person" className="text-[14px]" />
                  <span className="font-semibold text-white/85">{c.author ?? "Anonymous"}</span>
                  <span aria-hidden>·</span>
                  <Icon name="location_on" className="text-[14px]" />
                  <span>{c.district}</span>
                </span>

                <span className="flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 font-sans text-[0.75rem] text-white/75">
                  <Icon name="alt_route" className="text-[15px] text-signal-orange" />
                  Routes to <span className="font-bold text-white">{meta.routesTo.authority}</span>
                </span>

                {/* Actions. */}
                <div className="flex flex-wrap items-center gap-2 border-t border-white/12 pt-3">
                  <button
                    type="button"
                    onClick={() => setSupported((s) => ({ ...s, [c.id]: !s[c.id] }))}
                    aria-pressed={didSupport}
                    className={cn(action, didSupport ? "bg-national-crimson text-white" : "bg-white/10 text-white hover:bg-white/20")}
                  >
                    <Icon
                      name="front_hand"
                      className={cn("text-[16px] transition-transform duration-300 motion-reduce:transition-none", didSupport && "scale-125 -rotate-12")}
                      filled={didSupport}
                    />
                    <span className="tabular-nums">{c.supports + (didSupport ? 1 : 0)}</span>
                    <span className="sr-only"> people support this</span>
                  </button>

                  <button type="button" className={cn(action, "bg-white/10 text-white hover:bg-white/20")}>
                    <Icon name="comment" className="text-[16px]" />
                    <span className="tabular-nums">{c.comments}</span>
                    <span className="sr-only"> comments</span>
                  </button>

                  <button type="button" className={cn(action, "bg-white/10 text-white hover:bg-white/20")}>
                    <Icon name="share" className="text-[16px]" />
                    Share
                  </button>

                  {/* Resolve checkbox. */}
                  <label
                    className={cn(
                      action,
                      "ml-auto cursor-pointer has-focus-visible:ring-2 has-focus-visible:ring-signal-orange",
                      isResolved ? "bg-bdgreen-500 text-text-primary" : "bg-white/10 text-white hover:bg-white/20",
                      c.status === "resolved" && "cursor-default",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isResolved}
                      disabled={c.status === "resolved"}
                      onChange={(e) => setLocallyResolved((r) => ({ ...r, [c.id]: e.target.checked }))}
                      className="sr-only"
                    />
                    <Icon name={isResolved ? "task_alt" : "radio_button_unchecked"} className="text-[16px]" />
                    <span className="font-bengali">সমাধান হয়েছে</span>
                  </label>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 flex items-start gap-1.5 font-sans text-[0.75rem] leading-relaxed text-white/65">
          <Icon name="info" className="mt-px shrink-0 text-[14px]" />
          <span>
            Support, comments and the resolved mark are recorded in this browser only and are not yet shared with other readers. Complaints
            shown here are illustrative examples, not real citizen reports.
          </span>
        </p>
      </div>
    </section>
  );
}
