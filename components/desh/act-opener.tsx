import { StoryPhoto } from "@/components/bangladesh/story-photo";
import type { Photo } from "@/data/bangladesh";
import { ACTS } from "@/data/desh";

/**
 * Chapter opener between the page's four acts: a full-bleed photograph,
 * the act numeral in gold and its one-line promise. Its id is the act's
 * anchor, so the hero and the header nav land here.
 */
export function ActOpener({ act, photo }: { act: (typeof ACTS)[number]["id"]; photo: Photo }) {
  const a = ACTS.find((x) => x.id === act)!;
  return (
    <section id={a.id} aria-labelledby={`${a.id}-title`} className="relative isolate flex min-h-[22rem] scroll-mt-40 items-end overflow-hidden bg-bdgreen-950 sm:min-h-[26rem]">
      <StoryPhoto photo={photo} sizes="100vw" drift className="absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-bdgreen-950 via-bdgreen-950/65 to-bdgreen-950/10" />
      <div className="story-reveal mx-auto flex w-full max-w-7xl items-end gap-5 px-gutter-x pt-24 pb-10 sm:gap-8">
        <span aria-hidden className="font-bengali text-[5.5rem] leading-[0.8] font-bold text-signal-orange [text-shadow:0_0_36px_rgb(228_176_39/0.55)] sm:text-[8rem]">
          {a.n}
        </span>
        <div className="pb-1">
          <p className="font-bengali text-sm font-semibold text-signal-orange">অধ্যায় {a.n} · {a.label}</p>
          <h2 id={`${a.id}-title`} className="mt-1 font-bengali text-3xl leading-tight font-bold text-balance text-white sm:text-5xl">
            {a.title}
          </h2>
          <p className="mt-2 max-w-2xl font-bengali text-base leading-relaxed text-emerald-50/85 sm:text-lg">{a.line}</p>
        </div>
      </div>
    </section>
  );
}
