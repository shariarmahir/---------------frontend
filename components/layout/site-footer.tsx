import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { FooterFilm } from "./footer-film";

/** The site's own pages, as the footer's large index (after kudos.framer.media's footer), each with its animated icon (public/lordicon) like the page's cards. */
const INDEX = [
  { label: "Bangladesh", href: "/bangladesh", lordicon: "bangladesh", icon: "map" },
  { label: "Products", href: "/products", lordicon: "internet-of-things", icon: "inventory_2" },
  { label: "Research", href: "/research", lordicon: "research", icon: "science" },
  { label: "নাগরিক দায়িত্ব", href: "/nagorik", lordicon: "nagorik", icon: "balance" },
  { label: "About us", href: "/about", lordicon: "vision", icon: "info" },
  { label: "Team", href: "/team", lordicon: "media", icon: "groups" },
];

const COLUMNS = [
  {
    title: "Products",
    links: [
      { label: "SWASTI", href: "/products/swasti" },
      { label: "Aponjon", href: "/products/aponjon" },
      { label: "Smart Pharmacy", href: "/products/smart-pharmacy" },
      { label: "All products", href: "/products" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "The Pixel-Map", href: "/#pixel-map" },
      { label: "Research & Labs", href: "/#rd-labs" },
      { label: "Innovation Drive", href: "/#innovation" },
      { label: "R&D Fellowship", href: "/team/fellowship" },
      { label: "Data Sources", href: "/#data-sources" },
    ],
  },
];

/** Genius's own columns, merged into this footer on /research (it has no footer of its own). */
const RESEARCH_COLUMNS = [
  {
    title: "Explore research",
    links: [
      { label: "Advanced Search", href: "/research/advanced-search" },
      { label: "By subject", href: "/research/subjects" },
      { label: "By title", href: "/research/titles" },
      { label: "Collections", href: "/research/collections" },
      { label: "Institutions", href: "/research/institutions" },
      { label: "Images and figures", href: "/research/images" },
    ],
  },
  {
    title: "Research tools",
    links: [
      { label: "Workspace", href: "/research/workspace" },
      { label: "Upload research", href: "/research/submit" },
      { label: "A random work", href: "/research/random" },
      { label: "Publishing rules", href: "/research/submit#rules" },
    ],
  },
  {
    title: "Your profile",
    links: [
      { label: "Get a Kandari Profile", href: "/signup" },
      { label: "Log in", href: "/login?next=/research" },
      { label: "Bangladesh: problems and solutions", href: "/bangladesh" },
    ],
  },
];

const FOCUS = "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";
const LINK = cn("rounded-md text-white/80 transition-colors duration-200 hover:text-signal-orange", FOCUS);
/** Column links: full-height 44px rows below lg, so each is an easy tap; plain inline text from lg. */
const ROW_LINK = cn(LINK, "flex min-h-11 items-center lg:inline lg:min-h-0");
const HEADING = "font-grotesk text-sm font-bold text-signal-orange";
const bn = (text: string) => /[ঀ-৿]/.test(text);

/**
 * Footer: the header's navy field closing the page, under the header's gold
 * seam. Laid out after kudos.framer.media's footer: a statement in two
 * tones (the claim in white over its quieter connective words) with the
 * motto and the two actions; beside it the site's pages as a large
 * index. Under a hairline, the brand, the link columns and the
 * newsletter; then the rights line, and the hero's film looping across the
 * foot with a button for its sound (footer-film.tsx).
 * The bottom row keeps clear of the floating AI button over its right end.
 * With `research`, the library's columns join the company's and the email
 * bar moves under the brand, so /research closes on this one footer.
 */
export function SiteFooter({ research = false }: { research?: boolean }) {
  const columns = research ? [...RESEARCH_COLUMNS, ...COLUMNS] : COLUMNS;
  const subscribe = (
    <div className={cn("flex flex-col gap-4", !research && "col-span-2 md:col-span-1")}>
      <h2 className={HEADING}>Stay in the loop</h2>
      <p className="text-sm leading-relaxed text-white/80">New research and product releases, by email.</p>
      {/* Subscribing is a Kandari Profile: the email carries over to sign-up. */}
      <form action="/signup" method="get" className="flex gap-1 rounded-xl bg-black/25 p-1 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-signal-orange">
        <label htmlFor="bulletin-email" className="sr-only">
          Email address
        </label>
        <input
          id="bulletin-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/65 focus:outline-none"
        />
        <button type="submit" className={cn(btn.gold, "shrink-0 focus-visible:ring-white focus-visible:ring-offset-bdnavy-900")}>
          Subscribe
        </button>
      </form>
    </div>
  );

  return (
    <footer className="relative isolate z-20 overflow-hidden bg-bdnavy-900 text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-384 px-gutter-x pt-12 lg:pt-20">
        {/* The statement and the index. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col items-start gap-6 lg:col-span-6 lg:gap-8">
            <p className="max-w-xl font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-white/65 sm:text-3xl lg:text-4xl lg:leading-[1.15]">
              We repair <span className="text-white">Bangladesh</span> one pixel at a time, with{" "}
              <span className="text-white">hardware, software and AI</span> built here, for{" "}
              <span className="text-white">the people who live here</span>.
            </p>
            <p lang="bn" className="font-bengali text-xl leading-snug font-bold text-signal-orange sm:text-2xl">
              {NAZRUL_MOTTO}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/#kandari-profile" className={btn.gold}>
                Join Kandari Profile
                <Icon name="arrow_forward" className="text-base" />
              </Link>
              <Link href="/about" className={btn.goldOutline}>
                Read our story
              </Link>
            </div>
          </div>

          <nav aria-label="Site index" className="lg:col-span-5 lg:col-start-8">
            <ul className="border-b border-white/12">
              {INDEX.map((page) => (
                <li key={page.href} className="border-t border-white/12">
                  <Link
                    href={page.href}
                    className={cn(
                      "group/index flex min-h-16 items-center gap-5 rounded-md py-3 transition-colors duration-300 hover:text-signal-orange sm:min-h-20",
                      FOCUS,
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 font-grotesk text-2xl font-bold tracking-tight transition-[translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/index:translate-x-2 motion-reduce:transition-none motion-reduce:group-hover/index:translate-x-0 sm:text-3xl",
                        bn(page.label) && "font-bengali",
                      )}
                    >
                      {page.label}
                    </span>
                    {/* Each row's animated icon stands at its right edge; pointed at (or focused), it gives way to the
                        arrow that says the row opens a page. A touch screen has no pointing, so its icons stay. */}
                    <span aria-hidden className="relative grid size-11 shrink-0 place-items-center">
                      <CardIcon
                        name={page.lordicon}
                        fallback={page.icon}
                        size={44}
                        className="transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/index:scale-75 group-hover/index:opacity-0 group-focus-visible/index:scale-75 group-focus-visible/index:opacity-0 motion-reduce:transition-none"
                      />
                      <Icon
                        name="arrow_outward"
                        className="absolute text-4xl! text-signal-orange opacity-0 transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] -translate-x-2 translate-y-2 group-hover/index:translate-x-0 group-hover/index:translate-y-0 group-hover/index:opacity-100 group-focus-visible/index:translate-x-0 group-focus-visible/index:translate-y-0 group-focus-visible/index:opacity-100 motion-reduce:transition-none"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* The brand, the link columns and the newsletter. */}
        <div
          className={cn(
            "mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/12 pt-10 sm:gap-10 lg:mt-20 lg:pt-14",
            research
              ? "md:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))] lg:gap-10"
              : "md:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] xl:gap-12",
          )}
        >
          <div className={cn("col-span-2 flex flex-col gap-4 sm:gap-5", research ? "md:col-span-3 lg:col-span-1" : "md:col-span-1")}>
            <Link href="/" className={cn("w-fit rounded-lg", FOCUS)}>
              <Image
                src="/logo/kandari-logo.png"
                alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
                width={1600}
                height={967}
                sizes="110px"
                className="logo-on-navy h-16 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              A Bangladeshi deep-tech company repairing the country’s public services one sector at a time, with
              its own hardware, software and AI. Healthcare comes first.
            </p>
            {research && (
              <>
                <p className="max-w-sm text-sm leading-relaxed text-white/80">
                  Genius, Kandari-Lab&apos;s open research library, is free to read, download and cite. Sample entries are labelled: their
                  people, institutions and figures are illustrative.
                </p>
                {subscribe}
              </>
            )}
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex min-w-0 flex-col gap-1 lg:gap-4">
              <h2 className={HEADING}>{col.title}</h2>
              <ul className="flex flex-col text-sm lg:gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={ROW_LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {!research && subscribe}
        </div>

        {/* `sm:pr-20`: the floating AI button sits over this row's right end, until the window is wide enough to leave it in the margin. */}
        <div className="mt-10 flex flex-col items-center justify-between gap-1 border-t border-white/12 py-4 text-xs text-white/65 sm:flex-row sm:gap-3 sm:py-5 sm:pr-20 lg:mt-14 min-[115rem]:pr-0">
          {/* The Lordicon credit is required by its free licence, so it stays on every screen, beside the rights line. */}
          <p>
            © {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All rights reserved. Icons by{" "}
            <a href="https://lordicon.com/" target="_blank" rel="noopener noreferrer" className={cn(LINK, "text-white/65 underline-offset-2 hover:underline")}>
              Lordicon
            </a>
            .
          </p>
          {/* The maker's credit (Mahir, 2026-10-29): his name in bold gold, its letters rising in a slow wave (globals.css, .maker-name). */}
          <p>
            Designed and built by{" "}
            <span className="font-grotesk text-sm font-extrabold text-signal-orange">
              <span className="sr-only">Mahir</span>
              <span aria-hidden className="maker-name">
                {[..."Mahir"].map((ch, i) => (
                  <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
            , Founder &amp; CEO
          </p>
          <a href="#top" className={cn(LINK, "inline-flex min-h-11 items-center gap-1 px-2 font-semibold lg:min-h-0 lg:px-0")}>
            Back to top
            <Icon name="arrow_upward" className="text-base" />
          </a>
        </div>
      </div>

      {/* The page's last picture: the hero's film, looping, with its sound a tap away. */}
      <FooterFilm />
    </footer>
  );
}
