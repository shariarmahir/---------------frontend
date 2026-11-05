import { ESSENTIALS } from "@/data/motherland-essentials";
import { Band, Wall } from "./blocks";

/** The way to the pages the sections above do not reach: Facts, the government guide and the trip planner. */
export function Essentials() {
  return (
    <Band id="essentials" tone="white" title={ESSENTIALS.title} lede={ESSENTIALS.lede}>
      <Wall columns={3} cards={ESSENTIALS.cards} />
    </Band>
  );
}
