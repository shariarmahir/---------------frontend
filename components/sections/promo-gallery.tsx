"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { openRecorder } from "@/components/record/open-recorder";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { promos, type Promo } from "@/data/promos";
import { cn } from "@/lib/utils";
import { FIELD_LOOKS } from "./charter-looks";
import { PhotoReel, type ReelArt, type ReelItem } from "./photo-reel";

/*
 * The things Kandari-Lab asks a citizen to do (Mahir, 2026-10-25): the home
 * page's photograph reel (photo-reel.tsx), the same design as the charter's.
 * The recorder's card has no photograph, so it draws the recording at work
 * on its dark field; the two platforms show their own screens, filling the
 * card from the top-left corner; the three civic cards use their credited
 * photographs (the credits are listed on /bangladesh, data/promos.ts).
 */

/** Each promo's symbol, for its tile and its caption. */
const PROMO_ICON: Record<string, string> = {
  record: "radio_button_checked",
  protibad: "campaign",
  nagorik: "balance",
  bangladesh: "map",
  media: "groups",
  research: "science",
};

/** How each photograph is framed (see ReelArt): its subject kept clear of the panes at the card's foot. */
const FRAMING: Record<string, { focus: string; lift: number }> = {
  protibad: { focus: "40% 50%", lift: 0.4 },
  nagorik: { focus: "50% 50%", lift: 0.3 },
  bangladesh: { focus: "66% 50%", lift: 0.45 },
};

export function PromoGallery() {
  const items = useMemo(() => promos.map((p) => toItem(p, openRecorder)), []);
  // The header's recorder (open-recorder.ts): one list of saved files per page.
  return <PhotoReel sectionId="gallery" title="Six Ways to Act for Bangladesh, Today" noun="way to act" items={items} wide />;
}

function toItem(promo: Promo, onRecord: () => void): ReelItem {
  const art = promo.art;
  const frame = FRAMING[promo.id] ?? { focus: "50% 50%", lift: 0.3 };
  const reelArt: ReelArt =
    art.kind === "photo"
      ? { kind: "photo", photo: { src: art.src, alt: art.alt }, focus: art.position ?? frame.focus, lift: frame.lift }
      : art.kind === "screen"
        ? { kind: "screen", src: art.src, alt: art.alt }
        : { kind: "custom", render: (open) => <RecordArt open={open} /> };

  return {
    id: `promo-${promo.id}`,
    name: promo.label,
    icon: PROMO_ICON[promo.id] ?? "arrow_forward",
    look: FIELD_LOOKS[promo.field],
    art: reelArt,
    title: promo.title,
    titleText: promo.title,
    summary: promo.body,
    bangla: true,
    actions:
      "href" in promo.action ? (
        <Link href={promo.action.href} className={cn(btn.gold, "min-h-10 px-4 py-2 font-bengali")}>
          {promo.action.label}
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      ) : (
        <button type="button" onClick={onRecord} className={cn(btn.gold, "min-h-10 px-4 py-2 font-bengali")}>
          <span aria-hidden className="size-2.5 rounded-full bg-national-crimson" />
          {promo.action.label}
        </button>
      ),
  };
}

/**
 * The recorder at work, on the card's field above its panes: a live dot, a
 * running clock and a waveform (decorative). A closed tile keeps only the
 * waveform.
 */
function RecordArt({ open }: { open: boolean }) {
  const bars = 24;
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 grid h-[52%] place-items-center overflow-hidden">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        {open && (
          <div className="flex items-center gap-3 rounded-full bg-black/35 px-4 py-2 ring-1 ring-white/12">
            <span className="relative flex size-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-national-crimson/70 motion-reduce:hidden" />
              <span className="relative size-3 rounded-full bg-national-crimson" />
            </span>
            <span className="font-sans text-sm font-semibold text-white tabular-nums">REC 00:12</span>
          </div>
        )}
        <div className="flex h-14 items-center gap-1.5 sm:h-16 lg:gap-1">
          {Array.from({ length: bars }, (_, i) => (
            <span
              key={i}
              style={{ "--i": i, height: `${30 + ((i * 37) % 70)}%` } as CSSProperties}
              className="promo-wave w-1.5 rounded-full bg-signal-orange"
            />
          ))}
        </div>
        {open && <p className="font-sans text-xs text-white/65 tabular-nums">voice · video · one tap</p>}
      </div>
    </div>
  );
}
