"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Card, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { CITY_RIGHTS, SHIELD_LAYERS } from "@/data/desh";
import { cn } from "@/lib/utils";

const SIZE = 320;
const C = SIZE / 2;
/** Ring radii, innermost (me) first. */
const R = SHIELD_LAYERS.map((_, i) => 36 + i * 24);
const SURFACES: Surface[] = ["navy", "ink", "cobalt"];

/**
 * The citizen shield: six rings from the self to the country. Choosing a
 * ring lights it and every ring inside it (a ring only holds when the ones
 * within it hold) and shows that layer's promise, its practical acts and
 * the kindness that goes with it. The rings are a picture; the tabs beside
 * them are the control, with arrow keys between them.
 */
export function CitizenShield() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const layer = SHIELD_LAYERS[active];

  const onKey = (e: KeyboardEvent) => {
    const last = SHIELD_LAYERS.length - 1;
    const to = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + last + 1) % (last + 1);
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <Section
      id="shield"
      title="The citizen shield: from yourself to the country"
      lede="The shield against a national crisis is built from the inside out. Every layer carries a duty and a kindness, and a layer only holds when the one inside it holds."
    >
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="story-reveal mx-auto w-full max-w-md">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" aria-hidden>
            {[...R].reverse().map((r, ri) => {
              const i = R.length - 1 - ri;
              const lit = i <= active;
              const on = i === active;
              return (
                <g key={i} className="cursor-pointer" onClick={() => setActive(i)}>
                  <circle
                    cx={C}
                    cy={C}
                    r={r}
                    className={cn(
                      "transition-[fill,stroke] duration-500 motion-reduce:transition-none",
                      lit ? (i % 2 ? "fill-bdnavy-700" : "fill-bdnavy-900") : "fill-black",
                      on ? "stroke-signal-orange" : lit ? "stroke-bdnavy-300/60" : "stroke-white/20",
                    )}
                    strokeWidth={on ? 2.5 : 1}
                  />
                  {/* The label runs along the top of its band. */}
                  <path id={`shield-arc-${i}`} d={`M ${C - r + 16} ${C} A ${r - 16} ${r - 16} 0 0 1 ${C + r - 16} ${C}`} fill="none" />
                  <text className={cn("font-sans text-[12.5px] font-semibold transition-[fill] duration-500 motion-reduce:transition-none", on ? "fill-signal-orange" : lit ? "fill-white" : "fill-white/65")}>
                    <textPath href={`#shield-arc-${i}`} startOffset="50%" textAnchor="middle">
                      {SHIELD_LAYERS[i].ring}
                    </textPath>
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="story-reveal">
          <div role="tablist" aria-label="Layers of the shield" onKeyDown={onKey} className="flex flex-wrap gap-2">
            {SHIELD_LAYERS.map((l, i) => {
              const on = i === active;
              return (
                <button
                  key={l.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`shield-tab-${l.id}`}
                  aria-selected={on}
                  aria-controls="shield-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
                    on ? "bg-signal-orange text-text-primary" : "bg-bdnavy-900 text-white ring-1 ring-white/12 hover:bg-bdnavy-700",
                  )}
                >
                  <span className={cn("tabular-nums", on ? "text-text-primary/70" : "text-bdnavy-300")}>{i + 1}</span>
                  {l.ring}
                </button>
              );
            })}
          </div>

          <Card surface="navy" className="mt-6 hover:translate-y-0">
            <div id="shield-panel" role="tabpanel" aria-labelledby={`shield-tab-${layer.id}`}>
              <h3 className="font-grotesk text-2xl leading-tight font-bold text-signal-orange sm:text-3xl">{layer.title}</h3>
              <p className="mt-4 font-grotesk text-xl leading-relaxed font-semibold text-balance text-white">“{layer.promise}”</p>
              <h4 className="mt-6 text-sm font-semibold text-white/80">In practice</h4>
              <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                {layer.acts.map((act) => (
                  <li key={act} className="flex items-start gap-2.5 rounded-2xl bg-black/30 p-4 text-base leading-snug text-white ring-1 ring-white/12">
                    <Icon name="check" className="mt-0.5 text-lg text-signal-orange" />
                    {act}
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-start gap-3 border-t border-white/12 pt-5 text-base leading-relaxed text-white/80">
                <Icon name="favorite" filled className="mt-0.5 text-xl text-signal-orange" />
                {layer.kindness}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}

/** What the city owes every resident, and each resident's part in keeping it. */
export function CityRights() {
  return (
    <Section
      id="city-rights"
      title="City rights: owed, not granted, and ours to protect"
      lede="Eight things a city owes every resident. Each one holds only when residents do their part too."
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CITY_RIGHTS.map((r, i) => (
          <li key={r.right} className="story-reveal flex">
            <Card surface={SURFACES[i % 3]} className="flex w-full flex-col p-6 sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-black/30 text-signal-orange ring-1 ring-white/12">
                <Icon name={r.icon} className="text-2xl" />
              </span>
              <h3 className="mt-5 font-grotesk text-lg font-bold">{r.right}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{r.what}</p>
              <p className="mt-auto border-t border-white/12 pt-4 text-sm leading-relaxed text-white">
                <span className="font-semibold">My part: </span>
                {r.myPart}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const NEXT = [
  {
    href: "/nagorik",
    icon: "how_to_reg",
    title: "Citizen rights and duties",
    body: "How people in Bangladesh spend their day, your fundamental rights under the Constitution, the road to justice, and the duties of every age.",
    surface: "navy",
  },
  {
    href: "/protibad",
    icon: "campaign",
    title: "Protest wrongdoing",
    body: "Report extortion, bribery, land grabbing or a denied service, find the authority that handles it, and keep a public record.",
    surface: "cobalt",
  },
] satisfies { href: string; icon: string; title: string; body: string; surface: Surface }[];

/** Where to act next: the rights and duties page and the protest desk. */
export function ShieldNext() {
  return (
    <Section id="act" title="Put the shield to work" lede="Know your rights and duties, and when you see wrongdoing, raise it where it will be heard.">
      <ul className="grid gap-4 md:grid-cols-2">
        {NEXT.map((n) => (
          <li key={n.href} className="story-reveal flex">
            <Card href={n.href} surface={n.surface} className="group flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-signal-orange text-text-primary">
                <Icon name={n.icon} className="text-3xl" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="flex items-center gap-2 font-grotesk text-2xl font-bold text-signal-orange">
                  {n.title}
                  <Icon name="arrow_forward" className="text-2xl transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
                <span className="text-base leading-relaxed text-white/80">{n.body}</span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
