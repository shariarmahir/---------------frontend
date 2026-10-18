"use client";

/*
 * The parts of গবেষণাকোষের প্রধান পাতা that read the live library (the
 * shipped papers plus the viewer's own): the hero carousel, the "new and
 * popular" tabs, the track and field grids, and the questions people ask.
 * Laid out after coursera.org's home page, in the home page's world.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { sourcePoints } from "@/data/amar-bangladesh";
import { FIELDS, newest, trending, type FieldId } from "@/lib/research/core";
import { useLibrary, useScores } from "@/lib/research/store";
import { inTopic, problemCode, problemCoverage, TRACKS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { CardRow, FieldTile, TrackTile } from "./cards";
import { bn } from "./ui";

const TURN_MS = 7000;

/* ── Hero ───────────────────────────────────────────────────────────── */

/** Three slides, turning on their own (held by a pointer or focus, never under reduced motion). */
export function HeroCarousel() {
  const list = useLibrary();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const id = useId();
  const coverage = useMemo(() => problemCoverage(list, sourcePoints.map((p) => p.n)), [list]);
  const covered = coverage.filter((p) => p.articles.length > 0).length;
  const pics = list.filter((a) => a.status === "published" && a.image).slice(0, 3);

  const slides: { key: string; title: ReactNode; lead: string; actions: ReactNode; art: ReactNode }[] = [
    {
      key: "welcome",
      title: (
        <>
          দেশের প্রশ্ন, <span className="text-signal-orange">দেশের গবেষণা।</span>
        </>
      ),
      lead: "থিসিস, গবেষণাপত্র আর উদ্ভাবন — বিনামূল্যে পড়ুন, প্রতিক্রিয়া দিন, আলোচনা করুন, ডাউনলোড করুন। নিজের কাজ আপলোড করে দেশের সামনে আনুন।",
      actions: (
        <>
          <Link href="/research/submit" className={btn.gold}>
            <Icon name="upload_file" className="text-xl" /> গবেষণা আপলোড করুন
          </Link>
          <Link href="/research/contents" className={btn.goldOutline}>
            সব গবেষণা দেখুন
          </Link>
        </>
      ),
      art: (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
          {pics.map((a, n) => (
            <span key={a.slug} className={cn("relative overflow-hidden rounded-2xl bg-cobalt ring-1 ring-white/12", n === 0 && "row-span-2")}>
              <Image src={a.image!.src} alt="" fill priority={n === 0} sizes="(min-width: 1024px) 280px, 45vw" className="object-cover" />
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "live",
      title: (
        <>
          রিয়েল-টাইম: <span className="text-signal-orange">দেশের ৩২টি সমস্যা</span>
        </>
      ),
      lead: `জাতীয় সমস্যার তালিকার ${bn(sourcePoints.length)}টির মধ্যে ${bn(covered)}টি নিয়ে এখানে গবেষণা আছে। বাকিগুলো আপনার অপেক্ষায় — কোনটি নিয়ে কাজ হচ্ছে, দেখুন।`,
      actions: (
        <Link href="/research/topic/bd-live" className={btn.gold}>
          <Icon name="crisis_alert" className="text-xl" /> সমস্যার মানচিত্র দেখুন
        </Link>
      ),
      art: (
        <div className="flex h-full flex-col justify-center rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12">
          <ul aria-hidden className="grid grid-cols-8 gap-1.5">
            {coverage.map((p) => (
              <li key={p.n} title={problemCode(p.n)} className={cn("aspect-square rounded-md", p.articles.length ? "bg-signal-orange" : "bg-white/12")} />
            ))}
          </ul>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-signal-orange" /> গবেষণা আছে · {bn(covered)}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-white/12" /> অপেক্ষায় · {bn(sourcePoints.length - covered)}
            </span>
          </p>
        </div>
      ),
    },
    {
      key: "publish",
      title: (
        <>
          আপনার থিসিস <span className="text-signal-orange">দেশের সামনে আনুন</span>
        </>
      ),
      lead: "স্কুল প্রজেক্ট থেকে পিএইচডি থিসিস — প্রকাশ বিনামূল্যে। পর্যালোচনার পর সবাই পড়বেন, শেয়ার করবেন, আর আপনার পয়েন্ট বাড়বে।",
      actions: (
        <Link href="/research/submit" className={btn.gold}>
          <Icon name="upload_file" className="text-xl" /> প্রকাশ শুরু করুন
        </Link>
      ),
      art: (
        <ol className="flex h-full flex-col justify-center gap-3">
          {[
            { icon: "edit_document", t: "লিখুন বা পিডিএফ দিন" },
            { icon: "rate_review", t: "পর্যালোচনা" },
            { icon: "campaign", t: "ফিড আর সোশ্যালে ছড়িয়ে দিন" },
          ].map((s, n) => (
            <li key={s.t} className={cn("flex items-center gap-4 rounded-2xl p-4 ring-1 ring-white/12", ["bg-bdnavy-900", "bg-cobalt", "bg-text-primary"][n])}>
              <span className="grid size-11 place-items-center rounded-full bg-signal-orange text-text-primary">
                <Icon name={s.icon} className="text-2xl" />
              </span>
              <span className="font-bold text-white">
                {bn(n + 1)}. {s.t}
              </span>
            </li>
          ))}
        </ol>
      ),
    },
  ];

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % slides.length), TURN_MS);
    return () => window.clearTimeout(t);
  }, [i, held, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="গবেষণাকোষ"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      className="relative"
    >
      <div className="grid">
        {slides.map((s, n) => {
          const on = n === i;
          return (
            <div
              key={s.key}
              id={`${id}-${n}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${bn(n + 1)} / ${bn(slides.length)}`}
              inert={!on}
              className={cn(
                "col-start-1 row-start-1 grid items-center gap-8 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14",
                on ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0",
              )}
            >
              <div className="flex flex-col items-start gap-5">
                {n === 0 ? (
                  <h1 className="text-4xl leading-[1.15] font-bold text-white sm:text-5xl xl:text-6xl">{s.title}</h1>
                ) : (
                  <h2 className="text-4xl leading-[1.15] font-bold text-white sm:text-5xl xl:text-6xl">{s.title}</h2>
                )}
                <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{s.lead}</p>
                <div className="flex flex-wrap gap-3 pt-1">{s.actions}</div>
              </div>
              <div className="hidden h-80 md:block">{s.art}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)}
          aria-label="আগের স্লাইড"
          className="grid size-10 place-items-center rounded-full text-signal-orange ring-1 ring-signal-orange/45 transition-colors hover:bg-signal-orange hover:text-text-primary"
        >
          <Icon name="chevron_left" className="text-2xl" />
        </button>
        <button
          type="button"
          onClick={() => setI((x) => (x + 1) % slides.length)}
          aria-label="পরের স্লাইড"
          className="grid size-10 place-items-center rounded-full text-signal-orange ring-1 ring-signal-orange/45 transition-colors hover:bg-signal-orange hover:text-text-primary"
        >
          <Icon name="chevron_right" className="text-2xl" />
        </button>
        <ul className="ml-2 flex gap-1">
          {slides.map((s, n) => (
            <li key={s.key}>
              <button type="button" onClick={() => setI(n)} aria-label={`স্লাইড ${bn(n + 1)}`} aria-controls={`${id}-${n}`} aria-current={n === i} className="grid size-8 place-items-center">
                <span className={cn("block h-2.5 rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none", n === i ? "w-6 bg-signal-orange" : "w-2.5 bg-white/35")} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── New and popular ────────────────────────────────────────────────── */

const TABS = [
  { key: "popular", label: "জনপ্রিয়" },
  { key: "new", label: "নতুন প্রকাশ" },
  { key: "ongoing", label: "চলমান গবেষণা" },
] as const;

/** জনপ্রিয় / নতুন / চলমান: one row of cards under three tabs. */
export function PopularTabs() {
  const list = useLibrary();
  const { points } = useScores();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("popular");
  const id = useId();
  const rows = useMemo(
    () => ({
      popular: trending(list, points, 10),
      new: newest(list, 10),
      ongoing: inTopic(list, "ongoing"),
    }),
    [list, points],
  );

  return (
    <section aria-labelledby={`${id}-title`}>
      <CardRow
        label={TABS.find((t) => t.key === tab)!.label}
        articles={rows[tab]}
        head={
          <>
            <h2 id={`${id}-title`} className="text-2xl font-bold text-signal-orange sm:text-3xl">
              নতুন ও জনপ্রিয়
            </h2>
            <div role="tablist" aria-label="নতুন ও জনপ্রিয়" className="mt-4 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "h-10 rounded-full px-4 text-sm font-bold transition-colors",
                    tab === t.key ? "bg-signal-orange text-text-primary" : "text-white/80 ring-1 ring-white/20 hover:text-white hover:ring-white/40",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        }
        empty={<p className="rounded-2xl p-6 text-sm text-white/65 ring-1 ring-white/12">এখানে এখনো কিছু নেই।</p>}
      />
    </section>
  );
}

/* ── Tracks and fields ──────────────────────────────────────────────── */

/** The research tracks as tiles, each with its live count. */
export function TrackGrid() {
  const list = useLibrary();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {TRACKS.map((t, i) => (
        <li key={t.id} className="story-reveal">
          <TrackTile t={t} count={inTopic(list, t.id).length} i={i} />
        </li>
      ))}
    </ul>
  );
}

/** The nine subject fields as compact tiles. */
export function FieldGrid() {
  const list = useLibrary();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(FIELDS) as FieldId[]).map((f) => (
        <li key={f}>
          <FieldTile field={f} count={inTopic(list, f).length} />
        </li>
      ))}
    </ul>
  );
}

/* ── Questions ──────────────────────────────────────────────────────── */

const FAQ = [
  { q: "গবেষণাকোষে পড়তে কি টাকা লাগে?", a: "না। প্রকাশিত প্রতিটি গবেষণা যে কেউ বিনামূল্যে পড়তে, ডাউনলোড করতে আর সূত্রসহ উদ্ধৃত করতে পারেন।" },
  { q: "কে গবেষণা প্রকাশ করতে পারেন?", a: "স্কুল-কলেজের শিক্ষার্থী থেকে পিএইচডি গবেষক বা স্বাধীন গবেষক — যে কেউ, কাণ্ডারী প্রোফাইলে সাইন ইন করে। কাজটি নিজের বা সহলেখকদের অনুমতিসহ হতে হবে।" },
  { q: "জমা দেওয়ার পর কী হয়?", a: "প্রতিটি জমা আগে পর্যালোচনায় যায়; তখন শুধু আপনি দেখেন। পর্যালোচনা শেষে সবার জন্য প্রকাশ হয়, আর আলোচনায় প্রশ্ন বা পরামর্শ আসতে পারে।" },
  { q: "কোন কোন ফরম্যাটে ডাউনলোড করা যায়?", a: "প্রতিটি গবেষণা পড়ার উপযোগী একক পাতা (HTML, ব্রাউজার থেকে পিডিএফ হিসেবে প্রিন্ট করা যায়), মার্কডাউন আর BibTeX উদ্ধৃতি হিসেবে নামানো যায়; লেখক পিডিএফ দিলে সেটিও।" },
  { q: "“রিয়েল-টাইম: দেশের সমস্যা” কী?", a: "জাতীয় সমস্যার তালিকার ৩২টি সমস্যা (BD-001 থেকে BD-032)। প্রতিটি গবেষণা কোন সমস্যা নিয়ে, তা দেখানো হয়; কোনটি নিয়ে কাজ নেই, তা-ও।" },
  { q: "পয়েন্ট কীভাবে আসে?", a: "পাঠকের প্রতিক্রিয়া, মন্তব্য, শেয়ার আর উদ্ধৃতিতে গবেষকের পয়েন্ট বাড়ে। শীর্ষ গবেষক আর বিষয়ক্ষেত্রের তালিকা এই পয়েন্টেই সাজানো।" },
];

/** প্রায়ই জিজ্ঞাসিত প্রশ্ন, each opening in place. */
export function Faq() {
  return (
    <ul className="divide-y divide-white/12 rounded-3xl bg-text-primary ring-1 ring-white/12 ring-inset">
      {FAQ.map((f) => (
        <li key={f.q}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-white sm:p-6 [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="add" className="shrink-0 text-2xl text-signal-orange transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" />
            </summary>
            <p className="-mt-1 px-5 pb-5 text-base leading-relaxed text-white/80 sm:px-6 sm:pb-6">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
