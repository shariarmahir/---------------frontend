/**
 * Taking a paper away: the article as Markdown, as one self-contained HTML
 * page (opens in any browser, prints to PDF), as BibTeX and RIS entries
 * for reference managers, and as a formatted citation in APA, MLA or
 * Chicago style. Pure; tested in export.test.ts.
 */
import { blocks, citation, FIELDS, KINDS, LEVELS, nameList, type Article } from "./core.ts";

const SAMPLE_NOTE = "Sample entry: the authors, institution and figures are illustrative. Do not cite it as a real study.";

/** A file name from the slug, safe on every system. */
export const fileBase = (a: Pick<Article, "slug">) => a.slug.replace(/[^\p{L}\p{M}\p{N}-]+/gu, "-").slice(0, 80) || "research";

const authorNamesOf = (a: Pick<Article, "authors">) => a.authors.map((x) => x.nameEn ?? x.name);

/** The article as Markdown: title, who, abstract, sections (lists kept), references, how to cite. */
export function toMarkdown(a: Article, url: string): string {
  const out: string[] = [`# ${a.title}`];
  if (a.titleEn) out.push(`_${a.titleEn}_`);
  out.push(
    `**${nameList(authorNamesOf(a))}** · ${a.institution} · ${a.year}`,
    `${KINDS[a.kind].type} · ${FIELDS[a.field].en} · ${LEVELS[a.level]}${a.tracking ? ` · Tracking number ${a.tracking}` : ""}`,
    "## Abstract",
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
  if (a.references.length) out.push("## References", a.references.map((r, i) => `${i + 1}. ${r.text}${r.url ? ` ${r.url}` : ""}`).join("\n"));
  out.push("## How to cite", citation(a, url));
  if (a.sample) out.push(`_${SAMPLE_NOTE}_`);
  return `${out.join("\n\n")}\n`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The article as one HTML page with its own print-friendly styles. */
export function toHtml(a: Article, url: string): string {
  const body: string[] = [
    `<p class="type">${esc(KINDS[a.kind].type)}</p>`,
    `<h1>${esc(a.title)}</h1>`,
    a.titleEn ? `<p class="en">${esc(a.titleEn)}</p>` : "",
    `<p class="meta"><strong>${esc(nameList(authorNamesOf(a)))}</strong> · ${esc(a.institution)} · ${a.year}<br>${esc(`${FIELDS[a.field].en} · ${LEVELS[a.level]}${a.tracking ? ` · Tracking number ${a.tracking}` : ""}`)}</p>`,
    a.sample ? `<p class="note">${esc(SAMPLE_NOTE)}</p>` : "",
    `<h2>Abstract</h2><p>${esc(a.summary)}</p>`,
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
    body.push(`<h2>References</h2><ol>${a.references.map((r) => `<li>${esc(r.text)}${r.url ? ` <a href="${esc(r.url)}">${esc(r.url)}</a>` : ""}</li>`).join("")}</ol>`);
  }
  body.push(`<h2>How to cite</h2><p class="cite">${esc(citation(a, url))}</p>`, `<p class="src">Source: <a href="${esc(url)}">${esc(url)}</a></p>`);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)} — Genius</title>
<style>
body{max-width:46rem;margin:2.5rem auto;padding:0 1.25rem;font:17px/1.75 Georgia,"Times New Roman",serif;color:#111}
.type{font:600 13px/1.4 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#0B1849;margin:0}
h1{font-size:2rem;line-height:1.25;margin:.25rem 0 .5rem;font-weight:400}h2{font-size:1.3rem;margin:2rem 0 .5rem;border-bottom:1px solid #0B1849;padding-bottom:.25rem;font-weight:400}
.en,.meta,.src{color:#555;font-family:system-ui,sans-serif;font-size:15px}.note{background:#fff4d6;padding:.6rem .9rem;border-radius:.25rem;font-family:system-ui,sans-serif;font-size:14px}
blockquote{margin:1rem 0;padding:.75rem 1rem;border-left:4px solid #E4B027;background:#f5f7fc}
table{border-collapse:collapse;width:100%;font:14px/1.5 system-ui,sans-serif;margin:1rem 0}caption{text-align:left;font-weight:700;margin-bottom:.4rem}
th,td{border:1px solid #ccd3e2;padding:.4rem .6rem;text-align:left;vertical-align:top}th{background:#0B1849;color:#fff}
.cite{font-family:ui-monospace,monospace;font-size:.85rem}a{color:#035397;word-break:break-all}
</style></head><body>
${body.filter(Boolean).join("\n")}
</body></html>
`;
}

const bibType = (a: Article) => (a.kind === "thesis" ? (a.level === "phd" ? "phdthesis" : a.level === "masters" ? "mastersthesis" : "misc") : a.kind === "paper" ? "article" : "misc");

/** The citation key: the first author's family name and the year. */
const citeKey = (a: Article) => `${(a.authors[0]?.nameEn ?? a.authors[0]?.name ?? "").split(/\s+/).pop()?.replace(/[^A-Za-z0-9]/g, "") || "kandari"}${a.year}`;

/** A BibTeX entry: @phdthesis/@mastersthesis for theses at those levels, @article for papers, @misc otherwise. */
export function toBibtex(a: Article, url: string): string {
  const type = bibType(a);
  const fields: [string, string][] = [
    ["title", a.title],
    ["author", authorNamesOf(a).join(" and ")],
    ["year", String(a.year)],
    [type.endsWith("thesis") ? "school" : "institution", a.institution],
    ...(type === "article" ? [["journal", "Genius (Kandari-Lab)"] as [string, string]] : []),
    ["howpublished", "Genius (Kandari-Lab)"],
    ["url", url],
    ...(a.keywords.length ? [["keywords", a.keywords.join(", ")] as [string, string]] : []),
    ...(a.sample ? [["note", "Sample entry; not a real study"] as [string, string]] : a.preprint ? [["note", "Working paper, not peer reviewed"] as [string, string]] : []),
  ];
  return `@${type}{${citeKey(a)},\n${fields.map(([k, v]) => `  ${k} = {${v.replace(/[{}]/g, "")}}`).join(",\n")}\n}\n`;
}

/** An RIS record (EndNote, Zotero, Mendeley): THES for theses, JOUR for papers, RPRT otherwise. */
export function toRis(a: Article, url: string): string {
  const ty = a.kind === "thesis" ? "THES" : a.kind === "paper" ? "JOUR" : a.kind === "idea" ? "GEN" : "RPRT";
  const lines = [
    `TY  - ${ty}`,
    `TI  - ${a.title}`,
    ...authorNamesOf(a).map((n) => `AU  - ${n}`),
    `PY  - ${a.year}`,
    `DA  - ${a.published.replace(/-/g, "/")}`,
    `PB  - ${a.institution}`,
    ...(ty === "JOUR" ? ["JO  - Genius (Kandari-Lab)"] : []),
    `AB  - ${a.summary}`,
    ...a.keywords.map((k) => `KW  - ${k}`),
    `UR  - ${url}`,
    ...(a.sample ? ["N1  - Sample entry; not a real study"] : a.preprint ? ["N1  - Working paper, not peer reviewed"] : []),
    "ER  - ",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

export type CiteStyle = "apa" | "mla" | "chicago";

export const CITE_STYLES: Record<CiteStyle, string> = { apa: "APA", mla: "MLA", chicago: "Chicago" };

/** "Das, R." for APA; family name first for the lead author in MLA and Chicago. */
function apaName(n: string): string {
  const parts = n.trim().split(/\s+/);
  if (parts.length < 2) return n;
  const family = parts.pop()!;
  return `${family}, ${parts.map((p) => `${p.charAt(0)}.`).join(" ")}`;
}
function invert(n: string): string {
  const parts = n.trim().split(/\s+/);
  if (parts.length < 2) return n;
  const family = parts.pop()!;
  return `${family}, ${parts.join(" ")}`;
}

/** The citation in one of three common styles; the title is wrapped in _underscores_ where the style italicises it. */
export function citeAs(a: Article, url: string, style: CiteStyle): string {
  const names = authorNamesOf(a);
  const accessed = a.published;
  const kind = a.preprint ? "Working paper" : KINDS[a.kind].type;
  if (style === "apa") {
    const who = names.length <= 1 ? names.map(apaName).join("") : `${names.slice(0, -1).map(apaName).join(", ")}, & ${apaName(names[names.length - 1])}`;
    return `${who} (${a.year}). _${a.title}_ [${kind}]. ${a.institution}. Genius (Kandari-Lab). ${url}`;
  }
  const lead = names.length ? invert(names[0]) : "";
  if (style === "mla") {
    const who = names.length > 2 ? `${lead}, et al.` : names.length === 2 ? `${lead}, and ${names[1]}` : lead;
    return `${who}. _${a.title}_. ${a.institution}, ${a.year}. _Genius (Kandari-Lab)_, ${url}. Accessed ${accessed}.`;
  }
  const rest = names.slice(1);
  const who = rest.length === 0 ? lead : `${lead}, ${rest.length > 1 ? `${rest.slice(0, -1).join(", ")}, ` : ""}and ${rest[rest.length - 1]}`;
  return `${who}. ${a.year}. "${a.title}." ${kind}, ${a.institution}. Genius (Kandari-Lab). ${url}.`;
}
