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

const LINK =
  "rounded-md text-white/80 transition-colors duration-200 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";
const HEADING = "font-grotesk text-sm font-bold text-signal-orange";

/**
 * Footer: the header's navy field closing the page, with the header's gold
 * seam (a hairline with a light running along it) on its top edge. The
 * motto rides the one cobalt card, in gold, with the gold button; below it the brand, two link columns and the
 * release list, gold headings over white links; then the rights line, and
 * the Bangla name drawn as a fine gold outline, cut by the page's edge.
 * The bottom row keeps clear of the floating AI button over its right end.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate z-20 overflow-hidden bg-bdnavy-900 text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x pt-14">
        <div className="mb-14 flex flex-col gap-6 rounded-3xl bg-cobalt p-6 text-signal-orange shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/12 sm:p-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p lang="bn" className="font-bengali text-xl leading-snug font-bold sm:text-2xl">
            {NAZRUL_MOTTO}
          </p>
          <Link href="/#kandari-profile" className={cn(btn.gold, "shrink-0 self-start md:self-auto")}>
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12">
          <div className="flex flex-col gap-5">
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
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4">
              <h2 className={HEADING}>{col.title}</h2>
              <ul className="flex flex-col gap-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-4">
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
        </div>

        {/* `sm:pr-32`: the floating AI button sits over this row's right end. */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/12 py-5 text-xs text-white/65 sm:flex-row sm:pr-32">
          <p>© {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All rights reserved.</p>
          <a href="#top" className={cn(LINK, "inline-flex items-center gap-1 font-semibold")}>
            Back to top
            <Icon name="arrow_upward" className="text-base" />
          </a>
        </div>
      </div>

      {/* The name, drawn in a fine gold line and cut by the page's edge. Set at
          72 units and scaled by the viewBox, so it stays on the type scale. */}
      <svg aria-hidden viewBox="0 0 390 52" className="pointer-events-none mx-auto -mt-1 block w-full max-w-7xl px-gutter-x select-none">
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
