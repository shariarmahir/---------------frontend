import { Anton, Inter, Knewave, Montserrat, Outfit, Playfair_Display } from "next/font/google";

/*
 * MOTHERLAND's faces, loaded on /bangladesh only: Inter for section titles and
 * everything you read (Montserrat stays for BD Guide's mark), Anton for big figures, and the title face for the logo, every hero
 * title and the words under each hero. Bangla in any of them falls through to
 * Hind Siliguri (--font-bengali, from the root layout).
 *
 * Mahir asked for Garet Bold as the title face. Its foundry, Type Forward, only
 * allows it on a website under a paid Web License, so this is Outfit, an open
 * (SIL OFL) geometric face. Once a licence is bought, put the file in
 * public/font and swap this one call for next/font/local with the same variable.
 */
const title = Outfit({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-ml-title-face",
  display: "swap",
});

/**
 * MOTHERLAND's reading face and its section titles (Mahir, 2026-11-07, after booking.com): Inter
 * (SIL OFL), clear and friendly in the way Booking Sans is. Booking Sans itself is Booking.com's own
 * typeface, made for them by Colophon Foundry, and not licensed to anyone else.
 */
export const ui = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ml-ui-face",
  display: "swap",
});

/** The logo's brush face (SIL OFL), for the utility bar's words, which are dressed like the logo. */
const brush = Knewave({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ml-brush-face",
  display: "swap",
});

/** The poster cards' serif (SIL OFL): their titles and the line on each photograph, on MOTHERLAND and in BD Guide. */
export const serif = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ml-serif-face",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Every MOTHERLAND page sets these on its outermost element. */
export const mlFonts = `${anton.variable} ${ui.variable} ${title.variable} ${brush.variable} ${serif.variable}`;
