/**
 * Writes reference.md from the References page's list, so the repo keeps a
 * readable copy. Run: node --experimental-strip-types --no-warnings scripts/motherland-references.mts
 */
import { writeFileSync } from "node:fs";
import { REFERENCES } from "../data/motherland-references.ts";

const escape = (s: string) => s.replace(/\|/g, "\\|");

const lines = ["# MOTHERLAND references", "", "Every data source, photograph and film, page by page and section by section. The site shows the same list at /bangladesh/references.", ""];
for (const page of REFERENCES) {
  lines.push(`## ${page.name}`, "");
  for (const s of page.sections) {
    lines.push(`### ${s.title}`, "");
    for (const src of s.sources) lines.push(`- [${src.name}](${src.url})`);
    for (const n of s.notes) lines.push(`- ${n}`);
    if (s.sources.length || s.notes.length) lines.push("");
    if (s.credits.length) {
      lines.push("| Used for | Author | Site | Licence | Link |", "| --- | --- | --- | --- | --- |");
      for (const { label, credit } of s.credits) lines.push(`| ${escape(label)} | ${escape(credit.author)} | ${credit.source} | ${escape(credit.license)} | ${credit.sourceUrl} |`);
      lines.push("");
    }
  }
}
writeFileSync(new URL("../reference.md", import.meta.url), lines.join("\n"));
console.log("reference.md written");
