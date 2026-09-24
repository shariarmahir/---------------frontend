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
}

/**
 * Primary navigation.
 *
 * Every `href` here must match a real `id` rendered on the page it points
 * at — three of these previously pointed at ids that did not exist
 * (`#kandari-member-portal`, `#rnd-innovations`, `#founder-vision`), so
 * the links focused nothing and scrolled nowhere. Labels are named after
 * the heading each section actually carries, so the nav and the page
 * agree.
 */
export const navLinks: NavLink[] = [
  {
    href: "#overview-mission",
    label: "Mission",
    shortLabel: "Mission",
  },
  {
    // A full path, not a bare "#national-index" anchor: the section now
    // lives on the issue dossier, so the fragment alone would resolve to
    // nothing on the home page and the link would silently do nothing.
    href: "/amar-bangladesh#national-index",
    label: "National Index",
    shortLabel: "Index",
  },
  {
    // The product overview page; each product has its own detail route.
    href: "/products",
    label: "Products",
    shortLabel: "Products",
  },
  {
    // "Advanced R&D Cleanroom Initiatives".
    href: "#rd-labs",
    label: "Research",
    shortLabel: "R&D",
  },
  {
    // The team page (orbit, founder, crew directory and profiles).
    href: "/team",
    label: "Team",
    shortLabel: "Team",
  },
  {
    // "Join Kandari Profile" — the subscriber conversion section.
    href: "#kandari-profile",
    label: "Join",
    shortLabel: "Join",
  },
];

/**
 * Navigation for "বাংলাদেশ" — the country story page — and the news index.
 *
 * Every href is a full "/bangladesh#…" path rather than a bare anchor, so
 * the same set works from the news index as well: from there it navigates
 * to the story page, and on the story page it is an in-page jump. Each
 * fragment matches a section id in components/bangladesh.
 */
export const bangladeshNavLinks: NavLink[] = [
  { href: "/bangladesh#history", label: "ইতিহাস", shortLabel: "ইতিহাস" },
  { href: "/bangladesh#map", label: "মানচিত্র", shortLabel: "মানচিত্র" },
  { href: "/bangladesh#nature", label: "প্রকৃতি", shortLabel: "প্রকৃতি" },
  { href: "/bangladesh#seasons", label: "ষড়ঋতু", shortLabel: "ঋতু" },
  { href: "/bangladesh#culture", label: "সংস্কৃতি", shortLabel: "সংস্কৃতি" },
  { href: "/bangladesh#icons", label: "গুণীজন", shortLabel: "গুণীজন" },
  { href: "/bangladesh#growth", label: "অগ্রযাত্রা", shortLabel: "অগ্রযাত্রা" },
  { href: "/bangladesh#memories", label: "স্মৃতি", shortLabel: "স্মৃতি" },
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
  { href: "/#rd-labs", label: "Research", shortLabel: "R&D" },
  { href: "/#kandari-profile", label: "Join", shortLabel: "Join" },
];

/**
 * Navigation for /team and each /team/[slug] profile. Full "/team#…" paths
 * so the same set works from a profile page too.
 */
export const teamNavLinks: NavLink[] = [
  { href: "/team", label: "All Team", shortLabel: "Team" },
  { href: "/team#founder", label: "Founder", shortLabel: "Founder" },
  { href: "/team#members", label: "Members", shortLabel: "Members" },
  { href: "/team#fellowship", label: "R&D Fellowship", shortLabel: "R&D" },
  { href: "/products", label: "Products", shortLabel: "Products" },
  { href: "/#kandari-profile", label: "Join", shortLabel: "Join" },
];

/**
 * The nav set for a given pathname. Home's set is the default.
 *
 * The story page and the news index share one nav, so moving between them
 * keeps the same categories in place rather than swapping the bar out
 * underneath the reader.
 */
export function navLinksFor(pathname: string): NavLink[] {
  if (pathname === "/products" || pathname.startsWith("/products/")) {
    return productNavLinks;
  }
  if (pathname === "/bangladesh" || pathname.startsWith("/ajker-bangladesh")) {
    return bangladeshNavLinks;
  }
  if (pathname === "/team" || pathname.startsWith("/team/")) {
    return teamNavLinks;
  }
  return navLinks;
}

export const NAZRUL_MOTTO = "‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’";
