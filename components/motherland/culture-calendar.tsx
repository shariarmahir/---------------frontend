"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { pic, place } from "@/data/motherland-blocks";
import { EVENTS, EVENT_PICTURES, type CultureEvent } from "@/data/motherland-live";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { FitLine } from "./fit-line";
import { BAND_Y, COLUMN, SectionHead, pill } from "./kit";

const FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const when = (e: CultureEvent) => {
  const start = FORMAT.format(new Date(e.start));
  return e.end ? `${start} to ${FORMAT.format(new Date(e.end))}` : start;
};

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
/** The dates on the card, without the year the calendar already shows. */
const shortWhen = (e: CultureEvent) => {
  const start = DAY_MONTH.format(new Date(e.start));
  const dates = e.end ? `${start} to ${DAY_MONTH.format(new Date(e.end))}` : start;
  return e.expected ? `${dates} (expected)` : dates;
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

const YEAR_MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86_400_000;
/** Longer than this and it is a season, not a date: it gets a card but marks no days. */
const LONGEST_MARKED_DAYS = 45;

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const spanDays = (e: CultureEvent) => (Date.parse(e.end ?? e.start) - Date.parse(e.start)) / DAY_MS;

function pictureOf(e: CultureEvent) {
  const p = EVENT_PICTURES[e.id];
  if (!p) return null;
  const found = p.key ? pic(p.key, p.alt) : p.place ? place(p.place, p.alt) : p.src ? { src: p.src, alt: p.alt } : undefined;
  return found ? { src: found.src, alt: found.alt } : null;
}

/** The twelve months ahead, from this one. */
function monthsFrom(today: string) {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7)) - 1;
  return Array.from({ length: 12 }, (_, i) => {
    const first = Date.UTC(y, m + i, 1);
    return { key: iso(first).slice(0, 7), first, short: YEAR_MONTH.format(first), label: MONTH.format(first) };
  });
}

/** One month: its days in a grid, with every day something is on marked in gold. */
function MonthGrid({ first, label, marked, today, chosen, onChoose }: { first: number; label: string; marked: Map<string, CultureEvent[]>; today: string; chosen: string | null; onChoose: (day: string | null) => void }) {
  const date = new Date(first);
  const blanks = date.getUTCDay();
  const count = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  return (
    <div className="rounded-[1.25rem] bg-ml-navy p-5 text-white sm:p-7 lg:sticky lg:top-[calc(var(--ml-header)+1rem)]">
      <h3 className="font-ml-display text-[clamp(1.75rem,2.6vw,2.75rem)] leading-[1.1] tracking-[0.01em] uppercase">{label}</h3>
      <div role="group" aria-label={label} className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((d) => (
          <span key={d} aria-hidden className="py-1 text-center text-sm font-semibold text-white/70">
            {d}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const day = iso(first + i * DAY_MS);
          const on = marked.get(day);
          const isToday = day === today;
          const plain = "grid aspect-square place-items-center rounded-lg font-semibold tabular-nums";
          if (!on) {
            return (
              <span key={day} className={cn(plain, "text-white/75", isToday && "ring-2 ring-white ring-inset")}>
                {i + 1}
              </span>
            );
          }
          const picked = chosen === day;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={picked}
              aria-label={`${i + 1} ${label}: ${on.map((e) => e.title).join(", ")}`}
              onClick={() => onChoose(picked ? null : day)}
              className={cn(plain, "cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white", picked ? "bg-white text-ml-navy" : "bg-signal-orange text-ml-navy hover:bg-white", isToday && "ring-2 ring-white ring-inset")}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The cultural year as a calendar: choose a month, the days with something on are marked, and each event is a card beside it. */
export function CalendarBoard() {
  const today = useToday();
  const months = useMemo(() => monthsFrom(today), [today]);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const [open, setOpen] = useState<CultureEvent | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const month = months.find((m) => m.key === monthKey) ?? months[0];

  const { events, marked } = useMemo(() => {
    const lastDay = iso(Date.UTC(new Date(month.first).getUTCFullYear(), new Date(month.first).getUTCMonth() + 1, 0));
    const firstDay = iso(month.first);
    const inMonth = EVENTS.filter((e) => isUpcoming(e, today) && e.start <= lastDay && (e.end ?? e.start) >= firstDay).sort((a, b) => spanDays(a) > LONGEST_MARKED_DAYS === spanDays(b) > LONGEST_MARKED_DAYS ? a.start.localeCompare(b.start) : spanDays(a) > LONGEST_MARKED_DAYS ? 1 : -1);
    const days = new Map<string, CultureEvent[]>();
    for (const e of inMonth) {
      if (spanDays(e) > LONGEST_MARKED_DAYS) continue;
      for (let t = Date.parse(e.start); t <= Date.parse(e.end ?? e.start); t += DAY_MS) {
        const d = iso(t);
        if (d >= firstDay && d <= lastDay) days.set(d, [...(days.get(d) ?? []), e]);
      }
    }
    return { events: inMonth, marked: days };
  }, [month, today]);

  const shown = chosenDay ? (marked.get(chosenDay) ?? []) : events;

  return (
    <section id="calendar" aria-labelledby="calendar-title" className={cn("scroll-mt-(--ml-header) bg-white text-ml-navy", BAND_Y)}>
      <div className={cn(COLUMN, "flex flex-col gap-8")}>
        <SectionHead id="calendar-title" title="The year in Bangladesh" lede="Choose a month. The gold days have something on, so choose one to see what." />
        <div role="group" aria-label="Choose a month" className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {months.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={m.key === month.key}
              onClick={() => {
                setMonthKey(m.key);
                setChosenDay(null);
              }}
              className={cn("min-h-11 cursor-pointer rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy", m.key === month.key ? "bg-ml-navy text-white" : "bg-ml-ground text-ml-navy hover:bg-signal-orange")}
            >
              {m.short}
            </button>
          ))}
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
          <MonthGrid first={month.first} label={month.label} marked={marked} today={today} chosen={chosenDay} onChoose={setChosenDay} />
          {shown.length ? (
            <ul className="grid gap-5 sm:grid-cols-2">
              {shown.map((e) => {
                const picture = pictureOf(e);
                return (
                  <li key={e.id} className="flex min-w-0">
                    <button type="button" onClick={() => setOpen(e)} className="ml-card group flex w-full cursor-pointer flex-col overflow-hidden rounded-[1.25rem] bg-white text-left ring-1 ring-ml-navy/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                      {picture ? (
                        <span className="relative block aspect-16/10 w-full overflow-hidden bg-ml-mist">
                          <Image src={picture.src} alt={picture.alt} fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 92vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" />
                          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-signal-orange px-3.5 py-1 text-sm font-semibold text-ml-navy">{spanDays(e) > LONGEST_MARKED_DAYS ? "All through the year" : shortWhen(e)}</span>
                        </span>
                      ) : null}
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-5">
                        <FitLine as="span" text={e.title} min={15} className="block whitespace-nowrap text-lg font-bold" />
                        <span className="text-ml-navy/70">{e.venue}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-[1.25rem] bg-ml-ground p-8 text-lg font-semibold">Nothing is listed for this month yet. Try the next one.</p>
          )}
        </div>
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
