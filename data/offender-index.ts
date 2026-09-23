/**
 * আজকের অপরাধী — the offender index.
 *
 * ── Why this file has two record types ───────────────────────────────
 *
 * The reference design for this page showed six named people with
 * mugshots. Their statuses were: পলাতক ×3, রিমান্ডে ×1, জামিনে ×1,
 * কারাগারে আটক ×1 — not one conviction on the page. That is a watchlist
 * of people the police are interested in, published with faces, aliases
 * and the neighbourhoods they frequent, beside a button asking the
 * public to report sightings. In Bangladesh that is how গণপিটুনি
 * starts, and a wrong photo or a name collision is enough.
 *
 * So the page is built from two disjoint sources:
 *
 *   `OffenderPattern`  — the analytical view. Carries crime counts,
 *                        categories, areas and trends, and CANNOT carry
 *                        a name or a photograph: `name?: never`. This is
 *                        what drives the main grid, the histogram and
 *                        the register. Pattern analysis never needed an
 *                        identity to work.
 *
 *   `ConvictedOffender` — the public conviction registry. May carry a
 *                        name, because a court has ruled in open
 *                        session and the record is public. Cannot be
 *                        constructed without `court`, `caseNo` and
 *                        `sentence`.
 *
 * There is deliberately no type that can hold "unconvicted person" plus
 * "name". Not as a convention — the compiler rejects it.
 *
 * ── Data provenance ──────────────────────────────────────────────────
 *
 * Everything below is an ILLUSTRATIVE PLACEHOLDER. No real person is
 * described. The convicted entries use "নাম রায়ে উল্লিখিত" rather than
 * invented names, because inventing a plausible Bangladeshi name beside
 * a fabricated conviction is itself a small defamation waiting to
 * collide with a real person.
 *
 * No photographs. See components/offender/offender-card.tsx.
 *
 * TODO(backend): GET /api/v1/offender-index must serve these as two
 * separate endpoints with separate authorisation. The pattern feed is
 * derived from aggregate case data and must be stripped of identity at
 * source, not in the client. The conviction registry must cite the
 * court's published judgment and carry a takedown path for appeal,
 * acquittal and spent convictions.
 */

import type { CrimeCategoryId } from "@/data/crime-index";

/** Risk band for a pattern, by volume and severity — never about a person. */
export type RiskBand = "watch" | "elevated" | "critical";

export interface RiskMeta {
  id: RiskBand;
  banglaLabel: string;
  /** Chip classes. */
  chip: string;
  /** Accent bar along the card's top edge. */
  bar: string;
  dot: string;
  text: string;
}

export const riskBands: RiskMeta[] = [
  {
    id: "watch",
    banglaLabel: "পর্যবেক্ষণাধীন",
    chip: "border-bdgreen-200 bg-bdgreen-50 text-bdgreen-900",
    bar: "bg-bd-green",
    dot: "bg-bd-green",
    text: "text-bd-green",
  },
  {
    id: "elevated",
    banglaLabel: "উচ্চ পুনরাবৃত্তি",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
    bar: "bg-signal-orange",
    dot: "bg-signal-orange",
    text: "text-amber-700",
  },
  {
    id: "critical",
    banglaLabel: "সর্বোচ্চ অগ্রাধিকার",
    chip: "border-red-300 bg-red-50 text-red-800",
    bar: "bg-national-crimson",
    dot: "bg-national-crimson",
    text: "text-national-crimson",
  },
];

/** The stage a case cluster has reached. Not a verdict. */
export type CaseStage =
  | "under-investigation"
  | "charge-framed"
  | "on-trial"
  | "warrant-issued";

export const caseStages: Record<CaseStage, { bangla: string; chip: string }> = {
  "under-investigation": {
    bangla: "তদন্তাধীন",
    chip: "border-slate-300 bg-slate-100 text-slate-700",
  },
  "charge-framed": {
    bangla: "অভিযোগপত্র দাখিল",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
  },
  "on-trial": {
    bangla: "বিচারাধীন",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
  },
  "warrant-issued": {
    bangla: "পরোয়ানা জারি",
    chip: "border-red-300 bg-red-50 text-red-800",
  },
};

/** One counted offence type within a pattern. */
export interface OffenceCount {
  category: CrimeCategoryId;
  /** Bangla label for display — mirrors the crime taxonomy. */
  label: string;
  count: number;
  /** Tailwind text colour for the count pill. */
  tone: string;
}

/**
 * An anonymised offence pattern — a cluster of linked cases.
 *
 * `name` and `photo` are typed `never` so that no amount of later
 * editing can attach an identity to an unconvicted cluster.
 */
export interface OffenderPattern {
  /** Case-cluster reference. Not a person id. */
  ref: string;
  risk: RiskBand;
  stage: CaseStage;
  /** Where the linked cases occurred. */
  areas: string[];
  district: string;
  /** Police station holding the file. */
  thana: string;
  totalOffences: number;
  breakdown: OffenceCount[];
  /** Statutes cited across the cluster. */
  statutes: string[];
  /** Months the cluster has been open. */
  activeMonths: number;
  /** How the cluster was linked — always stated. */
  linkedBy: string;
  source: string;
  name?: never;
  photo?: never;
}

/**
 * A conviction. Public record, because a court ruled in open session.
 * Cannot exist without the judgment that justifies naming someone.
 */
export interface ConvictedOffender {
  ref: string;
  /** Placeholder: real data cites the name as printed in the judgment. */
  name: string;
  /** Optional and unused in placeholder data — see the card component. */
  photo?: string;
  court: string;
  caseNo: string;
  sentence: string;
  /** ISO date the judgment was delivered. */
  judgmentDate: string;
  offences: OffenceCount[];
  totalOffences: number;
  statutes: string[];
  district: string;
  /** Whether an appeal is pending — a conviction under appeal is not final. */
  appealPending: boolean;
  source: string;
}

/* ── Pattern feed (placeholder) ──────────────────────────────────────── */

export const offenderPatterns: OffenderPattern[] = [
  {
    ref: "BD-CP-2026-1049",
    risk: "critical",
    stage: "warrant-issued",
    areas: ["কারওয়ান বাজার", "তেজগাঁও শিল্প এলাকা"],
    district: "ঢাকা",
    thana: "তেজগাঁও থানা",
    totalOffences: 14,
    activeMonths: 19,
    linkedBy: "একই এলাকায় পুনরাবৃত্ত এজাহার ও অভিন্ন কার্যপদ্ধতি",
    breakdown: [
      {
        category: "extortion",
        label: "চাঁদাবাজি",
        count: 5,
        tone: "text-national-crimson",
      },
      {
        category: "armed-robbery",
        label: "ছিনতাই ও পথরোধ",
        count: 4,
        tone: "text-amber-700",
      },
      {
        category: "grievous-hurt",
        label: "গুরুতর আঘাত",
        count: 3,
        tone: "text-bd-green",
      },
      {
        category: "simple-assault",
        label: "মারামারি",
        count: 2,
        tone: "text-slate-600",
      },
    ],
    statutes: ["দণ্ডবিধি ৩৮৫", "দণ্ডবিধি ৩৮৭", "দণ্ডবিধি ৩৯২"],
    source: "থানা এজাহার সমষ্টি",
  },
  {
    ref: "BD-CP-2026-4428",
    risk: "elevated",
    stage: "on-trial",
    areas: ["গুলিস্তান", "সদরঘাট", "যাত্রাবাড়ী টার্মিনাল"],
    district: "ঢাকা",
    thana: "কোতোয়ালী থানা",
    totalOffences: 22,
    activeMonths: 26,
    linkedBy: "একই পরিবহন করিডোরে ধারাবাহিক অভিযোগ",
    breakdown: [
      {
        category: "petty-theft",
        label: "পকেটমারি ও ছিনতাই",
        count: 11,
        tone: "text-amber-700",
      },
      {
        category: "public-nuisance",
        label: "গণউপদ্রব",
        count: 5,
        tone: "text-slate-600",
      },
      {
        category: "burglary",
        label: "দোকান চুরি",
        count: 4,
        tone: "text-bd-green",
      },
      {
        category: "simple-assault",
        label: "ভয়ভীতি প্রদর্শন",
        count: 2,
        tone: "text-national-crimson",
      },
    ],
    statutes: ["দণ্ডবিধি ৩৭৯", "দণ্ডবিধি ২৯০", "দণ্ডবিধি ৫০৬"],
    source: "থানা এজাহার সমষ্টি",
  },
  {
    ref: "BD-CP-2026-9011",
    risk: "critical",
    stage: "warrant-issued",
    areas: ["মিরপুর", "গাবতলী", "সাভার বেল্ট"],
    district: "ঢাকা",
    thana: "মিরপুর মডেল থানা",
    totalOffences: 19,
    activeMonths: 31,
    linkedBy: "জব্দ আলামতের ফরেনসিক মিল",
    breakdown: [
      {
        category: "extortion",
        label: "চাঁদাবাজি ও হামলা",
        count: 5,
        tone: "text-amber-700",
      },
      {
        category: "grievous-hurt",
        label: "হত্যা প্রচেষ্টা",
        count: 4,
        tone: "text-national-crimson",
      },
      {
        category: "narcotics",
        label: "অবৈধ পণ্য পাচার",
        count: 4,
        tone: "text-bd-green",
      },
      {
        category: "armed-robbery",
        label: "সশস্ত্র তৎপরতা",
        count: 6,
        tone: "text-national-crimson",
      },
    ],
    statutes: ["দণ্ডবিধি ৩০৭", "দণ্ডবিধি ৩৮৫", "বিস্ফোরক আইন ৩/৪"],
    source: "আদালতে দাখিলকৃত অভিযোগপত্র",
  },
  {
    ref: "BD-CP-2026-6188",
    risk: "elevated",
    stage: "charge-framed",
    areas: ["উত্তরা", "বিমানবন্দর", "আশুলিয়া হাইওয়ে"],
    district: "ঢাকা",
    thana: "উত্তরা পূর্ব থানা",
    totalOffences: 11,
    activeMonths: 14,
    linkedBy: "জব্দ জাল নথির অভিন্ন ছাপ",
    breakdown: [
      {
        category: "fraud",
        label: "ভুয়া পরিচয়ে প্রতারণা",
        count: 5,
        tone: "text-bd-green",
      },
      {
        category: "extortion",
        label: "ব্ল্যাকমেইল",
        count: 3,
        tone: "text-amber-700",
      },
      {
        category: "fraud",
        label: "জাল সিল ও নথি",
        count: 2,
        tone: "text-slate-600",
      },
      {
        category: "simple-assault",
        label: "সরকারি কাজে বাধা",
        count: 1,
        tone: "text-national-crimson",
      },
    ],
    statutes: ["দণ্ডবিধি ১৭০", "দণ্ডবিধি ১৭১", "দণ্ডবিধি ৪২০"],
    source: "আদালতে দাখিলকৃত অভিযোগপত্র",
  },
  {
    ref: "BD-CP-2026-7203",
    risk: "critical",
    stage: "under-investigation",
    areas: ["মোহাম্মদপুর", "রায়েরবাজার"],
    district: "ঢাকা",
    thana: "মোহাম্মদপুর থানা",
    totalOffences: 16,
    activeMonths: 22,
    linkedBy: "উদ্ধার হওয়া চালানের ধারাবাহিকতা",
    breakdown: [
      {
        category: "narcotics",
        label: "মাদক সরবরাহ",
        count: 8,
        tone: "text-national-crimson",
      },
      {
        category: "narcotics",
        label: "পরিবহন নেটওয়ার্ক",
        count: 5,
        tone: "text-amber-700",
      },
      {
        category: "grievous-hurt",
        label: "অভিযানে বাধা ও হামলা",
        count: 2,
        tone: "text-national-crimson",
      },
      {
        category: "armed-robbery",
        label: "অবৈধ অস্ত্র",
        count: 1,
        tone: "text-bd-green",
      },
    ],
    statutes: ["মাদক নিয়ন্ত্রণ আইন ৩৬(১)", "দণ্ডবিধি ৩৩২", "দণ্ডবিধি ৩৫৩"],
    source: "মাদক নিয়ন্ত্রণ অধিদপ্তর প্রতিবেদন",
  },
  {
    ref: "BD-CP-2026-3392",
    risk: "watch",
    stage: "on-trial",
    areas: ["মতিঝিল", "পল্টন", "দৈনিক বাংলা মোড়"],
    district: "ঢাকা",
    thana: "মতিঝিল থানা",
    totalOffences: 26,
    activeMonths: 38,
    linkedBy: "সিটি কর্পোরেশনের ধারাবাহিক উচ্ছেদ নথি",
    breakdown: [
      {
        category: "extortion",
        label: "ফুটপাত দখল ও চাঁদা",
        count: 12,
        tone: "text-amber-700",
      },
      {
        category: "fraud",
        label: "অবৈধ সংযোগ বিতরণ",
        count: 6,
        tone: "text-bd-green",
      },
      {
        category: "simple-assault",
        label: "হকারদের হুমকি",
        count: 5,
        tone: "text-slate-600",
      },
      {
        category: "public-nuisance",
        label: "গণউপদ্রব",
        count: 3,
        tone: "text-slate-600",
      },
    ],
    statutes: ["দণ্ডবিধি ৩৮৬", "দণ্ডবিধি ২৯০", "দণ্ডবিধি ৩২৩"],
    source: "সিটি কর্পোরেশন ও থানা যৌথ নথি",
  },
];

/* ── Conviction registry (placeholder) ───────────────────────────────── */

export const convictedOffenders: ConvictedOffender[] = [
  {
    ref: "BD-CV-2026-0114",
    name: "নাম রায়ে উল্লিখিত",
    court: "ঢাকা জেলা ও দায়রা জজ আদালত",
    caseNo: "নমুনা মামলা নং ০০০/২০২৬",
    sentence: "৭ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
    judgmentDate: "2026-09-18",
    totalOffences: 4,
    offences: [
      {
        category: "fraud",
        label: "ভুয়া দলিলে অর্থ আত্মসাৎ",
        count: 3,
        tone: "text-bd-green",
      },
      {
        category: "fraud",
        label: "জাল নথি প্রস্তুত",
        count: 1,
        tone: "text-slate-600",
      },
    ],
    statutes: ["দণ্ডবিধি ৪২০", "দণ্ডবিধি ৪৬৮"],
    district: "ঢাকা",
    appealPending: false,
    source: "আদালতের প্রকাশিত রায়",
  },
  {
    ref: "BD-CV-2026-0097",
    name: "নাম রায়ে উল্লিখিত",
    court: "চট্টগ্রাম মহানগর দায়রা জজ আদালত",
    caseNo: "নমুনা মামলা নং ০০০/২০২৫",
    sentence: "৫ বছর সশ্রম কারাদণ্ড",
    judgmentDate: "2026-08-04",
    totalOffences: 3,
    offences: [
      {
        category: "extortion",
        label: "সংগঠিত চাঁদাবাজি",
        count: 2,
        tone: "text-amber-700",
      },
      {
        category: "simple-assault",
        label: "ভয়ভীতি প্রদর্শন",
        count: 1,
        tone: "text-slate-600",
      },
    ],
    statutes: ["দণ্ডবিধি ৩৮৫", "দণ্ডবিধি ৫০৬"],
    district: "চট্টগ্রাম",
    appealPending: true,
    source: "আদালতের প্রকাশিত রায়",
  },
  {
    ref: "BD-CV-2026-0061",
    name: "নাম রায়ে উল্লিখিত",
    court: "ঢাকা বিশেষ ট্রাইব্যুনাল",
    caseNo: "নমুনা মামলা নং ০০০/২০২৪",
    sentence: "১০ বছর কারাদণ্ড ও অর্থদণ্ড",
    judgmentDate: "2026-06-22",
    totalOffences: 5,
    offences: [
      {
        category: "narcotics",
        label: "মাদক সরবরাহ",
        count: 4,
        tone: "text-national-crimson",
      },
      {
        category: "grievous-hurt",
        label: "অভিযানে বাধা",
        count: 1,
        tone: "text-amber-700",
      },
    ],
    statutes: ["মাদক নিয়ন্ত্রণ আইন ৩৬(১)"],
    district: "ঢাকা",
    appealPending: false,
    source: "আদালতের প্রকাশিত রায়",
  },
];

/* ── Aggregates ──────────────────────────────────────────────────────── */

/** Category share of the whole pattern feed, for the histogram. */
export interface CategoryShare {
  label: string;
  percent: number;
  bar: string;
  swatch: string;
}

export const categoryShares: CategoryShare[] = [
  {
    label: "চাঁদাবাজি ও দখল",
    percent: 38,
    bar: "bg-national-crimson",
    swatch: "bg-national-crimson",
  },
  {
    label: "চুরি ও ছিনতাই",
    percent: 29,
    bar: "bg-signal-orange",
    swatch: "bg-signal-orange",
  },
  {
    label: "মাদক ও অস্ত্র",
    percent: 21,
    bar: "bg-bd-green",
    swatch: "bg-bd-green",
  },
  {
    label: "গণউপদ্রব",
    percent: 12,
    bar: "bg-slate-400",
    swatch: "bg-slate-400",
  },
];

/**
 * Headline counts.
 *
 * Every figure here describes CASES or CLUSTERS, never "criminals".
 * The reference read "মোট চিহ্নিত অপরাধী: ৮,৯৪০ জন", which counts
 * unconvicted people as criminals in the headline number.
 *
 * TODO(backend): must be derived from the same query as the feed, or
 * the totals will contradict the rows beneath them.
 */
export const offenderStats = {
  openClusters: "৮,৯৪০",
  underInvestigation: "৬,৩১৫",
  warrantIssued: "১২৭",
  convictions: "৪১৩",
  topDistrictShare: "৪৬.২%",
} as const;
