"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, BookOpen, Building2, ChevronDown, Search, UserRound, X } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { courses, departments, getDepartment, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { SCHOOLS, type School } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { CartButton } from "../cart";
import { useAcademy } from "../use-academy";

const SCHOOL_LIST = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
const BY_ENROLMENT = [...courses].sort((a, b) => b.enrolled - a.enrolled);
/** The four courses most learners joined, then the next eight as short skill names. */
const POPULAR = BY_ENROLMENT.slice(0, 4);
const SKILLS = BY_ENROLMENT.slice(4, 12);

type Hit = { href: string; label: string; kind: string; Icon: typeof Search };

/**
 * The departments page's own bar, laid out like a big course site's: the
 * word mark, "অন্বেষণ" opening a wide menu (departments, schools, courses
 * and finals, popular skills), "আমার শেখা", finals, a round search that
 * suggests as you type, and the learner's goal, bell and face on the right.
 */
export function ExploreNav({ onSchool, onAllDepts, className }: { onSchool?: (s: School) => void; onAllDepts?: () => void; className?: string } = {}) {
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

  // A section on this page is scrolled to; on another page, the departments page opens at it.
  function jump(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    else router.push(`/media/academy/departments#${id}`);
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
      <input
        id={`${listId}-q`}
        type="search"
        value={q}
        maxLength={60}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="কী শিখতে চান?"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={focused && hits.length > 0}
        className="frost-tile h-11 w-full rounded-full pr-14 pl-5 text-[15px] text-m-ink transition-[background-color,box-shadow] placeholder:text-m-ink/55 focus:bg-white focus:ring-3 focus:ring-m-blue/25 focus:outline-none"
      />
      <button type="submit" className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-m-yellow text-m-ink transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none">
        <Search className="size-4.5" strokeWidth={2.6} aria-hidden />
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
            className="absolute inset-x-0 top-13 z-40 overflow-hidden rounded-2xl bg-m-card py-2 shadow-[0_24px_48px_-16px_rgb(16_24_40/0.29)] ring-1 ring-m-ink/10"
          >
            {hits.length === 0 ? (
              <li className="px-4 py-3 text-sm text-m-ink/70">“{q.trim()}” — কিছু মিলল না। অন্য শব্দে খুঁজুন।</li>
            ) : (
              hits.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-m-ink hover:bg-m-ink/4 focus-visible:bg-m-ink/4 focus-visible:outline-none">
                    <h.Icon className="size-4.5 shrink-0 text-m-ink/60" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{h.label}</span>
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
  const head = "mb-3 text-base font-bold text-m-ink";
  const item = "block text-left text-sm text-m-ink/80 transition-colors hover:text-m-blue focus-visible:text-m-blue focus-visible:outline-none";
  const all = "mt-3 inline-block text-sm font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue";

  return (
    <>
      <AnimatePresence>
        {open && <motion.div key="scrim" className="fixed inset-0 z-25 bg-white/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)} aria-hidden />}
      </AnimatePresence>

      <div ref={bar} className={cn("frost-pane sticky -top-6 z-30 -mx-3 sm:-mx-6", className)}>
        <nav aria-label="বিভাগ" className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Link href="/media/academy/departments" className="shrink-0 text-2xl leading-none font-extrabold text-m-blue">
            কাণ্ডারী <span className="text-m-ink">শিখন</span>
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
            className={cn("inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold transition-colors", open ? "bg-m-ink/7 text-m-ink" : "text-m-ink/80 hover:bg-m-ink/4 hover:text-m-ink")}
          >
            অন্বেষণ
            <ChevronDown className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
          </button>
          <a href="#my-learning" onClick={(e) => (e.preventDefault(), jump("my-learning"))} className="hidden h-10 shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-m-ink/80 hover:text-m-ink lg:inline-flex">
            আমার শেখা
          </a>
          <Link href="/media/academy/exam" className="hidden h-10 shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-m-ink/80 hover:text-m-ink lg:inline-flex">
            ফাইনাল
          </Link>
          <div className="hidden max-w-xl flex-1 md:block">{searchBox}</div>
          <span className="flex-1 md:hidden" />
          <button type="button" onClick={() => setPhoneSearch((s) => !s)} className="grid size-10 shrink-0 place-items-center rounded-full text-m-ink hover:bg-m-ink/6 md:hidden">
            {phoneSearch ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
            <span className="sr-only">{phoneSearch ? "খোঁজা বন্ধ" : "খুঁজুন"}</span>
          </button>
          <span className="hidden min-w-0 shrink items-center gap-1 text-sm text-m-ink/75 xl:flex">
            লক্ষ্য:
            {goalDept ? (
              <Link href={`/media/academy/dept/${goalDept.id}`} className="truncate font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                {goalDept.name}
              </Link>
            ) : (
              <a href="#departments" onClick={(e) => (e.preventDefault(), jump("departments"))} className="font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                বিভাগ বেছে নিন
              </a>
            )}
          </span>
          <CartButton />
          <Link href="/media/academy/videos" className="hidden size-10 shrink-0 place-items-center rounded-full text-m-ink/85 hover:bg-m-ink/6 hover:text-m-ink sm:grid">
            <Bell className="size-5" aria-hidden />
            <span className="sr-only">নতুন ক্লাস</span>
          </Link>
          {account && <AccountAvatar name={account.name} photo={account.photo} sizes="36px" className="size-9 shrink-0 text-sm ring-2 ring-m-blue" />}
        </nav>

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
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-9rem)] overflow-y-auto border-b border-m-ink/8 bg-white/95 shadow-[0_30px_50px_-30px_rgb(16_24_40/0.35)] backdrop-blur-xl"
            >
              <motion.div
                className="mx-auto grid max-w-7xl gap-8 px-5 pt-7 pb-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4"
                initial={reduce ? false : "hide"}
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
              >
                <Col>
                  <h2 className={head}>বিভাগ দেখুন</h2>
                  <ul className={col}>
                    {departments.slice(0, 10).map((d) => (
                      <li key={d.id}>
                        <Link href={`/media/academy/dept/${d.id}`} onClick={() => setOpen(false)} className={item}>
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => (onAllDepts?.(), jump("departments"))} className={all}>
                    সব দেখুন
                  </button>
                </Col>
                <Col>
                  <h2 className={head}>ধারা অনুযায়ী</h2>
                  <ul className={col}>
                    {SCHOOL_LIST.map((s) => (
                      <li key={s}>
                        <button type="button" onClick={() => (onSchool?.(s), jump("job-ready"))} className={item}>
                          {SCHOOLS[s]}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => jump("job-ready")} className={all}>
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
                  <button type="button" onClick={() => jump("popular")} className={all}>
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
                      <Link href="/media/academy/teachers" onClick={() => setOpen(false)} className={item}>
                        প্যানেল-পাস শিক্ষক
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
                  <h2 className={cn(head, "mt-7")}>ভর্তির কার্ট</h2>
                  <Link href="/media/academy/checkout" onClick={() => setOpen(false)} className={all}>
                    চেকআউটে যান
                  </Link>
                </Col>
              </motion.div>
              <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
                <p className="border-t border-m-ink/10 pt-5 text-sm text-m-ink/75">
                  কোথা থেকে শুরু করবেন বুঝছেন না?{" "}
                  <Link href="/media/academy/videos" onClick={() => setOpen(false)} className="font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                    বিনামূল্যের ক্লাস দেখুন
                  </Link>{" "}
                  অথবা{" "}
                  <button type="button" onClick={() => jump("start")} className="font-semibold text-m-ink underline underline-offset-4 hover:text-m-blue">
                    জানুন বিভাগ কীভাবে চলে
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
  return (
    <motion.div variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>
      {children}
    </motion.div>
  );
}
