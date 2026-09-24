import { Icon } from "@/components/ui/icon";
import {
  PORTRAITS,
  cultureFilm,
  cultureHighlights,
  musicTraditions,
  people,
  peopleGroups,
  unescoHeritage,
} from "@/data/bangladesh";
import { StoryHeading } from "./story-heading";
import { StoryPhoto } from "./story-photo";
import { StoryVideo } from "./story-video";

/** Festivals, crafts, food and music — with the UNESCO list up front. */
export function BdCulture() {
  return (
    <section id="culture" className="section-band scroll-mt-40">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৫"
          kicker="সংস্কৃতি"
          title="গানে, উৎসবে, হাতের শিল্পে বাঙালি"
          accent="বাঙালি"
          lede="বাংলার ছয়টি ঐতিহ্য আজ ইউনেস্কোর বিশ্ব-অধরা সাংস্কৃতিক ঐতিহ্যের তালিকায়।"
        />

        {/* UNESCO strip. */}
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {unescoHeritage.map((u) => (
            <li
              key={u.title}
              className="story-reveal group relative aspect-[3/4] overflow-hidden rounded-2xl bg-bd-green-dark shadow-sm transition-transform duration-500 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              {u.photo ? (
                <StoryPhoto photo={u.photo} sizes="(min-width: 1024px) 16vw, 50vw" className="absolute inset-0" />
              ) : (
                // Woven pattern tile for crafts we have no photo of.
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgb(255 145 0 / 0.5) 0 6px, transparent 6px 18px), repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.25) 0 6px, transparent 6px 18px)",
                  }}
                />
              )}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-bd-green">
                  <Icon name="verified" className="text-[12px]!" /> UNESCO {u.year}
                </span>
                <h3 className="mt-2 font-bengali text-lg leading-snug font-bold text-white">{u.title}</h3>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <StoryVideo film={cultureFilm} />
          </div>
          {/* Music traditions. */}
          <div className="story-reveal rounded-3xl bg-linear-to-br from-bd-green to-bd-green-dark p-7 text-white shadow-elevated lg:col-span-5">
            <span className="inline-flex items-center gap-2 font-bengali text-sm font-bold text-signal-orange">
              <Icon name="music_note" className="text-[18px]!" /> সুরের বাংলা
            </span>
            <ul className="mt-4 divide-y divide-white/10">
              {musicTraditions.map((m) => (
                <li key={m.name} className="group py-3">
                  <p className="font-bengali text-lg font-bold transition-colors group-hover:text-signal-orange">{m.name}</p>
                  <p className="font-bengali text-sm text-white/75">{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cultureHighlights.map((c) => (
            <div
              key={c.title}
              className="glass-card story-reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
            >
              <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-orange-50 text-bdorange-600">
                <Icon name={c.icon} className="text-[24px]!" />
              </span>
              <h3 className="font-bengali text-xl font-bold text-text-primary">{c.title}</h3>
              <p className="mt-1 font-bengali text-sm leading-relaxed text-text-secondary">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Poets, musicians and scientists — portrait cards with a line each. */
export function BdIcons() {
  const groups = (Object.keys(peopleGroups) as (keyof typeof peopleGroups)[]).map((g) => ({
    key: g,
    ...peopleGroups[g],
    list: people.filter((p) => p.group === g),
  }));

  return (
    <section id="icons" className="section-band-tinted scroll-mt-40 border-y border-slate-200 bg-[#fbf8f1]">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৬"
          kicker="গুণীজন"
          title="যাঁদের আলোয় আমরা আলোকিত"
          accent="আলোকিত"
          lede="কবি, মনীষী, শিল্পী আর বিজ্ঞানী — বাংলার মাটি থেকে উঠে আসা মানুষ, যাঁরা পৃথিবীকে বদলে দিয়েছেন।"
        />

        <div className="space-y-12">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="story-reveal mb-5 inline-flex items-center gap-2 font-bengali text-xl font-bold text-bd-green">
                <Icon name={g.icon} className="text-[24px]!" /> {g.label}
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.list.map((p) => {
                  const portrait = PORTRAITS[p.id];
                  return (
                    <article
                      key={p.id}
                      className="glass-card story-reveal flex flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm"
                      style={{ "--card-accent": "var(--color-bd-green)" } as React.CSSProperties}
                    >
                      <div className="flex items-start gap-4 p-5">
                        {portrait ? (
                          <StoryPhoto photo={portrait} sizes="96px" className="size-20 shrink-0 rounded-2xl ring-2 ring-amber-100" imgClassName="grayscale-[35%] group-hover/photo:grayscale-0" />
                        ) : (
                          <span aria-hidden className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-bd-green to-bd-green-dark font-bengali text-3xl font-bold text-white">
                            {p.name.slice(0, 1)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bengali text-xl leading-tight font-bold text-text-primary">{p.name}</h4>
                          <p className="font-bengali text-xs text-slate-500">{p.years}</p>
                          <p className="mt-1 font-bengali text-sm font-semibold text-signal-orange">{p.role}</p>
                        </div>
                      </div>
                      <p className="px-5 font-bengali text-sm leading-relaxed text-text-secondary">{p.body}</p>
                      {p.quote && (
                        <blockquote className="mx-5 mt-4 mb-5 border-l-4 border-national-crimson bg-red-50/60 px-4 py-3 font-bengali text-base leading-relaxed font-semibold text-text-primary italic">
                          “{p.quote}”
                        </blockquote>
                      )}
                      {!p.quote && <div className="pb-5" />}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
