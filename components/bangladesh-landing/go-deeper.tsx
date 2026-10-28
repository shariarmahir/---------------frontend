import { GeniusLogo } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";
import { Card, Section } from "./kit";

/** 9 · Go deeper: the research behind the 32 problems. */
export function LandingGoDeeper() {
  return (
    <Section id="go-deeper" title="Go deeper">
      <Card href="/research" className="group grid items-center gap-8 sm:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
        <div className="grid h-48 place-items-center rounded-2xl bg-black ring-1 ring-white/12 sm:h-56">
          <GeniusLogo className="h-14 sm:h-16" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-grotesk text-2xl font-bold text-balance text-signal-orange sm:text-3xl">The research, in Genius</h3>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">
            Bangladesh&apos;s open research library: studies linked to the 32 problems, from floods and river erosion to prices, schools and health, free to read and cite.
          </p>
          <span className="mt-8 flex items-center gap-2 font-grotesk text-sm font-bold text-white">
            Explore the research
            <Icon name="arrow_forward" className="text-lg! text-signal-orange transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </Card>
    </Section>
  );
}
