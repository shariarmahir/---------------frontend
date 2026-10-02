"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { bn } from "./ui";

const NAV = [
  { href: "/research", label: "প্রধান পাতা", icon: "auto_stories" },
  { href: "/research/contents", label: "সূচিপত্র", icon: "list_alt" },
  { href: "/research/changes", label: "সাম্প্রতিক পরিবর্তন", icon: "history" },
  { href: "/research/random", label: "এলোমেলো নিবন্ধ", icon: "shuffle" },
  { href: "/research/contents#mine", label: "আমার জমা", icon: "folder_shared" },
  { href: "/research/submit#rules", label: "প্রকাশের নিয়ম", icon: "gavel" },
];

/** The wordmark: a gold library tile, the serif name, and its Latin name underneath. */
export function Wordmark() {
  return (
    <Link href="/research" className="group flex items-center gap-3" aria-label="গবেষণাকোষ — প্রধান পাতা">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal-orange text-text-primary transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none">
        <Icon name="local_library" className="text-[28px]" />
      </span>
      <span className="leading-tight">
        <span className="font-wiki block text-[1.7rem] font-bold text-white">গবেষণাকোষ</span>
        <span lang="en" className="block text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">Kandari ResearchPedia</span>
      </span>
    </Link>
  );
}

function SearchBox() {
  const q = useSearchParams().get("q") ?? "";
  return (
    <form role="search" action="/research/search" className="relative w-full lg:max-w-xl">
      <label htmlFor="research-q" className="sr-only">গবেষণাকোষে খুঁজুন</label>
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-white/50" />
      <input
        id="research-q"
        name="q"
        type="search"
        defaultValue={q}
        key={q}
        placeholder="বিষয়, লেখক, প্রতিষ্ঠান বা জেলা খুঁজুন"
        className="h-13 w-full rounded-2xl bg-white/[0.07] pr-28 pl-12 text-[15px] text-white ring-1 ring-white/12 transition-shadow placeholder:text-white/45 focus:ring-2 focus:ring-signal-orange focus:outline-none"
      />
      <button type="submit" className="absolute top-1.5 right-1.5 h-10 rounded-xl bg-white px-4 text-sm font-bold text-text-primary transition-colors hover:bg-signal-orange">খুঁজুন</button>
    </form>
  );
}

/** The library's frame: brand, search and publish on top; the sections as pills below; the page under them. */
export function ResearchShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mine = useResearch((s) => s.mine.length);
  return (
    <>
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-gutter-x pt-6 pb-4 lg:flex-row lg:items-center lg:gap-8">
          <Wordmark />
          <div className="flex flex-1 items-center gap-3 lg:justify-end">
            <Suspense fallback={<div className="h-13 w-full rounded-2xl bg-white/[0.07] lg:max-w-xl" />}>
              <SearchBox />
            </Suspense>
            <Link href="/research/submit" className="hidden h-13 shrink-0 items-center gap-2 rounded-2xl bg-signal-orange px-5 text-sm font-bold text-text-primary transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white motion-reduce:hover:translate-y-0 sm:inline-flex">
              <Icon name="upload_file" className="text-[20px]" /> গবেষণা প্রকাশ করুন
            </Link>
          </div>
        </div>
        <nav aria-label="গবেষণাকোষের অংশ" className="mx-auto max-w-7xl px-gutter-x">
          <ul className="-mx-gutter-x flex gap-1 overflow-x-auto px-gutter-x scrollbar-none">
            {NAV.map((l) => {
              const on = l.href === pathname;
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative flex h-12 items-center gap-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-colors",
                      on ? "text-white after:bg-signal-orange" : "text-white/60 after:bg-transparent hover:text-white",
                    )}
                  >
                    <Icon name={l.icon} className={cn("text-[19px]", on ? "text-signal-orange" : "text-white/45")} />
                    {l.label}
                    {l.label === "আমার জমা" && mine > 0 && <span className="rounded-full bg-bd-green px-1.5 text-[11px] font-bold text-white">{bn(mine)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-gutter-x pt-8 pb-20 sm:pt-10">{children}</div>
    </>
  );
}
