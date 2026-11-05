import { Anton, Montserrat, Outfit } from "next/font/google";

/*
 * MOTHERLAND's faces, loaded on /bangladesh only: Anton for section titles,
 * Montserrat for everything else, and the title face for the logo, every hero
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
export const mlFonts = `${anton.variable} ${montserrat.variable} ${title.variable}`;
