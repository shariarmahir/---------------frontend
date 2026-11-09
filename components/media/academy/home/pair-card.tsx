import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Ticket, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { twoDigits } from "../catalogue/band";
import { joinBtn, moreBtn } from "../catalogue/buttons";

export interface Door {
  href: string;
  label?: string;
}

/**
 * The home page's card, after the reference's feature cards: a strip naming
 * the kind and its number, an optional frame, the title and a line or two,
 * and two doors at the foot — see more, or join. `join` may be a ready
 * button (a course's own "ভর্তি হোন") instead of a link.
 */
export function PairCard({
  kind,
  n,
  frame,
  title,
  text,
  extra,
  more,
  join,
  style,
  className,
}: {
  kind: { icon: LucideIcon; label: React.ReactNode };
  n: number | string;
  frame?: React.ReactNode;
  title: React.ReactNode;
  text?: React.ReactNode;
  extra?: React.ReactNode;
  more: Door;
  join: Door | React.ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const Kind = kind.icon;
  return (
    <article data-reveal style={style} className={cn("group relative flex h-full flex-col bg-(--c-bg)", className)}>
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-[var(--c-app,var(--c-signal))] transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />
      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-2.5 md:px-8">
        <p className="hud flex items-center gap-1.5 text-(--c-muted)">
          <Kind className="size-3.5" aria-hidden />
          {kind.label}
        </p>
        <p className="hud text-(--c-faint)">{typeof n === "number" ? twoDigits(n) : n}</p>
      </div>
      {frame}
      <div className="flex flex-1 flex-col px-6 py-6 md:px-8">
        <h3 className="display text-2xl leading-snug text-(--c-ink-strong)">{title}</h3>
        {text && <div className="mt-2 leading-relaxed text-(--c-muted)">{text}</div>}
        {extra}
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-(--c-line) bg-(--c-line)">
        <Link href={more.href} className={moreBtn}>
          {more.label ?? "বিস্তারিত"}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        {isDoor(join) ? (
          <Link href={join.href} className={joinBtn}>
            <Ticket className="size-4" aria-hidden />
            {join.label ?? "ভর্তি হোন"}
          </Link>
        ) : (
          join
        )}
      </div>
    </article>
  );
}

function isDoor(d: unknown): d is Door {
  return typeof d === "object" && d !== null && "href" in d && !("$$typeof" in d);
}
