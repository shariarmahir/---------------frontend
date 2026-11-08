import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { COLUMN, pill } from "./kit";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    title: "The country",
    links: [
      { label: "History & Society", href: "/bangladesh/history" },
      { label: "Science & Tech", href: "/bangladesh/science-tech" },
      { label: "Biographies", href: "/bangladesh/people" },
      { label: "Animals & Nature", href: "/bangladesh/nature" },
      { label: "Arts & Culture", href: "/bangladesh/culture" },
      { label: "Pro & Con", href: "/bangladesh/procon" },
      { label: "Facts about Bangladesh", href: "/bangladesh/facts" },
    ],
  },
  {
    title: "Visit and invest",
    links: [
      { label: "Geography & Travel", href: "/bangladesh/travel" },
      { label: "Plan your trip", href: "/bangladesh/travel#plan" },
      { label: "Travel stories", href: "/bangladesh/travel/stories" },
      { label: "Taka", href: "/bangladesh/taka" },
      { label: "Videos", href: "/bangladesh/videos" },
      { label: "Capability & Resources", href: "/bangladesh/resources" },
      { label: "Business & Investment", href: "/bangladesh/invest" },
    ],
  },
  {
    title: "Government",
    links: [
      { label: "Government guide", href: "/bangladesh/government" },
      { label: "One-click services", href: "/bangladesh/government/national-portal" },
      { label: "How the state works", href: "/bangladesh/government/about" },
      { label: "Benefits", href: "/bangladesh/government/benefits" },
    ],
  },
  {
    title: "Kandari-Lab",
    links: [
      { label: "Kandari-Lab home", href: "/" },
      { label: "নাগরিক দায়িত্ব", href: "/nagorik" },
      { label: "Research", href: "/research" },
      { label: "About us", href: "/about" },
      { label: "Team", href: "/team" },
    ],
  },
];

const LINK = "rounded-sm text-white/80 transition-colors hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** MOTHERLAND's one footer, on every page: the name and an invitation, every way onward, and the button to the references. */
export function MotherlandFooter() {
  return (
    <footer id="ml-footer" className="bg-ml-navy text-white print:hidden">
      <div className={cn(COLUMN, "flex flex-col gap-12 py-14 lg:gap-16 lg:py-20")}>
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/15 pb-12 lg:flex-row lg:items-center lg:pb-16">
          <div className="flex flex-col gap-4">
            <Link href="/bangladesh" aria-label="MotherLand home" className="w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Logo loop className="w-[13rem] text-white [--ml-wave-zoom:1.25]" />
            </Link>
            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-white/85">Bangladesh&apos;s country profile for the world, made by Kandari-Lab.</p>
          </div>
          <Link href="/bangladesh#join" className={pill.onDark}>
            <Icon name="bolt" className="text-lg" />
            Join with us
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-4 font-bold text-signal-orange">{column.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={LINK}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center">
          <p className="text-sm leading-relaxed text-white/70">© {new Date().getFullYear()} Kandari-Lab. An independent country profile, not a government website.</p>
          <Link
            href="/bangladesh/references"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-7 font-semibold ring-2 ring-white/60 transition-colors ring-inset hover:bg-white hover:text-ml-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Icon name="menu_book" className="text-lg" />
            References
          </Link>
        </div>
      </div>
    </footer>
  );
}
