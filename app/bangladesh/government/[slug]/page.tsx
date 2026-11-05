import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HaveAQuestion, OfficialCard, Part, SideNav, DoItNow } from "@/components/bd-gov/detail";
import { servicesFor } from "@/data/bd-gov-services";
import { CONTAINER, Crumbs } from "@/components/bd-gov/kit";
import { ABOUT, BENEFITS, TOPICS, type GovCard } from "@/data/bd-gov";
import { DETAILS, UPDATED, detailFor, type DetailSection } from "@/data/bd-gov-details";
import { cn } from "@/lib/utils";

const HOME = "/bangladesh/government";

/** Each section's landing page and its cards: the breadcrumb and the side menu. */
const SECTIONS: Record<DetailSection, { title: string; href: string; cards: GovCard[] }> = {
  topics: { title: TOPICS.title, href: `${HOME}#all-topics`, cards: TOPICS.cards },
  about: { title: ABOUT.title, href: `${HOME}/about`, cards: ABOUT.cards },
  benefits: { title: BENEFITS.title, href: `${HOME}/benefits`, cards: BENEFITS.cards },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return DETAILS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const detail = detailFor((await params).slug);
  return detail ? { title: `${detail.title} | BD Guide`, description: detail.summary } : {};
}

/**
 * A topic page, after usa.gov/branches-of-government: breadcrumbs, the
 * section's pages down the side, the title and a plain-words lede, the
 * card that leads to the official site, the body's parts, the date it was
 * written, and "Have a question?".
 */
export default async function GovDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const detail = detailFor((await params).slug);
  if (!detail) notFound();

  const section = SECTIONS[detail.section];
  const here = `${HOME}/${detail.slug}`;
  const menu = section.cards.filter((c) => c.href.startsWith(`${HOME}/`) && !c.href.includes("#")).map((c) => ({ label: c.title, href: c.href }));

  return (
    <>
      <Crumbs
        trail={[
          { label: "Home", href: HOME },
          ...(detail.section === "topics" ? [] : [{ label: section.title, href: section.href }]),
          { label: detail.title, href: here },
        ]}
      />
      <div className={cn(CONTAINER, "grid gap-12 pt-2 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14")}>
        <div className="order-last lg:order-first">
          <SideNav title={section.title} href={section.href} items={menu} current={here} />
        </div>

        <article className="min-w-0">
          <h1 className="font-gv-serif text-[2.1rem] leading-[1.18] font-bold text-gv-navy text-balance lg:text-[2.75rem]">{detail.title}</h1>
          <p className="mt-5 max-w-[62ch] font-gv-serif text-[1.13rem] leading-[1.7]">{detail.intro}</p>
          <DoItNow services={servicesFor(detail.slug)} />
          <OfficialCard detail={detail} />
          {detail.parts.map((p) => (
            <Part key={p.title} part={p} />
          ))}
          <p className="mt-12 text-base text-gv-ink/70">Last updated: {UPDATED}</p>
          <HaveAQuestion call={detail.call} />
        </article>
      </div>
    </>
  );
}
