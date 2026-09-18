"use client";

import Link from "next/link";
import { useState } from "react";
import { BangladeshButton } from "@/components/ui/bangladesh-button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAZRUL_MOTTO, navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [activeHref, setActiveHref] = useState(navLinks[0].href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-space-sm px-gutter-mobile sm:gap-space-md sm:px-gutter lg:h-20">
        <div className="flex min-w-0 items-center gap-space-sm sm:gap-space-md">
          <Link href="/" className="flex shrink-0 items-center gap-space-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary font-display text-label-md font-extrabold text-primary-foreground">
              ক
            </span>
            <span className="hidden font-display text-headline-sm font-bold tracking-tight whitespace-nowrap text-primary sm:inline">
              কাণ্ডারী-ল্যাব
            </span>
          </Link>
          <BangladeshButton />
          <div className="hidden items-center rounded-sm border border-border bg-muted px-space-sm py-space-xs xl:flex">
            <span className="font-label-sm text-label-sm text-slate-700">
              {NAZRUL_MOTTO}
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-space-xs rounded-lg border border-border bg-slate-50 p-space-xs lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setActiveHref(link.href)}
              className={cn(
                "rounded-sm px-space-md py-space-xs font-label-md text-label-md transition-colors",
                activeHref === link.href
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-primary",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-space-sm">
          <div className="hidden items-center gap-space-xs rounded-sm border border-emerald-200 bg-emerald-50 px-space-sm py-space-xs xl:flex">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-code-telemetry text-code-telemetry font-semibold whitespace-nowrap text-emerald-800">
              BD GRID: 99.98%
            </span>
          </div>
          <a
            href="#swasti"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-title px-space-sm py-2 font-display text-label-md font-bold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-signal sm:px-space-md"
          >
            <span className="sm:hidden">SWASTI</span>
            <span className="hidden sm:inline">Download SWASTI App</span>
          </a>
          <Link
            href="/login"
            aria-label="Kandari member portal"
            className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white shadow-xs transition-colors hover:bg-primary sm:flex"
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
            <SheetContent side="right" className="gap-0 p-space-lg">
              <SheetTitle className="font-display text-headline-sm text-primary">
                কাণ্ডারী-ল্যাব
              </SheetTitle>
              <nav className="mt-space-lg flex flex-col gap-space-xs">
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
    </header>
  );
}
