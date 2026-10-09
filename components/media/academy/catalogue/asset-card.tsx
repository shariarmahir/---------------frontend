import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { twoDigits } from "./band";

/*
 * The press-kit card, after getartcraft.com/press-kit: a strip naming what
 * the thing is and its number, a 16:9 frame (a picture filling it, or an
 * icon sitting in it), the title in the wide face, a line under it, and one
 * full-width square button at the foot. Cards sit in a hairline grid.
 */

/** The 16:9 frame; its picture grows a touch under the pointer. */
export const frameClass = "group/frame relative block aspect-video w-full overflow-hidden bg-(--c-bg-sunken)";

/** The card's one action: square, outlined, inverting under the pointer. */
export const actionClass =
  "inline-flex w-full items-center justify-center gap-2 border border-(--c-line-strong) bg-(--c-bg) px-4 py-2 text-[13px] font-bold whitespace-nowrap text-(--c-ink) transition-colors duration-150 hover:border-transparent hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)";

/** A picture in the frame: filling it, or held in from the edges (`contain`) like an icon. */
export function FrameImage({ src, alt = "", contain, sizes = "(min-width: 1024px) 26rem, (min-width: 768px) 46vw, 94vw" }: { src: string; alt?: string; contain?: boolean; sizes?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("absolute inset-0 transition-transform duration-500 group-hover/frame:scale-[1.02] motion-reduce:transition-none", contain ? "object-contain p-8" : "object-cover")}
    />
  );
}

/** The inverted tag in the frame's corner — "চালান", "খুব মিলেছে". */
export function FrameTag({ icon: Icon, children, className }: { icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("hud absolute bottom-3 left-3 flex items-center gap-1.5 bg-(--c-invert-bg) px-3 py-1.5 font-bold text-(--c-invert-fg)", className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

export interface AssetAction {
  href: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  /** Quiet words after the label: a fee, a count, a length. */
  aside?: React.ReactNode;
}

export function AssetCard({
  kind,
  n,
  frame,
  title,
  text,
  extra,
  action,
  style,
  className,
}: {
  kind: { icon: LucideIcon; label: React.ReactNode };
  n: number;
  /** The frame's whole element, built from `frameClass` (a link, a button or a plain box). */
  frame?: React.ReactNode;
  title: React.ReactNode;
  text?: React.ReactNode;
  extra?: React.ReactNode;
  action?: AssetAction | React.ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const Kind = kind.icon;
  return (
    <article style={style} className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-2.5">
        <p className="hud flex items-center gap-1.5 text-(--c-muted)">
          <Kind className="size-3.5" aria-hidden />
          {kind.label}
        </p>
        <p className="hud text-(--c-faint)">{twoDigits(n)}</p>
      </div>
      {frame}
      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="display text-xl leading-snug text-(--c-ink-strong)">{title}</h3>
        {text && <div className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">{text}</div>}
        {extra}
        {action && <div className="mt-auto pt-5">{isAction(action) ? <ActionLink {...action} /> : action}</div>}
      </div>
    </article>
  );
}

function isAction(a: unknown): a is AssetAction {
  return typeof a === "object" && a !== null && "href" in a && "label" in a;
}

function ActionLink({ href, label, icon: Icon, aside }: AssetAction) {
  return (
    <Link href={href} className={actionClass}>
      {Icon && <Icon className="size-4" aria-hidden />}
      {label}
      {aside && <span className="font-normal opacity-60">{aside}</span>}
    </Link>
  );
}

/**
 * The hairline grid the cards sit in: one column, two from tablets, three
 * from laptops. Its last row is padded with blank cells so no grey hole
 * shows where cards run out.
 */
export function AssetGrid({ count, className, children }: { count: number; className?: string; children: React.ReactNode }) {
  const two = count % 2;
  const three = (3 - (count % 3)) % 3;
  return (
    <ul className={cn("grid gap-px bg-(--c-line) md:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
      {/* One blank cell does both jobs: a column's worth on tablets, the rest of the row on laptops. */}
      {(two > 0 || three > 0) && <li aria-hidden className={cn("hidden bg-(--c-bg)", two > 0 && "md:block", three === 0 ? "lg:hidden" : "lg:block", FILL_LG[three])} />}
    </ul>
  );
}
const FILL_LG = ["", "lg:col-span-1", "lg:col-span-2"];
