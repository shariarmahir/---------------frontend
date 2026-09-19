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
      {/* Row 1 — identity, AI ask, sovereign status, primary conversion.
          A three-column grid keeps the search optically centred: the outer
          columns share the leftover space equally, so the centre never drifts
          when one side is wider than the other. */}
      <div
        className={cn(
          "mx-auto w-full max-w-[1920px] px-gutter-mobile sm:px-gutter",
          "flex min-h-14 items-center justify-between gap-space-sm py-1.5",
          "sm:gap-space-md lg:grid lg:min-h-18 lg:grid-cols-[1fr_auto_1fr] lg:gap-gutter",
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
          <div className="hidden items-center gap-space-xs rounded-sm border border-emerald-200 bg-emerald-50 px-space-sm py-space-xs xl:flex">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-code-telemetry text-code-telemetry font-semibold whitespace-nowrap text-emerald-800">
              BD GRID: 99.98%
            </span>
          </div>

          <a
            href="#swasti"
            className="inline-flex shrink-0 items-center gap-space-xs rounded-lg bg-title px-space-sm py-2 font-display text-label-md font-bold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-signal sm:px-space-md"
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
            className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white shadow-xs transition-colors hover:bg-primary sm:flex"
          >
            <Icon name="person" className="text-[18px]" />
          </Link>

          <Sheet>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
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
                      className="rounded-sm border border-border bg-slate-50 px-space-md py-space-sm font-label-md text-label-md text-slate-700 transition-colors hover:border-emerald-300 hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="mt-space-sm flex items-center justify-center gap-space-xs rounded-sm bg-emerald-800 px-space-md py-space-sm font-label-md text-label-md font-bold text-white transition-colors hover:bg-primary sm:hidden"
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

      {/* Row 2 — civic actions, section navigation, national button.
          Desktop only; mobile uses the sheet. The nav is the flexible column,
          so it absorbs the squeeze before either fixed-width edge does. */}
      <div className="hidden border-t border-border/70 bg-linear-to-r from-emerald-50/60 via-white to-orange-50/50 lg:block">
        <div className="mx-auto flex h-13 w-full max-w-[1920px] items-center gap-space-sm px-gutter xl:gap-space-md">
          <CivicActions className="flex shrink-0" />

          <nav className="flex min-w-0 flex-1 items-center justify-center gap-0.5 xl:gap-space-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                className={cn(
                  "relative shrink-0 rounded-sm px-space-xs py-1.5 font-label-md text-label-md whitespace-nowrap transition-colors xl:px-space-sm 2xl:px-space-md",
                  activeHref === link.href
                    ? "text-primary"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                <span className="2xl:hidden">{link.shortLabel}</span>
                <span className="hidden 2xl:inline">{link.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-space-xs -bottom-px h-[3px] rounded-t-sm bg-title transition-all duration-300 xl:inset-x-space-sm",
                    activeHref === link.href ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            ))}
          </nav>

          <BangladeshButton className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
