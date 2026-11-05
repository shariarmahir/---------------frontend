import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { articleHref, COLUMN, H1, H2, LABEL, LIFT, LINK, TITLE_LINK } from "@/components/research/kit";
import { libraryArticles } from "@/data/research/library";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Images and Figures — Genius" };

/** Every photograph, figure and table in the library, each linked to the page it sits on. */
export default function ImagesPage() {
  const works = libraryArticles.filter((a) => a.status === "published");
  const photos = works.filter((a) => a.image);
  const visuals = works.flatMap((a) => {
    let f = 0;
    let t = 0;
    return a.sections.flatMap((s, i) => [
      ...(s.figures ?? []).map((x) => ({ kind: "Figure" as const, n: ++f, title: x.title, a, page: i + 2 })),
      ...(s.tables ?? []).map((x) => ({ kind: "Table" as const, n: ++t, title: x.title, a, page: i + 2 })),
    ]);
  });
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Images and Figures</h1>
      <p className="hero-rise mt-4 max-w-[62ch] text-lg leading-relaxed text-white/80">Photographs with their credits, and every chart and table in the library. Each opens on the page where it appears.</p>

      <h2 className={cn(H2, "story-reveal mt-14")}>Photographs</h2>
      <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((a) => (
          <li key={a.slug} className="story-reveal">
            <Link href={articleHref(a)} className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <span className={cn("relative block aspect-4/3 overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12", LIFT)}>
                <Image src={a.image!.src} alt={a.image!.caption} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none" />
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/80">{a.image!.caption}.</p>
            {a.image!.credit && <p className="mt-1 text-xs text-white/65">{a.image!.credit}</p>}
            <p className="mt-1.5 text-sm text-white/80">From <Link href={articleHref(a)} className={LINK}>{a.title}</Link></p>
          </li>
        ))}
      </ul>

      <h2 className={cn(H2, "story-reveal mt-16")}>Figures and tables</h2>
      <ul className="mt-6 divide-y divide-white/12 border-y border-white/12">
        {visuals.map((v) => (
          <li key={`${v.a.slug}-${v.kind}-${v.n}`} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-5">
            <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-bdnavy-900 text-signal-orange ring-1 ring-white/12"><Icon name={v.kind === "Figure" ? "bar_chart" : "table_chart"} className="text-2xl" /></span>
            <div className="min-w-0">
              <p className={LABEL}>{v.kind} {v.n}</p>
              <Link href={articleHref(v.a, v.page)} className={cn(TITLE_LINK, "mt-0.5 block text-base")}>{v.title}</Link>
              <p className="mt-0.5 text-sm text-white/65">From {v.a.title}, page {v.page}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
