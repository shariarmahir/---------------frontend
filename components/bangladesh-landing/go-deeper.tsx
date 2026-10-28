import type { ReactNode } from "react";
import { PixelMap } from "@/components/desh/pixel-map";
import { GeniusLogo } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";
import { Card, Section, type Surface } from "./kit";

/** 9 · Go deeper: the research behind the 32 problems, and the game built on them. */
export function LandingGoDeeper() {
  return (
    <Section id="go-deeper" title="Go deeper">
      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <li>
          <DeepCard
            href="/research"
            surface="navy"
            title="The research, in Genius"
            body="Bangladesh's open research library: studies linked to the 32 problems, from floods and river erosion to prices, schools and health, free to read and cite."
            cta="Explore the research"
          >
            <GeniusLogo className="h-14 sm:h-16" />
          </DeepCard>
        </li>
        <li>
          <DeepCard
            href="/cholo-bangladesh-gori"
            surface="cobalt"
            title="Build Bangladesh, the game"
            body="A co-operative crisis game for two to four players over the same 32 problems. Play with friends or with bots, and heal the map together, pixel by pixel."
            cta="Play the game"
          >
            <PixelMap healed label="The pixel map of Bangladesh with every pixel healed" className="h-36 w-auto sm:h-40" />
          </DeepCard>
        </li>
      </ul>
    </Section>
  );
}

function DeepCard({ href, surface, title, body, cta, children }: { href: string; surface: Surface; title: string; body: string; cta: string; children: ReactNode }) {
  return (
    <Card href={href} surface={surface} className="group flex h-full flex-col gap-8 sm:p-10">
      <div className="grid h-48 place-items-center rounded-2xl bg-black ring-1 ring-white/12 sm:h-56">{children}</div>
      <div className="flex flex-1 flex-col">
        <h3 className="font-grotesk text-2xl font-bold text-balance text-signal-orange sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">{body}</p>
        <span className="mt-auto flex items-center gap-2 pt-8 font-grotesk text-sm font-bold text-white">
          {cta}
          <Icon name="arrow_forward" className="text-lg! text-signal-orange transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Card>
  );
}
