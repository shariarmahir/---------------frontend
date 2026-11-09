import { BIOGRAPHIES } from "@/data/motherland";
import { Band } from "./blocks";
import { CollageGrid } from "./collage";

/** Biographies: full rows of portraits, each with a life in two lines. */
export function Biographies() {
  return (
    <Band id="biographies" tone="navy" title={BIOGRAPHIES.title} lede={BIOGRAPHIES.lede} cta={BIOGRAPHIES.cta}>
      <CollageGrid ground="white" portrait cards={BIOGRAPHIES.lives.map((l) => ({ title: l.name, meta: l.years, text: l.text, picture: l.picture }))} />
    </Band>
  );
}
