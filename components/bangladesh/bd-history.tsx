import { Icon } from "@/components/ui/icon";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { historyChapters, historyFilm, type HistoryChapter } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { StoryCarousel } from "./story-carousel";
import { StoryHeading } from "./story-heading";
import { StoryVideo } from "./story-video";

/**
 * The history of Bangladesh in eight editorial chapters. Text and a
 * stacked photo carousel alternate sides; on wide screens the carousel
 * stays pinned while the reader works through the chapter's text.
 */
export function BdHistory() {
  return (
    <section id="history" className="scroll-mt-40 bg-black">
      <div className="section-band mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০১"
          kicker="ইতিহাস"
          title="আড়াই হাজার বছরের পথ — পুণ্ড্রনগর থেকে বিজয় দিবস"
          accent="বিজয় দিবস"
          lede="প্রাচীন নগর, পাল রাজাদের জ্ঞানচর্চা, সুলতানি আর মুঘল ঐশ্বর্য, ঔপনিবেশিক শোষণ, ভাষার জন্য রক্ত, আর একাত্তরের মুক্তিযুদ্ধ — আটটি অধ্যায়ে আমাদের গল্প। প্রতিটি অধ্যায়ের ছবিগুলো সোয়াইপ করে দেখুন।"
        />

        {/* Chapter index. */}
        <nav aria-label="ইতিহাসের অধ্যায়" className="story-reveal">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {historyChapters.map((c, i) => {
              const tone = surfaceAt(i + (i >= 4 ? 1 : 0));
              return (
                <li key={c.id} className="flex">
                  <a
                    href={`#chapter-${c.id}`}
                    style={glowStyle(tone.glow)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                      LIFT,
                      tone.card,
                    )}
                  >
                    <span className="font-grotesk text-2xl font-bold opacity-70 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">{c.number}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bengali text-sm font-bold">{c.era}</span>
                      <span className="block truncate font-bengali text-xs opacity-80">{c.years}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-8">
          {historyChapters.map((c, i) => (
            <Chapter key={c.id} chapter={c} flip={i % 2 === 1} />
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <StoryVideo film={historyFilm} />
        </div>
      </div>
    </section>
  );
}

function Chapter({ chapter: c, flip }: { chapter: HistoryChapter; flip: boolean }) {
  const red = c.tone === "red";

  return (
    <article
      id={`chapter-${c.id}`}
      className="grid scroll-mt-44 grid-cols-1 items-start gap-10 border-t border-white/12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24"
    >
      {/* ── Text ─────────────────────────────────────────── */}
      <div className={cn("story-reveal lg:col-span-6", flip && "lg:order-2")}>
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="font-grotesk text-7xl leading-none font-bold text-transparent sm:text-8xl"
            style={{ WebkitTextStroke: `1.5px ${red ? "#da291c" : "#e4b027"}` }}
          >
            {c.number}
          </span>
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "w-fit rounded-full px-3 py-0.5 font-bengali text-xs font-bold text-white",
                red ? "bg-national-crimson" : "bg-bd-green",
              )}
            >
              {c.era}
            </span>
            <span className="font-bengali text-base font-semibold text-white/80">{c.years}</span>
          </div>
        </div>

        <h3 className="mt-5 font-bengali text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">{c.title}</h3>
        <p className={cn("mt-4 font-bengali text-lg leading-relaxed font-semibold sm:text-xl", red ? "text-white" : "text-signal-orange")}>
          {c.lede}
        </p>

        <div className="mt-5 space-y-4">
          {c.paragraphs.map((para) => (
            <p key={para.slice(0, 24)} className="font-bengali text-base leading-loose text-white/80">
              {para}
            </p>
          ))}
        </div>

        {c.quote && (
          <blockquote
            className={cn(
              "mt-6 rounded-2xl px-5 py-4 font-bengali text-lg leading-relaxed font-semibold",
              red ? "bg-national-crimson text-white" : "bg-signal-orange text-text-primary",
            )}
          >
            “{c.quote.text}”
            <footer className="mt-1 text-sm font-normal opacity-80">— {c.quote.by}</footer>
          </blockquote>
        )}

        {/* Where to see it today. */}
        <div className="mt-6 flex gap-3 rounded-2xl bg-bd-green p-4 text-white shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-signal-orange text-text-primary">
            <Icon name="travel_explore" className="text-[22px]!" />
          </span>
          <div>
            <p className="font-bengali text-sm font-bold text-signal-orange">আজ যেখানে দেখবেন</p>
            <p className="mt-0.5 font-bengali text-sm leading-relaxed text-white/90">{c.today}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {c.facts.map((f, j) => {
            const tone = surfaceAt(j + 1);
            return (
              <div
                key={f.label}
                style={glowStyle(tone.glow)}
                className={cn("rounded-2xl px-4 py-3 shadow-sm", LIFT, tone.card)}
              >
                <dt className="font-bengali text-xs opacity-80">{f.label}</dt>
                <dd className="mt-0.5 font-bengali text-base leading-snug font-bold">{f.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* ── Photos — pinned beside the text on wide screens ─ */}
      <div className={cn("story-reveal lg:sticky lg:top-48 lg:col-span-6", flip && "lg:order-1")}>
        <StoryCarousel photos={c.photos} label={`${c.title} — ছবি`} tone={c.tone} />
      </div>
    </article>
  );
}
