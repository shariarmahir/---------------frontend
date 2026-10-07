"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Award, Building2, ClipboardCheck, House, LogOut, MonitorPlay, Presentation, UserPlus, UsersRound, type LucideIcon } from "lucide-react";
import { classVideos } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { weekOf } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useTeacher } from "../desk/use-teacher";
import { useAcademy } from "../use-academy";
import { AcademyGate, type AcademyRole } from "./academy-gate";
import { AcademyStory } from "./academy-story";

interface Item {
  href: string;
  label: string;
  short?: string;
  Icon: LucideIcon;
  /** Other paths that belong to this item. */
  also?: string[];
}

const LEARN: Item[] = [
  { href: "/media/academy", label: "হোম", Icon: House },
  { href: "/media/academy/videos", label: "ক্লাস ভিডিও", short: "ভিডিও", Icon: MonitorPlay },
  { href: "/media/academy/departments", label: "বিভাগ", short: "বিভাগ", Icon: Building2, also: ["/media/academy/dept", "/media/academy/course", "/media/academy/admission"] },
  { href: "/media/academy/teachers", label: "শিক্ষক", Icon: UsersRound },
  { href: "/media/academy/exam", label: "ফাইনাল ও বোর্ড", short: "ফাইনাল", Icon: Award },
];
const TEACH: Item[] = [
  { href: "/media/academy/desk", label: "শিক্ষক ডেস্ক", short: "ডেস্ক", Icon: Presentation },
  { href: "/media/academy/panel", label: "প্যানেল মার্কিং", short: "প্যানেল", Icon: ClipboardCheck },
  { href: "/media/academy/teach", label: "শিক্ষক হোন", Icon: UserPlus },
];
const SECTIONS = { learn: { title: "শিখুন", items: LEARN }, teach: { title: "শেখান", items: TEACH } };
/** Phones get five: home, videos, departments, the desk, the finals (the panel opens from the desk). */
const TABS = [LEARN[0], LEARN[1], LEARN[2], TEACH[0], LEARN[4]];

function isOn(item: Item, path: string): boolean {
  if (item.href === "/media/academy") return path === item.href;
  return [item.href, ...(item.also ?? [])].some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * The academy as its own full-screen place, like the classroom. Entering
 * asks whether you come to learn or to teach, plays the opening story, then
 * shows a gold bar with the name and motto, the academy's own menu, and the
 * page in the middle. Leaving ends the visit; coming back asks again.
 */
export function AcademyShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { account } = useAuth();
  const { record } = useTeacher();
  const main = useRef<HTMLElement>(null);
  const [stage, setStage] = useState<"gate" | "story" | "on">("gate");
  const [role, setRole] = useState<AcademyRole>("learner");
  const leave = useCallback(() => router.push("/media"), [router]);
  const open = useCallback(() => setStage("on"), []);

  function enter(as: AcademyRole) {
    setRole(as);
    setStage("story");
    // A teacher coming in at the front door lands at their desk, or at the application.
    if (as === "teacher" && pathname === "/media/academy") router.replace(record ? "/media/academy/desk" : "/media/academy/teach");
  }

  // The page behind stays still while the academy is open.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // A new page starts at its top; an #anchor is left to the browser.
  useEffect(() => {
    if (!window.location.hash) main.current?.scrollTo({ top: 0 });
  }, [pathname]);

  if (stage === "gate") return <AcademyGate onEnter={enter} onLeave={leave} />;
  if (stage === "story") return <AcademyStory role={role} name={account?.name} onDone={open} />;
  // A teacher's menu starts with teaching.
  const order = role === "teacher" ? (["teach", "learn"] as const) : (["learn", "teach"] as const);

  return (
    <div className="fixed inset-0 z-45 flex flex-col bg-black font-sans text-white">
      <header className="flex h-16 shrink-0 items-center gap-2 bg-signal-orange px-2.5 text-text-primary sm:gap-4 sm:px-4">
        <Link href="/media/academy" className="flex shrink-0 flex-col items-center rounded-lg leading-none focus-visible:outline-2 focus-visible:outline-text-primary">
          <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="96px" className="h-10 w-auto sm:h-11" priority />
          <span className="text-[9px] font-extrabold tracking-[0.3em] sm:text-[10px]">ACADEMY</span>
        </Link>
        <span className="hidden h-9 w-px shrink-0 bg-text-primary/20 sm:block" aria-hidden />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-bold">কাণ্ডারী তৈরি একাডেমি</p>
          <p className="truncate text-xs font-semibold text-text-primary/80">সবার আমি ছাত্র</p>
        </div>
        {role === "teacher" ? (
          <Link href="/media/academy/desk" className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-text-primary px-3.5 text-sm font-bold text-signal-orange sm:inline-flex">
            <Presentation className="size-4" aria-hidden /> শিক্ষক হিসেবে আছেন
          </Link>
        ) : (
          <JoinedChip />
        )}
        <button
          type="button"
          onClick={leave}
          className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-2 text-sm font-bold transition-colors hover:bg-text-primary/10 sm:px-3"
        >
          <LogOut className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          <span className="hidden sm:inline">বের হন</span>
          <span className="sr-only sm:hidden">একাডেমি থেকে বের হন</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav aria-label="একাডেমি" className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/12 bg-text-primary px-3 py-5 lg:flex">
          {order.map((k) => (
            <Group key={k} title={SECTIONS[k].title} items={SECTIONS[k].items} path={pathname} />
          ))}
          <Following path={pathname} />
          <div className="mt-auto rounded-2xl bg-signal-orange p-4 text-text-primary">
            <p className="text-lg leading-snug font-bold">সবার আমি ছাত্র</p>
            <p className="mt-2 text-xs leading-relaxed font-semibold text-text-primary/80">যোগ দেওয়া বিনামূল্যে · ফি এসক্রোতে · ফাইনাল প্রকাশ্য</p>
          </div>
        </nav>

        <main ref={main} id="academy-main" className="scrollbar-gold min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-6 pb-24 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      <nav aria-label="একাডেমি" className="shrink-0 border-t border-white/12 bg-text-primary pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((item) => {
            const on = isOn(item, pathname);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={on ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", on ? "text-signal-orange" : "text-white/75")}>
                  <item.Icon className="size-5" aria-hidden />
                  {item.short ?? item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function Group({ title, items, path }: { title: string; items: Item[]; path: string }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-bold text-signal-orange">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => {
          const on = isOn(item, path);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
                  on ? "bg-signal-orange text-text-primary shadow-tile" : "text-white/85 hover:bg-white/8 hover:text-white",
                )}
              >
                <item.Icon className="size-5 shrink-0 transition-transform duration-200 group-hover:-rotate-6 motion-reduce:transition-none" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** How many departments the viewer belongs to, or an invitation to join one. */
function JoinedChip() {
  const hydrated = useHydrated();
  const joined = useAcademy((a) => Object.keys(a.admissions).length);
  if (!hydrated) return null;
  return joined > 0 ? (
    <Link href="/media/academy" className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-text-primary px-3.5 text-sm font-bold text-signal-orange sm:inline-flex">
      <Num value={joined} />টি বিভাগে আছেন
    </Link>
  ) : (
    <Link href="/media/academy/departments" className="hidden h-9 shrink-0 items-center rounded-full bg-text-primary px-3.5 text-sm font-bold text-signal-orange sm:inline-flex">
      বিভাগে যোগ দিন
    </Link>
  );
}

/** Put up a free class this academy week (Saturday to Friday), by teacher. */
const FRESH = new Set(classVideos.filter((v) => v.access === "free" && weekOf(v.at) === weekOf(DEMO_NOW.toISOString())).map((v) => v.teacher));

/** The teachers the viewer follows, like a video site's subscriptions; a gold dot marks a new free class this week. */
function Following({ path }: { path: string }) {
  const hydrated = useHydrated();
  const follows = useAcademy((a) => a.follows);
  if (!hydrated) return null;
  const handles = Object.keys(follows);
  return (
    <div className="mb-6 border-t border-white/10 pt-5">
      <p className="mb-2 px-3 text-xs font-bold text-signal-orange">অনুসরণ</p>
      {handles.length === 0 ? (
        <Link href="/media/academy/teachers" className="block rounded-xl px-3 py-2 text-sm leading-relaxed text-white/70 hover:bg-white/8 hover:text-white">
          শিক্ষকদের অনুসরণ করলে তাঁদের চ্যানেল এখানে থাকবে।
        </Link>
      ) : (
        <ul className="space-y-0.5">
          {handles.map((h) => {
            const person = personOrThrow(h);
            const href = `/media/academy/teachers/${h}`;
            const on = path === href;
            return (
              <li key={h}>
                <Link href={href} aria-current={on ? "page" : undefined} className={cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", on ? "bg-white/12 text-white" : "text-white/85 hover:bg-white/8 hover:text-white")}>
                  <PersonAvatar person={person} size="xs" />
                  <span className="min-w-0 flex-1 truncate">{person.nameBn}</span>
                  {FRESH.has(h) && (
                    <span className="size-1.5 shrink-0 rounded-full bg-signal-orange">
                      <span className="sr-only">এ সপ্তাহে নতুন ক্লাস</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
