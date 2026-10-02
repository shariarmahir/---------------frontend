"use client";

import { useState } from "react";
import { CategoryBrowser } from "./category-browser";
import { SectionRail } from "./section-rail";

/**
 * Wires the fixed "সব বিভাগ" button, the looping section rail, and the
 * full-category pop-up together — one open/close state shared by both.
 * Takes plain, serializable data (not functions) so a server component can
 * pass it straight through the client boundary.
 */
export function SectionNav({ baseParams, sec, sectionCounts, browseQuery, counts, current }: {
  baseParams: Record<string, string | undefined>;
  sec?: string;
  sectionCounts: Record<string, number>;
  browseQuery: string;
  counts: Record<string, number>;
  current?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SectionRail baseParams={baseParams} sec={sec} sectionCounts={sectionCounts} onBrowse={() => setOpen(true)} />
      <CategoryBrowser open={open} onOpenChange={setOpen} query={browseQuery} counts={counts} current={current} />
    </>
  );
}
