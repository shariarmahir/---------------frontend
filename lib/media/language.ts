import { EN } from "./en";

/**
 * Bangla or English, chosen in the academy's bar and kept in a cookie so the
 * server render already speaks the right one. The cookie constant lives in a
 * plain module: a constant imported from a "use client" file is a client
 * reference on the server, not the string.
 */
export const LANG_COOKIE = "sm-lang";
export type Lang = "bn" | "en";

export const readLang = (value?: string): Lang => (value === "en" ? "en" : "bn");

/** The English for a Bangla line; a line with no English yet stays as written. */
export const translate = (lang: Lang, bn: string): string => (lang === "en" ? (EN[bn] ?? bn) : bn);
