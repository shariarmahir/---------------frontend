import { CULTURE } from "@/data/motherland";
import { Band } from "./blocks";
import { CollageGrid } from "./collage";

/** Arts & Culture: one card for each craft. */
export function Culture() {
  return (
    <Band id="culture" tone="sun" title={CULTURE.title} lede={CULTURE.lede} cta={CULTURE.cta}>
      <CollageGrid ground="white" cards={CULTURE.crafts.map((c) => ({ title: c.name, text: c.note, picture: c.picture }))} />
    </Band>
  );
}
