"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BriefcaseBusiness,
  CalendarHeart,
  GraduationCap,
  CircleUserRound,
  Compass,
  House,
  Languages,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Menu,
  MessageCircle,
  Plus,
  ShieldCheck,
  StickyNote,
  Store,
  Trophy,
  Users,
  Wallet,
  Library,
  type LucideIcon,
  UsersRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mediaNavGroups, mediaTabs, type NavIcon } from "@/data/media/nav";
import { PixelMark } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num, useNumerals } from "../ui/numerals";
import { useUnread, type UnreadSeed } from "./unread";

export const navIcons: Record<NavIcon, LucideIcon> = {
  feed: House,
  market: Store,
  jobs: BriefcaseBusiness,
  messages: MessageCircle,
  events: CalendarHeart,
  classroom: GraduationCap,
  news: Newspaper,
  teams: Users,
  challenges: Trophy,
  civic: Megaphone,
  notes: StickyNote,
  dashboard: LayoutDashboard,
  wallet: Wallet,
  profile: CircleUserRound,
  create: Plus,
  explore: Compass,
  people: UsersRound,
  academy: Library,
};

/** Sections the phone's "explore" tab stands for. */
const exploreRoutes = ["/media/explore", "/media/classroom", "/media/academy", "/media/news","/media/jobs", "/media/together", "/media/civic", "/media/notes", "/media/dashboard", "/media/messages", "/media/search", "/media/notifications", "/media/settings"];

function isActive(pathname: string, href: string, me: string): boolean {
  if (href === "/media") return pathname === "/media" || (pathname.startsWith("/media/post/") && pathname !== "/media/post/new");
  if (href === "/media/me") return pathname === "/media/me" || pathname === `/media/u/${me}` || pathname.startsWith(`/media/certificate/${me}/`);
  if (href === "/media/explore") return exploreRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span className={cn("min-w-5 rounded-full bg-m-yellow px-1.5 text-center text-[11px] leading-5 font-bold text-m-ink", className)}>
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
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-m-ink/10 bg-m-card px-3 text-xs font-bold text-m-ink/80 transition-colors hover:border-m-blue/40 hover:text-m-blue",
        className,
      )}
      aria-label={numerals === "bn" ? "ইংরেজি সংখ্যা দেখান" : "বাংলা সংখ্যা দেখান"}
      title="সংখ্যার ধরন"
    >
      <Languages className="size-4" aria-hidden />
      <span className={numerals === "bn" ? "text-m-blue" : ""}>১২৩</span>
      <span className="text-m-ink/40">/</span>
      <span className={numerals === "latn" ? "text-m-blue" : ""}>123</span>
    </button>
  );
}

function NavGroups({ pathname, me, unread, size }: { pathname: string; me: string; unread: number; size: "rail" | "sheet" }) {
  const reduce = useReducedMotion();
  return (
    <div className={size === "rail" ? "space-y-5" : "space-y-4"}>
      {mediaNavGroups.map((g) => (
        <div key={g.title}>
          <p className="mb-1 px-3 text-[11px] font-bold tracking-wide text-m-ink/65">{g.title}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = navIcons[item.icon];
              const on = isActive(pathname, item.href, me);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative isolate flex items-center gap-3 rounded-xl px-3 font-semibold transition-[color,background-color,translate] duration-200 active:scale-[0.97]",
                      size === "rail" ? "min-h-10 text-[15px]" : "min-h-11 text-base",
                      on ? "text-m-ink" : "text-m-ink/80 hover:translate-x-0.5 hover:bg-m-ink/6 hover:text-m-ink",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`media-nav-${size}`}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }}
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-xl bg-m-yellow shadow-[0_10px_24px_-14px_var(--color-signal-orange)]"
                      />
                    )}
                    <Icon className="size-5" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && <CountBadge n={unread} className={on ? "bg-m-card text-m-blue" : undefined} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function LeftRail({ unreadSeed, me }: { unreadSeed: UnreadSeed; me: string }) {
  const pathname = usePathname();
  const unread = useUnread(unreadSeed);
  return (
    <nav aria-label="প্রধান মেনু" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col overflow-y-auto py-5 pr-2 scrollbar-none lg:flex print:hidden">
      <Link href="/media/post/new" className={mediaButton({ variant: "primary", size: "lg", className: "mb-5 w-full" })}>
        <Plus aria-hidden /> পোস্ট করুন
      </Link>
      <NavGroups pathname={pathname} me={me} unread={unread} size="rail" />
      <div className="blue-band mt-6 space-y-2 rounded-2xl p-4 shadow-m-tile">
        <PixelMark tone="dark" className="mb-3" />
        <p className="flex items-center gap-2 text-sm font-bold text-m-on">
          <ShieldCheck className="size-4.5 text-m-yellow" aria-hidden /> এক এনআইডি, এক অ্যাকাউন্ট
        </p>
        <p className="text-xs leading-relaxed text-white/75">ভুয়া প্রোফাইল নেই — তাই প্রতিটি রেটিং একজন সত্যিকারের মানুষের।</p>
        <Link href="/media/onboarding" className="text-xs font-semibold text-m-yellow hover:underline">
          দক্ষতা-প্রোফাইল খুলুন →
        </Link>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-m-ink/65">
        <Link href="/" className="hover:text-m-blue">কাণ্ডারী-ল্যাব</Link>
        <Link href="/media/settings" className="hover:text-m-blue">গোপনীয়তা</Link>
        <Link href="/media/credits" className="hover:text-m-blue">ছবির কৃতজ্ঞতা</Link>
      </p>
    </nav>
  );
}

export function BottomTabs({ me }: { me: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="প্রধান ট্যাব" className="frost-dock media-safe-bottom fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden">
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
                className={cn(
                  "relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-150 active:scale-90",
                  on ? "text-m-blue" : "text-m-ink/65",
                )}
              >
                {on && <span aria-hidden className="live-in absolute -top-1.5 h-[3px] w-8 rounded-full bg-m-blue" />}
                {create ? (
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-m-yellow text-m-ink shadow-[0_8px_20px_-6px_var(--color-signal-orange)] ring-4 ring-white transition-transform duration-200 active:rotate-90">
                    <Icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : (
                  <Icon className="size-6" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                )}
                <span>{t.label}</span>
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
  // The menu belongs to the page it was opened on: tapping a link closes it,
  // so it never stays over the next page (the full-screen classroom least of all).
  const [openOn, setOpenOn] = useState<string | null>(null);
  return (
    <Sheet open={openOn === pathname} onOpenChange={(o) => setOpenOn(o ? pathname : null)}>
      <SheetTrigger asChild>
        <button type="button" className={mediaButton({ variant: "frame", size: "icon", className: "lg:hidden" })}>
          <Menu aria-hidden />
          <span className="sr-only">মেনু খুলুন</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto border-m-ink/10 bg-m-canvas font-sans text-m-ink" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpenOn(null)}>
        <SheetHeader>
          <PixelMark tone="light" className="mb-2" />
          <SheetTitle className="text-lg font-bold text-m-blue">শিক্ষিতদের মিডিয়া</SheetTitle>
          <SheetDescription className="text-sm text-m-ink/65">শিখুন · বানান · আয় করুন · এলাকার জন্য কিছু করুন</SheetDescription>
        </SheetHeader>
        <div className="px-2">
          <NavGroups pathname={pathname} me={me} unread={unread} size="sheet" />
        </div>
        <div className="mt-2 space-y-3 border-t border-m-ink/10 px-4 py-4">
          <NumeralsToggle />
          <Link href="/media/onboarding" className="block text-sm font-semibold text-m-blue">দক্ষতা-প্রোফাইল খুলুন →</Link>
          <Link href="/media/settings" className="block text-sm text-m-ink/65">গোপনীয়তা ও সময়</Link>
          <Link href="/media/credits" className="block text-sm text-m-ink/65">ছবির কৃতজ্ঞতা</Link>
          <Link href="/" className="block text-sm text-m-ink/65">কাণ্ডারী-ল্যাব হোম</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
