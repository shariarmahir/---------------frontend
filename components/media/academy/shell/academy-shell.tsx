"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Award, CalendarDays, ClipboardCheck, DoorOpen, Landmark, MonitorPlay, Presentation, UserPlus, type LucideIcon } from "lucide-react";
import { classVideos } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { weekOf } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "../../ui/person";
import { useTeacher } from "../desk/use-teacher";
import { JourneyBar, JourneyNav } from "../journey/journey";
import { useAcademy } from "../use-academy";
import { AcademyGate, type AcademyRole } from "./academy-gate";
import { AcademyHeader } from "./academy-header";
import { AcademyStory } from "./academy-story";

const RAIL_KEY = "kandari-academy-rail";
/** Pages drawn edge to edge with their own navigation, no academy bar, sidebar or dock: these, and everything under the prefixes. */
const FULL_SCREEN = ["/media/academy", "/media/academy/departments", "/media/academy/courses"];
const FULL_SCREEN_UNDER = ["/media/academy/a/"];
const fullScreen = (path: string) => FULL_SCREEN.includes(path) || FULL_SCREEN_UNDER.some((p) => path.startsWith(p));

interface Item {
  href: string;
  label: string;
  short?: string;
  Icon: LucideIcon;
  /** Other paths that belong to this item. */
  also?: string[];
}

/** Beside the road: the free classes anyone may watch. */
const MORE: Item[] = [{ href: "/media/academy/videos", label: "বিনামূল্যের ক্লাস ভিডিও", Icon: MonitorPlay }];
const TEACH: Item[] = [
  { href: "/media/academy/classroom/open", label: "ক্লাসরুম খুলুন", short: "খুলুন", Icon: Presentation },
  { href: "/media/academy/panel", label: "প্যানেল মার্কিং", short: "প্যানেল", Icon: ClipboardCheck },
  { href: "/media/academy/teach", label: "একাডেমি খুলুন", Icon: UserPlus },
];
/** Phones get the road in five: choosing (academy to admission), then routine, class, exam, graduation. */
const TABS: Item[] = [
  { href: "/media/academy", label: "একাডেমি", Icon: Landmark, also: ["/media/academy/a", "/media/academy/dept", "/media/academy/course", "/media/academy/checkout"] },
  { href: "/media/academy/routine", label: "রুটিন", Icon: CalendarDays },
  { href: "/media/academy/classroom", label: "ক্লাস", Icon: DoorOpen },
  { href: "/media/academy/exam", label: "পরীক্ষা", Icon: ClipboardCheck },
  { href: "/media/academy/graduation", label: "সমাবর্তন", Icon: Award },
];

function isOn(item: Item, path: string): boolean {
  // Everything lives under /media/academy, so the first tab matches itself exactly, or its own pages.
  if (item.href === "/media/academy") return path === item.href || (item.also ?? []).some((p) => path === p || path.startsWith(`${p}/`));
  // The classroom tab stays lit inside rooms, but not on the "open a classroom" form, which has its own item.
  if (item.href === "/media/academy/classroom" && path.startsWith("/media/academy/classroom/open")) return false;
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
  // Whether the sidebar shows, remembered on this device.
  const [rail, setRail] = useState(() => {
    try {
      return localStorage.getItem(RAIL_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const toggleRail = useCallback(() => {
    setRail((r) => {
      try {
        localStorage.setItem(RAIL_KEY, r ? "0" : "1");
      } catch {}
      return !r;
    });
  }, []);

  function enter(as: AcademyRole) {
    setRole(as);
    setStage("story");
    // A teacher coming in at the front door lands at their desk, or at the application.
    if (as === "teacher" && pathname === "/media/academy") router.replace(record ? "/media/academy/classroom" : "/media/academy/teach");
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
  const teach = <Group title="শেখান" items={TEACH} path={pathname} />;

  // A catalogue page brings its own bar and instruments: the whole screen is its.
  if (fullScreen(pathname)) {
    return (
      <div className="fixed inset-0 z-45 flex flex-col font-sans">
        <main ref={main} id="academy-main" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-45 flex flex-col bg-m-ground font-sans text-m-ink">
      <AcademyHeader role={role} rail={rail} onRail={toggleRail} onLeave={leave} />
      {/* The road as a strip: on phones, and on big screens when the sidebar (which is the road) is hidden. */}
      <JourneyBar className={rail ? "lg:hidden" : undefined} />

      <div className="flex min-h-0 flex-1">
        {/* The sidebar slides shut to nothing and back; shut, it is out of the tab order too. */}
        <nav
          id="academy-rail"
          aria-label="একাডেমি"
          inert={!rail}
          className={cn(
            "hidden shrink-0 overflow-hidden border-r bg-white/70 shadow-[inset_-1px_0_0_rgb(255_255_255/0.9)] transition-[width,opacity,border-color] duration-300 ease-out lg:flex motion-reduce:transition-none",
            rail ? "w-60 border-m-ink/8 opacity-100" : "w-0 border-r-0 opacity-0",
          )}
        >
          <div className="flex w-60 shrink-0 flex-col overflow-y-auto px-3 py-5">
            {/* A teacher's menu starts with teaching; a learner's with the road. */}
            {role === "teacher" && teach}
            <JourneyNav />
            <Group title="আরও" items={MORE} path={pathname} />
            {role !== "teacher" && teach}
            <Following path={pathname} />
            <div className="blue-band mt-auto rounded-2xl p-4 shadow-m-tile">
              <p className="text-lg leading-snug font-bold text-m-yellow">সবার আমি ছাত্র</p>
              <p className="mt-2 text-xs leading-relaxed font-semibold text-white/80">যোগ দেওয়া বিনামূল্যে · ফি এসক্রোতে · ফাইনাল প্রকাশ্য</p>
            </div>
          </div>
        </nav>

        <main ref={main} id="academy-main" className="scrollbar-gold min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-6 pb-24 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      <nav aria-label="একাডেমি" className="frost-dock shrink-0 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((item) => {
            const on = isOn(item, pathname);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={on ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", on ? "text-m-blue" : "text-m-ink/65")}>
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
      <p className="mb-2 px-3 text-xs font-bold text-m-blue">{title}</p>
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
                  on ? "bg-m-yellow text-m-ink shadow-m-tile" : "text-m-ink/85 hover:bg-m-ink/4 hover:text-m-ink",
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

/** Put up a free class this academy week (Saturday to Friday), by teacher. */
const FRESH = new Set(classVideos.filter((v) => v.access === "free" && weekOf(v.at) === weekOf(DEMO_NOW.toISOString())).map((v) => v.teacher));

/** The teachers the viewer follows, like a video site's subscriptions; a gold dot marks a new free class this week. */
function Following({ path }: { path: string }) {
  const hydrated = useHydrated();
  const follows = useAcademy((a) => a.follows);
  if (!hydrated) return null;
  const handles = Object.keys(follows);
  return (
    <div className="mb-6 border-t border-m-ink/9 pt-5">
      <p className="mb-2 px-3 text-xs font-bold text-m-blue">অনুসরণ</p>
      {handles.length === 0 ? (
        <Link href="/media/academy#academies" className="block rounded-xl px-3 py-2 text-sm leading-relaxed text-m-ink/70 hover:bg-m-ink/4 hover:text-m-ink">
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
                <Link href={href} aria-current={on ? "page" : undefined} className={cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", on ? "bg-m-ink/7 text-m-ink" : "text-m-ink/85 hover:bg-m-ink/4 hover:text-m-ink")}>
                  <PersonAvatar person={person} size="xs" />
                  <span className="min-w-0 flex-1 truncate">{person.nameBn}</span>
                  {FRESH.has(h) && (
                    <span className="size-1.5 shrink-0 rounded-full bg-m-yellow">
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
