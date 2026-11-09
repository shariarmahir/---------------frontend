import { SCIENCE } from "@/data/motherland";
import { Band } from "./blocks";
import { PosterGrid } from "./poster";

/** Science & Tech, Built by Bangladesh: a poster card for each thing Bangladesh built (poster.tsx). */
export function Science() {
  return (
    <Band id="science" tone="white" title={SCIENCE.title} lede={SCIENCE.lede} cta={SCIENCE.cta}>
      <PosterGrid cards={SCIENCE.articles.map((a) => ({ ...a, line: a.place, action: "Read the story" }))} />
    </Band>
  );
}
