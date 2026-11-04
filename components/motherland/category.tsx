import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, type Category, type Story, type Subcategory } from "@/data/motherland-categories";
import { PROCON, VIDEOS } from "@/data/motherland";
import { DEEP } from "@/data/motherland-deep";
import { cn } from "@/lib/utils";
import { CardStack } from "./card-stack";
import { Figures, Timeline } from "./figures";
import { Invest } from "./invest";
import { NatureList } from "./nature-list";
import { ANCHOR, COLUMN, LEDE, SectionHead, pill } from "./kit";
import { PhotoCard } from "./photo-card";
import { Quiz } from "./quiz";
import { Rail } from "./rail";
import { TakeASide } from "./take-a-side";
import { VideoPlayer } from "./video-player";
import { WeekFilm } from "./week-film";

/*
 * A MOTHERLAND category page, in the dress Geography & Travel set: a
 * full-screen film or photograph, one narrow line of figures, the first part
 * dealt as full-screen cards, sourced figures that count up, the other parts
 * as rails of portrait photographs after visittheusa.com, a timeline, a quiz,
 * then the other categories.
 */

/** The full-screen opening: a film where we have one, else a photograph that drifts slowly. */
function Opening({ category }: { category: Category }) {
  const { hero, name, lede, subcategories } = category;
  const film = DEEP[category.slug]?.film;
  return (
    <section aria-labelledby="category-title" className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-navy text-white">
      {film ? <WeekFilm film={film} /> : <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="ml-drift -z-20 object-cover" style={{ objectPosition: hero.focus }} />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-black/25" />
      <Link
        href="/bangladesh"
        className="absolute top-[calc(var(--ml-header)+1rem)] left-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ml-ink backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-10 xl:left-12"
      >
        <span aria-hidden>←</span> MOTHERLAND
      </Link>
      <div className={cn(COLUMN, "flex flex-col items-start gap-6 pt-36 pb-14 lg:pb-20")}>
        <h1 id="category-title" className="font-ml-display text-[clamp(3.5rem,11.5vw,11rem)] leading-[0.98] tracking-[0.01em] text-balance uppercase">
          {name}
        </h1>
        <p className={cn(LEDE, "text-white/90")}>{lede}</p>
        {subcategories.length ? (
          <nav aria-label={`Browse ${name}`}>
            <ul className="flex flex-wrap gap-3">
              {subcategories.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={i === 0 ? pill.onDark : pill.white}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </section>
  );
}

const ARTS = ["arches", "peaks", "waves", "minar"] as const;
const STACK_ART: Record<string, readonly (typeof ARTS)[number][]> = { history: ARTS, nature: ["waves"], "science-tech": ["waves", "peaks"], taka: ["waves"], culture: ["arches", "waves"], resources: ["waves"], invest: ["peaks", "waves"] };

/** The first part of a page, dealt edge to edge as on the landing page. Its heading is for screen readers: each card speaks for itself. */
function StackBand({ sub, slug }: { sub: Subcategory; slug: string }) {
  const arts = STACK_ART[slug] ?? ARTS;
  return (
    <section id={sub.id} aria-labelledby={`${sub.id}-title`} className={cn(ANCHOR, "bg-ml-ground")}>
      <h2 id={`${sub.id}-title`} className="sr-only">
        {sub.title}
      </h2>
      <CardStack tone="navy" cards={sub.stories.map((st, i) => ({ art: arts[i % arts.length], title: st.title, text: st.meta ? `${st.meta}. ${st.text}` : st.text, picture: st.picture }))} />
    </section>
  );
}

const BAND_TONES = ["bg-ml-ground text-ml-ink", "bg-ml-navy text-white", "bg-ml-paper text-ml-ink"];

function storyCard(st: Story) {
  return <PhotoCard picture={st.picture} title={st.title} tag={st.meta} text={st.text} long />;
}

/** The rest of a page's parts: a rail of portrait photographs. */
function RailBand({ sub, index }: { sub: Subcategory; index: number }) {
  const tone = BAND_TONES[index % BAND_TONES.length];
  return (
    <section id={sub.id} aria-labelledby={`${sub.id}-title`} className={cn(ANCHOR, "py-20 sm:py-28", tone)}>
      <Rail label={sub.title} head={<SectionHead id={`${sub.id}-title`} title={sub.title} lede={sub.lede} tone={index % 3 === 1 ? "dark" : "light"} />}>
        {sub.stories.map((st) => (
          <li key={st.title} className="w-[min(82vw,26rem)] shrink-0 snap-start">
            {storyCard(st)}
          </li>
        ))}
      </Rail>
    </section>
  );
}

/** The figures at a glance: one narrow gold line, however many there are. */
export function Facts({ facts }: { facts: Category["facts"] }) {
  return (
    <div className="bg-signal-orange text-ml-ink">
      <dl className="ml-rail flex items-center gap-8 overflow-x-auto py-3.5 lg:justify-between lg:gap-4">
        {facts.map((f) => (
          <div key={f.label} className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
            <dt className="text-sm font-semibold text-ml-ink/75">{f.label}</dt>
            <dd className="font-bold">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Every other category, as a wall of photographs across the whole screen. */
export function MoreCategories({ current }: { current: string }) {
  const others = CATEGORIES.filter((c) => c.slug !== current);
  return (
    <nav aria-label="More of Bangladesh" className="grid grid-cols-2 bg-ml-navy sm:grid-cols-3 lg:grid-cols-5">
      {others.map((c) => (
        <Link key={c.slug} href={`/bangladesh/${c.slug}`} className="group relative isolate flex aspect-4/3 items-end overflow-hidden p-5 text-white focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-signal-orange lg:p-7">
          <Image src={c.hero.src} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: c.hero.focus }} />
          <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 to-black/10" />
          <span className="font-ml-display text-[clamp(1.4rem,2.2vw,2.5rem)] leading-tight tracking-[0.01em] uppercase">{c.name}</span>
        </Link>
      ))}
    </nav>
  );
}

export function CategoryPage({ category }: { category: Category }) {
  const deep = DEEP[category.slug] ?? {};
  const [first, ...rest] = category.subcategories;
  const stacks = first && first.shape !== "tall" && first.stories.length > 1;
  const rails = stacks ? rest : category.subcategories;
  return (
    <>
      <Opening category={category} />
      {category.facts.length ? <Facts facts={category.facts} /> : null}
      {category.body === "debates" ? (
        <section aria-label={category.name} className="bg-ml-ground py-20 text-ml-ink sm:py-28">
          <TakeASide debates={PROCON.debates} className={COLUMN} />
          <div className={cn(COLUMN, "mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-ml-navy p-6 text-white sm:p-8")}>
            <p className="max-w-2xl text-xl leading-snug font-bold text-balance">Want the figures behind the argument? We publish the best and the worst of Bangladesh, with sources.</p>
            <Link href="/bangladesh/facts#why-we-are-not-doing-best" className={pill.onDark}>
              Read the Facts of Bangladesh
            </Link>
          </div>
        </section>
      ) : null}
      {category.body === "films" ? (
        <section aria-label={category.name} className="bg-ml-navy py-20 text-white sm:py-28">
          <div className={COLUMN}>
            <VideoPlayer films={VIDEOS.films} />
          </div>
        </section>
      ) : null}
      {stacks ? <StackBand sub={first} slug={category.slug} /> : null}
      {category.slug === "nature" ? <NatureList /> : null}
      {deep.figures ? <Figures title={deep.figuresTitle ?? "In numbers"} figures={deep.figures} /> : null}
      {category.slug === "invest" ? <Invest /> : null}
      {rails.map((s, i) => (
        <RailBand key={s.id} sub={s} index={i} />
      ))}
      {deep.timeline ? <Timeline title={deep.timelineTitle ?? "Timeline"} moments={deep.timeline} /> : null}
      {category.quiz.length ? <Quiz questions={category.quiz} name={category.name} /> : null}
      <MoreCategories current={category.slug} />
    </>
  );
}
