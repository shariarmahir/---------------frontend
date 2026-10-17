"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { MediaReel } from "@/components/showcase/media-reel";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { apps, type AppId, type KandariApp } from "@/data/apps";
import { cn } from "@/lib/utils";

/*
 * Download our apps, laid out like banglalink.net's app block: a large
 * preview on the left, the apps as an accordion on the right. Opening an
 * app swaps the preview. Each preview is a solid field from the palette
 * (gold for SWASTI, navy for the media) with the name, the store badges and
 * what can be done today, beside a live look at the app.
 */

const FIELD: Record<AppId, { panel: string; muted: string; button: string }> = {
  swasti: { panel: "bg-signal-orange text-text-primary", muted: "text-text-primary/80", button: btn.navy },
  media: { panel: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset", muted: "text-white/80", button: btn.gold },
};

const isBangla = (s: string) => /[ঀ-৿]/.test(s);

export function AppsSection() {
  const [open, setOpen] = useState<AppId>(apps[0].id);
  const baseId = useId();

  return (
    <section id="apps" aria-label="Download our apps" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        title="Kandari-Lab in Your Pocket"
        lead="Two apps, one for your health and one for your skills. SWASTI brings a doctor’s first opinion in Bangla to any phone; শিক্ষিতদের মিডিয়া turns what you can do into verified, fairly paid work. Both are on their way to the stores, and you can start today."
      />

      <div className="story-reveal grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
        {/* The previews share one grid cell and cross-fade, so the panel keeps the taller one's height. */}
        <div className="grid">
          {apps.map((app) => (
            <Preview key={app.id} app={app} active={app.id === open} />
          ))}
        </div>

        <ul className="border-t border-white/12">
          {apps.map((app) => (
            <AccordionItem
              key={app.id}
              app={app}
              open={app.id === open}
              onOpen={() => setOpen(app.id)}
              ids={{ button: `${baseId}-${app.id}-button`, panel: `${baseId}-${app.id}-panel` }}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Preview({ app, active }: { app: KandariApp; active: boolean }) {
  const field = FIELD[app.id];
  return (
    <article
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "grid overflow-hidden rounded-3xl [grid-area:1/1] sm:grid-cols-2",
        "transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none scale-[0.985] opacity-0",
        field.panel,
      )}
    >
      <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
        <div>
          <p className={cn("font-sans tabular-nums text-xs font-semibold", field.muted)}>{app.kind} app</p>
          {/* Not a heading: the accordion beside it already names the app. */}
          <p
            // Bangla conjuncts need real line height when the name wraps; Latin sits tight.
            className={cn(
              "mt-2 font-extrabold tracking-tight",
              isBangla(app.name)
                ? "font-bengali text-4xl leading-[1.2] xl:text-5xl"
                : "font-grotesk text-5xl leading-none",
            )}
          >
            {app.name}
          </p>
          <p className={cn("mt-3 font-grotesk text-lg leading-snug font-bold", field.muted)}>{app.tagline}</p>
        </div>

        <ul aria-label={`Get ${app.altName}`} className="flex flex-wrap gap-3">
          <li>
            <StoreBadge store="google-play" href={app.stores.googlePlay} />
          </li>
          <li>
            <StoreBadge store="app-store" href={app.stores.appStore} />
          </li>
        </ul>

        <Link href={app.action.href} className={cn(field.button, "self-start py-3 sm:py-3")}>
          {app.action.label}
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      </div>

      <div className="relative min-h-72 sm:min-h-full">
        {app.preview.kind === "image" ? (
          <Image
            src={app.preview.src}
            alt={app.preview.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        ) : (
          // The poster card's film; its classes run under .ms-root and stop when the preview is hidden.
          <div data-paused={!active} className="ms-root absolute inset-0 bg-text-primary">
            <MediaReel />
          </div>
        )}
      </div>
    </article>
  );
}

function AccordionItem({
  app,
  open,
  onOpen,
  ids,
}: {
  app: KandariApp;
  open: boolean;
  onOpen: () => void;
  ids: { button: string; panel: string };
}) {
  return (
    <li className="border-b border-white/12">
      <h3>
        <button
          id={ids.button}
          type="button"
          aria-expanded={open}
          aria-controls={ids.panel}
          onClick={onOpen}
          className="group flex w-full items-center justify-between gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-orange"
        >
          <span>
            <span
              className={cn(
                "block text-2xl leading-tight font-bold transition-colors duration-300",
                isBangla(app.name) ? "font-bengali" : "font-grotesk",
                open ? "text-signal-orange" : "text-white group-hover:text-signal-orange",
              )}
            >
              {app.name}
            </span>
            <span className={cn("mt-1 block text-sm text-white/65", isBangla(app.altName) ? "font-bengali" : "font-grotesk")}>
              {app.altName} · {app.kind}
            </span>
          </span>
          <Icon
            name="expand_more"
            className={cn(
              "shrink-0 text-3xl text-white/65 transition-transform duration-300 motion-reduce:transition-none",
              open && "rotate-180 text-signal-orange",
            )}
          />
        </button>
      </h3>

      {/* Height animates through grid rows, 0fr to 1fr, so no measuring is needed. */}
      <div
        id={ids.panel}
        role="region"
        aria-labelledby={ids.button}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-6">
            <p className="text-sm leading-relaxed text-white/80">{app.summary}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {app.features.map((f) => (
                <li key={f} className="rounded-full px-3 py-1 font-grotesk text-xs font-semibold text-white/80 ring-1 ring-white/15">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 font-sans tabular-nums text-xs font-semibold tracking-wide text-white/65">
              <span aria-hidden className="size-1.5 rounded-full bg-signal-orange" />
              {app.stage}
            </p>
          </div>
        </div>
      </div>
    </li>
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
 * A store badge. With a listing URL it is a link out; without one it is a
 * plain, dimmed "Coming soon" badge, never a dead link.
 */
function StoreBadge({ store, href }: { store: keyof typeof STORES; href?: string }) {
  const s = STORES[store];
  const face = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden className="size-6 shrink-0 fill-current">
        {s.glyph}
      </svg>
      <span className="leading-none">
        <span className="block text-xs font-medium tracking-wide">{href ? s.live : "Coming soon to"}</span>
        <span className="mt-0.5 block font-grotesk text-base font-semibold">{s.name}</span>
      </span>
    </>
  );
  const shape = "inline-flex h-13 items-center gap-2.5 rounded-xl bg-black px-4 text-white ring-1 ring-white/15";

  if (!href) {
    return (
      <span className={cn(shape, "cursor-default opacity-80")}>
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
        "transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-text-primary motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
      )}
    >
      {face}
    </a>
  );
}
