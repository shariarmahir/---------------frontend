"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PackageSearch, ShieldAlert, ShieldCheck, Store } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { boardPosts, MODES, SIDES, UNITS } from "@/data/media/bazaar";
import { DEFAULT_SUB, formForSub, isSubId, resolveSub, tagIdeasFor } from "@/data/media/market-sections";
import { districts } from "@/data/media/districts";
import { listings } from "@/data/media/market";
import type { BoardPost, CategoryId } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { bannedWord, parseTags, type TradeMode } from "@/lib/media/bazaar";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { BoardCard } from "./board-card";
import { Row, TagInput } from "./form-parts";
import { SubPicker } from "./sub-picker";
import { buyersFor, offersFrom, postOffer, sellersFor } from "./matching";

type Side = BoardPost["side"];

interface Draft {
  side: Side;
  who: string;
  category: CategoryId;
  sub: string;
  custom: string;
  title: string;
  tags: string;
  qty: string;
  unit: string;
  price: string;
  mode: TradeMode;
  organic: boolean;
  sampleTest: boolean;
  when: string;
  district: string;
  note: string;
}

function blank(side: Side, from?: BoardPost, asked?: string | null): Draft {
  const sub = asked && isSubId(asked) ? asked : (from?.sub ?? DEFAULT_SUB[from?.category ?? "farm"]);
  return {
    side,
    who: "",
    category: resolveSub(sub).sub.base,
    sub,
    custom: "",
    title: "",
    tags: from ? from.tags.map((t) => `#${t}`).join(" ") : "",
    qty: from ? String(from.qty) : "",
    unit: from?.unit ?? formForSub(sub).unit,
    price: "",
    mode: from?.mode ?? (side === "sell" ? "wholesale" : "retail"),
    organic: Boolean(from?.organic),
    sampleTest: from?.mode === "export",
    when: "",
    district: currentUser.district,
    note: "",
  };
}

function problems(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.who.trim().length < 3) e.who = "কে পোস্ট করছেন, কয়েক শব্দে লিখুন";
  if (d.sub === "custom" && d.custom.trim().length < 2) e.custom = "নিজের বিভাগের নাম লিখুন";
  if (d.title.trim().length < 6) e.title = "অন্তত ৬ অক্ষরের এক লাইনের শিরোনাম দিন";
  if (parseTags(d.tags).length === 0) e.tags = "অন্তত একটি হ্যাশট্যাগ দিন — এতেই মিল হয়";
  if (toNumber(d.qty) <= 0) e.qty = d.side === "buy" ? "কতটা দরকার লিখুন" : "কতটা আছে লিখুন";
  if (d.side === "sell" && toNumber(d.price) <= 0) e.price = "দাম লিখুন";
  if (!d.district) e.district = "জেলা বেছে নিন";
  const banned = bannedWord([d.title, d.tags, d.custom, d.note].join(" "));
  if (banned) e.title = `আইনে নিষিদ্ধ পণ্য (“${banned}”) এখানে কেনা বা বেচা যায় না।`;
  return e;
}

function toPost(d: Draft, id: string): BoardPost {
  return {
    id,
    author: currentUser.handle,
    side: d.side,
    who: d.who.trim(),
    title: d.title.trim() || SIDES[d.side].bn,
    category: d.category,
    sub: d.sub,
    tags: parseTags(d.tags),
    qty: toNumber(d.qty),
    unit: d.unit,
    price: toNumber(d.price) || undefined,
    district: d.district,
    mode: d.mode,
    organic: d.organic || undefined,
    sampleTest: (d.side === "buy" && d.sampleTest) || undefined,
    when: d.when.trim() || (d.side === "buy" ? "যত দ্রুত সম্ভব" : "এখনই"),
    note: d.note.trim() || undefined,
  };
}

/**
 * The চাহিদা বোর্ড form: one short page to say “I want to sell this” or “I want
 * to buy this”. The other side of the board and the shop listings are matched
 * as you type.
 */
export function BoardForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mine = useMediaState((s) => s.listings);
  const myPosts = useMediaState((s) => s.board);
  const from = boardPosts.find((p) => p.id === params.get("for"));
  const [d, setD] = useState<Draft>(() => blank(params.get("side") === "sell" ? "sell" : "buy", from, params.get("sub")));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const aria = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });
  const buy = d.side === "buy";
  const farmOrFood = d.category === "farm" || d.category === "cooking";

  const post = toPost(d, "draft");
  const allPosts = [...boardPosts, ...myPosts];
  const sellers = buy ? sellersFor(post, offersFrom([...listings, ...mine], allPosts)) : [];
  const buyers = buy ? [] : buyersFor(postOffer(post), allPosts);
  const banned = bannedWord([d.title, d.tags, d.custom, d.note].join(" "));

  function publish(e: React.FormEvent) {
    e.preventDefault();
    const found = problems(d);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    const saved = toPost(d, newId("bp"));
    if (!updateMedia((s) => ({ ...s, board: [saved, ...s.board] }))) {
      toast.error("এই ব্রাউজারে সেভ করা গেল না");
      return;
    }
    const n = buy ? sellers.length : buyers.length;
    toast.success("বোর্ডে উঠল", { description: n ? `${n} জনের সাথে এখনই মিলেছে।` : "মিলের মতো পোস্ট এলেই জানানো হবে।" });
    router.push("/media/market?view=board");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <form noValidate onSubmit={publish} className="min-w-0 space-y-6 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-7">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">কোন দিকের পোস্ট</legend>
          {([
            { k: "sell", Icon: Store, on: "bg-bd-green text-white ring-bd-green" },
            { k: "buy", Icon: PackageSearch, on: "bg-signal-orange text-text-primary ring-signal-orange" },
          ] as const).map(({ k, Icon, on }) => (
            <label key={k} className={cn("flex cursor-pointer flex-col gap-2 rounded-2xl p-4 ring-2 transition-[translate,background-color] duration-300 hover:-translate-y-0.5 has-focus-visible:ring-white motion-reduce:transition-none", d.side === k ? on : "bg-black/40 text-white ring-white/12 hover:ring-white/30")}>
              <input type="radio" name="side" className="sr-only" checked={d.side === k} onChange={() => setD((x) => ({ ...x, side: k, mode: k === "sell" ? "wholesale" : "retail", sampleTest: false }))} />
              <Icon className="size-6" aria-hidden />
              <span className="text-lg font-bold">{SIDES[k].bn}</span>
              <span className="text-xs opacity-80">{SIDES[k].hint}</span>
            </label>
          ))}
        </fieldset>

        <div key={d.side} className="live-in space-y-6">
          <Row id="who" label="আপনি কে *" error={errors.who} hint={buy ? "যেমন: ফলের দোকান, মোহাম্মদপুর · রেস্তোরাঁ · নিজের পরিবারের জন্য" : "যেমন: ধান চাষি, শেরপুর · কারিগর দল · পাইকার"}>
            <Input id="who" value={d.who} onChange={(e) => set("who", e.target.value)} maxLength={60} {...aria("who")} />
          </Row>

          <SubPicker value={d.sub} onChange={(id) => setD((x) => ({ ...x, sub: id, category: resolveSub(id).sub.base, unit: formForSub(id).unit }))} />
          {d.sub === "custom" && (
            <Row id="custom" label="আপনার বিভাগের নাম *" error={errors.custom}>
              <Input id="custom" value={d.custom} onChange={(e) => set("custom", e.target.value)} maxLength={40} {...aria("custom")} />
            </Row>
          )}

          <Row id="title" label="এক লাইনে *" error={errors.title}>
            <Input id="title" value={d.title} onChange={(e) => set("title", e.target.value)} maxLength={70} placeholder={buy ? "ঝুনা নারকেল — ২০টি, প্রতি সপ্তাহে" : "পাকা সুপারি — ২,০০০ পিস"} {...aria("title")} />
          </Row>
          <TagInput value={d.tags} ideas={tagIdeasFor(d.sub)} error={errors.tags} onChange={(v) => set("tags", v)} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Row id="qty" label={buy ? "কতটা দরকার *" : "কতটা আছে *"} error={errors.qty}>
              <Input id="qty" inputMode="numeric" value={d.qty} onChange={(e) => set("qty", e.target.value)} {...aria("qty")} />
            </Row>
            <Row id="unit" label="একক">
              <select id="unit" value={d.unit} onChange={(e) => set("unit", e.target.value)} className={selectClass}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Row>
            <Row id="price" label={buy ? `সর্বোচ্চ দর / ${d.unit}` : `দাম / ${d.unit} *`} error={errors.price} hint={buy ? "খালি রাখলে আলোচনায়" : undefined}>
              <Input id="price" inputMode="numeric" value={d.price} onChange={(e) => set("price", e.target.value)} {...aria("price")} />
            </Row>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-white">{buy ? "কী জন্য কিনছেন" : "কাদের কাছে বিক্রি করবেন"}</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MODES) as TradeMode[]).map((k) => (
                <label key={k} className={choiceClass(d.mode === k)} title={MODES[k].hint}>
                  <input type="radio" name="mode" className="sr-only" checked={d.mode === k} onChange={() => setD((x) => ({ ...x, mode: k, sampleTest: k === "export" }))} />
                  {MODES[k].bn}
                </label>
              ))}
            </div>
          </fieldset>

          {(farmOrFood || (buy && d.mode === "export")) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {farmOrFood && (
                <label htmlFor="organic" className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/5 px-3 text-sm font-semibold text-white">
                  {buy ? "শুধু বিষমুক্ত চাই" : "বিষমুক্ত / অর্গানিক"}
                  <Switch id="organic" checked={d.organic} onCheckedChange={(v) => set("organic", v)} />
                </label>
              )}
              {buy && d.mode === "export" && (
                <label htmlFor="sampleTest" className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/5 px-3 text-sm font-semibold text-white">
                  আগে নমুনা ও ল্যাব টেস্ট
                  <Switch id="sampleTest" checked={d.sampleTest} onCheckedChange={(v) => set("sampleTest", v)} />
                </label>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Row id="when" label={buy ? "কবে দরকার" : "কবে থেকে পাওয়া যাবে"} hint={buy ? "যেমন: প্রতি শনিবার" : "যেমন: ৩ অক্টোবর থেকে"}>
              <Input id="when" value={d.when} onChange={(e) => set("when", e.target.value)} maxLength={40} />
            </Row>
            <Row id="district" label="জেলা *" error={errors.district}>
              <select id="district" value={d.district} onChange={(e) => set("district", e.target.value)} className={selectClass} {...aria("district")}>
                <option value="">বেছে নিন</option>
                {districts.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Row>
          </div>
          <Row id="note" label="আর কিছু">
            <Textarea id="note" rows={3} value={d.note} onChange={(e) => set("note", e.target.value)} maxLength={300} placeholder={buy ? "মান, প্যাকেট, কোথায় কখন চাই।" : "মান, কীভাবে পাঠাবেন, ভাগ করে বিক্রি করবেন কি না।"} />
          </Row>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-5">
          <button type="submit" disabled={Boolean(banned)} className={mediaButton({ variant: buy ? "primary" : "green", size: "lg" })}>
            বোর্ডে পোস্ট করুন
          </button>
        </div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start" aria-label="প্রিভিউ ও অটো-মিল">
        <p className="text-xs font-semibold text-white/60">বোর্ডে যেমন দেখাবে</p>
        <div inert className="pointer-events-none select-none">
          <BoardCard post={post} author={currentUser} sellers={sellers} buyers={buyers} mine />
        </div>
        <div className={cn("flex items-start gap-2 rounded-2xl p-3 text-sm text-white", banned ? "bg-national-crimson" : "bg-bd-green")} role={banned ? "alert" : undefined}>
          {banned ? <ShieldAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden /> : <ShieldCheck className="mt-0.5 size-4.5 shrink-0" aria-hidden />}
          {banned ? <span>“{banned}” আইনে নিষিদ্ধ — এই পোস্ট প্রকাশ করা যাবে না।</span> : <span>বৈধতা যাচাই: কোনো নিষিদ্ধ পণ্যের নাম নেই।</span>}
        </div>
        <p className="text-xs leading-relaxed text-white/60">{resolveSub(d.sub).section.hint}</p>
      </aside>
    </div>
  );
}
