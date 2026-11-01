import Link from "next/link";
import { FOOTER, PORTAL } from "@/data/bd-gov";
import { cn } from "@/lib/utils";
import { CONTAINER, GovAnchor } from "./kit";
import { Mark } from "./mark";

const QUIET_LINK = "rounded-sm text-white/70 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gv-gold";

/**
 * The guide's footer, in Kandari navy: the wordmark and what the guide is,
 * three columns of links, and a last line that says plainly this is not a
 * government website (the help numbers live in the corner note).
 */
export function GovFooter() {
  return (
    <footer className="bg-gv-navy text-white">
      <div className={cn(CONTAINER, "grid gap-12 py-16 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-10 lg:py-20")}>
        <div className="flex flex-col gap-6">
          <Link href="/bangladesh/government" className="self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gv-gold">
            <Mark tone="white" className="text-[2.75rem]" />
          </Link>
          <p className="max-w-xs text-base leading-relaxed text-white/70">{FOOTER.blurb}</p>
        </div>

        {FOOTER.columns.map((col, i) => (
          <nav key={col.title} aria-labelledby={`gv-foot-${i}`}>
            <h3 id={`gv-foot-${i}`} className="text-base font-bold">
              {col.title}
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-base">
              {col.links.map((l) => (
                <li key={l.label}>
                  <GovAnchor href={l.href} className={QUIET_LINK}>
                    {l.label}
                  </GovAnchor>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className={cn(CONTAINER, "flex flex-col gap-4 py-6 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between")}>
          <p className="max-w-2xl leading-relaxed">
            {FOOTER.identity}, made by{" "}
            <GovAnchor href={FOOTER.maker.href} className="font-semibold text-white/85 hover:text-white hover:underline">
              {FOOTER.maker.label}
            </GovAnchor>
            . {FOOTER.disclaimer}{" "}
            <a href={PORTAL} className="font-semibold text-white/85 hover:text-white hover:underline">
              bangladesh.gov.bd
            </a>
            .
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER.legal.map((l) => (
              <li key={l.label}>
                <GovAnchor href={l.href} className={QUIET_LINK}>
                  {l.label}
                </GovAnchor>
              </li>
            ))}
            <li>
              <a href="https://lordicon.com/" className={QUIET_LINK}>
                Animated icons by Lordicon
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
