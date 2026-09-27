"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Radio } from "lucide-react";
import { useMemo, useState } from "react";
import { baselineStats } from "@/data/amar-bangladesh";
import { moduleLinks, moduleOf, modules, neighboursOf } from "@/data/gori/modules";
import { meters } from "@/data/gori/puzzles";
import { nationalBest, restoration } from "@/lib/gori/progression";
import { meterValues, nationIndex } from "@/lib/gori/quiz";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { BASE } from "../shell";
import { useGori } from "../store";
import { ModuleNetwork } from "./module-network";
import { PixelMap } from "./pixel-map";

/**
 * The national layer: the pixel map, the module network, the eight game
 * meters and the player's own bulletin — with the real national baseline
 * shown separately and labelled as such.
 */
export function NationalLayer() {
  const router = useRouter();
  const progress = useGori((s) => s.progress);
  const bulletin = useGori((s) => s.bulletin);
  const { n } = useT();
  const shares = useMemo(() => restoration(progress), [progress]);
  const values = meterValues(nationalBest(progress));
  const index = nationIndex(values);
  const [focus, setFocus] = useState<number | null>(null);
  const focused = focus ? modules[focus - 1] : null;
  const nb = focused ? neighboursOf(focused.code) : null;

  return (
    <section aria-labelledby="nation-title" className="mx-auto max-w-340 px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="nation-title" className="font-bengali text-3xl font-bold text-signal-orange sm:text-4xl">
            জীবন্ত বাংলাদেশ মডেল
          </h2>
          <p className="mt-2 max-w-[62ch] font-bengali text-[15px] leading-7 text-emerald-50/85">
            প্রতিটি সমস্যা একটি নষ্ট পিক্সেল। আপনি যত মডিউল সমাধান করবেন, মানচিত্র তত পরিষ্কার হবে — আর সব শেষে পতাকার লাল সূর্য ফুটে উঠবে। এটি খেলার মানচিত্র; কোনো জেলার বাস্তব অবস্থা নয়।
          </p>
        </div>
        <p className="font-bengali text-sm text-emerald-100/80">
          বাংলাদেশ ২০৫০ খেলার সূচক <strong className="ml-1 text-2xl text-white">{n(index)}</strong>
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <PixelMap shares={shares} highlight={focus ? focus - 1 : null} className="mx-auto max-w-md" />
          <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 font-bengali text-xs text-emerald-100/80" aria-label="সংকেত">
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-[#3a2220]" aria-hidden /> নষ্ট পিক্সেল</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-bd-green" aria-hidden /> পুনর্গঠিত</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-national-crimson" aria-hidden /> পতাকার সূর্য</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm border-2 border-signal-orange" aria-hidden /> বাছাই করা মডিউল</li>
          </ul>

          <h3 className="mt-8 font-bengali text-lg font-bold text-white">আটটি খাত (খেলার সূচক)</h3>
          <ul className="mt-3 space-y-2.5">
            {meters.map((m) => (
              <li key={m.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                <span className="font-bengali text-sm text-emerald-50">{m.bn}</span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-white/10" role="meter" aria-label={m.bn} aria-valuemin={0} aria-valuemax={100} aria-valuenow={values[m.id]}>
                  <span className="absolute inset-y-0 left-0 rounded-full bg-emerald-400 transition-[width] duration-700" style={{ width: `${values[m.id]}%` }} />
                  <span className="absolute inset-y-0 w-0.5 bg-signal-orange" style={{ left: `${m.base}%` }} aria-hidden />
                </span>
                <span className="text-right font-bengali text-sm font-bold tabular-nums">{n(values[m.id])}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-bengali text-xs text-emerald-100/70">কমলা দাগ = খেলার শুরুর মান। বাস্তব পরিসংখ্যান নিচে আলাদা।</p>
        </div>

        <div>
          <ModuleNetwork shares={shares} selected={focus} onSelect={(x) => (focus === x ? router.push(`${BASE}/module/${modules[x - 1].code}`) : setFocus(x))} />
          <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 font-bengali text-xs text-emerald-100/80">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-signal-orange" aria-hidden /> যার ওপর নির্ভর করে</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-emerald-300" aria-hidden /> যাকে প্রভাবিত করে</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-white/60" aria-hidden /> খেলার অনুমান</span>
          </div>
          <div className="mt-4 min-h-40 rounded-2xl border border-white/10 bg-white/4 p-5" aria-live="polite">
            {focused && nb ? (
              <>
                <p className="font-bengali text-xs font-semibold text-signal-orange">{focused.code}</p>
                <h3 className="font-bengali text-lg font-bold">{focused.titleBn}</h3>
                <p className="text-xs text-emerald-100/70">{focused.titleEn}</p>
                <div className="mt-3 grid gap-3 font-bengali text-sm sm:grid-cols-2">
                  <LinkList title="নির্ভর করে" items={nb.upstream.map((l) => ({ code: l.from, note: l.note, basis: l.basis }))} />
                  <LinkList title="প্রভাব ফেলে" items={nb.downstream.map((l) => ({ code: l.to, note: l.note, basis: l.basis }))} />
                </div>
                <Link href={`${BASE}/module/${focused.code}`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-signal-orange px-4 font-bengali text-sm font-bold text-gori-ink">
                  মডিউল খুলুন <ArrowRight className="size-4" aria-hidden />
                </Link>
              </>
            ) : (
              <p className="font-bengali text-sm leading-6 text-emerald-100/80">
                একটি মডিউলে চাপ দিন বা কীবোর্ডে ফোকাস করুন — দেখুন সেটি কোন সমস্যার ওপর নির্ভর করে আর কাকে প্রভাবিত করে। দ্বিতীয়বার চাপ দিলে মডিউল খুলবে। {n(moduleLinks.length)}টি সম্পর্কের প্রতিটি হয় প্রতিবেদনের প্রক্রিয়া, নয়তো খেলার অনুমান — আলাদা করে দেখানো।
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="bulletin-title" className="rounded-2xl border border-white/10 p-5">
          <h3 id="bulletin-title" className="flex items-center gap-2 font-bengali text-lg font-bold">
            <Radio className="size-5 text-signal-orange" aria-hidden /> খেলার বুলেটিন
          </h3>
          <p className="mt-1 font-bengali text-xs text-emerald-100/70">আপনার নিজের খেলা থেকে তৈরি সিমুলেশন বার্তা — আসল খবর নয়।</p>
          {bulletin.length ? (
            <ul className="mt-3 space-y-2">
              {bulletin.slice(0, 6).map((b, i) => (
                <li key={i} className="border-l-2 border-signal-orange/60 pl-3 font-bengali text-sm text-emerald-50">
                  {b.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 font-bengali text-sm text-emerald-100/75">এখনো কোনো বার্তা নেই। একটি অভিযান শেষ করলে বা মডিউল সমাধান করলে এখানে দেখাবে।</p>
          )}
        </section>

        <section aria-labelledby="real-title" className="rounded-2xl bg-gori-cream p-5 text-gori-ink">
          <h3 id="real-title" className="font-bengali text-lg font-bold">বাস্তব তথ্য: দেশ এখন কোথায়</h3>
          <p className="mt-1 font-bengali text-xs text-gori-mute">প্রকাশিত জাতীয় সূচক, সূত্রসহ — খেলার সাথে মেশানো হয় না।</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {baselineStats.slice(0, 9).map((s) => (
              <div key={s.id}>
                <dt className="font-bengali text-xs text-gori-mute">{s.banglaLabel}</dt>
                <dd className="font-display text-lg font-bold tabular-nums">
                  {s.value}
                  {s.unit && <span className="ml-1 text-xs font-semibold text-gori-mute">{s.unit}</span>}
                </dd>
                <dd className="text-[11px] text-gori-mute">{s.source}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}

function LinkList({ title, items }: { title: string; items: { code: string; note: string; basis: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-emerald-100/70">{title}</p>
      {items.length ? (
        <ul className="mt-1 space-y-1.5">
          {items.map((i) => (
            <li key={i.code} className={cn("leading-snug", i.basis === "assumption" && "italic")}>
              <span className="font-semibold text-white">{moduleOf(i.code)?.titleBn}</span>
              <span className="block text-xs text-emerald-100/70">
                {i.basis === "assumption" ? "খেলার অনুমান · " : "প্রতিবেদনের প্রক্রিয়া · "}
                {i.note}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-emerald-100/60">নেই</p>
      )}
    </div>
  );
}
