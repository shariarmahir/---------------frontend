/**
 * Every string set in the Li Sirajee Sylheti 3D ANSI V2 faces.
 *
 * Those faces are Bijoy-encoded — they have no Bangla Unicode code points
 * — so each entry carries the Bijoy keystrokes that draw it (`bijoy`) and
 * the real Unicode text (`bn`) that screen readers, search and copy-paste
 * get.
 *
 *  - LOGO_TEXT  → Italic face: the wordmark and its tagline (the lockup).
 *  - LABEL_TEXT → Regular face: the header's Bangla button labels.
 *
 * This file is also the source for the served font subsets:
 * scripts/subset-logo-font.py reads the `bijoy` values of each object and
 * keeps only those glyphs in that face's file. After adding or changing
 * an entry, run
 *   python scripts/subset-logo-font.py
 * or the new letters will fall back to another face.
 */
export interface LogoString {
  bijoy: string;
  bn: string;
}

export const LOGO_TEXT = {
  brand: { bijoy: "KvÊvix-j¨ve.", bn: "কাণ্ডারী-ল্যাব" },

  // Tagline — a single full-green line (Kazi Nazrul Islam, "চল্ চল্ চল্").
  // Verified glyph-by-glyph against the font's own rendering: অ=A, র=i,
  // ু(after র)=U+2018, ণ=Y confirms "অরুণ"; প্র=cÖ, া=v, ‡Z=তে confirms
  // "প্রাতের"; `j=দল; Pj&=চল্; ‡†i(dagger+i)=রে — all render correctly.
  tagline: {
    bijoy: "Ai‘Y cÖv‡Zi Zi‘Y `j, Pj& †i Pj&",
    bn: "অরুণ প্রাতের তরুণ দল, চল্ রে চল্",
  },
} satisfies Record<string, LogoString>;

export const LABEL_TEXT = {
  media: { bijoy: "‡PZbv", bn: "চেতনা" },
  protibad: { bijoy: "cÖwZev`", bn: "প্রতিবাদ" },
} satisfies Record<string, LogoString>;
