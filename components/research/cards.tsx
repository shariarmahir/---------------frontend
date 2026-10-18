"use client";

/*
 * গবেষণাকোষের কার্ড, laid out like Coursera's course cards in the home
 * page's world: the picture (or the field's mark on cobalt), who it is from,
 * the title, what a reader will learn, its score, and what kind of work it
 * is. Rows of cards scroll sideways with their own buttons (no scrollbar);
 * tiles open a track or a subject field.
 */
import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { FIELDS, KINDS, LEVELS, readMinutes, reactionTotal, type Article, type FieldId } from "@/lib/research/core";
import { useScores } from "@/lib/research/store";
import type { Track } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { articleHref, bn, bnNum, StatusChips } from "./ui";

/** The card's lift: up a little, a glow in the card's own colour beneath (as the home page's cards). */
const LIFT =
  "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-22px_var(--glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/** One research work as a card. */
export function ResearchCard({ a, className }: { a: Article; className?: string }) {
  const { engagement, points } = useScores();
  const e = engagement(a);
  return (
    <Link
      href={articleHref(a)}
      style={{ "--glow": "var(--color-bdnavy-400)" } as CSSProperties}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
        LIFT,
        className,
      )}
    >
      <span className="relative block aspect-video shrink-0 overflow-hidden bg-cobalt">
        {a.image ? (
          <Image
            src={a.image.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 80vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <Icon name={FIELDS[a.field].icon} className="text-7xl! text-signal-orange/90" />
          </span>
        )}
        <span className="absolute top-3 left-3 flex flex-wrap gap-1.5 [&>span]:bg-black/75">
          <StatusChips article={a} />
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-2.5 p-4">
        <span className="flex items-center gap-2">
          <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-signal-orange text-text-primary">
            <Icon name="account_balance" className="text-base" />
          </span>
          <span className="truncate text-sm text-white/80">{a.institution.split(",")[0]}</span>
        </span>
        <span className="line-clamp-2 text-base leading-snug font-bold transition-colors group-hover:text-signal-orange">{a.title}</span>
        {a.keywords.length > 0 && (
          <span className="line-clamp-2 text-sm leading-snug text-white/65">
            <span className="font-bold text-white/80">যা জানবেন: </span>
            {a.keywords.join(", ")}
          </span>
        )}
        <span className="mt-auto flex items-center gap-1.5 pt-1 text-sm">
          <Icon name="bolt" className="text-lg text-signal-orange" filled />
          <span className="font-bold">{bnNum(points(a))}</span>
          <span className="text-white/65">পয়েন্ট · {bnNum(reactionTotal(e))} প্রতিক্রিয়া</span>
        </span>
        <span className="text-xs text-white/65">
          {KINDS[a.kind].bn} · {LEVELS[a.level]} · {bn(readMinutes(a))} মিনিট
        </span>
      </span>
    </Link>
  );
}

/** A row of cards that scrolls sideways; its head (if any) carries the previous and next buttons at the right. */
export function CardRow({ label, articles, empty, head }: { label: string; articles: Article[]; empty?: ReactNode; head?: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">{head}</div>
        {articles.length > 3 && (
          <div className="hidden shrink-0 gap-2 sm:flex">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => page(d)}
                aria-label={d < 0 ? "আগের কার্ড" : "পরের কার্ড"}
                className="grid size-11 place-items-center rounded-full text-signal-orange ring-1 ring-signal-orange/45 transition-colors hover:bg-signal-orange hover:text-text-primary focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                <Icon name={d < 0 ? "chevron_left" : "chevron_right"} className="text-2xl" />
              </button>
            ))}
          </div>
        )}
      </div>
      {articles.length === 0 ? (
        empty
      ) : (
        <ul
          ref={track}
          aria-label={label}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pt-1 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((a) => (
            <li key={a.slug} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]">
              <ResearchCard a={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TILE_FIELDS = [
  { card: "bg-bdnavy-900", glow: "var(--color-bdnavy-400)" },
  { card: "bg-cobalt", glow: "var(--color-cobalt)" },
  { card: "bg-text-primary", glow: "var(--color-signal-orange)" },
] as const;

/** A research track as a solid tile: its symbol, name, one line, and how many works are in it. */
export function TrackTile({ t, count, i }: { t: Track; count: number; i: number }) {
  const look = TILE_FIELDS[i % TILE_FIELDS.length];
  return (
    <Link
      href={`/research/topic/${t.id}`}
      style={{ "--glow": look.glow } as CSSProperties}
      className={cn("group flex h-full flex-col gap-3 rounded-3xl p-6 text-white ring-1 ring-white/12 ring-inset focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", look.card, LIFT)}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-black/25 text-signal-orange ring-1 ring-white/15">
          <Icon name={t.icon} className="text-2xl" />
        </span>
        <span className="text-sm font-bold text-white/80">{count > 0 ? `${bn(count)}টি গবেষণা` : "নতুন ধারা"}</span>
      </span>
      <span className="text-xl leading-snug font-bold text-signal-orange">{t.bn}</span>
      <span className="text-sm leading-relaxed text-white/80">{t.blurb}</span>
      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold">
        দেখুন <Icon name="arrow_forward" className="text-lg transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}

/** A subject field as a compact tile: symbol, name, count. */
export function FieldTile({ field, count }: { field: FieldId; count: number }) {
  const f = FIELDS[field];
  return (
    <Link
      href={`/research/topic/${field}`}
      className="group flex items-center gap-3 rounded-2xl bg-text-primary p-4 ring-1 ring-white/12 ring-inset transition-colors hover:bg-bdnavy-900 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cobalt text-signal-orange">
        <Icon name={f.icon} className="text-2xl" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-bold text-white group-hover:text-signal-orange">{f.bn}</span>
        <span className="block text-sm text-white/65">{count > 0 ? `${bn(count)}টি গবেষণা` : "প্রথম গবেষণা আপনার হোক"}</span>
      </span>
    </Link>
  );
}
