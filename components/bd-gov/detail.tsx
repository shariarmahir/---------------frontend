import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { PORTAL, SITE, type GovLink } from "@/data/bd-gov";
import type { DetailPart, GovDetail } from "@/data/bd-gov-details";
import { cn } from "@/lib/utils";
import { GovAnchor, LINK } from "./kit";

/*
 * The pieces of a detail page, after usa.gov's topic pages (such as
 * usa.gov/branches-of-government): the side menu of the section's other
 * pages, the official-site card the page exists to lead to, the body's
 * headed parts, and the closing "Have a question?" box.
 */

const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The section's pages, the current one marked with a green rule. */
export function SideNav({ title, href, items, current }: { title: string; href: string; items: GovLink[]; current: string }) {
  return (
    <nav aria-label={title} className="lg:sticky lg:top-6">
      <GovAnchor href={href} className="font-gv-serif text-[1.13rem] leading-snug font-bold text-gv-navy hover:underline focus-visible:outline-3 focus-visible:outline-gv-green">
        {title}
      </GovAnchor>
      <ul className="mt-3 divide-y divide-gv-line border-y border-gv-line text-base">
        {items.map((l) => {
          const here = l.href === current;
          return (
            <li key={l.href}>
              <GovAnchor
                href={l.href}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "block border-l-4 py-2.5 pr-2 pl-4 leading-snug transition-colors focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gv-green",
                  here ? "border-gv-green bg-gv-paper font-bold text-gv-navy" : "border-transparent text-gv-ink hover:bg-gv-paper hover:text-gv-navy",
                )}
              >
                {l.label}
              </GovAnchor>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The office behind the topic, and the button that goes straight to its site. */
export function OfficialCard({ detail }: { detail: GovDetail }) {
  const { office, href, site } = detail.official;
  return (
    <aside aria-label="Official site" className="relative isolate mt-8 overflow-hidden rounded-3xl bg-gv-navy p-6 text-white shadow-[0_30px_60px_-30px_rgb(11_24_73/0.8)] ring-1 ring-gv-navy/10 sm:p-8">
      <span aria-hidden className="absolute top-3 right-3 -z-10 size-36 rounded-full border-[20px] border-white/5" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <span aria-hidden className="grid size-20 shrink-0 place-items-center sm:size-22">
          <CardIcon name={`gov/${detail.icon}`} fallback={detail.symbol} size={64} delay={3200} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base text-white/70">The official source</p>
          <p className="mt-0.5 font-gv-serif text-[1.3rem] leading-snug font-bold">{office}</p>
          <p className="mt-1 text-base break-words text-gv-gold">{site}</p>
        </div>
        <a
          href={href}
          className="group/site inline-flex min-h-13 shrink-0 items-center justify-center gap-3 rounded-full bg-gv-gold py-1.5 pr-2 pl-7 text-[1.06rem] font-bold text-gv-navy shadow-[0_12px_24px_-12px_rgb(0_0_0/0.6)] transition-colors duration-300 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Go to the official site
          <span aria-hidden className="grid size-10 place-items-center rounded-full bg-gv-navy text-gv-gold transition-transform group-hover/site:translate-x-0.5">
            <Icon name="north_east" className="text-[1.2rem]! font-bold" />
          </span>
        </a>
      </div>
    </aside>
  );
}

/** One headed part of the page body: its text, then a list, then its official links. */
export function Part({ part }: { part: DetailPart }) {
  const List = part.numbered ? "ol" : "ul";
  return (
    <section aria-labelledby={anchor(part.title)} className="mt-12">
      <h2 id={anchor(part.title)} className="scroll-mt-6 font-gv-serif text-[1.6rem] leading-tight font-bold text-gv-ink">
        {part.title}
      </h2>
      {part.text ? <p className="mt-4 max-w-[68ch] leading-[1.65]">{part.text}</p> : null}
      {part.points ? (
        <List className={cn("mt-4 max-w-[68ch] space-y-2.5 pl-7 leading-[1.6] marker:font-bold marker:text-gv-green", part.numbered ? "list-decimal" : "list-disc")}>
          {part.points.map((p) => (
            <li key={p} className="pl-1.5">
              {p}
            </li>
          ))}
        </List>
      ) : null}
      {part.links ? (
        <ul className="mt-5 flex flex-col gap-2.5">
          {part.links.map((l) => (
            <li key={l.href}>
              <GovAnchor href={l.href} className={cn(LINK, "font-semibold")}>
                {l.label}
              </GovAnchor>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** usa.gov's "Have a question?": the helpline, and the topic's own number when it has one. */
export function HaveAQuestion({ call }: { call?: GovDetail["call"] }) {
  const pill = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition-colors duration-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-navy";
  return (
    <section aria-labelledby="question" className="mt-14 rounded-3xl bg-gv-paper p-6 ring-1 ring-gv-ink/8 sm:p-8">
      <h2 id="question" className="font-gv-serif text-[1.46rem] leading-tight font-bold text-gv-navy">
        Have a question?
      </h2>
      <p className="mt-3 max-w-[60ch]">
        Call {SITE.alert.info} for government information and services, free from any phone in Bangladesh.
        {call ? ` For this topic, you can also call ${call.tel}: ${call.label}.` : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`tel:${SITE.alert.info}`} className={cn(pill, "bg-gv-navy text-white hover:bg-gv-gold hover:text-gv-navy")}>
          <Icon name="call" className="text-xl!" />
          Call {SITE.alert.info}
        </a>
        {call && call.tel !== SITE.alert.info ? (
          <a href={`tel:${call.tel}`} className={cn(pill, "bg-white text-gv-navy ring-1 ring-gv-navy/25 hover:bg-gv-navy hover:text-white")}>
            <Icon name="call" className="text-xl!" />
            Call {call.tel}
          </a>
        ) : null}
        <a href={PORTAL} className={cn(pill, "bg-white text-gv-navy ring-1 ring-gv-navy/25 hover:bg-gv-navy hover:text-white")}>
          Visit bangladesh.gov.bd
        </a>
      </div>
    </section>
  );
}
