import Image from "next/image";
import Link from "next/link";
import { SignalSeam } from "@/components/ui/section-kit";
import { NAZRUL_MOTTO } from "@/data/navigation";

const ECOSYSTEM_LINKS = [
  { label: "SWASTI Bio-Telemetry", href: "/#swasti-section" },
  { label: "Aponjon Care Assist", href: "/#flagship" },
  { label: "Smart Pharmacy Grid", href: "/#rural-network" },
  { label: "64-District Pixel Map", href: "/#pixel-map" },
];

const ARCHITECTURE_LINKS = [
  { label: "Semiconductor & Fab Labs", href: "/#rd-labs" },
  { label: "Open Innovation Hub", href: "/#innovation" },
  { label: "Research Fellows & Team", href: "/team" },
  { label: "National Talent Network", href: "/#kandari-profile" },
];

const LINK_CLASS =
  "group inline-flex items-center gap-2 rounded-sm text-white/75 transition-colors duration-200 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <span className="block font-grotesk text-xs font-bold tracking-wider text-signal-orange uppercase">{title}</span>
      <ul className="space-y-2 font-sans text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={LINK_CLASS}>
              {/* A pixel that lights up on hover (decorative). */}
              <span
                aria-hidden
                className="size-1.5 rounded-[2px] bg-white/25 transition-colors duration-200 group-hover:bg-signal-orange"
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
 * Footer — the header's ink strip grown into a full band, with the same
 * gold pulse on its top seam and the motto on a gold card.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate z-20 overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        {/* Manifesto card. */}
        <div className="relative isolate mb-12 overflow-hidden rounded-3xl bg-signal-orange p-6 text-text-primary shadow-tile sm:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p className="font-grotesk text-xl font-bold italic sm:text-2xl">{NAZRUL_MOTTO}</p>

            <div className="text-left md:text-right">
              <span className="block font-mono text-xs text-text-primary/75 uppercase">Target Deployment Field</span>
              <span className="font-grotesk text-base font-bold tracking-wider text-bd-green-dark uppercase">
                64 Districts // Sovereign healthcare &amp; robotics
              </span>
            </div>
          </div>
        </div>

        {/* Link columns. */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand. */}
          <div className="space-y-4 lg:col-span-2">
            {/* On a white tile, as in the header: the logo's gold and ink need a light ground. */}
            <Link
              href="/"
              className="inline-flex rounded-xl bg-white p-1.5 shadow-tile transition-transform duration-300 hover:-translate-y-0.5 hover:-rotate-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0"
            >
              <Image
                src="/logo/kandari-logo.png"
                alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
                width={1600}
                height={967}
                sizes="110px"
                className="h-14 w-auto shrink-0 object-contain"
              />
            </Link>

            <p className="max-w-sm font-sans text-sm leading-relaxed text-white/70">
              Bangladesh&apos;s pioneering deep-tech nerve-center engineering
              autonomous robotics, AI bio-diagnostics, IoT cleanroom
              fabrication, and rapid response healthcare systems for the Golden
              Two Hours across all 64 districts.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-white/60">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <span>CLEANROOM GRID: OPERATIONAL [REV 2025.04]</span>
            </div>
          </div>

          <FooterLinks title="Deep-Tech Ecosystem" links={ECOSYSTEM_LINKS} />
          <FooterLinks title="Open Architecture" links={ARCHITECTURE_LINKS} />

          {/* Telemetry bulletin. */}
          <div className="space-y-3">
            <span className="block font-grotesk text-xs font-bold tracking-wider text-signal-orange uppercase">
              Telemetry Bulletin
            </span>
            <p className="font-sans text-xs leading-relaxed text-white/65">
              Subscribe to research releases, clinical trial telemetry, and
              microchip blueprints.
            </p>

            {/* Subscribing is a Kandari Profile: the email carries over to sign-up. */}
            <form action="/signup" method="get" className="space-y-2">
              <div className="flex overflow-hidden rounded-xl ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-signal-orange">
                <label htmlFor="bulletin-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bulletin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@domain.bd"
                  className="w-full bg-white/6 px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/45 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-signal-orange px-4 py-2.5 font-mono text-xs font-bold text-text-primary uppercase transition-colors hover:bg-amber-400 focus-visible:outline-none"
                >
                  Sync
                </button>
              </div>
              <span className="block font-mono text-[10px] text-white/55">NO SPAM // CIPHER PROTECTED</span>
            </form>
          </div>
        </div>

        {/* Bottom credits. `pb-16` on the row keeps the last line clear of
            the floating AI widget, which is pinned over this corner. */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 pb-16 font-mono text-xs text-white/55 sm:flex-row sm:pb-14">
          <div>
            © {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All
            Sovereign Hardware &amp; IP Reserved. Dhaka, Bangladesh.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="font-semibold text-emerald-300">LOCATION: DHAKA [23.8103° N, 90.4125° E]</span>
            <span className="font-semibold text-signal-orange">SYS STATUS: NOMINAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
