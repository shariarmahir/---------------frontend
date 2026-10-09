"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, BookOpen, Building2, ChevronDown, Compass, DoorOpen, Landmark, LogOut, PanelLeftClose, PanelLeftOpen, Presentation, Search, Target, UserRound, X } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { academies, courses, departments, getDepartment, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { SCHOOLS, type School } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { CartButton } from "../cart";
import { useAcademy } from "../use-academy";
import type { AcademyRole } from "./academy-gate";

const SCHOOL_LIST = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
const BY_ENROLMENT = [...courses].sort((a, b) => b.enrolled - a.enrolled);
/** The four courses most learners joined, then the next eight as short skill names. */
const POPULAR = BY_ENROLMENT.slice(0, 4);
const SKILLS = BY_ENROLMENT.slice(4, 12);

/** What the menu asks of the departments page, if it is open: show a school, or every department. */
export const EXPLORE_EVENT = "academy:explore";
export type ExploreAsk = { school: School } | { allDepts: true };

type Hit = { href: string; label: string; kind: string; Icon: typeof Search };

/**
 * The academy's one top bar, frosted glass edge to edge: the sidebar toggle,
 * the mark and name, "অন্বেষণ" opening a wide menu, "আমার শেখা", a round
 * search that suggests as you type, then the learner's goal (or the
 * teacher's role), the cart, the bell, their face and the way out.
 */
export function AcademyHeader({ role, rail, onRail, onLeave }: { role: AcademyRole; rail: boolean; onRail: () => void; onLeave: () => void }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const hydrated = useHydrated();
  const { account } = useAuth();
  const admissions = useAcademy((a) => a.admissions);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const listId = useId();

  const goalDept = hydrated ? getDepartment(Object.keys(admissions)[0] ?? "") : undefined;

  useEffect(() => {
    if (!open && !focused) return;
    const away = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open, focused]);

  const hits = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const has = (...f: string[]) => f.some((x) => x.toLowerCase().includes(needle));
    return [
      ...academies.filter((a) => has(a.name, a.about)).map((a) => ({ href: `/media/academy/a/${a.id}`, label: a.name, kind: "একাডেমি", Icon: Landmark })),
      ...departments.filter((d) => has(d.name, d.blurb)).map((d) => ({ href: `/media/academy/dept/${d.id}`, label: d.name, kind: "বিভাগ", Icon: Building2 })),
      ...courses.filter((c) => has(c.title, c.id, c.outcome)).map((c) => ({ href: `/media/academy/course/${c.id}`, label: c.title, kind: c.id, Icon: BookOpen })),
      ...teacherRecords
        .filter((t) => {
          const p = personOrThrow(t.handle);
          return has(p.nameBn, p.name, t.title);
        })
        .map((t) => ({ href: `/media/academy/teachers/${t.handle}`, label: personOrThrow(t.handle).nameBn, kind: "শিক্ষক", Icon: UserRound })),
    ].slice(0, 7);
  }, [q]);

  function close() {
    setOpen(false);
    setFocused(false);
    setPhoneSearch(false);
    setQ("");
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  // A section of the departments page: scrolled to if it is open, else the page opens at it.
  function jump(id: string, ask?: ExploreAsk) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      if (ask) window.dispatchEvent(new CustomEvent<ExploreAsk>(EXPLORE_EVENT, { detail: ask }));
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    } else router.push(`/media/academy#${id}`);
  }

  const searchBox = (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (hits[0]) go(hits[0].href);
      }}
      className="relative w-full"
    >
      <label htmlFor={`${listId}-q`} className="sr-only">
        কী শিখতে চান?
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-m-ink/45" aria-hidden />
      <input
        id={`${listId}-q`}
        type="search"
        value={q}
        maxLength={60}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="কী শিখতে চান? বিভাগ, কোর্স বা শিক্ষক"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={focused && hits.length > 0}
        className="h-11 w-full rounded-full bg-m-ground/80 pr-14 pl-11 text-[15px] text-m-ink ring-1 ring-m-ink/8 transition-[background-color,box-shadow] placeholder:text-m-ink/50 focus:bg-white focus:shadow-m-tile focus:ring-2 focus:ring-m-blue/35 focus:outline-none"
      />
      <button type="submit" className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-m-blue text-m-on shadow-m-tile transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none">
        <Search className="size-4" strokeWidth={2.6} aria-hidden />
        <span className="sr-only">খুঁজুন</span>
      </button>
      <AnimatePresence>
        {focused && q.trim() && (
          <motion.ul
            id={listId}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-13 z-40 overflow-hidden rounded-2xl bg-white py-2 shadow-m-lift ring-1 ring-m-ink/8"
          >
            {hits.length === 0 ? (
              <li className="px-4 py-3 text-sm text-m-ink/70">“{q.trim()}” — কিছু মিলল না। অন্য শব্দে খুঁজুন।</li>
            ) : (
              hits.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-m-ink hover:bg-m-blue-soft/60 focus-visible:bg-m-blue-soft/60 focus-visible:outline-none">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-m-blue-soft text-m-blue">
                      <h.Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{h.label}</span>
                    <span className="shrink-0 text-xs text-m-ink/50">{h.kind}</span>
                  </Link>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  );

  const col = "space-y-2.5";
  const head = "mb-3 text-xs font-bold tracking-wide text-m-blue";
  const item = "block text-left text-sm text-m-ink/80 transition-colors hover:text-m-blue focus-visible:text-m-blue focus-visible:outline-none";
  const all = "mt-3 inline-flex items-center gap-1 text-sm font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue";
  const icon = "grid size-10 shrink-0 place-items-center rounded-full text-m-ink/80 transition-colors hover:bg-m-ink/6 hover:text-m-ink";

  return (
    <>
      <AnimatePresence>
        {open && <motion.div key="scrim" className="fixed inset-0 z-25 bg-m-ink/20 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)} aria-hidden />}
      </AnimatePresence>

      <div ref={bar} className="frost-pane relative z-30 shrink-0">
        <header className="flex h-16 items-center gap-1.5 px-2.5 sm:gap-2.5 sm:px-4">
          <button type="button" onClick={onRail} aria-expanded={rail} aria-controls="academy-rail" title={rail ? "সাইডবার লুকান" : "সাইডবার দেখান"} className={cn(icon, "hidden rounded-xl lg:grid")}>
            {rail ? <PanelLeftClose className="size-5" aria-hidden /> : <PanelLeftOpen className="size-5" aria-hidden />}
            <span className="sr-only">{rail ? "সাইডবার লুকান" : "সাইডবার দেখান"}</span>
          </button>

          <Link href="/media/academy" className="flex shrink-0 items-center gap-3 rounded-xl pr-1 focus-visible:outline-2 focus-visible:outline-m-blue">
            <span className="frost-tile rounded-xl px-1.5 pt-1 pb-0.5 text-center text-m-ink">
              <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="96px" className="h-8 w-auto" priority />
              <span className="block text-[9px] font-extrabold tracking-[0.3em]">ACADEMY</span>
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[15px] font-bold text-m-ink">কাণ্ডারী তৈরি একাডেমি</span>
              <span className="block text-xs font-semibold text-m-blue">সবার আমি ছাত্র</span>
            </span>
          </Link>

          <span className="mx-1 hidden h-8 w-px shrink-0 bg-m-ink/10 md:block" aria-hidden />

          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
            className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-colors sm:px-3.5", open ? "bg-m-ink text-m-on" : "text-m-ink/85 hover:bg-m-ink/5 hover:text-m-ink")}
          >
            <Compass className="size-4.5" aria-hidden />
            <span className="hidden sm:inline">অন্বেষণ</span>
            <ChevronDown className={cn("hidden size-4 transition-transform duration-200 sm:block motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
          </button>
          <Link href="/media/academy/classroom" className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-m-ink/85 transition-colors hover:bg-m-ink/5 hover:text-m-ink xl:inline-flex">
            <DoorOpen className="size-4.5" aria-hidden /> আমার শেখা
          </Link>

          <div className="mx-auto hidden max-w-xl min-w-0 flex-1 px-1 md:block">{searchBox}</div>
          <span className="flex-1 md:hidden" />

          <button type="button" onClick={() => setPhoneSearch((s) => !s)} className={cn(icon, "md:hidden")}>
            {phoneSearch ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
            <span className="sr-only">{phoneSearch ? "খোঁজা বন্ধ" : "খুঁজুন"}</span>
          </button>

          {role === "teacher" ? (
            <Link href="/media/academy/classroom" className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-m-amber-soft px-3.5 text-sm font-bold text-m-ink ring-1 ring-m-yellow/50 2xl:inline-flex">
              <Presentation className="size-4 text-m-gold" aria-hidden /> শিক্ষক হিসেবে আছেন
            </Link>
          ) : (
            hydrated && (
              <Link href={goalDept ? `/media/academy/dept/${goalDept.id}` : "/media/academy#academies"} className="hidden h-9 max-w-56 shrink-0 items-center gap-1.5 rounded-full bg-m-amber-soft px-3.5 text-sm text-m-ink ring-1 ring-m-yellow/50 transition-colors hover:bg-m-yellow/40 2xl:inline-flex">
                <Target className="size-4 shrink-0 text-m-gold" aria-hidden />
                <span className="shrink-0 text-m-ink/65">লক্ষ্য</span>
                <span className="truncate font-bold">{goalDept ? goalDept.name : "বিভাগ বেছে নিন"}</span>
              </Link>
            )
          )}

          <CartButton />
          <Link href="/media/academy/videos" className={cn(icon, "hidden sm:grid")}>
            <Bell className="size-5" aria-hidden />
            <span className="sr-only">নতুন ক্লাস</span>
          </Link>
          {account && <AccountAvatar name={account.name} photo={account.photo} sizes="36px" className="ml-0.5 size-9 shrink-0 text-sm ring-2 ring-white shadow-m-tile" />}
          <span className="mx-0.5 hidden h-8 w-px shrink-0 bg-m-ink/10 sm:block" aria-hidden />
          <button type="button" onClick={onLeave} className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-2.5 text-sm font-bold text-m-ink/80 transition-colors hover:bg-m-red-soft hover:text-m-red sm:px-3">
            <LogOut className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
            <span className="hidden lg:inline">বের হন</span>
            <span className="sr-only lg:hidden">একাডেমি থেকে বের হন</span>
          </button>
        </header>

        {phoneSearch && <div className="px-3 pb-3 md:hidden">{searchBox}</div>}

        <AnimatePresence>
          {open && (
            <motion.div
              id={menuId}
              key="menu"
              initial={reduce ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-y border-m-ink/8 bg-white/96 shadow-m-lift backdrop-blur-xl"
            >
              <motion.div className="mx-auto grid max-w-7xl gap-8 px-5 pt-7 pb-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4" initial={reduce ? false : "hide"} animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
                <Col>
                  <h2 className={head}>একাডেমি</h2>
                  <ul className={col}>
                    {academies.slice(0, 10).map((a) => (
                      <li key={a.id}>
                        <Link href={`/media/academy/a/${a.id}`} onClick={() => setOpen(false)} className={item}>
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => jump("academies", { allDepts: true })} className={all}>
                    সব দেখুন
                  </button>
                </Col>
                <Col>
                  <h2 className={head}>ধারা অনুযায়ী</h2>
                  <ul className={col}>
                    {SCHOOL_LIST.map((s) => (
                      <li key={s}>
                        <button type="button" onClick={() => jump("academies", { school: s })} className={item}>
                          {SCHOOLS[s]}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => jump("academies", { allDepts: true })} className={all}>
                    সব দেখুন
                  </button>
                </Col>
                <Col>
                  <h2 className={head}>সার্টিফিকেট কোর্স</h2>
                  <ul className={col}>
                    {POPULAR.map((c) => (
                      <li key={c.id}>
                        <Link href={`/media/academy/course/${c.id}`} onClick={() => setOpen(false)} className={item}>
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => jump("academies", { allDepts: true })} className={all}>
                    সব দেখুন
                  </button>
                  <h2 className={cn(head, "mt-7")}>ফাইনাল ও সার্টিফিকেট</h2>
                  <ul className={col}>
                    <li>
                      <Link href="/media/academy/exam" onClick={() => setOpen(false)} className={item}>
                        ফাইনাল ও প্রকাশ্য বোর্ড
                      </Link>
                    </li>
                    <li>
                      <Link href="/media/academy#academies" onClick={() => setOpen(false)} className={item}>
                        একাডেমি ও শিক্ষক
                      </Link>
                    </li>
                    <li>
                      <Link href="/media/academy/teach" onClick={() => setOpen(false)} className={item}>
                        শিক্ষক হিসেবে আবেদন
                      </Link>
                    </li>
                  </ul>
                </Col>
                <Col>
                  <h2 className={head}>জনপ্রিয় দক্ষতা</h2>
                  <ul className={col}>
                    {SKILLS.map((c) => (
                      <li key={c.id}>
                        <Link href={`/media/academy/course/${c.id}`} onClick={() => setOpen(false)} className={item}>
                          {c.title.split(" — ")[0]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <h2 className={cn(head, "mt-7")}>আমার শেখা</h2>
                  <ul className={col}>
                    <li>
                      <Link href="/media/academy/classroom" onClick={() => setOpen(false)} className={item}>
                        আমার ক্লাসরুম
                      </Link>
                    </li>
                    <li>
                      <Link href="/media/academy/checkout" onClick={() => setOpen(false)} className={item}>
                        ভর্তির কার্ট ও চেকআউট
                      </Link>
                    </li>
                  </ul>
                </Col>
              </motion.div>
              <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
                <p className="border-t border-m-ink/10 pt-5 text-sm text-m-ink/75">
                  কোথা থেকে শুরু করবেন বুঝছেন না?{" "}
                  <Link href="/media/academy/videos" onClick={() => setOpen(false)} className="font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                    বিনামূল্যের ক্লাস দেখুন
                  </Link>{" "}
                  অথবা{" "}
                  <button type="button" onClick={() => jump("journey")} className="font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                    দেখুন ৯ ধাপে কীভাবে চলে
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function Col({ children }: { children: React.ReactNode }) {
  return <motion.div variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>{children}</motion.div>;
}
