import type { Metadata } from "next";
import Link from "next/link";
import { mlFonts } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN } from "@/components/motherland/kit";
import { REFERENCES, type RefSection } from "@/data/motherland-references";
import { cn } from "@/lib/utils";
import "../motherland.css";

export const metadata: Metadata = {
  title: "References | MOTHERLAND",
  description: "Every source, photograph and film behind MOTHERLAND, page by page and section by section.",
  alternates: { canonical: "/bangladesh/references" },
};

const OUT = "underline decoration-ml-navy/30 underline-offset-4 hover:decoration-ml-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy";

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={OUT}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Section({ section }: { section: RefSection }) {
  return (
    <section className="flex flex-col gap-4 border-t border-ml-navy/12 pt-6">
      <h3 className="text-lg font-bold">{section.title}</h3>
      {section.sources.length ? (
        <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
          {section.sources.map((s) => (
            <li key={s.url} className="min-w-0 break-words">
              <External href={s.url}>{s.name}</External>
            </li>
          ))}
        </ul>
      ) : null}
      {section.notes.length ? (
        <ul className="flex flex-col gap-2 text-ml-navy/80">
          {section.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
      {section.credits.length ? (
        <details>
          <summary className="w-fit cursor-pointer rounded-sm font-semibold text-ml-navy/80 hover:text-ml-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
            Photographs and films ({section.credits.length})
          </summary>
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
            {section.credits.map(({ label, credit }) => (
              <li key={credit.sourceUrl} className="min-w-0 break-words text-ml-navy/85">
                {label}: <External href={credit.sourceUrl}>{credit.author}, {credit.source}</External>{" "}
                ({credit.licenseUrl ? <External href={credit.licenseUrl}>{credit.license}</External> : credit.license})
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/** One place for every reference: the pages listed down the side, each with its sections in the order it shows them. */
export default function ReferencesPage() {
  return (
    <div className={cn(mlFonts, "ml ml-light w-full bg-white font-ml-sans text-ml-navy")}>
      <MotherlandHeader solid />
      <main id="main" className="pt-16 lg:pt-31">
        <div className="bg-ml-navy py-14 text-white lg:py-20">
          <div className={cn(COLUMN, "flex flex-col gap-4")}>
            <h1 className="font-ml-sans font-extrabold text-[clamp(3rem,7vw,5.5rem)] leading-[1.08] tracking-[-0.03em]">References</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/85">Every source, photograph and film behind this site, page by page and section by section.</p>
          </div>
        </div>
        <div className={cn(COLUMN, "grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-16")}>
          <nav aria-label="Pages" className="lg:sticky lg:top-36 lg:max-h-[calc(100svh-10rem)] lg:self-start lg:overflow-y-auto">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
              {REFERENCES.map((page) => (
                <li key={page.id}>
                  <a href={`#${page.id}`} className="rounded-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                    {page.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex min-w-0 flex-col gap-14">
            {REFERENCES.map((page) => (
              <section key={page.id} id={page.id} aria-labelledby={`${page.id}-title`} className="flex scroll-mt-36 flex-col gap-6">
                <h2 id={`${page.id}-title`} className="font-ml-sans font-extrabold text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] tracking-[-0.03em]">
                  <Link href={page.href} className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                    {page.name}
                  </Link>
                </h2>
                {page.sections.map((s) => (
                  <Section key={s.title} section={s} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <MotherlandFooter />
    </div>
  );
}
