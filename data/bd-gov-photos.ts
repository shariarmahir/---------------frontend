/**
 * The photographs on BD Guide's poster cards: licensed pictures already in MOTHERLAND's
 * library (Wikimedia Commons and Unsplash), each described as it really is. Their credits
 * are listed on /bangladesh/government/credits.
 */
import type { Photo } from "./bd-gov.ts";
import { photo } from "./motherland-categories.ts";
import { MORE } from "./motherland-more.ts";

/** A photo from public/motherland/more, by its key. */
export function shot(key: string, alt: string, focus?: string): Photo {
  const m = MORE[key];
  if (!m) throw new Error(`BD Guide: no photo "${key}"`);
  return { src: `/motherland/more/${m.file ?? `${key}.jpg`}`, alt, focus, credit: { author: m.author, license: m.license, licenseUrl: m.licenseUrl || undefined, sourceUrl: m.sourceUrl } };
}

/** A photo from public/motherland/photos, with its own credit. */
export function own(name: string, alt?: string): Photo {
  const p = photo(name);
  return { src: p.src, alt: alt ?? p.alt, focus: p.focus, credit: { author: p.credit.author, license: p.credit.license, licenseUrl: p.credit.licenseUrl, sourceUrl: p.credit.sourceUrl } };
}
