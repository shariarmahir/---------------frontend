import Image from "next/image";
import Link from "next/link";
import { NAZRUL_MOTTO } from "@/data/navigation";

const ECOSYSTEM_LINKS = [
  { label: "SWASTI Bio-Telemetry", href: "/#swasti-section" },
  { label: "Aponjon Care Assist", href: "/#flagship" },
  { label: "Smart Pharmacy Grid", href: "/products/smart-pharmacy" },
  { label: "64-District Pixel Map", href: "/#pixel-map" },
];

const ARCHITECTURE_LINKS = [
  { label: "Semiconductor & Fab Labs", href: "/#rd-labs" },
  { label: "Open Innovation Hub", href: "/#innovation" },
  { label: "Research Fellows & Team", href: "/team" },
  { label: "National Talent Network", href: "/#kandari-profile" },
];

const LINK_CLASS =
  "group inline-flex items-center gap-2 rounded-sm text-text-primary/85 transition-colors duration-200 hover:text-text-primary hover:underline focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none";

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <span className="block font-grotesk text-xs font-bold tracking-wider text-text-primary uppercase">{title}</span>
      <ul className="space-y-2 font-sans text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={LINK_CLASS}>
              {/* A pixel that lights up on hover (decorative). */}
              <span
                aria-hidden
                className="size-1.5 rounded-[2px] bg-text-primary/35 transition-colors duration-200 group-hover:bg-text-primary"
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Footer — a solid gold band like the header, ink text throughout (the
 * brand green and white both fall under 4.5:1 on the gold), the motto on an
 * ink card. Compact: the credits row only reserves room beside the
 * floating AI button, not a full strip under it.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate z-20 overflow-hidden bg-signal-orange text-text-primary">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
        {/* Manifesto card. */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-text-primary p-6 text-white shadow-ink sm:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p className="font-grotesk text-xl font-bold text-signal-orange italic sm:text-2xl">{NAZRUL_MOTTO}</p>

            <div className="text-left md:text-right">
              <span className="block font-mono text-xs text-white/70 uppercase">Target Deployment Field</span>
              <span className="font-grotesk text-base font-bold tracking-wider text-emerald-300 uppercase">
                64 Districts // Sovereign healthcare &amp; robotics
              </span>
            </div>
          </div>
        </div>

        {/* Link columns. */}
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand. */}
          <div className="space-y-4 lg:col-span-2">
            {/* Bare on the gold, as in the header. */}
            <Link
              href="/"
              className="inline-flex rounded-lg transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <Image
                src="/logo/kandari-logo.png"
                alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
                width={1600}
                height={967}
                sizes="110px"
                className="h-16 w-auto shrink-0 object-contain"
              />
            </Link>

            <p className="max-w-sm font-sans text-sm leading-relaxed text-text-primary/85">
              Bangladesh&apos;s pioneering deep-tech nerve-center engineering
              autonomous robotics, AI bio-diagnostics, IoT cleanroom
              fabrication, and rapid response healthcare systems for the Golden
              Two Hours across all 64 districts.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-text-primary/80">
              <span className="size-2 animate-pulse rounded-full bg-text-primary motion-reduce:animate-none" />
              <span>CLEANROOM GRID: OPERATIONAL [REV 2025.04]</span>
            </div>
          </div>

          <FooterLinks title="Deep-Tech Ecosystem" links={ECOSYSTEM_LINKS} />
          <FooterLinks title="Open Architecture" links={ARCHITECTURE_LINKS} />

          {/* Telemetry bulletin. */}
          <div className="space-y-3">
            <span className="block font-grotesk text-xs font-bold tracking-wider text-text-primary uppercase">
              Telemetry Bulletin
            </span>
            <p className="font-sans text-xs leading-relaxed text-text-primary/85">
              Subscribe to research releases, clinical trial telemetry, and
              microchip blueprints.
            </p>

            {/* Subscribing is a Kandari Profile: the email carries over to sign-up. */}
            <form action="/signup" method="get" className="space-y-2">
              <div className="flex overflow-hidden rounded-xl ring-1 ring-text-primary/40 focus-within:ring-2 focus-within:ring-text-primary">
                <label htmlFor="bulletin-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bulletin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@domain.bd"
                  className="w-full bg-text-primary/10 px-3 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-primary/65 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-text-primary px-4 py-2.5 font-mono text-xs font-bold text-signal-orange uppercase transition-colors hover:bg-bd-green-dark focus-visible:outline-none"
                >
                  Sync
                </button>
              </div>
              <span className="block font-mono text-[10px] text-text-primary/75">NO SPAM // CIPHER PROTECTED</span>
            </form>
          </div>
        </div>

        {/* Bottom credits. `sm:pr-32` keeps the right-hand line clear of the
            floating AI button pinned over this corner. */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-text-primary/25 py-4 font-mono text-xs text-text-primary/80 sm:flex-row sm:pr-32">
          <div>
            © {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All
            Sovereign Hardware &amp; IP Reserved. Dhaka, Bangladesh.
          </div>
          <div className="flex flex-col items-center gap-1 font-semibold text-text-primary sm:items-end">
            <span>LOCATION: DHAKA [23.8103° N, 90.4125° E]</span>
            <span>SYS STATUS: NOMINAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
