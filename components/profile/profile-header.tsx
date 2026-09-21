"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { mehek } from "@/data/member";
import { profileTabs, profileUser, setupCards } from "@/data/profile";
import { cn } from "@/lib/utils";

/** Sticky top bar — back control, display name, post count, search. */
export function ProfileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-card-border bg-white/90 px-space-md py-space-xs backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-space-lg">
        <button
          type="button"
          aria-label="পিছনে যান"
          onClick={() => window.history.back()}
          className="shrink-0 rounded-full p-space-xs text-text-primary transition-colors hover:bg-mint-subtle"
        >
          <Icon name="arrow_back" className="text-xl" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-grotesk text-headline-sm font-bold text-text-primary">
            {profileUser.nameBn}
          </h1>
          <p className="font-sans text-xs text-text-muted">
            {profileUser.postCount} পোস্ট
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="অনুসন্ধান"
        className="shrink-0 rounded-full p-space-xs text-text-primary transition-colors hover:bg-mint-subtle"
      >
        <Icon name="search" className="text-xl" />
      </button>
    </header>
  );
}

/** Cover banner, avatar, identity block, and the verification callout. */
export function ProfileIdentity() {
  const [showVerify, setShowVerify] = useState(true);

  return (
    <section>
      {/* Cover — the source's clinical mesh: a 20px offset dot lattice,
          denser than the shared `bg-grid-subtle` (32px @ 6%) used on the
          landing page, so it stays legible across a short 144px band. */}
      <div
        className="h-36 border-b border-card-border bg-mint-subtle"
        style={{
          backgroundImage:
            "radial-gradient(#c1e1d1 0.85px, transparent 0.85px), radial-gradient(rgb(0 103 71 / 0.07) 0.85px, transparent 0.85px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      />

      <div className="px-space-md pb-space-sm">
        <div className="relative -mt-16 mb-space-sm flex items-end justify-between gap-space-md">
          <span className="flex size-32 shrink-0 items-center justify-center rounded-full border-4 border-white bg-bd-green-light shadow-sm">
            <span className="font-grotesk text-headline-lg font-bold text-bd-green">
              {profileUser.initials}
            </span>
          </span>

          <button
            type="button"
            className="shrink-0 rounded-full border border-card-border px-space-md py-space-xs font-sans text-label-sm font-semibold text-text-primary transition-colors hover:border-bd-green hover:bg-mint-subtle"
          >
            প্রোফাইল সেট আপ
          </button>
        </div>

        <div className="mt-space-sm">
          <h2 className="font-grotesk text-headline-sm font-extrabold tracking-tight text-text-primary">
            {profileUser.nameBn}
          </h2>
          <p className="font-sans text-body-md text-text-muted">
            {profileUser.handle}
          </p>
        </div>

        <div className="mt-space-sm flex items-center gap-space-xs font-sans text-xs text-text-muted">
          <Icon name="calendar_month" className="text-base" />
          <span>যোগদান {profileUser.joined}</span>
        </div>

        <div className="mt-space-sm flex items-center gap-space-md font-sans text-xs">
          {/* The only account this user follows is Mehek, so the count
              goes straight to her profile rather than a one-row list. */}
          <Link
            href={`/u/${mehek.slug}`}
            className="text-text-muted hover:underline"
          >
            <strong className="font-grotesk text-sm font-bold text-text-primary">
              {profileUser.following}
            </strong>{" "}
            অনুসরণ করছেন
          </Link>
          <button type="button" className="text-text-muted hover:underline">
            <strong className="font-grotesk text-sm font-bold text-text-primary">
              {profileUser.followers}
            </strong>{" "}
            অনুসারী
          </button>
        </div>
      </div>

      {showVerify ? (
        <div className="relative mx-space-md my-space-sm rounded-xl border border-card-border bg-mint-subtle p-space-md">
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={() => setShowVerify(false)}
            className="absolute top-space-sm right-space-sm rounded-full p-1 text-text-muted transition-colors hover:bg-white hover:text-text-primary"
          >
            <Icon name="close" className="text-base" />
          </button>

          <div className="flex items-center gap-space-xs pr-space-lg">
            <span className="font-grotesk text-sm font-bold text-text-primary">
              আপনি এখনও যাচাইকৃত নন
            </span>
            <Icon name="verified" className="text-base text-bd-green" filled />
          </div>
          <p className="mt-1 pr-space-lg font-sans text-xs leading-relaxed text-text-secondary">
            যাচাইকরণে পাবেন অগ্রাধিকার রিপ্লাই, বিশ্লেষণ, বিজ্ঞাপনমুক্ত ব্রাউজিং
            ও আরও সুবিধা।
          </p>
          <button
            type="button"
            className="mt-space-sm rounded-full border border-card-border bg-white px-space-md py-1.5 font-sans text-xs font-bold text-text-primary shadow-xs transition-colors hover:bg-bd-green hover:text-white"
          >
            যাচাই করুন
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** Posts / Replies / Reposts / Media. */
export function ProfileTabs() {
  const [active, setActive] = useState(0);

  return (
    <nav className="mt-1 flex border-b border-card-border">
      {profileTabs.map((tab, i) => {
        const isActive = active === i;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(i)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1 py-space-sm font-sans text-sm transition-colors hover:bg-mint-subtle/50",
              isActive
                ? "font-bold text-text-primary"
                : "font-semibold text-text-secondary",
            )}
          >
            <span>{tab}</span>
            {isActive ? (
              <span className="absolute bottom-0 h-1 w-12 rounded-full bg-bd-green" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

/** Horizontal onboarding carousel. */
export function ProfileSetupCards() {
  return (
    <section className="border-b border-card-border p-space-md">
      <h3 className="mb-space-sm font-grotesk text-base font-bold text-text-primary">
        চলুন আপনাকে সেট আপ করি
      </h3>

      <div className="no-scrollbar flex gap-space-sm overflow-x-auto pb-space-xs">
        {setupCards.map((card) => (
          <button
            key={card.label}
            type="button"
            className={cn(
              "flex h-40 w-33 shrink-0 flex-col justify-between rounded-xl bg-linear-to-br p-space-sm text-left text-white shadow-sm transition-opacity hover:opacity-95",
              card.fill,
            )}
          >
            <span className="flex items-center justify-between gap-space-xs">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
                <Icon name={card.icon} className="text-lg" />
              </span>
              {card.badge ? (
                <span className="rounded bg-white/25 px-1.5 py-0.5 font-sans text-[10px] font-bold">
                  {card.badge}
                </span>
              ) : null}
            </span>
            <span className="font-sans text-xs leading-snug font-semibold">
              {card.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
