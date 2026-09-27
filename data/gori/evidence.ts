/**
 * The game's evidence store — every record the AI may cite and the
 * evidence explorer shows. Built only from the national dossier
 * (data/amar-bangladesh.ts), which compiles World Bank, IMF, UNICEF,
 * Transparency International and BBS figures.
 *
 * The dossier names each publisher but carries no document URLs or
 * publication dates, so `url` and `publicationDate` stay empty rather than
 * being guessed. `retrievalDate` is the dossier's own date.
 *
 * TODO(backend): serve from an evidence service with per-record source
 * links, reviewer sign-off and versioning (Prompt V3 §15 evidence_sources).
 */

import {
  baselineStats,
  evidenceRules,
  graphNodes,
  monitorRows,
  priorityBreaks,
  PROOF_OF_POSSIBILITY,
  REPORT_META,
  sourcePoints,
  unsupportedClaims,
  type EvidenceStatus,
} from "../amar-bangladesh.ts";
import { codeOf, type ModuleCode } from "./modules.ts";

export const EVIDENCE_VERSION = "evidence-2026-09-19";
const RETRIEVED = "2026-09-19";

export type SourceType =
  | "statistic" // a published national figure
  | "finding" // a documented finding with its figures
  | "interpretation" // the dossier's reading of one of the 32 points
  | "mechanism" // a causal mechanism the dossier describes
  | "indicator" // a monitoring indicator with its red flag
  | "rule" // an evidence-discipline rule
  | "unsupported"; // a claim the dossier explicitly could not support

export interface EvidenceRecord {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  publicationDate?: string;
  retrievalDate: string;
  sourceType: SourceType;
  status: EvidenceStatus | "unsupported";
  reliabilityNotes: string;
  extractedClaims: string[];
  modules: ModuleCode[];
  /** Extra search words, Bangla and English. */
  keywords: string[];
}

const DOSSIER = `${REPORT_META.title} (${REPORT_META.preparedBy}, ${REPORT_META.date})`;

/** Which modules a dossier theme or domain speaks to. */
const THEME_MODULES: Record<string, number[]> = {
  Health: [1, 10, 14, 18],
  Markets: [2, 14, 19],
  Jobs: [3, 4, 19, 26],
  Governance: [5, 6, 7, 12, 23],
  Data: [8, 22, 26],
  Service: [9, 1],
  Poverty: [10, 19],
  Education: [11, 25, 26],
  Environment: [13, 16, 17, 18],
  Infrastructure: [15, 28],
  Society: [20, 29, 32],
  Innovation: [21, 22, 25, 27, 31],
  Safety: [24, 29, 30],
  Learning: [11, 25],
  Pollution: [16, 18, 13],
  Logistics: [15, 2],
  Energy: [28, 4],
  Trust: [32, 5, 7],
};

const mods = (...themes: string[]) => [...new Set(themes.flatMap((t) => THEME_MODULES[t] ?? []))].map(codeOf);

const BASE_MODULES: Record<string, number[]> = {
  population: [8],
  gdp: [3, 19],
  growth: [3, 4, 27],
  inflation: [19, 2],
  unemployment: [3, 26],
  remittance: [31, 19],
  electricity: [28],
  sanitation: [13, 18, 1],
  internet: [22, 8],
  "life-expectancy": [1],
};

const PRIORITY_MODULES: Record<string, number[]> = {
  pollution: [16, 18, 13, 1],
  learning: [11, 25, 26],
  macro: [19, 27, 3],
  corruption: [7, 5, 6, 32],
  climate: [17, 16, 22],
};

const GRAPH_MODULES: Record<string, number[]> = {
  "data-integrity": [8, 22],
  accountability: [6, 5, 7],
  "human-capital": [11, 26, 3],
  "service-access": [1, 9, 10],
  "environmental-load": [16, 18, 1],
  "economic-resilience": [4, 15, 28],
  trust: [32, 7, 5],
};

export const evidence: EvidenceRecord[] = [
  ...baselineStats.map<EvidenceRecord>((s) => ({
    id: `EV-BASE-${s.id}`,
    title: `${s.banglaLabel} — ${s.label}`,
    publisher: s.source,
    retrievalDate: RETRIEVED,
    sourceType: "statistic",
    status: "verified",
    reliabilityNotes: `${s.note}। ডসিয়ে-তে সংকলিত; মূল নথির লিংক এখানে নেই।`,
    extractedClaims: [`${s.label}: ${s.value}${s.unit ? ` ${s.unit}` : ""}`],
    modules: (BASE_MODULES[s.id] ?? []).map(codeOf),
    keywords: [s.label, s.banglaLabel, s.id],
  })),
  ...priorityBreaks.map<EvidenceRecord>((b) => ({
    id: `EV-PRIO-${b.id}`,
    title: `${b.banglaTitle} — ${b.title}`,
    publisher: b.source,
    retrievalDate: RETRIEVED,
    sourceType: "finding",
    status: b.status,
    reliabilityNotes: "প্রতিবেদনের সবচেয়ে শক্ত প্রমাণের পাঁচটির একটি।",
    extractedClaims: [`${b.headline} ${b.headlineUnit}: ${b.headlineCaption}`, ...b.figures.map((f) => `${f.label}: ${f.value}`)],
    modules: (PRIORITY_MODULES[b.id] ?? []).map(codeOf),
    keywords: [b.title, b.banglaTitle, b.id],
  })),
  ...sourcePoints.map<EvidenceRecord>((p) => ({
    id: `EV-POINT-${String(p.n).padStart(2, "0")}`,
    title: `পয়েন্ট ${p.n}: ${p.topic}`,
    publisher: DOSSIER,
    retrievalDate: RETRIEVED,
    sourceType: "interpretation",
    status: p.status,
    reliabilityNotes: p.statusNote,
    extractedClaims: [p.interpretation],
    modules: [codeOf(p.n)],
    keywords: [p.topic, p.theme],
  })),
  ...graphNodes.map<EvidenceRecord>((g) => ({
    id: `EV-MECH-${g.id}`,
    title: `কারণ-প্রক্রিয়া: ${g.node}`,
    publisher: DOSSIER,
    retrievalDate: RETRIEVED,
    sourceType: "mechanism",
    status: "plausible",
    reliabilityNotes: "প্রতিবেদনের কারণ-গ্রাফ: প্রক্রিয়ার বর্ণনা, মাপা প্রভাব নয়।",
    extractedClaims: [g.mechanism, `মাপার সূচক: ${g.indicators}`, g.matters],
    modules: (GRAPH_MODULES[g.id] ?? []).map(codeOf),
    keywords: [g.node, g.id],
  })),
  ...monitorRows.map<EvidenceRecord>((r) => ({
    id: `EV-MON-${r.domain.toLowerCase()}`,
    title: `নজরদারি সূচক: ${r.domain}`,
    publisher: DOSSIER,
    retrievalDate: RETRIEVED,
    sourceType: "indicator",
    status: "plausible",
    reliabilityNotes: "প্রস্তাবিত মনিটরিং কাঠামো — লক্ষ্যমাত্রা নয়, মাপার পদ্ধতি।",
    extractedClaims: [`বেসলাইন: ${r.baseline}`, `লক্ষ্য: ${r.target}`, `রেড ফ্ল্যাগ: ${r.redFlag}`],
    modules: mods(r.domain),
    keywords: [r.domain],
  })),
  ...evidenceRules.map<EvidenceRecord>((r, i) => ({
    id: `EV-RULE-${i + 1}`,
    title: `প্রমাণের নিয়ম ${i + 1}`,
    publisher: DOSSIER,
    retrievalDate: RETRIEVED,
    sourceType: "rule",
    status: "verified",
    reliabilityNotes: "প্রতিবেদনের পদ্ধতিগত নিয়ম।",
    extractedClaims: [r.rule],
    modules: [],
    keywords: ["evidence", "প্রমাণ", "নিয়ম"],
  })),
  ...unsupportedClaims.map<EvidenceRecord>((c, i) => ({
    id: `EV-UNSUP-${i + 1}`,
    title: "অসমর্থিত দাবি",
    publisher: DOSSIER,
    retrievalDate: RETRIEVED,
    sourceType: "unsupported",
    status: "unsupported",
    reliabilityNotes: "প্রতিবেদন এই দাবি যাচাই করতে পারেনি — প্রমাণ হিসেবে ব্যবহার করা যাবে না।",
    extractedClaims: [c],
    modules: [[1], [7], [9], [13]][i]?.map(codeOf) ?? [],
    keywords: ["unsupported", "অসমর্থিত"],
  })),
  {
    id: "EV-PROOF-cyclone",
    title: "সম্ভাব্যতার প্রমাণ: ঘূর্ণিঝড়ে মৃত্যু ১০০ গুণ কম",
    publisher: "World Bank Climate & Development Report",
    retrievalDate: RETRIEVED,
    sourceType: "finding",
    status: "verified",
    reliabilityNotes: "সমষ্টিগত উদ্যোগের সফল উদাহরণ; অন্য খাতে একই ফল হবে — এমন দাবি নয়।",
    extractedClaims: [PROOF_OF_POSSIBILITY],
    modules: [16, 22, 24, 20].map(codeOf),
    keywords: ["cyclone", "ঘূর্ণিঝড়", "disaster", "দুর্যোগ"],
  },
];

export const evidenceById = new Map(evidence.map((e) => [e.id, e]));
