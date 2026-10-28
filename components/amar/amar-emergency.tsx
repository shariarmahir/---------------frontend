import { Card, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { emergencyCategories, type EmergencyCategory } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

const SURFACES: Surface[] = ["ink", "cobalt", "navy"];

/** Critical marked in the flag's red (urgency), high in plain white; the word stays white so it reads on every card colour. */
function Tone({ tone }: { tone: EmergencyCategory["tone"] }) {
  const critical = tone === "critical";
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
      <span aria-hidden className={cn("size-2.5 rounded-full", critical ? "bg-crimson-bright ring-2 ring-crimson-bright/30" : "bg-white/65")} />
      {critical ? "Critical" : "High"}
    </span>
  );
}

const points = (n: number) => `${n} source point${n === 1 ? "" : "s"}`;

/**
 * What the evidence says to act on first: the measurement and
 * accountability layer as the large card (every other fix needs it to be
 * targeted and checked), the seven areas it then serves around it, and a
 * way into the 32 problems behind them.
 */
export function AmarEmergency() {
  const [first, ...rest] = emergencyCategories;
  return (
    <Section
      id="measurement"
      title="Solve the measurement layer first"
      lede="The practical lesson of the whole dossier: build the measurement and accountability layer, then use it to target health, learning, jobs, pollution, logistics, energy, safety and innovation."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="story-reveal flex sm:col-span-2 lg:row-span-2">
          <Card surface="navy" className="flex w-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-signal-orange text-text-primary">
                <Icon name={first.icon} className="text-3xl" />
              </span>
              <Tone tone={first.tone} />
            </div>
            <h3 className="mt-6 font-grotesk text-2xl leading-tight font-bold text-balance text-signal-orange sm:text-3xl">{first.title}</h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white">{first.summary}</p>
            <ul aria-label="What the layer is made of" className="mt-6 flex flex-wrap gap-2 text-sm text-white">
              {["Denominators", "Complaint tracking", "Audit trails"].map((part) => (
                <li key={part} className="flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-2 ring-1 ring-white/12">
                  <Icon name="check" className="text-base text-signal-orange" />
                  {part}
                </li>
              ))}
            </ul>
            <p className="mt-auto flex items-center gap-1.5 pt-6 text-sm text-white/80">
              <Icon name="tag" className="text-base" />
              {points(first.pointCount)}
            </p>
          </Card>
        </li>

        {rest.map((cat, i) => (
          <li key={cat.id} className="story-reveal flex">
            <Card surface={SURFACES[i % 3]} className="flex w-full flex-col p-6 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-black/30 text-signal-orange ring-1 ring-white/12">
                  <Icon name={cat.icon} className="text-2xl" />
                </span>
                <Tone tone={cat.tone} />
              </div>
              <h3 className="mt-5 font-grotesk text-lg leading-snug font-bold text-balance">{cat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{cat.summary}</p>
              <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs text-white/80">
                <Icon name="tag" className="text-sm" />
                {points(cat.pointCount)}
              </p>
            </Card>
          </li>
        ))}

        <li className="story-reveal flex">
          <Card href="/bangladesh/problems" surface="navy" className="group flex w-full flex-col justify-between gap-6 p-6 sm:p-6">
            <span className="font-grotesk text-lg leading-snug font-bold text-balance">Every one of the 32 problems, with its evidence</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-signal-orange">
              Open chapter 4
              <Icon name="arrow_forward" className="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </span>
          </Card>
        </li>
      </ul>
    </Section>
  );
}
