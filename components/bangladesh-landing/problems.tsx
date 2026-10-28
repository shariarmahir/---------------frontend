import { PixelMap } from "@/components/desh/pixel-map";
import { sourcePoints, type EvidenceStatus as Status } from "@/data/amar-bangladesh";
import { chapterById } from "@/data/bangladesh";
import { ChapterLink, Section } from "./kit";
import { EvidenceStatus } from "./landing-evidence";
import { LandingProblemGrid } from "./landing-problem-grid";

const STATUSES: Status[] = ["verified", "plausible", "unverified"];

/** 6 · 32 problems, pixel by pixel: the map with its 32 bad pixels beside the problems themselves, filterable by theme. */
export function LandingProblems() {
  const c = chapterById("problems");
  return (
    <Section
      id="problems"
      title={c.title}
      lede="Bangladesh as a low-resolution image: each unsolved problem is one bad pixel. Here are all 32, with how urgent each is and how well the evidence holds."
      action={<ChapterLink chapter="problems" />}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <figure className="lg:sticky lg:top-[calc(var(--spacing-header-lg)+2rem)] lg:col-span-4 lg:self-start">
          <div className="rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
            <PixelMap label="Map of Bangladesh drawn in pixels, 32 of them red: one for each unsolved problem" className="mx-auto w-full max-w-72 lg:max-w-none" />
          </div>
          <figcaption className="mt-5 grid gap-3 text-sm text-white/80">
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="size-3 shrink-0 rounded-[3px] bg-national-crimson" />
              One problem still unsolved
            </span>
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="flex shrink-0 gap-0.5">
                <span className="size-3 rounded-[3px] bg-bdnavy-500" />
                <span className="size-3 rounded-[3px] bg-signal-orange" />
              </span>
              Land that works
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/12 pt-4">
              <span className="text-white/65">Evidence:</span>
              {STATUSES.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <EvidenceStatus status={s} />
                  <span className="text-xs text-white/65 tabular-nums">{sourcePoints.filter((p) => p.status === s).length}</span>
                </span>
              ))}
            </span>
          </figcaption>
        </figure>
        <div className="lg:col-span-8">
          <LandingProblemGrid points={sourcePoints} />
        </div>
      </div>
    </Section>
  );
}
