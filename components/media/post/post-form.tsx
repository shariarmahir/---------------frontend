"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderKanban, ImagePlus, Loader2, Tag, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormGroup, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categories, getCategory } from "@/data/media/categories";
import { isTopic, topicOf, topics } from "@/data/media/topics";
import type { CategoryId, Listing, Post } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { computeFees } from "@/lib/media/fees";
import { postSchema, type PostInput } from "@/lib/media/schemas";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { MediaFrame } from "../ui/media-frame";
import { Num, Taka } from "../ui/numerals";
import { Stars } from "../ui/trust";
import { readPhoto, readVideo } from "./read-media";

const ratingWords = ["", "শিখছি", "চলনসই", "ভালো", "খুব ভালো", "বিশেষজ্ঞ"];

const MAX_MEDIA = 4;

/** "Skill — first clause of the caption", cut on a word, not mid-word. */
function listingTitle(skill: string, caption: string): string {
  const clause = caption.split(/[।—\n.!?]/)[0].trim();
  if (clause.length <= 48) return clause ? `${skill} — ${clause}` : skill;
  const cut = clause.slice(0, 48);
  return `${skill} — ${cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 48)}…`;
}

export function PostForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preset = params.get("kind");
  const topicParam = params.get("topic") ?? "";
  const presetTopic = isTopic(topicParam) ? topicParam : "skill";
  const [submitting, setSubmitting] = useState(false);
  const [reading, setReading] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      kind: preset === "project" ? "project" : "skill",
      caption: "",
      skill: "",
      category: currentUser.categories[0],
      selfRating: 3,
      topic: presetTopic,
      media: [],
      sellable: false,
      price: undefined,
      unit: "",
      negotiable: true,
    },
  });
  const media = useFieldArray({ control: form.control, name: "media" });
  const v = useWatch({ control: form.control }) as PostInput;
  const topicInfo = topicOf({ topic: v.topic });
  const rated = topicInfo.rated;
  const cat = getCategory(v.category as CategoryId);
  const suggestions = Array.from(new Set([...currentUser.skills.filter((s) => s.category === v.category).map((s) => s.skill), ...cat.skills])).slice(0, 6);
  const busy = reading > 0;

  async function addFiles(kind: "image" | "video", files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_MEDIA - media.fields.length);
    if (picked.length === 0) return;
    setReading((n) => n + picked.length);
    for (const file of picked) {
      try {
        if (kind === "image") {
          media.append({ kind, label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "ছবি", src: await readPhoto(file) });
        } else {
          const v = await readVideo(file);
          media.append({ kind, label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "ভিডিও", src: v.poster, duration: v.duration });
        }
        form.clearErrors("media");
      } catch {
        toast.error(`${file.name} খোলা গেল না`, { description: kind === "image" ? "JPG, PNG বা WebP ছবি দিন।" : "MP4 বা WebM ভিডিও দিন।" });
      } finally {
        setReading((n) => n - 1);
      }
    }
  }

  function onSubmit(values: PostInput) {
    if (busy) {
      toast.error("ছবি প্রস্তুত হওয়া পর্যন্ত অপেক্ষা করুন");
      return;
    }
    setSubmitting(true);
    const id = newId("p");
    const at = new Date().toISOString();
    const isRatedPost = topicOf({ topic: values.topic }).rated;
    let listing: Listing | undefined;
    if (isRatedPost && values.sellable && values.price && values.media[0]) {
      listing = {
        id: newId("l"),
        seller: currentUser.handle,
        category: values.category,
        title: listingTitle(values.skill, values.caption),
        description: values.caption,
        price: values.price,
        unit: values.unit || "প্রতি কাজ",
        negotiable: Boolean(values.negotiable),
        floor: values.negotiable ? Math.round(values.price * 0.85) : values.price,
        delivery: ["digital"],
        media: { kind: values.media[0].kind, label: values.media[0].label, ratio: "4/3", src: values.media[0].src, duration: values.media[0].duration },
        rating: 0,
        sold: 0,
        location: `${currentUser.area}, ${currentUser.district}`,
        highlights: [],
        skill: values.skill,
      };
    }
    const post: Post = {
      id,
      kind: values.kind,
      topic: values.topic ?? "skill",
      author: currentUser.handle,
      category: values.category,
      createdAt: at,
      caption: values.caption,
      skill: isRatedPost ? { name: values.skill, self: values.selfRating, communityAvg: 0, raters: 0 } : undefined,
      media: values.media.map((m) => ({ kind: m.kind, label: m.label, ratio: m.kind === "video" ? "16/9" : "4/3", src: m.src, duration: m.duration })),
      tags: [],
      stats: { likes: 0, shares: 0, views: 0 },
      comments: [],
      listingId: listing?.id,
    };
    const saved = updateMedia((s) => ({ ...s, posts: [post, ...s.posts], listings: listing ? [...s.listings, listing] : s.listings }));
    if (saved) toast.success("পোস্ট হয়েছে", { description: isRatedPost ? "কমিউনিটি এখন দেখে রেটিং যাচাই করতে পারবে।" : "আপনার পোস্ট ফিডে দেখা যাচ্ছে।" });
    else toast.warning("পোস্ট হয়েছে, তবে এই ব্রাউজারে জায়গা শেষ", { description: "পেজ রিলোড করলে পোস্টটি থাকবে না — কম ছবি দিন বা পুরোনো পোস্ট মুছুন।" });
    router.push(`/media/post/${id}`);
  }

  const fees = v.sellable && v.price ? computeFees(v.price) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6 rounded-2xl border border-white/12 bg-text-primary p-4 sm:p-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormGroupLabel>কী ধরনের পোস্ট?</FormGroupLabel>
                <FormGroup className="flex flex-wrap gap-2">
                  {topics.map((t) => {
                    const on = (field.value ?? "skill") === t.id;
                    return (
                      <label
                        key={t.id}
                        title={t.hint}
                        className={cn(
                          "inline-flex min-h-10 cursor-pointer items-center rounded-full border-2 px-3.5 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-signal-orange/30",
                          on ? "border-signal-orange bg-white/10 text-signal-orange" : "border-white/12 text-white/80 hover:border-white/12",
                        )}
                      >
                        <input type="radio" className="sr-only" name={field.name} checked={on} onChange={() => field.onChange(t.id)} />
                        {t.bn}
                      </label>
                    );
                  })}
                </FormGroup>
                <FormDescription>{topicInfo.hint}{topicInfo.rated ? " — কমিউনিটি আপনার দাবি যাচাই করবে।" : " — রেটিং ছাড়া সাধারণ পোস্ট।"}</FormDescription>
              </FormItem>
            )}
          />

          {rated && (
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormGroupLabel>কী দেখাচ্ছেন?</FormGroupLabel>
                <FormGroup className="grid grid-cols-2 gap-2">
                  {([
                    ["skill", "দক্ষতার প্রমাণ", "হাতের কাজ, রান্না, গান, মেরামত…", Tag],
                    ["project", "প্রজেক্ট ডেমো", "প্রোটোটাইপ, নকশা, কোড…", FolderKanban],
                  ] as const).map(([value, label, hint, Icon]) => (
                    <label
                      key={value}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border-2 p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-signal-orange/30",
                        field.value === value ? "border-signal-orange bg-white/10" : "border-white/12 hover:border-white/12",
                      )}
                    >
                      <input type="radio" className="sr-only" name={field.name} checked={field.value === value} onChange={() => field.onChange(value)} />
                      <Icon className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden />
                      <span>
                        <span className="block text-sm font-bold text-white">{label}</span>
                        <span className="block text-xs text-white/65">{hint}</span>
                      </span>
                    </label>
                  ))}
                </FormGroup>
              </FormItem>
            )}
          />
          )}

          <FormField
            control={form.control}
            name="media"
            render={() => (
              <FormItem>
                <FormGroupLabel>ছবি বা ভিডিও</FormGroupLabel>
                <FormDescription>
                  {rated ? "প্রমাণ ছাড়া যাচাই হয় না।" : "ঐচ্ছিক।"} সর্বোচ্চ ৪টি — ফোন বা কম্পিউটার থেকে বেছে নিন।
                </FormDescription>
                <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void addFiles("image", e.target.files); e.target.value = ""; }} />
                <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => { void addFiles("video", e.target.files); e.target.value = ""; }} />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {media.fields.map((m, i) => (
                    <div key={m.id} className="fade-in relative">
                      <MediaFrame slot={{ kind: m.kind, label: m.label, ratio: "1/1", src: m.src, duration: m.duration }} sizes="160px" />
                      <button
                        type="button"
                        onClick={() => media.remove(i)}
                        className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-black/70 text-white shadow-sm hover:bg-white/10"
                      >
                        <X className="size-4" aria-hidden />
                        <span className="sr-only">{m.label} সরান</span>
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.min(reading, MAX_MEDIA - media.fields.length) }, (_, i) => (
                    <div key={`reading-${i}`} className="skeleton-shimmer flex aspect-square items-center justify-center rounded-xl bg-white/10" role="status">
                      <Loader2 className="size-6 animate-spin text-signal-orange" aria-hidden />
                      <span className="sr-only">ছবি প্রস্তুত হচ্ছে</span>
                    </div>
                  ))}
                  {media.fields.length + reading < MAX_MEDIA && (
                    <>
                      <button
                        type="button"
                        autoFocus={preset === "image"}
                        onClick={() => photoInput.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/12 text-sm font-semibold text-white/80 transition-colors hover:border-signal-orange/50 hover:bg-white/10 hover:text-signal-orange focus-visible:border-signal-orange focus-visible:outline-none"
                      >
                        <ImagePlus className="size-6" aria-hidden /> ছবি যোগ
                      </button>
                      <button
                        type="button"
                        autoFocus={preset === "video"}
                        onClick={() => videoInput.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/12 text-sm font-semibold text-white/80 transition-colors hover:border-signal-orange/50 hover:bg-white/10 hover:text-signal-orange focus-visible:border-signal-orange focus-visible:outline-none"
                      >
                        <Video className="size-6" aria-hidden /> ভিডিও যোগ
                      </button>
                    </>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between">
                  বিবরণ
                  <span className="text-xs font-normal text-white/65 tabular-nums">
                    <Num value={field.value.length} />/<Num value={1200} />
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    maxLength={1200}
                    placeholder={rated ? "কাজটা কী, কীভাবে করলেন, কতদিন লাগল — যা দেখে অন্যরা বিচার করতে পারবে।" : "কী বলতে চান? সমস্যা হলে কোথায়, কবে — নির্দিষ্ট করে লিখুন।"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>বিভাগ</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-11 w-full rounded-lg border border-white/12 bg-text-primary px-3 text-[15px] text-white focus-visible:border-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange/20 focus-visible:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bn}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {rated && (
            <FormField
              control={form.control}
              name="skill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>দক্ষতার ট্যাগ</FormLabel>
                  <FormControl>
                    <Input placeholder="যেমন: নকশিকাঁথা" {...field} />
                  </FormControl>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => form.setValue("skill", s, { shouldValidate: true })}
                        className={cn(
                          "min-h-8 rounded-full border px-2.5 text-xs font-semibold transition-colors",
                          field.value === s ? "border-signal-orange bg-signal-orange text-text-primary shadow-[0_8px_20px_-12px_var(--color-signal-orange)]" : "border-white/12 text-white/80 hover:border-signal-orange/40 hover:text-signal-orange",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}
          </div>

          {rated && (
          <>
          <FormField
            control={form.control}
            name="selfRating"
            render={({ field }) => (
              <FormItem>
                <FormGroupLabel>নিজেকে সৎভাবে রেটিং দিন</FormGroupLabel>
                <div className="rounded-xl border border-bdorange-600/60 bg-bdorange-600 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="text-3xl font-bold tabular-nums text-text-primary">
                        <Num value={field.value} />
                      </span>
                      <Stars value={field.value} size={18} />
                    </span>
                    <span className="rounded-full bg-text-primary px-3 py-1 text-sm font-semibold text-text-primary">{ratingWords[field.value]}</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={([n]) => field.onChange(n)} aria-label="নিজের রেটিং" />
                  <div className="mt-2 flex justify-between text-[11px] font-semibold text-text-primary" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n}>
                        <Num value={n} />
                      </span>
                    ))}
                  </div>
                </div>
                <FormDescription>কমিউনিটি আপনার কাজ দেখে রেটিং দেবে। দাবি অনেক বেশি হলে পোস্টে ‘চ্যালেঞ্জড’ দেখাবে।</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 rounded-xl border border-white/12 p-4">
            <FormField
              control={form.control}
              name="sellable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <FormLabel>এটা বিক্রি করবেন?</FormLabel>
                    <FormDescription>চালু করলে বাজারেও দেখাবে — কিনুন বা দর প্রস্তাব।</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {v.sellable && (
              <div className="fade-in grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>দাম (৳)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const n = Number(e.target.value.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, ""));
                            field.onChange(n || undefined);
                          }}
                          className="tabular-nums"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>একক</FormLabel>
                      <FormControl>
                        <Input placeholder={cat.band.unit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negotiable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-4 sm:col-span-2">
                      <FormLabel>দরদাম চলবে</FormLabel>
                      <FormControl>
                        <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {fees && (
                  <dl className="space-y-1 rounded-lg bg-white/10 p-3 text-sm sm:col-span-2">
                    <div className="flex justify-between"><dt className="text-white/80">বিক্রয়মূল্য</dt><dd><Taka amount={fees.price} /></dd></div>
                    <div className="flex justify-between"><dt className="text-white/80">প্ল্যাটফর্ম ফি ৫%</dt><dd>− <Taka amount={fees.sellerFee} /></dd></div>
                    <div className="flex justify-between border-t border-white/12 pt-1 font-bold"><dt>আপনি পাবেন</dt><dd className="text-signal-orange"><Taka amount={fees.sellerReceives} /></dd></div>
                  </dl>
                )}
              </div>
            )}
          </div>

          </>
          )}

          <button type="submit" disabled={submitting} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            পোস্ট করুন
          </button>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-22 space-y-3">
            <p className="text-xs font-bold tracking-wide text-white/65">প্রিভিউ</p>
            <div className="rounded-2xl border border-white/12 bg-text-primary p-4">
              <p className="text-sm font-bold text-white">{currentUser.nameBn}</p>
              <p className="mt-2 line-clamp-4 text-sm text-white/80">{v.caption || "আপনার বিবরণ এখানে দেখাবে।"}</p>
              <div className="mt-3">
                {v.media[0] ? (
                  <MediaFrame slot={{ kind: v.media[0].kind, label: v.media[0].label, ratio: "16/9", src: v.media[0].src, duration: v.media[0].duration }} sizes="300px" />
                ) : (
                  <div className="aspect-video rounded-xl bg-white/10" />
                )}
              </div>
              {!rated ? (
                <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{topicInfo.bn}</p>
              ) : (
              <>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-bd-green px-3 py-1 text-xs font-bold text-white">
                <Tag className="size-3.5" aria-hidden /> {v.skill || "দক্ষতা"}
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="flex-1 rounded-lg bg-bdorange-600 p-2">
                  <span className="block font-semibold text-text-primary">নিজের দাবি</span>
                  <span className="text-lg font-bold"><Num value={v.selfRating} decimals={1} /></span>
                </span>
                <span className="flex-1 rounded-lg bg-signal-orange p-2">
                  <span className="block font-semibold text-text-primary">কমিউনিটি</span>
                  <span className="text-sm font-semibold text-text-primary">যাচাই বাকি</span>
                </span>
              </div>
              {v.sellable && v.price ? (
                <p className="mt-3 rounded-lg border border-bdorange-600/60 bg-bdorange-600 px-3 py-2 text-sm font-bold">
                  <Taka amount={v.price} />
                </p>
              ) : null}
              </>
              )}
            </div>
          </div>
        </aside>
      </form>
    </Form>
  );
}
