/** Server only: the newspaper's stories for one request (every নাগরিক জীবন page reads through this). */
import { cookies } from "next/headers";
import { loadNews, type NewsDesk } from "./news-fetch";

/** "bn": the reader pressed বাংলা and sees only Bangla stories. */
export const PAPER_LANG_COOKIE = "np-lang";

export type PaperLang = "all" | "bn";

export interface Paper extends NewsDesk {
  lang: PaperLang;
}

/** The feeds (cached for 15 minutes in news-fetch.ts), narrowed to Bangla when the reader asked for it. */
export async function loadPaper(now = new Date()): Promise<Paper> {
  const [desk, jar] = await Promise.all([loadNews(now), cookies()]);
  const lang: PaperLang = jar.get(PAPER_LANG_COOKIE)?.value === "bn" ? "bn" : "all";
  if (lang === "all") return { ...desk, lang };
  const items = desk.items.filter((n) => n.lang === "bn");
  return { ...desk, items: items.length > 0 ? items : desk.items, lang };
}
