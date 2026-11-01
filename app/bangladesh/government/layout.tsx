/*
 * BD Guide (Mahir, 2026-11-01): an independent guide to the Bangladesh
 * government, laid out after usa.gov (its home page's "All topics and
 * services" and its About page) in MOTHERLAND's and Kandari-Lab's colours,
 * reached from MOTHERLAND's Gov button. It has its own header and footer
 * in place of the site's, says plainly that it is not a government
 * website, and sends every service to the official page. The "Bangladesh
 * National Portal" screen carries the data gathered from bangladesh.gov.bd.
 * Copy, facts and links: data/bd-gov.ts.
 */
import type { ReactNode } from "react";
import { merriweather, sourceSans } from "@/components/bd-gov/fonts";
import { GovFooter } from "@/components/bd-gov/gov-footer";
import { GovHeader } from "@/components/bd-gov/gov-header";
import { HelpNote } from "@/components/bd-gov/help-note";
import { montserrat } from "@/components/motherland/fonts";
import { cn } from "@/lib/utils";

export default function GovernmentLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(merriweather.variable, sourceSans.variable, montserrat.variable, "min-h-screen w-full bg-white font-gv-sans text-[1.13rem] leading-normal text-gv-ink")}>
      <GovHeader />
      <main id="main" className="pb-28 has-data-flush:pb-0">
        {children}
      </main>
      <GovFooter />
      <HelpNote />
    </div>
  );
}
