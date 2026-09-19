/**
 * Evidence base for the "আমার বাংলাদেশ" national issue dossier.
 *
 * Every figure here is transcribed from the two uploaded source documents:
 * the 32-point issue list and the Manus AI evidence report dated
 * 19 September 2026, which in turn cites World Bank, IMF, UNICEF,
 * Transparency International and BBS publications.
 *
 * The evidence report's own discipline is preserved: each claim carries its
 * status (verified / plausible / requires-verification) so the page never
 * presents an unmeasured assertion as a national statistic.
 *
 * TODO(backend): serve from GET /api/v1/national-dossier once FastAPI lands.
 */

export type EvidenceStatus = "verified" | "plausible" | "unverified";
export type Urgency = "very-high" | "high" | "medium-high" | "medium";

export const REPORT_META = {
  title: "Bangladesh's Structural Problems",
  subtitle: "Evidence, Causal Graph, Loss Scenarios & Reform Architecture",
  preparedBy: "Manus AI",
  date: "19 September 2026",
  sourcePoints: 32,
};

/* ------------------------------------------------------------------ *
 * National baseline — World Bank country page, 2025
 * ------------------------------------------------------------------ */

export interface BaselineStat {
  id: string;
  icon: string;
  label: string;
  banglaLabel: string;
  value: string;
  unit?: string;
  note: string;
  source: string;
  /** 0-100 for the meter; null when the figure is not a proportion. */
  meter: number | null;
  tone: "good" | "watch" | "bad";
}

export const baselineStats: BaselineStat[] = [
  {
    id: "population",
    icon: "groups",
    label: "Population",
    banglaLabel: "জনসংখ্যা",
    value: "175.7",
    unit: "M",
    note: "Estimated population, 2025",
    source: "World Bank country page",
    meter: null,
    tone: "watch",
  },
  {
    id: "gdp",
    icon: "payments",
    label: "GDP",
    banglaLabel: "জিডিপি",
    value: "$456.3",
    unit: "B",
    note: "Nominal GDP, 2025",
    source: "World Bank country page",
    meter: null,
    tone: "good",
  },
  {
    id: "growth",
    icon: "trending_up",
    label: "GDP Growth",
    banglaLabel: "প্রবৃদ্ধি",
    value: "3.5",
    unit: "%",
    note: "IMF reports FY25 growth at 3.7%",
    source: "World Bank / IMF",
    meter: 35,
    tone: "watch",
  },
  {
    id: "inflation",
    icon: "local_fire_department",
    label: "Inflation",
    banglaLabel: "মূল্যস্ফীতি",
    value: "8.8",
    unit: "%",
    note: "IMF reports 10.0% annual-average FY25",
    source: "World Bank / IMF",
    meter: 88,
    tone: "bad",
  },
  {
    id: "unemployment",
    icon: "work_off",
    label: "Unemployment",
    banglaLabel: "বেকারত্ব",
    value: "3.8",
    unit: "%",
    note: "Modeled rate — masks informality and youth exclusion",
    source: "World Bank, 2025",
    meter: 38,
    tone: "watch",
  },
  {
    id: "remittance",
    icon: "send_money",
    label: "Remittances",
    banglaLabel: "রেমিট্যান্স",
    value: "7.4",
    unit: "% of GDP",
    note: "A major external buffer for households",
    source: "World Bank, 2025",
    meter: 74,
    tone: "good",
  },
  {
    id: "electricity",
    icon: "bolt",
    label: "Electricity Access",
    banglaLabel: "বিদ্যুৎ",
    value: "99.5",
    unit: "%",
    note: "Access ≠ reliable or affordable supply",
    source: "World Bank, 2025",
    meter: 99,
    tone: "good",
  },
  {
    id: "sanitation",
    icon: "water_drop",
    label: "Safe Sanitation",
    banglaLabel: "পয়ঃনিষ্কাশন",
    value: "37",
    unit: "%",
    note: "Safely managed sanitation access",
    source: "World Bank, 2025",
    meter: 37,
    tone: "bad",
  },
  {
    id: "internet",
    icon: "wifi",
    label: "Internet Use",
    banglaLabel: "ইন্টারনেট",
    value: "53",
    unit: "%",
    note: "Roughly half the population online",
    source: "World Bank, 2025",
    meter: 53,
    tone: "watch",
  },
  {
    id: "life-expectancy",
    icon: "favorite",
    label: "Life Expectancy",
    banglaLabel: "গড় আয়ু",
    value: "75",
    unit: "yrs",
    note: "A meaningful national gain, 2024",
    source: "World Bank, 2024",
    meter: null,
    tone: "good",
  },
];

/* ------------------------------------------------------------------ *
 * The five priority breaks — the report's strongest evidence
 * ------------------------------------------------------------------ */

export interface PriorityBreak {
  id: string;
  rank: number;
  icon: string;
  title: string;
  banglaTitle: string;
  /** The single headline number that makes the case. */
  headline: string;
  headlineUnit: string;
  headlineCaption: string;
  /** Supporting measured figures. */
  figures: { label: string; value: string }[];
  /** Why this problem exists — its origin mechanism. */
  origin: string;
  /** The documented cost of letting it continue. */
  ifUnsolved: string;
  /** What changes when it is fixed. */
  ifSolved: string;
  source: string;
  status: EvidenceStatus;
}

export const priorityBreaks: PriorityBreak[] = [
  {
    id: "pollution",
    rank: 1,
    icon: "masks",
    title: "Environmental Pollution",
    banglaTitle: "পরিবেশ দূষণ",
    headline: "17.6",
    headlineUnit: "% of GDP",
    headlineCaption: "Annual cost of air, water, sanitation and lead exposure (2019)",
    figures: [
      { label: "Premature deaths", value: "272,000+" },
      { label: "Illness-days", value: "5.2 billion" },
      { label: "Cyclone cost", value: "~$1B / year" },
      { label: "Severe flood GDP hit", value: "up to 9%" },
    ],
    origin:
      "Pollution and transport are not separate problems. Congestion, diesel exposure, industrial effluent discharged untreated into rivers, weak land-use control and unmanaged waste handling transfer costs directly onto households and future generations. Density magnifies every one of these channels.",
    ifUnsolved:
      "The burden compounds. Pollution lowers cognition and labour productivity, raising health spending while reducing earning capacity — a loss channel that runs in both directions at once. Land and river damage passes a point where restoration cost exceeds prevention cost.",
    ifSolved:
      "A 10% reduction in the attributable component implies roughly 1.76% of GDP in gross avoided burden. At 5% and 20% the range is 0.88% to 3.52% — before implementation cost and double-counting adjustments.",
    source: "World Bank Country Environmental Analysis",
    status: "verified",
  },
  {
    id: "learning",
    rank: 2,
    icon: "school",
    title: "Learning, Not Just Schooling",
    banglaTitle: "শিক্ষার মান",
    headline: "43",
    headlineUnit: "%",
    headlineCaption: "Of ten-year-olds proficient in reading (pre-COVID)",
    figures: [
      { label: "Complete secondary education", value: "64%" },
      { label: "Secondary grads with basic competency", value: "25%" },
      { label: "Reading proficiency, age 10", value: "43%" },
    ],
    origin:
      "Access expanded faster than quality. The education system signals credentials more reliably than demonstrated capability, so a certificate stops carrying information about what a young person can actually do. Youth data are scattered across schools, training providers, employers and migration systems.",
    ifUnsolved:
      "Demographic scale becomes a burden rather than a dividend. Young people acquire certificates without usable skills; employers cannot find capability they believe should exist; policymakers plan against a workforce that does not match the records.",
    ifSolved:
      "If a foundational-learning programme adds 10 percentage points of reading proficiency in a defined cohort, future earnings rise on a conservative returns range — but only a cohort model with labour-absorption assumptions can convert that into a national figure.",
    source: "UNICEF Bangladesh",
    status: "verified",
  },
  {
    id: "macro",
    rank: 3,
    icon: "account_balance",
    title: "Macroeconomic Stress",
    banglaTitle: "সামষ্টিক অর্থনীতি",
    headline: "10.0",
    headlineUnit: "%",
    headlineCaption: "Inflation, annual-average basis, FY25",
    figures: [
      { label: "FY25 GDP growth", value: "3.7%" },
      { label: "Tax revenue", value: "Weak" },
      { label: "Financial sector", value: "Vulnerable" },
      { label: "Investment", value: "Weak" },
    ],
    origin:
      "Weak revenue mobilisation and banking-sector vulnerability narrow the fiscal space available for reform, exactly when reform is most needed. Households facing elevated inflation have less capacity to absorb health, food, transport and energy shocks.",
    ifUnsolved:
      "Delay carries macroeconomic cost. The IMF explicitly warns that postponed reform combined with weak revenue, banking vulnerabilities and elevated inflation compounds — the state loses the capacity to fund the very fixes the situation demands.",
    ifSolved:
      "Restored fiscal space is the precondition for everything else on this page. No pollution enforcement, learning recovery or health network survives without a state able to fund and sustain it.",
    source: "IMF Article IV",
    status: "verified",
  },
  {
    id: "corruption",
    rank: 4,
    icon: "gavel",
    title: "Corruption & Trust Deficit",
    banglaTitle: "দুর্নীতি ও আস্থা",
    headline: "24",
    headlineUnit: "/ 100",
    headlineCaption: "Corruption Perceptions Index score — rank 150 of 182",
    figures: [
      { label: "CPI rank", value: "150 / 182" },
      { label: "Paid a bribe (12 months)", value: "24%" },
      { label: "Say corruption is a big problem", value: "72%" },
    ],
    origin:
      "Discretion, opaque processing, weak audit trails, fear of retaliation and complaints that simply disappear create a low-trust equilibrium. Once citizens expect that rules will not be applied evenly, relying on personal connections becomes rational — which further weakens universal rules.",
    ifUnsolved:
      "Trust is an operating input for every other reform on this list. As it falls, reporting falls with it, compliance drops, and the state loses its ability to detect its own failures. Citizens rely more on connections, weakening universal rules further.",
    ifSolved:
      "The measurable target is not a better perception score. It is a reduction in unresolved cases and unauthorised payments with no increase in retaliation — verified over a 12-month complaint-tracking pilot.",
    source: "Transparency International",
    status: "verified",
  },
  {
    id: "climate",
    rank: 5,
    icon: "cyclone",
    title: "Climate Exposure",
    banglaTitle: "জলবায়ু ঝুঁকি",
    headline: "⅓",
    headlineUnit: "of agri GDP",
    headlineCaption: "May be lost to climate variability by 2050",
    figures: [
      { label: "Internal migrants by 2050", value: "13.3M" },
      { label: "Severe flood GDP impact", value: "up to 9%" },
      { label: "Annual cyclone cost", value: "~$1B" },
      { label: "Cyclone deaths since 1970", value: "↓ 100-fold" },
    ],
    origin:
      "Geography places Bangladesh among the most climate-exposed nations on earth. Climate shocks repeatedly damage assets and interrupt schooling, so each event erodes both physical capital and human-capital formation simultaneously.",
    ifUnsolved:
      "Climate shocks displace families and destroy assets faster than they can be rebuilt. One-third of agricultural GDP and 13.3 million internal migrants over 30 years represent a structural reordering of the country, not a series of separate emergencies.",
    ifSolved:
      "Bangladesh already proved this is tractable: a 100-fold reduction in cyclone-related deaths since 1970 is one of the clearest collective-action successes anywhere. The same method — define, measure, test, publish, correct, scale — extends to the rest.",
    source: "World Bank Climate & Development Report",
    status: "verified",
  },
];

/* ------------------------------------------------------------------ *
 * The causal loop — why these problems reinforce each other
 * ------------------------------------------------------------------ */

export const causalChain = [
  {
    step: 1,
    icon: "database",
    label: "Weak measurement",
    detail: "Fragmented responsibility, incompatible records",
  },
  {
    step: 2,
    icon: "search_off",
    label: "Poor targeting",
    detail: "Failure goes undetected because nothing is counted",
  },
  {
    step: 3,
    icon: "warning",
    label: "Service failure",
    detail: "Leakage, pollution, unsafe products, weak justice",
  },
  {
    step: 4,
    icon: "sentiment_dissatisfied",
    label: "Household cost",
    detail: "Illness, insecurity, unemployment, distrust",
  },
  {
    step: 5,
    icon: "trending_down",
    label: "Lower investment",
    detail: "Skills formation and compliance both decline",
  },
  {
    step: 6,
    icon: "refresh",
    label: "Less capacity",
    detail: "The state can no longer fix the original problem",
  },
];

/* ------------------------------------------------------------------ *
 * Causal graph nodes — measurable indicator sets
 * ------------------------------------------------------------------ */

export interface GraphNode {
  id: string;
  icon: string;
  node: string;
  mechanism: string;
  indicators: string;
  matters: string;
}

export const graphNodes: GraphNode[] = [
  {
    id: "data-integrity",
    icon: "database",
    node: "Data integrity",
    mechanism: "Incomplete or incompatible records hide need and failure",
    indicators: "Coverage, missingness, update age, unique IDs, audit exceptions",
    matters:
      "Without a denominator, “all”, “everywhere” and “many” cannot guide policy",
  },
  {
    id: "accountability",
    icon: "balance",
    node: "Accountability",
    mechanism: "Complaints and procurement exceptions do not close the loop",
    indicators: "Case receipt, escalation, resolution time, sanction, appeal",
    matters: "Converts public voice into institutional learning",
  },
  {
    id: "human-capital",
    icon: "psychology",
    node: "Human capital",
    mechanism: "Low foundational learning and poor skills matching reduce productivity",
    indicators: "Reading/numeracy, completion, NEET, job placement, wage progression",
    matters: "Determines whether demographic scale becomes a dividend or a burden",
  },
  {
    id: "service-access",
    icon: "local_hospital",
    node: "Service access",
    mechanism: "Distance and cost delay care, education, justice and safety",
    indicators: "Travel time, out-of-pocket cost, utilization, referral completion",
    matters: "Makes national averages locally actionable",
  },
  {
    id: "environmental-load",
    icon: "eco",
    node: "Environmental load",
    mechanism: "Pollution creates illness, death, lost cognition and lower productivity",
    indicators: "PM2.5, lead, water quality, illness-days, premature mortality",
    matters: "A quantified loss channel, not merely an aesthetic issue",
  },
  {
    id: "economic-resilience",
    icon: "factory",
    node: "Economic resilience",
    mechanism: "Weak firms, energy reliability and logistics reduce investment",
    indicators: "Factory survival, outage-hours, logistics time/cost, exports",
    matters: "Connects infrastructure to jobs and fiscal capacity",
  },
  {
    id: "trust",
    icon: "handshake",
    node: "Trust",
    mechanism: "Unfair treatment reduces reporting, compliance and cooperation",
    indicators: "Bribe incidence, complaint confidence, survey trust, case closure",
    matters: "Trust is an operating input for every reform",
  },
];

/* ------------------------------------------------------------------ *
 * All 32 source points with evidence status
 * ------------------------------------------------------------------ */

export interface SourcePoint {
  n: number;
  topic: string;
  interpretation: string;
  status: EvidenceStatus;
  statusNote: string;
  urgency: Urgency;
  /** Thematic cluster used for filtering. */
  theme: string;
}

export const sourcePoints: SourcePoint[] = [
  {
    n: 1,
    topic: "Medical-sector illness and access",
    interpretation: "Unequal access, service-quality gaps, high out-of-pocket exposure",
    status: "verified",
    statusNote: "Verified problem, but “all people sick” is unsupported",
    urgency: "very-high",
    theme: "Health",
  },
  {
    n: 2,
    topic: "Product supply chain, high and fake prices",
    interpretation: "Price causes must be separated from counterfeit and adulteration",
    status: "plausible",
    statusNote: "Requires product- and market-level measurement",
    urgency: "high",
    theme: "Markets",
  },
  {
    n: 3,
    topic: "Unemployment",
    interpretation: "Headline 3.8% masks informality and youth exclusion",
    status: "verified",
    statusNote: "Headline rate alone understates underemployment",
    urgency: "very-high",
    theme: "Jobs",
  },
  {
    n: 4,
    topic: "Factory shutdowns",
    interpretation: "Direct job loss plus supplier and household losses",
    status: "verified",
    statusNote: "Closure counts need sector, date and source",
    urgency: "very-high",
    theme: "Jobs",
  },
  {
    n: 5,
    topic: "Transparency, accountability, criminal records",
    interpretation: "Interoperable justice information with due-process safeguards",
    status: "verified",
    statusNote: "Criminal records require due process and privacy",
    urgency: "very-high",
    theme: "Governance",
  },
  {
    n: 6,
    topic: "Complaint pathways",
    interpretation: "Cases cannot be tracked end-to-end",
    status: "verified",
    statusNote: "Verified governance design gap",
    urgency: "very-high",
    theme: "Governance",
  },
  {
    n: 7,
    topic: "Bribery and illegal approvals",
    interpretation: "24% of service users reported paying a bribe in 12 months",
    status: "verified",
    statusNote: "“Everywhere” and collective blame are unsupported",
    urgency: "very-high",
    theme: "Governance",
  },
  {
    n: 8,
    topic: "Inaccurate youth and human-resource data",
    interpretation: "Registry coverage must be quantified",
    status: "plausible",
    statusNote: "Directly linked to data fragmentation",
    urgency: "high",
    theme: "Data",
  },
  {
    n: 9,
    topic: "Union engineers, agriculture officers, doctors",
    interpretation: "Costed pilot with professional supervision, not a national promise",
    status: "unverified",
    statusNote: "Proposal, not established fact",
    urgency: "high",
    theme: "Service",
  },
  {
    n: 10,
    topic: "Homelessness, hunger, rural deprivation",
    interpretation: "Poverty headcount 5.9% at $3.00/day is not a homelessness measure",
    status: "verified",
    statusNote: "Exact Dhaka homelessness claim needs a census",
    urgency: "very-high",
    theme: "Poverty",
  },
  {
    n: 11,
    topic: "Education and career alignment",
    interpretation: "Multiple pathways after foundational literacy and numeracy",
    status: "verified",
    statusNote: "Proposed specialization needs safeguards",
    urgency: "very-high",
    theme: "Education",
  },
  {
    n: 12,
    topic: "Outdated structures, ethics, stress",
    interpretation: "Requires survey and institutional-performance data",
    status: "plausible",
    statusNote: "Plausible but under-measured",
    urgency: "high",
    theme: "Governance",
  },
  {
    n: 13,
    topic: "Cleanliness, habits and Dhaka livability",
    interpretation: "A waste, drainage and enforcement system problem",
    status: "verified",
    statusNote: "Moralized wording should not replace service analysis",
    urgency: "high",
    theme: "Environment",
  },
  {
    n: 14,
    topic: "Fake-product market",
    interpretation: "Batch IDs, lab tests, risk-based inspection, recall capability",
    status: "plausible",
    statusNote: "Requires seizures, lab tests and prevalence sampling",
    urgency: "high",
    theme: "Markets",
  },
  {
    n: 15,
    topic: "Logistics and transport",
    interpretation: "Shipment time, dwell time, truck speed, warehouse loss",
    status: "verified",
    statusNote: "LPI data are periodic",
    urgency: "high",
    theme: "Infrastructure",
  },
  {
    n: 16,
    topic: "Environmental risk",
    interpretation: "17.6% of GDP, 272,000 premature deaths",
    status: "verified",
    statusNote: "Verified and quantitatively severe",
    urgency: "very-high",
    theme: "Environment",
  },
  {
    n: 17,
    topic: "Natural resources and land management",
    interpretation: "Local inventories are needed",
    status: "verified",
    statusNote: "Verified climate/land governance concern",
    urgency: "high",
    theme: "Environment",
  },
  {
    n: 18,
    topic: "Water treatment, rivers, water conflict",
    interpretation: "Severe river-quality decline from industrial discharge",
    status: "verified",
    statusNote: "Verified water-quality and security concern",
    urgency: "very-high",
    theme: "Environment",
  },
  {
    n: 19,
    topic: "Low wages, stress and living difficulty",
    interpretation: "Needs sector wages and productivity data",
    status: "verified",
    statusNote: "Verified cost-of-living risk",
    urgency: "high",
    theme: "Jobs",
  },
  {
    n: 20,
    topic: "Social involvement, distance and justice",
    interpretation: "Needs representative surveys",
    status: "plausible",
    statusNote: "Plausible social-capital concern",
    urgency: "medium-high",
    theme: "Society",
  },
  {
    n: 21,
    topic: "Startup investment and commercialization",
    interpretation: "Invention does not automatically become a product",
    status: "plausible",
    statusNote: "Needs investment, survival and time-to-market data",
    urgency: "high",
    theme: "Innovation",
  },
  {
    n: 22,
    topic: "Satellite awareness and use",
    interpretation: "Flood mapping, crop monitoring, maritime safety, disaster response",
    status: "unverified",
    statusNote: "Opportunity, not necessarily a crisis",
    urgency: "medium",
    theme: "Innovation",
  },
  {
    n: 23,
    topic: "Slow justice administration",
    interpretation: "Requires official case-flow data",
    status: "verified",
    statusNote: "Verified as a possible backlog/processing issue",
    urgency: "very-high",
    theme: "Governance",
  },
  {
    n: 24,
    topic: "Police modernization and analytics",
    interpretation: "Transparent, auditable, human-supervised deployment",
    status: "verified",
    statusNote: "Risk of abuse requires oversight and data safeguards",
    urgency: "very-high",
    theme: "Safety",
  },
  {
    n: 25,
    topic: "Student talent, R&D and sector freedom",
    interpretation: "Measure research funding and outcomes",
    status: "verified",
    statusNote: "Verified human-capital and innovation concern",
    urgency: "high",
    theme: "Innovation",
  },
  {
    n: 26,
    topic: "Skills-to-sector placement mismatch",
    interpretation: "Measurable through vacancy, graduate and wage data",
    status: "plausible",
    statusNote: "Plausible and measurable",
    urgency: "high",
    theme: "Jobs",
  },
  {
    n: 27,
    topic: "Business reopening, startups, capital markets",
    interpretation: "Requires insolvency, finance and investor-protection analysis",
    status: "plausible",
    statusNote: "Plausible reform agenda",
    urgency: "high",
    theme: "Innovation",
  },
  {
    n: 28,
    topic: "Energy, gas, coal, load distribution planning",
    interpretation: "99.5% access does not guarantee reliability or affordability",
    status: "verified",
    statusNote: "Verified energy-sector challenge",
    urgency: "very-high",
    theme: "Infrastructure",
  },
  {
    n: 29,
    topic: "Political-worker idleness and crime",
    interpretation: "Internships can be piloted, not assumed",
    status: "unverified",
    statusNote: "Requires neutral crime and political-finance evidence",
    urgency: "medium-high",
    theme: "Society",
  },
  {
    n: 30,
    topic: "Women's safety and family security",
    interpretation: "Lighting, transport, reporting, survivor services, enforcement",
    status: "verified",
    statusNote: "Technology is only one layer",
    urgency: "very-high",
    theme: "Safety",
  },
  {
    n: 31,
    topic: "Brain drain",
    interpretation: "Objective is brain circulation, not retention alone",
    status: "verified",
    statusNote: "Diaspora links can convert loss into networks",
    urgency: "high",
    theme: "Innovation",
  },
  {
    n: 32,
    topic: "Self-change, trust, people-government relationship",
    interpretation: "Requires institutional mechanisms, not slogans",
    status: "unverified",
    statusNote: "Normative objective supported by governance evidence",
    urgency: "high",
    theme: "Society",
  },
];

/* ------------------------------------------------------------------ *
 * Loss projection — the report's own calculation rules
 * ------------------------------------------------------------------ */

export const CALC_RULES = {
  futureBurden: "Future burden = baseline burden × (1 + growth rate)ᵗ × exposure share × severity share",
  netBenefit: "Net benefit = avoided burden − implementation cost − displacement cost",
  closureLoss:
    "Annual earnings at risk = workers displaced × median annual earnings × expected months without work / 12",
};

/** Avoided-burden scenarios on the 17.6%-of-GDP environmental cost. */
export interface Scenario {
  reduction: number;
  avoidedPctGdp: number;
  avoidedUsdB: number;
  label: string;
  tone: "low" | "central" | "high";
}

export const avoidedBurdenScenarios: Scenario[] = [
  { reduction: 5, avoidedPctGdp: 0.88, avoidedUsdB: 4.02, label: "Low case", tone: "low" },
  { reduction: 10, avoidedPctGdp: 1.76, avoidedUsdB: 8.03, label: "Central case", tone: "central" },
  { reduction: 20, avoidedPctGdp: 3.52, avoidedUsdB: 16.06, label: "High case", tone: "high" },
];

/**
 * Compounding-loss projection if the 17.6%-of-GDP environmental burden is
 * left unaddressed while GDP grows at the reported 3.5%.
 *
 * This is a transparent calculation, not a forecast — the report is explicit
 * that scenario ≠ realised outcome.
 */
export const lossProjection = (() => {
  const GDP_2025 = 456.3;
  const BURDEN_SHARE = 0.176;
  const GROWTH = 0.035;
  const years = [2026, 2028, 2030, 2032, 2035, 2040, 2045, 2050];
  return years.map((year) => {
    const t = year - 2025;
    const gdp = GDP_2025 * Math.pow(1 + GROWTH, t);
    const unchecked = gdp * BURDEN_SHARE;
    // Central-case intervention removes 10% of the attributable component.
    const withReform = unchecked * 0.9;
    return {
      year,
      gdp: +gdp.toFixed(1),
      unchecked: +unchecked.toFixed(1),
      withReform: +withReform.toFixed(1),
      gap: +(unchecked - withReform).toFixed(1),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * Staged reform architecture
 * ------------------------------------------------------------------ */

export interface ReformStage {
  id: string;
  horizon: string;
  banglaHorizon: string;
  icon: string;
  actions: string[];
}

export const reformStages: ReformStage[] = [
  {
    id: "first-100",
    horizon: "First 100 Days",
    banglaHorizon: "প্রথম ১০০ দিন",
    icon: "rocket_launch",
    actions: [
      "Publish a national indicator registry with definitions, owners, update frequency and quality flags",
      "Start complaint receipts and status tracking in five high-volume services",
      "Select two urban and two rural pilots for primary care, foundational learning, pollution monitoring, skills matching and energy reliability",
      "Protect pilots from political capture through public criteria, independent evaluation and published budgets",
    ],
  },
  {
    id: "years-0-2",
    horizon: "Years 0–2",
    banglaHorizon: "০–২ বছর",
    icon: "construction",
    actions: [
      "Build interoperable registries with privacy controls",
      "Measure homelessness and food insecurity",
      "Launch high-risk product sampling across 20 product lines",
      "Fund learning recovery and employer-linked skills pilots",
      "Establish environmental hotspot enforcement",
      "Create a justice case-flow dashboard",
      "Use open contracting and random audits; report quarterly on outcomes, not spending",
    ],
  },
  {
    id: "years-3-5",
    horizon: "Years 3–5",
    banglaHorizon: "৩–৫ বছর",
    icon: "trending_up",
    actions: [
      "Scale only interventions that meet pre-set thresholds",
      "Integrate labour, education and training data",
      "Expand local engineering and agriculture support based on demonstrated need",
      "Upgrade logistics nodes and cold chains",
      "Improve energy reliability in productive zones",
      "Institutionalize independent evaluation and citizen appeals",
    ],
  },
  {
    id: "years-5-10",
    horizon: "Years 5–10",
    banglaHorizon: "৫–১০ বছর",
    icon: "account_balance",
    actions: [
      "Move from project-based reform to permanent institutions",
      "Establish a statistical data trust and professional local service cadres",
      "Climate-resilient spatial planning and a learning-and-work system",
      "Accountable justice information and a green industrial strategy",
      "Link medium-term budgets to measurable health, learning, job, pollution, safety and trust outcomes",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Monitoring dashboard — baseline, target, red flag
 * ------------------------------------------------------------------ */

export interface MonitorRow {
  domain: string;
  icon: string;
  baseline: string;
  target: string;
  redFlag: string;
}

export const monitorRows: MonitorRow[] = [
  {
    domain: "Health",
    icon: "local_hospital",
    baseline: "Out-of-pocket share, referral completion, medicine stock-outs",
    target: "Improve each pilot indicator by a pre-registered percentage",
    redFlag: "No independent patient-safety audit",
  },
  {
    domain: "Learning",
    icon: "school",
    baseline: "Reading/numeracy proficiency and attendance",
    target: "Cohort improvement with equity breakdown",
    redFlag: "Enrollment rises while learning stagnates",
  },
  {
    domain: "Jobs",
    icon: "work",
    baseline: "Youth NEET, real wage, placement retention",
    target: "Placement and 12-month retention targets",
    redFlag: "Training counts rise without earnings",
  },
  {
    domain: "Governance",
    icon: "gavel",
    baseline: "Complaint receipt, resolution, bribe reports",
    target: "Faster closure and lower unauthorized-payment reports",
    redFlag: "Retaliation or unexplained case deletion",
  },
  {
    domain: "Pollution",
    icon: "eco",
    baseline: "PM2.5, water quality, lead, illness-days",
    target: "Hotspot reductions with compliance verification",
    redFlag: "Monitoring exists but enforcement does not",
  },
  {
    domain: "Logistics",
    icon: "local_shipping",
    baseline: "Shipment time, dwell time, spoilage, cost spread",
    target: "Lower variance and loss",
    redFlag: "Average improves while rural areas worsen",
  },
  {
    domain: "Energy",
    icon: "bolt",
    baseline: "Outage hours, feeder losses, industrial reliability",
    target: "Reliability gains at transparent cost",
    redFlag: "Access headline masks service degradation",
  },
  {
    domain: "Safety",
    icon: "shield",
    baseline: "Reported incidents, response time, survivor support",
    target: "Faster safe response and improved confidence",
    redFlag: "Reporting falls because trust falls",
  },
  {
    domain: "Innovation",
    icon: "lightbulb",
    baseline: "Startup survival, follow-on capital, procurement pilots",
    target: "More products reach paying customers",
    redFlag: "Grants rise without commercialization",
  },
  {
    domain: "Trust",
    icon: "handshake",
    baseline: "Survey confidence, audit findings, appeal outcomes",
    target: "Increased confidence with corroborating administrative data",
    redFlag: "Perception improves while objective outcomes worsen",
  },
];

/* ------------------------------------------------------------------ *
 * Emergency categories — what needs action first
 * ------------------------------------------------------------------ */

export interface EmergencyCategory {
  id: string;
  icon: string;
  title: string;
  banglaTitle: string;
  pointCount: number;
  summary: string;
  tone: "critical" | "high";
}

export const emergencyCategories: EmergencyCategory[] = [
  {
    id: "measurement",
    icon: "database",
    title: "Measurement & Accountability Layer",
    banglaTitle: "পরিমাপ ও জবাবদিহি",
    pointCount: 6,
    summary:
      "Solve this first. Without denominators, complaint tracking and audit trails, every other intervention is untargetable and unverifiable.",
    tone: "critical",
  },
  {
    id: "environment",
    icon: "eco",
    title: "Pollution & Water Emergency",
    banglaTitle: "দূষণ ও পানি জরুরি অবস্থা",
    pointCount: 4,
    summary:
      "The largest quantified loss channel at 17.6% of GDP. Rivers dying from industrial discharge, 272,000 premature deaths annually.",
    tone: "critical",
  },
  {
    id: "health",
    icon: "local_hospital",
    title: "Primary Health Access",
    banglaTitle: "প্রাথমিক স্বাস্থ্যসেবা",
    pointCount: 2,
    summary:
      "Fragmented across public, private, NGO, pharmacy and informal channels. Patients pay directly, self-medicate, or arrive late.",
    tone: "critical",
  },
  {
    id: "learning",
    icon: "school",
    title: "Foundational Learning Recovery",
    banglaTitle: "শিক্ষার ভিত্তি পুনরুদ্ধার",
    pointCount: 4,
    summary:
      "Only 43% of ten-year-olds read proficiently; 25% of secondary graduates hold basic competencies. Scale becomes burden, not dividend.",
    tone: "critical",
  },
  {
    id: "jobs",
    icon: "work",
    title: "Jobs, Wages & Factory Survival",
    banglaTitle: "কর্মসংস্থান ও কারখানা",
    pointCount: 4,
    summary:
      "A quantity-quality gap. Low headline unemployment coexists with informality, underemployment and youth exclusion.",
    tone: "high",
  },
  {
    id: "energy",
    icon: "bolt",
    title: "Energy Reliability & Load Planning",
    banglaTitle: "জ্বালানি নির্ভরযোগ্যতা",
    pointCount: 2,
    summary:
      "99.5% access is not reliable or affordable supply. Planning needs hourly demand, dispatch, losses and industrial load data.",
    tone: "high",
  },
  {
    id: "safety",
    icon: "shield",
    title: "Women's Safety & Public Protection",
    banglaTitle: "নারী নিরাপত্তা",
    pointCount: 3,
    summary:
      "Layered action: lighting, transport, safe reporting, survivor services, workplace safeguards, enforcement and economic independence.",
    tone: "critical",
  },
  {
    id: "innovation",
    icon: "lightbulb",
    title: "Innovation & Brain Circulation",
    banglaTitle: "উদ্ভাবন ও মেধা",
    pointCount: 5,
    summary:
      "Invention does not automatically become a product. Convert brain drain into brain circulation through diaspora networks.",
    tone: "high",
  },
];

/* ------------------------------------------------------------------ *
 * Evidence discipline — the three rules the report enforces
 * ------------------------------------------------------------------ */

export const evidenceRules = [
  {
    icon: "fact_check",
    rule: "A national claim must identify the country, population, time period, indicator and source.",
  },
  {
    icon: "account_tree",
    rule: "A causal claim must distinguish correlation from mechanism.",
  },
  {
    icon: "verified",
    rule: "A solution is credible only when a real programme, institution or comparable example exists — and its limits are stated.",
  },
];

/** Claims from the source list the evidence report explicitly could not verify. */
export const unsupportedClaims = [
  "“All people are sick” — no defined population or measurement method",
  "“Bribes are everywhere” — 24% reported paying one; collective blame is unsupported",
  "“Bangladesh has too many engineers” — engineer supply is unmeasured",
  "“Dhaka is the worst city” — requires a defined index, date and source",
];

export const CLOSING_STATEMENT =
  "The solution is not to change everyone's mentality by moral pressure. The credible route is to make honest behaviour safer, faster and more rewarding than bribery or evasion: reliable services, clear rules, visible case handling, fair enforcement, accurate data, professional local delivery, and leaders who accept independent scrutiny.";

export const PROOF_OF_POSSIBILITY =
  "Bangladesh already has evidence of successful collective action: a 100-fold reduction in cyclone-related deaths since 1970. The same principle extends — define the problem, measure it openly, test a solution locally, publish the result, correct failure, and scale only what works.";
