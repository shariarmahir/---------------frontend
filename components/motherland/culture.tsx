import { CULTURE } from "@/data/motherland";
import { Band, Mosaic } from "./blocks";

/** Arts & Culture: one card for each craft. */
export function Culture() {
  return (
    <Band id="culture" tone="sun" title={CULTURE.title} lede={CULTURE.lede} cta={CULTURE.cta}>
      <Mosaic tone="sun" cards={CULTURE.crafts.map((c) => ({ title: c.name, text: c.note, picture: c.picture }))} />
    </Band>
  );
}
