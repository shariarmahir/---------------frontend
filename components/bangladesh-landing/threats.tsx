import { Icon } from "@/components/ui/icon";
import { priorityBreaks, type PriorityBreak } from "@/data/amar-bangladesh";
import { chapterById } from "@/data/bangladesh";
import { Card, ChapterLink, Section } from "./kit";
import { EvidenceStatus } from "./landing-evidence";

/** 5 · What threatens it: the four breaks the evidence ranks first, each with what it costs left alone and what fixing it buys. */
export function LandingThreats() {
  const c = chapterById("crisis");
  return (
    <Section id="threats" title={c.title} lede={c.lede} action={<ChapterLink chapter="crisis" />}>
      <ol className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {priorityBreaks.slice(0, 4).map((b) => (
          <li key={b.id}>
            <BreakCard b={b} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function BreakCard({ b }: { b: PriorityBreak }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start gap-4">
        <span aria-hidden className="font-grotesk text-5xl leading-none font-bold text-bdnavy-300 tabular-nums">
          {String(b.rank).padStart(2, "0")}
        </span>
        <h3 className="pt-1 font-grotesk text-2xl leading-tight font-bold text-balance text-signal-orange">
          <span className="sr-only">Rank {b.rank}: </span>
          {b.title}
        </h3>
      </div>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
        <span className="font-grotesk text-5xl font-bold tracking-tight text-white lg:text-6xl">{b.headline}</span>
        <span className="text-lg font-semibold text-white/80">{b.headlineUnit}</span>
      </p>
      <p className="mt-1 text-sm text-white/80">{b.headlineCaption}</p>
      <dl className="mt-6 grid gap-5 border-t border-white/12 pt-6">
        <div>
          <dt className="flex items-center gap-2 font-grotesk text-sm font-bold text-crimson-bright">
            <Icon name="trending_down" className="text-lg!" />
            If unsolved
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-white/80">{b.ifUnsolved}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 font-grotesk text-sm font-bold text-signal-orange">
            <Icon name="trending_up" className="text-lg!" />
            If solved
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-white/80">{b.ifSolved}</dd>
        </div>
      </dl>
      <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-6 text-xs text-white/65">
        <span>Source: {b.source}</span>
        <EvidenceStatus status={b.status} />
      </p>
    </Card>
  );
}
