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
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-xl">
      {/* Utility strip — the thin top line of the reference header. Holds
          the live national status that previously sat in a separate band
          below the header, so the bar reads as one unit. Desktop only;
          mobile has no room for a third row. */}
      <div className="hidden border-b border-border/70 bg-slate-50 lg:block">
        <div className="mx-auto flex h-7 w-full max-w-[1920px] items-center justify-between gap-space-md px-gutter font-sans text-[0.75rem] text-slate-600">
          <span className="flex items-center gap-space-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="font-semibold text-primary">
              Bangladesh National Telemetry Lattice
            </span>
            <span className="text-slate-400">·</span>
            <span>NODE-64 ACTIVE</span>
          </span>

          <span className="flex items-center gap-space-md">
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

      {/* Row 1 — identity, AI ask, sovereign status, primary conversion.
          A three-column grid keeps the search optically centred: the outer
          columns share the leftover space equally, so the centre never drifts
          when one side is wider than the other. */}
      <div
        className={cn(
          "mx-auto w-full max-w-[1920px] px-gutter-mobile sm:px-gutter",
          "flex min-h-14 items-center justify-between gap-space-sm py-1.5",
          "sm:gap-space-md lg:grid lg:min-h-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-gutter",
        )}
      >
        {/* Left — logo lockup, then today's readout. The gap between them is
            wider than the gap inside the lockup, so the logo reads as one
            mark instead of merging with the button beside it. */}
        <div className="flex min-w-0 items-center gap-space-sm lg:gap-space-lg">
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
              className="h-8 w-auto shrink-0 object-contain lg:h-10"
            />
            {/* The wordmark's two lines are sized so the stacked block lands
                at the logo mark's height: 2 lines x 1.02 leading means each
                line is ~49% of the mark, hence 0.98rem against h-8 (2rem)
                and 1.22rem against h-10 (2.5rem). */}
            <BrandWordmark
              status="critical"
              className="text-[0.98rem] lg:text-[1.22rem]"
            />
          </Link>

          {/* Rule separating the brand mark from the navigation that follows
              it, so the logo is read as the site identity and not as part of
              the button next to it. */}
          <span
            aria-hidden
            className="hidden h-8 w-px shrink-0 bg-border lg:block"
          />

          {/* Today's readout sits beside the mark on desktop; on mobile it
              moves into the sheet so the bar keeps room for the national
              button. Asking a question lives in the floating AI widget. */}
          <TodayButton className="hidden lg:inline-flex" />

          {/* Mobile keeps the national button in view; desktop moves it to
              row 2 beside the section navigation. */}
          <BangladeshButton className="lg:hidden" />
        </div>

        {/* Centre — live national indicator, auto-rotating. */}
        <NavIndicators className="hidden lg:flex" />

        {/* Right — status, conversion, account, mobile menu. */}
        <div className="flex shrink-0 items-center justify-end gap-space-xs sm:gap-space-sm">
          <a
            href="#swasti"
            className="inline-flex shrink-0 items-center gap-space-xs rounded-lg bg-title px-space-md py-2 font-sans text-[0.875rem] font-semibold tracking-normal whitespace-nowrap text-slate-900 shadow-sm transition-colors hover:bg-signal"
          >
            <Icon name="download" className="text-[18px]" filled />
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
        <div className="mx-auto flex h-12 w-full max-w-[1920px] items-center gap-space-md px-gutter">
          <nav className="flex min-w-0 items-center gap-space-xs xl:gap-space-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                className={cn(
                  "relative shrink-0 px-space-xs py-3 font-sans text-[0.8125rem] font-medium tracking-normal whitespace-nowrap transition-colors",
                  activeHref === link.href
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                <span className="xl:hidden">{link.shortLabel}</span>
                <span className="hidden xl:inline">{link.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-space-xs bottom-0 h-[2px] rounded-t-sm bg-title transition-all duration-300",
                    activeHref === link.href ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            ))}
          </nav>

          {/* Right edge: civic actions, then the national button. */}
          <div className="ml-auto flex shrink-0 items-center gap-space-sm">
            <CivicActions className="flex shrink-0" />
            <span aria-hidden className="h-6 w-px shrink-0 bg-border" />
            <BangladeshButton className="shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
