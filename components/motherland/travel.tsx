import { TRAVEL } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";
import { PinMap } from "./pin-map";

/**
 * The delta, drawn faintly across the whole width behind the heading: the
 * Jamuna and the Meghna wind along the top, the Padma under the words, and
 * all three meet on the right and fan out into the channels that carry them
 * to the sea. The courses keep clear of the title, the lede and the button.
 * Each is drawn as water: a soft bank, the body, a bright core, and a glint of
 * light running down it, `flow` seconds per pass, `lag` seconds behind its
 * neighbours so they never pulse together (.ml-water).
 */
const CHANNELS = [
  { d: "M-40 30C120 10 200 80 330 60S520 0 640 40S820 110 960 80S1120 40 1200 110", flow: 14, lag: 0 },
  { d: "M-40 100C100 120 180 60 300 90S480 130 600 100S800 60 900 110S1100 150 1200 110", flow: 12, lag: -5 },
  { d: "M-40 330C150 360 300 300 460 330S700 360 820 320S1000 230 1200 110", flow: 13, lag: -9 },
  { d: "M1200 110C1280 90 1360 40 1480 30", flow: 6, lag: -2 },
  { d: "M1200 110C1300 130 1380 110 1480 130", flow: 6, lag: -4 },
  { d: "M1200 110C1260 170 1320 220 1480 236", flow: 7, lag: -1 },
];

function Delta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      fill="none"
      strokeLinecap="round"
      className={cn("ml-water pointer-events-none absolute inset-x-0 top-0 h-80 w-full mask-b-from-60% lg:h-120", className)}
    >
      {CHANNELS.map(({ d, flow, lag }) => (
        <g key={d}>
          <path d={d} className="ml-water-bank" strokeWidth="30" />
          <path d={d} className="ml-water-body" strokeWidth="11" />
          <path d={d} className="ml-water-core" strokeWidth="3" />
          <path d={d} pathLength={100} className="ml-current ml-water-glint" strokeWidth="3" style={{ animationDuration: `${flow}s`, animationDelay: `${lag}s` }} />
        </g>
      ))}
    </svg>
  );
}

/** Geography & Travel: the reference site's "dream trip" map, one pin per place worth the journey. */
export function Travel() {
  return (
    <section id="travel" aria-labelledby="travel-title" className={cn(ANCHOR, BAND_Y, "relative overflow-hidden")}>
      <Delta />
      <div className={cn(COLUMN, "relative flex flex-col gap-12 lg:gap-14")}>
        <SectionHead id="travel-title" title={TRAVEL.title} lede={TRAVEL.lede} cta={TRAVEL.cta} />
        <PinMap places={TRAVEL.places} />
      </div>
    </section>
  );
}
