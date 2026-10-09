"use client";

import { ArrowUpRight } from "lucide-react";
import { PHASES, STEPS, type StepId } from "@/lib/media/journey";
import { AssetCard, AssetGrid, frameClass } from "../catalogue/asset-card";
import { toneStyle } from "../catalogue/tones";
import { STEP_ICON } from "../journey/journey";

/** Where each step is done; the first two are on this page. */
const WHERE: Record<StepId, string> = {
  find: "#finder",
  academy: "#academies",
  dept: "/media/academy/departments",
  course: "/media/academy/courses",
  admit: "/media/academy/checkout",
  routine: "/media/academy/routine",
  class: "/media/academy/classroom",
  exam: "/media/academy/exam",
  graduate: "/media/academy/graduation",
};

/** The university road in nine cards, each step's icon held in its frame, each with a door to where it is done. */
export function JourneyCards() {
  return (
    <AssetGrid count={STEPS.length}>
      {STEPS.map((s, i) => {
        const Icon = STEP_ICON[s.id];
        return (
          <li key={s.id} className="bg-(--c-bg)">
            <AssetCard
              kind={{ icon: Icon, label: `ধাপ · ${PHASES[s.phase]}` }}
              n={s.n}
              style={toneStyle(i)}
              className="tone"
              frame={
                <div className={frameClass}>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-24 place-items-center rounded-[1.6rem] bg-(--c-app) text-black drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover/frame:scale-[1.04]">
                      <Icon className="size-11" strokeWidth={1.6} aria-hidden />
                    </span>
                  </span>
                </div>
              }
              title={s.label}
              text={s.hint}
              action={{ href: WHERE[s.id], label: "এই ধাপে যান", icon: ArrowUpRight }}
            />
          </li>
        );
      })}
    </AssetGrid>
  );
}
