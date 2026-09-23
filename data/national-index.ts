/**
 * Static national indicators for the Kandari sovereign dashboard.
 *
 * Figures sit in the real published range reported for Bangladesh by the World
 * Bank, IMF, Bangladesh Bank, BBS, IQAir and BGMEA/news coverage, but they are
 * hardcoded snapshots, not a live feed.
 *
 * TODO(backend): replace with GET /api/v1/national-index once FastAPI lands.
 */

export type RiskTone = "stable" | "watch" | "critical";

export interface NationalStat {
  id: string;
  /** Material Symbols ligature name. */
  icon: string;
  label: string;
  banglaLabel: string;
  value: string;
  unit?: string;
  caption: string;
  /** Signed change vs the previous reporting period, already formatted. */
  delta?: string;
  deltaDirection?: "up" | "down";
  /** Whether an upward delta is good news for this particular metric. */
  upIsGood?: boolean;
  tone: RiskTone;
  /** 0-100, drives the meter fill. */
  progress: number;
  source: string;
}

export const nationalStats: NationalStat[] = [
  {
    id: "world-rank",
    icon: "public",
    label: "Global Economy Rank",
    banglaLabel: "বিশ্ব অর্থনীতি র‍্যাঙ্ক",
    value: "35",
    unit: "/ 196",
    caption: "Nominal GDP ≈ $450B — 2nd largest in South Asia",
    delta: "+2",
    deltaDirection: "up",
    upIsGood: true,
    tone: "stable",
    progress: 82,
    source: "IMF World Economic Outlook",
  },
  {
    id: "air-quality",
    icon: "masks",
    label: "Unhygienic City Rank",
    banglaLabel: "অস্বাস্থ্যকর শহর র‍্যাঙ্ক",
    value: "#1",
    unit: "worst-AQI capital",
    caption: "Dhaka AQI 189 — hazardous for sensitive groups",
    delta: "+3",
    deltaDirection: "up",
    upIsGood: false,
    tone: "critical",
    progress: 94,
    source: "IQAir World Air Quality Report",
  },
  {
    id: "productivity",
    icon: "groups",
    label: "Workforce Productivity",
    banglaLabel: "উৎপাদনশীলতা অনুপাত",
    value: "61.4",
    unit: "%",
    caption: "73.6M active of 119.9M working-age population",
    delta: "+0.8%",
    deltaDirection: "up",
    upIsGood: true,
    tone: "watch",
    progress: 61,
    source: "BBS Labour Force Survey",
  },
  {
    id: "external-debt",
    icon: "account_balance",
    label: "International Loan",
    banglaLabel: "বৈদেশিক ঋণ",
    value: "$103.8",
    unit: "B",
    caption: "≈ 22% of GDP — servicing cost rising yearly",
    delta: "+6.2%",
    deltaDirection: "up",
    upIsGood: false,
    tone: "critical",
    progress: 78,
    source: "Bangladesh Bank External Debt Statistics",
  },
  {
    id: "resource-waste",
    icon: "delete_sweep",
    label: "Resource Wastage",
    banglaLabel: "সম্পদের অপচয়",
    value: "27.6",
    unit: "%",
    caption: "Post-harvest, energy and supply-chain losses",
    delta: "-1.4%",
    deltaDirection: "down",
    upIsGood: false,
    tone: "watch",
    progress: 28,
    source: "FAO / Power Division estimates",
  },
  {
    id: "factory-shutdown",
    icon: "factory",
    label: "Factories Shut Down",
    banglaLabel: "বন্ধ কারখানা",
    value: "1,142",
    unit: "units",
    caption: "RMG and allied units closed in the last 24 months",
    delta: "+87",
    deltaDirection: "up",
    upIsGood: false,
    tone: "critical",
    progress: 71,
    source: "BGMEA / BKMEA industry reporting",
  },
  {
    id: "judgment-ratio",
    icon: "gavel",
    label: "Judgment Clearance",
    banglaLabel: "বিচার নিষ্পত্তি অনুপাত",
    value: "38.2",
    unit: "%",
    caption: "4.2M cases pending across all tiers",
    delta: "+1.1%",
    deltaDirection: "up",
    upIsGood: true,
    tone: "watch",
    progress: 38,
    source: "Supreme Court of Bangladesh annual report",
  },
  {
    id: "satisfaction",
    icon: "sentiment_satisfied",
    label: "Citizen Satisfaction",
    banglaLabel: "নাগরিক সন্তুষ্টি",
    value: "54.7",
    unit: "%",
    caption: "Rolling 30-day average of Kandari daily submissions",
    delta: "+2.3%",
    deltaDirection: "up",
    upIsGood: true,
    tone: "watch",
    progress: 55,
    source: "Kandari citizen input ledger",
  },
];

export interface EconomicRisk {
  id: string;
  label: string;
  banglaLabel: string;
  /** 0-100 composite risk score. */
  score: number;
  tone: RiskTone;
  detail: string;
}

/** Composite "দেউলিয়া / collapsed economy" early-warning inputs. */
export const economicRisks: EconomicRisk[] = [
  {
    id: "reserves",
    label: "FX Reserve Cover",
    banglaLabel: "রিজার্ভ",
    score: 68,
    tone: "critical",
    detail: "$19.4B — roughly 3.4 months of import cover",
  },
  {
    id: "inflation",
    label: "Inflation Pressure",
    banglaLabel: "মূল্যস্ফীতি",
    score: 74,
    tone: "critical",
    detail: "9.7% headline, food basket above 11%",
  },
  {
    id: "debt-service",
    label: "Debt Servicing Load",
    banglaLabel: "ঋণ পরিশোধ",
    score: 59,
    tone: "watch",
    detail: "$4.1B annual outflow against export earnings",
  },
  {
    id: "energy",
    label: "Energy Import Exposure",
    banglaLabel: "জ্বালানি নির্ভরতা",
    score: 63,
    tone: "watch",
    detail: "Subsidy arrears straining the power sector",
  },
];

/** Weighted composite of the four risk inputs above. */
export const DEULIA_RISK_SCORE = 66;
export const DEULIA_RISK_LABEL = "ELEVATED";

export interface ImprovementArea {
  id: string;
  label: string;
  banglaLabel: string;
  icon: string;
}

/** Options for the "which needs improvement" field of the daily form. */
export const improvementAreas: ImprovementArea[] = [
  { id: "traffic", label: "Traffic & Transport", banglaLabel: "যানজট", icon: "traffic" },
  { id: "health", label: "Healthcare", banglaLabel: "স্বাস্থ্যসেবা", icon: "local_hospital" },
  { id: "power", label: "Electricity & Gas", banglaLabel: "বিদ্যুৎ ও গ্যাস", icon: "bolt" },
  { id: "water", label: "Water & Sanitation", banglaLabel: "পানি ও পয়ঃনিষ্কাশন", icon: "water_drop" },
  { id: "waste", label: "Waste Management", banglaLabel: "বর্জ্য ব্যবস্থাপনা", icon: "delete" },
  { id: "corruption", label: "Corruption & Services", banglaLabel: "দুর্নীতি", icon: "gavel" },
  { id: "education", label: "Education", banglaLabel: "শিক্ষা", icon: "school" },
  { id: "jobs", label: "Employment", banglaLabel: "কর্মসংস্থান", icon: "work" },
];

export const DAILY_FORM_PROMPT =
  "How was your day and which is need to improved and goverment can fix it within 2 days?";
export const DAILY_FORM_PROMPT_BN =
  "আপনার দিনটি কেমন কাটল এবং কোন সমস্যাটি সরকার ২ দিনের মধ্যে সমাধান করতে পারে?";
export const KANDARI_PLEDGE = "আমরা কাণ্ডারী — নিজের বাংলা নিজে বিচার করি।";
