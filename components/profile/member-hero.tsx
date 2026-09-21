"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { memberTabs, type MemberProfile } from "@/data/member";
import { cn } from "@/lib/utils";

/** Sticky strip above the hero — name, activity line, grid badge. */
export function MemberTopBar({ member }: { member: MemberProfile }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-space-sm border-b border-card-border bg-white/90 px-space-md py-space-xs backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-space-sm">
        <button
          type="button"
          aria-label="পিছনে যান"
          onClick={() => window.history.back()}
          className="shrink-0 rounded-full p-space-xs text-text-primary transition-colors hover:bg-mint-subtle"
        >
          <Icon name="arrow_back" className="text-xl" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-space-xs">
            <h1 className="truncate font-grotesk text-headline-sm font-bold text-text-primary">
              {member.name}
            </h1>
            <Icon
              name="verified"
              className="shrink-0 text-lg text-bd-green"
              filled
            />
          </div>
          <p className="truncate font-sans text-xs text-text-muted">
            {member.postCount}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-space-sm">
        <span className="hidden items-center gap-space-xs rounded-full bg-mint-subtle px-space-sm py-space-xs sm:flex">
          <span className="size-2 animate-ping rounded-full bg-bd-green" />
          <span className="font-grotesk text-[10px] font-bold tracking-wider text-bd-green uppercase">
            Sylhet Node #07
          </span>
        </span>
        <button
          type="button"
          aria-label="আরও বিকল্প"
          className="flex size-8 items-center justify-center rounded-full bg-mint-subtle text-text-primary transition-colors hover:bg-bd-green-light"
        >
          <Icon name="more_horiz" className="text-lg" />
        </button>
      </div>
    </div>
  );
}

/** Cover banner, avatar, follow controls, bio, and the stats strip. */
export function MemberHero({ member }: { member: MemberProfile }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative w-full bg-white">
      {/* Cleanroom banner — deep green field with a grid lattice and two
          soft blooms, closing on the orange→green laser rule. */}
      <div className="relative h-52 w-full overflow-hidden bg-linear-to-r from-bd-green-dark via-bd-green to-emerald-950 sm:h-64">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full opacity-20"
        >
          <defs>
            <pattern
              id="memberGrid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="#caead7"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#memberGrid)" />
          <circle
            cx="85%"
            cy="30%"
            r="90"
            fill="#ff9100"
            opacity="0.18"
            filter="blur(30px)"
          />
          <circle
            cx="15%"
            cy="80%"
            r="70"
            fill="#a0f4ca"
            opacity="0.2"
            filter="blur(25px)"
          />
        </svg>

        <div className="absolute top-space-md right-space-md flex flex-col items-end opacity-75">
          <span className="flex items-center gap-space-xs font-grotesk text-[10px] font-bold tracking-widest text-emerald-100 uppercase">
            <Icon name="satellite_alt" className="text-xs" />
            BD-SAT-02 · TELEMETRY ACTIVE
          </span>
          <span className="font-grotesk text-[10px] tracking-wider text-amber-300">
            GEO: {member.coords.replace(/[[\]]/g, "")}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-signal-orange to-bd-green" />
      </div>

      <div className="px-space-md pb-space-md sm:px-space-lg">
        {/* Avatar + actions. */}
        <div className="relative -mt-16 mb-space-md flex items-end justify-between gap-space-sm sm:-mt-20">
          <div className="relative shrink-0">
            <span className="flex size-28 items-center justify-center rounded-full bg-white p-1 shadow-md sm:size-36">
              <span className="flex size-full items-center justify-center rounded-full bg-bd-green-light font-grotesk text-headline-lg font-bold text-bd-green">
                {member.initials}
              </span>
            </span>
            <span
              title="Kandari Verified Architect"
              className="absolute right-1 bottom-1 flex items-center justify-center rounded-full bg-bd-green p-1 text-white shadow-sm sm:right-2 sm:bottom-2"
            >
              <Icon name="verified_user" className="text-lg" filled />
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-space-xs pb-1 sm:gap-space-sm">
            <span className="hidden items-center gap-space-xs rounded-full bg-mint-subtle px-space-sm py-1.5 shadow-sm md:flex">
              <span className="size-2.5 animate-pulse rounded-full bg-bd-green" />
              <span className="font-grotesk text-[10px] font-bold text-bd-green">
                SWASTI Sync Active
              </span>
            </span>

            <button
              type="button"
              title="বার্তা পাঠান"
              aria-label="বার্তা পাঠান"
              className="flex size-9 items-center justify-center rounded-full bg-mint-subtle text-text-primary shadow-sm transition-colors hover:bg-bd-green-light"
            >
              <Icon name="mail" className="text-lg" />
            </button>
            <button
              type="button"
              title="নোড শেয়ার করুন"
              aria-label="নোড শেয়ার করুন"
              className="flex size-9 items-center justify-center rounded-full bg-mint-subtle text-text-primary shadow-sm transition-colors hover:bg-bd-green-light"
            >
              <Icon name="share" className="text-lg" />
            </button>

            {/* The one control that matters on someone else's profile. */}
            <button
              type="button"
              aria-pressed={following}
              onClick={() => setFollowing((prev) => !prev)}
              className={cn(
                "flex items-center gap-space-xs rounded-full px-space-md py-1.5 font-grotesk text-label-sm font-bold shadow-sm transition-all active:translate-y-px",
                following
                  ? "border border-bd-green bg-white text-bd-green hover:border-national-crimson hover:bg-red-50 hover:text-national-crimson"
                  : "bg-signal-orange text-text-primary hover:bg-amber-600 hover:shadow",
              )}
            >
              <Icon
                name={following ? "check" : "person_add"}
                className="text-sm"
              />
              <span>{following ? "অনুসরণ করছেন" : "অনুসরণ করুন"}</span>
            </button>
          </div>
        </div>

        {/* Identity and bio. */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs">
            <h2 className="font-grotesk text-headline-md font-bold tracking-tight text-text-primary">
              {member.name}
            </h2>
            <span className="font-bengali text-headline-sm font-medium text-text-secondary">
              ({member.nameBn})
            </span>
            <span className="rounded bg-bd-green-light px-2 py-0.5 font-grotesk text-[10px] font-bold tracking-wider text-bd-green uppercase">
              {member.rank}
            </span>
          </div>

          <p className="font-sans text-body-md text-text-muted">
            {member.handle}
          </p>

          <p className="mt-space-xs max-w-3xl font-sans text-body-lg leading-relaxed text-text-primary">
            {member.bioLead}{" "}
            <span className="font-bold text-bd-green">@KandariLab</span>{" "}
            (কাণ্ডারী-ল্যাব) ·{" "}
            <span className="font-bengali font-medium text-bd-green italic">
              “{member.bioQuote}”
            </span>{" "}
            {member.bioTail}
          </p>

          {/* Metadata row. */}
          <div className="mt-space-xs flex flex-wrap items-center gap-x-space-md gap-y-space-xs font-sans text-body-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Icon name="location_on" className="text-base text-bd-green" />
              <span>
                {member.location}{" "}
                <span className="font-grotesk text-[10px]">
                  {member.coords}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="link" className="text-base text-bd-green" />
              <span className="font-semibold text-bd-green">{member.site}</span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="hub" className="text-base text-signal-text" />
              <span className="font-medium text-text-primary">
                {member.grid}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="calendar_month" className="text-base" />
              <span>{member.joined} থেকে যুক্ত</span>
            </span>
          </div>

          {/* Stats strip. */}
          <div className="mt-space-sm flex flex-wrap items-center gap-x-space-lg gap-y-space-xs pt-space-xs">
            <span className="flex items-center gap-1">
              <strong className="font-grotesk text-headline-sm font-bold text-text-primary">
                {member.following}
              </strong>
              <span className="font-sans text-body-sm text-text-muted">
                অনুসরণ করছেন
              </span>
            </span>
            <span className="flex items-center gap-1">
              <strong className="font-grotesk text-headline-sm font-bold text-text-primary">
                {member.followers}
              </strong>
              <span className="font-sans text-body-sm text-text-muted">
                অনুসারী
              </span>
            </span>
            <span className="flex items-center gap-1 rounded-md bg-bd-green-light px-space-sm py-0.5">
              <strong className="font-grotesk text-headline-sm font-bold text-bd-green">
                {member.patents}
              </strong>
              <span className="font-grotesk text-[10px] font-bold text-bd-green">
                কমার্শিয়াল প্যাটেন্ট
              </span>
            </span>
            <span className="flex items-center gap-1 rounded-md bg-orange-50 px-space-sm py-0.5">
              <strong className="font-grotesk text-headline-sm font-bold text-signal-text">
                {member.merged}
              </strong>
              <span className="font-grotesk text-[10px] font-bold text-text-primary">
                সলিউশন মার্জড্
              </span>
            </span>
          </div>
        </div>
      </div>

      <MemberTabs />
    </div>
  );
}

function MemberTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="no-scrollbar flex items-center overflow-x-auto border-b border-card-border bg-white px-space-md">
      {memberTabs.map((tab, i) => {
        const isActive = active === i;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-1 px-space-md py-space-md font-grotesk text-label-sm whitespace-nowrap transition-colors",
              isActive
                ? "font-bold text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.live ? (
              <span className="size-2 rounded-full bg-bd-green" />
            ) : null}
            <span>{tab.label}</span>
            {tab.count ? (
              <span className="rounded bg-bd-green-light px-1.5 font-grotesk text-[10px] font-bold text-bd-green">
                {tab.count}
              </span>
            ) : null}
            {isActive ? (
              <span className="absolute inset-x-space-md bottom-0 h-1 rounded-t-sm bg-signal-orange" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
