/**
 * Taking a paper away: the same article as Markdown, as one self-contained
 * HTML page (opens in any browser, prints to PDF), and as a BibTeX entry
 * for reference managers. Pure; tested in export.test.ts.
 */
import { blocks, citation, FIELDS, KINDS, LEVELS, nameList, type Article } from "./core.ts";

const BN = "০১২৩৪৫৬৭৮৯";
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[Number(d)]);

/** A file name from the slug, safe on every system. */
export const fileBase = (a: Pick<Article, "slug">) => a.slug.replace(/[^\p{L}\p{M}\p{N}-]+/gu, "-").slice(0, 80) || "research";

/** The article as Markdown: title, who, summary, sections (lists kept), references, how to cite. */
export function toMarkdown(a: Article, url: string): string {
  const out: string[] = [`# ${a.title}`];
  if (a.titleEn) out.push(`_${a.titleEn}_`);
  out.push(
    `**${nameList(a.authors.map((x) => x.name))}** · ${a.institution} · ${bn(a.year)}`,
    `${KINDS[a.kind].bn} · ${FIELDS[a.field].bn} · ${LEVELS[a.level]}`,
    "## সারসংক্ষেপ",
    a.summary,
  );
  for (const s of a.sections) {
    out.push(`## ${s.heading}`);
    for (const b of blocks(s.body)) out.push("list" in b ? b.list.map((item) => `- ${item}`).join("\n") : b.text);
    if (s.callout) out.push(`> **${s.callout.title}**\n>\n> ${s.callout.body.replace(/\n/g, "\n> ")}`);
    for (const t of s.tables ?? []) {
      out.push(`**${t.title}**`, `| ${t.head.join(" | ")} |`, `| ${t.head.map(() => "---").join(" | ")} |`, ...t.rows.map((r) => `| ${r.join(" | ")} |`));
    }
  }
  if (a.references.length) out.push("## তথ্যসূত্র", a.references.map((r, i) => `${i + 1}. ${r.text}${r.url ? ` ${r.url}` : ""}`).join("\n"));
  out.push("## উদ্ধৃতি", citation(a, url));
  if (a.sample) out.push("_নমুনা নিবন্ধ — লেখক, প্রতিষ্ঠান ও সংখ্যা কাল্পনিক; উদ্ধৃত করবেন না।_");
  return `${out.join("\n\n")}\n`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The article as one HTML page with its own print-friendly styles. */
export function toHtml(a: Article, url: string): string {
  const body: string[] = [
    `<h1>${esc(a.title)}</h1>`,
    a.titleEn ? `<p class="en">${esc(a.titleEn)}</p>` : "",
    `<p class="meta"><strong>${esc(nameList(a.authors.map((x) => x.name)))}</strong> · ${esc(a.institution)} · ${bn(a.year)}<br>${esc(`${KINDS[a.kind].bn} · ${FIELDS[a.field].bn} · ${LEVELS[a.level]}`)}</p>`,
    a.sample ? `<p class="note">নমুনা নিবন্ধ — লেখক, প্রতিষ্ঠান ও সংখ্যা কাল্পনিক; উদ্ধৃত করবেন না।</p>` : "",
    `<h2>সারসংক্ষেপ</h2><p>${esc(a.summary)}</p>`,
  ];
  for (const s of a.sections) {
    body.push(`<h2>${esc(s.heading)}</h2>`);
    for (const b of blocks(s.body)) body.push("list" in b ? `<ul>${b.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p>${esc(b.text)}</p>`);
    if (s.callout) body.push(`<blockquote><strong>${esc(s.callout.title)}</strong><br>${esc(s.callout.body)}</blockquote>`);
    for (const t of s.tables ?? []) {
      body.push(
        `<table><caption>${esc(t.title)}</caption><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows
          .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`,
      );
    }
  }
  if (a.references.length) {
    body.push(`<h2>তথ্যসূত্র</h2><ol>${a.references.map((r) => `<li>${esc(r.text)}${r.url ? ` <a href="${esc(r.url)}">${esc(r.url)}</a>` : ""}</li>`).join("")}</ol>`);
  }
  body.push(`<h2>উদ্ধৃতি</h2><p class="cite">${esc(citation(a, url))}</p>`, `<p class="src">উৎস: <a href="${esc(url)}">${esc(url)}</a></p>`);
  return `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)} — গবেষণাকোষ</title>
<style>
body{max-width:46rem;margin:2.5rem auto;padding:0 1.25rem;font:17px/1.8 "Noto Sans Bengali","Hind Siliguri",system-ui,sans-serif;color:#111}
h1{font-size:2rem;line-height:1.25;margin:0 0 .5rem}h2{font-size:1.3rem;margin:2rem 0 .5rem;border-bottom:2px solid #111;padding-bottom:.25rem}
.en,.meta,.src{color:#555}.note{background:#fff4d6;padding:.6rem .9rem;border-radius:.5rem}
blockquote{margin:1rem 0;padding:.75rem 1rem;border-left:4px solid #E4B027;background:#faf7ee}
table{border-collapse:collapse;width:100%;font-size:.9rem;margin:1rem 0}caption{text-align:left;font-weight:700;margin-bottom:.4rem}
th,td{border:1px solid #ccc;padding:.4rem .6rem;text-align:left;vertical-align:top}th{background:#0B1849;color:#fff}
.cite{font-family:ui-monospace,monospace;font-size:.85rem}a{color:#035397;word-break:break-all}
</style></head><body>
${body.filter(Boolean).join("\n")}
</body></html>
`;
}

/** A BibTeX entry: @phdthesis/@mastersthesis for theses at those levels, @misc otherwise. */
export function toBibtex(a: Article, url: string): string {
  const type = a.kind === "thesis" ? (a.level === "phd" ? "phdthesis" : a.level === "masters" ? "mastersthesis" : "misc") : a.kind === "paper" ? "article" : "misc";
  const key = `${(a.authors[0]?.nameEn ?? a.slug).split(/\s+/).pop()?.replace(/[^A-Za-z0-9]/g, "") || "kandari"}${a.year}`;
  const fields: [string, string][] = [
    ["title", a.titleEn ?? a.title],
    ["author", a.authors.map((x) => x.nameEn ?? x.name).join(" and ")],
    ["year", String(a.year)],
    [type.endsWith("thesis") ? "school" : "institution", a.institution],
    ...(type === "article" ? [["journal", "Kandari ResearchPedia"] as [string, string]] : []),
    ["howpublished", "Kandari ResearchPedia (গবেষণাকোষ)"],
    ["url", url],
    ...(a.keywords.length ? [["keywords", a.keywords.join(", ")] as [string, string]] : []),
    ...(a.sample ? [["note", "Sample entry; not a real study"] as [string, string]] : a.preprint ? [["note", "Working paper, not peer reviewed"] as [string, string]] : []),
  ];
  return `@${type}{${key},\n${fields.map(([k, v]) => `  ${k} = {${v.replace(/[{}]/g, "")}}`).join(",\n")}\n}\n`;
}
