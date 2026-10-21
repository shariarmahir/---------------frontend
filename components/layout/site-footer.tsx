import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { cn } from "@/lib/utils";

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
      { label: "About us", href: "/about" },
      { label: "The Pixel-Map", href: "/#pixel-map" },
      { label: "Research & Labs", href: "/#rd-labs" },
      { label: "Innovation Drive", href: "/#innovation" },
      { label: "Team", href: "/team" },
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

const LINK =
  "rounded-md text-white/80 transition-colors duration-200 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";
/** Column links: full-height 44px rows below lg, so each is an easy tap; plain inline text from lg. */
const ROW_LINK = cn(LINK, "flex min-h-11 items-center lg:inline lg:min-h-0");
const HEADING = "font-grotesk text-sm font-bold text-signal-orange";

/**
 * Footer: the header's navy field closing the page, with the header's gold
 * seam (a hairline with a light running along it) on its top edge. The
 * motto rides the one cobalt card, in gold, with the gold button; below it the brand, two link columns and the
 * release list, gold headings over white links; then the rights line, and
 * the Bangla name drawn as a fine gold outline, cut by the page's edge.
 * The bottom row keeps clear of the floating AI button over its right end.
 * With `research`, the library's columns join the company's and the email
 * bar moves under the brand, so /research closes on this one footer.
 */
export function SiteFooter({ research = false }: { research?: boolean }) {
  const columns = research ? [...RESEARCH_COLUMNS, ...COLUMNS] : COLUMNS;
  const subscribe = (
    <div className={cn("flex flex-col gap-4", !research && "col-span-2 md:col-span-1 md:col-start-1 xl:col-start-auto")}>
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
      <div className="mx-auto max-w-384 px-gutter-x pt-10 lg:pt-14">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-cobalt p-5 text-signal-orange shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/12 sm:mb-14 sm:gap-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p lang="bn" className="font-bengali text-xl leading-snug font-bold sm:text-2xl">
            {NAZRUL_MOTTO}
          </p>
          <Link href="/#kandari-profile" className={cn(btn.gold, "shrink-0 self-start md:self-auto")}>
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div
          className={cn(
            // Two columns from the phone up: the brand (and, off /research, the
            // email bar) spans both, the link groups sit side by side. Off
            // /research, tablets and small laptops (md) take three columns: the
            // brand with the email bar under it, then the two link groups; from
            // xl the email bar takes a fourth column of its own.
            "grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-10",
            research
              ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))] lg:gap-10"
              : "sm:grid-cols-2 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] xl:gap-12",
          )}
        >
          <div className={cn("col-span-2 flex flex-col gap-4 sm:gap-5", research ? "md:col-span-3 lg:col-span-1" : "md:col-span-1")}>
            <Link
              href="/"
              className="w-fit rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
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
            <nav key={col.title} aria-label={col.title} className={cn("flex min-w-0 flex-col gap-1 lg:gap-4", !research && "md:row-span-2 xl:row-span-1")}>
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

        {/* `sm:pr-32`: the floating AI button sits over this row's right end, until the window is wide enough to leave it in the margin. */}
        <div className="mt-10 flex flex-col items-center justify-between gap-1 border-t border-white/12 py-4 text-xs text-white/65 sm:flex-row sm:gap-3 sm:py-5 sm:pr-20 lg:mt-14 min-[115rem]:pr-0">
          <p>© {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All rights reserved.</p>
          <a href="#top" className={cn(LINK, "inline-flex min-h-11 items-center gap-1 px-2 font-semibold lg:min-h-0 lg:px-0")}>
            Back to top
            <Icon name="arrow_upward" className="text-base" />
          </a>
        </div>
      </div>

      {/* The name, drawn whole in a fine gold line under the footer. Set at 72
          units and scaled by the viewBox, so it stays on the type scale. */}
      <svg aria-hidden viewBox="0 0 390 92" className="pointer-events-none mx-auto mt-2 mb-6 block w-full max-w-384 px-gutter-x select-none lg:mb-10">
        <text
          x="195"
          y="70"
          textAnchor="middle"
          fontSize="72"
          fontWeight="700"
          className="fill-none stroke-signal-orange font-bengali"
          strokeOpacity="0.45"
          strokeWidth="0.6"
        >
          কাণ্ডারী-ল্যাব
        </text>
      </svg>
    </footer>
  );
}
