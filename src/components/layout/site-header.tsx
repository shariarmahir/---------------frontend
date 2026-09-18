"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAZRUL_MOTTO, navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [activeHref, setActiveHref] = useState(navLinks[0].href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="flex h-20 w-full items-center justify-between gap-space-md px-gutter">
        <div className="flex items-center gap-space-md">
          <Link href="/" className="flex items-center gap-space-sm">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-label-md font-extrabold text-primary-foreground">
              ক
            </span>
            <span className="font-display text-headline-sm font-bold tracking-tight text-primary">
              কাণ্ডারী-ল্যাব
            </span>
          </Link>
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

        <div className="flex items-center gap-space-sm">
          <div className="hidden items-center gap-space-xs rounded-sm border border-emerald-200 bg-emerald-50 px-space-sm py-space-xs sm:flex">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-code-telemetry text-code-telemetry font-semibold text-emerald-800">
              BD GRID: 99.98%
            </span>
          </div>
          <a
            href="#swasti"
            className="inline-flex items-center justify-center rounded-lg bg-title px-space-md py-2 font-display text-label-md font-bold text-white shadow-sm transition-colors hover:bg-signal"
          >
            Download SWASTI App
          </a>
          <Link
            href="/login"
            aria-label="Kandari member portal"
            className="flex size-8 items-center justify-center rounded-full bg-emerald-800 text-white shadow-xs transition-colors hover:bg-primary"
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
