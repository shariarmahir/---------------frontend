import Link from "next/link";
import { Card, LINK, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Credit, Photo } from "@/data/bangladesh";
import { P, facts } from "@/data/bangladesh-history";
import { commonsPhotos } from "@/data/bangladesh-photos";
import { WB_SOURCE_URL } from "@/data/bangladesh-growth";
import { promoCredits } from "@/data/promos";
import { ruralCredits } from "@/data/rural-life";
import { cn } from "@/lib/utils";
import { StoryPhoto } from "./story-photo";

/**
 * The turn from the story to the reader: a crowd holding the flag high, a
 * line of Nazrul, and an invitation to find their own part.
 */
export function BdPride() {
  return (
    <Section id="people" title="People who lit the way">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <StoryPhoto
          photo={P.crowd}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="story-reveal aspect-3/2 rounded-3xl ring-1 ring-white/12 lg:col-span-5 lg:aspect-auto lg:min-h-96"
        />
        <Card className="story-reveal flex flex-col justify-center lg:col-span-7 lg:p-12">
          <figure>
            <blockquote className="font-grotesk text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
              “Proclaim, O hero:
              <br />
              <span className="text-signal-orange">my head is held high!</span>”
            </blockquote>
            <figcaption className="mt-3 text-sm text-white/80">Kazi Nazrul Islam, from Bidrohi (The Rebel)</figcaption>
          </figure>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            We are a nation of heroes: the children of a people who bared their chests for their language, won their
            independence in nine months of war and rose from nothing. This green country is our blessing, and making it
            more beautiful is our duty too.
          </p>
          <Link href="/bangladesh/shield" className={cn(btn.gold, "mt-8 self-start")}>
            Find your part
            <Icon name="arrow_forward" className="text-lg!" />
          </Link>
        </Card>
      </div>
    </Section>
  );
}

/** "File:Lalbagh_Kella_(Lalbagh_Fort).JPG" → "Lalbagh Kella (Lalbagh Fort)": a Commons file's own English title. */
function fileTitle(p: Photo & { credit: Credit }) {
  const file = p.credit.sourceUrl.split("/File:")[1];
  return file ? decodeURIComponent(file).replace(/_/g, " ").replace(/\.\w+$/, "") : p.alt;
}

/** Every source behind this chapter's figures, and every Commons photograph shown on these pages, credited once each. */
export function BdCredits() {
  const seen = new Set<string>();
  const photos = [...Object.values(commonsPhotos), ...ruralCredits, ...promoCredits].filter((p): p is Photo & { credit: Credit } => {
    const url = p?.credit?.sourceUrl;
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  const sources = [{ label: "Growth charts", source: "World Bank, World Development Indicators", url: WB_SOURCE_URL }, ...facts];

  return (
    <Section
      id="credits"
      title="Sources and photo credits"
      lede="Every figure in this chapter names its source, and every Wikimedia Commons photograph is credited with its author and licence."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <Card surface="ink" className="lg:col-span-5">
          <h3 className="font-grotesk text-xl font-bold text-white">Figures</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
            {sources.map((f) => (
              <li key={f.label}>
                {f.label}:{" "}
                <a href={f.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {f.source}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-7">
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block font-grotesk text-xl font-bold text-white">Photographs ({photos.length})</span>
                <span className="mt-1 block text-sm text-white/80">Each one&rsquo;s Commons page, author and licence</span>
              </span>
              <Icon name="expand_more" className="text-2xl! text-signal-orange transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/80">
              {photos.map((p) => (
                <li key={p.credit.sourceUrl}>
                  <a href={p.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {fileTitle(p)}
                  </a>
                  , {p.credit.author},{" "}
                  {p.credit.licenseUrl ? (
                    <a href={p.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {p.credit.license}
                    </a>
                  ) : (
                    p.credit.license
                  )}
                </li>
              ))}
            </ul>
          </details>
        </Card>
      </div>
    </Section>
  );
}
