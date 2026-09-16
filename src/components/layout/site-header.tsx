"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#mission", label: "Mission" },
  { href: "#impact", label: "Impact" },
  { href: "#services", label: "Services" },
  { href: "#team", label: "Team" },
  { href: "#community", label: "Community" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-heading text-lg font-bold text-primary">
          কাণ্ডারী-ল্যাব
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-title text-white hover:bg-title/90">
            <Link href="#download">Download App</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="font-heading text-primary">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <a
                    href={link.href}
                    className="text-base font-medium text-slate-700 hover:text-primary"
                  >
                    {link.label}
                  </a>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="bg-title text-white hover:bg-title/90">
                  <Link href="#download">Download App</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
