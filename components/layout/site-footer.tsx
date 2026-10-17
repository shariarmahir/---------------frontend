import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
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
    ],
  },
  {
    title: "Company",
    links: [
      { label: "The Pixel-Map", href: "/#pixel-map" },
      { label: "Research & Labs", href: "/#rd-labs" },
      { label: "Innovation Drive", href: "/#innovation" },
      { label: "Team", href: "/team" },
      { label: "Data Sources", href: "/#data-sources" },
    ],
  },
];

const LINK =
  "rounded-md text-text-primary/80 transition-colors duration-200 hover:text-bdnavy-900 focus-visible:ring-2 focus-visible:ring-bdnavy-900 focus-visible:outline-none";
const HEADING = "font-grotesk text-sm font-bold text-bdnavy-900";

/**
 * Footer: a solid gold band, ink text throughout (green and white both fall
 * under 4.5:1 on the gold). The motto rides an ink card with the one
 * action that matters; below it the brand, two link columns and the
 * release list; then the rights line. The bottom row keeps clear of the
 * floating AI button pinned over its right-hand corner.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate z-20 overflow-hidden bg-signal-orange text-text-primary">
      <div className="mx-auto max-w-7xl px-gutter-x pt-12 pb-4">
        <div className="mb-12 flex flex-col gap-6 rounded-3xl bg-text-primary p-6 text-white shadow-[0_30px_60px_-36px_rgb(3_32_23/0.9)] sm:p-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p lang="bn" className="font-bengali text-xl leading-snug font-bold text-signal-orange sm:text-2xl">
            {NAZRUL_MOTTO}
          </p>
          <Link href="/#kandari-profile" className={cn(btn.gold, "shrink-0 self-start md:self-auto")}>
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="w-fit rounded-lg focus-visible:ring-2 focus-visible:ring-bdnavy-900 focus-visible:outline-none"
            >
              <Image
                src="/logo/kandari-logo.png"
                alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
                width={1600}
                height={967}
                sizes="110px"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-primary/80">
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
            <p className="text-sm leading-relaxed text-text-primary/80">New research and product releases, by email.</p>
            {/* Subscribing is a Kandari Profile: the email carries over to sign-up. */}
            <form action="/signup" method="get" className="flex gap-1 rounded-xl bg-text-primary/8 p-1 ring-1 ring-text-primary/30 focus-within:ring-2 focus-within:ring-bdnavy-900">
              <label htmlFor="bulletin-email" className="sr-only">
                Email address
              </label>
              <input
                id="bulletin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-primary/55 focus:outline-none"
              />
              <button type="submit" className={cn(btn.navy, "shrink-0")}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* `sm:pr-32`: the floating AI button sits over this row's right end. */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-text-primary/20 py-5 text-xs text-text-primary/80 sm:flex-row sm:pr-32">
          <p>© {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All rights reserved.</p>
          <a href="#top" className={cn(LINK, "inline-flex items-center gap-1 font-semibold")}>
            Back to top
            <Icon name="arrow_upward" className="text-base" />
          </a>
        </div>
      </div>
    </footer>
  );
}
