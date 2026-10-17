/**
 * The public sources behind the figures on this site, for the home page's
 * data-source cards. Each one is cited somewhere in data/ already (national
 * index, charter, products, the Bangladesh pages, photo credits); keep this
 * list to sources that are, and add a new one here when a page starts
 * citing it. They are sources, not partners: none of them endorses
 * Kandari-Lab, so the cards never say otherwise. Icons are Material Symbols
 * standing in for each organisation; their own logos are not used.
 */

export interface DataSource {
  id: string;
  /** The name as the card sets it large. */
  name: string;
  /** The full name, when `name` is an abbreviation. */
  fullName?: string;
  icon: string;
  /** What the site takes from it. */
  use: string;
  tag: string;
  url: string;
}

export const dataSources: DataSource[] = [
  {
    id: "world-bank",
    name: "World Bank",
    icon: "public",
    use: "Growth, poverty, electricity and literacy since 1971.",
    tag: "Economy",
    url: "https://data.worldbank.org/country/bangladesh",
  },
  {
    id: "bbs",
    name: "BBS",
    fullName: "Bangladesh Bureau of Statistics",
    icon: "query_stats",
    use: "Labour Force and Time-Use surveys.",
    tag: "Statistics",
    url: "https://bbs.gov.bd",
  },
  {
    id: "who",
    name: "WHO",
    fullName: "World Health Organization",
    icon: "health_and_safety",
    use: "Health system and disease benchmarks.",
    tag: "Health",
    url: "https://www.who.int/countries/bgd",
  },
  {
    id: "dghs",
    name: "DGHS",
    fullName: "Directorate General of Health Services",
    icon: "local_hospital",
    use: "Community clinics and public health services.",
    tag: "Health",
    url: "https://dghs.gov.bd",
  },
  {
    id: "unicef",
    name: "UNICEF",
    icon: "child_care",
    use: "Children’s learning, health and nutrition.",
    tag: "Children",
    url: "https://www.unicef.org/bangladesh",
  },
  {
    id: "iqair",
    name: "IQAir",
    icon: "air",
    use: "World Air Quality Report rankings.",
    tag: "Environment",
    url: "https://www.iqair.com/world-air-quality-report",
  },
  {
    id: "imf",
    name: "IMF",
    fullName: "International Monetary Fund",
    icon: "account_balance",
    use: "Macroeconomic outlook and forecasts.",
    tag: "Economy",
    url: "https://www.imf.org/en/Countries/BGD",
  },
  {
    id: "bangladesh-bank",
    name: "Bangladesh Bank",
    icon: "currency_exchange",
    use: "Monetary, reserve and remittance data.",
    tag: "Finance",
    url: "https://www.bb.org.bd",
  },
  {
    id: "transparency",
    name: "Transparency International",
    icon: "gavel",
    use: "Corruption Perceptions Index.",
    tag: "Governance",
    url: "https://www.transparency.org/en/countries/bangladesh",
  },
  {
    id: "wikimedia",
    name: "Wikimedia Commons",
    icon: "photo_library",
    use: "Openly licensed photographs, credited on each image.",
    tag: "Media",
    url: "https://commons.wikimedia.org",
  },
];
