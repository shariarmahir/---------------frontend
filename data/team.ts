/**
 * Team roster for /team and /team/[slug].
 *
 * Interim, hardcoded source. CLAUDE.md §2 says the roster should come from
 * a CMS table, and §7 leaves the CMS choice open [FLAG], so this file is the
 * stand-in until that exists — the page reads only the `TeamMember` shape,
 * so swapping the source later does not touch the components.
 *
 * Content rule: names and roles are exactly the CLAUDE.md roster. Each
 * "about" and skill list describes the work of the person's department (as
 * already stated on the home page's leadership section), not a personal
 * CV — nothing here claims a degree, employer or achievement we have not
 * been given. Photos are not supplied yet, so every member renders a
 * labelled placeholder.
 */

export type DeptId = "leadership" | "creative" | "client" | "iot" | "dev";
export type OrbitRing = "inner" | "mid" | "outer";

export interface Skill {
  label: string;
  /** Material Symbols name. */
  icon: string;
}

export interface TeamMember {
  slug: string;
  name: string;
  initials: string;
  role: string;
  roleBn: string;
  /** First department is the primary one (card colour, filter group). */
  depts: DeptId[];
  /** Which ring the member orbits on in the hero; the founder is the sun. */
  ring: OrbitRing | "core";
  about: string;
  /** What the department owns, in the member's profile page. */
  focus: string[];
  skills: Skill[];
  /** Products and programmes the member's department works on. */
  works: string[];
}

export interface Dept {
  id: DeptId;
  label: string;
  labelBn: string;
  /** Hex, for inline glows the design tokens cannot express. */
  color: string;
  /** Tailwind classes for text / soft background / border. */
  text: string;
  soft: string;
  border: string;
  icon: string;
}

export const departments: Record<DeptId, Dept> = {
  leadership: {
    id: "leadership",
    label: "Leadership",
    labelBn: "নেতৃত্ব",
    color: "#ff9100",
    text: "text-bdorange-600",
    soft: "bg-orange-50",
    border: "border-orange-200",
    icon: "workspace_premium",
  },
  creative: {
    id: "creative",
    label: "Idea & Creative",
    labelBn: "আইডিয়া ও ক্রিয়েটিভ",
    color: "#e11d74",
    text: "text-pink-700",
    soft: "bg-pink-50",
    border: "border-pink-200",
    icon: "lightbulb",
  },
  client: {
    id: "client",
    label: "Client Relations",
    labelBn: "ক্লায়েন্ট",
    color: "#7c3aed",
    text: "text-violet-700",
    soft: "bg-violet-50",
    border: "border-violet-200",
    icon: "handshake",
  },
  iot: {
    id: "iot",
    label: "IoT & Hardware",
    labelBn: "আইওটি ও হার্ডওয়্যার",
    color: "#006747",
    text: "text-bd-green",
    soft: "bg-bd-green-light",
    border: "border-emerald-200",
    icon: "sensors",
  },
  dev: {
    id: "dev",
    label: "AI & Software",
    labelBn: "এআই ও সফটওয়্যার",
    color: "#0d9488",
    text: "text-teal-700",
    soft: "bg-teal-50",
    border: "border-teal-200",
    icon: "neurology",
  },
};

export const team: TeamMember[] = [
  {
    slug: "mahir-shariar-mahin",
    name: "Mahir Shariar Mahin",
    initials: "MS",
    role: "Founder & CEO",
    roleBn: "প্রতিষ্ঠাতা ও প্রধান নির্বাহী",
    depts: ["leadership"],
    ring: "core",
    about:
      "Founded Kandari-Lab to fix Bangladesh one “pixel” at a time, starting with healthcare. Sets the deep-tech roadmap, leads hardware prototyping and clinical integration for SWASTI and আপনজন, and drives the “One Village, One Medical Health Care Center” mission — which begins at home, in Kazaikat village, Nakla, Sherpur.",
    focus: [
      "Company vision and the sector-by-sector roadmap",
      "Hardware prototyping and clinical integration",
      "The Golden Two Hours mission for rural Bangladesh",
    ],
    skills: [
      { label: "Deep-tech strategy", icon: "insights" },
      { label: "Hardware prototyping", icon: "developer_board" },
      { label: "Clinical integration", icon: "clinical_notes" },
      { label: "Product vision", icon: "visibility" },
      { label: "Team leadership", icon: "groups" },
    ],
    works: ["SWASTI", "আপনজন (Aponjon)", "Smart Pharmacy", "One Village, One Health Center"],
  },
  {
    slug: "sadman-bin-arif",
    name: "Sadman bin Arif",
    initials: "SA",
    role: "Chief Operating Officer",
    roleBn: "প্রধান পরিচালন কর্মকর্তা",
    depts: ["leadership"],
    ring: "inner",
    about:
      "Runs how Kandari-Lab works day to day — turning the roadmap into operations: scaling the smart-pharmacy network district by district, keeping telemetry compliant, and running supply chain and logistics.",
    focus: [
      "Smart-pharmacy rollout across districts",
      "Regulatory and telemetry compliance",
      "Supply chain and field logistics",
    ],
    skills: [
      { label: "Operations", icon: "settings_suggest" },
      { label: "Supply chain", icon: "local_shipping" },
      { label: "Compliance", icon: "verified_user" },
      { label: "Field rollout", icon: "map" },
    ],
    works: ["Smart Pharmacy", "One Village, One Health Center"],
  },
  {
    slug: "nabeel-shadad",
    name: "Nabeel Shadad",
    initials: "NS",
    role: "Chief Marketing Officer",
    roleBn: "প্রধান বিপণন কর্মকর্তা",
    depts: ["leadership"],
    ring: "inner",
    about:
      "Carries the story outward — hardware partnerships, adoption by medical institutions, and the public narrative that tells Bangladesh what Kandari-Lab is building and why.",
    focus: [
      "Partnerships and ecosystem",
      "Adoption by clinics and institutions",
      "Brand and public narrative",
    ],
    skills: [
      { label: "Brand & narrative", icon: "campaign" },
      { label: "Partnerships", icon: "handshake" },
      { label: "Market research", icon: "query_stats" },
      { label: "Growth", icon: "trending_up" },
    ],
    works: ["SWASTI", "আপনজন (Aponjon)", "Kandari Profile"],
  },
  {
    slug: "istiake-ahmed",
    name: "Istiake Ahmed",
    initials: "IA",
    role: "Idea & Creative",
    roleBn: "আইডিয়া ও ক্রিয়েটিভ",
    depts: ["creative"],
    ring: "mid",
    about:
      "Shapes ideas before they become products — user empathy, concept design and the product semantics that make a medical device feel understandable to the people who wear it.",
    focus: [
      "Concept and product design",
      "User empathy and research",
      "Product semantics and experience",
    ],
    skills: [
      { label: "Concept design", icon: "draw" },
      { label: "User research", icon: "psychology" },
      { label: "Product semantics", icon: "category" },
      { label: "Storytelling", icon: "auto_stories" },
    ],
    works: ["আপনজন (Aponjon)", "SWASTI"],
  },
  {
    slug: "safia-mubassara-ruzba",
    name: "Safia Mubassara Ruzba",
    initials: "SR",
    role: "Idea & Creative · IoT",
    roleBn: "আইডিয়া ও ক্রিয়েটিভ · আইওটি",
    depts: ["creative", "iot"],
    ring: "mid",
    about:
      "Works on both sides of a device — the creative team's ergonomic, human-first design and the IoT team's sensors and embedded systems — so what is comfortable to wear is also what the hardware can deliver.",
    focus: [
      "Ergonomic medical casing",
      "Sensor and embedded prototyping",
      "Bridging design and hardware",
    ],
    skills: [
      { label: "Ergonomic design", icon: "back_hand" },
      { label: "Sensors", icon: "sensors" },
      { label: "Prototyping", icon: "build" },
      { label: "User empathy", icon: "favorite" },
    ],
    works: ["আপনজন (Aponjon)"],
  },
  {
    slug: "jamil-hossan",
    name: "Jamil Hossan",
    initials: "JH",
    role: "Client Lead",
    roleBn: "ক্লায়েন্ট লিড",
    depts: ["client"],
    ring: "mid",
    about:
      "The bridge between Kandari-Lab and the clinics, pharmacies and partners it serves — bringing their needs into the lab and making sure what ships fits how they actually work.",
    focus: [
      "Client and partner relationships",
      "Requirements from the field",
      "Onboarding and feedback loops",
    ],
    skills: [
      { label: "Client relations", icon: "support_agent" },
      { label: "Requirements", icon: "checklist" },
      { label: "Onboarding", icon: "how_to_reg" },
      { label: "Feedback loops", icon: "forum" },
    ],
    works: ["Smart Pharmacy", "SWASTI"],
  },
  {
    slug: "janassor-ahmed",
    name: "Janassor Ahmed",
    initials: "JA",
    role: "IoT Engineer",
    roleBn: "আইওটি প্রকৌশলী",
    depts: ["iot"],
    ring: "outer",
    about:
      "Builds the hardware that senses — embedded systems, micro-soldering and low-power telemetry, with the antenna and RF work that gets readings out of a village and into the network.",
    focus: [
      "Embedded systems",
      "Low-power telemetry",
      "Antenna and RF",
    ],
    skills: [
      { label: "Embedded systems", icon: "memory" },
      { label: "Micro-soldering", icon: "precision_manufacturing" },
      { label: "Low-power telemetry", icon: "cell_tower" },
      { label: "Antenna & RF", icon: "settings_input_antenna" },
    ],
    works: ["আপনজন (Aponjon)", "Smart Pharmacy"],
  },
  {
    slug: "sharul-bhuiya",
    name: "Sharul Bhuiya",
    initials: "SB",
    role: "IoT Engineer",
    roleBn: "আইওটি প্রকৌশলী",
    depts: ["iot"],
    ring: "outer",
    about:
      "Works on sensing circuits and embedded hardware — from circuit boards to LiDAR sensing — the layer that turns the physical world into data the AI can read.",
    focus: [
      "Circuits and PCBs",
      "LiDAR and distance sensing",
      "Sensor integration",
    ],
    skills: [
      { label: "Circuits & PCB", icon: "developer_board" },
      { label: "LiDAR sensing", icon: "radar" },
      { label: "Sensor fusion", icon: "sensors" },
      { label: "Firmware", icon: "terminal" },
    ],
    works: ["আপনজন (Aponjon)", "Blind-assistance wearable (in research)"],
  },
  {
    slug: "luban-ahmed",
    name: "Luban Ahmed",
    initials: "LA",
    role: "Developer — Web, AI & IoT",
    roleBn: "ডেভেলপার — ওয়েব, এআই ও আইওটি",
    depts: ["dev"],
    ring: "outer",
    about:
      "Builds the software side — web and full-stack systems, Bengali retrieval (RAG) models and the real-time connections that carry device data to doctors.",
    focus: [
      "Full-stack web",
      "Bengali RAG and AI models",
      "Real-time data (WebSockets)",
    ],
    skills: [
      { label: "Bengali RAG", icon: "translate" },
      { label: "Full-stack web", icon: "web" },
      { label: "Real-time sockets", icon: "sync_alt" },
      { label: "CNN models", icon: "neurology" },
    ],
    works: ["SWASTI", "Kandari-Lab web"],
  },
  {
    slug: "shabbin-ahmed",
    name: "Shabbin Ahmed",
    initials: "SH",
    role: "Developer — App, AI & IoT",
    roleBn: "ডেভেলপার — অ্যাপ, এআই ও আইওটি",
    depts: ["dev"],
    ring: "outer",
    about:
      "Builds the apps people hold — the SWASTI mobile core in Flutter, the APIs behind it and the device links that bring a wearable's readings to the phone.",
    focus: [
      "SWASTI mobile app (Flutter)",
      "APIs and backend services",
      "Device-to-app integration",
    ],
    skills: [
      { label: "Flutter mobile", icon: "phone_iphone" },
      { label: "APIs", icon: "api" },
      { label: "Device integration", icon: "bluetooth_connected" },
      { label: "Cloud", icon: "cloud" },
    ],
    works: ["SWASTI", "আপনজন (Aponjon)"],
  },
];

export const founder = team.find((m) => m.ring === "core")!;
export const crew = team.filter((m) => m.ring !== "core");

export function getMember(slug: string): TeamMember | undefined {
  return team.find((m) => m.slug === slug);
}

/** The order the department filter and the directory groups use. */
export const deptOrder: DeptId[] = ["leadership", "creative", "client", "iot", "dev"];

/** The rotating R&D cohort (CLAUDE.md §2). */
export const fellowship = {
  cycle: "2.5 months",
  cycleBn: "আড়াই মাস",
  note: "Rotating R&D interns work on the lab's early-stage research; high performers are converted to paid roles.",
};
