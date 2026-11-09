"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Sparkles, UserCheck, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { getCategory, isCategoryId } from "@/data/media/categories";
import type { Person } from "@/data/media/types";
import { currentUser, people, personOrThrow } from "@/data/media/users";
import { follows } from "@/data/media/follows";
import { mutualsOf, shuffled, suggestPeople, type Reason } from "@/lib/media/suggest";
import { toggleKey, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { mediaButton } from "../ui/button-styles";
import { Compact, Num } from "../ui/numerals";
import { toneClass } from "../ui/person";
import { IdSeal } from "../ui/trust";

export const asCandidate = (p: Person) => ({ handle: p.handle, district: p.district, categories: p.categories, skills: p.skills.map((s) => s.skill), followers: p.followers });

function why(r: Reason) {
  if (r.kind === "skill") return { Icon: Sparkles, text: `একই দক্ষতা: ${r.value}` };
  if (r.kind === "district") return { Icon: MapPin, text: `আপনার জেলা: ${r.value}` };
  if (r.kind === "category") return { Icon: Users, text: isCategoryId(r.value) ? getCategory(r.value).bn : r.value };
  return { Icon: Users, text: "অনেকে অনুসরণ করেন" };
}

/** Does `handle` follow the viewer? */
export const followsYou = (handle: string) => Boolean(follows[handle]?.includes(currentUser.handle));

/** The people you follow who also follow `handle`. */
export function useMutuals(handle: string) {
  const following = useMediaState((s) => s.following);
  return mutualsOf(handle, Object.keys(following), follows).map(personOrThrow);
}

/** Overlapping initials of up to three mutual followers. */
function Faces({ list, size = "sm" }: { list: Person[]; size?: "sm" | "md" }) {
  return (
    <span className="flex shrink-0 -space-x-1.5" aria-hidden>
      {list.slice(0, 3).map((p) => (
        <span
          key={p.handle}
          className={cn(
            "flex items-center justify-center rounded-full font-bengali font-bold ring-2 ring-m-card",
            size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs",
            toneClass[p.tone],
          )}
        >
          {p.initials}
        </span>
      ))}
    </span>
  );
}

/** Profile line: who you follow that follows them, and whether they follow you. */
export function MutualLine({ handle }: { handle: string }) {
  const mutual = useMutuals(handle);
  const back = followsYou(handle);
  if (handle === currentUser.handle || (!mutual.length && !back)) return null;
  const names = mutual
    .slice(0, 2)
    .map((p) => p.nameBn)
    .join(", ");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-m-ink/80">
      {back && <span className="rounded-full bg-m-ink/6 px-2.5 py-0.5 text-xs font-semibold text-m-ink">আপনাকে অনুসরণ করেন</span>}
      {mutual.length > 0 && (
        <span className="flex items-center gap-2">
          <Faces list={mutual} size="md" />
          <span>
            {names}
            {mutual.length > 2 && (
              <>
                {" "}
                ও আরও <Num value={mutual.length - 2} /> জন
              </>
            )}{" "}
            এঁকে অনুসরণ করেন
          </span>
        </span>
      )}
    </div>
  );
}

export function setDismissed(handle: string, on: boolean) {
  updateMedia((s) => {
    const next = { ...s.dismissedPeople };
    if (on) next[handle] = true;
    else delete next[handle];
    return { ...s, dismissedPeople: next };
  });
}

/** One person to follow. The ✕ shows only where hiding makes sense (suggestions). */
export function PersonTile({
  person,
  reason,
  wide,
  onFollow,
  dismissible = true,
}: {
  person: Person;
  reason: Reason;
  wide?: boolean;
  onFollow?: (handle: string) => void;
  dismissible?: boolean;
}) {
  const ensure = useRequireAccount();
  const following = useMediaState((s) => Boolean(s.following[person.handle]));
  const mutual = useMutuals(person.handle);
  const back = followsYou(person.handle);
  const { Icon, text } = why(reason);
  function dismiss() {
    setDismissed(person.handle, true);
    toast(`${person.nameBn}-কে আর দেখাব না`, { action: { label: "ফিরিয়ে আনুন", onClick: () => setDismissed(person.handle, false) } });
  }
  return (
    <li
      className={cn(
        "group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-m-card ring-1 ring-m-ink/10 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 shadow-m-tile",
        wide ? "w-full" : "w-40 sm:w-44",
      )}
    >
      <Link href={`/media/u/${person.handle}`} className={cn("relative flex aspect-square items-center justify-center", toneClass[person.tone])}>
        <span className="font-bengali text-5xl font-bold transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">{person.initials}</span>
        {person.idVerified && <IdSeal size={22} className="absolute bottom-2 left-2" />}
        {back && <span className="absolute top-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-m-ink">আপনাকে অনুসরণ করেন</span>}
        <span className="sr-only">{person.nameBn}-এর প্রোফাইল</span>
      </Link>
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label={`${person.nameBn}-কে সরান`}
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/80 text-m-ink transition-colors hover:bg-m-canvas"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/media/u/${person.handle}`} className="truncate text-sm font-bold text-m-ink hover:text-m-blue">
          {person.nameBn}
        </Link>
        <p className="flex items-center gap-1 truncate text-xs text-m-ink/70">
          <Icon className="size-3.5 shrink-0 text-m-blue" aria-hidden />
          <span className="truncate">{text}</span>
        </p>
        {mutual.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-m-ink/80" title={mutual.map((p) => p.nameBn).join(", ")}>
            <Faces list={mutual} />
            <span className="truncate">
              <Num value={mutual.length} /> জন পারস্পরিক
            </span>
          </p>
        )}
        <p className="truncate text-xs text-m-ink/55">
          <Compact n={person.followers + (following ? 1 : 0)} /> অনুসারী · {person.district}
        </p>
        <button
          type="button"
          aria-pressed={following}
          onClick={() => {
            if (!ensure("অনুসরণ করতে")) return;
            onFollow?.(person.handle);
            toggleKey("following", person.handle);
          }}
          className={mediaButton({ variant: following ? "quiet" : "primary", size: "sm", className: "mt-auto w-full" })}
        >
          {following ? <UserCheck aria-hidden /> : <UserPlus aria-hidden />}
          {following ? "অনুসরণ করছেন" : back ? "ফিরতি অনুসরণ" : "অনুসরণ"}
        </button>
      </div>
    </li>
  );
}

/**
 * “আপনি হয়তো চেনেন” — a row of people to follow, scrolled with arrows or a
 * swipe. With `about`, it suggests people like that profile's owner; `seed`
 * reshuffles it, so a second row further down the feed shows other faces.
 */
export function PeopleYouMayKnow({ about, title = "আপনি হয়তো চেনেন", seed = 0, className }: { about?: string; title?: string; seed?: number; className?: string }) {
  const headingId = useId();
  const following = useMediaState((s) => s.following);
  const dismissed = useMediaState((s) => s.dismissedPeople);
  const row = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [all, setAll] = useState(false);
  // People followed from this row stay in it, so the button can flip back.
  const [kept, setKept] = useState<Set<string>>(() => new Set());
  const keep = (h: string) => setKept((k) => new Set(k).add(h));

  const centre = about ? personOrThrow(about) : currentUser;
  const ranked = suggestPeople(asCandidate(centre), people.map(asCandidate), {
    following: new Set(Object.keys(following).filter((h) => !kept.has(h))),
    dismissed: new Set(Object.keys(dismissed)),
    exclude: [currentUser.handle],
    mutuals: (h) => mutualsOf(h, Object.keys(following), follows).length,
  });
  const list = shuffled(ranked, seed).slice(0, 12);

  function measure() {
    const el = row.current;
    if (el) setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }
  useEffect(measure, [list.length, all]);

  if (list.length === 0) return null;
  const scroll = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow =
    "absolute top-[34%] z-10 hidden size-11 items-center justify-center rounded-full bg-white/90 text-m-ink shadow-lg ring-1 ring-m-ink/17 backdrop-blur transition-[opacity,scale] hover:scale-105 hover:bg-m-canvas sm:flex";

  return (
    <section aria-labelledby={headingId} className={cn("story-reveal rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-base font-bold text-m-ink">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="text-sm font-semibold text-m-ink/75 hover:text-m-ink">
            {all ? "কম দেখুন" : "এখানেই সব"}
          </button>
          <Link href="/media/people" className="text-sm font-semibold text-m-blue hover:underline">
            সব দেখুন
          </Link>
        </div>
      </div>
      {all ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((s) => (
            <PersonTile key={s.handle} person={personOrThrow(s.handle)} reason={s.reason} wide onFollow={keep} />
          ))}
        </ul>
      ) : (
        <div className="relative">
          <ul ref={row} onScroll={measure} className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
            {list.map((s) => (
              <PersonTile key={s.handle} person={personOrThrow(s.handle)} reason={s.reason} onFollow={keep} />
            ))}
          </ul>
          {!edges.start && (
            <button type="button" onClick={() => scroll(-1)} aria-label="আগের জন" className={cn(arrow, "-left-2")}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          )}
          {!edges.end && (
            <button type="button" onClick={() => scroll(1)} aria-label="পরের জন" className={cn(arrow, "-right-2")}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
