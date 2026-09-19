import { Icon } from "@/components/ui/icon";
import {
  COMPLAINT_POLICY,
  COMPLAINT_POLICY_BN,
  complaints,
  helplines,
} from "@/data/complaints";
import { cn } from "@/lib/utils";

/**
 * Page head: what this is, what it is not, and how to get help right now.
 *
 * The emergency helplines sit at the very top, above the form and above the
 * feed. Someone arriving here mid-crisis should reach 999 without reading
 * anything first; a complaint form is the wrong response to an emergency and
 * the page should not make them scroll past one to find the phone number.
 */
export function ComplaintMasthead() {
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <section className="w-full border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-lg px-gutter py-space-lg">
        <div className="flex flex-col gap-space-sm">
          <span className="flex w-fit items-center gap-1.5 rounded-full border border-crimson/30 bg-red-50 px-space-sm py-1 font-sans text-[0.75rem] font-semibold text-crimson">
            <Icon name="campaign" className="text-[14px]" filled />
            প্রতিবাদ · Complaint Centre
          </span>

          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-tight sm:text-[2.25rem]">
            <span className="text-primary">অন্যায়ের বিরুদ্ধে </span>
            <span className="text-crimson">অভিযোগ</span>
          </h1>

          <p className="max-w-3xl font-sans text-body-md leading-relaxed text-slate-600">
            Report extortion, bribery, land grabbing, service denial and other
            unlawful conduct. Each category tells you which authority actually
            handles it — and the complaint stays on public record here.
          </p>
        </div>

        {/* Emergency first. */}
        <div className="flex flex-col gap-space-sm rounded-xl border-2 border-crimson/25 bg-red-50/60 p-space-md">
          <span className="flex items-center gap-space-xs font-display text-label-md font-bold text-crimson">
            <Icon name="emergency" className="text-[18px]" filled />
            In immediate danger? Call first, file later.
          </span>
          <div className="flex flex-wrap gap-space-sm">
            {helplines.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className={cn(
                  "group flex min-w-[9rem] flex-1 items-center gap-space-sm rounded-lg border bg-white px-space-md py-space-sm transition-all",
                  "hover:-translate-y-px hover:shadow-sm",
                  "focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:outline-none",
                  h.emergency
                    ? "border-crimson/40 hover:border-crimson"
                    : "border-border hover:border-slate-400",
                )}
              >
                <Icon
                  name={h.icon}
                  className={cn(
                    "text-[20px]",
                    h.emergency ? "text-crimson" : "text-slate-500",
                  )}
                  filled={h.emergency}
                />
                <span className="flex min-w-0 flex-col">
                  <span
                    className={cn(
                      "font-display text-[1.125rem] leading-none font-extrabold",
                      h.emergency ? "text-crimson" : "text-slate-900",
                    )}
                  >
                    {h.number}
                  </span>
                  <span className="truncate font-sans text-[0.75rem] text-slate-600">
                    {h.label}
                  </span>
                </span>
              </a>
            ))}
          </div>
          <p className="font-sans text-[0.75rem] text-slate-600">
            999 and 109 are free national helplines, available 24 hours.
          </p>
        </div>

        {/* What this is and is not. */}
        <div className="flex flex-col gap-space-xs border-t border-border pt-space-md">
          <p className="flex max-w-3xl items-start gap-1.5 font-sans text-[0.8125rem] leading-relaxed text-slate-600">
            <Icon
              name="info"
              className="mt-px shrink-0 text-[15px] text-slate-400"
            />
            <span>{COMPLAINT_POLICY}</span>
          </p>
          <p className="max-w-3xl pl-[1.35rem] font-sans text-[0.8125rem] leading-relaxed text-slate-500">
            {COMPLAINT_POLICY_BN}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-md border-t border-border pt-space-md font-sans text-[0.8125rem] text-slate-600">
          <span className="flex items-center gap-1.5">
            <Icon name="forum" className="text-[15px] text-slate-400" />
            {complaints.length} complaints on record
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <Icon name="task_alt" className="text-[15px]" />
            {resolved} resolved
          </span>
        </div>
      </div>
    </section>
  );
}
