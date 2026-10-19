import { services } from "./services";

export interface NavLink {
  href: string;
  label: string;
  /** Condensed label for mid-width screens where the full one would wrap. */
  shortLabel: string;
  /**
   * A substring of `label` to render in the alert colour. Used on the news
   * index, where the three categories share the word "অপরাধ" and that word
   * alone carries the warning — colouring the whole label would make three
   * adjacent nav items read as one red block.
   */
  accentWord?: string;
  /** A tab that opens a menu of these links instead of going anywhere itself. */
  children?: NavLink[];
}

/**
 * Primary navigation (Mahir, 2026-10-18): Home, National Desk, Products,
 * Research, Mission, About us, Team, Join. National Desk is a menu: the
 * National Index and the two civic pages that used to sit in the header's
 * top row (নাগরিক দায়িত্ব, বাংলাদেশ সমস্যা ও সমাধান).
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
    // A menu, not a page: the key below only names it (icon, active state).
    href: "#national-desk",
    label: "National Desk",
    shortLabel: "Desk",
    children: [
      // A full path: the section lives on the country page.
      { href: "/bangladesh/problems#national-index", label: "National Index", shortLabel: "Index" },
      { href: "/nagorik", label: "নাগরিক দায়িত্ব", shortLabel: "দায়িত্ব" },
      { href: "/bangladesh", label: "বাংলাদেশ সমস্যা ও সমাধান", shortLabel: "বাংলাদেশ" },
    ],
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
    // opens that card (see charter-section.tsx).
    href: "/#mission",
    label: "Mission",
    shortLabel: "Mission",
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
 * Navigation for "বাংলাদেশ সমস্যা ও সমাধান" — one page per item
 * (/bangladesh and /bangladesh/{crisis,shield,problems,solutions}) plus the
 * game (চলো বাংলাদেশ গড়ি), kept to six so the bar fits at 1024px; the
 * civic-duty page has its own header button. Full paths, so the set also
 * works from /nagorik.
 */
export const bangladeshNavLinks: NavLink[] = [
  { href: "/bangladesh", label: "ইতিহাস", shortLabel: "ইতিহাস" },
  { href: "/bangladesh/crisis", label: "সংকট", shortLabel: "সংকট" },
  { href: "/bangladesh/shield", label: "নাগরিক ঢাল", shortLabel: "ঢাল" },
  { href: "/bangladesh/problems", label: "৩২টি সমস্যা", shortLabel: "সমস্যা" },
  { href: "/bangladesh/solutions", label: "সমাধান", shortLabel: "সমাধান" },
  { href: "/cholo-bangladesh-gori", label: "চলো বাংলাদেশ গড়ি", shortLabel: "গড়ি" },
];

/** Navigation for "নাগরিক অধিকার ও দায়িত্ব" (/nagorik). */
export const nagorikNavLinks: NavLink[] = [
  { href: "/nagorik#day", label: "দিনের হিসাব", shortLabel: "দিন" },
  { href: "/nagorik#divisions", label: "বিভাগ", shortLabel: "বিভাগ" },
  { href: "/nagorik#rights", label: "অধিকার", shortLabel: "অধিকার" },
  { href: "/nagorik#responsibility", label: "দায়িত্ব", shortLabel: "দায়িত্ব" },
  { href: "/nagorik#self-check", label: "আজ রাতের আয়না", shortLabel: "আয়না" },
  { href: "/bangladesh", label: "বাংলাদেশ সমস্যা ও সমাধান", shortLabel: "বাংলাদেশ" },
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
 * Navigation for the "চলো বাংলাদেশ গড়ি" game — its routes under
 * /cholo-bangladesh-gori, plus the dossier it is built on.
 */
export const goriNavLinks: NavLink[] = [
  { href: "/cholo-bangladesh-gori", label: "কমান্ড সেন্টার", shortLabel: "কমান্ড" },
  { href: "/cholo-bangladesh-gori/mission", label: "জাতীয় মিশন", shortLabel: "মিশন" },
  { href: "/cholo-bangladesh-gori/play", label: "অভিযান", shortLabel: "অভিযান" },
  { href: "/cholo-bangladesh-gori/lab", label: "বিজ্ঞানাগার", shortLabel: "ল্যাব" },
  { href: "/cholo-bangladesh-gori/evidence", label: "প্রমাণ", shortLabel: "প্রমাণ" },
  { href: "/cholo-bangladesh-gori/progress", label: "অগ্রগতি", shortLabel: "অগ্রগতি" },
  { href: "/bangladesh/problems", label: "৩২টি সমস্যা", shortLabel: "সমস্যা" },
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
  if (pathname === "/cholo-bangladesh-gori" || pathname.startsWith("/cholo-bangladesh-gori/")) {
    return goriNavLinks;
  }
  return navLinks;
}

export const NAZRUL_MOTTO = "‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’";
