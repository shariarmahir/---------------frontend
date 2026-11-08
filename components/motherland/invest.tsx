import { INVEST } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { InvestLab } from "./invest-lab";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";

/** Business & Investment: a future the visitor can shape and watch redraw, at a medium width so the graph and its controls read together. */
export function Invest() {
  return (
    <section id="invest" aria-labelledby="invest-title" className={cn(ANCHOR, BAND_Y, "bg-ml-ink text-white")}>
      <div className={cn(COLUMN, "flex max-w-7xl flex-col gap-10 lg:gap-12")}>
        <SectionHead id="invest-title" tone="dark" title={INVEST.title} lede={INVEST.lede} cta={INVEST.cta} />
        <InvestLab />
      </div>
    </section>
  );
}
