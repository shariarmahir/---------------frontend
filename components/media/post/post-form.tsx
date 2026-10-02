"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Ban, Earth, FolderKanban, ImagePlus, Loader2, Lock, MapPin, SmilePlus, Store, Tag, Type, UsersRound, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormGroup, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { categories, getCategory } from "@/data/media/categories";
import { bgOf, feelingOf, feelings, postBgs } from "@/data/media/feelings";
import { isTopic, topicOf, topics } from "@/data/media/topics";
import type { Audience, CategoryId, Listing, Post, PostTopic } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { computeFees } from "@/lib/media/fees";
import { BG_MAX, postSchema, type PostInput } from "@/lib/media/schemas";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { TOPIC_ICON } from "../feed/topic-style";
import { mediaButton } from "../ui/button-styles";
import { MediaFrame } from "../ui/media-frame";
import { Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { Stars } from "../ui/trust";
import { readPhoto, readVideo } from "./read-media";

/*
 * THESIS: one composer for everything a person might share — a day out, a
 * song, a finished piece of work — the way other social apps work. Life is
 * the default; a self-rating appears only when the author picks a topic
 * the community verifies, and selling stays one switch away on those.
 */

const ratingWords = ["", "শিখছি", "চলনসই", "ভালো", "খুব ভালো", "বিশেষজ্ঞ"];
const MAX_MEDIA = 4;

const AUDIENCE: Record<Audience, { bn: string; Icon: typeof Earth }> = {
  public: { bn: "সবাই", Icon: Earth },
  followers: { bn: "অনুসারীরা", Icon: UsersRound },
  private: { bn: "শুধু আমি", Icon: Lock },
};

/** What the composer opens on: a topic, a panel, or the photo picker. */
export interface ComposerPreset {
  topic?: PostTopic;
  open?: "feeling" | "place" | "photo" | "video";
}

/** "Skill — first clause of the caption", cut on a word, not mid-word. */
function listingTitle(skill: string, caption: string): string {
  const clause = caption.split(/[।—\n.!?]/)[0].trim();
  if (clause.length <= 48) return clause ? `${skill} — ${clause}` : skill;
  const cut = clause.slice(0, 48);
  return `${skill} — ${cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 48)}…`;
}

const firstName = (name: string) => name.split(" ")[0];

export function Composer({ preset, onDone, variant = "dialog" }: { preset?: ComposerPreset; onDone?: (id: string) => void; variant?: "dialog" | "page" }) {
  const [submitting, setSubmitting] = useState(false);
  const [reading, setReading] = useState(0);
  const [panel, setPanel] = useState<"feeling" | "place" | null>(preset?.open === "feeling" || preset?.open === "place" ? preset.open : null);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      kind: "skill",
      caption: "",
      skill: "",
      category: currentUser.categories[0],
      selfRating: 3,
      topic: preset?.topic ?? "daily",
      media: [],
      sellable: false,
      price: undefined,
      unit: "",
      negotiable: true,
      audience: "public",
      place: "",
    },
  });
  const media = useFieldArray({ control: form.control, name: "media" });
  const v = useWatch({ control: form.control }) as PostInput;
  const topicInfo = topicOf({ topic: v.topic });
  const rated = topicInfo.rated;
  const cat = getCategory(v.category as CategoryId);
  const suggestions = Array.from(new Set([...currentUser.skills.filter((s) => s.category === v.category).map((s) => s.skill), ...cat.skills])).slice(0, 6);
  const busy = reading > 0;
  const hasMedia = v.media.length > 0;
  const bg = !hasMedia ? bgOf(v.bg) : undefined;
  const feeling = feelingOf(v.feeling);

  // Opened from "ছবি" or "ভিডিও": go straight to the file picker.
  useEffect(() => {
    if (preset?.open === "photo") photoInput.current?.click();
    if (preset?.open === "video") videoInput.current?.click();
  }, [preset?.open]);

  async function addFiles(kind: "image" | "video", files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_MEDIA - media.fields.length);
    if (picked.length === 0) return;
    setReading((n) => n + picked.length);
    for (const file of picked) {
      try {
        if (kind === "image") {
          media.append({ kind, label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "ছবি", src: await readPhoto(file) });
        } else {
          const r = await readVideo(file);
          media.append({ kind, label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "ভিডিও", src: r.poster, duration: r.duration });
        }
        form.clearErrors(["media", "caption"]);
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
      topic: values.topic ?? "daily",
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
      feeling: values.feeling,
      bg: values.media.length === 0 ? values.bg : undefined,
      audience: values.audience === "public" ? undefined : values.audience,
      place: values.place || undefined,
    };
    const saved = updateMedia((s) => ({ ...s, posts: [post, ...s.posts], listings: listing ? [...s.listings, listing] : s.listings }));
    if (saved) toast.success("পোস্ট হয়েছে", { description: isRatedPost ? "কমিউনিটি এখন দেখে রেটিং যাচাই করতে পারবে।" : values.audience === "private" ? "শুধু আপনি দেখতে পাবেন।" : "আপনার পোস্ট ফিডের শুরুতে দেখা যাচ্ছে।" });
    else toast.warning("পোস্ট হয়েছে, তবে এই ব্রাউজারে জায়গা শেষ", { description: "পেজ রিলোড করলে পোস্টটি থাকবে না — কম ছবি দিন বা পুরোনো পোস্ট মুছুন।" });
    setSubmitting(false);
    onDone?.(id);
  }

  const fees = v.sellable && v.price ? computeFees(v.price) : null;
  const Aud = AUDIENCE[(v.audience ?? "public") as Audience];
  const chip = "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-signal-orange/30";
  const tool = "grid size-10 place-items-center rounded-full transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:opacity-40";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className={cn("flex min-h-0 flex-1 flex-col", variant === "page" && "rounded-3xl border border-white/12 bg-text-primary")}>
        <div className={cn("space-y-5", variant === "page" ? "p-4 sm:p-6" : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5")}>
          {/* Who is posting, how they feel, where, and for whom. */}
          <div className="flex items-start gap-3">
            <PersonAvatar person={currentUser} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-snug text-white">
                <span className="font-bold">{currentUser.nameBn}</span>
                {feeling && (
                  <span className="text-white/75">
                    {" "}— {feeling.emoji} {feeling.line}
                  </span>
                )}
                {v.place && (
                  <span className="text-white/75">
                    {" "}· <MapPin className="inline size-3.5 align-[-2px] text-signal-orange" aria-hidden /> {v.place}
                  </span>
                )}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <label className="relative inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-white/10 pr-2 pl-2.5 text-xs font-semibold text-white has-focus-visible:ring-2 has-focus-visible:ring-signal-orange">
                      <Aud.Icon className="size-3.5" aria-hidden />
                      <span className="sr-only">কে দেখবে</span>
                      <select value={field.value} onChange={(e) => field.onChange(e.target.value)} className="appearance-none bg-transparent pr-3 outline-none [&>option]:bg-text-primary">
                        {(Object.keys(AUDIENCE) as Audience[]).map((a) => (
                          <option key={a} value={a}>
                            {AUDIENCE[a].bn}
                          </option>
                        ))}
                      </select>
                      <span aria-hidden className="pointer-events-none absolute right-2 text-[9px]">▼</span>
                    </label>
                  )}
                />
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-bd-green px-2.5 text-xs font-bold text-white">
                  {(() => {
                    const I = TOPIC_ICON[(v.topic ?? "daily") as PostTopic];
                    return <I className="size-3.5" aria-hidden />;
                  })()}
                  {topicInfo.bn}
                </span>
              </div>
            </div>
          </div>

          {/* The words — large on a colour when the post is short text. */}
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">কী বলতে চান</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    // Its own slot: the shell's dark field style would cover the colour backgrounds.
                    data-slot="composer-text"
                    rows={bg ? 4 : 3}
                    maxLength={1200}
                    autoFocus={!preset?.open}
                    placeholder={rated ? "কাজটা কী, কীভাবে করলেন, কতদিন লাগল — যা দেখে অন্যরা বিচার করতে পারবে।" : `কী ভাবছেন, ${firstName(currentUser.nameBn)}?`}
                    className={cn(
                      "w-full resize-none rounded-2xl border-0 bg-transparent text-white outline-none placeholder:text-white/45",
                      bg ? cn("min-h-56 px-6 pt-16 pb-12 text-center text-2xl leading-snug font-bold placeholder:text-current/60 sm:text-[1.7rem]", bg.className) : "px-1 text-lg leading-relaxed sm:text-xl",
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Colour backgrounds for short text, and the character count. */}
          <div className="flex items-center justify-between gap-3">
            {!hasMedia ? (
              <FormField
                control={form.control}
                name="bg"
                render={({ field }) => (
                  <fieldset className="flex items-center gap-1.5">
                    <legend className="sr-only">রঙিন পটভূমি</legend>
                    <button
                      type="button"
                      onClick={() => field.onChange(undefined)}
                      aria-pressed={!field.value}
                      aria-label="পটভূমি ছাড়া"
                      className={cn("grid size-8 place-items-center rounded-lg border text-white transition-transform hover:scale-110", !field.value ? "border-signal-orange bg-white/10" : "border-white/20")}
                    >
                      <Type className="size-4" aria-hidden />
                    </button>
                    {postBgs.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => field.onChange(b.id)}
                        aria-pressed={field.value === b.id}
                        aria-label={`${b.bn} পটভূমি`}
                        title={v.caption.length > BG_MAX ? `${BG_MAX} অক্ষরের বেশি লেখায় পটভূমি বসে না` : b.bn}
                        className={cn("size-8 rounded-lg transition-transform hover:scale-110", b.className, field.value === b.id && "ring-2 ring-white ring-offset-2 ring-offset-text-primary")}
                      />
                    ))}
                  </fieldset>
                )}
              />
            ) : (
              <span />
            )}
            <span className={cn("text-xs tabular-nums", v.caption.length > (bg ? BG_MAX : 1100) ? "text-crimson-bright" : "text-white/50")}>
              <Num value={v.caption.length} />/<Num value={bg ? BG_MAX : 1200} />
            </span>
          </div>

          {/* Photos and videos. */}
          <FormField
            control={form.control}
            name="media"
            render={() => (
              <FormItem>
                <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void addFiles("image", e.target.files); e.target.value = ""; }} />
                <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => { void addFiles("video", e.target.files); e.target.value = ""; }} />
                {(media.fields.length > 0 || reading > 0) && (
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/12 p-2 sm:grid-cols-4">
                    {media.fields.map((m, i) => (
                      <div key={m.id} className="fade-in relative">
                        <MediaFrame slot={{ kind: m.kind, label: m.label, ratio: "1/1", src: m.src, duration: m.duration }} sizes="160px" />
                        <button type="button" onClick={() => media.remove(i)} className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black">
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
                      <button
                        type="button"
                        onClick={() => photoInput.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/15 text-sm font-semibold text-white/75 transition-colors hover:border-signal-orange/50 hover:text-signal-orange"
                      >
                        <ImagePlus className="size-6" aria-hidden /> আরও যোগ
                      </button>
                    )}
                  </div>
                )}
                {rated && media.fields.length === 0 && <FormDescription>এই ধরনের পোস্টে প্রমাণ লাগে — অন্তত একটি ছবি বা ভিডিও দিন। সর্বোচ্চ ৪টি।</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feeling or activity. */}
          {panel === "feeling" && (
            <FormField
              control={form.control}
              name="feeling"
              render={({ field }) => (
                <FormItem className="fade-in rounded-2xl border border-white/12 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <FormGroupLabel>কেমন লাগছে?</FormGroupLabel>
                    {field.value && (
                      <button type="button" onClick={() => field.onChange(undefined)} className="inline-flex items-center gap-1 text-xs font-semibold text-white/65 hover:text-white">
                        <Ban className="size-3.5" aria-hidden /> সরান
                      </button>
                    )}
                  </div>
                  <FormGroup className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                    {feelings.map((f) => (
                      <label key={f.id} className={cn(chip, "justify-center rounded-xl", field.value === f.id ? "border-signal-orange bg-signal-orange text-text-primary" : "border-white/12 text-white/85 hover:border-white/30")}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === f.id} onChange={() => { field.onChange(f.id); setPanel(null); }} />
                        <span aria-hidden>{f.emoji}</span> {f.bn}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )}
            />
          )}

          {panel === "place" && (
            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem className="fade-in">
                  <FormLabel>কোথায়?</FormLabel>
                  <FormControl>
                    <Input placeholder={`যেমন: ${currentUser.area}, ${currentUser.district}`} maxLength={60} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* What it is about. */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormGroupLabel>কী নিয়ে পোস্ট?</FormGroupLabel>
                <FormGroup className="flex flex-wrap gap-1.5">
                  {topics.map((t) => {
                    const on = (field.value ?? "daily") === t.id;
                    const I = TOPIC_ICON[t.id];
                    return (
                      <label key={t.id} title={t.hint} className={cn(chip, "cursor-pointer", on ? "border-signal-orange bg-signal-orange text-text-primary" : "border-white/12 text-white/80 hover:border-white/30")}>
                        <input type="radio" className="sr-only" name={field.name} checked={on} onChange={() => field.onChange(t.id)} />
                        <I className="size-4" aria-hidden />
                        {t.bn}
                        {t.rated && <span className={cn("rounded-full px-1.5 text-[10px] font-bold", on ? "bg-text-primary text-signal-orange" : "bg-bd-green text-white")}>যাচাই</span>}
                      </label>
                    );
                  })}
                </FormGroup>
                <FormDescription>
                  {topicInfo.hint}
                  {topicInfo.rated ? " — কমিউনিটি যাচাই করবে।" : " — রেটিং ছাড়া সাধারণ পোস্ট।"}
                </FormDescription>
              </FormItem>
            )}
          />

          {v.topic === "research" && (
            <Link href="/research/submit" className="flex items-center justify-between gap-3 rounded-2xl bg-signal-orange px-4 py-3 text-sm font-bold text-text-primary transition-transform hover:-translate-y-0.5">
              পুরো গবেষণাপত্র? গবেষণাকোষে প্রকাশ করুন, তারপর ফিডে শেয়ার
              <ArrowUpRight className="size-4.5 shrink-0" aria-hidden />
            </Link>
          )}

          {/* The claim the community will check, only on rated topics. */}
          {rated && (
            <div className="fade-in space-y-5 rounded-2xl border border-signal-orange/40 p-4">
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
                        <label key={value} className={cn("flex cursor-pointer gap-3 rounded-xl border-2 p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-signal-orange/30", field.value === value ? "border-signal-orange bg-white/10" : "border-white/12")}>
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

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বিভাগ</FormLabel>
                      <FormControl>
                        <select {...field} className="h-11 w-full rounded-lg border border-white/12 bg-text-primary px-3 text-[15px] text-white focus-visible:border-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange/20 focus-visible:outline-none">
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
                            className={cn("min-h-8 rounded-full border px-2.5 text-xs font-semibold transition-colors", field.value === s ? "border-signal-orange bg-signal-orange text-text-primary" : "border-white/12 text-white/80 hover:border-signal-orange/40 hover:text-signal-orange")}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="selfRating"
                render={({ field }) => (
                  <FormItem>
                    <FormGroupLabel>নিজেকে সৎভাবে রেটিং দিন</FormGroupLabel>
                    <div className="rounded-xl bg-bdorange-600 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-text-primary tabular-nums">
                            <Num value={field.value} />
                          </span>
                          <Stars value={field.value} size={18} />
                        </span>
                        <span className="rounded-full bg-text-primary px-3 py-1 text-sm font-semibold text-white">{ratingWords[field.value]}</span>
                      </div>
                      <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={([n]) => field.onChange(n)} aria-label="নিজের রেটিং" />
                    </div>
                    <FormDescription>কমিউনিটি আপনার কাজ দেখে রেটিং দেবে। দাবি অনেক বেশি হলে পোস্টে ‘চ্যালেঞ্জড’ দেখাবে।</FormDescription>
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
            </div>
          )}
        </div>

        {/* Add to the post, then post. */}
        <div className={cn("space-y-3 border-t border-white/12 p-4", variant === "dialog" && "sm:px-5")}>
          <div className="flex items-center gap-1 rounded-2xl border border-white/12 py-1 pr-1 pl-3">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">পোস্টে যোগ করুন</span>
            <span className="flex shrink-0 gap-0.5">
              <button type="button" title="ছবি" onClick={() => photoInput.current?.click()} disabled={media.fields.length >= MAX_MEDIA} className={tool}>
                <ImagePlus className="size-5 text-bdgreen-500" aria-hidden /> <span className="sr-only">ছবি</span>
              </button>
              <button type="button" title="ভিডিও" onClick={() => videoInput.current?.click()} disabled={media.fields.length >= MAX_MEDIA} className={tool}>
                <Video className="size-5 text-bdorange-600" aria-hidden /> <span className="sr-only">ভিডিও</span>
              </button>
              <button type="button" title="অনুভূতি" onClick={() => setPanel((p) => (p === "feeling" ? null : "feeling"))} aria-expanded={panel === "feeling"} className={cn(tool, panel === "feeling" && "bg-white/10")}>
                <SmilePlus className="size-5 text-signal-orange" aria-hidden /> <span className="sr-only">অনুভূতি</span>
              </button>
              <button type="button" title="জায়গা" onClick={() => setPanel((p) => (p === "place" ? null : "place"))} aria-expanded={panel === "place"} className={cn(tool, panel === "place" && "bg-white/10")}>
                <MapPin className="size-5 text-white" aria-hidden /> <span className="sr-only">জায়গা</span>
              </button>
              <Link href="/media/market/new" title="বাজারে বিক্রি করুন" className={tool}>
                <Store className="size-5 text-white" aria-hidden /> <span className="sr-only">বিক্রি</span>
              </Link>
            </span>
          </div>
          <button type="submit" disabled={submitting || busy} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            {submitting || busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
            পোস্ট করুন
          </button>
        </div>
      </form>
    </Form>
  );
}

/** The full-page composer (/media/post/new, the phone's centre tab); `?topic=` picks the topic. */
export function PostForm() {
  const router = useRouter();
  const params = useSearchParams();
  const t = params.get("topic") ?? "";
  const kind = params.get("kind");
  const preset: ComposerPreset = {
    topic: isTopic(t) ? t : undefined,
    open: kind === "image" ? "photo" : kind === "video" ? "video" : undefined,
  };
  return <Composer variant="page" preset={preset} onDone={(id) => router.push(`/media#${id}`)} />;
}
