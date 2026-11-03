import type { ReactNode } from "react";
import Image from "next/image";
import type { Picture } from "@/data/motherland";
import { cn } from "@/lib/utils";

/**
 * The page's one card, after the reference site's portrait cards: the
 * photograph is the card, with a small tag, a big title and one short line
 * over it. `rank` sets the Top 10's outlined number in the corner. It links
 * when given an `href`; a plain <a>, because places are chosen by the hash.
 */
export function PhotoCard({ picture, title, tag, text, href, rank, long, sizes = "(min-width: 1024px) 28rem, 82vw" }: { picture: Picture; title: string; tag?: string; text?: string; href?: string; rank?: number; /** Show the whole text, for pages where the words matter. */ long?: boolean; sizes?: string }) {
  const body: ReactNode = (
    <>
      <Image src={picture.src} alt={picture.alt} fill sizes={sizes} className="-z-20 object-cover transition-transform duration-1000 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-[1.06] motion-reduce:transition-none" style={{ objectPosition: picture.focus }} />
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
      {rank ? (
        <span aria-label={`Number ${rank}`} className="absolute top-4 left-5 font-ml-display text-[clamp(4.5rem,8vw,7.5rem)] leading-none text-white/95 drop-shadow-[0_4px_18px_rgb(0_0_0/0.45)]">
          {rank}
        </span>
      ) : null}
      <span className="mt-auto flex flex-col gap-2">
        {tag ? <span className="text-sm font-semibold text-signal-orange">{tag}</span> : null}
        <span className="font-ml-display text-[clamp(1.9rem,2.6vw,2.75rem)] leading-[1.05] tracking-[0.01em] text-balance uppercase">{title}</span>
        {text ? <span className={cn("leading-snug text-pretty text-white/90", !long && "line-clamp-2")}>{text}</span> : null}
      </span>
    </>
  );
  const shell = "group relative isolate flex aspect-3/4 w-full flex-col overflow-hidden rounded-2xl bg-ml-ink p-6 text-white sm:p-7";
  return href ? (
    <a href={href} className={cn(shell, "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange")}>
      {body}
    </a>
  ) : (
    <div className={shell}>{body}</div>
  );
}

/** The first sentence of a longer text, for the card's one line. */
export function firstSentence(text: string) {
  const end = text.search(/[.!?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}
