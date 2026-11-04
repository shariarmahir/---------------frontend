import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, type Category, type Subcategory } from "@/data/motherland-categories";
import { PROCON, VIDEOS } from "@/data/motherland";
import type { BandTone, Block } from "@/data/motherland-blocks";
import { DEEP, MORE_FILMS } from "@/data/motherland-deep";
import { INTROS, PAGE_BLOCKS } from "@/data/motherland-pages";
import { cn } from "@/lib/utils";
import { CardStack } from "./card-stack";
import { Figures, Timeline } from "./figures";
import { BlockView, IntroFill } from "./blocks";
import { CornerEvents } from "./culture-calendar";
import { CornerScience } from "./launch";
import { Invest } from "./invest";
import { ANCHOR, BAND_Y, COLUMN, LEDE, pill } from "./kit";
import { Parallax } from "./parallax";
import { Quiz } from "./quiz";
import { RiseText } from "./rise-text";
import { TakeASide } from "./take-a-side";
import { VideoPlayer } from "./video-player";
import { WeekFilm } from "./week-film";

/*
 * A MOTHERLAND category page: a full-screen film or photograph with the title,
 * one narrow line of figures, then the page's own blocks in the order it wants
 * them read (data/motherland-pages.ts), then its quiz and the other categories.
 */

/** The full-screen opening every category page shares: a film or a slowly drifting photograph, the title, its suggestions. */
export function PageHero({ id, name, lede, media, parts }: { id: string; name: string; lede: string; media: ReactNode; parts: { id: string; title: string }[] }) {
  return (
    <section aria-labelledby={id} className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-navy text-white">
      <Parallax from="start" lift={14}>{media}</Parallax>
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ml-navy/95 via-ml-navy/35 to-ml-navy/30" />
      <div className={cn(COLUMN, "flex flex-col items-start gap-5 pt-36 pb-12 lg:pb-16")}>
        <RiseText as="h1" id={id} now text={name} className="w-full font-ml-display text-[clamp(3.5rem,11.5vw,11rem)] leading-[0.98] tracking-[0.01em] uppercase" />
        <p className={cn(LEDE, "ml-hero-one text-white/90")}>{lede}</p>
        {parts.length ? (
          <nav aria-label={`Browse ${name}`} className="ml-hero-two">
            <ul className="flex flex-wrap gap-3">
              {parts.slice(0, 4).map((s, i) => (
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

function Opening({ category, parts }: { category: Category; parts: { id: string; title: string }[] }) {
  const { hero, name, lede } = category;
  const film = DEEP[category.slug]?.film;
  return <PageHero id="category-title" name={name} lede={lede} parts={parts} media={film ? <WeekFilm film={film} /> : <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="ml-drift object-cover" style={{ objectPosition: hero.focus }} />} />;
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

/** The parts a visitor can jump to from the opening: what the page shows, in order. */
function partsOf(category: Category, blocks: Block[]) {
  const out: { id: string; title: string }[] = [];
  for (const b of blocks) {
    if (b.kind !== "moment" && "title" in b && b.title && "id" in b) out.push({ id: b.id, title: b.title });
    if (b.kind === "part" && b.part === "stack" && category.subcategories[0]) out.push({ id: category.subcategories[0].id, title: category.subcategories[0].title });
    if (b.kind === "tool" && b.tool === "converter") out.push({ id: "converter", title: "Convert your money" });
    if (b.kind === "tool" && b.tool === "calendar") out.push({ id: "calendar", title: "What's on" });
    if (b.kind === "tool" && b.tool === "connect") out.push({ id: "connect", title: "Connect for details" });
  }
  return out;
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
      <Opening category={category} parts={partsOf(category, blocks)} />
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
                      Read the Facts of Bangladesh
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
