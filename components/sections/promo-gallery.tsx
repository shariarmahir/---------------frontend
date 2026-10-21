"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { RecordDialog } from "@/components/record/record-dialog";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { promos, type Promo } from "@/data/promos";
import { cn } from "@/lib/utils";
import { FIELD_LOOKS } from "./charter-looks";
import { HOVER_INTENT_MS, Toggle } from "./charter-section";

/*
 * The things Kandari-Lab asks a citizen to do, as a row built like the
 * charter's (charter-section.tsx): from lg one card stands open and the
 * rest are narrow spines (4rem, 5rem from xl), symbol and name set upright;
 * pointing at a spine, once the pointer settles, opens it. Below lg the
 * cards stack and open in place. Each card is one solid field (navy, ink
 * or cobalt), the message on one side and its picture on the other, and
 * the + on each card turns to × when open (focus opens, Enter or a tap
 * toggles). The row keeps the content column's width and the Kandari
 * Profile band's low height.
 */

/** Each promo's symbol, for its spine and its stacked header. */
const PROMO_ICON: Record<string, string> = {
  record: "radio_button_checked",
  protibad: "campaign",
  nagorik: "balance",
  bangladesh: "map",
  media: "groups",
  research: "science",
};

export function PromoGallery() {
  const [open, setOpen] = useState(0);
  const [recorder, setRecorder] = useState(false);

  return (
    <section id="gallery" aria-label="What you can do with Kandari-Lab" className="section-band mx-auto max-w-384 px-gutter-x">
      {/* --n: the card count, for the open card's width. Spines are 4rem (5rem from xl) with 0.75rem gaps. */}
      <ul style={{ "--n": promos.length } as CSSProperties} className="story-reveal @container flex flex-col gap-3 lg:h-96 lg:flex-row xl:h-88">
        {promos.map((promo, i) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            open={open === i}
            anyOpen={open >= 0}
            onOpen={() => setOpen(i)}
            onToggle={() => setOpen((o) => (o === i ? -1 : i))}
            onRecord={() => setRecorder(true)}
          />
        ))}
      </ul>
      <RecordDialog open={recorder} onOpenChange={setRecorder} />
    </section>
  );
}

function PromoCard({
  promo,
  open,
  anyOpen,
  onOpen,
  onToggle,
  onRecord,
}: {
  promo: Promo;
  open: boolean;
  anyOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onRecord: () => void;
}) {
  const look = FIELD_LOOKS[promo.field];
  const icon = PROMO_ICON[promo.id] ?? "arrow_forward";
  const bodyId = useId();
  const intent = useRef(0);
  const bangla = /[ঀ-৿]/.test(promo.label);

  useEffect(() => () => window.clearTimeout(intent.current), []);

  return (
    <li
      id={`promo-${promo.id}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || open) return;
        intent.current = window.setTimeout(onOpen, HOVER_INTENT_MS);
      }}
      onPointerLeave={() => window.clearTimeout(intent.current)}
      style={look.vars as CSSProperties}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-3xl bg-(--field) text-(--ink) ring-1 ring-white/12 ring-inset lg:basis-16 xl:basis-20",
        "transition-[flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open
          ? "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)] lg:grow"
          : cn("shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)]", anyOpen ? "lg:grow-0" : "lg:grow"),
      )}
    >
      {/*
        Stacked (below lg): the whole header row is the control, so a thumb
        can hit it anywhere, not only on the +. Phones get a lower row (64px).
        Keyboard focus opens the card as the Toggle does; a tap's focus does
        not, or the tap's click would close the card it had just opened.
      */}
      <button
        type="button"
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) onOpen();
        }}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label={`${open ? "Close" : "Open"} ${promo.label}`}
        className="group/head flex w-full items-center justify-between gap-4 px-5 py-3 text-left focus-visible:outline-none sm:px-8 lg:hidden"
      >
        <span className={cn("flex min-w-0 items-center gap-3 text-lg font-bold", bangla ? "font-bengali" : "font-grotesk")}>
          <Icon name={icon} className="text-(--accent)" />
          {promo.label}
        </span>
        {/* Drawn as the charter's Toggle, its focus ring carried by the row's focus. */}
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--accent) text-(--accent-on) transition-transform duration-300 hover:scale-105 group-focus-visible/head:ring-2 group-focus-visible/head:ring-(--ink) group-focus-visible/head:ring-offset-2 group-focus-visible/head:ring-offset-(--field) motion-reduce:transition-none">
          <Icon
            name="add"
            className={cn("text-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open && "rotate-45")}
          />
        </span>
      </button>

      {/* The spine (lg): the closed card's face, symbol and name set upright. */}
      <div
        aria-hidden={open}
        className={cn(
          "absolute inset-0 hidden flex-col items-center justify-between py-6 transition-opacity duration-300 motion-reduce:transition-none lg:flex",
          open ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
        )}
      >
        <Icon name={icon} className="text-(--accent)" />
        <span className={cn("text-xl font-bold tracking-tight whitespace-nowrap [writing-mode:vertical-rl] rotate-180", bangla ? "font-bengali" : "font-grotesk")}>
          {promo.label}
        </span>
        <Toggle open={open} onOpen={onOpen} onToggle={onToggle} controls={bodyId} label={promo.label} />
      </div>

      {/* The card's content. Stacked: it unfolds under the header. Row: it sits at the open card's final width and fades in. */}
      <div
        id={bodyId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity,translate,visibility] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "lg:absolute lg:inset-y-0 lg:left-0 lg:block lg:w-[calc(100cqw-(var(--n)-1)*4.75rem)] xl:w-[calc(100cqw-(var(--n)-1)*5.75rem)]",
          // lg:invisible once faded: the closed body, clipped inside its spine, is not laid out for anything.
          open ? "grid-rows-[1fr] opacity-100 duration-500 lg:visible lg:translate-x-0 lg:delay-200" : "grid-rows-[0fr] opacity-0 duration-200 lg:invisible lg:translate-x-4",
        )}
      >
        <div className="min-h-0 overflow-hidden lg:h-full">
          <PromoSlide promo={promo} onRecord={onRecord} onClose={onToggle} closeId={bodyId} />
        </div>
      </div>
    </li>
  );
}

/** The open card: the message, a hairline, and its picture, which leans in under the pointer. */
function PromoSlide({ promo, onRecord, onClose, closeId }: { promo: Promo; onRecord: () => void; onClose: () => void; closeId: string }) {
  const art = promo.art;
  return (
    <div className="group/card @container relative h-full">
      {/* The open card's ×, in the row's top corner. */}
      <div className="absolute top-5 right-5 z-10 hidden lg:block">
        <Toggle open onOpen={() => {}} onToggle={onClose} controls={closeId} label={promo.label} />
      </div>
      <div className="grid h-full grid-cols-1 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Phones: the message tucks under the header row, aligned with its label. */}
        <div className="flex flex-col justify-center gap-3 px-5 pt-1 pb-5 sm:p-8 @2xl:py-8 @2xl:pr-8 @2xl:pl-10 lg:py-8 lg:pr-6 lg:pl-8 xl:pr-8 xl:pl-10">
          <h2 className="font-bengali text-2xl leading-[1.2] font-bold text-balance text-(--accent) sm:text-3xl">{promo.title}</h2>
          <p className="max-w-md font-sans text-sm leading-[1.6] text-(--ink)/80">{promo.body}</p>
          <div className="mt-2">
            {"href" in promo.action ? (
              <Link href={promo.action.href} className={cn(btn.gold, "font-bengali")}>
                {promo.action.label}
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
            ) : (
              <button type="button" onClick={onRecord} className={cn(btn.gold, "font-bengali")}>
                <span aria-hidden className="size-2.5 rounded-full bg-national-crimson" />
                {promo.action.label}
              </button>
            )}
          </div>
        </div>

        {/* The picture: under the message when stacked, beside it past a hairline in a row. */}
        <div className="relative mx-5 mb-5 h-40 overflow-hidden rounded-2xl border-(--ink)/12 sm:mx-8 sm:mb-6 sm:h-48 @2xl:m-0 @2xl:h-auto @2xl:rounded-none @2xl:border-l lg:m-0 lg:h-auto lg:rounded-none lg:border-l">
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
            {art.kind === "photo" && (
              <Image src={art.src} alt={art.alt} fill sizes="(min-width: 1024px) 560px, 90vw" style={{ objectPosition: art.position }} className="object-cover" />
            )}
            {art.kind === "screen" && (
              // The platform's own screen, set like a window sliding in from the corner.
              <div className="absolute top-[12%] left-[10%] h-[110%] w-[110%] overflow-hidden rounded-tl-2xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-black/20">
                <Image src={art.src} alt={art.alt} fill sizes="(min-width: 1024px) 600px, 90vw" className="object-cover object-top-left" />
              </div>
            )}
            {art.kind === "record" && <RecordArt />}
          </div>
          {art.kind === "photo" && (
            <a
              href={art.credit.source}
              target="_blank"
              rel="noopener noreferrer"
              // after: an invisible 44px-tall hit area round the small credit.
              className="absolute right-3 bottom-3 max-w-[80%] truncate rounded-full bg-black/55 px-2.5 py-1 text-xs text-white/80 after:absolute after:inset-x-0 after:-inset-y-2.5 hover:text-white"
            >
              Photo: {art.credit.author} · {art.credit.license}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** The recorder at work: a live dot, a running clock and a waveform (decorative). */
function RecordArt() {
  const bars = 24;
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 rounded-full bg-black/35 px-4 py-2 ring-1 ring-white/12">
          <span className="relative flex size-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-national-crimson/70 motion-reduce:hidden" />
            <span className="relative size-3 rounded-full bg-national-crimson" />
          </span>
          <span className="font-sans text-sm font-semibold text-white tabular-nums">REC 00:12</span>
        </div>
        <div className="flex h-14 items-center gap-1.5 sm:h-20 lg:gap-1 xl:gap-1.5">
          {Array.from({ length: bars }, (_, i) => (
            <span
              key={i}
              style={{ "--i": i, height: `${30 + ((i * 37) % 70)}%` } as CSSProperties}
              className="promo-wave w-1.5 rounded-full bg-signal-orange"
            />
          ))}
        </div>
        <p className="font-sans text-xs text-white/65 tabular-nums">voice · video · one tap</p>
      </div>
    </div>
  );
}
