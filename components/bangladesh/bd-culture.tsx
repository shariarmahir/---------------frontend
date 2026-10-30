import { Card, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { cultureHighlights, musicTraditions, unescoHeritage } from "@/data/bangladesh-history";
import { PhotoCredit, StoryPhoto } from "./story-photo";

/** A small heading inside a section. */
const SUBHEAD = "font-grotesk text-xl font-bold text-white";

/** Songs, festivals and crafts: the UNESCO list first, then the music, then the year's festivals and the work of hands. */
export function BdCulture() {
  return (
    <Section
      id="culture"
      title="Songs, festivals and the work of our hands"
      lede="Six traditions of Bangladesh are now on UNESCO's list of the Intangible Cultural Heritage of Humanity."
    >
      <h3 className={SUBHEAD}>On UNESCO&rsquo;s list</h3>
      <ol className="mt-5 grid grid-cols-1 gap-4 min-[30rem]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {unescoHeritage.map((u) => (
          <li key={u.title} className="story-reveal flex">
            <Card className="flex w-full flex-col overflow-hidden p-0 sm:p-0">
              {u.photo ? (
                <StoryPhoto photo={u.photo} sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw" className="aspect-4/3" hideCredit />
              ) : (
                <div className="grid aspect-4/3 place-items-center bg-cobalt">
                  <Icon name={u.icon} className="text-5xl! text-signal-orange" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm text-white/80 tabular-nums">Inscribed {u.year}</p>
                <h4 className="mt-1 text-base leading-snug font-semibold text-white">{u.title}</h4>
                {u.photo && <PhotoCredit photo={u.photo} className="mt-auto pt-4" />}
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-12">
        <Card surface="ink" className="story-reveal lg:col-span-5">
          <h3 className={SUBHEAD}>
            <Icon name="music_note" className="mr-2 align-[-0.2em] text-2xl! text-signal-orange" />
            The music of Bengal
          </h3>
          <ul className="mt-4 divide-y divide-white/12">
            {musicTraditions.map((m) => (
              <li key={m.name} className="py-4 last:pb-0">
                <p className="text-lg font-semibold text-white">{m.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{m.body}</p>
              </li>
            ))}
          </ul>
        </Card>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {cultureHighlights.map((c, i) => (
            <li key={c.title} className="story-reveal flex">
              <Card surface={(Math.floor(i / 2) + i) % 2 ? "cobalt" : "navy"} className="w-full p-6 sm:p-6">
                <Icon name={c.icon} className="text-3xl! text-signal-orange" />
                <h3 className="mt-3 font-grotesk text-lg font-bold text-white">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{c.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
