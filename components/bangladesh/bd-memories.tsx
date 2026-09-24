"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { P, divisions } from "@/data/bangladesh";
import { StoryHeading } from "./story-heading";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_STORY = 1000;

interface Memory {
  id: string;
  name: string;
  place: string;
  title: string;
  story: string;
  image: string;
  sample?: boolean;
}

/** Clearly-labelled examples so the wall is never empty. */
const SAMPLES: Memory[] = [
  { id: "s1", sample: true, name: "রাফি", place: "খুলনা", title: "সুন্দরবনের ভোর", story: "নৌকার গলুইয়ে বসে প্রথম দেখেছিলাম কুয়াশা সরে গিয়ে ম্যানগ্রোভের সারি জেগে উঠছে।", image: P.mangroveBoat.src },
  { id: "s2", sample: true, name: "নুসরাত", place: "রংপুর", title: "স্কুলের পথে সরিষা ক্ষেত", story: "শীতের সকালে হলুদ মাঠের ভেতর দিয়ে বান্ধবীদের সাথে স্কুলে যাওয়া — এখনো চোখ বন্ধ করলে দেখি।", image: P.mustardGirls.src },
  { id: "s3", sample: true, name: "করিম চাচা", place: "ময়মনসিংহ", title: "নবান্নের সন্ধ্যা", story: "ধান কেটে ঘরে ফেরার পথে আকাশটা আগুনের মতো লাল হয়ে ছিল।", image: P.harvestDusk.src },
];

/**
 * "আপনার বাংলাদেশ" — readers share a photo and a memory.
 *
 * There is no upload service behind this yet, so nothing leaves the
 * browser: a shared memory appears on this wall for this visit only, and
 * the form says exactly that rather than implying it was published. When
 * the API exists, `onSubmit` posts the same fields and the notice goes.
 */
export function BdMemories() {
  const ids = { name: useId(), place: useId(), title: useId(), story: useId(), file: useId(), consent: useId() };
  const [memories, setMemories] = useState<Memory[]>(SAMPLES);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState("");
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const urls = useRef<string[]>([]);

  // Object URLs hold the image in memory; release them on unmount.
  useEffect(() => {
    const list = urls.current;
    return () => list.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return setPreview(null);
    if (!f.type.startsWith("image/")) {
      e.target.value = "";
      return setError("শুধু ছবি (JPG, PNG, WEBP) দেওয়া যাবে।");
    }
    if (f.size > MAX_BYTES) {
      e.target.value = "";
      return setError("ছবির আকার ৫ MB-এর কম হতে হবে।");
    }
    const url = URL.createObjectURL(f);
    urls.current.push(url);
    setPreview(url);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!preview) return setError("একটি ছবি বেছে নিন।");
    setMemories((m) => [
      {
        id: crypto.randomUUID(),
        name: String(data.get("name") || "নাম প্রকাশে অনিচ্ছুক"),
        place: String(data.get("place") || ""),
        title: String(data.get("title") || ""),
        story: String(data.get("story") || ""),
        image: preview,
      },
      ...m,
    ]);
    formRef.current?.reset();
    setPreview(null);
    setStory("");
    setError(null);
    setDone(true);
  };

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bengali text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-bd-green focus:ring-3 focus:ring-bd-green/20 focus:outline-none";

  return (
    <section id="memories" className="section-band scroll-mt-40">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৮"
          kicker="আপনার বাংলাদেশ"
          title="আপনার স্মৃতির বাংলাদেশ শেয়ার করুন"
          accent="স্মৃতির"
          lede="গ্রামের বাড়ি, নদীর ঘাট, প্রথম দেখা সমুদ্র, একুশের প্রভাতফেরি — একটি ছবি আর কয়েকটি লাইনে লিখুন আপনার বাংলাদেশ।"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Form ─────────────────────────────────────── */}
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="story-reveal space-y-4 rounded-3xl border border-emerald-100 bg-linear-to-b from-mint-subtle to-white p-6 shadow-elevated sm:p-8 lg:col-span-5"
          >
            {/* Image picker with live preview. */}
            <label
              htmlFor={ids.file}
              className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-white text-center transition-colors hover:border-bd-green hover:bg-mint-subtle focus-within:ring-3 focus-within:ring-bd-green/30"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local object URL; next/image cannot optimise it
                <img src={preview} alt="আপনার বেছে নেওয়া ছবির প্রিভিউ" className="absolute inset-0 size-full object-cover" />
              ) : (
                <>
                  <Icon name="add_photo_alternate" className="text-[44px]! text-bd-green transition-transform group-hover:scale-110" />
                  <span className="mt-2 font-bengali text-sm font-bold text-text-primary">ছবি বেছে নিন</span>
                  <span className="font-bengali text-xs text-slate-500">JPG, PNG বা WEBP · সর্বোচ্চ ৫ MB</span>
                </>
              )}
              <input id={ids.file} name="image" type="file" accept="image/*" onChange={onFile} className="sr-only" />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={ids.name} className="mb-1 block font-bengali text-sm font-semibold text-slate-700">আপনার নাম <span className="font-normal text-slate-400">(ঐচ্ছিক)</span></label>
                <input id={ids.name} name="name" autoComplete="name" maxLength={60} className={field} placeholder="যেমন: রাফি" />
              </div>
              <div>
                <label htmlFor={ids.place} className="mb-1 block font-bengali text-sm font-semibold text-slate-700">বিভাগ</label>
                <select id={ids.place} name="place" required defaultValue="" className={field}>
                  <option value="" disabled>বেছে নিন</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.nameBn}>{d.nameBn}</option>
                  ))}
                  <option value="প্রবাস">প্রবাস থেকে</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={ids.title} className="mb-1 block font-bengali text-sm font-semibold text-slate-700">শিরোনাম</label>
              <input id={ids.title} name="title" required maxLength={80} className={field} placeholder="যেমন: নানুবাড়ির পুকুরঘাট" />
            </div>

            <div>
              <label htmlFor={ids.story} className="mb-1 flex justify-between font-bengali text-sm font-semibold text-slate-700">
                আপনার গল্প
                <span className="font-normal text-slate-400 tabular-nums">{story.length.toLocaleString("bn-BD")}/{MAX_STORY.toLocaleString("bn-BD")}</span>
              </label>
              <textarea
                id={ids.story}
                name="story"
                required
                rows={4}
                maxLength={MAX_STORY}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className={field}
                placeholder="সেই দিনের কথা লিখুন…"
              />
            </div>

            <label htmlFor={ids.consent} className="flex items-start gap-2 font-bengali text-xs leading-relaxed text-slate-600">
              <input id={ids.consent} type="checkbox" required className="mt-0.5 size-4 accent-bd-green" />
              ছবিটি আমার তোলা বা ব্যবহারের অনুমতি আছে; ছবিতে কেউ থাকলে তাঁর সম্মতি নিয়েছি।
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 font-bengali text-sm font-semibold text-national-crimson">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-bengali text-base font-bold text-white shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none motion-reduce:hover:translate-y-0"
            >
              <Icon name="favorite" filled className="text-[20px]!" />
              স্মৃতি শেয়ার করুন
            </button>

            {/* Honest about where the memory goes. */}
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 font-bengali text-xs leading-relaxed text-amber-900">
              <Icon name="info" className="mt-0.5 shrink-0 text-[16px]!" />
              অনলাইনে জমা দেওয়ার ব্যবস্থা এখনো চালু হয়নি। আপনার স্মৃতি আপাতত শুধু এই ডিভাইসে, এই পেজেই দেখা যাবে — কোথাও আপলোড হবে না।
            </p>
            <p aria-live="polite" className="sr-only">
              {done ? "আপনার স্মৃতি দেয়ালে যোগ হয়েছে।" : ""}
            </p>
          </form>

          {/* ── Memory wall ──────────────────────────────── */}
          <ul className="grid grid-cols-1 content-start gap-5 sm:grid-cols-2 lg:col-span-7">
            {memories.map((m) => (
              <li
                key={m.id}
                className="glass-card story-reveal group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {m.sample ? (
                    <Image src={m.image} alt={m.title} fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- a local object URL
                    <img src={m.image} alt={m.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                  )}
                  {m.sample ? (
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 font-bengali text-[11px] font-bold text-slate-600">নমুনা</span>
                  ) : (
                    <span className="absolute top-3 left-3 rounded-full bg-bd-green px-2.5 py-0.5 font-bengali text-[11px] font-bold text-white">আপনার স্মৃতি</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bengali text-lg font-bold text-text-primary">{m.title}</h3>
                  <p className="mt-1 line-clamp-4 font-bengali text-sm leading-relaxed text-text-secondary">{m.story}</p>
                  <p className="mt-3 flex items-center gap-1.5 font-bengali text-xs font-semibold text-slate-500">
                    <Icon name="person" className="text-[14px]!" /> {m.name}
                    {m.place && (
                      <>
                        <span aria-hidden>·</span>
                        <Icon name="location_on" className="text-[14px]!" /> {m.place}
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
