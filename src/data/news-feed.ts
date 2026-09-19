/**
 * Aggregated news feed for the "আজকের বাংলাদেশ" screen.
 *
 * Every item is a SHORT SUMMARY that points at an original report — the
 * screen is an index of what is being reported nationally, not a republisher
 * of other outlets' articles. Each entry therefore carries its source outlet
 * and a link, and never more than a couple of sentences of our own summary.
 *
 * The items below are illustrative placeholders written for this UI. They are
 * not transcriptions of real published articles.
 *
 * TODO(backend): replace with GET /api/v1/news?category=&source= once the
 * aggregation service lands. That service is what will actually pull from
 * newspaper RSS, media APIs, social platforms and YouTube.
 */

export type NewsCategory =
  | "crime"
  | "durniti"
  | "government"
  | "events"
  | "innovation"
  | "invention"
  | "technology"
  | "growth"
  | "achievement"
  | "banking"
  | "scheme"
  | "citizen";

export type SourceKind =
  "newspaper" | "tv" | "online" | "social" | "youtube" | "citizen";

/**
 * Three adjacent categories, kept distinct on purpose:
 *
 * - `innovation` — Bangladeshi ingenuity and local problem-solving.
 * - `invention`  — a specific new device, patent or research result.
 * - `technology` — world technology news, explicitly international.
 *
 * The split is by SCOPE, not by subject: a Bangladeshi university's
 * prototype is `innovation`, the same breakthrough announced by a lab
 * abroad is `invention` or `technology`.
 */
export interface CategoryMeta {
  id: NewsCategory;
  label: string;
  banglaLabel: string;
  icon: string;
  /** Tailwind classes for the category chip. */
  chip: string;
  accent: string;
}

export const newsCategories: CategoryMeta[] = [
  {
    id: "crime",
    label: "Crime Reports",
    banglaLabel: "অপরাধ সংবাদ",
    icon: "gavel",
    chip: "bg-red-50 text-red-700 border-red-200",
    accent: "bg-crimson",
  },
  {
    id: "durniti",
    label: "Durniti",
    banglaLabel: "দুর্নীতি",
    icon: "policy",
    chip: "bg-orange-50 text-signal-text border-orange-200",
    accent: "bg-signal",
  },
  {
    id: "government",
    label: "Government",
    banglaLabel: "সরকারি বিষয়",
    icon: "account_balance",
    chip: "bg-slate-100 text-slate-900 border-slate-300",
    accent: "bg-slate-600",
  },
  {
    id: "events",
    label: "Government Events",
    banglaLabel: "সরকারি আয়োজন",
    icon: "event",
    chip: "bg-blue-50 text-blue-800 border-blue-200",
    accent: "bg-blue-600",
  },
  {
    id: "innovation",
    label: "Innovations",
    banglaLabel: "উদ্ভাবন",
    icon: "lightbulb",
    chip: "bg-emerald-50 text-primary border-emerald-200",
    accent: "bg-primary",
  },
  {
    id: "invention",
    label: "Inventions",
    banglaLabel: "আবিষ্কার",
    icon: "science",
    chip: "bg-indigo-50 text-indigo-800 border-indigo-200",
    accent: "bg-indigo-600",
  },
  {
    id: "technology",
    label: "Technology",
    banglaLabel: "প্রযুক্তি",
    icon: "memory",
    chip: "bg-sky-50 text-sky-800 border-sky-200",
    accent: "bg-sky-600",
  },
  {
    id: "growth",
    label: "Growth",
    banglaLabel: "প্রবৃদ্ধি",
    icon: "trending_up",
    chip: "bg-emerald-50 text-primary border-emerald-200",
    accent: "bg-primary",
  },
  {
    id: "achievement",
    label: "Achievements",
    banglaLabel: "অর্জন",
    icon: "emoji_events",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    accent: "bg-title",
  },
  {
    id: "banking",
    label: "Banking & Finance",
    banglaLabel: "ব্যাংকিং ও অর্থ",
    icon: "account_balance_wallet",
    chip: "bg-cyan-50 text-cyan-800 border-cyan-200",
    accent: "bg-cyan-600",
  },
  {
    id: "scheme",
    label: "Schemes & Funding",
    banglaLabel: "প্রকল্প ও তহবিল",
    icon: "savings",
    chip: "bg-teal-50 text-teal-800 border-teal-200",
    accent: "bg-teal-600",
  },
  {
    id: "citizen",
    label: "Citizen Reports",
    banglaLabel: "নাগরিক সংবাদ",
    icon: "campaign",
    chip: "bg-violet-50 text-violet-800 border-violet-200",
    accent: "bg-violet-600",
  },
];

export const SOURCE_KIND_META: Record<
  SourceKind,
  { label: string; icon: string }
> = {
  newspaper: { label: "Newspaper", icon: "newspaper" },
  tv: { label: "TV", icon: "live_tv" },
  online: { label: "Online", icon: "language" },
  social: { label: "Social", icon: "forum" },
  youtube: { label: "YouTube", icon: "smart_display" },
  citizen: { label: "Citizen", icon: "person" },
};

export interface NewsItem {
  id: string;
  category: NewsCategory;
  /** One-line headline, our own wording. */
  headline: string;
  /** Two sentences at most — a pointer, never a replacement for the report. */
  summary: string;
  /** Outlet name as it should be credited. */
  source: string;
  sourceKind: SourceKind;
  /** Link to the original report. */
  url: string;
  /** ISO timestamp of publication. */
  publishedAt: string;
  /** Lead items get the large treatment at the top of the page. */
  lead?: boolean;
  /** Number of independent outlets carrying the same story. */
  corroboration?: number;
  district?: string;
  /** Key figures pulled out of the report, shown as a strip on the card. */
  facts?: { label: string; value: string }[];
  /** Where the underlying information comes from, named on the card so a
   *  reader can go and check it. */
  reference?: { publisher: string; document: string };
  /** Why this matters — one line, shown on lead and feature cards. */
  whyItMatters?: string;
}

/**
 * Anchor for the placeholder timestamps.
 *
 * This is a FIXED instant, not `Date.now()`. The module is evaluated once on
 * the server and again in the browser; a live clock produces a different ISO
 * string in each, and React then reports a hydration mismatch on every
 * `<time dateTime>` in the feed. A constant is identical in both passes.
 *
 * TODO(backend): real items carry their own publishedAt from the source, and
 * this anchor disappears with them.
 */
export const FEED_ANCHOR_MS = Date.parse("2026-09-19T06:00:00.000Z");

/** Placeholder timestamp, n hours before the anchor. */
const HOURS = (n: number) =>
  new Date(FEED_ANCHOR_MS - n * 3_600_000).toISOString();

export const newsItems: NewsItem[] = [
  {
    id: "n01",
    category: "durniti",
    headline: "Audit flags irregularities in district procurement files",
    summary:
      "A routine audit of three district offices reported purchase records that did not match delivered quantities. The offices have been asked to respond within fourteen days.",
    source: "Placeholder Audit Desk",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(1),
    lead: true,
    corroboration: 4,
    district: "Rajshahi",
  },
  {
    id: "n02",
    category: "growth",
    headline: "Ready-made garment exports post a modest quarterly rise",
    summary:
      "Export receipts for the quarter came in above the same period last year, with knitwear accounting for most of the increase.",
    source: "Placeholder Business Wire",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(2),
    lead: true,
    corroboration: 6,
  },
  {
    id: "n03",
    category: "innovation",
    headline: "University team demonstrates low-cost water testing kit",
    summary:
      "The prototype screens for arsenic and bacterial contamination without laboratory equipment. The team says field trials begin next month.",
    source: "Placeholder Science Report",
    sourceKind: "youtube",
    url: "#",
    publishedAt: HOURS(3),
    lead: true,
    district: "Khulna",
  },
  {
    id: "n04",
    category: "crime",
    headline: "Police report arrests in a vehicle theft ring",
    summary:
      "Officers said several vehicles were recovered during overnight raids. The investigation is continuing.",
    source: "Placeholder City Desk",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(4),
    corroboration: 3,
    district: "Dhaka",
  },
  {
    id: "n05",
    category: "government",
    headline: "Ministry publishes revised service delivery timelines",
    summary:
      "The notice sets maximum processing times for eleven citizen services and directs offices to display them publicly.",
    source: "Placeholder Policy Brief",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(5),
    corroboration: 2,
  },
  {
    id: "n06",
    category: "events",
    headline: "Divisional health camp scheduled across four districts",
    summary:
      "Screening camps will run for a week, with priority given to maternal and child health.",
    source: "Placeholder Health Desk",
    sourceKind: "tv",
    url: "#",
    publishedAt: HOURS(6),
    district: "Sylhet",
  },
  {
    id: "n07",
    category: "achievement",
    headline: "Bangladeshi students place in an international olympiad",
    summary:
      "The delegation returned with medals in the mathematics category, improving on last year's placement.",
    source: "Placeholder Education Desk",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(7),
    corroboration: 5,
  },
  {
    id: "n08",
    category: "crime",
    headline: "Court sets hearing date in a long-pending fraud case",
    summary:
      "The case has been adjourned several times since filing. Complainants have asked for the record to be published.",
    source: "Placeholder Court Reporter",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(8),
    district: "Chattogram",
  },
  {
    id: "n09",
    category: "durniti",
    headline: "Contractor blacklisted after incomplete road work",
    summary:
      "The local engineering office said payment has been withheld pending an inspection of the completed sections.",
    source: "Placeholder Local Bureau",
    sourceKind: "social",
    url: "#",
    publishedAt: HOURS(9),
    corroboration: 2,
    district: "Barishal",
  },
  {
    id: "n10",
    category: "growth",
    headline: "Remittance inflow steady for a third consecutive month",
    summary:
      "Central bank figures show inflows holding near the previous month's level, with formal channels accounting for the bulk.",
    source: "Placeholder Economy Desk",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(10),
    corroboration: 7,
  },
  {
    id: "n11",
    category: "innovation",
    headline: "Local workshop builds an assistive mobility frame",
    summary:
      "The design uses locally available parts and is being offered at a fraction of imported equivalents.",
    source: "Placeholder Community Channel",
    sourceKind: "youtube",
    url: "#",
    publishedAt: HOURS(12),
    district: "Rangpur",
  },
  {
    id: "n12",
    category: "government",
    headline: "Land record digitisation extended to more upazilas",
    summary:
      "Officials said the rollout aims to reduce in-person visits for mutation and record checks.",
    source: "Placeholder Administration Desk",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(14),
    corroboration: 3,
  },
  {
    id: "n13",
    category: "citizen",
    headline: "Residents report a week-long water supply interruption",
    summary:
      "Several households in the same ward described the same outage. The utility has not yet issued a notice.",
    source: "Kandari citizen submission",
    sourceKind: "citizen",
    url: "#",
    publishedAt: HOURS(16),
    district: "Dhaka",
  },
  {
    id: "n14",
    category: "achievement",
    headline: "National team secures a series win",
    summary:
      "The result follows a run of away fixtures and moves the side up in the standings.",
    source: "Placeholder Sports Desk",
    sourceKind: "tv",
    url: "#",
    publishedAt: HOURS(18),
    corroboration: 9,
  },
  {
    id: "n15",
    category: "events",
    headline: "Public consultation announced on a draft transport plan",
    summary:
      "Written submissions will be accepted for thirty days, with three open sessions scheduled.",
    source: "Placeholder Civic Desk",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(20),
  },
  {
    id: "n16",
    category: "citizen",
    headline: "Market traders describe sudden price movement in staples",
    summary:
      "Multiple submissions from the same market reported the same change within two days.",
    source: "Kandari citizen submission",
    sourceKind: "citizen",
    url: "#",
    publishedAt: HOURS(22),
    district: "Mymensingh",
  },
  {
    id: "n17",
    category: "scheme",
    headline: "Refinancing window for cottage and small enterprises reopens",
    summary:
      "Participating banks are accepting applications under a central-bank refinancing scheme aimed at cottage, micro, small and medium enterprises. Women-led enterprises are listed as a priority group.",
    source: "Placeholder Financial Desk",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(2),
    lead: true,
    corroboration: 5,
    facts: [
      { label: "Target group", value: "CMSME" },
      { label: "Priority", value: "Women-led" },
      { label: "Channel", value: "Scheduled banks" },
    ],
    reference: {
      publisher: "Bangladesh Bank",
      document: "SME & Special Programmes Dept. circular",
    },
    whyItMatters:
      "Access to working capital is the single most cited barrier by small manufacturers, so the terms of these windows decide who can actually grow.",
  },
  {
    id: "n18",
    category: "banking",
    headline: "Central bank reiterates start-up financing guidance to banks",
    summary:
      "Guidance to scheduled banks covers entrepreneurship lending for young founders, including eligibility, ceilings and reporting obligations.",
    source: "Placeholder Banking Bureau",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(4),
    corroboration: 4,
    facts: [
      { label: "Instrument", value: "Start-up fund" },
      { label: "Applicant", value: "Young entrepreneurs" },
    ],
    reference: {
      publisher: "Bangladesh Bank",
      document: "Start-up financing policy guidance",
    },
    whyItMatters:
      "Formal credit is what lets a founder hire beyond family labour; without it, promising ventures stay informal.",
  },
  {
    id: "n19",
    category: "banking",
    headline: "Quarterly banking indicators published for scheduled banks",
    summary:
      "The release covers deposit growth, classified loan ratios and capital adequacy across the banking system for the quarter.",
    source: "Placeholder Economy Desk",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(7),
    corroboration: 6,
    facts: [
      { label: "Covers", value: "Scheduled banks" },
      { label: "Frequency", value: "Quarterly" },
    ],
    reference: {
      publisher: "Bangladesh Bank",
      document: "Quarterly financial stability data",
    },
    whyItMatters:
      "Classified-loan trends are the earliest public signal of stress in the credit system.",
  },
  {
    id: "n20",
    category: "scheme",
    headline: "Agricultural credit disbursement targets set for the year",
    summary:
      "Annual targets direct a share of lending toward crop, fisheries and livestock borrowers, with sub-targets for smallholders.",
    source: "Placeholder Agriculture Desk",
    sourceKind: "newspaper",
    url: "#",
    publishedAt: HOURS(9),
    corroboration: 3,
    district: "Rangpur",
    facts: [
      { label: "Sectors", value: "Crop, fisheries, livestock" },
      { label: "Focus", value: "Smallholders" },
    ],
    reference: {
      publisher: "Bangladesh Bank",
      document: "Agricultural & Rural Credit Policy",
    },
    whyItMatters:
      "Whether smallholders reach the formal window determines if they borrow at policy rates or from informal lenders.",
  },
  {
    id: "n21",
    category: "banking",
    headline: "Mobile financial services transaction volumes released",
    summary:
      "Monthly statistics cover cash-in, cash-out, merchant payments and remittance disbursement through mobile financial service providers.",
    source: "Placeholder Digital Finance Desk",
    sourceKind: "online",
    url: "#",
    publishedAt: HOURS(11),
    corroboration: 4,
    facts: [
      { label: "Includes", value: "Merchant payments" },
      { label: "Cadence", value: "Monthly" },
    ],
    reference: {
      publisher: "Bangladesh Bank",
      document: "Mobile Financial Services statistics",
    },
    whyItMatters:
      "MFS rails are how most rural households now receive wages and remittances.",
  },
  {
    id: "n22",
    category: "scheme",
    headline:
      "Training and credit linkage announced for rural women entrepreneurs",
    summary:
      "The programme pairs skills training with a referral route to participating bank branches for collateral-light lending.",
    source: "Placeholder Development Desk",
    sourceKind: "tv",
    url: "#",
    publishedAt: HOURS(13),
    corroboration: 2,
    district: "Mymensingh",
    facts: [
      { label: "Model", value: "Training + credit" },
      { label: "Group", value: "Rural women" },
    ],
    reference: {
      publisher: "SME Foundation",
      document: "Entrepreneurship development programme note",
    },
    whyItMatters:
      "Training without a credit route rarely converts into a registered business.",
  },
  {
    id: "n23",
    category: "events",
    headline: "National SME product fair scheduled in the capital",
    summary:
      "The fair gives small manufacturers direct retail exposure and a scheduled window to meet lenders.",
    source: "Placeholder Trade Desk",
    sourceKind: "social",
    url: "#",
    publishedAt: HOURS(15),
    district: "Dhaka",
    facts: [
      { label: "Format", value: "Exhibition" },
      { label: "For", value: "SME producers" },
    ],
    reference: {
      publisher: "SME Foundation",
      document: "Event announcement",
    },
  },

  /*
   * Inventions and world technology.
   *
   * Unlike the national placeholders above, these point at REAL, publicly
   * reachable sources — each `url` was checked to resolve. The summaries
   * describe what the cited publication covers; they are still our own
   * wording, and the reader is sent to the original for the detail.
   */
  {
    id: "n24",
    category: "technology",
    headline: "MIT Technology Review names its ten breakthrough technologies",
    summary:
      "The annual list sets out the ten technologies the publication judges most consequential for the year ahead, with an explanation of where each one now stands.",
    source: "MIT Technology Review",
    sourceKind: "online",
    url: "https://www.technologyreview.com/2026/01/12/1130697/10-breakthrough-technologies-2026/",
    publishedAt: HOURS(5),
    corroboration: 5,
    facts: [
      { label: "Scope", value: "Global" },
      { label: "Format", value: "Annual list" },
    ],
    reference: {
      publisher: "MIT Technology Review",
      document: "10 Breakthrough Technologies 2026",
    },
    whyItMatters:
      "The list is widely used as a shortlist for what research funding and industry attention move toward next.",
  },
  {
    id: "n25",
    category: "invention",
    headline: "Quantum lattice gates reported to speed up bosonic operations",
    summary:
      "Researchers describe a gate scheme that completes complex quantum operations within a single driving period rather than many repeated cycles, and report it works with existing superconducting circuits.",
    source: "Quantum Computing Report",
    sourceKind: "online",
    url: "https://quantumcomputingreport.com/news/",
    publishedAt: HOURS(8),
    corroboration: 3,
    facts: [
      { label: "Field", value: "Quantum computing" },
      { label: "Claim", value: "Fewer cycles" },
    ],
    reference: {
      publisher: "Chalmers University of Technology",
      document: "Quantum lattice gates research announcement",
    },
    whyItMatters:
      "Error correction is the main barrier to useful quantum machines, and it is bounded by how long each operation takes.",
  },
  {
    id: "n26",
    category: "technology",
    headline: "Sodium-ion batteries move toward manufacturing scale",
    summary:
      "Major cell manufacturers are scaling sodium-ion chemistry, which substitutes abundant salt for lithium. Coverage this year treats it as a cost and supply story rather than a laboratory one.",
    source: "MIT Technology Review",
    sourceKind: "online",
    url: "https://www.technologyreview.com/2026/01/12/1130697/10-breakthrough-technologies-2026/",
    publishedAt: HOURS(11),
    corroboration: 4,
    facts: [
      { label: "Material", value: "Sodium" },
      { label: "Stage", value: "Scaling up" },
    ],
    reference: {
      publisher: "MIT Technology Review",
      document: "10 Breakthrough Technologies 2026",
    },
    whyItMatters:
      "Battery cost sets the pace of grid storage, and lithium supply is concentrated in a handful of countries.",
  },
  {
    id: "n27",
    category: "invention",
    headline: "Patent filings show AI moving into the substance of drug claims",
    summary:
      "Analyses of recent filings describe applications in which an AI component is integrated into the claimed invention itself, rather than being a tool used during development.",
    source: "Nature Biotechnology",
    sourceKind: "online",
    url: "https://www.nature.com/nbt/articles?type=patents&year=2026",
    publishedAt: HOURS(14),
    corroboration: 2,
    facts: [
      { label: "Field", value: "Biotech patents" },
      { label: "Shift", value: "AI in claims" },
    ],
    reference: {
      publisher: "Nature Biotechnology",
      document: "Patents column, 2026",
    },
    whyItMatters:
      "If a therapy cannot be used without its model, regulators and generic manufacturers face a question neither is set up for.",
  },
  {
    id: "n28",
    category: "technology",
    headline: "Year in technology and computing: a running public record",
    summary:
      "A continuously updated chronology of the year's significant computing and technology events, useful as a dated index when checking when something was first announced.",
    source: "Wikipedia",
    sourceKind: "online",
    url: "https://en.wikipedia.org/wiki/2026_in_technology_and_computing",
    publishedAt: HOURS(17),
    facts: [
      { label: "Type", value: "Chronology" },
      { label: "Updated", value: "Continuously" },
    ],
    reference: {
      publisher: "Wikipedia",
      document: "2026 in technology and computing",
    },
  },
  {
    id: "n29",
    category: "invention",
    headline: "Engineering coverage tracks new hardware and robotics work",
    summary:
      "IEEE Spectrum's reporting covers new devices, robotics and semiconductor engineering, with enough technical detail to judge how far a result is from production.",
    source: "IEEE Spectrum",
    sourceKind: "online",
    url: "https://spectrum.ieee.org/",
    publishedAt: HOURS(19),
    corroboration: 2,
    facts: [
      { label: "Publisher", value: "IEEE" },
      { label: "Focus", value: "Applied engineering" },
    ],
    reference: {
      publisher: "IEEE",
      document: "IEEE Spectrum technology reporting",
    },
    whyItMatters:
      "Most breakthrough claims fail at manufacturing, which is the part general coverage usually leaves out.",
  },
];

/** Sources the aggregator is configured to watch. */
export const watchedSources: { name: string; kind: SourceKind }[] = [
  { name: "National dailies", kind: "newspaper" },
  { name: "Television bulletins", kind: "tv" },
  { name: "Online news portals", kind: "online" },
  { name: "Verified social accounts", kind: "social" },
  { name: "Video channels", kind: "youtube" },
  { name: "International tech press", kind: "online" },
  { name: "Kandari citizen reports", kind: "citizen" },
];

export const SUBMIT_PROMPT =
  "Report serious or important news from your area. Keep it factual, say where it happened, and add a source or link if you have one.";

export const SUBMIT_PROMPT_BN =
  "আপনার এলাকার গুরুত্বপূর্ণ সংবাদ জানান। তথ্যভিত্তিক লিখুন, স্থান উল্লেখ করুন এবং সম্ভব হলে সূত্র যুক্ত করুন।";

/** Editorial rule shown beside the feed. */
export const FEED_POLICY =
  'Every item is a short summary that links out to the original report — use "Read the full report" to open the source in a new tab. Kandari does not republish other outlets\' articles, and citizen submissions are marked as unverified until a second independent source is found.';
