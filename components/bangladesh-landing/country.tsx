import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { chapterById, type Photo } from "@/data/bangladesh";
import { commonsPhotos } from "@/data/bangladesh-photos";
import { ChapterLink, LINK, Section } from "./kit";
import { LandingRail } from "./landing-rail";

/** A credited Commons photo with its alt text in English. */
function photo(key: string, alt: string): Photo {
  const p = commonsPhotos[key];
  if (!p?.credit) throw new Error(`Bangladesh: uncredited photo "${key}"`);
  return { ...p, alt };
}

/* History, nature, culture and achievement, in a walk from 1952 to the Padma Bridge. */
const MOMENTS: { title: string; body: string; photo: Photo }[] = [
  {
    title: "1952, the Language Movement",
    body: "Students in Dhaka gave their lives on 21 February for Bangla as a state language. The Shaheed Minar keeps their memory.",
    photo: photo("shaheedminar", "The Central Shaheed Minar in Dhaka"),
  },
  {
    title: "1971, a nation won",
    body: "Independence declared on 26 March; victory on 16 December, after nine months of war.",
    photo: photo("surrender1971", "A sculpture of the surrender of 16 December 1971"),
  },
  {
    title: "The Sundarbans",
    body: "The largest mangrove forest on earth, shared with India: home of the Royal Bengal tiger and a UNESCO World Heritage Site since 1997.",
    photo: photo("sundarbans", "Dense mangrove forest of the Sundarbans at high tide"),
  },
  {
    title: "Cox's Bazar",
    body: "About 120 km of unbroken sand on the Bay of Bengal, one of the longest natural sea beaches in the world.",
    photo: photo("coxsbazar", "Sunset over the beach at Cox's Bazar, people reflected on the wet sand"),
  },
  {
    title: "Tanguar Haor",
    body: "A Ramsar wetland in Sunamganj: a sea of water in the monsoon, a gathering of migratory birds in winter.",
    photo: photo("haor", "A boat on the wide water of Tanguar Haor"),
  },
  {
    title: "Pohela Boishakh",
    body: "The Bangla New Year belongs to everyone. Its Mangal Shobhajatra procession is on UNESCO's intangible heritage list since 2016.",
    photo: photo("boishakh", "Giant painted masks in the Pohela Boishakh procession"),
  },
  {
    title: "Rickshaw art of Dhaka",
    body: "A moving gallery on the city's streets, inscribed by UNESCO as intangible heritage in 2023.",
    photo: photo("rickshaw", "A Dhaka rickshaw decorated with rickshaw art"),
  },
  {
    title: "2022, the Padma Bridge",
    body: "6.15 km over one of the world's mightiest rivers, opened on 25 June 2022 and built with the country's own funds.",
    photo: photo("padmabridge", "The Padma Bridge stretching across the river"),
  },
];

/** 4 · The country we love: a rail of credited photo cards from 1952 to the Padma Bridge. */
export function LandingCountry() {
  const c = chapterById("history");
  return (
    <Section id="country" title={c.title} lede={c.lede} action={<ChapterLink chapter="history" />}>
      <LandingRail label="Moments, places and traditions of Bangladesh">
      {MOMENTS.map((m) => (
        <li
          key={m.title}
          className="flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] 2xl:w-[calc((100%-4.5rem)/4)]"
        >
          <div className="relative aspect-4/3 w-full">
            <Image
              src={m.photo.src}
              alt={m.photo.alt}
              fill
              sizes="(min-width: 1536px) 24vw, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 82vw"
              className="object-cover"
              style={{ objectPosition: m.photo.focus ?? "50% 50%" }}
            />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-grotesk text-xl leading-snug font-bold text-signal-orange">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{m.body}</p>
            <Credit photo={m.photo} />
          </div>
        </li>
      ))}
      </LandingRail>
    </Section>
  );
}

function Credit({ photo: { credit } }: { photo: Photo }) {
  if (!credit) return null;
  return (
    <p className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-5 text-xs text-white/65">
      <Icon name="photo_camera" className="text-sm! text-signal-orange" />
      <span>Photo: {credit.author}</span>
      <span aria-hidden>·</span>
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
          {credit.license}
        </a>
      ) : (
        <span>{credit.license}</span>
      )}
      <span aria-hidden>·</span>
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
        Commons
      </a>
    </p>
  );
}
