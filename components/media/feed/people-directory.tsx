"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, UserCheck, UserRoundPlus, UsersRound, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { districts, divisionOf, divisions } from "@/data/districts";
import { categories } from "@/data/media/categories";
import { follows } from "@/data/media/follows";
import { currentUser, people, personOrThrow } from "@/data/media/users";
import { followersOf, mutualsOf, suggestPeople } from "@/lib/media/suggest";
import { useMediaState } from "@/lib/media/store";
import { digits } from "@/lib/media/format";
import { cn } from "@/lib/utils";
import { PixelMark } from "@/components/ui/section-kit";
import { EmptyState } from "../ui/empty-state";
import { chipClass, selectClass } from "../ui/field-styles";
import { Num, useNumerals } from "../ui/numerals";
import { asCandidate, PersonTile } from "./people-you-may-know";

type Tab = "all" | "followers" | "following";
const TABS: { key: Tab; label: string; short: string; Icon: LucideIcon }[] = [
  { key: "all", label: "সবাই", short: "সবাই", Icon: UsersRound },
  { key: "followers", label: "আপনার অনুসারী", short: "অনুসারী", Icon: UserRoundPlus },
  { key: "following", label: "অনুসরণ করছেন", short: "অনুসরণে", Icon: UserCheck },
];

type Sort = "relevant" | "mutual" | "popular" | "name";
const SORTS: { key: Sort; label: string }[] = [
  { key: "relevant", label: "প্রাসঙ্গিক আগে" },
  { key: "mutual", label: "পারস্পরিক বেশি" },
  { key: "popular", label: "অনুসারী বেশি" },
  { key: "name", label: "নাম (অ–হ)" },
];

const filterSelect = cn(selectClass, "h-9 w-auto max-w-full rounded-full text-sm");

/**
 * Everyone on the platform, the way a friends page works: the whole
 * directory, your followers (with follow-back) and the people you follow —
 * found by name, skill, division or district.
 */
export function PeopleDirectory() {
  const router = useRouter();
  const params = useSearchParams();
  const { numerals } = useNumerals();
  const tab: Tab = TABS.find((t) => t.key === params.get("tab"))?.key ?? "all";
  const following = useMediaState((s) => s.following);
  const [q, setQ] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<Sort>("relevant");

  const mine = Object.keys(following);
  const mutualCount = (h: string) => mutualsOf(h, mine, follows).length;
  const ranked = suggestPeople(asCandidate(currentUser), people.map(asCandidate), { following: new Set(), dismissed: new Set(), mutuals: mutualCount });
  const fans = new Set(followersOf(currentUser.handle, follows));
  const lists: Record<Tab, typeof ranked> = {
    all: ranked,
    followers: ranked.filter((s) => fans.has(s.handle)),
    following: ranked.filter((s) => following[s.handle]),
  };

  // Members per place, so the menus say where people actually are.
  const perDistrict = new Map<string, number>();
  for (const p of people) if (p.handle !== currentUser.handle) perDistrict.set(p.district, (perDistrict.get(p.district) ?? 0) + 1);
  const inDivision = (name: string) => divisions.find((d) => d.name === name)!.districts.reduce((n, d) => n + (perDistrict.get(d) ?? 0), 0);
  const count = (n: number) => (n ? ` (${digits(n, numerals)})` : "");
  const districtChoices = division ? divisions.find((d) => d.name === division)!.districts : districts;

  const needle = q.trim().toLowerCase();
  const shown = lists[tab]
    .filter((s) => {
      const p = personOrThrow(s.handle);
      if (division && divisionOf(p.district) !== division) return false;
      if (district && p.district !== district) return false;
      if (cat && !p.categories.includes(cat as (typeof p.categories)[number])) return false;
      return !needle || [p.nameBn, p.name, p.handle, p.headline, p.district, divisionOf(p.district) ?? "", p.area, ...p.skills.map((k) => k.skill)].some((f) => f.toLowerCase().includes(needle));
    })
    .sort((a, b) => {
      const pa = personOrThrow(a.handle);
      const pb = personOrThrow(b.handle);
      if (sort === "mutual") return mutualCount(b.handle) - mutualCount(a.handle) || b.score - a.score;
      if (sort === "popular") return pb.followers - pa.followers;
      if (sort === "name") return pa.nameBn.localeCompare(pb.nameBn, "bn");
      return 0;
    });

  const filtered = Boolean(needle || division || district || cat);
  const home = district === currentUser.district;
  const go = (t: Tab) => router.replace(t === "all" ? "/media/people" : `/media/people?tab=${t}`, { scroll: false });
  const reset = () => {
    setQ("");
    setDivision("");
    setDistrict("");
    setCat("");
  };
  const pickDistrict = (d: string) => {
    setDistrict(d);
    if (d) setDivision(divisionOf(d) ?? "");
  };

  return (
    <div className="space-y-6">
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-8">
        <PixelMark tone="dark" />
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">মানুষ</h1>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-white/80">দক্ষ মানুষ খুঁজুন, অনুসরণ করুন — একই দক্ষতা, একই জেলা, একই স্বপ্ন। কাজের বন্ধু এখানেই।</p>
        <dl className="mt-5 grid max-w-md grid-cols-3 gap-2">
          {[
            { label: "অনুসারী", n: lists.followers.length },
            { label: "অনুসরণ করছেন", n: lists.following.length },
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
              placeholder="নাম, দক্ষতা, বিভাগ বা জেলা — যেমন: মেহেদি, পাইথন, যশোর"
              className="h-12 w-full rounded-2xl border border-white/12 bg-text-primary pr-4 pl-12 text-[15px] text-white focus:border-signal-orange focus:ring-3 focus:ring-signal-orange/15 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-pressed={home} onClick={() => pickDistrict(home ? "" : currentUser.district)} className={chipClass(home)}>
              <MapPin className="size-4" aria-hidden /> আমার জেলা
            </button>
            <select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                setDistrict("");
              }}
              aria-label="বিভাগ"
              className={filterSelect}
            >
              <option value="">সব বিভাগ</option>
              {divisions.map((d) => <option key={d.name} value={d.name}>{d.name}{count(inDivision(d.name))}</option>)}
            </select>
            <select value={district} onChange={(e) => pickDistrict(e.target.value)} aria-label="জেলা" className={filterSelect}>
              <option value="">{division ? `${division}-এর সব জেলা` : "সব জেলা"}</option>
              {districtChoices.map((d) => <option key={d} value={d}>{d}{count(perDistrict.get(d) ?? 0)}</option>)}
            </select>
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="দক্ষতার ধরন" className={filterSelect}>
              <option value="">সব দক্ষতা</option>
              {categories.filter((c) => people.some((p) => p.categories.includes(c.id))).map((c) => <option key={c.id} value={c.id}>{c.bn}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="সাজান" className={cn(filterSelect, "sm:ml-auto")}>
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex min-h-6 items-center justify-between gap-3 text-sm text-white/70" aria-live="polite">
            <span><Num value={shown.length} /> জন{district ? ` · ${district}` : division ? ` · ${division} বিভাগ` : ""}</span>
            {filtered && (
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-signal-orange hover:underline">
                <X className="size-4" aria-hidden /> ফিল্টার মুছুন
              </button>
            )}
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon="search"
              title={!filtered && tab === "following" ? "এখনো কাউকে অনুসরণ করছেন না" : !filtered && tab === "followers" ? "এখনো কোনো অনুসারী নেই" : "কাউকে পাওয়া যায়নি"}
              body={
                !filtered && tab === "following"
                  ? "সবাই থেকে একই দক্ষতা বা জেলার মানুষদের অনুসরণ করুন — তাঁদের পোস্ট ফিডে আসবে।"
                  : !filtered && tab === "followers"
                    ? "দক্ষতা পোস্ট করুন, যাচাই করুন — মানুষ আপনাকে খুঁজে পাবে।"
                    : "অন্য নাম বা দক্ষতা লিখে দেখুন, নয়তো পাশের বিভাগ বা জেলা বেছে নিন।"
              }
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {shown.map((s) => <PersonTile key={s.handle} person={personOrThrow(s.handle)} reason={s.reason} wide dismissible={false} />)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
