"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, UserCheck, UsersRound, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { categories } from "@/data/media/categories";
import { currentUser, people, personOrThrow } from "@/data/media/users";
import { suggestPeople } from "@/lib/media/suggest";
import { useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { PixelMark } from "@/components/ui/section-kit";
import { EmptyState } from "../ui/empty-state";
import { chipClass, selectClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { asCandidate, PersonTile } from "./people-you-may-know";

type Tab = "suggest" | "all" | "following";
const TABS: { key: Tab; label: string; short: string; Icon: LucideIcon }[] = [
  { key: "suggest", label: "পরামর্শ", short: "পরামর্শ", Icon: Sparkles },
  { key: "all", label: "সবাই", short: "সবাই", Icon: UsersRound },
  { key: "following", label: "অনুসরণ করছেন", short: "অনুসরণে", Icon: UserCheck },
];

/**
 * Everyone on the platform, the way a friends page works: suggestions to
 * follow, the whole directory, and the people you follow — searchable by
 * name, skill or district.
 */
export function PeopleDirectory() {
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = TABS.find((t) => t.key === params.get("tab"))?.key ?? "suggest";
  const following = useMediaState((s) => s.following);
  const dismissed = useMediaState((s) => s.dismissedPeople);
  const [q, setQ] = useState("");
  const [near, setNear] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cat, setCat] = useState("");

  const me = asCandidate(currentUser);
  const pool = people.map(asCandidate);
  // Reasons for everyone; the suggestions tab also leaves out who you follow or hid.
  const everyone = suggestPeople(me, pool, { following: new Set(), dismissed: new Set() });
  const lists: Record<Tab, typeof everyone> = {
    suggest: suggestPeople(me, pool, { following: new Set(Object.keys(following)), dismissed: new Set(Object.keys(dismissed)) }),
    all: [...everyone].sort((a, b) => personOrThrow(a.handle).nameBn.localeCompare(personOrThrow(b.handle).nameBn, "bn")),
    following: everyone.filter((s) => following[s.handle]),
  };

  const needle = q.trim().toLowerCase();
  const shown = lists[tab].filter((s) => {
    const p = personOrThrow(s.handle);
    if (near && p.district !== currentUser.district) return false;
    if (verified && !p.idVerified) return false;
    if (cat && !p.categories.includes(cat as (typeof p.categories)[number])) return false;
    return !needle || [p.nameBn, p.name, p.headline, p.district, p.area, ...p.skills.map((k) => k.skill)].some((f) => f.toLowerCase().includes(needle));
  });

  const go = (t: Tab) => router.replace(t === "suggest" ? "/media/people" : `/media/people?tab=${t}`, { scroll: false });

  return (
    <div className="space-y-6">
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-8">
        <PixelMark tone="dark" />
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">মানুষ</h1>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-white/80">দক্ষ মানুষ খুঁজুন, অনুসরণ করুন — একই দক্ষতা, একই জেলা, একই স্বপ্ন। কাজের বন্ধু এখানেই।</p>
        <dl className="mt-5 grid max-w-md grid-cols-3 gap-2">
          {[
            { label: "অনুসরণ করছেন", n: lists.following.length },
            { label: "পরামর্শ", n: lists.suggest.length },
            { label: "মোট সদস্য", n: people.length },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse rounded-2xl bg-white/10 px-3 py-2.5 text-center">
              <dt className="text-xs text-white/70">{s.label}</dt>
              <dd className="text-2xl font-bold text-signal-orange"><Num value={s.n} /></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="মানুষের তালিকা" className="lg:sticky lg:top-22 lg:self-start">
          <ul className="grid grid-cols-3 gap-1 rounded-2xl bg-white/10 p-1 lg:grid-cols-1 lg:gap-1.5 lg:bg-transparent lg:p-0">
            {TABS.map(({ key, label, short, Icon }) => {
              const on = tab === key;
              return (
                <li key={key}>
                  <button type="button" onClick={() => go(key)} aria-current={on ? "page" : undefined} className={cn("flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors lg:justify-start lg:text-[15px]", on ? "bg-signal-orange text-text-primary shadow-tile" : "text-white/80 hover:bg-white/10 hover:text-white")}>
                    <Icon className="hidden size-5 lg:block" aria-hidden />
                    <span className="truncate"><span className="lg:hidden">{short}</span><span className="hidden lg:inline">{label}</span></span>
                    <span className={cn("ml-auto hidden rounded-md px-1.5 text-xs lg:inline", on ? "bg-text-primary text-signal-orange" : "bg-white/10")}><Num value={lists[key].length} /></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-4">
          <label className="relative block">
            <span className="sr-only">মানুষ খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/65" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম, দক্ষতা বা জেলা — যেমন: মেহেদি, পাইথন, যশোর"
              className="h-12 w-full rounded-2xl border border-white/12 bg-text-primary pr-4 pl-12 text-[15px] text-white focus:border-signal-orange focus:ring-3 focus:ring-signal-orange/15 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-pressed={near} onClick={() => setNear((v) => !v)} className={chipClass(near)}>আমার জেলা ({currentUser.district})</button>
            <button type="button" aria-pressed={verified} onClick={() => setVerified((v) => !v)} className={chipClass(verified)}>শুধু যাচাইকৃত</button>
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="বিভাগ" className={cn(selectClass, "h-9 w-auto rounded-full text-sm")}>
              <option value="">সব বিভাগ</option>
              {categories.filter((c) => people.some((p) => p.categories.includes(c.id))).map((c) => <option key={c.id} value={c.id}>{c.bn}</option>)}
            </select>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon="search"
              title={tab === "following" && !needle ? "এখনো কাউকে অনুসরণ করছেন না" : "কাউকে পাওয়া যায়নি"}
              body={tab === "following" && !needle ? "পরামর্শ থেকে একই দক্ষতা বা জেলার মানুষদের অনুসরণ করুন — তাঁদের পোস্ট ফিডে আসবে।" : "অন্য নাম বা দক্ষতা লিখে দেখুন, নয়তো ফিল্টার সরান।"}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {shown.map((s) => <PersonTile key={s.handle} person={personOrThrow(s.handle)} reason={s.reason} wide dismissible={tab === "suggest"} />)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
