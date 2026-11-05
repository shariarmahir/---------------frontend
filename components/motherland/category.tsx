import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, type Category, type Subcategory } from "@/data/motherland-categories";
import { HERO, PROCON, VIDEOS, type Film, type HeroTitleTone } from "@/data/motherland";
import type { BandTone } from "@/data/motherland-blocks";
import { DEEP, MORE_FILMS } from "@/data/motherland-deep";
import { INTROS, PAGE_BLOCKS } from "@/data/motherland-pages";
import { cn } from "@/lib/utils";
import { CardStack } from "./card-stack";
import { Figures, Timeline } from "./figures";
import { BlockView, IntroFill } from "./blocks";
import { CornerEvents } from "./culture-calendar";
import { CornerScience } from "./launch";
import { Invest } from "./invest";
import { ANCHOR, BAND_Y, COLUMN, pill } from "./kit";
import { Quiz } from "./quiz";
import { RiseText } from "./rise-text";
import { TakeASide } from "./take-a-side";
import { VideoPlayer } from "./video-player";
import { HeroFilm } from "./hero-film";

/*
 * A MOTHERLAND category page: a full-screen film or photograph with the title,
 * one narrow line of figures, then the page's own blocks in the order it wants
 * them read (data/motherland-pages.ts), then its quiz and the other categories.
 */

const HERO_TITLE: Record<HeroTitleTone, string> = {
  gold: "text-signal-orange",
  navy: "text-white",
  green: "text-white",
};

/* A colour wash that gathers at the foot of the film, under the title, and leaves the picture clear above it. */
const HERO_WASH: Record<HeroTitleTone, string> = {
  gold: "from-ml-navy via-ml-navy/45 to-transparent",
  navy: "from-ml-navy via-ml-navy/45 to-transparent",
  green: "from-[#05311d] via-[#05311d]/50 to-transparent",
};

/** Every hero is a film and its title alone, centred low on the screen. */
export function PageHero({ id, name, film, titleTone = "gold" }: { id: string; name: string; film: Film; titleTone?: HeroTitleTone }) {
  return (
    <section aria-labelledby={id} className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-navy">
      <HeroFilm film={film} />
      <div aria-hidden className={cn("absolute inset-0 -z-10 bg-linear-to-t via-40%", HERO_WASH[titleTone])} />
      <div className={cn(COLUMN, "pt-36 pb-[clamp(3.5rem,9svh,6rem)]")}>
        <RiseText as="h1" id={id} now text={name} className={cn("w-full text-center font-ml-display text-[clamp(2.75rem,7vw,7.5rem)] leading-none tracking-[0.015em] uppercase", HERO_TITLE[titleTone])} />
      </div>
    </section>
  );
}

function Opening({ category }: { category: Category }) {
  const deep = DEEP[category.slug];
  return <PageHero id="category-title" name={category.name} film={deep?.film ?? HERO.film} titleTone={deep?.titleTone} />;
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

const RAIL_TONES: BandTone[] = ["paper", "navy", "white"];

/** The rest of a page's parts: full rows of detailed cards. */
function RailBand({ sub, index }: { sub: Subcategory; index: number }) {
  return <BlockView block={{ kind: "cards", id: sub.id, tone: RAIL_TONES[index % RAIL_TONES.length], title: sub.title, lede: sub.lede, cards: sub.stories, columns: sub.stories.length % 4 === 0 ? 4 : 3 }} />;
}

/** The figures at a glance: one narrow gold line, however many there are. */
export function Facts({ facts }: { facts: Category["facts"] }) {
  return (
    <div className="bg-signal-orange text-ml-ink">
      <dl className="ml-rail flex items-center gap-8 overflow-x-auto py-4 lg:justify-between lg:gap-4 lg:py-5">
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
          <span className="font-ml-display text-[clamp(1.4rem,1.9vw,2.25rem)] leading-tight tracking-[0.01em] uppercase">{c.name}</span>
        </Link>
      ))}
    </nav>
  );
}

export function CategoryPage({ category }: { category: Category }) {
  const deep = DEEP[category.slug] ?? {};
  const blocks = PAGE_BLOCKS[category.slug] ?? [];
  const [first, ...rest] = category.subcategories;
  const stacks = blocks.some((b) => b.kind === "part" && b.part === "stack") && first && first.stories.length > 1;
  const blockIds = new Set(blocks.flatMap((b) => ("id" in b ? [b.id] : [])));
  /* A story told in full by a block is not told again in a rail. */
  const rails = (stacks ? rest : category.subcategories).filter((s) => !blockIds.has(s.id));

  return (
    <>
      <Opening category={category} />
      {category.facts.length ? <Facts facts={category.facts} /> : null}
      {INTROS[category.slug] ? <IntroFill text={INTROS[category.slug]} /> : null}
      {blocks.map((block, i) => {
        if (block.kind !== "part") return <BlockView key={"id" in block ? block.id : `${block.kind}-${i}`} block={block} />;
        switch (block.part) {
          case "stack":
            return stacks ? <StackBand key="stack" sub={first} slug={category.slug} /> : null;
          case "figures":
            return deep.figures ? <Figures key="figures" title={deep.figuresTitle ?? "In numbers"} figures={deep.figures} /> : null;
          case "timeline":
            return deep.timeline ? <Timeline key="timeline" title={deep.timelineTitle ?? "Timeline"} moments={deep.timeline} /> : null;
          case "rails":
            return rails.map((s, n) => <RailBand key={s.id} sub={s} index={n} />);
          case "simulator":
            return <Invest key="simulator" />;
          case "debates":
            return (
              <section key="debates" aria-label={category.name} className={cn(BAND_Y, "bg-ml-ground text-ml-ink")}>
                <TakeASide debates={PROCON.debates} className={COLUMN} />
                <div className={cn(COLUMN, "mt-8")}>
                  <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-ml-navy p-6 text-white sm:p-8">
                    <p className="max-w-2xl text-xl leading-snug font-bold text-balance">Want the figures behind the argument? We publish the best and the worst of Bangladesh, with sources.</p>
                    <Link href="/bangladesh/facts#why-we-are-not-doing-best" className={pill.onDark}>
                      Read the Facts about Bangladesh
                    </Link>
                  </div>
                </div>
              </section>
            );
          case "videos":
            return (
              <section key="videos" aria-label={category.name} className={cn(BAND_Y, "bg-ml-navy text-white")}>
                <div className={COLUMN}>
                  <VideoPlayer films={[...MORE_FILMS, ...VIDEOS.films]} credited={false} />
                </div>
              </section>
            );
        }
      })}
      {category.quiz.length ? <Quiz questions={category.quiz} name={category.name} /> : null}
      <MoreCategories current={category.slug} />
      {category.slug === "culture" ? <CornerEvents /> : null}
      {category.slug === "science-tech" ? <CornerScience /> : null}
    </>
  );
}
