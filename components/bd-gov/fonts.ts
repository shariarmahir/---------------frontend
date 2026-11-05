import { Merriweather, Source_Sans_3 } from "next/font/google";

/*
 * BD Guide's two faces, the pair usa.gov is set in, loaded under
 * /bangladesh/government only: Merriweather for titles and the lede,
 * Source Sans 3 for everything else. Bangla falls through to Hind Siliguri
 * (--font-bengali, from the root layout).
 */
export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-source-sans",
  display: "swap",
});
