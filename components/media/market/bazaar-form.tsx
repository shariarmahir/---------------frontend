"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Laptop, Leaf, Plus, Rocket, ShieldAlert, ShieldCheck, Sprout, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { boardPosts, DELIVERY, fieldsFor, MODES, PHYSICAL, PRODUCT_FORMS, STAGE_FIELDS, STAGES, TAG_IDEAS, UNITS, type Field } from "@/data/media/bazaar";
import { categories, getCategory } from "@/data/media/categories";
import { districts } from "@/data/media/districts";
import type { BoardPost, CategoryId, Delivery, Listing, MediaSlot } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { bannedWord, parseTags, type SellerStage, type TradeMode } from "@/lib/media/bazaar";
import { computeFees } from "@/lib/media/fees";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { Num, Taka } from "../ui/numerals";
import { Row, SpecField, Stepper, TagInput } from "./form-parts";
import { ListingCard } from "./listing-card";
import { MediaPicker } from "./media-picker";
import { buyersFor, listingOffer } from "./matching";

const STAGE_ICON: Record<SellerStage, LucideIcon> = { solo: Sprout, new: Rocket, freelance: Laptop, running: Building2 };
const GOODS_DELIVERY: Delivery[] = ["bus", "cold", "courier", "train", "truck", "home", "pickup"];
const SERVICE_DELIVERY: Delivery[] = ["onsite", "digital", "pickup", "home"];

interface Draft {
  stage: SellerStage;
  category: CategoryId;
  custom: string;
  title: string;
  description: string;
  tags: string;
  /** Photos, videos and audio samples, cover first. */
  media: MediaSlot[];
  price: string;
  unit: string;
  stock: string;
  minOrder: string;
  kg: string;
  negotiable: boolean;
  floor: string;
  modes: TradeMode[];
  tiers: { min: string; price: string }[];
  organic: boolean;
  perishable: boolean;
  delivery: Delivery[];
  district: string;
  area: string;
  extra: Record<string, string>;
}

const STEPS = ["আপনি কে", "পণ্য বা সেবা", "দাম ও পরিমাণ", "ডেলিভারি ও প্রকাশ"];

function blank(from?: BoardPost): Draft {
  return {
    stage: "solo",
    category: from?.category ?? "farm",
    custom: "",
    title: "",
    description: "",
    tags: from ? from.tags.map((t) => `#${t}`).join(" ") : "",
    price: "",
    unit: from?.unit ?? PRODUCT_FORMS[from?.category ?? "farm"].unit,
    stock: "",
    minOrder: "",
    kg: "",
    negotiable: true,
    floor: "",
    modes: from ? [from.mode] : ["retail"],
    tiers: [],
    organic: Boolean(from?.organic),
    perishable: false,
    delivery: PRODUCT_FORMS[from?.category ?? "farm"].delivery,
    media: [],
    district: currentUser.district,
    area: currentUser.area,
    extra: {},
  };
}

const num = toNumber;

/** Specific fields for this seller, in order: stage first, then the goods. */
const specFields = (d: Draft): Field[] => [...STAGE_FIELDS[d.stage], ...fieldsFor(d.category)];

/** Everything wrong with a step, keyed by field. */
function problems(d: Draft, step: number): Record<string, string> {
  const e: Record<string, string> = {};
  const physical = PHYSICAL.has(d.category);
  const need = (f: Field) => f.required && !d.extra[f.key]?.trim() && (e[`spec-${f.key}`] = `${f.label} দিন`);
  if (step === 0) {
    STAGE_FIELDS[d.stage].forEach(need);
  }
  if (step === 1) {
    if (d.category === "other" && d.custom.trim().length < 2) e.custom = "নিজের বিভাগের নাম লিখুন";
    if (d.title.trim().length < 6) e.title = "অন্তত ৬ অক্ষরের এক লাইনের শিরোনাম দিন";
    if (d.description.trim().length < 20) e.description = "অন্তত ২০ অক্ষরে বিস্তারিত লিখুন";
    const need = PRODUCT_FORMS[d.category].media.need;
    if (need && !d.media.some((m) => m.kind === need)) e.media = { image: "অন্তত একটি আসল ছবি দিন", video: "অন্তত একটি ভিডিও দিন", audio: "অন্তত একটি অডিও নমুনা দিন — ক্রেতা আগে শুনে নেবেন" }[need];
    if (parseTags(d.tags).length === 0) e.tags = "অন্তত একটি হ্যাশট্যাগ দিন — এতেই ক্রেতা খুঁজে পান";
    const banned = bannedWord([d.title, d.description, d.tags, d.custom].join(" "));
    if (banned) e.title = `আইনে নিষিদ্ধ পণ্য (“${banned}”) এখানে কেনা বা বেচা যায় না।`;
  }
  if (step === 2) {
    if (!d.unit) e.unit = "একক বেছে নিন";
    if (num(d.price) <= 0) e.price = "দাম লিখুন";
    if (d.negotiable && num(d.floor) > num(d.price)) e.floor = "সর্বনিম্ন দাম চাওয়া দামের বেশি হতে পারে না";
    if (d.modes.length === 0) e.modes = "অন্তত একভাবে বিক্রি করুন";
    if (physical && num(d.stock) <= 0) e.stock = "কতটা আছে লিখুন";
    if (physical && num(d.kg) <= 0) e.kg = "এক এককের আনুমানিক ওজন দিন — ডেলিভারি খরচ এতে হিসাব হয়";
    if (d.tiers.some((t) => num(t.min) <= 0 || num(t.price) <= 0 || num(t.price) >= num(d.price))) e.tiers = "প্রতিটি ধাপে পরিমাণ দিন, আর দাম খুচরা দামের চেয়ে কম রাখুন";
    fieldsFor(d.category).forEach(need);
  }
  if (step === 3) {
    if (!d.district) e.district = "জেলা বেছে নিন";
    if (PRODUCT_FORMS[d.category].delivery.length > 0 && d.delivery.length === 0) e.delivery = "অন্তত একটি ডেলিভারির উপায় দিন";
  }
  return e;
}

function toListing(d: Draft, id: string): Listing {
  const price = num(d.price);
  const physical = PHYSICAL.has(d.category);
  const tiers = d.tiers.map((t) => ({ min: num(t.min), price: num(t.price) })).filter((t) => t.min > 0 && t.price > 0).sort((a, b) => a.min - b.min);
  const specs = specFields(d)
    .filter((f) => d.extra[f.key]?.trim())
    .map((f) => ({ k: f.label, v: f.kind === "date" ? new Date(d.extra[f.key]).toLocaleDateString("bn-BD", { day: "numeric", month: "long" }) : d.extra[f.key].trim() }));
  return {
    id,
    seller: currentUser.handle,
    category: d.category,
    title: d.title.trim(),
    description: d.description.trim(),
    price,
    unit: d.unit,
    negotiable: d.negotiable,
    floor: d.negotiable && num(d.floor) > 0 ? num(d.floor) : price,
    delivery: d.delivery,
    media: d.media[0] ?? { kind: "image", label: d.title.trim() || "ছবি", ratio: "4/3" },
    gallery: d.media.length > 1 ? d.media : undefined,
    rating: 0,
    sold: 0,
    location: d.area.trim() ? `${d.area.trim()}, ${d.district}` : d.district,
    highlights: [d.organic && "বিষমুক্ত", tiers.length > 0 && "পাইকারি দর আছে", d.modes.includes("export") && "রপ্তানিযোগ্য", d.modes.includes("brand") && "আপনার ব্র্যান্ডে প্যাকেট"].filter(Boolean).slice(0, 3) as string[],
    skill: currentUser.skills.find((s) => s.category === d.category)?.skill ?? (d.custom.trim() || getCategory(d.category).bn),
    stage: d.stage,
    modes: d.modes,
    tags: parseTags(d.tags),
    stock: physical ? num(d.stock) : undefined,
    minOrder: num(d.minOrder) || undefined,
    tiers: tiers.length ? tiers : undefined,
    organic: d.organic || undefined,
    perishable: d.perishable || undefined,
    kg: physical ? Number(d.kg.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)))) || undefined : undefined,
    specs,
    customCategory: d.category === "other" ? d.custom.trim() : undefined,
    journey: [{ at: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "short" }), step: "বাজারে তোলা হলো", by: currentUser.nameBn }],
  };
}

/**
 * Direct sale: a full shop listing in four short steps. The questions follow
 * the seller's stage and the kind of goods, and the right column shows the
 * card as buyers will see it, with the board's buyers it already matches.
 */
export function BazaarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const myPosts = useMediaState((s) => s.board);
  const from = boardPosts.find((p) => p.id === params.get("for") && p.side === "buy");
  const [d, setD] = useState<Draft>(() => blank(from));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const top = useRef<HTMLDivElement>(null);

  const physical = PHYSICAL.has(d.category);
  const product = PRODUCT_FORMS[d.category];
  const farmOrFood = d.category === "farm" || d.category === "cooking";
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setExtra = (k: string, v: string) => setD((x) => ({ ...x, extra: { ...x.extra, [k]: v } }));
  const err = (k: string) => errors[k];
  const aria = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  const preview = toListing(d, "draft");
  const buyers = buyersFor(listingOffer(preview), [...boardPosts, ...myPosts]);
  const banned = bannedWord([d.title, d.description, d.tags, d.custom].join(" "));
  const fees = num(d.price) > 0 ? computeFees(num(d.price)) : null;

  function go(to: number) {
    if (to > step) {
      const found = problems(d, step);
      setErrors(found);
      if (Object.keys(found).length) {
        document.getElementById(Object.keys(found)[0])?.focus();
        return;
      }
    }
    setErrors({});
    setStep(to);
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function publish() {
    for (let s = 0; s < 4; s++) {
      const found = problems(d, s);
      if (Object.keys(found).length) {
        setErrors(found);
        setStep(s);
        return;
      }
    }
    const listing = toListing(d, newId("l"));
    if (!updateMedia((s) => ({ ...s, listings: [listing, ...s.listings] }))) return toast.error("এই ব্রাউজারে সেভ করা গেল না");
    toast.success("বাজারে উঠল", { description: buyers.length ? `বোর্ডের ${buyers.length} জন ক্রেতার সাথে এখনই মিলেছে।` : "মিলের মতো চাহিদা এলেই জানানো হবে।" });
    router.push(`/media/market/${listing.id}`);
  }

  return (
    <div ref={top} className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) go(step + 1);
          else publish();
        }}
        className="min-w-0 space-y-6 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-7"
      >
        <Stepper steps={STEPS} at={step} onJump={go} />

        <div key={step} className="live-in space-y-6">
          {step === 0 && (
            <>
                <>
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-semibold text-white">আপনার ব্যবসা এখন কোন পর্যায়ে</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(Object.keys(STAGES) as SellerStage[]).map((k) => {
                        const Icon = STAGE_ICON[k];
                        const on = d.stage === k;
                        return (
                          <label key={k} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-signal-orange", on ? "border-signal-orange bg-signal-orange/10" : "border-white/12 hover:border-white/30")}>
                            <input type="radio" name="stage" className="sr-only" checked={on} onChange={() => setD((x) => ({ ...x, stage: k }))} />
                            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", on ? "bg-signal-orange text-text-primary" : "bg-white/10 text-signal-orange")}><Icon className="size-5" aria-hidden /></span>
                            <span>
                              <span className={cn("block font-bold", on ? "text-signal-orange" : "text-white")}>{STAGES[k].bn}</span>
                              <span className="text-xs leading-relaxed text-white/70">{STAGES[k].hint}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {STAGE_FIELDS[d.stage].map((f) => (
                      <SpecField key={`${d.stage}-${f.key}`} field={f} value={d.extra[f.key] ?? ""} error={err(`spec-${f.key}`)} onChange={(v) => setExtra(f.key, v)} />
                    ))}
                  </div>
                </>
            </>
          )}

          {step === 1 && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-white">বিভাগ</legend>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <label key={c.id} className={choiceClass(d.category === c.id)}>
                      <input type="radio" name="category" className="sr-only" checked={d.category === c.id} onChange={() => setD((x) => ({ ...x, category: c.id, unit: PRODUCT_FORMS[c.id].unit, delivery: PRODUCT_FORMS[c.id].delivery, media: x.media.filter((m) => (PRODUCT_FORMS[c.id].media.kinds as string[]).includes(m.kind)) }))} />
                      {c.bn}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/60">{getCategory(d.category).blurb}</p>
              </fieldset>
              {d.category === "other" && (
                <Row id="custom" label="আপনার বিভাগের নাম *" error={err("custom")} hint="যেমন: শীতলপাটি, মৃৎশিল্প, পোষা পাখির খাঁচা">
                  <Input id="custom" value={d.custom} onChange={(e) => set("custom", e.target.value)} maxLength={40} {...aria("custom")} />
                </Row>
              )}
              <Row id="title" label="শিরোনাম — এক লাইনে *" error={err("title")}>
                <Input id="title" value={d.title} onChange={(e) => set("title", e.target.value)} maxLength={70} placeholder={product.title} {...aria("title")} />
              </Row>
              <Row id="description" label="বিস্তারিত *" error={err("description")} hint={`ক্রেতা জানতে চান: ${product.details}`}>
                <Textarea id="description" rows={4} value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={600} {...aria("description")} />
              </Row>
              <TagInput value={d.tags} ideas={TAG_IDEAS[d.category] ?? []} error={err("tags")} onChange={(v) => set("tags", v)} />
              <MediaPicker spec={product.media} items={d.media} error={err("media")} onChange={(v) => set("media", v)} />
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Row id="price" label="দাম (৳) *" error={err("price")}>
                  <Input id="price" inputMode="numeric" value={d.price} onChange={(e) => set("price", e.target.value)} {...aria("price")} />
                </Row>
                <Row id="unit" label="প্রতি *" error={err("unit")}>
                  <select id="unit" value={d.unit} onChange={(e) => set("unit", e.target.value)} className={selectClass}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </Row>
                {physical && (
                  <Row id="stock" label="মজুত *" error={err("stock")} hint={`কত ${d.unit} আছে`}>
                    <Input id="stock" inputMode="numeric" value={d.stock} onChange={(e) => set("stock", e.target.value)} {...aria("stock")} />
                  </Row>
                )}
              </div>

              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Row id="minOrder" label="ন্যূনতম অর্ডার" hint="খালি = একটি থেকে">
                    <Input id="minOrder" inputMode="numeric" value={d.minOrder} onChange={(e) => set("minOrder", e.target.value)} />
                  </Row>
                  {physical && (
                    <Row id="kg" label={`এক ${d.unit}-এর ওজন (কেজি) *`} error={err("kg")}>
                      <Input id="kg" inputMode="decimal" value={d.kg} onChange={(e) => set("kg", e.target.value)} placeholder="০.৬" {...aria("kg")} />
                    </Row>
                  )}
                  <div className="space-y-1.5">
                    <label htmlFor="negotiable" className="flex min-h-11 items-center justify-between gap-3 text-sm font-semibold text-white">
                      দরদাম চলবে
                      <Switch id="negotiable" checked={d.negotiable} onCheckedChange={(v) => set("negotiable", v)} />
                    </label>
                    {d.negotiable && (
                      <>
                        <Input id="floor" inputMode="numeric" value={d.floor} onChange={(e) => set("floor", e.target.value)} placeholder="সর্বনিম্ন কত নেবেন (গোপন)" aria-label="সর্বনিম্ন দাম" {...aria("floor")} />
                        {err("floor") && <p id="floor-error" className="text-xs font-medium text-crimson-bright">{err("floor")}</p>}
                      </>
                    )}
                  </div>
                </div>

                <fieldset {...aria("modes")}>
                  <legend className="mb-2 text-sm font-semibold text-white">কাদের কাছে বিক্রি করবেন</legend>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(MODES) as TradeMode[]).map((k) => {
                      const on = d.modes.includes(k);
                      return (
                        <label key={k} className={choiceClass(on)} title={MODES[k].hint}>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => set("modes", on ? d.modes.filter((m) => m !== k) : [...d.modes, k])} />
                          {MODES[k].bn}
                        </label>
                      );
                    })}
                  </div>
                  {err("modes") && <p id="modes-error" className="mt-1.5 text-xs font-medium text-crimson-bright">{err("modes")}</p>}
                </fieldset>

                {d.modes.includes("wholesale") && (
                  <div className="space-y-2 rounded-2xl bg-bd-green/25 p-4 ring-1 ring-bdgreen-500/30" {...aria("tiers")}>
                    <p className="text-sm font-semibold text-white">পাইকারি দর — বেশি নিলে কম দাম</p>
                    {d.tiers.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input inputMode="numeric" value={t.min} onChange={(e) => set("tiers", d.tiers.map((x, j) => (j === i ? { ...x, min: e.target.value } : x)))} placeholder={`কমপক্ষে কত ${d.unit}`} aria-label={`ধাপ ${i + 1}: কমপক্ষে পরিমাণ`} />
                        <Input inputMode="numeric" value={t.price} onChange={(e) => set("tiers", d.tiers.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} placeholder={`প্রতি ${d.unit} ৳`} aria-label={`ধাপ ${i + 1}: দাম`} />
                        <button type="button" onClick={() => set("tiers", d.tiers.filter((_, j) => j !== i))} aria-label={`ধাপ ${i + 1} সরান`} className={mediaButton({ variant: "ghost", size: "icon-sm" })}>
                          <X aria-hidden />
                        </button>
                      </div>
                    ))}
                    {d.tiers.length < 3 && (
                      <button type="button" onClick={() => set("tiers", [...d.tiers, { min: "", price: "" }])} className={mediaButton({ variant: "quiet", size: "sm" })}>
                        <Plus aria-hidden /> দরের ধাপ যোগ করুন
                      </button>
                    )}
                    {err("tiers") && <p id="tiers-error" className="text-xs font-medium text-crimson-bright">{err("tiers")}</p>}
                  </div>
                )}
              </>

              {farmOrFood && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label htmlFor="organic" className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/5 px-3 text-sm font-semibold text-white">
                    <span className="inline-flex items-center gap-2"><Leaf className="size-4 text-bdgreen-500" aria-hidden />বিষমুক্ত / অর্গানিক</span>
                    <Switch id="organic" checked={d.organic} onCheckedChange={(v) => set("organic", v)} />
                  </label>
                  <label htmlFor="perishable" className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white/5 px-3 text-sm font-semibold text-white">
                    দ্রুত নষ্ট হয় (কোল্ড বক্স লাগবে)
                    <Switch id="perishable" checked={d.perishable} onCheckedChange={(v) => set("perishable", v)} />
                  </label>
                </div>
              )}

              {fieldsFor(d.category).length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-signal-orange">{d.category === "other" ? d.custom || "আপনার বিভাগ" : getCategory(d.category).bn} — যা ক্রেতা জানতে চান</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {fieldsFor(d.category).map((f) => (
                      <SpecField key={`${d.category}-${f.key}`} field={f} value={d.extra[f.key] ?? ""} error={err(`spec-${f.key}`)} onChange={(v) => setExtra(f.key, v)} />
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

          {step === 3 && (
            <>
              {product.delivery.length > 0 && (
              <fieldset {...aria("delivery")}>
                <legend className="mb-2 text-sm font-semibold text-white">কীভাবে পৌঁছাবে *</legend>
                <div className="flex flex-wrap gap-2">
                  {(physical ? GOODS_DELIVERY : SERVICE_DELIVERY).map((k) => {
                    const on = d.delivery.includes(k);
                    return (
                      <label key={k} className={choiceClass(on)}>
                        <input type="checkbox" className="sr-only" checked={on} onChange={() => set("delivery", on ? d.delivery.filter((x) => x !== k) : [...d.delivery, k])} />
                        {DELIVERY[k]}
                      </label>
                    );
                  })}
                </div>
                {err("delivery") && <p id="delivery-error" className="mt-1.5 text-xs font-medium text-crimson-bright">{err("delivery")}</p>}
              </fieldset>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Row id="district" label="জেলা *" error={err("district")}>
                  <select id="district" value={d.district} onChange={(e) => set("district", e.target.value)} className={selectClass} {...aria("district")}>
                    <option value="">বেছে নিন</option>
                    {districts.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Row>
                <Row id="area" label="এলাকা / উপজেলা">
                  <Input id="area" value={d.area} onChange={(e) => set("area", e.target.value)} maxLength={40} />
                </Row>
              </div>
              {fees && (
                <dl className="space-y-1 rounded-2xl bg-white/5 p-4 text-sm">
                  <div className="flex justify-between"><dt className="text-white/75">প্রতি {d.unit} দাম</dt><dd className="text-white"><Taka amount={fees.price} /></dd></div>
                  <div className="flex justify-between"><dt className="text-white/75">প্ল্যাটফর্ম ফি ৫%</dt><dd className="text-white">− <Taka amount={fees.sellerFee} /></dd></div>
                  <div className="flex justify-between border-t border-white/12 pt-1 font-bold"><dt className="text-white">আপনি পাবেন</dt><dd className="text-signal-orange"><Taka amount={fees.sellerReceives} /></dd></div>
                </dl>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className={mediaButton({ variant: "ghost" })}>
              <ArrowLeft aria-hidden /> আগের ধাপ
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={Boolean(banned)} className={mediaButton({ variant: "primary", size: "lg" })}>
            {step < 3 ? <>পরের ধাপ <ArrowRight aria-hidden /></> : "বাজারে তুলুন"}
          </button>
        </div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start" aria-label="প্রিভিউ ও অটো-মিল">
        <p className="text-xs font-semibold tracking-wide text-white/60">ক্রেতারা যেমন দেখবেন</p>
        <div inert className="pointer-events-none select-none">
          <ListingCard listing={preview} seller={currentUser} />
        </div>
        <div className={cn("flex items-start gap-2 rounded-2xl p-3 text-sm", banned ? "bg-national-crimson text-white" : "bg-bd-green text-white")} role={banned ? "alert" : undefined}>
          {banned ? <ShieldAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden /> : <ShieldCheck className="mt-0.5 size-4.5 shrink-0" aria-hidden />}
          {banned ? <span>“{banned}” আইনে নিষিদ্ধ — এই পোস্ট প্রকাশ করা যাবে না।</span> : <span>বৈধতা যাচাই: কোনো নিষিদ্ধ পণ্যের নাম নেই।</span>}
        </div>
        <div className="rounded-2xl bg-text-primary p-4 ring-1 ring-white/12">
          <p className="text-sm font-bold text-white">
            {buyers.length ? <><span className="text-signal-orange"><Num value={buyers.length} /></span> জন ক্রেতা বোর্ডে এটাই খুঁজছেন</> : "বোর্ডে এখনো মিলের মতো ক্রেতা নেই"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {buyers.slice(0, 3).map((m) => (
              <li key={m.post.id} className="flex justify-between gap-2 text-xs text-white/75">
                <span className="truncate">{m.post.title}</span>
                <span className="font-bold text-bdgreen-500"><Num value={m.score} />%</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-white/55">ট্যাগ, দাম, পরিমাণ আর জেলা মিলিয়ে হিসাব।</p>
        </div>
      </aside>
    </div>
  );
}
