import type { PostLink } from "@/data/media/types";

/**
 * A share request from elsewhere on the site (today গবেষণাকোষ), read from
 * the /media/share query string. The feed knows nothing about the sender:
 * it accepts only a same-site path, a title and short text, and turns them
 * into a link card the viewer can still edit before posting.
 */
export interface ShareIntent {
  link: PostLink;
  tags: string[];
}

const clean = (s: string | null, max: number) =>
  (s ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** A path on this site: one leading "/", no scheme, no "//" or "\" tricks, no spaces or markup. */
export const isSitePath = (href: string) => href.length <= 400 && /^\/(?![/\\])[^\s<>"'\\]*$/.test(href);

export function readIntent(q: { get(name: string): string | null }): ShareIntent | null {
  const href = (q.get("u") ?? "").trim();
  if (!isSitePath(href)) return null;
  const title = clean(q.get("t"), 200);
  if (title.length < 3) return null;
  const summary = clean(q.get("s"), 400);
  const label = clean(q.get("k"), 40);
  const tags = (q.get("tags") ?? "")
    .split(",")
    .map((t) => clean(t, 30).replace(/^#+/, "").replace(/\s+/g, "_"))
    .filter(Boolean)
    .slice(0, 5)
    .map((t) => `#${t}`);
  return {
    link: { href, title, source: clean(q.get("src"), 40) || "কাণ্ডারী", ...(summary ? { summary } : {}), ...(label ? { label } : {}) },
    tags,
  };
}

/** The caption the composer starts with; the viewer can rewrite it. */
export function intentCaption(i: ShareIntent): string {
  const head = i.link.label ? `নতুন ${i.link.label}: ${i.link.title}` : i.link.title;
  return i.link.summary ? `${head}\n\n${i.link.summary}` : head;
}
