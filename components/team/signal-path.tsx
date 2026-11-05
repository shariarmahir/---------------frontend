import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** How one idea travels from the founder's vision to a village. */
const STEPS = [
  { icon: "neurology", title: "Vision", body: "The founder sets the mission and the next sector to fix." },
  { icon: "workspace_premium", title: "Leadership", body: "Operations and marketing turn it into a plan and partners." },
  { icon: "lightbulb", title: "Idea & client", body: "Creative and client teams shape it around real users." },
  { icon: "memory", title: "Engineering", body: "IoT and AI teams build the hardware and the software." },
  { icon: "home_health", title: "The village", body: "It ships: to a pharmacy, a phone, a wrist." },
];

/** Tiles alternate cobalt and navy; the village, where the signal lands, is gold. */
const TILE = ["bg-cobalt text-signal-orange", "bg-bdnavy-900 text-signal-orange ring-1 ring-white/15", "bg-cobalt text-signal-orange", "bg-bdnavy-900 text-signal-orange ring-1 ring-white/15", "bg-signal-orange text-text-primary"];

/**
 * The five hand-offs as one connected path: a hairline joins the stops and
 * a gold pulse runs along it from the vision to the village, across the
 * page from lg and down its left edge on smaller screens. The pulse is the
 * site's seam pulse (`signal-path-run`) and rests under reduced motion.
 */
export function SignalPath() {
  return (
    <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
      {/* The line: vertical through the tiles' centres on small screens, horizontal from lg. */}
      <span aria-hidden className="pointer-events-none absolute top-7 bottom-7 left-7 w-px overflow-hidden bg-white/15 lg:top-7 lg:right-[10%] lg:bottom-auto lg:left-[10%] lg:h-px lg:w-auto">
        <span className="signal-path-run absolute inset-x-0 top-0 h-1/4 bg-signal-orange lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/4" />
      </span>
      {STEPS.map((s, i) => (
        <li key={s.title} className="story-reveal relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 lg:flex lg:flex-col lg:items-center lg:gap-0 lg:text-center">
          <span className={cn("relative z-10 grid size-14 place-items-center rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none", TILE[i])}>
            <Icon name={s.icon} className="text-3xl!" />
          </span>
          <div className="lg:mt-5">
            <h3 className="font-grotesk text-lg font-bold text-white">{s.title}</h3>
            <p className="mt-1.5 max-w-[30ch] font-sans text-sm leading-relaxed text-white/75 lg:mx-auto">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
