import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "lucide-react";
import type { PostLink } from "@/data/media/types";
import { isSitePath } from "@/lib/media/share-intent";

/** The card under a post that points to a page elsewhere on the site, e.g. a গবেষণাকোষ article. */
export function LinkCard({ link }: { link: PostLink }) {
  // Seeded and saved posts are trusted data, but the link is still checked: only paths on this site.
  if (!isSitePath(link.href)) return null;
  return (
    <Link
      href={link.href}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl bg-m-amber-soft p-4 text-m-ink ring-1 ring-m-yellow/60 transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-m-yellow motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-m-blue text-m-on shadow-m-ink">
        <BookOpenText className="size-5.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-m-ink/70">{link.source}{link.label ? ` · ${link.label}` : ""}</span>
        <span className="mt-0.5 line-clamp-2 block text-[15px] leading-snug font-bold">{link.title}</span>
        {link.summary && <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-m-ink/75">{link.summary}</span>}
      </span>
      <ArrowUpRight className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden />
    </Link>
  );
}
