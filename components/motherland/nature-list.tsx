import Image from "next/image";
import { NATIVE_LIFE, SEASON_NATURE, WHY_CARE, NATURE_SOURCE } from "@/data/motherland-nature";
import { cn } from "@/lib/utils";
import { photo } from "@/data/motherland-categories";
import { COLUMN } from "./kit";

/*
 * The deep nature content: the native life of Bangladesh in tidy columns, how
 * the six seasons change the land, and why the country must protect it. Light
 * dress: paper and navy, no black.
 */

/** A group of native life — animals, birds, trees, flowers — with its photo and a plain list. */
function LifeBlock({ groupIndex }: { groupIndex: number }) {
  const g = NATIVE_LIFE[groupIndex];
  const pic = photo(g.photo);
  const flip = groupIndex % 2 === 1;
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
      <div className={cn("relative aspect-4/3 overflow-hidden rounded-2xl", flip && "lg:order-last")}>
        <Image src={pic.src} alt={pic.alt} fill sizes="(min-width: 1024px) 40rem, 90vw" className="object-cover" style={{ objectPosition: pic.focus }} />
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-ml-display text-[clamp(1.9rem,3vw,2.75rem)] leading-none tracking-[0.01em] uppercase">{g.title}</h3>
          <p className="max-w-xl text-lg leading-snug text-ml-ink/75">{g.lede}</p>
        </div>
        <dl className="flex flex-col divide-y divide-ml-ink/10">
          {g.items.map((it) => (
            <div key={it.name} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[14rem_1fr]">
              <dt className="font-semibold text-ml-ink">
                {it.name}
                {it.local ? <span className="ml-2 font-normal text-ml-green">· {it.local}</span> : null}
              </dt>
              <dd className="leading-snug text-pretty text-ml-ink/80">{it.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** The whole native-life, seasons and conservation block for the Nature page. */
export function NatureList() {
  return (
    <>
      <section aria-labelledby="native-life" className="scroll-mt-(--ml-header) bg-ml-ground py-20 text-ml-ink sm:py-28" id="native-life">
        <div className={cn(COLUMN, "flex flex-col gap-16")}>
          <div className="flex flex-col gap-4">
            <h2 id="native-life" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
              The native life
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-ml-ink/80 sm:text-xl">
              What lives, grows and blooms across the delta — the creatures and plants you will meet, and the ones the country must not lose.
            </p>
          </div>
          {NATIVE_LIFE.map((g, i) => (
            <LifeBlock key={g.id} groupIndex={i} />
          ))}
          <p className="text-sm text-ml-ink/55">
            Source:{" "}
            <a href={NATURE_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline decoration-ml-ink/30 underline-offset-4 hover:text-ml-green">
              {NATURE_SOURCE.name}
            </a>
            . National symbols are set by the Government of Bangladesh.
          </p>
        </div>
      </section>

      <section aria-labelledby="six-seasons" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28" id="six-seasons">
        <div className={cn(COLUMN, "flex flex-col gap-10")}>
          <div className="flex flex-col gap-4">
            <h2 id="six-seasons" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
              Six seasons, six faces
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Most of the world keeps four seasons. Bangladesh keeps six, and the land wears a different face in each.
            </p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SEASON_NATURE.map((s) => (
              <li key={s.name} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-6 ring-1 ring-white/12">
                <p className="font-ml-display text-[clamp(1.5rem,2.4vw,2rem)] leading-none tracking-[0.01em] text-signal-orange">{s.name}</p>
                <p className="text-sm font-semibold text-white/60">{s.months}</p>
                <p className="leading-snug text-pretty text-white/85">{s.look}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="why-care" className="scroll-mt-(--ml-header) bg-ml-paper py-20 text-ml-ink sm:py-28" id="why-care">
        <div className={cn(COLUMN, "flex flex-col gap-10")}>
          <div className="flex flex-col gap-4">
            <h2 id="why-care" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
              Why we must protect it
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-ml-ink/80 sm:text-xl">
              A land this crowded leaves nature little room. Keeping it alive is not a luxury here — it is how the country survives.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {WHY_CARE.map((c) => (
              <div key={c.title} className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-ml-ink/10 sm:p-8">
                <h3 className="text-xl font-bold text-ml-green">{c.title}</h3>
                <p className="leading-relaxed text-pretty text-ml-ink/80">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
