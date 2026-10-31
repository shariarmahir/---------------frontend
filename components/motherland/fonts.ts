import { Anton, Montserrat } from "next/font/google";

/*
 * MOTHERLAND's two faces, loaded on /bangladesh only: Anton, a tall
 * condensed display face for the uppercase titles, and Montserrat, a
 * geometric sans for everything else. Bangla in either falls through to
 * Hind Siliguri (--font-bengali, from the root layout).
 */
export const anton = Anton({
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
