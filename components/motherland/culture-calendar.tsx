"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { EVENTS, type CultureEvent, type EventKind } from "@/data/motherland-live";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { COLUMN, SectionHead, pill } from "./kit";

const KINDS: (EventKind | "All")[] = ["All", "Festival", "National day", "Theatre", "Music", "Books", "Sport", "Village"];
const FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const when = (e: CultureEvent) => {
  const start = FORMAT.format(new Date(e.start));
  return e.end ? `${start} to ${FORMAT.format(new Date(e.end))}` : start;
};

const subscribe = () => () => undefined;
/** Today, only on the client: the server page is built ahead of time and must not decide what has passed. */
const useToday = () => useSyncExternalStore(subscribe, () => new Date().toISOString().slice(0, 10), () => "2026-11-04");

export function isUpcoming(e: CultureEvent, today: string) {
  return (e.end ?? e.start) >= today;
}

function EventDialog({ event, onClose }: { event: CultureEvent; onClose: () => void }) {
  return (
    <Dialog title={event.title} onClose={onClose}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
        <dt className="font-semibold text-ml-ink/60">When</dt>
        <dd className="font-semibold">
          {when(event)}
          {event.expected ? <span className="font-normal text-ml-ink/70"> (expected, may move)</span> : null}
        </dd>
        <dt className="font-semibold text-ml-ink/60">Where</dt>
        <dd>{event.venue}</dd>
      </dl>
      <p className="text-lg leading-relaxed text-pretty">{event.about}</p>
      {event.ticket ? (
        <a href={event.ticket.url} target="_blank" rel="noopener noreferrer" className={cn(pill.onLight, "w-fit")}>
          {event.ticket.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <p className="rounded-xl bg-ml-ground p-4 font-semibold">No ticket needed. Just come.</p>
      )}
      <p className="text-sm text-ml-ink/60">Tickets are sold by the organiser or at the hall, not on this site. Confirm the date before you travel.</p>
    </Dialog>
  );
}

/** The cultural year, month by month, from today onward; every event opens with where, when and how to go. */
export function CalendarBoard() {
  const today = useToday();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [open, setOpen] = useState<CultureEvent | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const months = useMemo(() => {
    const coming = EVENTS.filter((e) => isUpcoming(e, today) && (kind === "All" || e.kind === kind)).sort((a, b) => a.start.localeCompare(b.start));
    const out = new Map<string, CultureEvent[]>();
    for (const e of coming) {
      const key = e.start < today ? "Happening now" : MONTH.format(new Date(e.start));
      out.set(key, [...(out.get(key) ?? []), e]);
    }
    return [...out];
  }, [kind, today]);

  return (
    <section id="calendar" aria-labelledby="calendar-title" className="scroll-mt-(--ml-header) bg-white py-12 text-ml-ink sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-col gap-10")}>
        <SectionHead id="calendar-title" title="The year in Bangladesh" lede="What is coming up, month by month. Choose one to see where, when and how to go." />
        <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy", kind === k ? "bg-ml-navy text-white" : "bg-ml-ground hover:bg-signal-orange")}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-10">
          {months.map(([month, events]) => (
            <div key={month} className="grid gap-4 border-t-2 border-ml-navy pt-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <h3 className="font-ml-display text-[clamp(1.6rem,2.4vw,2.25rem)] leading-tight tracking-[0.01em] uppercase">{month}</h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {events.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => setOpen(e)} className="flex h-full w-full flex-col items-start gap-1.5 rounded-2xl bg-ml-ground p-5 text-left transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                      <span className="text-lg leading-snug font-bold text-balance">{e.title}</span>
                      <span className="font-semibold text-ml-green">
                        {when(e)}
                        {e.expected ? " (expected)" : ""}
                      </span>
                      <span className="text-ml-ink/70">{e.venue}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!months.length ? <p className="text-lg">Nothing of this kind in the coming months. Try another.</p> : null}
        </div>
        <p className="max-w-3xl text-ml-ink/65">
          Lunar and religious dates are estimates until they are announced.{" "}
        </p>
      </div>
      {open ? <EventDialog event={open} onClose={close} /> : null}
    </section>
  );
}

/** The button in the corner: the next things to go to, and how to get in. */
export function CornerEvents() {
  const today = useToday();
  const [listOpen, setListOpen] = useState(false);
  const [open, setOpen] = useState<CultureEvent | null>(null);
  const closeList = useCallback(() => setListOpen(false), []);
  const closeOne = useCallback(() => setOpen(null), []);
  const next = EVENTS.filter((e) => isUpcoming(e, today) && e.start >= today)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 6);

  return (
    <>
      <button type="button" onClick={() => setListOpen(true)} className={cn(pill.onLight, "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 shadow-[0_12px_28px_-8px_rgb(11_24_73/0.55)] sm:right-8 sm:bottom-8")}>
        Get tickets
      </button>
      {listOpen ? (
        <Dialog title="Coming up" onClose={closeList}>
          <ul className="flex flex-col gap-2">
            {next.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    setListOpen(false);
                    setOpen(e);
                  }}
                  className="flex w-full flex-col gap-1 rounded-2xl bg-ml-ground p-4 text-left transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy"
                >
                  <span className="font-bold">{e.title}</span>
                  <span className="text-ml-ink/70">
                    {when(e)}. {e.ticket ? "Tickets or details online" : "Free to walk in"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}
      {open ? <EventDialog event={open} onClose={closeOne} /> : null}
    </>
  );
}
