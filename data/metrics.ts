export interface ImpactMetric {
  label: string;
  icon: string;
  value: string;
  title: string;
  description: string;
  progress: number;
  tone: "primary" | "signal" | "crimson" | "slate";
}

export const impactMetrics: ImpactMetric[] = [
  {
    label: "POPULATION TARGET",
    icon: "groups",
    value: "10Cr+",
    title: "Health Records Targeted",
    description:
      "Building the unified longitudinal epidemiological dataset of Bangladesh.",
    progress: 32,
    tone: "primary",
  },
  {
    label: "Acute Triage Efficiency",
    icon: "timer",
    value: "78%",
    title: "Golden 2-Hrs Detection",
    description:
      "Early diagnosis of strokes, ischemic attacks, and septic shock before irreversible trauma.",
    progress: 78,
    tone: "signal",
  },
  {
    label: "INFRASTRUCTURE SCALE",
    icon: "local_pharmacy",
    value: "45,000+",
    title: "Smart Pharmacies Roadmapped",
    description:
      "Digital enablement replacing medical penury across every Upazila and Ward.",
    progress: 48,
    tone: "slate",
  },
  {
    label: "Deep-Tech Sovereign Jobs",
    icon: "engineering",
    value: "1,200+",
    title: "High-Skill Engineering Careers",
    description:
      "Stemming brain drain by employing top electrical, mechanical, and AI researchers locally.",
    progress: 65,
    tone: "crimson",
  },
];
