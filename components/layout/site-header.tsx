"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BangladeshButton } from "@/components/ui/bangladesh-button";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { CivicActions } from "@/components/ui/civic-actions";
import { Icon } from "@/components/ui/icon";
import { NavIndicators } from "@/components/ui/nav-indicators";
import { TodayButton } from "@/components/ui/today-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAZRUL_MOTTO, navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [activeHref, setActiveHref] = useState(navLinks[0].href);

  return (
    // z-40, deliberately BELOW the Sheet overlay's z-50. At equal z-index
    // the painting order falls back to DOM order, so the mobile menu could
    // render behind the header it was opened from. The layering runs
    // status < header < overlay, never equal.
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-border bg-white/95 shadow-sm backdrop-blur-xl">
      {/* Utility strip — the thin top line of the reference header. Holds
          the live national status that previously sat in a separate band
          below the header, so the bar reads as one unit. Desktop only;
          mobile has no room for a third row. */}
      <div className="hidden border-b border-border/70 bg-slate-50 lg:block">
        <div className="mx-auto flex h-8 w-full max-w-[1440px] items-center justify-between gap-space-md px-gutter font-sans text-[0.75rem] text-slate-600">
          {/* `min-w-0` so this group can shrink, and `truncate` so the long
              label ellipsises rather than pushing into the group opposite.
              A flex child defaults to `min-width:auto`, which refuses to
              shrink below its content — that is how two groups in a
              `justify-between` row end up colliding instead of compressing. */}
          <span className="flex min-w-0 items-center gap-space-xs">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
            <span className="truncate font-semibold text-primary">
              Bangladesh National Telemetry Lattice
            </span>
            <span className="shrink-0 text-slate-400">·</span>
            <span className="shrink-0 whitespace-nowrap">NODE-64 ACTIVE</span>
          </span>

          <span className="flex shrink-0 items-center gap-space-md">
            <span className="hidden xl:inline">
              Golden 2-Hours Critical Response Protocol:{" "}
              <span className="font-semibold text-primary">ONLINE</span>
            </span>
            <span className="flex items-center gap-space-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              BD GRID: <span className="font-semibold">99.98%</span>
            </span>
          </span>
        </div>
      </div>

      {/* Row 1 — identity, centred live readout, primary conversion.

          The height is FIXED, not `min-h`. With `min-h` the row grew
          whenever a child was taller than the minimum — the 44px indicator
          card plus padding pushed it to ~78px against the ~62px of the
          reference header, which is what made the bar look heavy. A fixed
          height means the row is the row, and children fit inside it.

          The centre card is centred by `flex-1` side blocks rather than by a
          `1fr_auto_1fr` grid. An equal-column grid reserves the SAME width
          for both sides, but the left block (logo + today) is ~373px while
          the right (CTA + avatar) is ~140px — so the grid left a 300px+ void
          on the right whatever the container width. Equal flex-basis with
          `justify-start` / `justify-end` centres the card on the row while
          each side takes only the space it needs. */}
      <div
        className={cn(
          "mx-auto w-full max-w-[1440px] px-gutter-mobile sm:px-gutter",
          "flex h-14 items-center justify-between gap-space-sm",
          "sm:gap-space-md lg:h-16 lg:gap-gutter",
        )}
      >
        {/* Left — logo lockup, then today's readout. The gap between them is
            wider than the gap inside the lockup, so the logo reads as one
            mark instead of merging with the button beside it. */}
        <div className="flex min-w-0 shrink-0 items-center gap-space-sm lg:flex-1 lg:justify-start lg:gap-space-lg">
          <Link
            href="/"
            aria-label="কাণ্ডারী-ল্যাব — home"
            className="flex min-w-0 shrink-0 items-center gap-space-xs transition-opacity hover:opacity-85 sm:gap-space-sm"
          >
            <Image
              src="/logo/logo.png"
              alt=""
              aria-hidden
              width={1277}
              height={832}
              priority
              className="h-7 w-auto shrink-0 object-contain lg:h-9"
            />
            {/* The wordmark's two lines are sized so the stacked block lands
                at the logo mark's height: 2 lines x 1.02 leading means each
                line is ~49% of the mark, hence 0.86rem against h-7 (1.75rem)
                and 1.10rem against h-9 (2.25rem).

                Sized down with the mark: a 40px logo in a 64px row left only
                12px of air, where the reference header keeps its logo to
                about 56% of the bar height. */}
            <BrandWordmark
              status="critical"
              className="text-[0.86rem] lg:text-[1.10rem]"
            />
          </Link>

          {/* Rule separating the brand mark from the navigation that follows
              it, so the logo is read as the site identity and not as part of
              the button next to it. */}
          <span
            aria-hidden
            className="hidden h-7 w-px shrink-0 bg-border lg:block"
          />

          {/* Today's readout sits beside the mark on desktop; on mobile it
              moves into the sheet so the bar keeps room for the national
              button. Asking a question lives in the floating AI widget. */}
          <TodayButton className="hidden lg:inline-flex" />

          {/* Mobile keeps the national button in view; desktop moves it to
              row 2 beside the section navigation. */}
          <BangladeshButton className="lg:hidden" />
        </div>

        {/* Centre — the live national readout, auto-rotating. `shrink-0` so
            it keeps its full width and the two side blocks absorb any
            shortfall instead of squeezing the reading. */}
        <NavIndicators className="hidden shrink-0 lg:flex" />

        {/* Right — conversion, account, mobile menu. */}
        <div className="flex min-w-0 items-center justify-end gap-space-xs sm:gap-space-sm lg:flex-1">
          <a
            href="#swasti"
            // h-9 to match the account button beside it: the CTA and the
            // avatar sitting at different heights was part of what made the
            // right cluster look ragged.
            className="inline-flex h-9 shrink-0 items-center gap-space-xs rounded-lg bg-title px-space-md font-sans text-[0.8125rem] font-semibold tracking-normal whitespace-nowrap text-slate-900 shadow-sm transition-colors hover:bg-signal"
          >
            <Icon name="download" className="text-[17px]" filled />
            <span className="hidden sm:inline lg:hidden 2xl:inline">
              Download SWASTI App
            </span>
            <span className="hidden lg:inline 2xl:hidden">SWASTI</span>
          </a>

          <Link
            href="/login"
            aria-label="Kandari member portal"
            className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-xs transition-colors hover:bg-emerald-800 sm:flex"
          >
            <Icon name="person" className="text-[18px]" />
          </Link>

          <Sheet>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Icon name="menu" className="text-[20px]" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="gap-0 overflow-y-auto p-space-lg"
            >
              <SheetTitle className="font-display text-headline-sm text-primary">
                কাণ্ডারী-ল্যাব
              </SheetTitle>
              {/* `w-full` deliberately overrides the button's own `w-fit`
                  so it fills the sheet's column. */}
              <TodayButton className="mt-space-md flex !w-full justify-center" />
              <CivicActions className="mt-space-md flex [&>a]:flex-1 [&>a]:justify-center" />
              <nav className="mt-space-md flex flex-col gap-space-xs">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setActiveHref(link.href)}
                      className="rounded-sm border border-border bg-slate-50 px-space-md py-space-sm font-label-md text-label-md text-slate-900 transition-colors hover:border-emerald-300 hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="mt-space-sm flex items-center justify-center gap-space-xs rounded-lg bg-primary px-space-md py-space-sm font-label-md text-label-md font-bold text-white transition-colors hover:bg-emerald-800 sm:hidden"
                >
                  <Icon name="person" className="text-[18px]" />
                  Kandari Member Portal
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <BangladeshButton className="mt-space-lg w-full justify-center" />
              </SheetClose>
              <p className="mt-space-lg font-label-sm text-label-sm text-primary">
                {NAZRUL_MOTTO}
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Row 2 — section navigation, left-aligned under the logo as in the
          reference, with the civic actions and national button held to the
          right edge. Nav type is 13px here: a navigation row reads as
          secondary to the main bar, so it should not match its size. */}
      <div className="hidden border-t border-border/70 bg-white lg:block">
        <div className="mx-auto flex h-12 w-full max-w-[1440px] items-center gap-space-md px-gutter">
          {/* No gap: each link carries its own horizontal padding, and the
              underline spans that padding box. A gap on top of it would
              double the spacing and detach the indicator from the label.

              No negative margin either. Pulling the row left to make the
              first label sit flush with the logo also drags the link's
              hover background and active underline outside the page gutter,
              so the row-2 indicator crossed the margin that every other row
              respects. Losing 8px of label alignment is the cheaper trade.

              `overflow-x-auto` is the actual guard: when the viewport is
              too narrow for all five links plus the right cluster, the nav
              scrolls inside its own box instead of pushing the cluster
              through the right gutter. */}
          <nav className="no-scrollbar flex h-full min-w-0 flex-1 items-center overflow-x-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                className={cn(
                  // `h-full` rather than `py-3`: the underline is positioned
                  // against this element, so it has to span the row's full
                  // height for the indicator to sit on the row's edge.
                  // 14px, the floor of the navbar standard's 14–16px range.
                  // 13px read as secondary body copy rather than navigation.
                  "relative flex h-full shrink-0 items-center px-space-sm font-sans text-[0.875rem] font-medium tracking-normal whitespace-nowrap transition-colors",
                  activeHref === link.href
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                <span className="xl:hidden">{link.shortLabel}</span>
                <span className="hidden xl:inline">{link.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-space-sm bottom-0 h-[2px] rounded-t-sm bg-title transition-all duration-300",
                    activeHref === link.href ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            ))}
          </nav>

          {/* Right edge: civic actions, then the national button.

              `ml-auto` is gone because the nav beside it is now `flex-1`,
              which already claims the slack — keeping both meant the row
              measured wider than its container. */}
          <div className="flex shrink-0 items-center gap-space-sm">
            <CivicActions className="flex shrink-0" />
            <span aria-hidden className="h-6 w-px shrink-0 bg-border" />
            <BangladeshButton />
          </div>
        </div>
      </div>
    </header>
  );
}
