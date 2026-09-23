/**
 * আজকের অপরাধ — the daily crime index.
 *
 * ── Identity rule (read before adding a record) ──────────────────────
 *
 * A person is named and pictured ONLY when `status: "convicted"` and the
 * record carries a `court` and `caseNo`. Everyone else — arrested,
 * charged, on trial, at large — is `accused`, and the UI shows no name
 * and no photograph for them, because in Bangladeshi law and everywhere
 * else an accused person is innocent until a court says otherwise.
 *
 * This is not a stylistic choice, and it is not negotiable per-record.
 * Publishing a face beside the word "অপরাধী" and a map pin before
 * conviction is defamatory with no truth defence available, and a wrong
 * match on a page branded as a police-synced national database is how
 * innocent people get attacked. `CrimeRecord` is typed so the unsafe
 * combination cannot be expressed: `AccusedRecord` declares
 * `offenderName?: never`, so naming an unconvicted person is a compile
 * error rather than a code-review conversation.
 *
 * If a future requirement is "show the wanted person's face", the answer
 * is a police-issued wanted notice that links out to the issuing
 * authority's own published notice — the state takes responsibility for
 * that publication and can withdraw it. This file does not become that
 * authority by copying its output.
 *
 * ── Data provenance ──────────────────────────────────────────────────
 *
 * Every record below is an ILLUSTRATIVE PLACEHOLDER written to build this
 * UI. No real person is named and no real case is described.
 *
 * Records carry NO photographs. The obvious shortcut — reuse the news
 * feed's stock library — was tried and reverted: those images are
 * generic business and street photography, several of them showing
 * identifiable faces, and one landed under a snatching headline. A stock
 * photo of an unrelated person beneath a crime headline accuses that
 * person, whatever the caption says. The cards render a tinted plate
 * with the category glyph instead, which claims nothing.
 *
 * A real photograph may be attached only when it depicts the actual
 * scene, is licensed for the use, carries a credit, and contains no
 * identifiable bystander — and never a person presented as an offender.
 *
 * TODO(backend): replace with GET /api/v1/crime-index. That service must
 * source from court records, police FIR data and verified reporting, and
 * must carry the conviction status through, or the identity rule above
 * cannot be enforced at render time.
 */

/** The three-tier severity scale, smallest first. */
export type CrimeTier = "petty" | "moderate" | "heinous";

export type CrimeCategoryId =
  // Tier 1 — non-cognizable.
  | "public-urination"
  | "public-nuisance"
  | "petty-theft"
  | "simple-assault"
  | "defamation"
  // Tier 2 — cognizable.
  | "burglary"
  | "fraud"
  | "extortion"
  | "narcotics"
  | "grievous-hurt"
  // Tier 3 — cognizable, non-bailable.
  | "murder"
  | "sexual-violence"
  | "armed-robbery"
  | "trafficking"
  | "acid-attack";

export interface TierMeta {
  id: CrimeTier;
  label: string;
  banglaLabel: string;
  /** The legal classification, in the state's own words. */
  legalClass: string;
  description: string;
  /** Tailwind classes for the tier chip. */
  chip: string;
  /** Solid fill for the thumbnail badge, where the chip sits on photography. */
  badge: string;
  /** Tinted plate behind the thumbnail glyph when a record has no photo. */
  plate: string;
  accent: string;
  /** Dot colour for the tier summary card heading. */
  dot: string;
  text: string;
}

/**
 * Severity rises with the tier, and so does the colour weight. Per
 * CLAUDE.md §4.1 the crimson is reserved for genuine urgency, so only the
 * heinous tier carries it; the lower two sit in bottle green and amber.
 */
export const crimeTiers: TierMeta[] = [
  {
    id: "petty",
    label: "Petty offences",
    banglaLabel: "ছোট / তুচ্ছ অপরাধ",
    legalClass: "অ-আমলযোগ্য (Non-Cognizable)",
    description:
      "গণউপদ্রব, ফুটপাত দখল, যত্রতত্র ময়লা ফেলা, শব্দদূষণ, ছোটখাটো চুরি ও সাধারণ অসদাচরণ।",
    chip: "border-bdgreen-200 bg-bdgreen-50 text-bdgreen-900",
    badge: "bg-bd-green text-white",
    plate: "bg-linear-to-br from-bdgreen-50 to-bdgreen-100 text-bdgreen-900",
    accent: "bg-bd-green",
    dot: "bg-bd-green",
    text: "text-bd-green",
  },
  {
    id: "moderate",
    label: "Cognizable offences",
    banglaLabel: "মাঝারি ধরনের অপরাধ",
    legalClass: "আমলযোগ্য (Cognizable)",
    description:
      "সিঁধেল চুরি, চাঁদাবাজি, প্রতারণা ও জালিয়াতি, মাদকদ্রব্য বহন, অবৈধ অস্ত্র প্রদর্শন।",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
    badge: "bg-signal-orange text-white",
    plate: "bg-linear-to-br from-amber-50 to-amber-100 text-amber-900",
    accent: "bg-signal-orange",
    dot: "bg-signal-orange",
    text: "text-amber-700",
  },
  {
    id: "heinous",
    label: "Heinous crimes",
    banglaLabel: "গুরুতর / বড় অপরাধ",
    legalClass: "আমলযোগ্য ও অ-জামিনযোগ্য (Heinous)",
    description:
      "হত্যা/খুন (দণ্ডবিধি ৩০২), ধর্ষণ, সশস্ত্র ডাকাতি, অপহরণ ও মানবপাচার, এসিড সন্ত্রাস।",
    chip: "border-red-300 bg-red-50 text-red-800",
    badge: "bg-national-crimson text-white",
    plate: "bg-linear-to-br from-red-50 to-red-100 text-red-900",
    accent: "bg-national-crimson",
    dot: "bg-national-crimson",
    text: "text-national-crimson",
  },
];

export interface CrimeCategoryMeta {
  id: CrimeCategoryId;
  tier: CrimeTier;
  banglaLabel: string;
  label: string;
  icon: string;
  /** Statute reference where one specific section governs it. */
  statute?: string;
}

/**
 * The categories, ordered smallest-to-largest within each tier.
 * উন্মুক্ত স্থানে প্রস্রাব leads the list: it is the most visible daily
 * civic offence and the one people actually encounter, so burying it
 * under the rarer serious crimes would misrepresent the daily picture.
 */
export const crimeCategories: CrimeCategoryMeta[] = [
  {
    id: "public-urination",
    tier: "petty",
    banglaLabel: "উন্মুক্ত স্থানে প্রস্রাব",
    label: "Public urination",
    icon: "wc",
    statute: "দণ্ডবিধি ২৯০",
  },
  {
    id: "public-nuisance",
    tier: "petty",
    banglaLabel: "গণউপদ্রব / রাস্তায় বাধা",
    label: "Public nuisance",
    icon: "delete",
    statute: "দণ্ডবিধি ২৬৮",
  },
  {
    id: "petty-theft",
    tier: "petty",
    banglaLabel: "পকেটমার / ছোটখাটো চুরি",
    label: "Petty theft",
    icon: "shopping_bag",
    statute: "দণ্ডবিধি ৩৭৯",
  },
  {
    id: "simple-assault",
    tier: "petty",
    banglaLabel: "সাধারণ আঘাত ও গালিগালাজ",
    label: "Simple hurt & abuse",
    icon: "back_hand",
    statute: "দণ্ডবিধি ৩২৩",
  },
  {
    id: "defamation",
    tier: "petty",
    banglaLabel: "মানহানি",
    label: "Defamation",
    icon: "record_voice_over",
    statute: "দণ্ডবিধি ৪৯৯",
  },

  {
    id: "burglary",
    tier: "moderate",
    banglaLabel: "সিঁধেল চুরি ও ডাকাতির চেষ্টা",
    label: "Burglary & attempted dacoity",
    icon: "lock_open",
    statute: "দণ্ডবিধি ৪৫৭",
  },
  {
    id: "fraud",
    tier: "moderate",
    banglaLabel: "প্রতারণা ও অর্থ আত্মসাৎ",
    label: "Fraud & misappropriation",
    icon: "credit_card_off",
    statute: "দণ্ডবিধি ৪২০",
  },
  {
    id: "extortion",
    tier: "moderate",
    banglaLabel: "চাঁদাবাজি ও ব্ল্যাকমেইল",
    label: "Extortion",
    icon: "payments",
    statute: "দণ্ডবিধি ৩৮৫",
  },
  {
    id: "narcotics",
    tier: "moderate",
    banglaLabel: "মাদক রাখা বা বহন",
    label: "Narcotics possession",
    icon: "medication",
    statute: "মাদক নিয়ন্ত্রণ আইন ৩৬(১)",
  },
  {
    id: "grievous-hurt",
    tier: "moderate",
    banglaLabel: "গুরুতর আঘাত",
    label: "Grievous hurt",
    icon: "personal_injury",
    statute: "দণ্ডবিধি ৩২৬",
  },

  {
    id: "murder",
    tier: "heinous",
    banglaLabel: "হত্যা / খুন",
    label: "Murder",
    icon: "gavel",
    statute: "দণ্ডবিধি ৩০২",
  },
  {
    id: "sexual-violence",
    tier: "heinous",
    banglaLabel: "ধর্ষণ ও যৌন নিপীড়ন",
    label: "Rape & sexual violence",
    icon: "shield_person",
    statute: "নারী ও শিশু নির্যাতন দমন আইন",
  },
  {
    id: "armed-robbery",
    tier: "heinous",
    banglaLabel: "সশস্ত্র ডাকাতি",
    label: "Armed dacoity",
    icon: "groups",
    statute: "দণ্ডবিধি ৩৯২/৩৯৭",
  },
  {
    id: "trafficking",
    tier: "heinous",
    banglaLabel: "অপহরণ ও মানব পাচার",
    label: "Abduction & trafficking",
    icon: "no_accounts",
    statute: "মানব পাচার প্রতিরোধ আইন",
  },
  {
    id: "acid-attack",
    tier: "heinous",
    banglaLabel: "এসিড নিক্ষেপ",
    label: "Acid attack",
    icon: "science",
    statute: "এসিড অপরাধ দমন আইন",
  },
];

export interface CrimeLocation {
  /** Where it happened, most specific first. */
  area: string;
  district: string;
  /** Police station with jurisdiction — how a case is actually traced. */
  thana: string;
  /** Free-text coordinates or landmark for the map link. */
  mapQuery: string;
  /** Display coordinates, in Bangla numerals. */
  coordinates?: string;
}

interface BaseRecord {
  id: string;
  category: CrimeCategoryId;
  /** One line: what happened. Never a name, never a slur. */
  headline: string;
  summary: string;
  location: CrimeLocation;
  /** ISO date of the incident. */
  occurredAt: string;
  /** Human-readable time of filing, in Bangla. */
  filedAt: string;
  /** Where this record came from, shown on every card. */
  source: string;
  sourceUrl?: string;
  /** Stock photograph of the place or subject — never of a person. */
  image?: string;
  imageCredit?: string;
  /** Video report, where one exists. */
  videoUrl?: string;
  videoDuration?: string;
  /** Label for the evidence type, e.g. "সিসিটিভি HD". */
  evidenceKind?: string;
  /** What the statute prescribes — shown in the card's legal strip. */
  penalty?: string;
}

/**
 * A conviction. Only this variant may carry an identity, and it cannot be
 * constructed without the court and case number that justify publishing
 * one.
 */
export interface ConvictedRecord extends BaseRecord {
  status: "convicted";
  offenderName: string;
  offenderPhoto?: string;
  court: string;
  caseNo: string;
  sentence: string;
}

/**
 * Anything short of conviction — including someone at large. No name and
 * no photograph, enforced by the type rather than by convention: the
 * `never` declarations below make the unsafe record a compile error.
 */
export interface AccusedRecord extends BaseRecord {
  status: "accused";
  /** e.g. "৩ জন অভিযুক্ত" — a count, never an identity. */
  accusedCount: string;
  /** Where the case currently stands. */
  stage: string;
  /**
   * A non-identifying case reference, so a record is still traceable to
   * the docket without naming anyone: "মামলা নং ..." or an internal id.
   */
  caseRef?: string;
  offenderName?: never;
  offenderPhoto?: never;
}

export type CrimeRecord = ConvictedRecord | AccusedRecord;

/** Placeholder records. See the provenance note at the top of this file. */
export const crimeRecords: CrimeRecord[] = [
  {
    id: "c-001",
    status: "accused",
    category: "public-urination",
    headline: "কারওয়ান বাজার ওভারব্রিজে উন্মুক্ত স্থানে প্রস্রাব ও পথচারী হয়রানি",
    summary:
      "সিটি কর্পোরেশনের ভ্রাম্যমাণ আদালত সকালের অভিযানে তিনজনকে জরিমানা করে। এলাকাটিতে নিকটতম পাবলিক টয়লেট প্রায় ১.২ কিলোমিটার দূরে।",
    location: {
      area: "কারওয়ান বাজার ওভারব্রিজ",
      district: "ঢাকা",
      thana: "তেজগাঁও থানা",
      mapQuery: "Karwan Bazar, Dhaka",
      coordinates: "২৩.৭৫৩৪° N, ৯০.৩৯৩৩° E",
    },
    occurredAt: "2026-09-23",
    filedAt: "আজ সকাল ০৯:৪৫ মিনিটে নথিভুক্ত",
    source: "সিটি কর্পোরেশন ভ্রাম্যমাণ আদালত বুলেটিন",
    accusedCount: "৩ জন",
    stage: "ভ্রাম্যমাণ আদালতে নিষ্পত্তি",
    caseRef: "ভ্রাম্যমাণ আদালত নথি নং —",
    videoDuration: "০২:১৫",
    evidenceKind: "সিসিটিভি HD",
    penalty: "জরিমানা / কারাদণ্ড",
  },
  {
    id: "c-002",
    status: "accused",
    category: "extortion",
    headline: "মিরপুর-১০ এ ব্যবসায়ীর কাছে চাঁদা দাবি ও হুমকি",
    summary:
      "বাজার সমিতির কাছে করা লিখিত অভিযোগে বলা হয়, দোকানপ্রতি সপ্তাহে চাঁদা দাবি করা হচ্ছিল। থানায় সাধারণ ডায়েরি হয়েছে।",
    location: {
      area: "মিরপুর-১০ নম্বর",
      district: "ঢাকা",
      thana: "মিরপুর মডেল থানা",
      mapQuery: "Mirpur 10, Dhaka",
      coordinates: "২৩.৮০৭২° N, ৯০.৩৬৭৬° E",
    },
    occurredAt: "2026-09-23",
    filedAt: "আজ সকাল ১০:১৫ মিনিটে নথিভুক্ত",
    source: "থানা সাধারণ ডায়েরি",
    accusedCount: "৪ জন",
    stage: "তদন্তাধীন — পরোয়ানা জারি",
    caseRef: "সাধারণ ডায়েরি নং —",
    videoDuration: "০৩:৪০",
    evidenceKind: "সিসিটিভি ক্লিপ",
    penalty: "অজামিনযোগ্য পরোয়ানা",
  },
  {
    id: "c-003",
    status: "accused",
    category: "armed-robbery",
    headline: "উত্তরা স্বর্ণের দোকানে সশস্ত্র ডাকাতির চেষ্টা ও সিসিটিভি ফুটেজ",
    summary:
      "ভোরে দোকানের শাটার ভেঙে প্রবেশের চেষ্টার অভিযোগে মামলা হয়েছে। উদ্ধার হওয়া ফুটেজ তদন্তকারী দলের কাছে হস্তান্তর করা হয়েছে।",
    location: {
      area: "উত্তরা সেক্টর ৭",
      district: "ঢাকা",
      thana: "উত্তরা পূর্ব থানা",
      mapQuery: "Uttara Sector 7, Dhaka",
      coordinates: "২৩.৮৬৯৭° N, ৯০.৩৯৯২° E",
    },
    occurredAt: "2026-09-23",
    filedAt: "আজ ভোর ০৫:২০ মিনিটে নথিভুক্ত",
    source: "থানা এজাহার",
    accusedCount: "৩ জন",
    stage: "১ জন গ্রেপ্তার — রিমান্ড আবেদন",
    caseRef: "এজাহার নং —",
    videoDuration: "০৪:২০",
    evidenceKind: "মাল্টি-ক্যামেরা",
    penalty: "রিমান্ড আবেদন",
  },
  {
    id: "c-004",
    status: "accused",
    category: "public-nuisance",
    headline: "যাত্রাবাড়ী মোড়ে অবৈধ বর্জ্য ফেলে রাস্তা অবরোধ ও পরিবেশদূষণ",
    summary:
      "ফুটপাত ও রাস্তার একাংশ দখল করে বর্জ্য ফেলায় চলাচলে বাধা সৃষ্টি হয়। সিটি কর্পোরেশন সংশ্লিষ্ট পরিবহনকে তলব করেছে।",
    location: {
      area: "যাত্রাবাড়ী মোড়",
      district: "ঢাকা",
      thana: "যাত্রাবাড়ী থানা",
      mapQuery: "Jatrabari, Dhaka",
      coordinates: "২৩.৭০৮৯° N, ৯০.৪৩৮২° E",
    },
    occurredAt: "2026-09-23",
    filedAt: "আজ দুপুর ১২:০০ মিনিটে নথিভুক্ত",
    source: "সিটি কর্পোরেশন পরিদর্শন প্রতিবেদন",
    accusedCount: "১ প্রতিষ্ঠান",
    stage: "সিটি কর্পোরেশন তলব",
    caseRef: "পরিদর্শন নথি নং —",
    videoDuration: "০১:১২",
    evidenceKind: "নাগরিক ভিডিও",
    penalty: "সিটি কর্পোরেশন তলব",
  },
  {
    id: "c-005",
    status: "convicted",
    category: "fraud",
    headline: "ভুয়া জমি দলিলে একাধিক ক্রেতার কাছ থেকে অর্থ আত্মসাৎ",
    summary:
      "একই প্লট একাধিক ক্রেতার কাছে বিক্রি দেখিয়ে অর্থ আদায়ের অভিযোগ আদালতে প্রমাণিত হয়। আদালত ক্ষতিপূরণ ফেরতের নির্দেশ দেয়।",
    location: {
      area: "সাভার পৌরসভা",
      district: "ঢাকা",
      thana: "সাভার মডেল থানা",
      mapQuery: "Savar, Dhaka",
      coordinates: "২৩.৮৫৮৩° N, ৯০.২৬৬৭° E",
    },
    occurredAt: "2026-09-18",
    filedAt: "রায় ঘোষণা — ১৮ সেপ্টেম্বর",
    source: "আদালতের রায় — নথিভুক্ত",
    offenderName: "নাম রায়ে উল্লিখিত",
    court: "ঢাকা জেলা ও দায়রা জজ আদালত",
    caseNo: "নমুনা মামলা নং ০০০/২০২৬",
    sentence: "৭ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
    penalty: "৭ বছর সশ্রম কারাদণ্ড",
  },
  {
    id: "c-006",
    status: "accused",
    category: "narcotics",
    headline: "বাস টার্মিনালে তল্লাশিতে মাদকদ্রব্য উদ্ধার",
    summary:
      "নিয়মিত তল্লাশি চৌকিতে যাত্রীবাহী বাস থেকে মাদকদ্রব্য উদ্ধারের কথা জানানো হয়েছে। মামলা প্রক্রিয়াধীন।",
    location: {
      area: "সায়েদাবাদ বাস টার্মিনাল",
      district: "ঢাকা",
      thana: "যাত্রাবাড়ী থানা",
      mapQuery: "Sayedabad Bus Terminal, Dhaka",
      coordinates: "২৩.৭১০৪° N, ৯০.৪৩৪৮° E",
    },
    occurredAt: "2026-09-22",
    filedAt: "গতকাল রাত ০৯:৩০ মিনিটে নথিভুক্ত",
    source: "পুলিশ সংবাদ বিজ্ঞপ্তি",
    accusedCount: "২ জন",
    stage: "মামলা দায়ের — জেল হাজতে প্রেরণ",
    caseRef: "মামলা নং —",
    penalty: "জেল হাজতে প্রেরণ",
  },
  {
    id: "c-007",
    status: "accused",
    category: "petty-theft",
    headline: "নিউমার্কেট এলাকায় পকেটমার হাতেনাতে আটক",
    summary:
      "ভিড়ের মধ্যে মানিব্যাগ নেওয়ার সময় একজনকে আটক করে জনতা, পরে পুলিশে হস্তান্তর করা হয়। গণপিটুনি থেকে উদ্ধার করা হয়েছে।",
    location: {
      area: "নিউমার্কেট",
      district: "ঢাকা",
      thana: "নিউমার্কেট থানা",
      mapQuery: "New Market, Dhaka",
      coordinates: "২৩.৭৩৩৪° N, ৯০.৩৮৪৪° E",
    },
    occurredAt: "2026-09-23",
    filedAt: "আজ বিকাল ০৪:১০ মিনিটে নথিভুক্ত",
    source: "থানা এজাহার",
    accusedCount: "১ জন",
    stage: "পুলিশে হস্তান্তর",
    caseRef: "এজাহার নং —",
    videoDuration: "০০:৫৮",
    evidenceKind: "নাগরিক ভিডিও",
    penalty: "দণ্ডবিধি ৩৭৯",
  },
  {
    id: "c-008",
    status: "accused",
    category: "grievous-hurt",
    headline: "জমি নিয়ে বিরোধে ধারালো অস্ত্রে আঘাত, আহত ১",
    summary:
      "দীর্ঘদিনের সীমানা বিরোধের জেরে হামলার অভিযোগ। আহত ব্যক্তি হাসপাতালে চিকিৎসাধীন, মামলা রুজু হয়েছে।",
    location: {
      area: "নকলা উপজেলা",
      district: "শেরপুর",
      thana: "নকলা থানা",
      mapQuery: "Nakla, Sherpur",
      coordinates: "২৫.০৪৬৭° N, ৯০.১৯৫০° E",
    },
    occurredAt: "2026-09-21",
    filedAt: "২১ সেপ্টেম্বর নথিভুক্ত",
    source: "থানা এজাহার",
    accusedCount: "৩ জন",
    stage: "তদন্তাধীন",
    caseRef: "এজাহার নং —",
    penalty: "দণ্ডবিধি ৩২৬",
  },
];

/**
 * The vertical evidence shelf — short citizen and CCTV clips.
 *
 * Deliberately a separate shape from `CrimeRecord`: a clip is a piece of
 * media about an incident, not a case record, and it carries no accused
 * party at all. Keeping the types apart stops a clip from drifting into
 * standing as a charge against someone.
 */
export interface CrimeClip {
  id: string;
  category: CrimeCategoryId;
  headline: string;
  area: string;
  district: string;
  views: string;
  statuteLabel: string;
}

export const crimeClips: CrimeClip[] = [
  {
    id: "r-01",
    category: "public-urination",
    headline: "উন্মুক্ত স্থানে প্রস্রাব ও ভ্রাম্যমাণ আদালতের জরিমানা",
    area: "ফার্মগেট মোড়",
    district: "ঢাকা",
    views: "১২.৫K ভিউ",
    statuteLabel: "দণ্ডবিধি ২৯০",
  },
  {
    id: "r-02",
    category: "petty-theft",
    headline: "পকেটমার আটক ও গণপিটুনি থেকে উদ্ধার",
    area: "নিউমার্কেট",
    district: "ঢাকা",
    views: "২৮.৩K ভিউ",
    statuteLabel: "দণ্ডবিধি ৩৭৯",
  },
  {
    id: "r-03",
    category: "public-nuisance",
    headline: "শব্দদূষণ ও নিষিদ্ধ হাইড্রোলিক হর্ন ব্যবহার",
    area: "বিজয় সরণি",
    district: "ঢাকা",
    views: "৭.৯K ভিউ",
    statuteLabel: "পরিবেশ আইন",
  },
  {
    id: "r-04",
    category: "armed-robbery",
    headline: "ছিনতাইকারী মোটরসাইকেল গ্যাং চিহ্নিত ও ধাওয়া",
    area: "ধানমন্ডি ২৭",
    district: "ঢাকা",
    views: "৬৪.১K ভিউ",
    statuteLabel: "দণ্ডবিধি ৩৯২",
  },
  {
    id: "r-05",
    category: "public-nuisance",
    headline: "ফুটপাত দখল ও চাঁদাবাজ সিন্ডিকেটের তথ্য",
    area: "চকবাজার",
    district: "পুরান ঢাকা",
    views: "১১.৮K ভিউ",
    statuteLabel: "দণ্ডবিধি ২৮৩",
  },
  {
    id: "r-06",
    category: "fraud",
    headline: "ভুয়া পরিচয়ে চাঁদাবাজির রিয়েল-টাইম ফুটেজ",
    area: "মহাখালী",
    district: "ঢাকা",
    views: "৫৩.৭K ভিউ",
    statuteLabel: "দণ্ডবিধি ১৭০",
  },
];

/**
 * Headline counts for the masthead.
 *
 * TODO(backend): these are placeholders shaped like the real aggregate so
 * the KPI row has something to render. They must come from the same
 * endpoint as the records, or the page will show totals that contradict
 * the list beneath them.
 */
export const crimeStats = {
  filedToday: "১,৭২৮",
  filedDelta: "↑ +১২% গত ২৪ ঘণ্টায়",
  underInvestigation: "৯১২",
  chargedOrArrested: "৪১৩",
  emergencyResponseAvg: "৪.৮ মিনিট",
} as const;
