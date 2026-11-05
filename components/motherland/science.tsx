import { SCIENCE } from "@/data/motherland";
import { Band, Mosaic } from "./blocks";

/** Science & Tech: one card for each thing Bangladesh built. */
export function Science() {
  return (
    <Band id="science" tone="white" title={SCIENCE.title} lede={SCIENCE.lede} cta={SCIENCE.cta}>
      <Mosaic tone="white" cards={SCIENCE.articles} />
    </Band>
  );
}
