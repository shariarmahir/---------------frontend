import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import {
  complianceBadges,
  resumeSkills,
  trustReasons,
} from "@/data/signup";

/** Right column — live CV preview, trust rationale, compliance, helpdesk. */
export function SignupAside() {
  return (
    <div className="flex flex-col gap-space-lg">
      <ResumePreview />
      <TrustCard />
      <ComplianceCard />
      <EndorsementCard />
      <HelpdeskCard />
    </div>
  );
}

function ResumePreview() {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl border border-bd-green/30 bg-white p-space-md shadow-clean">
      <div className="flex items-center justify-between border-b border-card-border pb-2">
        <h2 className="flex items-center gap-2 font-grotesk text-label-sm font-bold text-text-primary">
          <Icon name="badge" className="text-lg text-bd-green" />
          লাইভ রিজিউমে প্রিভিউ (Live CV Sync)
        </h2>
        <span className="size-2 animate-pulse rounded-full bg-bd-green" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-card-border bg-mint-subtle p-space-md">
        <div className="flex items-center gap-3">
          <Avatar
            initials="MM"
            tone="mint"
            className="size-12 border-2 border-bd-green text-sm"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-grotesk text-base leading-snug font-semibold text-text-primary">
              মাহির শারিয়ার মাহিন
            </span>
            <span className="truncate font-grotesk text-[10px] font-semibold text-bd-green">
              Lead Deep-Tech Systems Engineer
            </span>
            <span className="truncate font-sans text-[11px] text-text-secondary">
              রক্তের গ্রুপ: A+ | মৌলভীবাজার
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {resumeSkills.map((skill) => (
            <span
              key={skill}
              className="rounded bg-white px-2 py-0.5 font-grotesk text-[10px] font-semibold text-text-primary"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-xs border-t border-card-border pt-2 font-sans text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <Icon name="link" className="text-xs text-bd-green" />
            mahir-innovations.bd
          </span>
          <span className="font-semibold text-bd-green">
            ভেরিফাইড আইডি #KND-9842
          </span>
        </div>
      </div>
    </section>
  );
}

function TrustCard() {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-white shadow-clean">
      {/* Cleanroom banner — drawn, not a stock photo. */}
      <div className="relative h-44 w-full overflow-hidden bg-linear-to-br from-bd-green-dark via-bd-green to-emerald-950">
        <div className="bg-grid-subtle absolute inset-0 opacity-25" />
        <div className="absolute inset-0 flex items-center justify-center gap-space-sm px-space-md">
          {["biotech", "precision_manufacturing", "public"].map((icon) => (
            <span
              key={icon}
              className="flex size-14 items-center justify-center rounded-lg border border-emerald-300/30 bg-slate-950/40 text-emerald-200"
            >
              <Icon name={icon} className="text-2xl" />
            </span>
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-space-xs">
          <span className="rounded bg-bd-green px-2 py-0.5 font-grotesk text-[10px] tracking-wider text-white uppercase">
            ঢাকা সেন্ট্রাল ক্লিনরুম
          </span>
          <span className="font-grotesk text-[10px] text-emerald-200">
            লাইভ টেলিমেট্রি
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm p-space-md">
        <h2 className="font-grotesk text-headline-sm font-semibold text-text-primary">
          কেন জাতীয় স্তরের সঠিক পরিচয় যাচাই আবশ্যক?
        </h2>
        <ul className="flex flex-col gap-2">
          {trustReasons.map((reason) => (
            <li key={reason.title} className="flex items-start gap-2">
              <Icon
                name="verified"
                className="mt-0.5 shrink-0 text-base text-bd-green"
              />
              <span className="font-sans text-body-sm text-text-secondary">
                <strong className="font-semibold text-text-primary">
                  {reason.title}
                </strong>{" "}
                {reason.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ComplianceCard() {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl border border-card-border bg-white p-space-md shadow-clean">
      <h2 className="flex items-center gap-2 border-b border-card-border pb-2 font-grotesk text-label-sm font-bold text-text-primary">
        <Icon name="gavel" className="text-lg text-bd-green" />
        লাইভ কমপ্লায়েন্স ও ট্রাস্ট সার্টিফিকেট
      </h2>

      <ul className="flex flex-col gap-2 pt-1">
        {complianceBadges.map((badge) => (
          <li
            key={badge.label}
            className="flex items-center justify-between gap-space-xs rounded-lg bg-mint-subtle p-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon
                name={badge.icon}
                className="shrink-0 text-base text-bd-green"
              />
              <span className="font-grotesk text-[10px] text-text-primary">
                {badge.label}
              </span>
            </span>
            <span className="shrink-0 font-grotesk text-[10px] font-semibold text-bd-green">
              {badge.status}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-col gap-1 rounded-lg bg-mint-subtle p-3">
        <div className="flex items-center justify-between font-grotesk text-[10px] text-text-secondary">
          <span>সার্ভার ভেরিফিকেশন লেটেন্সি</span>
          <span className="font-bold text-bd-green">99.98% আপটাইম</span>
        </div>
        <svg
          role="img"
          aria-label="সার্ভার লেটেন্সি স্পার্কলাইন — ৯৯.৯৮% আপটাইম"
          className="h-8 w-full text-bd-green"
          viewBox="0 0 200 30"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,20 Q20,10 40,18 T80,12 T120,22 T160,8 T200,15"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,20 Q20,10 40,18 T80,12 T120,22 T160,8 T200,15 L200,30 L0,30 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
        </svg>
      </div>
    </section>
  );
}

function EndorsementCard() {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl border border-card-border bg-white p-space-md shadow-clean">
      <div className="flex items-center gap-3">
        <Avatar initials="MM" tone="mint" className="size-12 text-sm" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-grotesk text-headline-sm font-semibold text-text-primary">
            মাহির শারিয়ার মাহিন
          </span>
          <span className="truncate font-grotesk text-[10px] text-text-secondary">
            প্রতিষ্ঠাতা ও প্রধান উদ্ভাবক, কাণ্ডারী-ল্যাব
          </span>
        </div>
      </div>
      <p className="border-t border-card-border pt-2 font-sans text-body-sm text-text-secondary italic">
        “আমরা বাংলাদেশের মেধা, গবেষণা ও পেশাগত দক্ষতাকে কোনো পরাশক্তির ক্লাউডে
        বন্দি রাখব না। আপনার প্রতিটি ডেটা সার্বভৌমভাবে এই মাটিতে সুরক্ষিত
        থাকবে।”
      </p>
    </section>
  );
}

function HelpdeskCard() {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-bd-green-light p-space-md shadow-clean">
      <h2 className="flex items-center gap-2 font-grotesk text-headline-sm font-semibold text-text-primary">
        <Icon name="support_agent" className="text-xl text-bd-green" />
        ভেরিফিকেশন হেল্পডেস্ক
      </h2>
      <p className="font-sans text-body-sm text-text-primary">
        এনআইডি বা পাসপোর্ট যাচাইকরণে কোনো প্রযুক্তিগত সমস্যা দেখা দিলে বা দ্রুত
        স্বীকৃতির প্রয়োজন হলে আমাদের জাতীয় হেল্পলাইনে যোগাযোগ করুন।
      </p>

      <div className="mt-1 flex flex-col gap-2">
        <a
          href="tel:16999"
          className="flex items-center justify-between gap-space-xs rounded-lg bg-white px-space-md py-2 shadow-sm transition-colors hover:bg-mint-subtle"
        >
          <span className="flex items-center gap-2 font-grotesk text-label-sm text-text-primary">
            <Icon name="call" className="text-base text-bd-green" />
            টোল-ফ্রি হেল্পলাইন: ১৬৯৯৯
          </span>
          <span className="font-grotesk text-[10px] font-bold text-bd-green">
            ২৪/৭ সক্রিয়
          </span>
        </a>
        <button
          type="button"
          className="flex items-center justify-between gap-space-xs rounded-lg bg-white px-space-md py-2 shadow-sm transition-colors hover:bg-mint-subtle"
        >
          <span className="flex items-center gap-2 font-grotesk text-label-sm text-text-primary">
            <Icon name="chat" className="text-base text-bd-green" />
            হোয়াটসঅ্যাপ সাপোর্ট নোড
          </span>
          <Icon name="open_in_new" className="text-base text-text-secondary" />
        </button>
      </div>
    </section>
  );
}
