"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { GUIDES } from "@/data/motherland-travel";
import { cn } from "@/lib/utils";

const readGuide = () => {
  const m = /^#prepare-([\w-]+)$/.exec(window.location.hash);
  return m && GUIDES.some((g) => g.id === m[1]) ? m[1] : null;
};

const useHashGuide = () =>
  useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    readGuide,
    () => null,
  );

const choose = (id: string) => {
  window.history.replaceState(null, "", `#prepare-${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};

/**
 * Know before you go, one landscape at a time: a big photograph beside what
 * to watch for and what to carry. The map's "What you need for" link opens
 * the right one by the address.
 */
export function GuideTabs() {
  const root = useRef<HTMLDivElement>(null);
  const hash = useHashGuide();
  const guide = GUIDES.find((g) => g.id === hash) ?? GUIDES[0];

  // Arriving from the map: bring the guide into view.
  useEffect(() => {
    if (!hash || !root.current) return;
    const { top, bottom } = root.current.getBoundingClientRect();
    if (bottom < 200 || top > window.innerHeight - 200) root.current.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <div ref={root} className="flex scroll-mt-[calc(var(--ml-header)+1rem)] flex-col gap-6">
      <div role="group" aria-label="Choose a landscape" className="ml-rail -mx-6 flex gap-2 overflow-x-auto sm:-mx-10 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0!">
        {GUIDES.map((g) => (
          <button key={g.id} type="button" aria-pressed={g.id === guide.id} onClick={() => choose(g.id)} className={cn("min-h-12 shrink-0 rounded-full px-6 font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green", g.id === guide.id ? "bg-ml-ink text-white" : "bg-ml-ground text-ml-ink hover:bg-ml-mist")}>
            {g.title}
          </button>
        ))}
      </div>
      <article className="grid overflow-hidden rounded-2xl bg-ml-ground lg:grid-cols-[47fr_53fr]">
        <div className="relative aspect-video lg:aspect-auto lg:min-h-136">
          <Image key={guide.id} src={guide.picture.src} alt={guide.picture.alt} fill sizes="(min-width: 1024px) 47vw, 100vw" className="object-cover" style={{ objectPosition: guide.picture.focus }} />
        </div>
        <div className="grid content-center gap-7 p-6 sm:grid-cols-2 sm:p-10 xl:p-12">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <h3 className="font-ml-sans font-extrabold text-[clamp(2.25rem,3.4vw,3.5rem)] leading-[1.05] tracking-[-0.03em]">{guide.title}</h3>
            <p className="max-w-3xl text-lg leading-relaxed text-ml-ink/85">{guide.lede}</p>
            <p className="font-semibold text-ml-green">{guide.best}</p>
          </div>
          <div>
            <h4 className="text-base font-bold">Watch out for</h4>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ml-ink/85 marker:text-ml-red">
              {guide.watch.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-base font-bold">Carry</h4>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ml-ink/85 marker:text-ml-green">
              {guide.carry.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}
