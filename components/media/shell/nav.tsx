"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarHeart,
  CircleUserRound,
  Compass,
  House,
  Languages,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageCircle,
  Plus,
  ShieldCheck,
  StickyNote,
  Store,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mediaNavGroups, mediaTabs, type NavIcon } from "@/data/media/nav";
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
  teams: Users,
  challenges: Trophy,
  civic: Megaphone,
  notes: StickyNote,
  dashboard: LayoutDashboard,
  wallet: Wallet,
  profile: CircleUserRound,
  create: Plus,
  explore: Compass,
};

/** Sections the phone's "explore" tab stands for. */
const exploreRoutes = ["/media/explore", "/media/jobs", "/media/events", "/media/teams", "/media/challenges", "/media/civic", "/media/notes", "/media/dashboard", "/media/wallet", "/media/messages", "/media/search", "/media/notifications", "/media/settings"];

function isActive(pathname: string, href: string, me: string): boolean {
  if (href === "/media") return pathname === "/media" || (pathname.startsWith("/media/post/") && pathname !== "/media/post/new");
  if (href === "/media/me") return pathname === "/media/me" || pathname === `/media/u/${me}` || pathname.startsWith(`/media/certificate/${me}/`);
  if (href === "/media/explore") return exploreRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
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

function NavGroups({ pathname, me, unread, size }: { pathname: string; me: string; unread: number; size: "rail" | "sheet" }) {
  return (
    <div className={size === "rail" ? "space-y-5" : "space-y-4"}>
      {mediaNavGroups.map((g) => (
        <div key={g.title}>
          <p className="mb-1 px-3 text-[11px] font-bold tracking-wide text-text-muted">{g.title}</p>
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
                      "flex items-center gap-3 rounded-xl px-3 font-semibold transition-colors",
                      size === "rail" ? "min-h-10 text-[15px]" : "min-h-11 text-base",
                      on ? "bg-bd-green text-white" : "text-text-secondary hover:bg-white hover:text-text-primary",
                      size === "sheet" && !on && "hover:bg-slate-50",
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
      <div className="mt-6 space-y-2 rounded-2xl border border-card-border bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <ShieldCheck className="size-4.5 text-bd-green" aria-hidden /> এক এনআইডি, এক অ্যাকাউন্ট
        </p>
        <p className="text-xs leading-relaxed text-text-muted">ভুয়া প্রোফাইল নেই — তাই প্রতিটি রেটিং একজন সত্যিকারের মানুষের।</p>
        <Link href="/media/onboarding" className="text-xs font-semibold text-bd-green hover:underline">
          নতুন অ্যাকাউন্ট খোলা দেখুন →
        </Link>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-text-muted">
        <Link href="/" className="hover:text-bd-green">কাণ্ডারী-ল্যাব</Link>
        <Link href="/media/settings" className="hover:text-bd-green">গোপনীয়তা</Link>
        <Link href="/media/credits" className="hover:text-bd-green">ছবির কৃতজ্ঞতা</Link>
      </p>
    </nav>
  );
}

export function BottomTabs({ me }: { me: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="প্রধান ট্যাব" className="media-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-white/95 backdrop-blur lg:hidden print:hidden">
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
      <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto bg-white font-sans">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-bd-green">শিক্ষিতদের মিডিয়া</SheetTitle>
          <SheetDescription className="text-sm text-text-muted">শিখুন · বানান · আয় করুন · এলাকার জন্য কিছু করুন</SheetDescription>
        </SheetHeader>
        <div className="px-2">
          <NavGroups pathname={pathname} me={me} unread={unread} size="sheet" />
        </div>
        <div className="mt-2 space-y-3 border-t border-card-border px-4 py-4">
          <NumeralsToggle />
          <Link href="/media/onboarding" className="block text-sm font-semibold text-bd-green">নতুন অ্যাকাউন্ট খোলা দেখুন →</Link>
          <Link href="/media/settings" className="block text-sm text-text-muted">গোপনীয়তা ও সময়</Link>
          <Link href="/media/credits" className="block text-sm text-text-muted">ছবির কৃতজ্ঞতা</Link>
          <Link href="/" className="block text-sm text-text-muted">কাণ্ডারী-ল্যাব হোম</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
