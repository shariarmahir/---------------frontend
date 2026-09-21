import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { PostStats } from "@/components/feed/post-stats";
import {
  profilePostStats,
  profileUser,
  whoToFollow,
} from "@/data/profile";

/** The single pinned post — the Aponjon device announcement. */
export function ProfilePost() {
  return (
    <article className="border-b border-card-border p-space-md transition-colors hover:bg-mint-subtle/30">
      <div className="flex gap-space-sm">
        <Avatar
          initials={profileUser.initials}
          tone="mint"
          className="size-10 text-xs"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex min-w-0 flex-wrap items-center gap-x-space-xs">
              <span className="font-grotesk text-sm font-bold text-text-primary">
                {profileUser.nameBn}
              </span>
              <span className="font-sans text-xs text-text-muted">
                {profileUser.handle}
              </span>
              <span className="font-sans text-xs text-text-muted">·</span>
              <span className="font-sans text-xs text-text-muted">৯ সে.</span>
            </div>

            <div className="flex shrink-0 items-center gap-space-xs text-text-muted">
              <button
                type="button"
                aria-label="এআই বিশ্লেষণ"
                className="rounded-full p-1 transition-colors hover:bg-white hover:text-bd-green"
              >
                <Icon name="auto_awesome" className="text-base" />
              </button>
              <button
                type="button"
                aria-label="আরও বিকল্প"
                className="rounded-full p-1 transition-colors hover:bg-white hover:text-text-primary"
              >
                <Icon name="more_horiz" className="text-base" />
              </button>
            </div>
          </div>

          <div className="mt-1 space-y-1 font-sans text-body-md leading-relaxed text-text-primary">
            <p className="font-grotesk font-bold text-bd-green">
              আপনজন — AponjonAI DEVICE
            </p>
            <p>
              প্রথম ডিভাইস “আপনজন-Aponjon” মূলত দৈনন্দিন মানবদেহের ডেটা সংগ্রহ
              করে। এটি একটি নিউরো তথা ওয়্যারেবল এআই ডিভাইস যা শরীর থেকে ECG,
              EMG, SpO₂, তাপমাত্রা, গ্লুকোজ ও ভাইটালস সংগ্রহ করে দৈনিক স্ট্রেস ও
              এনার্জি স্কোর নির্ণয় করবে।
            </p>
          </div>

          <TelemetryAttachment />

          <div className="max-w-md">
            <PostStats stats={profilePostStats} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Embedded SWASTI telemetry dashboard preview. */
function TelemetryAttachment() {
  return (
    <div className="mt-space-sm overflow-hidden rounded-xl border border-card-border bg-mint-subtle/50 p-space-sm shadow-xs">
      <div className="flex flex-col items-stretch gap-space-sm rounded-lg border border-card-border bg-linear-to-r from-bd-green-light to-white p-space-sm md:flex-row">
        <ClinicianCard
          icon="stethoscope"
          name="ডা. কপিল শর্মা"
          role="ক্লিনিক্যাল নিউরো ভাইটালস"
          badge="ECG স্বাভাবিক"
          tone="mint"
        />

        {/* Live readout — the one dark panel, as in the source. */}
        <div className="flex flex-1 flex-col justify-center rounded-lg bg-bd-green p-space-sm text-center text-white shadow-sm">
          {/* Tracked-out display caps rather than font-mono: this was the
              page's only mono glyph, so the whole JetBrains face loaded
              for one 10px label ("preloaded but not used"). */}
          <p className="font-grotesk text-[10px] font-semibold tracking-[0.12em] text-emerald-200 uppercase">
            SWASTI Neuro
          </p>
          <p className="my-0.5 font-grotesk text-base font-extrabold">
            ৯৮.২
            <span className="font-sans text-[10px] font-normal">
              °F / ৯৯% SpO₂
            </span>
          </p>
          <p className="font-sans text-[9px] text-emerald-100">
            লাইভ টেলিমেট্রি সক্রিয়
          </p>
          <div
            role="img"
            aria-label="টেলিমেট্রি সিগন্যাল শক্তি ৮০ শতাংশ"
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-emerald-900"
          >
            <div className="h-full w-4/5 bg-white" />
          </div>
        </div>

        <ClinicianCard
          icon="person"
          name="ডা. এমিলি রবার্টস"
          role="গ্লুকোজ ও স্ট্রেস ৪.৯"
          badge="নির্ধারিত"
          tone="orange"
        />
      </div>

      <p className="mt-space-xs text-center font-sans text-[10px] font-medium text-text-muted">
        SWASTI · AponjonAI ওয়্যারেবল টেলিমেট্রি ড্যাশবোর্ড প্রিভিউ
      </p>
    </div>
  );
}

function ClinicianCard({
  icon,
  name,
  role,
  badge,
  tone,
}: {
  icon: string;
  name: string;
  role: string;
  badge: string;
  tone: "mint" | "orange";
}) {
  return (
    <div className="flex-1 rounded-lg border border-card-border bg-white p-space-sm text-center shadow-sm">
      <span className="mx-auto mb-1 flex size-12 items-center justify-center rounded-full bg-bd-green-light text-bd-green">
        <Icon name={icon} className="text-2xl" />
      </span>
      <p className="font-grotesk text-[11px] font-bold text-text-primary">
        {name}
      </p>
      <p className="font-sans text-[9px] text-text-muted">{role}</p>
      <span
        className={
          tone === "mint"
            ? "mt-1 inline-block rounded-full bg-bd-green-light px-2 py-0.5 font-sans text-[9px] font-bold text-bd-green"
            : "mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 font-sans text-[9px] font-bold text-signal-text"
        }
      >
        {badge}
      </span>
    </div>
  );
}

/** In-feed "who to follow" block below the post. */
export function WhoToFollow() {
  return (
    <section className="border-b border-card-border p-space-md">
      <h3 className="mb-space-sm font-grotesk text-base font-bold text-text-primary">
        যাদের অনুসরণ করতে পারেন
      </h3>

      <div className="flex flex-col gap-space-md">
        {whoToFollow.map((person) => (
          <div
            key={person.handle}
            className="flex items-center justify-between gap-space-sm"
          >
            <div className="flex min-w-0 items-center gap-space-sm">
              <Avatar
                initials={person.initials}
                tone="mint"
                className="size-10 text-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate font-grotesk text-sm font-bold text-text-primary">
                    {person.name}
                  </span>
                  {person.verified ? (
                    <Icon
                      name="verified"
                      className="shrink-0 text-base text-bd-green"
                      filled
                    />
                  ) : null}
                </div>
                <p className="truncate font-sans text-xs text-text-muted">
                  {person.handle}
                </p>
                {person.bio ? (
                  <p className="mt-0.5 truncate font-sans text-xs text-text-primary">
                    {person.bio}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-full bg-text-primary px-space-md py-1.5 font-sans text-xs font-semibold text-white transition-colors hover:bg-bd-green"
            >
              অনুসরণ
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-space-sm font-sans text-xs font-semibold text-bd-green hover:underline"
      >
        আরও দেখুন
      </button>
    </section>
  );
}
