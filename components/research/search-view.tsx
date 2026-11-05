"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FIELDS, KINDS, type FieldId, type ResearchKind } from "@/lib/research/core";
import { findTrack } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { collectionHref, COLUMN, H1, LINK } from "./kit";
import { Results, type TypeKey } from "./results";

const TYPE_KEYS: TypeKey[] = [...(Object.keys(KINDS) as ResearchKind[]), "preprint"];
const year = (s: string | null) => (s && /^\d{4}$/.test(s) ? Number(s) : undefined);

/** /research/search: the query from the bar or Advanced Search, refined on the left. */
export function SearchView() {
  const p = useSearchParams();
  const q = p.get("q")?.trim() ?? "";
  const type = p.get("type") ?? "";
  const field = p.get("field") ?? "";
  const match = { q, title: p.get("title") ?? undefined, author: p.get("author") ?? undefined, institution: p.get("institution") ?? undefined, keyword: p.get("keyword") ?? undefined };
  const advanced = [match.title && `title: ${match.title}`, match.author && `author: ${match.author}`, match.institution && `institution: ${match.institution}`, match.keyword && `keyword: ${match.keyword}`].filter(Boolean);
  const label = [q && `"${q}"`, ...advanced].filter(Boolean).join(", ");
  const within = findTrack(p.get("collection") ?? "");
  // Remount the results when the search changes, so the refinements start fresh.
  const key = p.toString();

  return (
    <div className={cn(COLUMN, "py-10 lg:py-12")}>
      <h1 className={cn(H1, "hero-rise")}>{label ? <>Results for {label}</> : "All research"}</h1>
      {within && (
        <p className="mt-3 text-base text-white/80">
          Within the collection <Link href={collectionHref(within.id)} className={LINK}>{within.title}</Link> · <Link href={`/research/search?q=${encodeURIComponent(q)}`} className={LINK}>Search all of Genius</Link>
        </p>
      )}
      <div className="mt-8">
        <Results
          key={key}
          scope={within?.id ?? "all"}
          match={match}
          initialTypes={TYPE_KEYS.includes(type as TypeKey) ? [type as TypeKey] : []}
          initialFields={Object.hasOwn(FIELDS, field) ? [field as FieldId] : []}
          initialFrom={year(p.get("from"))}
          initialTo={year(p.get("to"))}
        />
      </div>
    </div>
  );
}
