"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  DoorOpen,
  Landmark,
  LogOut,
  Menu,
  Moon,
  PenLine,
  PlayCircle,
  School,
  ShoppingBag,
  Sun,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { useAcademy } from "../use-academy";
import { useCatalogue } from "./catalogue-root";
import { ClassTicker } from "../../classroom/focus/ticker";
import { useLang, useT } from "../../ui/language";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** One line under the label in a menu: what is there. */
  hint: string;
}

/** The catalogue, in the order a learner walks it: academy, then its department, then the course. */
const CATALOGUE: NavLink[] = [
  {
    href: "/media/academy/academies",
    label: "একাডেমি",
    icon: Landmark,
    hint: "দেশের পেশাদারদের ছোট বিশ্ববিদ্যালয়",
  },
  {
    href: "/media/academy/departments",
    label: "বিভাগ",
    icon: Building2,
    hint: "প্রতিটি দক্ষতার নিজের ঘর",
  },
  {
    href: "/media/academy/courses",
    label: "কোর্স",
    icon: BookOpen,
    hint: "চল্লিশ দিনের হাতে-কলমে কোর্স",
  },
  {
    href: "/media/academy/videos",
    label: "ক্লাস ভিডিও",
    icon: PlayCircle,
    hint: "প্রতি সপ্তাহের বিনামূল্যের ক্লাস",
  },
];

/** The two menus: a learner's own study, and the way in for those who teach. */
const GROUPS: { label: string; items: NavLink[] }[] = [
  {
    label: "আমার শেখা",
    items: [
      {
        href: "/media/academy/routine",
        label: "রুটিন",
        icon: CalendarDays,
        hint: "কবে, কখন আপনার ক্লাস",
      },
      {
        href: "/media/academy/classroom",
        label: "ক্লাসরুম",
        icon: DoorOpen,
        hint: "লাইভ ক্লাস, রেকর্ডিং আর হোমওয়ার্ক",
      },
      {
        href: "/media/academy/exam",
        label: "পরীক্ষা",
        icon: ClipboardCheck,
        hint: "নিজের প্রজেক্ট আর প্যানেল",
      },
      {
        href: "/media/academy/graduation",
        label: "সমাবর্তন",
        icon: Award,
        hint: "সনদ আর প্রকাশ্য বোর্ড",
      },
    ],
  },
  {
    label: "শেখান",
    items: [
      {
        href: "/media/academy/teach",
        label: "একাডেমি খুলুন",
        icon: School,
        hint: "নিজের নামে, বা বন্ধুদের নিয়ে",
      },
      {
        href: "/media/academy/classroom/open",
        label: "ক্লাসরুম খুলুন",
        icon: DoorOpen,
        hint: "কোর্সের নতুন ব্যাচ",
      },
      {
        href: "/media/academy/panel",
        label: "প্যানেল মার্কিং",
        icon: PenLine,
        hint: "শেষ প্রজেক্টের নম্বর",
      },
    ],
  },
];

/** A catalogue stop matches its own pages: the academies their profiles, the departments and courses their detail pages. */
const OWN: Record<string, string[]> = {
  "/media/academy/academies": ["/media/academy/a/"],
  "/media/academy/departments": ["/media/academy/dept/"],
  "/media/academy/courses": ["/media/academy/course/"],
};
/** The classroom's own menu entry is not "ক্লাসরুম খুলুন" or a new course. */
const NOT_OWN = ["/media/academy/classroom/open", "/media/academy/classroom/new"];
const isAt = (href: string, path: string) =>
  path === href || (OWN[href] ?? []).some((p) => path.startsWith(p)) || (!OWN[href] && path.startsWith(`${href}/`) && !NOT_OWN.some((p) => p !== href && path.startsWith(p)));

/** A category: bold black text on the glass, no fill; a rule under it marks the page you are on, and the pointer dims the ground behind it. */
const link = "group relative flex h-full items-center px-1.5 text-[15px] font-bold whitespace-nowrap text-black xl:px-2";
const pill = "flex items-center gap-1.5 border-b-2 border-transparent px-2.5 py-1.5 transition-colors duration-150 group-hover:bg-black/10";
const onPill = "border-black";
/** A square icon cell at the yellow bar's right end. */
const cell = "relative flex w-14 items-center justify-center border-l border-black/15 text-black transition-colors duration-150 hover:bg-black hover:text-(--c-signal)";

/**
 * The academy's bar, ruled like the page and tall enough to be known at a
 * glance: the mark and the academy's name in their own cell; the catalogue
 * (academy, department, course, class videos); a learner's own study and the
 * teachers' way in as two menus; then the cart, the theme switch and the
 * yellow "ভর্তি হোন". Phones fold everything into one grouped menu.
 */
export function CatalogueNav() {
  const path = usePathname();
  const { theme, toggleTheme } = useCatalogue();
  const hydrated = useHydrated();
  const t = useT();
  const { lang, setLang } = useLang();
  const inCart = useAcademy((s) => s.cart.length);
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const bar = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const menuId = useId();

  // A menu closes on a click elsewhere or Escape.
  useEffect(() => {
    if (!open && !menu) return;
    const away = (e: PointerEvent) => {
      if (open && !bar.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      setMenu(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open, menu]);

  const themeLabel = t(theme === "dark" ? "আলো থিমে যান" : "অন্ধকার থিমে যান");
  const themeButton = (
    <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} className={cell}>
      {theme === "dark" ? <Sun className="size-4.5" aria-hidden /> : <Moon className="size-4.5" aria-hidden />}
    </button>
  );
  const cart = (
    <Link href="/media/academy/checkout" aria-label={t("কোর্সের ঝুড়ি")} title={t("কোর্সের ঝুড়ি")} className={cell}>
      <ShoppingBag className="size-4.5" aria-hidden />
      {hydrated && inCart > 0 && (
        <span className="absolute top-3 right-2.5 grid size-4.5 place-items-center bg-(--c-signal) text-[10px] font-bold text-black">
          <Num value={inCart} />
        </span>
      )}
    </Link>
  );

  return (
    <>
      <nav aria-label={t("একাডেমি")} className="sticky top-0 z-50 w-full border-b border-black/15 bg-(--c-signal)/85 text-black backdrop-blur-xl">
        <div className="flex h-16 items-stretch justify-between">
          <div className="flex min-w-0 items-stretch">
            <Link href="/media/academy" aria-label={t("কাণ্ডারী তৈরি একাডেমি — প্রথম পাতা")} className="group flex items-center gap-3 border-r border-black/15 px-4 sm:px-5">
              <Image src="/logo/kandari-logo.png" alt="" width={1600} height={967} sizes="80px" className="h-9 w-auto transition-transform duration-300 group-hover:-rotate-3" priority />
              <span className="flex flex-col leading-none">
                <span className="display text-[1.15rem] text-black">{t("কাণ্ডারী")}</span>
                <span className="hud mt-1 text-[10px] text-black/70">{t("তৈরি একাডেমি")}</span>
              </span>
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 items-stretch px-3 sm:flex">
            <ClassTicker />
          </div>

          <div className="flex shrink-0 items-stretch">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              aria-label={lang === "en" ? "বাংলায় দেখুন" : "View in English"}
              title={lang === "en" ? "বাংলায় দেখুন" : "View in English"}
              className={cn(cell, "w-auto px-3.5 text-sm font-bold")}
            >
              {lang === "en" ? "বাং" : "EN"}
            </button>
            <Link href="/media" aria-label={t("একাডেমি থেকে বের হন")} title={t("একাডেমি থেকে বের হন")} className={cn(cell, "w-auto gap-2 px-4 text-[15px] font-bold")}>
              <LogOut className="size-4.5" aria-hidden />
              <span className="hidden xl:inline">{t("বের হন")}</span>
            </Link>
            <div className="hidden items-stretch sm:flex">{cart}</div>
            {themeButton}
            <Link
              href="/media/academy/courses"
              className="hidden h-full items-center gap-2 border-l border-black/15 bg-black px-6 text-[15px] font-bold whitespace-nowrap text-(--c-signal) transition-opacity duration-150 hover:opacity-85 md:flex"
            >
              <Ticket className="size-4.5" aria-hidden />
              {t("ভর্তি হোন")}
            </Link>
            <div className="flex items-stretch lg:hidden">
              <button type="button" aria-expanded={menu} aria-controls={menuId} onClick={() => setMenu((m) => !m)} className={cell}>
                <span className="sr-only">{t(menu ? "মেনু বন্ধ করুন" : "মেনু খুলুন")}</span>
                {menu ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
              </button>
            </div>
          </div>
        </div>

        {menu && (
          <div id={menuId} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-(--c-line) bg-(--c-bg) lg:hidden">
            {[{ label: "ক্যাটালগ", items: CATALOGUE }, ...GROUPS].map((g) => (
              <div key={g.label}>
                <p className="hud border-b border-(--c-line) px-5 pt-4 pb-2 text-(--c-faint)">{t(g.label)}</p>
                <ul className="grid gap-px border-b border-(--c-line) bg-(--c-line) sm:grid-cols-2">
                  {g.items.map((m) => (
                    <li key={m.href}>
                      <MenuItem item={m} on={isAt(m.href, path)} onPick={() => setMenu(false)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="grid grid-cols-2 border-b border-(--c-line)">
              <Link href="/media/academy/courses" onClick={() => setMenu(false)} className="flex h-13 items-center justify-center gap-2 bg-(--c-signal) font-bold text-black">
                <Ticket className="size-4.5" aria-hidden />
                {t("ভর্তি হোন")}
              </Link>
              <Link
                href="/media/academy/checkout"
                onClick={() => setMenu(false)}
                className="flex h-13 items-center justify-center gap-2 border-l border-(--c-line) text-(--c-muted) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
              >
                <ShoppingBag className="size-4.5" aria-hidden />
                {t("ঝুড়ি")}
                {hydrated && inCart > 0 && (
                  <>
                    {" "}
                    · <Num value={inCart} />
                  </>
                )}
              </Link>
            </div>
            <Link href="/media" className="flex items-center gap-2 px-5 py-4 text-sm text-(--c-muted) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
              <LogOut className="size-4" aria-hidden />
              {t("একাডেমি থেকে বের হন")}
            </Link>
          </div>
        )}
      </nav>

      <nav aria-label={t("ক্যাটালগ")} className="relative z-41 hidden border-b border-black/15 bg-(--c-signal)/85 backdrop-blur-xl lg:block">
        <ul ref={bar} className="mx-auto flex h-12 w-full max-w-7xl min-w-0 items-stretch px-2">
          {CATALOGUE.map((r) => {
            const on = isAt(r.href, path);
            return (
              <li key={r.href} className="flex items-stretch">
                <Link href={r.href} aria-current={on ? "page" : undefined} className={link}>
                  <span className={cn(pill, on && onPill)}>{t(r.label)}</span>
                </Link>
              </li>
            );
          })}
          {GROUPS.map((g, gi) => {
            const id = `${baseId}-${gi}`;
            const expanded = open === g.label;
            const on = g.items.some((i) => isAt(i.href, path));
            return (
              <li key={g.label} className={cn("relative flex items-stretch", gi === 0 && "ml-1.5 border-l border-black/15 pl-1.5")}>
                <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? null : g.label)} className={link}>
                  <span className={cn(pill, (expanded || on) && onPill)}>
                    {t(g.label)}
                    <ChevronDown className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")} aria-hidden />
                  </span>
                </button>
                {expanded && (
                  <div id={id} className="absolute top-full left-0 w-84 border border-(--c-line) bg-(--c-bg) shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
                    <p className="hud border-b border-(--c-line) px-5 py-2.5 text-(--c-faint)">{t(g.label)}</p>
                    <ul className="grid gap-px bg-(--c-line)">
                      {g.items.map((m) => (
                        <li key={m.href}>
                          <MenuItem item={m} on={isAt(m.href, path)} onPick={() => setOpen(null)} />
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/media"
                      className="flex items-center gap-2 border-t border-(--c-line) px-5 py-3 text-sm text-(--c-muted) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                    >
                      <LogOut className="size-4" aria-hidden />
                      {t("একাডেমি থেকে বের হন")}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/** One entry of a menu: its icon in a ruled square, the name, and a line of what is there. The whole row inverts under the pointer. */
function MenuItem({ item: m, on, onPick }: { item: NavLink; on: boolean; onPick: () => void }) {
  const Icon = m.icon;
  const t = useT();
  return (
    <Link
      href={m.href}
      onClick={onPick}
      aria-current={on ? "page" : undefined}
      className={cn("group/item flex items-center gap-3.5 bg-(--c-bg) px-5 py-3.5 transition-colors duration-150 hover:bg-(--c-invert-bg)", on && "bg-(--c-bg-sunken)")}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center border transition-colors",
          on ? "border-transparent bg-(--c-signal) text-black" : "border-(--c-line) text-(--c-accent-ink) group-hover/item:border-(--c-invert-fg)/30 group-hover/item:text-(--c-invert-fg)",
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={cn("block font-semibold group-hover/item:text-(--c-invert-fg)", on ? "text-(--c-ink-strong)" : "text-(--c-ink)")}>{t(m.label)}</span>
        <span className="block truncate text-sm text-(--c-muted) group-hover/item:text-(--c-invert-fg)/70">{t(m.hint)}</span>
      </span>
    </Link>
  );
}
