import Link from "next/link";
import { Card, COLUMN, TITLE } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { REPORT_META, sourcePoints, unsupportedClaims, type EvidenceStatus } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/** The evidence ladder: verified in gold, plausible in the navy tint, still to verify as an empty square. */
const STATUS: Record<EvidenceStatus, { label: string; pixel: string }> = {
  verified: { label: "Verified", pixel: "bg-signal-orange" },
  plausible: { label: "Plausible", pixel: "bg-bdnavy-400" },
  unverified: { label: "Needs verification", pixel: "ring-1 ring-inset ring-white/50" },
};

/**
 * The full research behind the 32 problems. The complete paper is not
 * published yet, so the card says so and opens what is live: the evidence
 * base as 32 pixels by status, the claims it refuses, Genius (/research)
 * and the evidence explorer.
 */
export function ResearchCard() {
  const statuses = Object.keys(STATUS) as EvidenceStatus[];
  return (
    <section id="research" aria-labelledby="research-title" className={cn(COLUMN, "section-band scroll-mt-header lg:scroll-mt-header-lg")}>
      <Card surface="ink" className="story-reveal grid gap-10 hover:translate-y-0 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:p-12">
        <div className="flex flex-col">
          <h2 id="research-title" className={TITLE}>
            The full research on the 32 problems
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            The complete paper brings together the hardships of rural areas, field observation, and data from the World Bank, IMF, UNICEF and BBS. It will be published in
            Genius, our research library; until then, the evidence base is open.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/research" className={btn.gold}>
              <Icon name="menu_book" className="text-xl" />
              Open Genius
            </Link>
            <Link href="/cholo-bangladesh-gori/evidence" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
              <Icon name="manage_search" className="text-xl" />
              Explore the evidence
            </Link>
          </div>
          <p className="mt-auto pt-8 text-xs text-white/65">
            Evidence base: {REPORT_META.title}, {REPORT_META.date}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <figure>
            <figcaption className="text-sm font-semibold text-white">The 32 source points by evidence status</figcaption>
            <ol aria-hidden className="mt-4 grid grid-cols-8 gap-1.5 sm:gap-2">
              {sourcePoints.map((p) => (
                <li key={p.n} title={`${p.n}. ${p.topic}: ${STATUS[p.status].label}`} className={cn("aspect-square rounded-md", STATUS[p.status].pixel)} />
              ))}
            </ol>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {statuses.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span aria-hidden className={cn("size-3.5 rounded-sm", STATUS[s].pixel)} />
                  <dt>{STATUS[s].label}</dt>
                  <dd className="font-grotesk font-bold text-white tabular-nums">{sourcePoints.filter((p) => p.status === s).length}</dd>
                </div>
              ))}
            </dl>
          </figure>

          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Icon name="rule" className="text-xl text-signal-orange" />
              Claims the evidence does not support
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {unsupportedClaims.map((c) => (
                <li key={c} className="rounded-xl bg-black/30 px-4 py-3 text-sm leading-relaxed text-white/80 ring-1 ring-white/12">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
