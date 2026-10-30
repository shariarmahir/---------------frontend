/**
 * Complaint centre data — categories, routing targets and helplines.
 *
 * The routing table below is the useful part of this screen even before a
 * backend exists: it tells a citizen WHICH authority handles their problem,
 * which is the thing most people get wrong when they try to complain.
 *
 * TODO(backend): POST /api/v1/complaints, then real delivery to the mapped
 * department. Until that exists the UI must not claim a complaint was filed.
 */

export type ComplaintCategory =
  | "chadabaji"
  | "bribery"
  | "police-misconduct"
  | "land-grab"
  | "service-denial"
  | "harassment"
  | "environment"
  | "consumer"
  | "labour"
  | "other";

/** Which authority actually handles a given kind of complaint. */
export interface RoutingTarget {
  /** The body that receives it. */
  authority: string;
  authorityBn: string;
  /** What that body is empowered to do about it. */
  remit: string;
}

export interface ComplaintCategoryMeta {
  id: ComplaintCategory;
  label: string;
  labelBn: string;
  icon: string;
  /** The tile's flat field: navy, ink or cobalt. */
  chip: string;
  /** One line a citizen can match their situation against. */
  describes: string;
  routesTo: RoutingTarget;
  /** True when the situation may be an emergency needing 999 first. */
  urgent?: boolean;
}

export const complaintCategories: ComplaintCategoryMeta[] = [
  {
    id: "chadabaji",
    label: "Extortion",
    labelBn: "চাঁদাবাজি",
    icon: "payments",
    chip: "bg-cobalt text-white",
    describes:
      "Someone is demanding regular payments from you, your shop or your transport to let you operate.",
    routesTo: {
      authority: "Nearest Police Station (Thana)",
      authorityBn: "নিকটস্থ থানা",
      remit: "Files a General Diary or FIR and investigates.",
    },
    urgent: true,
  },
  {
    id: "bribery",
    label: "Bribery by Officials",
    labelBn: "ঘুষ দাবি",
    icon: "gavel",
    chip: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    describes:
      "A government officer is demanding money to do work that is supposed to be free or fee-fixed.",
    routesTo: {
      authority: "Anti-Corruption Commission (ACC)",
      authorityBn: "দুর্নীতি দমন কমিশন",
      remit: "Investigates corruption by public servants. Hotline 106.",
    },
  },
  {
    id: "police-misconduct",
    label: "Police Misconduct",
    labelBn: "পুলিশি অসদাচরণ",
    icon: "shield_person",
    chip: "bg-cobalt text-white",
    describes:
      "Refusal to take your case, unlawful detention, abuse of authority or demand for money by police.",
    routesTo: {
      authority: "Superintendent of Police / IGP Complaint Cell",
      authorityBn: "পুলিশ সুপার / আইজিপি অভিযোগ সেল",
      remit:
        "Handles complaints against police that a station itself will not take.",
    },
  },
  {
    id: "land-grab",
    label: "Land Grabbing",
    labelBn: "ভূমি দখল",
    icon: "landscape",
    chip: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    describes:
      "Someone has occupied your land, forged records, or is blocking your lawful possession.",
    routesTo: {
      authority:
        "Deputy Commissioner (DC) Office / Assistant Commissioner (Land)",
      authorityBn: "জেলা প্রশাসক / সহকারী কমিশনার (ভূমি)",
      remit: "Holds the land records and can act on unlawful occupation.",
    },
  },
  {
    id: "service-denial",
    label: "Service Denial",
    labelBn: "সেবা বঞ্চনা",
    icon: "block",
    chip: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    describes:
      "A public office is refusing, delaying or obstructing a service you are entitled to.",
    routesTo: {
      authority: "GRS — Grievance Redress System (relevant Ministry)",
      authorityBn: "অভিযোগ প্রতিকার ব্যবস্থা (জিআরএস)",
      remit:
        "The government's own grievance channel for service failures. Hotline 333.",
    },
  },
  {
    id: "harassment",
    label: "Harassment & Safety",
    labelBn: "হয়রানি ও নিরাপত্তা",
    icon: "report",
    chip: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    describes:
      "Threats, stalking, sexual harassment, or violence against you or a family member.",
    routesTo: {
      authority: "Nearest Police Station / Women & Children Helpline",
      authorityBn: "নিকটস্থ থানা / নারী ও শিশু হেল্পলাইন",
      remit: "Immediate protection. Call 999 now if you are in danger, or 109.",
    },
    urgent: true,
  },
  {
    id: "environment",
    label: "Environment",
    labelBn: "পরিবেশ",
    icon: "eco",
    chip: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    describes:
      "Illegal filling of water bodies, unlicensed emissions, tree felling or industrial dumping.",
    routesTo: {
      authority: "Department of Environment (DoE)",
      authorityBn: "পরিবেশ অধিদপ্তর",
      remit: "Inspects and fines environmental violations.",
    },
  },
  {
    id: "consumer",
    label: "Consumer Rights",
    labelBn: "ভোক্তা অধিকার",
    icon: "shopping_cart",
    chip: "bg-cobalt text-white",
    describes:
      "Overcharging above listed price, adulterated goods, short weight or refusal to give a receipt.",
    routesTo: {
      authority: "Directorate of National Consumer Rights Protection",
      authorityBn: "জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর",
      remit:
        "Fines traders and returns a share of the fine to the complainant.",
    },
  },
  {
    id: "labour",
    label: "Labour & Wages",
    labelBn: "শ্রম ও মজুরি",
    icon: "engineering",
    chip: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    describes:
      "Unpaid wages, unsafe workplace, unlawful dismissal or denial of legal leave.",
    routesTo: {
      authority: "Department of Inspection for Factories and Establishments",
      authorityBn: "কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তর",
      remit: "Inspects workplaces and pursues wage recovery.",
    },
  },
  {
    id: "other",
    label: "Other",
    labelBn: "অন্যান্য",
    icon: "more_horiz",
    chip: "bg-white/10 text-white ring-1 ring-white/20 ring-inset",
    describes: "Anything that does not fit the categories above.",
    routesTo: {
      authority: "Kandari review — routed after reading",
      authorityBn: "কাণ্ডারী পর্যালোচনা",
      remit: "A volunteer reads it and points it at the right authority.",
    },
  },
];

/**
 * National helplines.
 *
 * These are Bangladesh's official published shortcodes. They are listed here
 * rather than as per-station numbers because a shortcode is stable and
 * verifiable, where an individual station's direct line is neither.
 */
export interface Helpline {
  number: string;
  label: string;
  labelBn: string;
  note: string;
  icon: string;
  emergency?: boolean;
}

export const helplines: Helpline[] = [
  {
    number: "999",
    label: "National Emergency",
    labelBn: "জাতীয় জরুরি সেবা",
    note: "Police, fire and ambulance. Free, 24 hours.",
    icon: "emergency",
    emergency: true,
  },
  {
    number: "109",
    label: "Women & Children Helpline",
    labelBn: "নারী ও শিশু হেল্পলাইন",
    note: "Violence against women and children. Free, 24 hours.",
    icon: "support_agent",
    emergency: true,
  },
  {
    number: "106",
    label: "Anti-Corruption Commission",
    labelBn: "দুর্নীতি দমন কমিশন",
    note: "Report bribery and corruption by public officials.",
    icon: "gavel",
  },
  {
    number: "333",
    label: "Government Services",
    labelBn: "সরকারি সেবা",
    note: "District administration information and grievance routing.",
    icon: "call",
  },
  {
    number: "16430",
    label: "Free Legal Aid",
    labelBn: "সরকারি আইনি সহায়তা",
    note: "National Legal Aid Services Organisation. Free advice and a lawyer if you cannot pay.",
    icon: "balance",
  },
  {
    number: "16263",
    label: "Health Line",
    labelBn: "স্বাস্থ্য বাতায়ন",
    note: "Government health advice and hospital information.",
    icon: "local_hospital",
  },
];

/**
 * Sample station entries.
 *
 * CLEARLY PLACEHOLDER. Station names are real divisional cities, but the
 * entries carry no direct phone numbers: publishing an unverified number on
 * a page people reach in an emergency is worse than publishing none, because
 * a wrong number costs time when time is the thing that matters. The map
 * link resolves a real nearest station through the user's own map app.
 *
 * TODO(backend): GET /api/v1/stations?lat=&lon= against the official
 * Bangladesh Police directory, with verified numbers per station.
 */
export interface StationArea {
  division: string;
  divisionBn: string;
  /** Query used to find stations in this area on a map. */
  mapQuery: string;
}

export const stationAreas: StationArea[] = [
  {
    division: "Dhaka",
    divisionBn: "ঢাকা",
    mapQuery: "police station Dhaka Bangladesh",
  },
  {
    division: "Chattogram",
    divisionBn: "চট্টগ্রাম",
    mapQuery: "police station Chattogram Bangladesh",
  },
  {
    division: "Khulna",
    divisionBn: "খুলনা",
    mapQuery: "police station Khulna Bangladesh",
  },
  {
    division: "Rajshahi",
    divisionBn: "রাজশাহী",
    mapQuery: "police station Rajshahi Bangladesh",
  },
  {
    division: "Sylhet",
    divisionBn: "সিলেট",
    mapQuery: "police station Sylhet Bangladesh",
  },
  {
    division: "Barishal",
    divisionBn: "বরিশাল",
    mapQuery: "police station Barishal Bangladesh",
  },
  {
    division: "Rangpur",
    divisionBn: "রংপুর",
    mapQuery: "police station Rangpur Bangladesh",
  },
  {
    division: "Mymensingh",
    divisionBn: "ময়মনসিংহ",
    mapQuery: "police station Mymensingh Bangladesh",
  },
];

/** Shown on the page so the limits of this tool are never implied away. */
export const COMPLAINT_POLICY_BN =
  "কাণ্ডারী কোনো সরকারি সংস্থা নয়। এই পাতা সঠিক দপ্তর চিনতে, অভিযোগ গুছিয়ে লিখতে আর প্রমাণ রাখতে সাহায্য করে; এখানে লেখা অভিযোগ নিজে থেকে কোনো দপ্তরে যায় না। জরুরি প্রয়োজনে ৯৯৯ নম্বরে কল করুন।";
