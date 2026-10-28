import { Card, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { nature, type NatureItem } from "@/data/bangladesh-history";
import { cn } from "@/lib/utils";
import { PhotoCredit, StoryPhoto } from "./story-photo";

/** Each card's width in the 12-column grid from lg, its photo's height and its image sizes. A full-row card sets photo and text side by side. */
const SPAN: Record<NatureItem["span"], { col: string; photo: string; sizes: string }> = {
  lead: { col: "lg:col-span-7", photo: "h-64 sm:h-80 lg:h-96", sizes: "(min-width: 1024px) 58vw, 100vw" },
  side: { col: "lg:col-span-5", photo: "h-64 sm:h-80 lg:h-96", sizes: "(min-width: 1024px) 42vw, 100vw" },
  third: { col: "lg:col-span-4", photo: "h-64 sm:h-80 lg:h-72", sizes: "(min-width: 1024px) 33vw, 100vw" },
  full: { col: "lg:col-span-12", photo: "h-64 sm:h-80 lg:col-span-7 lg:h-auto lg:min-h-96", sizes: "(min-width: 1024px) 58vw, 100vw" },
};

const FIELDS: Surface[] = ["navy", "ink", "cobalt"];

/** Rivers, forest, sea, hills and fields: photo cards, each with its place, its line and its credit. */
export function BdNature() {
  return (
    <Section
      id="nature"
      title="Green, blue and gold: beautiful Bengal"
      lede="From the clouds over the hills to the waves of the sea, from the stillness of the mangroves to paddy fields that reach the horizon: so many colours in one country."
    >
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {nature.map((n, i) => {
          const s = SPAN[n.span];
          const full = n.span === "full";
          return (
            <li key={n.id} className={cn("story-reveal flex", s.col)}>
              <Card surface={FIELDS[i % FIELDS.length]} className={cn("flex w-full flex-col overflow-hidden p-0 sm:p-0", full && "lg:grid lg:grid-cols-12")}>
                <StoryPhoto photo={n.photo} sizes={s.sizes} className={cn("shrink-0", s.photo)} hideCredit />
                <div className={cn("flex flex-1 flex-col p-6 sm:p-8", full && "lg:col-span-5 lg:justify-center")}>
                  <h3 className="font-grotesk text-2xl font-bold text-white">{n.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{n.place}</p>
                  <p className="mt-3 text-base leading-relaxed text-white/80">{n.body}</p>
                  <PhotoCredit photo={n.photo} className={cn("pt-5", full ? "mt-6" : "mt-auto")} />
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
