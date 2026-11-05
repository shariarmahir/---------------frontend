import localFont from "next/font/local";
import { LOGO_TEXT, type LogoString } from "@/data/logo-text";
import { cn } from "@/lib/utils";

/**
 * Logo faces: "Li Sirajee Sylheti 3D ANSI V2" (Md. Sirajul Islam /
 * Niladri Shekhar Bala) — Italic for the wordmark and tagline, Regular for
 * the header's Bangla button labels.
 *
 * It is an ANSI (Bijoy-encoded) font with no Bangla Unicode code points,
 * so text is written in Bijoy keystrokes; every string lives in
 * data/logo-text.ts with its Unicode twin. Unicode Bangla set in this face
 * would fall back to another font.
 *
 * Each face is served as a subset of its full .ttf in public/font holding
 * only the glyphs its strings use (~4 KB and ~10 KB instead of ~160 KB
 * each); scripts/subset-logo-font.py regenerates both from data/logo-text.ts.
 *
 * `display: block`: during the short load the text stays invisible rather
 * than swapping in a fallback face — a fallback would print the Bijoy
 * keystrokes literally ("KvÊvix-j¨ve").
 */
const logoFont = localFont({
  src: "../../public/font/kandari-logo.woff2",
  display: "block",
  weight: "400",
  style: "italic",
  fallback: [],
  // No page uses the wordmark face right now; without this, every page
  // preloaded it and the browser warned it was never used. It still loads
  // when LogoText renders.
  preload: false,
});

export const BRAND_NAME_BN = LOGO_TEXT.brand.bn;

function BijoyText({ text, fontClass, className }: { text: LogoString; fontClass: string; className?: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap", className)}>
      {/* Each face is declared with its own style and the class requests
          the same, so nothing is synthesised. One weight only:
          `font-normal` stops a bold parent from faking a heavier one,
          which smears the white 3D cuts. */}
      <span aria-hidden className={cn(fontClass, "font-normal tracking-normal")}>
        {text.bijoy}
      </span>
      <span className="sr-only">{text.bn}</span>
    </span>
  );
}

/**
 * A string in the Italic logo face (wordmark and tagline). The Bijoy
 * keystrokes are hidden from assistive tech and search; the Unicode text
 * beside them is what they read.
 */
export function LogoText({ text, className }: { text: LogoString; className?: string }) {
  return <BijoyText text={text} fontClass={logoFont.className} className={className} />;
}

/**
 * The header's Bangla button labels, as plain Unicode in the site's Bangla
 * face. They used the upright Li Sirajee cut until 2026-10-18, when the
 * usability audit asked for fewer typefaces; kandari-label.woff2 is still in
 * public/font if it comes back.
 */
export function LabelText({ text, className }: { text: LogoString; className?: string }) {
  return <span className={cn("inline-block font-bengali font-bold whitespace-nowrap", className)}>{text.bn}</span>;
}

/** The brand name, "কাণ্ডারী-ল্যাব." */
export function KandariWordmark({ className }: { className?: string }) {
  return <LogoText text={LOGO_TEXT.brand} className={cn("leading-none", className)} />;
}
