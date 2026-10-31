import { INVEST } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { InvestLab } from "./invest-lab";
import { ANCHOR, COLUMN, SectionHead } from "./kit";

/** Business & Investment: the opportunities, and a future the visitor can shape and watch redraw. */
export function Invest() {
  return (
    <section id="invest" aria-labelledby="invest-title" className={cn(ANCHOR, "bg-ml-ink py-24 text-white sm:py-32")}>
      <div className={cn(COLUMN, "flex flex-col gap-14 lg:gap-16")}>
        <SectionHead id="invest-title" tone="dark" title={INVEST.title} lede={INVEST.lede} />
        <InvestLab />
      </div>
    </section>
  );
}
