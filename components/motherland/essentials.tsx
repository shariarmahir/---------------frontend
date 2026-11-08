import { ESSENTIALS } from "@/data/motherland-essentials";
import { Band } from "./blocks";
import { CollageGrid } from "./collage";

/** The way to the pages the sections above do not reach: Facts, the government guide and the trip planner. */
export function Essentials() {
  return (
    <Band id="essentials" tone="white" title={ESSENTIALS.title} lede={ESSENTIALS.lede}>
      <CollageGrid ground="sun" cards={ESSENTIALS.cards} />
    </Band>
  );
}
