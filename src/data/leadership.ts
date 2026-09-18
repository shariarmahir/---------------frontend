export interface Executive {
  initials: string;
  name: string;
  role: string;
  discipline: string;
  quote: string;
  tags: string[];
  tone: "primary" | "emerald" | "signal";
}

export const executives: Executive[] = [
  {
    initials: "MM",
    name: "Mahir Shariar Mahin",
    role: "CHIEF EXECUTIVE OFFICER & FOUNDER",
    discipline: "Deep-Tech Architect & Systems Engineer",
    quote:
      "We are not here to assemble cheap consumer gadgets. Kandari exists to give Bangladesh sovereign mathematical and physical autonomy.",
    tags: ["Systems Architecture", "Semiconductors"],
    tone: "primary",
  },
  {
    initials: "SA",
    name: "Sadman bin Arif",
    role: "CHIEF OPERATING OFFICER",
    discipline: "Supply Chain & Rural Grid Scaling",
    quote:
      "Operationalizing 45,000 smart pharmacies means mastering reverse-logistics down to the most remote riverine Char regions.",
    tags: ["Rural Grid Operations", "Logistics"],
    tone: "emerald",
  },
  {
    initials: "NS",
    name: "Nabeel Shadad",
    role: "CHIEF MARKETING OFFICER",
    discipline: "Ecosystem Growth & Institutional Trust",
    quote:
      "Translating ultra-complex AI models into an intuitive interface that an elderly villager in Kurigram can command instinctively.",
    tags: ["National Adoption", "Brand Strategy"],
    tone: "signal",
  },
];

export interface ResearchLead {
  name: string;
  role: string;
  focus: string;
}

export const researchLeads: ResearchLead[] = [
  {
    name: "Istiake",
    role: "Head of Mechatronics",
    focus: "Robotic Sorting & Biomass",
  },
  {
    name: "Safia",
    role: "Lead Biosensing AI",
    focus: "ECG/EMG Telemetry Models",
  },
  {
    name: "Luban",
    role: "VLSI & Silicon Architect",
    focus: "RISC-V Microarchitecture",
  },
  {
    name: "Shabbin",
    role: "Radar & Optics Lead",
    focus: "FMCW Blind Assist AI",
  },
  {
    name: "Janassor",
    role: "Head of Clinical NLP",
    focus: "Dialect RAG Super-Core",
  },
];
