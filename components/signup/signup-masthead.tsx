import { Icon } from "@/components/ui/icon";
import { signupSteps } from "@/data/signup";
import { cn } from "@/lib/utils";

/** Card shell shared by every block on this page. */
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-card-border bg-white p-space-md shadow-clean sm:p-space-lg",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Section title row with icon and a right-hand category chip. */
export function PanelHead({
  icon,
  title,
  chip,
  chipTone = "mint",
}: {
  icon: string;
  title: string;
  chip: string;
  chipTone?: "mint" | "neutral";
}) {
  return (
    <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm border-b border-card-border pb-space-sm">
      <h2 className="flex items-center gap-space-xs font-grotesk text-headline-sm font-semibold text-text-primary">
        <Icon name={icon} className="text-2xl text-bd-green" />
        {title}
      </h2>
      <span
        className={cn(
          "shrink-0 rounded px-2 py-0.5 font-grotesk text-[10px] font-bold",
          chipTone === "mint"
            ? "bg-bd-green-light text-bd-green"
            : "bg-mint-subtle text-signal-text",
        )}
      >
        {chip}
      </span>
    </div>
  );
}

/** Brand + sovereign status strip standing in for the global navbar. */
export function SignupStatusBar() {
  return (
    <div className="flex flex-col items-center justify-between gap-space-md rounded-xl border border-card-border bg-white p-space-md shadow-clean sm:flex-row">
      <div className="flex w-full items-center gap-space-md sm:w-auto">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-text-primary text-emerald-200 shadow-md">
          <Icon name="shield_with_house" className="text-2xl" />
        </span>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-grotesk text-headline-sm leading-none font-bold tracking-tight text-text-primary">
              Kandari-Lab
            </span>
            <span className="rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-semibold text-bd-green">
              ভেরিফিকেশন পোর্টাল v3.4
            </span>
          </div>
          <span className="mt-1 font-grotesk text-[10px] tracking-widest text-bd-green uppercase">
            জাতীয় সাইবার ও উদ্ভাবক ডাটাবেজ • গণপ্রজাতন্ত্রী বাংলাদেশ
          </span>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-start gap-space-sm sm:w-auto sm:justify-end">
        <span className="flex items-center gap-1.5 rounded-lg border border-card-border bg-mint-subtle px-space-md py-1.5">
          <span className="size-2 animate-pulse rounded-full bg-bd-green" />
          <span className="flex items-center gap-1 font-grotesk text-[10px] font-medium text-text-primary">
            <Icon name="lock" className="text-xs text-bd-green" />
            256-Bit PQC Sovereign Cloud
          </span>
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-bd-green/20 bg-bd-green-light px-space-md py-1.5 text-bd-green">
          <Icon name="sync_saved_locally" className="text-base" />
          <span className="font-grotesk text-[10px] font-semibold">
            অটো-রিজিউমে ড্রাফট সক্রিয়
          </span>
        </span>
      </div>
    </div>
  );
}

/** Portal banner — title, subtitle, Nazrul line, data-centre node. */
export function SignupBanner() {
  return (
    <Panel className="flex flex-col justify-between gap-space-md md:flex-row md:items-center">
      <div className="flex max-w-3xl flex-col gap-space-xs">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="inline-flex items-center gap-1 rounded bg-bd-green-light px-space-sm py-0.5 font-grotesk text-[10px] tracking-wider text-bd-green uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-bd-green" />
            গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-mint-subtle px-space-sm py-0.5 font-grotesk text-[10px] text-text-secondary">
            <Icon name="verified" className="text-xs text-bd-green" />
            Govt. NID &amp; Passport Gateway API v3.4
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-bd-green-light px-space-sm py-0.5 font-grotesk text-[10px] text-bd-green">
            <Icon name="badge" className="text-xs" />
            স্বয়ংক্রিয় প্রফেশনাল রিজিউমে সিঙ্ক
          </span>
        </div>

        <div className="mt-1 flex flex-col">
          <h1 className="font-grotesk text-headline-lg-mobile font-bold tracking-tight text-text-primary sm:text-headline-lg">
            কাণ্ডারী জাতীয় পরিচয়পত্র, ক্যারিয়ার প্রোফাইল ও উদ্ভাবক নিবন্ধন
          </h1>
          <p className="mt-1 font-sans text-body-lg text-text-secondary">
            Kandari Unified Identity &amp; Auto-Resume Infrastructure: Sovereign
            deep-tech access for researchers, engineers, doctors, students,
            freelancers, and professionals across 64 districts.
          </p>
        </div>

        <p className="mt-2 flex items-start gap-2 border-t border-card-border pt-2">
          <Icon name="format_quote" className="text-lg text-bd-green" />
          <span className="font-bengali text-body-sm font-medium text-text-primary italic">
            ‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’ — কাজী নজরুল ইসলাম
          </span>
        </p>
      </div>

      {/* Stacks on phones — side by side, the node name and the leakage
          badge each wrap to two lines and collide. */}
      <div className="flex flex-col gap-space-sm rounded-lg bg-mint-subtle p-space-md sm:flex-row sm:items-end sm:justify-between md:min-w-52.5 md:flex-col md:items-start">
        <span className="flex items-center gap-2">
          <Icon name="dns" className="text-xl text-bd-green" />
          <span className="flex flex-col">
            <span className="font-grotesk text-[10px] tracking-wider text-text-secondary uppercase">
              ডাটা সেন্টার নোড
            </span>
            <span className="font-grotesk text-headline-sm leading-tight font-semibold text-text-primary">
              কালিয়াকৈর (BCC)
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-bd-green" />
          <span className="font-grotesk text-[10px] font-semibold text-bd-green">
            জিরো ক্লাউড লিকেজ নিশ্চিত
          </span>
        </span>
      </div>
    </Panel>
  );
}

/** Five-step progress tracker. */
export function SignupSteps() {
  return (
    <div className="rounded-xl border border-card-border bg-white p-space-md shadow-clean">
      <ol className="no-scrollbar flex items-center justify-between gap-space-sm overflow-x-auto pb-1">
        {signupSteps.map((step, i) => (
          <li key={step.n} className="flex min-w-max items-center gap-3">
            <div
              className={cn(
                "flex min-w-max items-center gap-3",
                step.state === "upcoming" && "opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full font-grotesk text-label-sm font-bold shadow-sm",
                  step.state === "done" && "bg-bd-green text-white",
                  step.state === "active" &&
                    "bg-text-primary text-emerald-200",
                  step.state === "upcoming" && "bg-mint-subtle text-text-secondary",
                )}
              >
                {step.state === "done" ? (
                  <Icon name="check" className="text-base" />
                ) : (
                  step.n
                )}
              </span>
              <span className="flex flex-col">
                <span
                  className={cn(
                    "font-grotesk text-[10px] font-bold",
                    step.state === "done" && "text-bd-green",
                    step.state === "active" && "text-signal-text",
                    step.state === "upcoming" && "text-text-secondary",
                  )}
                >
                  {step.status}
                </span>
                <span
                  className={cn(
                    "font-grotesk text-label-sm",
                    step.state === "upcoming"
                      ? "text-text-secondary"
                      : "text-text-primary",
                  )}
                >
                  {step.label}
                </span>
              </span>
            </div>

            {i < signupSteps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "h-0.5 w-8 shrink-0 lg:w-16",
                  step.state === "done" ? "bg-bd-green-light" : "bg-card-border",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
