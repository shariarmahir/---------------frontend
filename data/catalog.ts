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

import {
  siAndroid,
  siBluetooth,
  siDocker,
  siEspressif,
  siExpo,
  siFastapi,
  siKicad,
  siLangchain,
  siMqtt,
  siNordicsemiconductor,
  siPostgresql,
  siPython,
  siPytorch,
  siRaspberrypi,
  siTensorflow,
  siTypescript,
  siWebrtc,
  type SimpleIcon,
} from "simple-icons";

/** One technology behind a product or project, shown as a sticker (components/catalog/tech-row.tsx). */
export interface TechItem {
  /** The brand logo (simple-icons): its path, colour and name. */
  logo: SimpleIcon;
  /** What it does here, in a few words. */
  role: string;
  /** `built`: the live product is built with it; `demo`: a working demo is; `proposed`: part of the plan. */
  layer: "built" | "demo" | "proposed";
}

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
  pipeline: Pipeline & {
    /** One line per stage, under the timeline. */
    notes: string[];
  };
  access: Access;
  /** What the product reads or produces, shown under "Data". */
  reads: string[];
  /** The stack it is being built on: all planned, since nothing has launched. */
  tech: TechItem[];
  /** The 3D film on its page: the line above it, and what it shows, for screen readers. */
  film: { lead: string; label: string };
}

export const productReleases: Record<string, ProductRelease> = {
  aponjon: {
    pipeline: {
      stages: ["Research", "Prototype", "Clinical testing", "Pilot", "Launch"],
      current: 1,
      note: "The band and its on-device model are being built and tested in the lab.",
      notes: [
        "The signals that change first, and the risks they predict, from published research.",
        "The band and its on-device model, built and tested in the lab.",
        "Readings compared against clinical reference devices with partner doctors.",
        "Elderly and high-risk households around the first Smart Pharmacies.",
        "Subsidised bands through pharmacies, NGOs and employers.",
      ],
    },
    access: {
      label: "Join the early list",
      note: "Not for sale yet. Kandari Profile members hear first when pilot devices open.",
      href: "#kandari-profile",
      icon: "watch",
    },
    reads: ["Heart rhythm (ECG)", "Blood oxygen (SpO₂)", "Body temperature", "Muscle signal (EMG)", "Heart-rate variability"],
    tech: [
      { logo: siNordicsemiconductor, role: "Band chip", layer: "proposed" },
      { logo: siKicad, role: "Circuit design", layer: "proposed" },
      { logo: siTensorflow, role: "On-device AI", layer: "proposed" },
      { logo: siPython, role: "Signal research", layer: "proposed" },
      { logo: siBluetooth, role: "Phone link", layer: "proposed" },
      { logo: siAndroid, role: "Family app", layer: "proposed" },
      { logo: siFastapi, role: "Alert service", layer: "proposed" },
      { logo: siPostgresql, role: "Readings history", layer: "proposed" },
    ],
    film: {
      lead: "An elder wears the band at home. It reads every heartbeat, catches an irregular rhythm, and alerts his son and the village health worker, so the journey to care starts in time.",
      label: "A film of Aponjon: an elder on a bench wears the band, his heartbeat turns irregular, the band's chip flags it, his son's phone and the health worker are alerted, and the clinic lights up.",
    },
  },
  swasti: {
    pipeline: {
      stages: ["Research", "Prototype", "Beta", "Pilot", "Launch"],
      current: 2,
      note: "The app is in beta: voice, triage and the health record are being tested.",
      notes: [
        "How rural families look for care, and what a first step must answer.",
        "The voice assistant, the risk check and the record, first builds.",
        "A closed group of testers tries voice, triage and the record.",
        "Partner doctors take calls, linked to Aponjon readings and pharmacies.",
        "A free public release with regional dialects and an offline mode.",
      ],
    },
    access: {
      label: "Get the beta",
      note: "Not on Google Play yet. Members are invited to the test build as places open.",
      href: "#kandari-profile",
      icon: "install_mobile",
    },
    reads: ["Symptoms, spoken in Bangla", "Readings from Aponjon", "Prescriptions and reports", "Doctor's notes", "Lifelong health record"],
    tech: [
      { logo: siExpo, role: "Phone app", layer: "proposed" },
      { logo: siTypescript, role: "App code", layer: "proposed" },
      { logo: siPython, role: "Health engine", layer: "proposed" },
      { logo: siLangchain, role: "Guidance (RAG)", layer: "proposed" },
      { logo: siPytorch, role: "Diagnostic model", layer: "proposed" },
      { logo: siWebrtc, role: "Doctor calls", layer: "proposed" },
      { logo: siFastapi, role: "App service", layer: "proposed" },
      { logo: siPostgresql, role: "Health record", layer: "proposed" },
    ],
    film: {
      lead: "A mother asks about her child's fever by voice. SWASTI checks the guidance, scores how urgent it is, connects a doctor, and keeps the prescription in one record that comes back to her phone.",
      label: "A film of SWASTI: a mother speaks into her phone about her child's fever, the guidance gathers round SWASTI's core, the risk check settles on go today, a doctor takes the call, and the prescription joins her health record.",
    },
  },
  "smart-pharmacy": {
    pipeline: {
      stages: ["Research", "Design", "Pilot", "Union network", "Scale"],
      current: 2,
      note: "The first pilot, in Kazaikat village, Nakla, Sherpur, is being planned.",
      notes: [
        "Who visits the village drug shop, and what they are sold.",
        "The kiosk, solar cold storage and the video-doctor counter, on paper.",
        "The first shops, starting with Kazaikat village, Nakla, Sherpur.",
        "A union-wide network with a shared doctor panel and supply chain.",
        "A franchise model, toward a centre within reach of every village.",
      ],
    },
    access: {
      label: "Partner with the pilot",
      note: "Nothing to download: the pharmacy is a place. Shop owners, doctors and NGOs can join the pilot through Kandari Profile.",
      href: "#kandari-profile",
      icon: "handshake",
    },
    reads: ["Blood pressure and glucose", "Stock and expiry dates", "Cold-storage temperature", "Video consultations", "Prescriptions dispensed"],
    tech: [
      { logo: siRaspberrypi, role: "Vitals kiosk", layer: "proposed" },
      { logo: siEspressif, role: "Fridge sensor", layer: "proposed" },
      { logo: siMqtt, role: "Device signals", layer: "proposed" },
      { logo: siAndroid, role: "Counter tablet", layer: "proposed" },
      { logo: siWebrtc, role: "Video doctor", layer: "proposed" },
      { logo: siFastapi, role: "Pharmacy service", layer: "proposed" },
      { logo: siPostgresql, role: "Stock and records", layer: "proposed" },
      { logo: siDocker, role: "Deployment", layer: "proposed" },
    ],
    film: {
      lead: "A villager walks into the shop he already uses. The sun powers the counter, the health worker measures his blood pressure, a doctor joins by video, and verified medicine goes home with him.",
      label: "A film of Smart Pharmacy: the sun charges solar panels on the shop roof, a villager walks in, the kiosk reads his blood pressure high, a doctor joins on the wall screen, medicine is handed over, and the shop stays linked to others in the union.",
    },
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
