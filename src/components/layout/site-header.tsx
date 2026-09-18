"use client";

import Link from "next/link";
import { useState } from "react";
import { AiSearch } from "@/components/ui/ai-search";
import { BangladeshButton } from "@/components/ui/bangladesh-button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAZRUL_MOTTO, navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [activeHref, setActiveHref] = useState(navLinks[0].href);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-xl">
      {/* Row 1 — identity, sovereign status, primary conversion. */}
      <div className="mx-auto flex h-14 w-full max-w-[1920px] items-center justify-between gap-space-sm px-gutter-mobile sm:gap-space-md sm:px-gutter lg:h-16">
        <div className="flex min-w-0 items-center gap-space-sm sm:gap-space-md">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-space-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary font-display text-label-md font-extrabold text-primary-foreground shadow-xs">
              ক
            </span>
            <span className="hidden truncate font-display text-headline-sm font-bold tracking-tight whitespace-nowrap text-primary sm:inline">
              কাণ্ডারী-ল্যাব
            </span>
          </Link>
          <BangladeshButton />
        </div>

        <div className="flex shrink-0 items-center gap-space-sm">
          <div className="hidden items-center gap-space-xs rounded-sm border border-emerald-200 bg-emerald-50 px-space-sm py-space-xs lg:flex">
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
            <span className="hidden sm:inline lg:hidden xl:inline">
              Download SWASTI App
            </span>
            <span className="sm:hidden lg:inline xl:hidden">SWASTI</span>
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
              className="flex size-9 items-center justify-center rounded-md border border-border text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Icon name="menu" className="text-[20px]" />
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 overflow-y-auto p-space-lg">
              <SheetTitle className="font-display text-headline-sm text-primary">
                কাণ্ডারী-ল্যাব
              </SheetTitle>
              <AiSearch className="mt-space-md w-full" />
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

      {/* Row 2 — section navigation and AI ask. Desktop only; mobile uses the sheet. */}
      <div className="hidden border-t border-border/70 bg-linear-to-r from-emerald-50/60 via-white to-orange-50/50 lg:block">
        <div className="mx-auto flex h-12 w-full max-w-[1920px] items-center justify-between gap-space-md px-gutter">
          <nav className="flex min-w-0 items-center gap-space-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                className={cn(
                  "relative rounded-sm px-space-sm py-1.5 font-label-md text-label-md whitespace-nowrap transition-colors xl:px-space-md",
                  activeHref === link.href
                    ? "text-primary"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                <span className="xl:hidden">{link.shortLabel}</span>
                <span className="hidden xl:inline">{link.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-space-sm -bottom-px h-[3px] rounded-t-sm bg-linear-to-r from-primary via-title to-crimson transition-all duration-300",
                    activeHref === link.href ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            ))}
          </nav>

          <AiSearch className="w-56 shrink-0 xl:w-72 2xl:w-96" />
        </div>
      </div>
    </header>
  );
}
