/**
 * Where each product and service stands, for the catalogue pages
 * (/products, /services and their detail pages).
 *
 * Everything here is Kandari-Lab's own status and plan, never a result:
 * no launch has happened, no app is in a store, no pharmacy is open yet.
 * `complete` is derived from the pipeline (stages finished out of all
 * stages), so it can never claim more than the stage label does.
 *
 * Product copy and sourced national data stay in data/products.ts and
 * data/services.ts; this file only adds the release view on top.
 */

export interface Pipeline {
  stages: string[];
  /** Index of the stage being worked on now; earlier stages are done. */
  current: number;
  /** One line on the current stage, in plain words. */
  note: string;
}

export interface Access {
  /** What the visitor can do today. */
  label: string;
  /** Why it is not a store download yet, or what happens next. */
  note: string;
  href: string;
  icon: string;
}

export interface ProductRelease {
  pipeline: Pipeline;
  access: Access;
  /** What the product reads or produces, shown under "Data". */
  reads: string[];
}

export const productReleases: Record<string, ProductRelease> = {
  aponjon: {
    pipeline: {
      stages: ["Research", "Prototype", "Clinical testing", "Pilot", "Launch"],
      current: 1,
      note: "The band and its on-device model are being built and tested in the lab.",
    },
    access: {
      label: "Join the early list",
      note: "Not for sale yet. Kandari Profile members hear first when pilot devices open.",
      href: "#kandari-profile",
      icon: "watch",
    },
    reads: ["Heart rhythm (ECG)", "Blood oxygen (SpO₂)", "Body temperature", "Muscle signal (EMG)", "Heart-rate variability"],
  },
  swasti: {
    pipeline: {
      stages: ["Research", "Prototype", "Beta", "Pilot", "Launch"],
      current: 2,
      note: "The app is in beta: voice, triage and the health record are being tested.",
    },
    access: {
      label: "Get the beta",
      note: "Not on Google Play yet. Members are invited to the test build as places open.",
      href: "#kandari-profile",
      icon: "install_mobile",
    },
    reads: ["Symptoms, spoken in Bangla", "Readings from Aponjon", "Prescriptions and reports", "Doctor's notes", "Lifelong health record"],
  },
  "smart-pharmacy": {
    pipeline: {
      stages: ["Research", "Design", "Pilot", "Union network", "Scale"],
      current: 2,
      note: "The first pilot, in Kazaikat village, Nakla, Sherpur, is being planned.",
    },
    access: {
      label: "Partner with the pilot",
      note: "Nothing to download: the pharmacy is a place. Shop owners, doctors and NGOs can join the pilot through Kandari Profile.",
      href: "#kandari-profile",
      icon: "handshake",
    },
    reads: ["Blood pressure and glucose", "Stock and expiry dates", "Cold-storage temperature", "Video consultations", "Prescriptions dispensed"],
  },
};

/** The same build path for every service project. */
export const SERVICE_PIPELINE = ["Discover", "Design", "Build", "Test", "Hand over"];

/** What happens in each service stage, for the process row. */
export const SERVICE_PIPELINE_NOTES = [
  "We visit, listen and write down the real problem.",
  "Screens, circuits or flows you can see before we build.",
  "Short cycles, with something working to show every week.",
  "On your floor, with your people, in your conditions.",
  "Code, drawings and training, so it stays yours.",
];

/**
 * Where each service's skill already runs inside Kandari-Lab: exactly the
 * places its `proof` line in data/services.ts names, linked.
 */
export const serviceRunsIn: Record<string, { name: string; href: string }[]> = {
  ai: [{ name: "SWASTI", href: "/products/swasti" }],
  automation: [{ name: "Aponjon", href: "/products/aponjon" }],
  iot: [
    { name: "Aponjon", href: "/products/aponjon" },
    { name: "SWASTI", href: "/products/swasti" },
  ],
  development: [
    { name: "This website", href: "/" },
    { name: "শিক্ষিতদের মিডিয়া", href: "/media" },
    { name: "গবেষণাকোষ", href: "/research" },
  ],
};

/** Share of the pipeline already finished: only whole stages count. */
export const completePercent = (p: Pipeline) => Math.round((p.current / p.stages.length) * 100);

/* ── Source marks ─────────────────────────────────────────────────────── */

export interface SourceMark {
  id: string;
  /** Which `source.publisher` strings this organisation covers. */
  match: RegExp;
  /** The full name, for screen readers and the tooltip. */
  name: string;
  /** What the mark shows. */
  label: string;
  /** Brand colour, used for the wordmark or as the tile behind it. */
  color: string;
  /** A Material Symbol before the wordmark; without one, the label sits on a colour tile. */
  icon?: string;
}

/**
 * The organisations behind the products' figures, drawn as coloured
 * wordmarks. They are not the official logos: those need each body's
 * permission (the WHO emblem in particular) and would read as an
 * endorsement. Colours follow each brand, lifted where the original is
 * too dark to read on black. Only marks whose `match` hits a real cited
 * source are shown, so the row can never name a source we do not use.
 */
export const SOURCE_MARKS: SourceMark[] = [
  { id: "who", match: /\bWHO\b/, name: "World Health Organization", label: "WHO", color: "#009ADE", icon: "public" },
  { id: "world-bank", match: /World Bank/, name: "World Bank", label: "World Bank", color: "#00A3E0", icon: "account_balance" },
  { id: "lancet", match: /Lancet/, name: "The Lancet Global Health", label: "THE LANCET", color: "#C8102E" },
  { id: "aha", match: /AHA/, name: "Stroke, a journal of the American Heart Association", label: "Stroke · AHA", color: "#E4002B", icon: "favorite" },
  { id: "dghs", match: /DGHS/, name: "Directorate General of Health Services, Bangladesh", label: "DGHS", color: "#00A651", icon: "local_hospital" },
  { id: "btrc", match: /BTRC/, name: "Bangladesh Telecommunication Regulatory Commission", label: "BTRC", color: "#F2A900", icon: "cell_tower" },
  { id: "tbs", match: /Business Standard/, name: "The Business Standard", label: "The Business Standard", color: "#ED1C24", icon: "newspaper" },
  { id: "bmc", match: /Pharmaceutical Policy/, name: "Journal of Pharmaceutical Policy and Practice", label: "J Pharm Policy Pract", color: "#0A6EB4" },
];
