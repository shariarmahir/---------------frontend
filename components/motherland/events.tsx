"use client";

import { useEffect, useRef, useState } from "react";
import { EVENTS, GHOSTS, type CultureEvent, type EventKind } from "@/data/motherland-culture-events";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";

/*
 * The culture events board: a filterable list of the country's real, recurring
 * cultural occasions. Picking a kind narrows the list; opening an event raises
 * a popup with its details and the one way onward — the official page, or a
 * note that tickets are at the venue. No checkout is handled here.
 */

const KINDS: (EventKind | "All")[] = ["All", "Festival", "Theatre", "Music", "Books", "Film"];

/** The popup for one event: its details and an outbound link, closable by Escape, backdrop or the button. */
function EventDialog({ event, onClose }: { event: CultureEvent; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div role="presentation" onClick={onClose} className="ml-pop fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-ml-paper p-7 text-ml-ink shadow-[0_32px_64px_-20px_rgb(0_0_0/0.5)] outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-signal-orange px-3 py-1 text-sm font-semibold text-ml-ink">{event.kind}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-ml-ink/60 transition-colors hover:text-ml-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        <h3 id="event-dialog-title" className="mt-4 font-ml-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none tracking-[0.01em] uppercase">
          {event.title}
        </h3>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-semibold text-ml-ink/55">Where</dt>
          <dd>
            {event.venue}, {event.city}
          </dd>
          <dt className="font-semibold text-ml-ink/55">When</dt>
          <dd>{event.when}</dd>
        </dl>
        <p className="mt-4 leading-relaxed text-pretty text-ml-ink/85">{event.about}</p>
        <div className="mt-6">
          {event.ticket ? (
            <a
              href={event.ticket}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ml-green px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-ml-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ml-green"
            >
              Get tickets & details
              <span className="sr-only"> (opens in a new tab)</span>
              <Icon name="arrow_outward" className="text-xl" />
            </a>
          ) : (
            <p className="rounded-xl bg-ml-ink/5 px-5 py-3 text-sm font-semibold text-ml-ink/70">Free, or tickets at the venue on the day.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Events() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [open, setOpen] = useState<CultureEvent | null>(null);
  const shown = kind === "All" ? EVENTS : EVENTS.filter((e) => e.kind === kind);

  return (
    <section aria-labelledby="events-title" className="scroll-mt-(--ml-header) bg-ml-paper py-20 text-ml-ink sm:py-28" id="events">
      <div className={cn(COLUMN, "flex flex-col gap-8")}>
        <div className="flex flex-col gap-4">
          <h2 id="events-title" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
            What&rsquo;s on
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ml-ink/80 sm:text-xl">
            The cultural year, from the book fair of February to the processions of spring. Pick an event to see where, when, and how to go.
          </p>
        </div>
        <div role="group" aria-label="Filter events by kind" className="ml-rail flex gap-2 overflow-x-auto pb-1">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "min-h-10 shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green",
                kind === k ? "bg-ml-navy text-white" : "bg-ml-ink/8 text-ml-ink hover:bg-ml-ink/15",
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setOpen(e)}
                className="group flex h-full w-full flex-col items-start gap-3 rounded-2xl bg-white p-6 text-left ring-1 ring-ml-ink/10 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-18px_rgb(0_0_0/0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green"
              >
                <span className="rounded-full bg-signal-orange/15 px-3 py-1 text-xs font-semibold text-ml-ink/80">{e.kind}</span>
                <span className="font-ml-display text-[clamp(1.4rem,2vw,1.85rem)] leading-tight tracking-[0.01em] uppercase">{e.title}</span>
                <span className="text-sm font-semibold text-ml-green">{e.when}</span>
                <span className="text-sm leading-snug text-ml-ink/70">
                  {e.venue}, {e.city}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-ml-ink group-hover:text-ml-green">
                  Details &amp; tickets
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ml-ink/55">Dates follow the Bangla and religious calendars and shift year to year. Check the official page before you travel.</p>
      </div>
      {open ? <EventDialog event={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

/** Banglar Bhoot: a light, late-night tour of the ghosts of Bengali folklore. Stories, not claims. */
export function Ghosts() {
  return (
    <section aria-labelledby="ghosts-title" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28" id="banglar-bhoot">
      <div className={cn(COLUMN, "flex flex-col gap-8")}>
        <div className="flex flex-col gap-4">
          <h2 id="ghosts-title" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
            Banglar Bhoot
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            No Bengali childhood is complete without them. On dark, rain-heavy nights, grandmothers tell of the spirits of the tamarind tree and the marsh light over the paddy. Folklore, told with a shiver and a smile.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GHOSTS.map((g) => (
            <li key={g.name} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-6 ring-1 ring-white/12">
              <h3 className="font-ml-display text-[clamp(1.4rem,2vw,1.85rem)] leading-tight tracking-[0.01em] text-signal-orange uppercase">{g.name}</h3>
              <p className="leading-snug text-pretty text-white/85">{g.about}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-white/55">Figures of folklore, shared for delight, not as fact.</p>
      </div>
    </section>
  );
}
