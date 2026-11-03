import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, type Category, type Story, type Subcategory } from "@/data/motherland-categories";
import { PROCON, VIDEOS } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, COLUMN, LEDE, SectionHead, pill } from "./kit";
import { Quiz } from "./quiz";
import { TakeASide } from "./take-a-side";
import { VideoPlayer } from "./video-player";

/*
 * A MOTHERLAND category page, on the plan of Britannica's category pages:
 * the category and its subcategories, feature blocks of articles, a quiz,
 * then the other categories. The dress is MOTHERLAND's: a full-screen
 * photograph, Anton titles, paper and ink bands, gold buttons.
 */

/** The full-screen opening: the photograph, the category's name, and the way to each subcategory. */
function Opening({ category }: { category: Category }) {
  const { hero, name, lede, subcategories } = category;
  return (
    <section aria-labelledby="category-title" className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-ink text-white">
      <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: hero.focus }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/40 to-black/25" />
      <div className={cn(COLUMN, "flex flex-col items-start gap-6 pt-36 pb-14 lg:pb-20")}>
        <Link href="/bangladesh" className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          MOTHERLAND
        </Link>
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

function Meta({ story, dark }: { story: Story; dark: boolean }) {
  return story.meta ? <p className={cn("text-sm font-semibold", dark ? "text-signal-orange" : "text-ml-green")}>{story.meta}</p> : null;
}

/** One large story with the rest listed beside it, thumbnail and words. */
function Feature({ stories, dark, flip }: { stories: Story[]; dark: boolean; flip: boolean }) {
  const [lead, ...rest] = stories;
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <article className={cn("flex flex-col gap-5 lg:col-span-7", flip && "lg:order-last")}>
        <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-ml-mist">
          <Image src={lead.picture.src} alt={lead.picture.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" style={{ objectPosition: lead.picture.focus }} />
        </div>
        <div className="flex max-w-3xl flex-col gap-2">
          <Meta story={lead} dark={dark} />
          <h3 className="text-3xl leading-tight font-bold text-balance">{lead.title}</h3>
          <p className={cn("text-lg leading-relaxed text-pretty", dark ? "text-white/80" : "text-ml-ink/80")}>{lead.text}</p>
        </div>
      </article>
      <ul className={cn("flex flex-col divide-y lg:col-span-5", dark ? "divide-white/15" : "divide-ml-ink/15")}>
        {rest.map((s) => (
          <li key={s.title} className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-5 py-6 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-ml-mist">
              <Image src={s.picture.src} alt={s.picture.alt} fill sizes="176px" className="object-cover" style={{ objectPosition: s.picture.focus }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Meta story={s} dark={dark} />
              <h3 className="text-xl leading-snug font-bold text-balance">{s.title}</h3>
              <p className={cn("leading-relaxed text-pretty", dark ? "text-white/80" : "text-ml-ink/80")}>{s.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Equal cards, wide for places and tall for portraits; a pair stands side by side, picture beside words. */
function Grid({ stories, dark, tall }: { stories: Story[]; dark: boolean; tall: boolean }) {
  const pair = stories.length === 2;
  return (
    <ul className={cn("grid gap-x-6 gap-y-10", pair ? "lg:grid-cols-2 lg:gap-x-12" : "sm:grid-cols-2", !pair && (stories.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4"))}>
      {stories.map((s) => (
        <li key={s.title} className={cn(pair ? "grid items-center gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "flex flex-col gap-4")}>
          <div className={cn("relative overflow-hidden rounded-2xl bg-ml-mist", tall ? "aspect-4/5" : "aspect-4/3")}>
            <Image src={s.picture.src} alt={s.picture.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover" style={{ objectPosition: s.picture.focus }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Meta story={s} dark={dark} />
            <h3 className="text-xl leading-snug font-bold text-balance">{s.title}</h3>
            <p className={cn("leading-relaxed text-pretty", dark ? "text-white/80" : "text-ml-ink/80")}>{s.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A subcategory's band: paper and ink in turn, as on the landing page. */
export function Band({ sub, index }: { sub: Subcategory; index: number }) {
  const dark = index % 2 === 1;
  return (
    <section id={sub.id} aria-labelledby={`${sub.id}-title`} className={cn(ANCHOR, "py-20 sm:py-28", dark ? "bg-ml-ink text-white" : "bg-ml-ground text-ml-ink")}>
      <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
        <SectionHead id={`${sub.id}-title`} title={sub.title} lede={sub.lede} tone={dark ? "dark" : "light"} />
        {sub.layout === "grid" ? <Grid stories={sub.stories} dark={dark} tall={sub.shape === "tall"} /> : <Feature stories={sub.stories} dark={dark} flip={index === 2} />}
      </div>
    </section>
  );
}

/** The figures at a glance, on the gold band the About section uses. */
export function Facts({ facts }: { facts: Category["facts"] }) {
  return (
    <div className="bg-signal-orange text-ml-ink">
      <dl className={cn(COLUMN, "grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4 lg:divide-x lg:divide-ml-ink/15 lg:py-12")}>
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-1 px-3 text-center">
            <dt className="text-sm font-semibold text-ml-ink/75">{f.label}</dt>
            <dd className="text-2xl font-bold text-balance">{f.value}</dd>
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
    <nav aria-label="More of Bangladesh" className="grid grid-cols-2 bg-ml-ink lg:grid-cols-4">
      {others.map((c) => (
        <Link key={c.slug} href={`/bangladesh/${c.slug}`} className="group relative isolate flex aspect-4/3 items-end overflow-hidden p-5 text-white focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-signal-orange lg:p-7">
          <Image src={c.hero.src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: c.hero.focus }} />
          <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 to-black/10" />
          <span className="font-ml-display text-[clamp(1.5rem,2.8vw,2.75rem)] leading-tight tracking-[0.01em] uppercase">{c.name}</span>
        </Link>
      ))}
    </nav>
  );
}

export function CategoryPage({ category }: { category: Category }) {
  return (
    <>
      <Opening category={category} />
      {category.body === "debates" ? (
        <section aria-label={category.name} className="bg-ml-ground py-20 text-ml-ink sm:py-28">
          <TakeASide debates={PROCON.debates} className={COLUMN} />
        </section>
      ) : null}
      {category.body === "films" ? (
        <section aria-label={category.name} className="bg-ml-ink py-20 text-white sm:py-28">
          <div className={COLUMN}>
            <VideoPlayer films={VIDEOS.films} />
          </div>
        </section>
      ) : null}
      {category.facts.length ? <Facts facts={category.facts} /> : null}
      {category.subcategories.map((s, i) => (
        <Band key={s.id} sub={s} index={i} />
      ))}
      {category.quiz.length ? <Quiz questions={category.quiz} name={category.name} /> : null}
      <MoreCategories current={category.slug} />
    </>
  );
}
