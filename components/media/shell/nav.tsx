"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, House, Languages, Menu, MessageCircle, Plus, ShieldCheck, Store, Wallet, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mediaNav, mediaTabs, type NavIcon } from "@/data/media/nav";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num, useNumerals } from "../ui/numerals";
import { useUnread, type UnreadSeed } from "./unread";

export const navIcons: Record<NavIcon, LucideIcon> = {
  feed: House,
  market: Store,
  messages: MessageCircle,
  wallet: Wallet,
  profile: CircleUserRound,
  create: Plus,
};

function isActive(pathname: string, href: string, me: string): boolean {
  if (href === "/media") return pathname === "/media" || pathname.startsWith("/media/post/") && pathname !== "/media/post/new";
  if (href === "/media/me") return pathname === "/media/me" || pathname === `/media/u/${me}`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span className={cn("min-w-5 rounded-full bg-signal-orange px-1.5 text-center text-[11px] leading-5 font-bold text-text-primary", className)}>
      <Num value={n} />
    </span>
  );
}

export function NumeralsToggle({ className }: { className?: string }) {
  const { numerals, setNumerals } = useNumerals();
  return (
    <button
      type="button"
      onClick={() => setNumerals(numerals === "bn" ? "latn" : "bn")}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-card-border bg-white px-3 text-xs font-bold text-text-secondary transition-colors hover:border-bd-green/40 hover:text-bd-green",
        className,
      )}
      aria-label={numerals === "bn" ? "ইংরেজি সংখ্যা দেখান" : "বাংলা সংখ্যা দেখান"}
      title="সংখ্যার ধরন"
    >
      <Languages className="size-4" aria-hidden />
      <span className={numerals === "bn" ? "text-bd-green" : ""}>১২৩</span>
      <span className="text-slate-300">/</span>
      <span className={numerals === "latn" ? "text-bd-green" : ""}>123</span>
    </button>
  );
}

export function LeftRail({ unreadSeed, me }: { unreadSeed: UnreadSeed; me: string }) {
  const pathname = usePathname();
  const unread = useUnread(unreadSeed);
  return (
    <nav aria-label="প্রধান মেনু" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col py-6 pr-2 lg:flex">
      <Link href="/media/post/new" className={mediaButton({ variant: "primary", size: "lg", className: "mb-6 w-full" })}>
        <Plus aria-hidden /> দক্ষতা পোস্ট করুন
      </Link>
      <ul className="space-y-1">
        {mediaNav.map((item) => {
          const Icon = navIcons[item.icon];
          const on = isActive(pathname, item.href, me);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
                  on ? "bg-bd-green text-white" : "text-text-secondary hover:bg-white hover:text-text-primary",
                )}
              >
                <Icon className="size-5" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge && <CountBadge n={unread} className={on ? "bg-white text-bd-green" : undefined} />}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-3 rounded-2xl border border-card-border bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <ShieldCheck className="size-4.5 text-bd-green" aria-hidden /> এক এনআইডি, এক অ্যাকাউন্ট
        </p>
        <p className="text-xs leading-relaxed text-text-muted">ভুয়া প্রোফাইল নেই — তাই প্রতিটি রেটিং একজন সত্যিকারের মানুষের।</p>
        <Link href="/media/onboarding" className="text-xs font-semibold text-bd-green hover:underline">
          নতুন অ্যাকাউন্ট খোলা দেখুন →
        </Link>
      </div>
      <p className="mt-3 flex gap-3 px-1 text-[11px] text-text-muted">
        <Link href="/" className="hover:text-bd-green">কাণ্ডারী-ল্যাব</Link>
        <Link href="/media/credits" className="hover:text-bd-green">ছবির কৃতজ্ঞতা</Link>
      </p>
    </nav>
  );
}

export function BottomTabs({ unreadSeed, me }: { unreadSeed: UnreadSeed; me: string }) {
  const pathname = usePathname();
  const unread = useUnread(unreadSeed);
  return (
    <nav aria-label="প্রধান ট্যাব" className="media-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-white/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pt-1.5">
        {mediaTabs.map((t) => {
          const Icon = navIcons[t.icon];
          const create = t.icon === "create";
          const on = !create && isActive(pathname, t.href, me);
          return (
            <li key={t.href} className="flex justify-center">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={cn("relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold", on ? "text-bd-green" : "text-text-muted")}
              >
                {create ? (
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-signal-orange text-text-primary shadow-[0_4px_12px_-2px_rgb(234_88_12/0.5)] ring-4 ring-white">
                    <Icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : (
                  <Icon className="size-6" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                )}
                <span>{t.label}</span>
                {t.badge && <CountBadge n={unread} className="absolute top-0 left-1/2 ml-1.5" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMenu({ unreadSeed, me }: { unreadSeed: UnreadSeed; me: string }) {
  const pathname = usePathname();
  const unread = useUnread(unreadSeed);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className={mediaButton({ variant: "ghost", size: "icon", className: "lg:hidden" })}>
          <Menu aria-hidden />
          <span className="sr-only">মেনু খুলুন</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw] bg-white font-sans">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-bd-green">শিক্ষিতদের মিডিয়া</SheetTitle>
          <SheetDescription className="text-sm text-text-muted">দক্ষতা দেখান · যাচাই পান · কাজ পান</SheetDescription>
        </SheetHeader>
        <ul className="space-y-1 px-4">
          {mediaNav.map((item) => {
            const Icon = navIcons[item.icon];
            const on = isActive(pathname, item.href, me);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold", on ? "bg-bd-green text-white" : "text-text-primary hover:bg-slate-50")}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <CountBadge n={unread} />}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 space-y-3 border-t border-card-border px-4 pt-4">
          <NumeralsToggle />
          <Link href="/media/onboarding" className="block text-sm font-semibold text-bd-green">নতুন অ্যাকাউন্ট খোলা দেখুন →</Link>
          <Link href="/media/search" className="block text-sm font-semibold text-text-primary">খুঁজুন</Link>
          <Link href="/media/credits" className="block text-sm text-text-muted">ছবির কৃতজ্ঞতা</Link>
          <Link href="/" className="block text-sm text-text-muted">কাণ্ডারী-ল্যাব হোম</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
