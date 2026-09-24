import Image from "next/image";
import Link from "next/link";
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
  { label: "Research Fellows & Team", href: "/#leadership" },
  { label: "National Talent Network", href: "/#kandari-profile" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        {/* Manifesto box. */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-emerald-100 bg-mint-subtle p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <p className="font-grotesk text-xl font-bold text-text-primary italic sm:text-2xl">
                {NAZRUL_MOTTO}
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="block font-mono text-xs text-text-muted uppercase">
                Target Deployment Field
              </span>
              <span className="font-grotesk text-base font-bold tracking-wider text-bd-green uppercase">
                64 Districts // Sovereign healthcare &amp; robotics
              </span>
            </div>
          </div>
        </div>

        {/* Link columns. */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand. */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo/logo.png"
                alt=""
                aria-hidden
                width={1432}
                height={2000}
                sizes="24px"
                className="h-8 w-[23px] shrink-0 object-contain"
              />
              <span className="font-grotesk text-lg font-bold text-text-primary">
                Kandari-Lab
              </span>
            </Link>

            <p className="max-w-sm font-sans text-sm leading-relaxed text-text-secondary">
              Bangladesh&apos;s pioneering deep-tech nerve-center engineering
              autonomous robotics, AI bio-diagnostics, IoT cleanroom
              fabrication, and rapid response healthcare systems for the Golden
              Two Hours across all 64 districts.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
              <span className="size-2 animate-pulse rounded-full bg-bd-green" />
              <span>CLEANROOM GRID: OPERATIONAL [REV 2025.04]</span>
            </div>
          </div>

          {/* Ecosystem. */}
          <div className="space-y-3">
            <span className="block font-grotesk text-xs font-bold tracking-wider text-signal-orange uppercase">
              Deep-Tech Ecosystem
            </span>
            <ul className="space-y-2 font-sans text-sm">
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors hover:text-bd-green"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Open architecture. */}
          <div className="space-y-3">
            <span className="block font-grotesk text-xs font-bold tracking-wider text-signal-orange uppercase">
              Open Architecture
            </span>
            <ul className="space-y-2 font-sans text-sm">
              {ARCHITECTURE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors hover:text-bd-green"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Telemetry bulletin. */}
          <div className="space-y-3">
            <span className="block font-grotesk text-xs font-bold tracking-wider text-signal-orange uppercase">
              Telemetry Bulletin
            </span>
            <p className="font-sans text-xs leading-relaxed text-text-muted">
              Subscribe to research releases, clinical trial telemetry, and
              microchip blueprints.
            </p>

            <form className="space-y-2">
              <div className="flex">
                <label htmlFor="bulletin-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bulletin-email"
                  type="email"
                  placeholder="user@domain.bd"
                  className="w-full rounded-l-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-text-primary focus:ring-1 focus:ring-bd-green focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-r-lg bg-bd-green px-3 py-2 font-mono text-xs font-bold text-white uppercase transition-colors hover:bg-bd-green-dark"
                >
                  Sync
                </button>
              </div>
              <span className="block font-mono text-[10px] text-text-muted">
                NO SPAM // CIPHER PROTECTED
              </span>
            </form>
          </div>
        </div>

        {/* Bottom credits. `pb-16` on the row keeps the last line clear of
            the floating AI widget, which is pinned over this corner. */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 pb-16 font-mono text-xs text-text-muted sm:flex-row sm:pb-14">
          <div>
            © {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). All
            Sovereign Hardware &amp; IP Reserved. Dhaka, Bangladesh.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="font-semibold text-bd-green">
              LOCATION: DHAKA [23.8103° N, 90.4125° E]
            </span>
            <span className="font-semibold text-signal-orange">
              SYS STATUS: NOMINAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
