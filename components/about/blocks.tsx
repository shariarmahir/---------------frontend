import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Value } from "@/data/about";
import { cn } from "@/lib/utils";
import { ABOUT_FIELDS, OFFSET_CARD, OFFSET_LIFT, type AboutField } from "./offset";
import { PixelResolve } from "./pixel-resolve";

/*
 * The About page's own pieces: the motto hero, the page index strip, the
 * section heading, the four value cards and the "who we are" band.
 */

/**
 * Who we are: the claim, one paragraph and the actions on the left; on the
 * right the photograph in a round frame in front of a cobalt disc set off
 * behind it, arriving as a few solid blocks and repairing itself to full
 * sharpness once in view. On /about it is a full-width navy band cut like
 * the catalogue pages' hero (after banglalink.net's offer pages); `card`
 * sets it as a navy card in the content column instead, the size of the
 * Kandari Profile section (the home page).
 */
export function RepairBand({
  id = "who-we-are",
  card = false,
  title,
  lead,
  children,
}: {
  id?: string;
  card?: boolean;
  title: ReactNode;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "relative scroll-mt-header lg:scroll-mt-header-lg",
        card ? "section-band mx-auto max-w-7xl px-gutter-x" : "overflow-hidden bg-bdnavy-900",
      )}
    >
      <div
        className={cn(
          "grid min-h-72 items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] lg:min-h-80 lg:gap-16",
          card
            ? "story-reveal overflow-hidden rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-10"
            : "mx-auto max-w-7xl px-gutter-x py-10",
        )}
      >
        <div className={cn("flex flex-col items-start gap-4", !card && "hero-rise")}>
          <h2 id={`${id}-title`} className="font-grotesk text-4xl leading-[1.1] font-bold tracking-tight text-balance text-white sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-2xl font-sans text-base leading-relaxed text-white/80 sm:text-lg">{lead}</p>
          <div className="mt-2 flex flex-wrap gap-3">{children}</div>
        </div>

        <div className="flex items-center justify-center md:justify-end">
          <div className="catalog-fade relative pr-12">
            <span aria-hidden className="absolute top-1/2 right-0 size-52 -translate-y-1/2 rounded-full bg-cobalt sm:size-60 xl:size-72" />
            {/* Framed on the tree and the farmer walking past it. */}
            <PixelResolve
              src="/about/silk-cotton-field.jpg"
              alt="A flowering silk-cotton tree beside green paddy fields in a golden morning haze, a farmer walking the path with a basket"
              sizes="(min-width: 1280px) 320px, (min-width: 640px) 256px, 224px"
              position={[0.38, 0.5]}
              className="size-56 rounded-full ring-4 ring-bdnavy-900 sm:size-64 xl:size-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** A section heading set like the landing page's (SectionHeading): flush left, the gold title on one line from lg, one line under it. */
export function AboutHeading({ id, title, lead, className }: { id: string; title: string; lead?: string; className?: string }) {
  return (
    <div className={cn("story-reveal mb-10 flex flex-col gap-3", className)}>
      <h2
        id={id}
        className="font-grotesk text-2xl leading-[1.2] font-bold tracking-tight text-balance text-signal-orange sm:text-3xl lg:text-4xl lg:whitespace-nowrap"
      >
        {title}
      </h2>
      {lead ? <p className="max-w-3xl font-sans text-base leading-relaxed text-white/80 lg:max-w-none">{lead}</p> : null}
    </div>
  );
}

/** Every stop on the page, as one full-width navy band under the cobalt hero. */
export function PageIndex({ items }: { items: { href: string; name: string; icon: string }[] }) {
  return (
    <nav aria-label="On this page" className="bg-bdnavy-900">
      <ul className="mx-auto flex max-w-7xl gap-x-10 overflow-x-auto px-gutter-x py-3 [scrollbar-width:none] sm:justify-center lg:gap-x-16 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              className="flex min-h-11 items-center gap-2 rounded-md font-grotesk text-base font-bold whitespace-nowrap text-white transition-colors duration-300 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none"
            >
              <Icon name={item.icon} className="text-2xl text-signal-orange" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const VALUE_FIELDS: AboutField[] = ["navy", "cobalt", "ink", "cobalt"];

/** What we hold to: four solid cards, each with its symbol in a round badge. */
export function ValueCards({ values }: { values: Value[] }) {
  return (
    <section id="values" aria-labelledby="values-title" className="section-band mx-auto max-w-7xl scroll-mt-header px-gutter-x lg:scroll-mt-header-lg">
      <AboutHeading id="values-title" title="Four promises we build by" lead="Every product, service and line of research we take on has to keep all four." />
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {values.map((v, i) => {
          const field = ABOUT_FIELDS[VALUE_FIELDS[i % VALUE_FIELDS.length]];
          return (
            <li
              key={v.title}
              style={{ "--field": field.field, "--offset": field.offset } as CSSProperties}
              className={cn(OFFSET_CARD, OFFSET_LIFT, "story-reveal group/value flex flex-col gap-4 bg-(--field) p-7 text-white")}
            >
              <span className="grid size-14 place-items-center rounded-full bg-black/25 text-signal-orange ring-1 ring-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/value:-rotate-6 motion-reduce:transition-none">
                <Icon name={v.icon} className="text-3xl!" />
              </span>
              <h3 className="font-grotesk text-xl leading-tight font-bold text-signal-orange">{v.title}</h3>
              <p className="text-sm leading-relaxed text-white/80">{v.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The page's hero: the line the company is named from, as a full-width
 * cobalt band under the header, the founder's portrait on a navy block,
 * Nazrul's line beside it, and the way to meet the crew.
 */
export function MottoBand({ founder }: { founder: { name: string; role: string; photo: string } }) {
  return (
    <section aria-labelledby="about-title" className="bg-cobalt text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-gutter-x py-12 md:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-14">
        <figure className="hero-rise mx-auto w-64 sm:w-72 lg:w-80 xl:w-96">
          <div
            style={{ "--offset": ABOUT_FIELDS.cobalt.offset } as CSSProperties}
            className={cn(OFFSET_CARD, "relative aspect-4/5 overflow-hidden bg-bdnavy-900")}
          >
            <Image src={founder.photo} alt={`${founder.name}, ${founder.role}`} fill priority sizes="(min-width: 1024px) 384px, 288px" className="object-cover object-top" />
          </div>
          <figcaption className="mt-6 text-center">
            <span className="block font-grotesk text-base font-bold">{founder.name}</span>
            <span className="block font-sans text-sm text-white/80">{founder.role}, Kandari-Lab</span>
          </figcaption>
        </figure>

        <div className="hero-rise flex flex-col gap-6">
          <h1 id="about-title" className="font-grotesk text-3xl font-bold tracking-tight text-balance text-signal-orange sm:text-4xl lg:whitespace-nowrap xl:text-5xl">
            Born from Nazrul&rsquo;s call
          </h1>
          <figure className="flex flex-col gap-3">
            {/* The whole line on one line from lg; on a phone it wraps after the first sentence pair. */}
            <blockquote lang="bn" className="font-bengali text-2xl leading-[1.4] font-bold sm:text-3xl lg:text-2xl lg:whitespace-nowrap xl:text-3xl">
              “কে আছ জোয়ান? হও আগুয়ান। <span className="text-signal-orange">হাঁকিছে ভবিষ্যৎ।”</span>
            </blockquote>
            <figcaption lang="bn" className="font-bengali text-sm text-white/80">
              কাজী নজরুল ইসলাম, ‘কাণ্ডারী হুঁশিয়ার’
            </figcaption>
          </figure>
          <p className="max-w-[60ch] font-sans text-base leading-relaxed text-white/80 lg:text-lg">
            Who among you is young? Step forward; the future is calling. A কাণ্ডারী is the helmsman who steers the boat through the storm, and that is the
            work we took on: a crew of engineers, designers and researchers who take on one problem at a time.
          </p>
          <Link href="/team" className={cn(btn.gold, "w-fit")}>
            Meet the crew
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
