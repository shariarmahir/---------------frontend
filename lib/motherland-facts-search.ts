/**
 * The search behind the Facts bar. Every word typed must appear somewhere in an
 * entry, so a longer query narrows the list. A match in the title or the figure
 * ranks above one that is only in the text.
 */
export interface SearchEntry<P = unknown> {
  title: string;
  text: string;
  figure?: string;
  group: string;
  href: string;
  picture: P;
}

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export function searchFacts<P>(query: string, entries: SearchEntry<P>[], limit = 8): SearchEntry<P>[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { entry: SearchEntry<P>; score: number }[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.href)) continue;
    const head = fold(`${entry.title} ${entry.figure ?? ""}`);
    const body = fold(entry.text);
    if (!words.every((w) => head.includes(w) || body.includes(w))) continue;
    seen.add(entry.href);
    scored.push({ entry, score: words.filter((w) => head.includes(w)).length });
  }
  /* Array.sort is stable, so equal scores keep the page's own order. */
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.entry);
}
