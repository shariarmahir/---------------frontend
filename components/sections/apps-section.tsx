"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { apps, type AppId, type KandariApp } from "@/data/apps";
import { cn } from "@/lib/utils";

/*
 * Download our apps, one wide banner per app (Mahir, 2026-10-21, cloned
 * from a delivery app's download banner): on a solid field, "Download the
 * free" over the app's name, its tagline and the store badges; the app's
 * photograph standing on the banner's floor in the middle; and a phone on
 * the right that rises out of the top edge with a screen of the app.
 * No section title or lead: the banners say it.
 *
 * The banners share one place and take turns every 8 s (Mahir, 2026-10-21),
 * under a row of coloured dots with no words. The live dot stretches into a
 * bar that fills over the dwell, and that fill's own animationend turns the
 * page, so pausing it (pointer over, focus inside, scrolled away) pauses the
 * turn too. Under reduced motion the fill stands still but still times out,
 * and the banners swap without a fade.
 *
 * The phone screens are drawn in code from the site's own colours, and
 * their readings are samples, so the screen says "Sample screen". The round
 * gold arrow on the screen is the one thing to do today (join the beta,
 * open on the web), since neither app is in a store yet.
 */

const FIELD: Record<AppId, string> = {
  swasti: "bg-cobalt",
  media: "bg-bdnavy-900 ring-1 ring-white/12 ring-inset",
};

/** The photograph standing in the middle of each banner. */
const STAGE: Record<AppId, { src: string; alt: string; position: string }> = {
  swasti: { src: "/sections/device.png", alt: "The আপনজন band on a wrist, its pulse and SpO₂ readings floating above it", position: "55% 45%" },
  media: { src: "/media/kantha-full.webp", alt: "A finished nakshi kantha, the kind of work shared on শিক্ষিতদের মিডিয়া", position: "50% 50%" },
};

const isBangla = (s: string) => /[ঀ-৿]/.test(s);

/** Each banner's dot, in a colour that holds on the black ground. */
const DOT: Record<AppId, string> = {
  swasti: "var(--color-signal-orange)",
  media: "var(--color-bdnavy-300)",
};

export function AppsSection() {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [seen, setSeen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const paused = hover || focus || !seen;

  // Only turn while the banners are on screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e?.isIntersecting ?? false), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const next = () => setIndex((i) => (i + 1) % apps.length);

  return (
    <section id="apps" aria-label="Download our apps" aria-roledescription="carousel" className="section-band">
      {/* Room above the banner for its phone to rise into (a small phone on narrow screens). */}
      <div className="mx-auto max-w-384 px-gutter-x pt-4 lg:pt-24">
        <div
          ref={stageRef}
          data-paused={paused}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setFocus(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocus(false)}
          className="story-reveal"
        >
          {/* Both banners stand in the same cell, so the place keeps the taller one's height. */}
          <div className="grid">
            {apps.map((app, i) => (
              <Banner key={app.id} app={app} active={i === index} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 lg:mt-8">
            {apps.map((app, i) => {
              const active = i === index;
              return (
                <button
                  key={app.id}
                  type="button"
                  aria-label={`Show ${app.altName}`}
                  aria-current={active}
                  onClick={() => setIndex(i)}
                  style={{ "--dot": DOT[app.id] } as CSSProperties}
                  className="group/dot grid h-11 min-w-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "relative block h-2.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      active ? "w-12 bg-(--dot)/30" : "w-2.5 bg-(--dot) group-hover/dot:scale-125",
                    )}
                  >
                    {active ? (
                      // Restarts on every turn (the key); its end turns the page.
                      <span key={index} aria-hidden onAnimationEnd={next} className="app-dot-fill absolute inset-0 rounded-full bg-(--dot)" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Banner({ app, active }: { app: KandariApp; active: boolean }) {
  const stage = STAGE[app.id];
  return (
    <article
      aria-labelledby={`app-${app.id}-name`}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        // Taller as the column widens, so the banner keeps its proportion on a desktop or TV.
        "relative col-start-1 row-start-1 rounded-[2rem] text-white lg:h-76 xl:h-80 2xl:h-88",
        "transition-[opacity,translate,visibility] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        active ? "z-10 opacity-100" : "invisible translate-y-3 opacity-0",
        FIELD[app.id],
      )}
    >
      {/* Below lg the words keep clear of the small phone at the top right: on a
          phone by standing taller than it; from sm, where the badges' row ends well
          left of the phone, only by the right padding. */}
      <div className="relative z-10 flex flex-col gap-4 p-5 sm:gap-5 sm:p-10 lg:w-[38%] lg:justify-center lg:py-0 lg:pr-0 lg:pl-10 lg:h-full xl:pl-14">
        <div className="max-lg:min-h-44 max-lg:pr-27 sm:max-lg:min-h-0 sm:max-lg:pr-32 md:max-lg:pr-40">
          <p className="font-grotesk text-base font-semibold text-white/85 sm:text-xl 2xl:text-2xl">Download the free</p>
          <h3
            id={`app-${app.id}-name`}
            // Bangla conjuncts need real line height; Latin sits tight.
            className={cn(
              "mt-1 font-extrabold tracking-tight text-white",
              isBangla(app.name)
                ? "font-bengali text-4xl leading-[1.25] sm:text-[2.75rem] 2xl:text-[3.25rem]"
                : "font-grotesk text-4xl leading-none sm:text-5xl 2xl:text-6xl",
            )}
          >
            {app.name} {isBangla(app.name) ? null : "App"}
          </h3>
          <p className="mt-3 max-w-xs font-sans text-sm leading-snug text-white/80 2xl:max-w-sm 2xl:text-base">{app.tagline}</p>
        </div>

        <ul aria-label={`Get ${app.altName}`} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <li>
            <StoreBadge store="google-play" href={app.stores.googlePlay} />
          </li>
          <li>
            <StoreBadge store="app-store" href={app.stores.appStore} />
          </li>
        </ul>

        {/* Narrow screens show the phone too small to tap, so its arrow's action is spelled out here. */}
        <Link href={app.action.href} className="-my-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md font-grotesk text-sm font-bold text-signal-orange underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none lg:hidden">
          {app.action.label}
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      </div>

      {/* The app's photograph, standing on the banner's floor; from lg it ends at
          least 2.5rem short of the phone (5% + 12.5rem from the right), so the two
          never crowd each other on a small laptop. */}
      <div className="relative mx-5 mb-5 aspect-[12/5] overflow-hidden rounded-2xl sm:mx-10 sm:mb-7 lg:absolute lg:inset-y-auto lg:right-[max(27%,5%_+_15rem)] lg:-bottom-6 lg:left-[40%] lg:m-0 lg:aspect-auto lg:h-[88%]">
        <div className="app-stage relative size-full overflow-hidden rounded-2xl shadow-[0_24px_40px_-18px_rgb(0_0_0/0.7)] ring-4 ring-white/15">
          <Image src={stage.src} alt={stage.alt} fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover" style={{ objectPosition: stage.position }} />
        </div>
      </div>

      {/* The phone, rising out of the banner's top edge: on narrow screens a
          small one over the top right corner, beside the words. */}
      <div className="pointer-events-none absolute -top-5 right-4 max-lg:origin-top-right max-lg:scale-[0.5] sm:right-8 sm:max-lg:scale-[0.62] md:max-lg:scale-[0.7] lg:top-auto lg:right-[5%] lg:-bottom-6 2xl:origin-bottom-right 2xl:scale-[1.12]">
        <div className="app-float lg:pointer-events-auto">
          <Phone app={app} />
        </div>
      </div>
    </article>
  );
}

/** A phone: black bezel, a dynamic island, and a screen of the app in the site's colours. */
function Phone({ app }: { app: KandariApp }) {
  return (
    <div className="relative h-100 w-50 rounded-[2.5rem] bg-black p-2.5 shadow-[0_40px_60px_-24px_rgb(0_0_0/0.85)] ring-1 ring-white/25">
      <span aria-hidden className="absolute top-4.5 left-1/2 z-20 h-5 w-18 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative flex size-full flex-col overflow-hidden rounded-[2rem] bg-bdnavy-900 px-3.5 pt-11 pb-3">
        {app.id === "swasti" ? <SwastiScreen /> : <MediaScreen />}

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-sans text-xs text-white/55">Sample screen</p>
          {/* The one thing to do today, while the stores wait. Below lg the
              phone is drawn too small to tap, so the arrow is only a picture
              and the text link under the badges does the job. */}
          <span aria-hidden className="grid size-10 place-items-center rounded-full bg-signal-orange text-text-primary shadow-lg lg:hidden">
            <Icon name="north_east" className="text-xl!" />
          </span>
          <Link
            href={app.action.href}
            aria-label={`${app.action.label}: ${app.altName}`}
            className="hidden size-10 place-items-center rounded-full bg-signal-orange text-text-primary shadow-lg transition-transform lg:grid duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
          >
            <Icon name="north_east" className="text-xl!" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScreenHead({ hello, name, icon }: { hello: string; name: ReactNode; icon: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-bengali text-xs leading-tight text-white/70">{hello}</p>
        <p className="mt-0.5 font-grotesk text-sm leading-tight font-bold text-white">{name}</p>
      </div>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-signal-orange text-text-primary">
        <Icon name={icon} className="text-lg!" />
      </span>
    </div>
  );
}

function Tile({ label, value, field = "bg-cobalt" }: { label: string; value: ReactNode; field?: string }) {
  return (
    <div className={cn("rounded-2xl px-3 py-2.5", field)}>
      <p className="font-sans text-xs leading-tight text-white/75">{label}</p>
      <p className="mt-1 font-grotesk text-base leading-none font-extrabold text-white">{value}</p>
    </div>
  );
}

/** Two heartbeats, on a 220×70 box. */
const ECG = "M0 38 H52 L60 38 L66 26 L72 38 H84 L91 8 L99 62 L107 38 H124 L130 30 L136 38 H150 L157 10 L165 60 L173 38 H220";

function SwastiScreen() {
  return (
    <>
      <ScreenHead hello="শুভ সকাল," name={<>SWASTI <span className="font-bengali">স্বস্তি</span></>} icon="mic" />

      <div className="mt-3 rounded-2xl bg-cobalt px-3 pt-2.5 pb-1.5">
        <div className="flex items-center justify-between">
          <p className="font-sans text-xs text-white/75">Heart rate</p>
          <Icon name="favorite" className="text-base! text-signal-orange" />
        </div>
        <p className="mt-1 font-grotesk text-2xl leading-none font-extrabold text-white">
          74 <span className="text-xs font-bold text-white/75">bpm</span>
        </p>
        <svg viewBox="0 0 220 70" aria-hidden className="mt-1 h-10 w-full">
          <path d={ECG} pathLength={1} fill="none" stroke="var(--color-signal-orange)" strokeOpacity="0.3" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d={ECG} pathLength={1} className="spot-ecg" fill="none" stroke="var(--color-signal-orange)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      <p className="mt-3 flex items-center gap-1.5 self-start rounded-full bg-national-crimson px-2.5 py-1 font-grotesk text-xs font-bold text-white">
        <Icon name="emergency" className="text-sm!" />
        2-hour alert
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile label="SpO₂" value="98%" />
        <Tile label="Stress" value="Low" />
      </div>
    </>
  );
}

function MediaScreen() {
  return (
    <>
      <ScreenHead hello="স্বাগতম," name={<span className="font-bengali">শিক্ষিতদের মিডিয়া</span>} icon="person" />

      <div className="relative mt-3 h-30 overflow-hidden rounded-2xl">
        <Image src="/media/kantha-closeup.webp" alt="" fill sizes="200px" className="object-cover" />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-signal-orange px-2 py-0.5 font-grotesk text-xs font-bold text-text-primary">
          <Icon name="verified" className="text-sm!" />
          Verified
        </span>
      </div>
      <p className="mt-2 font-grotesk text-sm leading-tight font-bold text-white">Nakshi kantha</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile label="Rating" value="4 / 5" />
        <Tile label="Checks" value="12" />
      </div>
    </>
  );
}

const STORES = {
  "google-play": {
    name: "Google Play",
    live: "Get it on",
    glyph: <path d="M4.6 2.7 13.9 12l-9.3 9.3a1.3 1.3 0 0 1-.6-1.1V3.8c0-.5.2-.9.6-1.1Zm10.4 10.4 2.4 2.4-10.5 6 8.1-8.4Zm3.7-3.6 2.6 1.5c.9.5.9 1.6 0 2.1l-2.6 1.5-2.7-2.6 2.7-2.5ZM6.9 2.5l10.5 6L15 10.9 6.9 2.5Z" />,
  },
  "app-store": {
    name: "App Store",
    live: "Download on the",
    glyph: (
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.7ZM14.2 5.8c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z" />
    ),
  },
} as const;

/**
 * A store badge, black as the stores draw them. With a listing URL it is a
 * link out; without one it is a plain "Coming soon" badge, never a dead link.
 */
function StoreBadge({ store, href }: { store: keyof typeof STORES; href?: string }) {
  const s = STORES[store];
  const face = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden className="size-5.5 shrink-0 fill-current">
        {s.glyph}
      </svg>
      <span className="leading-none">
        <span className="block text-xs font-medium tracking-wide max-sm:tracking-normal">{href ? s.live : "Coming soon to"}</span>
        <span className="mt-0.5 block font-grotesk text-sm font-semibold">{s.name}</span>
      </span>
    </>
  );
  // Below sm the two badges share one row as equal halves.
  const shape = "inline-flex h-11 items-center gap-2 rounded-lg bg-black px-3.5 text-white ring-1 ring-white/20 max-sm:w-full max-sm:gap-1.5 max-sm:px-2.5 max-sm:whitespace-nowrap";

  if (!href) {
    return (
      <span className={cn(shape, "cursor-default")}>
        {face}
        <span className="sr-only"> (not yet available)</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        shape,
        "transition-[translate] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
      )}
    >
      {face}
    </a>
  );
}
