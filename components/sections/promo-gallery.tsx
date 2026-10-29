"use client";

import Link from "next/link";
import { useMemo } from "react";
import { openRecorder } from "@/components/record/open-recorder";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { promoCredits, promos, type Promo } from "@/data/promos";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { FIELD_LOOKS } from "./charter-looks";
import { PhotoReel, type ReelItem } from "./photo-reel";

/*
 * The things Kandari-Lab asks a citizen to do (Mahir, 2026-10-29): the
 * charter's photograph reel (photo-reel.tsx), card for card the same design,
 * set at the Pixel-Map cards' height (`short`) and placed after the
 * partners' words. Each way has its own HD photograph (data/promos.ts, the
 * credits listed on /bangladesh) and its animated icon on the closed tile.
 */

/** Each promo's Material Symbol, shown until its animated icon (public/lordicon/<id>.json) loads. */
const FALLBACK: Record<string, string> = {
  record: "radio_button_checked",
  protibad: "campaign",
  nagorik: "balance",
  bangladesh: "map",
  media: "groups",
  research: "science",
};

/**
 * How far each photograph is raised above the caption at the card's foot
 * (see ReelArt): enough to keep its subject clear of the words on a short card.
 */
const LIFT: Record<string, number> = {
  record: 0.2,
  protibad: 0.25,
  nagorik: 0.3,
  bangladesh: 0.3,
  media: 0.25,
  research: 0.2,
};

export function PromoGallery() {
  const items = useMemo(() => promos.map((p, i) => toItem(p, promoCredits[i])), []);
  return <PhotoReel sectionId="gallery" title="Six Ways to Act for Bangladesh, Today" items={items} short />;
}

function toItem(promo: Promo, photo: Photo): ReelItem {
  const action = promo.action;
  return {
    id: `promo-${promo.id}`,
    name: promo.label,
    icon: FALLBACK[promo.id] ?? "arrow_forward",
    lordicon: promo.id,
    look: FIELD_LOOKS[promo.field],
    art: { kind: "photo", photo, focus: promo.photo.position ?? "50% 50%", lift: LIFT[promo.id] ?? 0.25 },
    title: promo.title,
    titleText: promo.title,
    summary: promo.body,
    bangla: true,
    actions:
      "href" in action ? (
        <Link href={action.href} className={cn(btn.gold, "min-h-10 px-4 py-2 font-bengali")}>
          {action.label}
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      ) : (
        <button type="button" onClick={openRecorder} className={cn(btn.gold, "min-h-10 px-4 py-2 font-bengali")}>
          <span aria-hidden className="size-2.5 rounded-full bg-national-crimson" />
          {action.label}
        </button>
      ),
  };
}
