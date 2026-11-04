import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { CREDITS, TOPICS, topicHref, type Credit } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { COLUMN, pill } from "./kit";
import { Logo } from "./logo";

const KANDARI = [
  { label: "Kandari-Lab home", href: "/" },
  { label: "নাগরিক দায়িত্ব", href: "/nagorik" },
  { label: "The 32 problems", href: "/nagorik/problems" },
  { label: "Research", href: "/research" },
  { label: "About us", href: "/about" },
  { label: "Team", href: "/team" },
];

const LINK = "rounded-sm hover:text-ml-green hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ml-green";

/**
 * MOTHERLAND's footer, white like the reference site's: the wordmark,
 * the topics, the rest of Kandari-Lab, a standing invitation to join,
 * and every photo and film credit the licences ask for.
 */
/** A picture used twice on a page is credited once. */
function oncePerPicture<T extends { label: string; credit: { sourceUrl: string } }>(list: T[]): T[] {
  return [...new Map(list.map((c) => [c.credit.sourceUrl, c])).values()];
}

export function MotherlandFooter({ credits, onLanding = true, narrow, children }: { /** A category page credits only what it shows. */ credits?: { label: string; credit: Credit }[]; onLanding?: boolean; /** One slim dark line, for a page that ends on something full-screen. */ narrow?: boolean; /** Anything else the slim line should fold away, such as sources. */ children?: React.ReactNode }) {
  if (narrow) {
    return (
      <footer className="border-t border-white/10 bg-ml-navy text-sm text-white/70">
        <div className={cn(COLUMN, "flex flex-wrap items-center gap-x-6 gap-y-2 py-3")}>
          <Link href="/bangladesh" className="rounded-sm text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <Logo className="text-[0.7rem]" />
          </Link>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold">
            <Link href="/" className="rounded-sm hover:text-white focus-visible:outline-2 focus-visible:outline-white">Kandari-Lab</Link>
            <Link href="/signup" className="rounded-sm text-signal-orange hover:text-white focus-visible:outline-2 focus-visible:outline-white">Join Kandari Profile</Link>
          </nav>
          {children}
          <details className="open:order-last open:basis-full">
            <summary className="cursor-pointer font-semibold hover:text-white focus-visible:outline-2 focus-visible:outline-white">Photo and film credits</summary>
            <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {oncePerPicture(credits ?? CREDITS).map(({ label, credit }) => (
                <li key={`${label}-${credit.sourceUrl}`}>
                  {label}:{" "}
                  <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-4 hover:text-white">
                    {credit.author}, {credit.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>{" "}
                  ({credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">{credit.license}</a> : credit.license})
                </li>
              ))}
            </ul>
          </details>
          <p className="sm:ml-auto">© {new Date().getFullYear()} Kandari-Lab</p>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-white text-ml-ink">
      <div className={cn(COLUMN, "grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]")}>
        <div className="flex flex-col gap-5">
          <Link href={onLanding ? "#top" : "/bangladesh"} className="self-start rounded-sm text-ml-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ml-green">
            <Logo className="text-[1.05rem]" />
          </Link>
          <p className="max-w-xs leading-relaxed text-ml-ink/75">Bangladesh&apos;s country profile for the world, made by Kandari-Lab.</p>
        </div>

        <nav aria-label="Topics">
          <h2 className="mb-4 text-sm font-bold text-ml-green">Explore Bangladesh</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 font-medium lg:grid-cols-1">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <a href={topicHref(t.id, onLanding)} className={LINK}>
                  {t.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Kandari-Lab">
          <h2 className="mb-4 text-sm font-bold text-ml-green">Kandari-Lab</h2>
          <ul className="grid gap-y-2.5 font-medium">
            {KANDARI.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col items-start gap-4">
          <h2 className="font-ml-display text-4xl tracking-[0.01em] uppercase">Stay inspired</h2>
          <p className="leading-relaxed text-ml-ink/75">Join Kandari Profile to hear first when a new chapter of Bangladesh&apos;s story goes live.</p>
          <Link href="/signup" className={pill.onLight}>
            <Icon name="person_add" className="text-lg" />
            Join Kandari Profile
          </Link>
        </div>
      </div>

      <div className="border-t border-ml-ink/10">
        <div className={cn(COLUMN, "flex flex-col gap-4 py-8 text-sm text-ml-ink/70")}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 self-start font-semibold text-ml-ink hover:text-ml-green [&::-webkit-details-marker]:hidden">
              Photo and film credits
              <Icon name="expand_more" className="text-xl transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {oncePerPicture(credits ?? CREDITS).map(({ label, credit }) => (
                <li key={`${label}-${credit.sourceUrl}`}>
                  {label}:{" "}
                  <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-ml-ink/25 underline-offset-4 hover:text-ml-green">
                    {credit.author}, {credit.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>{" "}
                  ({credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ml-green">{credit.license}</a> : credit.license})
                </li>
              ))}
            </ul>
          </details>
          <p>© {new Date().getFullYear()} Kandari-Lab. MOTHERLAND is a Kandari-Lab project.</p>
        </div>
      </div>
    </footer>
  );
}
