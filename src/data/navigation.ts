export interface NavLink {
  href: string;
  label: string;
  /** Condensed label for mid-width screens where the full one would wrap. */
  shortLabel: string;
}

export const navLinks: NavLink[] = [
  {
    href: "#overview-mission",
    label: "Overview & Mission",
    shortLabel: "Overview",
  },
  {
    href: "#national-index",
    label: "National Index",
    shortLabel: "Index",
  },
  {
    href: "#kandari-member-portal",
    label: "Kandari Member Portal",
    shortLabel: "Portal",
  },
  {
    href: "#rnd-innovations",
    label: "R&D & Innovations",
    shortLabel: "R&D",
  },
  {
    href: "#founder-vision",
    label: "Founder & Vision",
    shortLabel: "Founder",
  },
];

export const NAZRUL_MOTTO = "‘কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।’";
