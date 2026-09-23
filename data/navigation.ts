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
    // "Foundership & Engineering Command".
    href: "#leadership",
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
 * Navigation for আজকের বাংলাদেশ, the national news index.
 *
 * The home nav's sections do not exist on this page, so it carries its own
 * set. Each link drives the feed's category filter through the hash, which
 * `NewsFeed` reads on mount and on `hashchange`.
 *
 * `অপরাধী` and `অপরাধের স্থান` resolve to the same crime set as `অপরাধ`
 * for now: the placeholder records carry a category but not an accused
 * person or an incident location, so there is nothing yet to group them
 * by. They are listed because they are the intended cuts — when the
 * aggregation API supplies those fields, only the `view` value changes.
 */
export const newsNavLinks: NavLink[] = [
  {
    // The daily incident index.
    href: "/ajker-oporadh",
    label: "আজকের অপরাধ",
    shortLabel: "অপরাধ",
    accentWord: "অপরাধ",
  },
  {
    // The offender index: anonymised offence patterns plus the public
    // conviction registry. Note this is NOT a watchlist of people — see
    // the header comment in data/offender-index.ts for why.
    href: "/ajker-oporadhi",
    label: "আজকের অপরাধী",
    shortLabel: "অপরাধী",
    accentWord: "অপরাধ",
  },
  {
    href: "/ajker-bangladesh#feed=crime-place",
    label: "আজকের অপরাধের স্থান",
    shortLabel: "অপরাধের স্থান",
    accentWord: "অপরাধ",
  },
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
 * The nav set for a given pathname. Home's set is the default.
 *
 * The news index and the crime index share one nav, so moving between
 * them keeps the same three categories in place rather than swapping the
 * bar out underneath the reader.
 */
export function navLinksFor(pathname: string): NavLink[] {
  const newsScreens = [
    "/ajker-bangladesh",
    "/ajker-oporadh",
    "/ajker-oporadhi",
  ];
  if (pathname === "/products" || pathname.startsWith("/products/")) {
    return productNavLinks;
  }
  return newsScreens.some((p) => pathname.startsWith(p))
    ? newsNavLinks
    : navLinks;
}

export const NAZRUL_MOTTO = "‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’";
