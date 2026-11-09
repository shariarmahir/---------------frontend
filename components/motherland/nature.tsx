import { NATURE } from "@/data/motherland";
import { Band } from "./blocks";
import { CollageGrid } from "./collage";

/** Animals & Nature: the national animal, bird, flower and fish, and the rest of the wild. */
export function Nature() {
  return (
    <Band id="nature" tone="mint" title={NATURE.title} lede={NATURE.lede} cta={NATURE.cta}>
      <CollageGrid ground="white" cards={NATURE.wild.map((w) => ({ title: w.name, text: w.note, picture: w.picture }))} />
    </Band>
  );
}
