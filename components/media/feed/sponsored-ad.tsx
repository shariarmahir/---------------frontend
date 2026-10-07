"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, FileUp, Info, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, Taka } from "../ui/numerals";

/*
 * Ad spaces in the feed. Two kinds, always labelled: "স্পন্সরড" for a
 * seller's boosted listing (the বাজার's paid ম্যাচ বুস্ট), and "প্রচার" for
 * the platform's own rooms. Each has a small looping motion graphic that
 * pauses off screen and stands still under reduced motion (.ms-* classes).
 */

export type AdListing = { id: string; title: string; price: number; unit: string; image?: string; imageAlt: string; seller: string; rating: number; sold: number; location: string };
export type AdChallenge = { id: string; title: string; host: string; prize: number; deadline: string; entries: number };

export type AdProps = { variant: "listing"; listing: AdListing } | { variant: "research" } | { variant: "challenge"; challenge: AdChallenge };

const t = (d: number, dur?: number) => ({ "--d": d, ...(dur ? { "--dur": dur } : {}) }) as CSSProperties;

function useOnScreen() {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "80px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

function Why({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <span title={text} className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", dark ? "text-m-ink/55" : "text-m-ink/60")}>
      <Info className="size-3.5" aria-hidden /> <span className="sr-only sm:not-sr-only">কেন দেখছেন?</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

export function SponsoredAd(props: AdProps) {
  const [ref, on] = useOnScreen();
  const base = "ms-root story-reveal overflow-hidden rounded-3xl";

  if (props.variant === "listing") {
    const l = props.listing;
    return (
      <aside ref={ref} data-paused={!on} aria-label={`স্পন্সরড: ${l.title}`} className={cn(base, "border border-m-blue/45 bg-m-card")}>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 text-sm text-m-ink/80">
            <span className="shrink-0 rounded-full bg-m-yellow px-2.5 py-0.5 text-xs font-bold text-m-ink">স্পন্সরড</span>
            <span className="truncate">{l.seller} · বাজার</span>
          </p>
          <Why dark text="বিক্রেতা এই লিস্টিংয়ে ‘ম্যাচ বুস্ট’ চালু করেছেন — তাই ফিড ও বাজারে আগে দেখাচ্ছে।" />
        </div>
        <Link href={`/media/market/${l.id}`} className="group relative block aspect-16/9 overflow-hidden bg-m-ink/6">
          {l.image && <Image src={l.image} alt={l.imageAlt} fill sizes="(min-width: 768px) 680px, 100vw" className="ms-zoom object-cover" />}
          <span className="ms-float absolute top-4 right-4 rounded-2xl bg-m-yellow px-4 py-2 text-xl font-bold text-m-ink shadow-m-ink" style={t(0)}>
            <Taka amount={l.price} />
            <span className="block text-[11px] font-semibold text-m-ink/70">{l.unit}</span>
          </span>
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-m-card px-3 py-1.5 text-xs font-bold text-m-ink">
            <Star className="size-3.5 fill-m-yellow text-m-gold" aria-hidden />
            <Num value={l.rating} decimals={1} /> · <Num value={l.sold} /> বার বিক্রি
          </span>
        </Link>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="line-clamp-1 text-[15px] font-bold text-m-ink">{l.title}</p>
            <p className="truncate text-xs text-m-ink/60">{l.location}</p>
          </div>
          <Link href={`/media/market/${l.id}`} className={mediaButton({ variant: "primary", size: "sm" })}>
            দেখুন ও কিনুন <ArrowRight aria-hidden />
          </Link>
        </div>
      </aside>
    );
  }

  if (props.variant === "challenge") {
    const c = props.challenge;
    return (
      <aside ref={ref} data-paused={!on} aria-label={`প্রচার: ${c.title}`} className={cn(base, "grid gap-4 bg-m-red-soft p-5 text-m-ink sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center sm:p-6")}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-m-card px-2.5 py-0.5 text-xs font-bold text-m-blue">প্রচার · চ্যালেঞ্জ</span>
            <Why text="কাণ্ডারী-ল্যাবের নিজের প্রচার: চলতি চ্যালেঞ্জের মধ্যে সবচেয়ে বড় পুরস্কার।" />
          </div>
          <p className="text-2xl leading-tight font-bold text-balance sm:text-3xl">{c.title}</p>
          <p className="text-sm text-m-ink/80">
            আয়োজক {c.host} · শেষ <DateText iso={c.deadline} /> · <Num value={c.entries} />টি জমা
          </p>
          <Link href={`/media/together?v=challenges#${c.id}`} className={mediaButton({ variant: "tile" })}>
            অংশ নিন <ArrowRight aria-hidden />
          </Link>
        </div>
        <div className="relative mx-auto grid size-36 place-items-center">
          <svg aria-hidden viewBox="0 0 120 120" className="absolute inset-0 size-full">
            {[0, 600, 1200].map((d) => (
              <circle key={d} cx="60" cy="60" r="34" className="ms-ring fill-none stroke-m-ink" strokeWidth="2" style={t(d, 1.8)} />
            ))}
          </svg>
          <span className="ms-float relative grid size-20 place-items-center rounded-3xl bg-m-card text-m-blue shadow-m-ink" style={t(0)}>
            <Trophy className="size-10" aria-hidden />
          </span>
          <span className="absolute -bottom-1 rounded-full bg-m-yellow px-3 py-1 text-base font-bold">
            <Taka amount={c.prize} />
          </span>
        </div>
      </aside>
    );
  }

  // The research promotion: a chart that keeps drawing itself.
  const bars = [38, 62, 48, 80, 66, 92];
  return (
    <aside ref={ref} data-paused={!on} aria-label="প্রচার: গবেষণাকোষ" className={cn(base, "grid gap-5 bg-m-yellow p-5 text-m-ink sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center sm:p-6")}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-m-card px-2.5 py-0.5 text-xs font-bold text-m-blue">প্রচার · গবেষণাকোষ</span>
          <Why text="কাণ্ডারী-ল্যাবের নিজের প্রচার: দেশের উন্মুক্ত গবেষণা প্ল্যাটফর্ম।" />
        </div>
        <p className="text-2xl leading-tight font-bold text-balance sm:text-3xl">আপনার থিসিস ড্রয়ারে নয়, দেশের কাজে লাগুক।</p>
        <p className="text-sm leading-relaxed text-m-ink/80">গবেষণা প্রকাশ করুন, প্রতিক্রিয়া আর পয়েন্ট পান, এক চাপে ফিডে শেয়ার করুন।</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/research/submit" className={mediaButton({ variant: "tile" })}>
            <FileUp aria-hidden /> প্রকাশ করুন
          </Link>
          <Link href="/research" className={mediaButton({ variant: "quiet", className: "border-m-ink/30 bg-transparent text-m-ink hover:bg-m-card hover:text-m-ink" })}>
            গবেষণা পড়ুন
          </Link>
        </div>
      </div>
      <svg aria-hidden viewBox="0 0 176 130" className="w-full max-w-56 justify-self-center">
        <rect x="0" y="0" width="176" height="130" rx="18" className="fill-m-ink" />
        {bars.map((h, i) => (
          <rect key={i} x={18 + i * 25} y={112 - h} width="14" height={h} rx="4" className={cn("ms-bar", i % 2 ? "fill-m-green" : "fill-m-yellow")} style={{ ...t(i * 160, 2.4), transformOrigin: "50% 100%" }} />
        ))}
        <path d="M18 92 L48 70 L73 80 L98 46 L123 56 L150 22" pathLength={100} className="ms-dash fill-none stroke-m-ink" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={t(0, 3.2)} />
        <circle cx="150" cy="22" r="4.5" className="ms-pulse fill-m-ink" style={t(0, 1.6)} />
      </svg>
    </aside>
  );
}
