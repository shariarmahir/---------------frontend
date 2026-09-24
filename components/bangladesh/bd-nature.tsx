import { nature, natureFilm, seasons } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { StoryHeading } from "./story-heading";
import { StoryPhoto } from "./story-photo";
import { StoryVideo } from "./story-video";

const SPAN: Record<(typeof nature)[number]["span"], string> = {
  hero: "md:col-span-2 md:row-span-2",
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  base: "",
  full: "md:col-span-4",
};

/** Bento gallery: every tile is a photograph with its story on hover. */
export function BdNature() {
  return (
    <section id="nature" className="section-band scroll-mt-40">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৩"
          kicker="প্রকৃতি"
          title="সবুজ, নীল আর সোনালি — রূপসী বাংলা"
          accent="রূপসী বাংলা"
          lede="পাহাড়ের মেঘ থেকে সমুদ্রের ঢেউ, ম্যানগ্রোভের নিস্তব্ধতা থেকে দিগন্তজোড়া ধানক্ষেত — এক দেশে এত রং।"
        />

        <div className="grid auto-rows-[15rem] grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[14rem]">
          {nature.map((n) => (
            <article
              key={n.id}
              className={cn(
                "story-reveal group relative overflow-hidden rounded-3xl bg-slate-900 shadow-sm ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-2xl",
                SPAN[n.span],
              )}
            >
              <StoryPhoto
                photo={n.photo}
                sizes={n.span === "full" ? "100vw" : n.span === "hero" || n.span === "wide" ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                className="absolute inset-0"
                drift={n.span === "hero" || n.span === "full"}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent transition-opacity duration-500 group-hover:from-slate-950/95" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                <span className="font-bengali text-xs font-semibold text-signal-orange">{n.kicker}</span>
                <h3 className={cn("font-bengali font-bold text-white", n.span === "hero" || n.span === "full" ? "text-4xl" : "text-2xl")}>{n.title}</h3>
                {/* Body slides up on hover; always shown on touch and small tiles' hero. */}
                <p
                  className={cn(
                    "mt-1 font-bengali text-sm leading-relaxed text-white/85 transition-all duration-500",
                    n.span === "hero" || n.span === "full"
                      ? "max-w-md"
                      : "max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 group-focus-within:max-h-32 group-focus-within:opacity-100 [@media(hover:none)]:max-h-32 [@media(hover:none)]:opacity-100",
                  )}
                >
                  {n.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <StoryVideo film={natureFilm} className="mt-12" />
      </div>
    </section>
  );
}

/** Six seasons — a horizontal strip of tall cards, each in its own light. */
export function BdSeasons() {
  return (
    <section id="seasons" className="section-band-tinted scroll-mt-40 overflow-hidden bg-slate-950">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৪"
          kicker="ষড়ঋতু"
          title="ছয় ঋতুর দেশ"
          accent="ছয় ঋতুর"
          lede="প্রতি দুই মাসে বদলে যায় আকাশের রং, মাঠের ফসল আর মানুষের উৎসব — পৃথিবীতে এমন দেশ খুব কম।"
          invert
        />

        <ol className="no-scrollbar -mx-gutter-x flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter-x pb-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {seasons.map((s, i) => (
            <li
              key={s.name}
              className="story-reveal group relative aspect-[3/5] w-60 shrink-0 snap-start overflow-hidden rounded-3xl lg:w-auto"
            >
              <StoryPhoto photo={s.photo} sizes="(min-width: 1024px) 16vw, 60vw" className="absolute inset-0" />
              <div aria-hidden className={cn("pointer-events-none absolute inset-0 bg-linear-to-t opacity-70 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40", s.tone)} />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent" />
              <span className="pointer-events-none absolute top-4 left-4 font-mono text-xs font-bold text-white/70">
                ০{(i + 1).toLocaleString("bn-BD")}
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-bengali text-3xl font-bold text-white">{s.name}</h3>
                <p className="font-bengali text-xs font-semibold text-signal-orange">{s.months}</p>
                <p className="mt-2 font-bengali text-sm leading-relaxed text-white/85">{s.mood}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
