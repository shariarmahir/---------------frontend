import { Archivo, Instrument_Serif, Tiro_Bangla } from "next/font/google";

/** The wide display face: Archivo stretched, for Latin and digits beside Hind Siliguri's Bangla. */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
/** The turned word in a heading — "ছোট *বিশ্ববিদ্যালয়*" — is a serif italic: Instrument Serif for Latin, Tiro Bangla for Bangla. */
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
const tiro = Tiro_Bangla({ subsets: ["bengali"], weight: "400", style: "italic", variable: "--font-tiro", display: "swap" });

/** The academy's faces as one class list: the academy pages and the rest of the media platform share them. */
export const ACADEMY_FACES = `${archivo.variable} ${instrument.variable} ${tiro.variable}`;
