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
});

/**
 * The upright (Regular) cut of the same family, for the header's Bangla
 * button labels — public/font/LiSirajeeSylheti3DANSIV2-Regular.ttf,
 * subset the same way into kandari-label.woff2.
 */
const labelFont = localFont({
  src: "../../public/font/kandari-label.woff2",
  display: "block",
  weight: "400",
  style: "normal",
  fallback: [],
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

/** A string in the Regular face — the header's Bangla button labels. */
export function LabelText({ text, className }: { text: LogoString; className?: string }) {
  return <BijoyText text={text} fontClass={labelFont.className} className={className} />;
}

/** The brand name, "কাণ্ডারী-ল্যাব." */
export function KandariWordmark({ className }: { className?: string }) {
  return <LogoText text={LOGO_TEXT.brand} className={cn("leading-none", className)} />;
}
