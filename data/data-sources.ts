/**
 * The public sources behind the figures on this site, for the home page's
 * data-source cards. Each one is cited somewhere in data/ already (national
 * index, charter, products, the Bangladesh pages, photo credits); keep this
 * list to sources that are, and add a new one here when a page starts
 * citing it. They are sources, not partners: none of them endorses
 * Kandari-Lab, so the section never says otherwise.
 *
 * Logos (public/sources/, Mahir's request 2026-10-21): each organisation's
 * own mark, shown only to credit where a figure comes from, each linking to
 * its data. Files from Wikimedia Commons (BBS, Bangladesh Bank, DGHS, WHO,
 * UNICEF, IMF, World Bank, Transparency International, Wikimedia) and the
 * English Wikipedia (IQAir).
 */

export interface DataSource {
  id: string;
  /** The name as the card sets it large. */
  name: string;
  /** The full name, when `name` is an abbreviation. */
  fullName?: string;
  /** The organisation's logo under public/, and its width ÷ height. */
  logo: string;
  ratio: number;
  /** A seal or symbol with no name in it: the name is set beside it. */
  mark?: boolean;
  /**
   * The tile's field, one of the site's own, matched to the logo's colour:
   * navy and blue for the blue marks, green (ink) for the green seals, gold
   * for the rest. Neighbours never share one, round the loop too.
   */
  tile: "navy" | "cobalt" | "ink" | "gold";
  /** Draw the logo in white (a wordmark on a dark field); otherwise in its own colours (the seals, which are white discs). */
  white?: boolean;
  /** What the site takes from it. */
  use: string;
  url: string;
}

export const dataSources: DataSource[] = [
  {
    id: "world-bank",
    name: "World Bank",
    logo: "/sources/world-bank.svg",
    ratio: 312 / 63,
    tile: "navy",
    white: true,
    use: "Growth, poverty, electricity and literacy since 1971.",
    url: "https://data.worldbank.org/country/bangladesh",
  },
  {
    id: "bbs",
    name: "BBS",
    fullName: "Bangladesh Bureau of Statistics",
    logo: "/sources/bbs.svg",
    ratio: 1,
    mark: true,
    tile: "ink",
    use: "Labour Force and Time-Use surveys.",
    url: "https://bbs.gov.bd",
  },
  {
    id: "who",
    name: "WHO",
    fullName: "World Health Organization",
    logo: "/sources/who.svg",
    ratio: 588 / 180,
    tile: "cobalt",
    white: true,
    use: "Health system and disease benchmarks.",
    url: "https://www.who.int/countries/bgd",
  },
  {
    id: "dghs",
    name: "DGHS",
    fullName: "Directorate General of Health Services",
    logo: "/sources/dghs.svg",
    ratio: 1,
    mark: true,
    tile: "ink",
    use: "Community clinics and public health services.",
    url: "https://dghs.gov.bd",
  },
  {
    id: "unicef",
    name: "UNICEF",
    logo: "/sources/unicef.svg",
    ratio: 130.9 / 31.5,
    tile: "cobalt",
    white: true,
    use: "Children’s learning, health and nutrition.",
    url: "https://www.unicef.org/bangladesh",
  },
  {
    id: "iqair",
    name: "IQAir",
    logo: "/sources/iqair.svg",
    ratio: 77 / 29,
    tile: "navy",
    white: true,
    use: "World Air Quality Report rankings.",
    url: "https://www.iqair.com/world-air-quality-report",
  },
  {
    id: "imf",
    name: "IMF",
    fullName: "International Monetary Fund",
    logo: "/sources/imf.jpg",
    ratio: 1,
    tile: "gold",
    use: "Macroeconomic outlook and forecasts.",
    url: "https://www.imf.org/en/Countries/BGD",
  },
  {
    id: "bangladesh-bank",
    name: "Bangladesh Bank",
    logo: "/sources/bangladesh-bank.svg",
    ratio: 1,
    mark: true,
    tile: "ink",
    use: "Monetary, reserve and remittance data.",
    url: "https://www.bb.org.bd",
  },
  {
    id: "transparency",
    name: "Transparency International",
    logo: "/sources/transparency.svg",
    ratio: 170.59 / 42.48,
    tile: "cobalt",
    white: true,
    use: "Corruption Perceptions Index.",
    url: "https://www.transparency.org/en/countries/bangladesh",
  },
  {
    id: "wikimedia",
    name: "Wikimedia Commons",
    logo: "/sources/wikimedia.svg",
    ratio: 610 / 820,
    mark: true,
    tile: "gold",
    use: "Openly licensed photographs, credited on each image.",
    url: "https://commons.wikimedia.org",
  },
];
