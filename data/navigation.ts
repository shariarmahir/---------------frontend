import { services } from "./services";

export interface NavLink {
  href: string;
  label: string;
  /** Condensed label for mid-width screens where the full one would wrap. */
  shortLabel: string;
  /** A tab that opens a menu of these links instead of going anywhere itself. */
  children?: NavLink[];
  /**
   * A substring of `label` to render in the alert colour. Used on the news
   * index, where the three categories share the word "অপরাধ" and that word
   * alone carries the warning — colouring the whole label would make three
   * adjacent nav items read as one red block.
   */
  accentWord?: string;
}

/**
 * Primary navigation (Mahir, 2026-10-28): Home, Bangladesh, Products,
 * Research, Mission, নাগরিক দায়িত্ব, About us, Team, Join. Bangladesh's
 * landing page holds the National Index.
 *
 * Every `href` here must match a real page, or a real `id` on the page it
 * points at. Anchors are full root paths ("/#mission"), so the same set
 * works from /about and every other page that falls back to it; on the
 * home page they are in-page jumps, and the header keeps the gold bar on
 * whichever of them is in view.
 */
export const navLinks: NavLink[] = [
  {
    // "#top" scrolls to the top of the page (HTML's built-in fragment), so on
    // the home page this glides up instead of reloading.
    href: "/#top",
    label: "Home",
    shortLabel: "Home",
  },
  {
    // The national landing page: the country, its National Index, the 32 problems and their solutions.
    href: "/bangladesh",
    label: "Bangladesh",
    shortLabel: "Bangladesh",
  },
  {
    // The product overview page; each product has its own detail route.
    href: "/products",
    label: "Products",
    shortLabel: "Products",
  },
  {
    // গবেষণাকোষ — the open research library (its own section, /research).
    href: "/research",
    label: "Research",
    shortLabel: "R&D",
  },
  {
    // The charter's Mission card on the home page; arriving with this hash
    // brings that card forward (see charter-reel.tsx).
    href: "/#mission",
    label: "Mission",
    shortLabel: "Mission",
  },
  {
    // Citizen rights and duties.
    href: "/nagorik",
    label: "নাগরিক দায়িত্ব",
    shortLabel: "দায়িত্ব",
  },
  {
    // Who we are and what we hold to: the About Us page.
    href: "/about",
    label: "About us",
    shortLabel: "About",
  },
  {
    // The team page (orbit, founder, crew directory and profiles).
    href: "/team",
    label: "Team",
    shortLabel: "Team",
  },
  {
    // "Join Kandari Profile" — the subscriber conversion section.
    href: "/#kandari-profile",
    label: "Join",
    shortLabel: "Join",
  },
];

/**
 * The chapter bar for Bangladesh: the landing page, its five chapters
 * (data/bangladesh.ts, CHAPTERS) and the game, in English. The header marks
 * the current page by the longest matching path, so /bangladesh/history
 * lights History and /bangladesh alone lights Overview.
 */
export const bangladeshNavLinks: NavLink[] = [
  { href: "/bangladesh", label: "Overview", shortLabel: "Overview" },
  { href: "/bangladesh/history", label: "History", shortLabel: "History" },
  { href: "/bangladesh/crisis", label: "Crisis", shortLabel: "Crisis" },
  { href: "/bangladesh/shield", label: "Citizen shield", shortLabel: "Shield" },
  { href: "/bangladesh/problems", label: "32 problems", shortLabel: "Problems" },
  { href: "/bangladesh/solutions", label: "Solutions", shortLabel: "Solutions" },
];

/** Navigation for "Citizen Rights and Duties" (/nagorik). */
export const nagorikNavLinks: NavLink[] = [
  { href: "/nagorik#day", label: "The day", shortLabel: "Day" },
  { href: "/nagorik#rights", label: "Rights", shortLabel: "Rights" },
  { href: "/nagorik#justice", label: "Justice", shortLabel: "Justice" },
  { href: "/nagorik#responsibility", label: "Duties", shortLabel: "Duties" },
  { href: "/nagorik#pledge", label: "Pledge", shortLabel: "Pledge" },
  { href: "/bangladesh", label: "Bangladesh", shortLabel: "Bangladesh" },
];

/**
 * Navigation for the product pages.
 *
 * The home nav's bare anchors ("#rd-labs") resolve to nothing here, so
 * this set links the products to each other and root-anchors the two
 * home sections worth reaching from a product page.
 */
export const productNavLinks: NavLink[] = [
  { href: "/products", label: "All Products", shortLabel: "All" },
  { href: "/products/aponjon", label: "Aponjon", shortLabel: "Aponjon" },
  { href: "/products/swasti", label: "SWASTI", shortLabel: "SWASTI" },
  { href: "/products/smart-pharmacy", label: "Smart Pharmacy", shortLabel: "Pharmacy" },
  { href: "/media", label: "শিক্ষিতদের মিডিয়া", shortLabel: "মিডিয়া" },
  {
    href: "#services",
    label: "Services",
    shortLabel: "Services",
    children: [
      { href: "/services", label: "All services", shortLabel: "All" },
      ...services.map((s) => ({ href: `/services/${s.id}`, label: s.name, shortLabel: s.name })),
    ],
  },
  { href: "/research", label: "Research", shortLabel: "R&D" },
  { href: "/#kandari-profile", label: "Join", shortLabel: "Join" },
];

/**
 * Navigation for Genius (/research): the library's own pages, then
 * the company pages a researcher is most likely to want next.
 */
export const researchNavLinks: NavLink[] = [
  { href: "/research", label: "Research", shortLabel: "Research" },
  { href: "/research/subjects", label: "Subjects", shortLabel: "Subjects" },
  { href: "/research/collections", label: "Collections", shortLabel: "Collections" },
  { href: "/research/workspace", label: "Workspace", shortLabel: "Workspace" },
  { href: "/research/submit", label: "Upload", shortLabel: "Upload" },
  { href: "/products", label: "Products", shortLabel: "Products" },
];

/**
 * Navigation for /team and each /team/[slug] profile. Full "/team#…" paths
 * so the same set works from a profile page too.
 */
export const teamNavLinks: NavLink[] = [
  { href: "/team", label: "All Team", shortLabel: "Team" },
  { href: "/team#founder", label: "Founder", shortLabel: "Founder" },
  { href: "/team#members", label: "Members", shortLabel: "Members" },
  { href: "/team/fellowship", label: "R&D Fellowship", shortLabel: "R&D" },
  { href: "/products", label: "Products", shortLabel: "Products" },
  { href: "/#kandari-profile", label: "Join", shortLabel: "Join" },
];

/**
 * The nav set for a given pathname. Home's set is the default.
 *
 */
export function navLinksFor(pathname: string): NavLink[] {
  if (["/products", "/services"].some((root) => pathname === root || pathname.startsWith(`${root}/`))) {
    return productNavLinks;
  }
  if (pathname === "/bangladesh" || pathname.startsWith("/bangladesh/")) {
    return bangladeshNavLinks;
  }
  if (pathname === "/nagorik") {
    return nagorikNavLinks;
  }
  if (pathname === "/research" || pathname.startsWith("/research/")) {
    return researchNavLinks;
  }
  if (pathname === "/team" || pathname.startsWith("/team/")) {
    return teamNavLinks;
  }
  return navLinks;
}

export const NAZRUL_MOTTO = "‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’";
