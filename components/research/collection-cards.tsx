import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS } from "@/data/research/showcase";
import { libraryArticles } from "@/data/research/library";
import { inTopic, TRACKS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { collectionHref, LIFT, plural } from "./kit";

/** Every collection as JSTOR's subcollection cards: cover, name, item count, a line about it. */
export function CollectionCards() {
  return (
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {TRACKS.map((t) => {
        const c = COLLECTIONS[t.id];
        const n = inTopic(libraryArticles, t.id).length;
        return (
          <li key={t.id} className="story-reveal group">
            <Link href={collectionHref(t.id)} className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <span className={cn("relative block aspect-4/3 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12", LIFT)}>
                <Image src={c.cover.src} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none" />
              </span>
              <span className="mt-5 block font-grotesk text-lg leading-snug font-bold text-white transition-colors group-hover:text-signal-orange">{t.title}</span>
            </Link>
            <p className="mt-2 text-sm font-semibold text-bdnavy-300 tabular-nums">{plural(n, "item")}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80">{t.blurb}</p>
          </li>
        );
      })}
    </ul>
  );
}
