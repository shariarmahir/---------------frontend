"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Num } from "../ui/numerals";
import { useUnread, type UnreadSeed } from "./unread";

/** Header search: people, skill posts and listings, all on /media/search. */
export function SearchBox() {
  const pathname = usePathname();
  const params = useSearchParams();
  const q = pathname === "/media/search" ? (params.get("q") ?? "") : "";
  return (
    <form action="/media/search" role="search" className="mx-auto hidden w-full max-w-md md:block">
      <label className="relative block">
        <span className="sr-only">দক্ষতা, সেবা বা মানুষ খুঁজুন</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-signal-orange" aria-hidden />
        <input
          // Remount when the URL's query changes so the field shows it.
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="দক্ষতা, সেবা বা মানুষ খুঁজুন…"
          className="h-10 w-full rounded-full bg-text-primary pr-4 pl-10 text-sm text-white shadow-ink transition-shadow duration-200 placeholder:text-white/65 focus:ring-2 focus:ring-white focus:outline-none"
        />
      </label>
    </form>
  );
}

/** The count on the header's messages icon. */
export function UnreadBubble({ seed }: { seed: UnreadSeed }) {
  const n = useUnread(seed);
  if (n <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 rounded-full bg-white px-1 text-[11px] leading-4.5 font-bold text-text-primary ring-2 ring-signal-orange">
      <Num value={n} />
    </span>
  );
}
